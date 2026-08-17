/**
 * Pillar computation — sprint 1 slice.
 *
 * Implemented: day pillar (JDN), year pillar (立春 approx), month pillar
 * (节 approx + 五虎遁), hour pillar (clock school + 五鼠遁), 藏干, 纳音, zodiac.
 * TODO (sprint 2): exact 节气 times, 真太阳时 solar-time school, 起运/大运, 十神, 神煞, 空亡.
 */
import { BRANCHES, STEMS, ZODIAC, ganzhiOf, ganzhiIndexOf, yearGanzhiIndex } from './sexagenary.js';
import { dayPillarIndex } from './julian.js';
import { HIDDEN_STEMS, HOUR_STEM_START, MONTH_STEM_START, NAYIN, baziYear, hourBranch, monthBranch } from './tables.js';

export interface Chart {
  year: string;
  month: string;
  day: string;
  time: string;
  nayin: [string, string, string, string];
  hideGan: [string[], string[], string[], string[]];
  zodiac: string;
  /** 'clock' — solar-time school not yet implemented. */
  hourSchool: 'clock';
  warnings: string[];
}

export function computeChart(year: number, month: number, day: number, hour = 12, minute = 0): Chart {
  const warnings: string[] = [];

  // Year pillar
  const yb = baziYear(year, month, day);
  if (yb.boundary) warnings.push('year: 立春 boundary ±1 day — exact term time required');
  const yearIdx = yearGanzhiIndex(yb.year);
  const yearGanzhi = ganzhiOf(yearIdx);

  // Month pillar
  const mb = monthBranch(month, day);
  if (mb.boundary) warnings.push('month: 节 boundary ±1 day — exact term time required');
  const monthBranchIdx = BRANCHES.indexOf(mb.branch as (typeof BRANCHES)[number]);
  const monthStemIdx =
    (MONTH_STEM_START[yearGanzhi.stem] + (((monthBranchIdx - 2) % 12) + 12) % 12) % 10;
  const monthGanzhiName = STEMS[monthStemIdx] + BRANCHES[monthBranchIdx];

  // Day pillar
  const dayIdx = dayPillarIndex(year, month, day);
  const dayGanzhi = ganzhiOf(dayIdx);

  // Hour pillar (clock school)
  const hourBranchStr = hourBranch(hour);
  const hourBranchIdx = BRANCHES.indexOf(hourBranchStr as (typeof BRANCHES)[number]);
  const hourStemIdx = (HOUR_STEM_START[dayGanzhi.stem] + hourBranchIdx) % 10;
  const hourGanzhiName = STEMS[hourStemIdx] + BRANCHES[hourBranchIdx];

  // Hidden stems
  const hideGan: [string[], string[], string[], string[]] = [
    [...HIDDEN_STEMS[yearGanzhi.branch]],
    [...HIDDEN_STEMS[mb.branch]],
    [...HIDDEN_STEMS[dayGanzhi.branch]],
    [...HIDDEN_STEMS[hourBranchStr]],
  ];

  // Nayin per pillar
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
    hourSchool: 'clock',
    warnings,
  };
}
