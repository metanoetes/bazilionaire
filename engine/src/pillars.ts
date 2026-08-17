/**
 * Pillar computation — exact astronomy boundaries (sprint 2).
 *
 * Year pillar: 立春 (315°) boundary in local time.
 * Month pillar: 节 boundaries (12 solar terms) in local time, 五虎遁.
 * Day pillar: JDN (no astronomy needed).
 * Hour pillar: clock school by default; solar school (真太阳时) when a
 *   location is provided — EoT + longitude correction.
 * 藏干, 纳音, zodiac: static tables.
 *
 * TODO (sprint 3): 十神, 神煞, 空亡, 起运/大运.
 */
import { BRANCHES, STEMS, ZODIAC, ganzhiOf, ganzhiIndexOf, yearGanzhiIndex } from './sexagenary.js';
import { dayPillarIndex } from './julian.js';
import { HIDDEN_STEMS, HOUR_STEM_START, MONTH_STEM_START, NAYIN } from './tables.js';
import {
  SOLAR_TERM_DEG,
  julianTT,
  julianUT,
  solarOffsetMinutes,
  solarTermLocal,
  type Location,
} from './astronomy.js';

/** The 12 节 (branch-changing terms), in month order from 寅. */
const JIE_TERMS: Array<[number, string]> = [
  [315.0, '寅'], // 立春
  [345.0, '卯'], // 惊蛰
  [15.0, '辰'],  // 清明
  [45.0, '巳'],  // 立夏
  [75.0, '午'],  // 芒种
  [105.0, '未'], // 小暑
  [135.0, '申'], // 立秋
  [165.0, '酉'], // 白露
  [195.0, '戌'], // 寒露
  [225.0, '亥'], // 立冬
  [255.0, '子'], // 大雪
  [285.0, '丑'], // 小寒
];

const BOUNDARY_EPS_DAYS = 60 / 86400; // ±1 minute around a boundary

export interface Chart {
  year: string;
  month: string;
  day: string;
  time: string;
  nayin: [string, string, string, string];
  hideGan: [string[], string[], string[], string[]];
  zodiac: string;
  hourSchool: 'clock' | 'solar';
  warnings: string[];
}

export function computeChart(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  location?: Location,
): Chart {
  const warnings: string[] = [];
  const tz = location?.tzHours ?? 8; // lunar_python convention: 节 boundaries in Beijing time
  // Pseudo-UTC local scale: wall clock treated as UTC, shifted by tz — used only
  // for ORDERING against term times expressed in the same scale.
  const birthLocalJD = julianUT(year, month, day, hour, minute);
  const birthTT = julianTT(julianUT(year, month, day, hour, minute) - tz / 24);

  // ---- Year pillar: 立春 boundary in local time ----
  const lichunLocal = solarTermLocal(year, 315.0, tz);
  let baziYearVal: number;
  if (birthLocalJD < lichunLocal - BOUNDARY_EPS_DAYS) baziYearVal = year - 1;
  else if (birthLocalJD >= lichunLocal + BOUNDARY_EPS_DAYS) baziYearVal = year;
  else {
    baziYearVal = year - 1;
    warnings.push('year: birth within ±1 min of 立春 — pillars may split across schools');
  }
  const yearIdx = yearGanzhiIndex(baziYearVal);
  const yearGanzhi = ganzhiOf(yearIdx);

  // ---- Month pillar: latest 节 ≤ birth, in local time ----
  const jieTimes: Array<[number, string]> = [
    [solarTermLocal(year, 285.0, tz), '丑'], // 小寒 this year (for Jan births)
    ...JIE_TERMS.filter(([deg]) => deg !== 285.0).map(([deg, b]) => [solarTermLocal(year, deg, tz), b] as [number, string]),
    [solarTermLocal(year + 1, 285.0, tz), '丑'], // 小寒 next year (for late-Dec births)
  ];
  let monthBranchStr = '子';
  let monthBoundaryJD = -Infinity;
  for (const [jd, b] of jieTimes) {
    if (jd <= birthLocalJD && jd > monthBoundaryJD) {
      monthBoundaryJD = jd;
      monthBranchStr = b;
    }
  }
  if (birthLocalJD - monthBoundaryJD < BOUNDARY_EPS_DAYS) {
    warnings.push('month: birth within ±1 min of a 节 — month pillar may split across schools');
  }
  const monthBranchIdx = BRANCHES.indexOf(monthBranchStr as (typeof BRANCHES)[number]);
  const monthStemIdx =
    (MONTH_STEM_START[yearGanzhi.stem] + (((monthBranchIdx - 2) % 12) + 12) % 12) % 10;
  const monthGanzhiName = STEMS[monthStemIdx] + BRANCHES[monthBranchIdx];

  // ---- Day pillar ----
  const dayIdx = dayPillarIndex(year, month, day);
  const dayGanzhi = ganzhiOf(dayIdx);

  // ---- Hour pillar ----
  let hourSchool: 'clock' | 'solar' = 'clock';
  let solarHour = hour + minute / 60;
  if (location) {
    hourSchool = 'solar';
    solarHour += solarOffsetMinutes(birthTT, location) / 60;
  }
  const hourBranchIdx = Math.floor((((solarHour + 1) % 24) + 24) % 24 / 2);
  const hourBranchStr = BRANCHES[hourBranchIdx];
  const hourStemIdx = (HOUR_STEM_START[dayGanzhi.stem] + hourBranchIdx) % 10;
  const hourGanzhiName = STEMS[hourStemIdx] + BRANCHES[hourBranchIdx];

  // ---- Hidden stems ----
  const hideGan: [string[], string[], string[], string[]] = [
    [...HIDDEN_STEMS[yearGanzhi.branch]],
    [...HIDDEN_STEMS[monthBranchStr]],
    [...HIDDEN_STEMS[dayGanzhi.branch]],
    [...HIDDEN_STEMS[hourBranchStr]],
  ];

  // ---- Nayin ----
  const monthGanzhiIdx = ganzhiIndexOf(monthStemIdx, monthBranchIdx);
  const hourGanzhiIdx = ganzhiIndexOf(hourStemIdx, hourBranchIdx);

  return {
    year: yearGanzhi.name,
    month: monthGanzhiName,
    day: dayGanzhi.name,
    time: hourGanzhiName,
    nayin: [NAYIN[yearIdx], NAYIN[monthGanzhiIdx], NAYIN[dayIdx], NAYIN[hourGanzhiIdx]],
    hideGan,
    zodiac: ZODIAC[BRANCHES.indexOf(yearGanzhi.branch as (typeof BRANCHES)[number])],
    hourSchool,
    warnings,
  };
}
