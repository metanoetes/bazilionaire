/**
 * 五合 (wǔ hé) — the five stem-combination pairs and their 合化 (transformed
 * element) claim. Universal, uncontested doctrine (unlike some 六合 branch
 * transformations, e.g. 午未, where module 3's curriculum notes school
 * disagreement) — no oracle pin needed, same status as tables.ts's static
 * doctrine tables.
 *
 * Combination requires ADJACENCY in the four-pillar layout (year–month,
 * month–day, day–hour are adjacent; year–day, year–hour, month–hour are not)
 * — the classical 合绊 (combination-tether) condition. 化气 (transformation)
 * is a stronger, separate claim layered on top: the day stem specifically
 * combines with an adjacent stem AND the transformed element is supported by
 * the rest of the chart (module 10's 化气格 candidacy, decided in pattern.ts).
 */
import { STEMS } from './sexagenary.js';
import { elementOfStem } from './elements.js';

export interface WuHePair {
  a: string;
  b: string;
  /** The element (name) the pair is said to transform into. */
  transformElement: number;
}

/** The five pairs, each yang+yin, and the element they combine toward. */
export const WUHE_PAIRS: WuHePair[] = [
  { a: '甲', b: '己', transformElement: 2 }, // 甲己合化土
  { a: '乙', b: '庚', transformElement: 3 }, // 乙庚合化金
  { a: '丙', b: '辛', transformElement: 4 }, // 丙辛合化水
  { a: '丁', b: '壬', transformElement: 0 }, // 丁壬合化木
  { a: '戊', b: '癸', transformElement: 1 }, // 戊癸合化火
];

/** The transformed element if stems a,b form a 五合 pair; undefined otherwise. */
export function wuheTransform(a: string, b: string): number | undefined {
  for (const p of WUHE_PAIRS) {
    if ((p.a === a && p.b === b) || (p.a === b && p.b === a)) return p.transformElement;
  }
  return undefined;
}

export interface WuHeCombination {
  /** Pillar positions, adjacent pairs only: 'year-month' | 'month-day' | 'day-hour'. */
  position: 'year-month' | 'month-day' | 'day-hour';
  stems: [string, string];
  transformElement: number;
}

/** Every adjacent-pillar 五合 combination present in the four stems. */
export function findWuHeCombinations(stems: [string, string, string, string]): WuHeCombination[] {
  const [year, month, day, hour] = stems;
  const pairs: Array<[WuHeCombination['position'], string, string]> = [
    ['year-month', year, month],
    ['month-day', month, day],
    ['day-hour', day, hour],
  ];
  const out: WuHeCombination[] = [];
  for (const [position, a, b] of pairs) {
    const t = wuheTransform(a, b);
    if (t !== undefined) out.push({ position, stems: [a, b], transformElement: t });
  }
  return out;
}

export interface HuaQiCandidacy {
  /** Whether the day master itself combines with an adjacent stem. */
  dayCombines: boolean;
  transformElement?: number;
  partnerPosition?: 'year-month-side' | 'hour-side';
  /** True when BOTH month and hour agree with (or at minimum do not contradict)
   *  the transformed element AND the day stem's own original element commands
   *  no independent root (module 10's "near-perfect support" bar). Computed
   *  fully in pattern.ts, where branch/root context is available; this flags
   *  only the necessary first condition (day stem combines with a neighbor). */
}

/** Does the day stem combine with the month or hour stem? First 化气格 gate. */
export function dayMasterCombines(monthStem: string, dayStem: string, hourStem: string): HuaQiCandidacy {
  const withMonth = wuheTransform(dayStem, monthStem);
  if (withMonth !== undefined) {
    return { dayCombines: true, transformElement: withMonth, partnerPosition: 'year-month-side' };
  }
  const withHour = wuheTransform(dayStem, hourStem);
  if (withHour !== undefined) {
    return { dayCombines: true, transformElement: withHour, partnerPosition: 'hour-side' };
  }
  return { dayCombines: false };
}

export function stemIndexOf(stem: string): number {
  return STEMS.indexOf(stem as (typeof STEMS)[number]);
}

export { elementOfStem };
