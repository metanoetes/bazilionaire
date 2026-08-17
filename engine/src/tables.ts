/**
 * Static doctrine tables — no astronomy, pure tradition.
 * All values cross-checked against the lunar_python oracle (see fixtures/).
 */

/** 纳音 (nayin) — the 60 sexagenary pairs, 2 indices per element name. */
export const NAYIN: string[] = [
  '海中金', '海中金', // 甲子 乙丑
  '炉中火', '炉中火', // 丙寅 丁卯
  '大林木', '大林木', // 戊辰 己巳
  '路旁土', '路旁土', // 庚午 辛未
  '剑锋金', '剑锋金', // 壬申 癸酉
  '山头火', '山头火', // 甲戌 乙亥
  '涧下水', '涧下水', // 丙子 丁丑
  '城头土', '城头土', // 戊寅 己卯
  '白蜡金', '白蜡金', // 庚辰 辛巳
  '杨柳木', '杨柳木', // 壬午 癸未
  '泉中水', '泉中水', // 甲申 乙酉
  '屋上土', '屋上土', // 丙戌 丁亥
  '霹雳火', '霹雳火', // 戊子 己丑
  '松柏木', '松柏木', // 庚寅 辛卯
  '长流水', '长流水', // 壬辰 癸巳
  '沙中金', '沙中金', // 甲午 乙未
  '山下火', '山下火', // 丙申 丁酉
  '平地木', '平地木', // 戊戌 己亥
  '壁上土', '壁上土', // 庚子 辛丑
  '金箔金', '金箔金', // 壬寅 癸卯
  '覆灯火', '覆灯火', // 甲辰 乙巳
  '天河水', '天河水', // 丙午 丁未
  '大驿土', '大驿土', // 戊申 己酉
  '钗钏金', '钗钏金', // 庚戌 辛亥
  '桑柘木', '桑柘木', // 壬子 癸丑
  '大溪水', '大溪水', // 甲寅 乙卯
  '沙中土', '沙中土', // 丙辰 丁巳
  '天上火', '天上火', // 戊午 己未
  '石榴木', '石榴木', // 庚申 辛酉
  '大海水', '大海水', // 壬戌 癸亥
];

/** 藏干 (hidden stems) per branch, in doctrine order. */
export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '戊', '庚'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

/** 五虎遁 — year stem → the stem of the 寅 month (month index 0). */
export const MONTH_STEM_START: Record<string, number> = {
  甲: 2, // 甲己之年丙作首
  己: 2,
  乙: 4, // 乙庚之岁戊为头
  庚: 4,
  丙: 6, // 丙辛必定寻庚起
  辛: 6,
  丁: 8, // 丁壬壬位顺行流
  壬: 8,
  戊: 0, // 戊癸何方发，甲寅之上好追求
  癸: 0,
};

/** 五鼠遁 — day stem → the stem of the 子 hour (hour index 0). */
export const HOUR_STEM_START: Record<string, number> = {
  甲: 0, // 甲己还加甲
  己: 0,
  乙: 2, // 乙庚丙作初
  庚: 2,
  丙: 4, // 丙辛从戊起
  辛: 4,
  丁: 6, // 丁壬庚子居
  壬: 6,
  戊: 8, // 戊癸何方发，壬子是真途
  癸: 8,
};

/**
 * 节-month transitions: (month, approxDay, branch).
 * Approximate 节气 boundaries — exact term times are a TODO (sprint 2, skyfield port).
 * Values are the customary mid-transition day; ±1 day is flagged as boundary-uncertain.
 */
const MONTH_TRANSITIONS: Array<{ m: number; d: number; branch: string }> = [
  { m: 2, d: 4, branch: '寅' }, // 立春
  { m: 3, d: 6, branch: '卯' }, // 惊蛰
  { m: 4, d: 5, branch: '辰' }, // 清明
  { m: 5, d: 6, branch: '巳' }, // 立夏
  { m: 6, d: 6, branch: '午' }, // 芒种
  { m: 7, d: 7, branch: '未' }, // 小暑
  { m: 8, d: 8, branch: '申' }, // 立秋
  { m: 9, d: 8, branch: '酉' }, // 白露
  { m: 10, d: 8, branch: '戌' }, // 寒露
  { m: 11, d: 7, branch: '亥' }, // 立冬
  { m: 12, d: 7, branch: '子' }, // 大雪
  { m: 13, d: 6, branch: '丑' }, // 小寒 (January of the NEXT calendar year)
];

/**
 * Month branch for a Gregorian date (approx). Returns the branch and a
 * boundary-uncertainty flag when the date sits within ±1 day of a 节.
 * January is treated as month 13 — it belongs to the next solar year's 丑月.
 */
export function monthBranch(m: number, d: number): { branch: string; boundary: boolean } {
  const me = m === 1 ? 13 : m;
  let branch = '子'; // default: Jan 1–5, the pre-小寒 tail of 子月
  let boundary = false;
  for (const t of MONTH_TRANSITIONS) {
    if (me === t.m && Math.abs(d - t.d) <= 1) boundary = true;
    if (me > t.m || (me === t.m && d >= t.d)) branch = t.branch;
  }
  return { branch, boundary };
}

/** Year-boundary (立春, ~Feb 4): which Gregorian year owns the date. */
export function baziYear(gregorianYear: number, m: number, d: number): { year: number; boundary: boolean } {
  if (m < 2 || (m === 2 && d <= 3)) return { year: gregorianYear - 1, boundary: false };
  if (m > 2 || (m === 2 && d >= 5)) return { year: gregorianYear, boundary: false };
  return { year: gregorianYear - 1, boundary: true }; // Feb 4 — exact 立春 time needed
}

/** Hour branch from clock hour (clock school; 真太阳时 correction is sprint 2). */
export function hourBranch(hour: number): string {
  return ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][
    Math.floor(((hour + 1) % 24) / 2)
  ];
}
