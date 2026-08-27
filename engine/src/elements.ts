/**
 * 五行 (wǔ xíng) element arithmetic — shared low-level helpers for the
 * strength/pattern/用神 layer (strength.ts, pattern.ts, wuhe.ts, yongshen.ts).
 * Element index convention throughout the engine: 0=木 1=火 2=土 3=金 4=水.
 * 相生 (generation): i generates i+1 (mod 5). 相克 (control): i controls i+2 (mod 5).
 */
import { STEMS } from './sexagenary.js';
import { HIDDEN_STEMS } from './tables.js';

export const ELEMENT_NAMES = ['木', '火', '土', '金', '水'] as const;

/** 五行 element index per stem, STEMS order (甲乙丙丁戊己庚辛壬癸). */
export const STEM_ELEMENT: number[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

export function elementOfStem(stem: string): number {
  return STEM_ELEMENT[STEMS.indexOf(stem as (typeof STEMS)[number])];
}

/** A branch's primary (主气) element — the element of its dominant hidden stem. */
export function branchPrimaryElement(branch: string): number {
  return elementOfStem(HIDDEN_STEMS[branch][0]);
}

/** Does element `a` generate element `b`? (相生) */
export function generates(a: number, b: number): boolean {
  return (a + 1) % 5 === b;
}

/** Does element `a` control element `b`? (相克) */
export function controls(a: number, b: number): boolean {
  return (a + 2) % 5 === b;
}

export type SeasonState = '旺' | '相' | '死' | '囚' | '休';

/**
 * 旺相休囚死 — the five-state seasonal-strength doctrine (module 9's table),
 * for a day-master element X against a season (month) element Y:
 *   X===Y            → 旺 wàng, flourishing (its own season)
 *   Y generates X     → 相 xiàng, supported
 *   Y controls X       → 死 sǐ, dormant (restrained by the season)
 *   X controls Y       → 囚 qiú, confined (spends itself controlling the season)
 *   X generates Y      → 休 xiū, resting (spends itself generating the season)
 * 得令 (commands the season) iff the state is 旺 or 相.
 */
export function seasonState(dayMasterElement: number, seasonElement: number): { state: SeasonState; deLing: boolean } {
  const diff = ((dayMasterElement - seasonElement) % 5 + 5) % 5;
  const table: SeasonState[] = ['旺', '相', '死', '囚', '休'];
  const state = table[diff];
  return { state, deLing: state === '旺' || state === '相' };
}
