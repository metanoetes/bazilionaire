/**
 * 流年 (liú nián, annual transit) — the year's pillar read against a natal chart:
 * the year's ganzhi, its 十神 vs the day master, and every interaction between
 * the year branch and the four natal branches (合冲刑害), including 冲空则实
 * (a clash striking a voided branch fills it) and 调候 supply.
 */
import { ganzhiOf, yearGanzhiIndex } from './sexagenary.js';
import { shishenOf } from './tenGods.js';
import { branchMatrix, isChongKong, tiaohouNeed, type Interaction } from './interactions.js';
import { STEMS } from './sexagenary.js';

export interface Liunian {
  /** Gregorian year examined. */
  year: number;
  /** The 流年 pillar, e.g. 甲辰. */
  ganzhi: string;
  /** 十神 of the year stem vs the natal day master. */
  shishen: string;
  /** Interactions of the year branch with the natal branches. */
  interactions: Interaction[];
  /** Clashes that strike voided natal branches (冲空则实). */
  chongKong: string[];
  /** Does the year branch supply the chart's 调候 need? */
  tiaohouSupply: boolean;
}

const BRANCH_ELEMENT: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

export function liunian(
  gregorianYear: number,
  natal: {
    dayStem: string;
    branches: [string, string, string, string];
    monthBranch: string;
    dayXunKong: string;
  },
): Liunian {
  const idx = yearGanzhiIndex(gregorianYear);
  const g = ganzhiOf(idx);
  const dayIdx = STEMS.indexOf(natal.dayStem as (typeof STEMS)[number]);
  const yearStemIdx = STEMS.indexOf(g.stem as (typeof STEMS)[number]);
  const interactions = branchMatrix(g.branch, natal.branches);
  const need = tiaohouNeed(natal.monthBranch);
  const chongKong: string[] = [];
  for (const nb of natal.branches) {
    if (isChongKong(g.branch, nb, natal.dayXunKong)) chongKong.push(nb);
  }
  return {
    year: gregorianYear,
    ganzhi: g.name,
    shishen: shishenOf(dayIdx, yearStemIdx),
    interactions,
    chongKong,
    tiaohouSupply: need !== null && BRANCH_ELEMENT[g.branch] === (need === 'fire' ? '火' : '水'),
  };
}
