/**
 * Branch interactions (合冲刑害) — the relation matrix between 地支 pairs.
 * Doctrine from the bazi-charting corpus:
 *   六合 pairs: 子丑, 寅亥, 卯戌, 辰酉, 巳申, 午未
 *   三合: 申子辰(水), 亥卯未(木), 寅午戌(火), 巳酉丑(金); 半合 = adjacent pairs
 *   冲: 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥 (180°)
 *   刑: the 三刑 triangles sit 90° apart (3 wheel steps) — NOT 120°.
 *       Each triangle = two 90° 刑 legs + one 180° 冲 leg:
 *       丑戌未: 丑戌刑, 戌未刑, 丑未冲 (no 合 leg — harshest)
 *       寅巳申: 寅巳刑, 巳申刑(also 六合!), 寅申冲
 *   害: 丑午, 子未, 寅巳, 卯辰, 申亥, 酉戌
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

/** 刑 legs only — the 冲 leg inside each triangle is NOT 刑 (it is 冲). */
export const XING: Array<[string, string]> = [
  ['丑', '戌'], ['戌', '未'], // 丑戌未 triangle
  ['寅', '巳'], ['巳', '申'], // 寅巳申 triangle (巳申 also 六合)
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

/** Relation between two branches, null if none of the six. */
export function branchInteraction(a: string, b: string): Interaction | null {
  if (pairIn(LIU_HE, a, b)) return { type: '六合', detail: `${a}${b} 六合` };
  if (pairIn(CHONG, a, b)) return { type: '冲', detail: `${a}${b} 冲` };
  if (pairIn(XING, a, b)) return { type: '刑', detail: `${a}${b} 刑` };
  if (pairIn(HAI, a, b)) return { type: '害', detail: `${a}${b} 害` };
  const ga = sanHeGroup(a);
  if (ga && SAN_HE[ga].includes(b)) {
    const gaIdx = SAN_HE[ga].indexOf(a);
    const gbIdx = SAN_HE[ga].indexOf(b);
    if (gaIdx === gbIdx) return { type: '三合', detail: `${a}${b} 自临 (${ga})` };
    if (Math.abs(gaIdx - gbIdx) === 1 || Math.abs(gaIdx - gbIdx) === 2) {
      return { type: '半合', detail: `${a}${b} 半合 (${ga})` };
    }
    return { type: '三合', detail: `${a}${b} (${ga})` };
  }
  return null;
}

/** All interactions between a branch and the four natal branches. */
export function branchMatrix(branch: string, natalBranches: string[]): Interaction[] {
  const out: Interaction[] = [];
  for (const nb of natalBranches) {
    const rel = branchInteraction(branch, nb);
    if (rel) out.push(rel);
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
