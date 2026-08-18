/**
 * Branch interactions (合冲刑害) — the relation matrix between 地支 pairs.
 * Canonical doctrine (mainstream school):
 *   六合 pairs: 子丑, 寅亥, 卯戌, 辰酉, 巳申, 午未
 *   三合: 申子辰(水), 亥卯未(木), 寅午戌(火), 巳酉丑(金);
 *     半合 = the ADJACENT pair legs only (申子/子辰 etc.) — the 生墓 pair
 *     (申辰 etc.) is NOT a relation by itself.
 *   冲: 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥 (180°)
 *   刑 — the FULL canonical set, 11 pairs:
 *     无礼之刑 子卯; 恃势之刑 寅巳申 (all three legs 刑, incl. the 冲 leg 寅申);
 *     无恩之刑 丑戌未 (all three legs 刑, incl. the 冲 leg 丑未);
 *     自刑 辰辰, 午午, 酉酉, 亥亥.
 *     NOTE: a pair can carry several relations — 巳申 is 六合 AND 刑; 寅申 is
 *     冲 AND 刑. The matrix returns ALL of them; no single-match masking.
 *   害: 丑午, 子未, 寅巳, 卯辰, 申亥, 酉戌
 *
 * 三合 is a THREE-branch phenomenon: it is detected at chart level as
 * "completion" (a transit branch filling the group's missing seat), never as
 * a pair relation.
 */
import { BRANCHES } from './sexagenary.js';

export type InteractionType = '六合' | '三合' | '半合' | '冲' | '刑' | '害';

export interface Interaction {
  type: InteractionType;
  detail: string;
}

export const LIU_HE: Array<[string, string]> = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

export const SAN_HE: Record<string, string[]> = {
  '申子辰': ['申', '子', '辰'],
  '亥卯未': ['亥', '卯', '未'],
  '寅午戌': ['寅', '午', '戌'],
  '巳酉丑': ['巳', '酉', '丑'],
};

export const CHONG: Array<[string, string]> = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

/** 刑 — the full canonical set (11 pairs incl. the four 自刑). */
export const XING: Array<[string, string]> = [
  ['子', '卯'], // 无礼之刑
  ['寅', '巳'], ['巳', '申'], ['申', '寅'], // 恃势之刑 (寅申 also 冲)
  ['丑', '戌'], ['戌', '未'], ['未', '丑'], // 无恩之刑 (丑未 also 冲)
  ['辰', '辰'], ['午', '午'], ['酉', '酉'], ['亥', '亥'], // 自刑
];

export const HAI: Array<[string, string]> = [
  ['丑', '午'], ['子', '未'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

function pairIn(list: Array<[string, string]>, a: string, b: string): boolean {
  return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function sanHeGroup(branch: string): string | undefined {
  for (const [name, members] of Object.entries(SAN_HE)) {
    if (members.includes(branch)) return name;
  }
  return undefined;
}

/**
 * ALL relations between two branches, in fixed order 六合 → 冲 → 刑 → 害 → 半合.
 * Empty array = no relation. A pair can carry several relations (multi-match,
 * never first-match).
 */
export function branchInteraction(a: string, b: string): Interaction[] {
  const out: Interaction[] = [];
  if (pairIn(LIU_HE, a, b)) out.push({ type: '六合', detail: `${a}${b} 六合` });
  if (pairIn(CHONG, a, b)) out.push({ type: '冲', detail: `${a}${b} 冲` });
  if (pairIn(XING, a, b)) out.push({ type: '刑', detail: a === b ? `${a} 自刑` : `${a}${b} 刑` });
  if (pairIn(HAI, a, b)) out.push({ type: '害', detail: `${a}${b} 害` });
  if (a !== b) {
    const ga = sanHeGroup(a);
    if (ga && SAN_HE[ga].includes(b)) {
      const gaIdx = SAN_HE[ga].indexOf(a);
      const gbIdx = SAN_HE[ga].indexOf(b);
      if (Math.abs(gaIdx - gbIdx) === 1) {
        out.push({ type: '半合', detail: `${a}${b} 半合 (${ga})` });
      }
      // 生墓 pair (|Δ|=2): no pair-level relation — it needs the middle member.
    }
  }
  return out;
}

/** 三合 completion: does the natal chart hold the other two seats of the branch's group? */
export function sanHeCompletion(branch: string, natalBranches: string[]): string | null {
  const group = sanHeGroup(branch);
  if (!group) return null;
  const others = SAN_HE[group].filter((m) => m !== branch);
  return others.every((m) => natalBranches.includes(m)) ? group : null;
}

/** All interactions between a branch and the four natal branches (flattened). */
export function branchMatrix(branch: string, natalBranches: string[]): Interaction[] {
  const out: Interaction[] = [];
  for (const nb of natalBranches) {
    out.push(...branchInteraction(branch, nb));
  }
  return out;
}

/** 调候 (tiáo hòu) — the climate need of a month branch (fire vs water schools). */
export function tiaohouNeed(monthBranch: string): 'fire' | 'water' | null {
  const winter = ['亥', '子', '丑'];
  const summer = ['巳', '午', '未'];
  if (winter.includes(monthBranch)) return 'fire';
  if (summer.includes(monthBranch)) return 'water';
  return null;
}

/** 空亡 + 冲空则实: does a clash strike a voided branch (filling it)? */
export function isChongKong(transitBranch: string, natalBranch: string, voidBranches: string): boolean {
  if (!voidBranches.includes(natalBranch)) return false;
  return pairIn(CHONG, transitBranch, natalBranch);
}

export function branchIndexOf(branch: string): number {
  return BRANCHES.indexOf(branch as (typeof BRANCHES)[number]);
}
