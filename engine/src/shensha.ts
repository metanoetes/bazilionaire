/**
 * 神煞 (shén shà, symbolic stars) — static doctrine tables.
 * No oracle pinning exists (lunar_python does not provide them); these tables
 * are the verified convention set from the bazi-charting corpus.
 */

const BRANCH_GROUPS: Record<string, string[]> = {
  '寅午戌': ['寅', '午', '戌'],
  '申子辰': ['申', '子', '辰'],
  '巳酉丑': ['巳', '酉', '丑'],
  '亥卯未': ['亥', '卯', '未'],
};

function groupOf(branch: string): string | undefined {
  for (const [name, members] of Object.entries(BRANCH_GROUPS)) {
    if (members.includes(branch)) return name;
  }
  return undefined;
}

/** 驿马 (yì mǎ, "Relay Horse" — travel/movement star), from year or day branch. */
export const YIMA_TARGET: Record<string, string> = {
  '寅午戌': '申', '申子辰': '寅', '巳酉丑': '亥', '亥卯未': '巳',
};

/** 华盖 (huá gài, "Canopy" — solitude/spiritual star), from year or day branch. */
export const HUAGAI_TARGET: Record<string, string> = {
  '寅午戌': '戌', '申子辰': '辰', '巳酉丑': '丑', '亥卯未': '未',
};

/** 桃花 (táo huā, "Peach Blossom" — attraction star), from year or day branch. */
export const TAOHUA_TARGET: Record<string, string> = {
  '寅午戌': '卯', '申子辰': '酉', '巳酉丑': '午', '亥卯未': '子',
};

/** 羊刃 (yáng rèn, "Sheep Blade") — day stem → branch. */
export const YANGREN: Record<string, string> = {
  甲: '卯', 乙: '寅', 丙: '午', 戊: '午', 丁: '巳', 己: '巳',
  庚: '酉', 辛: '申', 壬: '子', 癸: '亥',
};

/** 禄 (lù, "Salary") — day stem → branch. */
export const LU: Record<string, string> = {
  甲: '寅', 乙: '卯', 丙: '巳', 戊: '巳', 丁: '午', 己: '午',
  庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
};

/** 天乙贵人 (tiān yǐ guì rén, "Heavenly Noble") — day stem → branches (both count). */
export const TIANYI: Record<string, [string, string]> = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['午', '寅'],
};

/** 文昌 (wén chāng, "Literary Star") — day stem → branch. */
export const WENCHANG: Record<string, string> = {
  甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉', 己: '酉',
  庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};

export function shenshaFor(branchKey: string): {
  yima: string | undefined;
  huagai: string | undefined;
  taohua: string | undefined;
} {
  const g = groupOf(branchKey);
  return {
    yima: g ? YIMA_TARGET[g] : undefined,
    huagai: g ? HUAGAI_TARGET[g] : undefined,
    taohua: g ? TAOHUA_TARGET[g] : undefined,
  };
}
