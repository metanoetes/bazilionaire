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
import { dayPillarIndex, jdn, jdnToDate } from './julian.js';
import { HIDDEN_STEMS, HOUR_STEM_START, MONTH_STEM_START, NAYIN } from './tables.js';
import {
  julianTT,
  julianUT,
  solarOffsetMinutes,
  solarTermLocal,
  type Location,
} from './astronomy.js';
import { shishenOf } from './tenGods.js';

/** The 12 节 (branch-changing terms), in solar-year order starting 小寒. */
const JIE_ALL: Array<[number, string]> = [
  [285.0, '丑'], // 小寒
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
];

/** All 节s spanning year−1 大雪 … year 大雪 … year+1 小寒, in local pseudo-JD order. */
function jieWindow(year: number, tz: number): Array<[number, string]> {
  const rows: Array<[number, string]> = [
    [solarTermLocal(year - 1, 255.0, tz), '子'], // 大雪 of the previous year
    ...JIE_ALL.map(([deg, b]) => [solarTermLocal(year, deg, tz), b] as [number, string]),
    [solarTermLocal(year + 1, 285.0, tz), '丑'], // 小寒 of the next year
  ];
  // Every row is live for some birth in `year`:
  //  - year−1 大雪: January births' month pillar (子 month) and backward 起运;
  //  - year+1 小寒: late-December births' FORWARD 起运 target (next 节 after 大雪).
  return rows.sort((a, b) => a[0] - b[0]);
}

const BOUNDARY_EPS_DAYS = 60 / 86400; // ±1 minute around a boundary

/** 时辰 index of a local pseudo-JD instant, pinned to lunar_python sect-1. */
function zhiIndexAt(jd: number): number {
  const hour = Math.floor(((jd + 0.5) - Math.floor(jd + 0.5)) * 24);
  if (hour === 23) return 11; // 晚子时: 23:xx counts as the day's last 时辰 (亥) for 起运
  return Math.floor((((hour + 1) % 24) + 24) % 24 / 2);
}

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
  /** 十神 of each pillar stem vs the day master (day pillar itself = 日主). */
  shishenGan: [string, string, string, string];
  /** 十神 of each pillar's hidden stems vs the day master. */
  shishenZhi: [string[], string[], string[], string[]];
  /** 空亡 of the day pillar: the 旬 name and its two void branches. */
  dayXun: string;
  dayXunKong: string;
  /** 大运 (decade luck), present when gender is provided. */
  yun?: {
    gender: 1 | 0;
    /** 起运 remainders — lunar_python sect-1: 3 days = 1 year, 1 day = 4 months, 1 时辰 = 10 days. */
    qiyun: { years: number; months: number; days: number };
    /** Gregorian year the first 大运 decade begins (birth date + qiyun remainders). */
    startSolarYear: number;
    dayun: Array<{ ganzhi: string; startAge: number; startYear: number }>;
  };
}

export function computeChart(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  location?: Location,
  gender?: 1 | 0,
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
  const jieTimes = jieWindow(year, tz);
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

  // ---- 十神 ----
  const dayStemIdx = STEMS.indexOf(dayGanzhi.stem as (typeof STEMS)[number]);
  const yearStemIdx = STEMS.indexOf(yearGanzhi.stem as (typeof STEMS)[number]);
  const hourStemIdxVal = hourStemIdx;
  const shishenGan: [string, string, string, string] = [
    shishenOf(dayStemIdx, yearStemIdx),
    shishenOf(dayStemIdx, monthStemIdx),
    '日主',
    shishenOf(dayStemIdx, hourStemIdxVal),
  ];
  const shishenZhi: [string[], string[], string[], string[]] = [
    hideGan[0].map((g) => shishenOf(dayStemIdx, STEMS.indexOf(g as (typeof STEMS)[number]))),
    hideGan[1].map((g) => shishenOf(dayStemIdx, STEMS.indexOf(g as (typeof STEMS)[number]))),
    hideGan[2].map((g) => shishenOf(dayStemIdx, STEMS.indexOf(g as (typeof STEMS)[number]))),
    hideGan[3].map((g) => shishenOf(dayStemIdx, STEMS.indexOf(g as (typeof STEMS)[number]))),
  ];

  // ---- 空亡 (day pillar's 旬) ----
  const xunStartIdx = Math.floor(dayIdx / 10) * 10;
  const dayXun = ganzhiOf(xunStartIdx).name;
  const dayXunKong = BRANCHES[(xunStartIdx + 10) % 12] + BRANCHES[(xunStartIdx + 11) % 12];

  // ---- 大运 ----
  // 起运 pinned to lunar_python sect-1: time to the governing 节 measured in
  // whole days + 时辰 (2-hour branches): 3 days = 1 year, 1 day = 4 months,
  // 1 时辰 = 10 days. (NOT days/3 rounding — that diverges for births near 节.)
  let yun: Chart['yun'];
  if (gender !== undefined) {
    const yearStemYang = yearStemIdx % 2 === 0; // 甲丙戊庚壬 = yang
    const forward = yearStemYang === (gender === 1);
    const jieCandidates = jieWindow(year, tz);
    let targetJD: number | undefined;
    if (forward) {
      targetJD = jieCandidates.find(([jd]) => jd > birthLocalJD)?.[0];
    } else {
      const prev = jieCandidates.filter(([jd]) => jd < birthLocalJD);
      targetJD = prev.length ? prev[prev.length - 1][0] : undefined;
    }
    if (targetJD === undefined) targetJD = birthLocalJD; // degenerate: treat as same instant
    const startJD = forward ? birthLocalJD : targetJD;
    const endJD = forward ? targetJD : birthLocalJD;
    let hourDiff = zhiIndexAt(endJD) - zhiIndexAt(startJD);
    let dayDiff = Math.floor(endJD + 0.5) - Math.floor(startJD + 0.5);
    if (hourDiff < 0) {
      hourDiff += 12;
      dayDiff -= 1;
    }
    const monthDiff = Math.floor((hourDiff * 10) / 30);
    const monthTotal = dayDiff * 4 + monthDiff;
    const dayRem = hourDiff * 10 - monthDiff * 30;
    const yearsOff = Math.floor(monthTotal / 12);
    const monthsRem = monthTotal - yearsOff * 12;
    // Calendar-add the remainders to the birth date; keep only the resulting year.
    let y2 = year + yearsOff;
    let m2 = month + monthsRem;
    if (m2 > 12) {
      y2 += 1;
      m2 -= 12;
    }
    const dim = jdn(y2, m2 + 1, 1) - jdn(y2, m2, 1); // FVF handles month 13 = next January
    const d2 = Math.min(day, dim);
    const startSolarYear = jdnToDate(jdn(y2, m2, d2) + dayRem).year;
    const dir = forward ? 1 : -1;
    const dayun: Array<{ ganzhi: string; startAge: number; startYear: number }> = [
      { ganzhi: '', startAge: 1, startYear: year },
    ];
    for (let k = 1; k <= 9; k++) {
      const g = ganzhiOf(monthGanzhiIdx + k * dir);
      const startYearVal = startSolarYear + 10 * (k - 1);
      dayun.push({ ganzhi: g.name, startAge: startYearVal - year + 1, startYear: startYearVal });
    }
    yun = { gender, qiyun: { years: yearsOff, months: monthsRem, days: dayRem }, startSolarYear, dayun };
  }

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
    shishenGan,
    shishenZhi,
    dayXun,
    dayXunKong,
    yun,
  };
}
