/**
 * 天干地支 — the sexagenary cycle.
 * 甲子 = index 0 … 癸亥 = index 59.
 */
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];

export interface Ganzhi {
  stem: Stem;
  branch: Branch;
  /** The two-character pillar name, e.g. 甲子. */
  name: string;
  /** Sexagenary index, 0–59, 甲子 = 0. */
  index: number;
}

/** Sexagenary index → ganzhi. */
export function ganzhiOf(index: number): Ganzhi {
  const i = ((index % 60) + 60) % 60;
  return {
    stem: STEMS[i % 10],
    branch: BRANCHES[i % 12],
    name: STEMS[i % 10] + BRANCHES[i % 12],
    index: i,
  };
}

/**
 * Stem index + branch index → sexagenary index.
 * Chinese-remainder: i ≡ s (mod 10), i ≡ b (mod 12), both sides same parity.
 */
export function ganzhiIndexOf(stemIdx: number, branchIdx: number): number {
  const s = ((stemIdx % 10) + 10) % 10;
  const b = ((branchIdx % 12) + 12) % 12;
  const k = ((((s - b) / 2) % 6) + 6) % 6;
  return s + 10 * k;
}

/** Sexagenary year index for a Gregorian year: 1984 = 甲子 = 0. */
export function yearGanzhiIndex(gregorianYear: number): number {
  return ((gregorianYear - 4) % 60 + 60) % 60;
}
