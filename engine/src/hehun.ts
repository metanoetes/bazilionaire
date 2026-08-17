/**
 * 合婚 (hé hūn, marriage compatibility) — the computed layers of the
 * three-layer method (day-master 十神 → branch matrix → the human layer
 * stays with the reader; the engine never produces the third layer).
 *
 * Layer 1: day-master relations — the marital-star signature: each person's
 *   day stem read as the other's 财 (wife-star, for males) or 官 (husband-star,
 *   for females). Mutual = the strongest structural signature.
 * Layer 2: branch matrix — every cross-chart branch pair (六合/三合/半合/冲/刑/害),
 *   冲空则实 strikes, 调候 completion (each chart's climate need supplied by
 *   the other's branches).
 */
import { BRANCHES } from './sexagenary.js';
import { STEMS } from './sexagenary.js';
import { shishenOf } from './tenGods.js';
import { branchInteraction, isChongKong, tiaohouNeed, type Interaction } from './interactions.js';

export interface PersonChart {
  dayStem: string;
  branches: [string, string, string, string];
  monthBranch: string;
  dayXunKong: string;
  gender: 'male' | 'female';
}

export interface HehunReport {
  /** a's day stem read as b's 十神, and vice versa. */
  aStemInB: string;
  bStemInA: string;
  /** Marital-star checks: is b's day stem a's 财 (if a male) / 官 (if a female)? */
  bIsMaritalStarForA: boolean;
  aIsMaritalStarForB: boolean;
  /** Both directions hold — the strongest structural signature (男财女官). */
  mutualMaritalStars: boolean;
  /** Every cross-chart branch interaction. */
  interactions: Interaction[];
  /** Cross-chart clashes that strike voided branches (冲空则实). */
  chongKong: string[];
  /** Each chart supplies the other's 调候 need? */
  aSuppliesB: boolean;
  bSuppliesA: boolean;
}

const MALE_STARS = new Set(['正财', '偏财']);
const FEMALE_STARS = new Set(['正官', '七杀']);

export function hehun(a: PersonChart, b: PersonChart): HehunReport {
  const aStemIdx = STEMS.indexOf(a.dayStem as (typeof STEMS)[number]);
  const bStemIdx = STEMS.indexOf(b.dayStem as (typeof STEMS)[number]);
  const aStemInB = shishenOf(bStemIdx, aStemIdx);
  const bStemInA = shishenOf(aStemIdx, bStemIdx);

  const starsFor = (gender: 'male' | 'female') => (gender === 'male' ? MALE_STARS : FEMALE_STARS);
  const bIsMaritalStarForA = starsFor(a.gender).has(bStemInA);
  const aIsMaritalStarForB = starsFor(b.gender).has(aStemInB);

  const interactions: Interaction[] = [];
  for (const ba of a.branches) {
    for (const bb of b.branches) {
      const rel = branchInteraction(ba, bb);
      if (rel) interactions.push(rel);
    }
  }

  const chongKong: string[] = [];
  for (const ba of a.branches) {
    for (const bb of b.branches) {
      if (isChongKong(bb, ba, a.dayXunKong) || isChongKong(ba, bb, b.dayXunKong)) {
        chongKong.push(`${ba}×${bb}`);
      }
    }
  }

  const needA = tiaohouNeed(a.monthBranch);
  const needB = tiaohouNeed(b.monthBranch);
  const BRANCH_ELEMENT: Record<string, string> = {
    子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
    午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
  };
  const supplies = (branches: string[], need: 'fire' | 'water') =>
    branches.some((br) => BRANCH_ELEMENT[br] === (need === 'fire' ? '火' : '水'));
  const aSuppliesB = needB !== null && supplies(a.branches, needB);
  const bSuppliesA = needA !== null && supplies(b.branches, needA);

  return {
    aStemInB,
    bStemInA,
    bIsMaritalStarForA,
    aIsMaritalStarForB,
    mutualMaritalStars: bIsMaritalStarForA && aIsMaritalStarForB,
    interactions,
    chongKong,
    aSuppliesB,
    bSuppliesA,
  };
}
