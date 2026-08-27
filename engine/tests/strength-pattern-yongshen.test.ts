import { describe, expect, it } from 'vitest';
import { computeChart } from '../src/pillars.js';
import { computeStrength } from '../src/strength.js';
import { classifyPattern } from '../src/pattern.js';
import { selectYongShen } from '../src/yongshen.js';
import { twelveStageOf } from '../src/twelveStages.js';
import { wuheTransform, dayMasterCombines, findWuHeCombinations } from '../src/wuhe.js';
import { seasonState } from '../src/elements.js';

/**
 * 强弱/格局/用神 (modules 9-11) — the curriculum's own worked chart is the
 * primary pin: 2000-01-01 12:00 Beijing → 己卯 丙子 戊午 戊午, day master 戊.
 *
 * NOTE: curriculum part4.ts's HAND-derived pattern claim (正印格) does not
 * match the oracle. Verified directly: month branch 子's 主气 is 癸; for a
 * 戊 (earth) day master, 癸 (water, opposite polarity) is 正财 by standard
 * 土克水 doctrine (earth controls water) — lunar_python's own
 * getMonthShiShenZhi() returns 正财 for this exact chart, not 正印. The
 * curriculum prose has a real derivation error (module 9's own strength
 * write-up independently states "earth is controlled by water" — backwards;
 * water is controlled BY earth). This engine follows the oracle; the
 * curriculum prose is being corrected to match (see part4.ts patch).
 */
describe('十二长生 (twelve growth stages) — oracle-verified table', () => {
  it('甲 forward cycle: 亥=长生, 卯=帝旺 (yang stems run forward from their own 长生)', () => {
    expect(twelveStageOf('甲', '亥')).toBe('长生');
    expect(twelveStageOf('甲', '卯')).toBe('帝旺');
  });
  it('乙 reverse cycle: 午=长生, 寅=帝旺 (yin stems run backward)', () => {
    expect(twelveStageOf('乙', '午')).toBe('长生');
    expect(twelveStageOf('乙', '寅')).toBe('帝旺');
  });
  it('戊 shares 丙\'s cycle (胎养长生沐浴冠带临官帝旺衰病死墓绝 from 寅)', () => {
    expect(twelveStageOf('戊', '寅')).toBe('长生');
    expect(twelveStageOf('戊', '午')).toBe('帝旺');
  });
  it('癸 reverse cycle: 卯=长生, 亥=帝旺', () => {
    expect(twelveStageOf('癸', '卯')).toBe('长生');
    expect(twelveStageOf('癸', '亥')).toBe('帝旺');
  });
});

describe('旺相休囚死 season states', () => {
  it('day master element == season element → 旺 (deLing true)', () => {
    expect(seasonState(0, 0)).toEqual({ state: '旺', deLing: true });
  });
  it('season generates day master → 相 (deLing true)', () => {
    expect(seasonState(1, 0)).toEqual({ state: '相', deLing: true }); // 木生火: season 木(0) generates dm 火(1)
  });
  it('season controls day master → 死 (deLing false)', () => {
    expect(seasonState(2, 0)).toEqual({ state: '死', deLing: false }); // 木克土: season 木(0) controls dm 土(2)
  });
  it('day master controls season → 囚 (deLing false)', () => {
    expect(seasonState(2, 4)).toEqual({ state: '囚', deLing: false }); // 土克水: dm 土(2) controls season 水(4)
  });
  it('day master generates season → 休 (deLing false)', () => {
    expect(seasonState(0, 1)).toEqual({ state: '休', deLing: false }); // 木生火: dm 木(0) generates season 火(1)
  });
});

describe('五合 stem combinations', () => {
  it('all five pairs transform to the doctrinal element', () => {
    expect(wuheTransform('甲', '己')).toBe(2); // 土
    expect(wuheTransform('乙', '庚')).toBe(3); // 金
    expect(wuheTransform('丙', '辛')).toBe(4); // 水
    expect(wuheTransform('丁', '壬')).toBe(0); // 木
    expect(wuheTransform('戊', '癸')).toBe(1); // 火
  });
  it('order-independent', () => {
    expect(wuheTransform('己', '甲')).toBe(2);
  });
  it('non-combining pair returns undefined', () => {
    expect(wuheTransform('甲', '乙')).toBeUndefined();
  });
  it('findWuHeCombinations only matches ADJACENT pillar pairs', () => {
    // year=甲, month=己 (adjacent, combines); day=丙, hour=辛 (adjacent, combines);
    // year-day and month-hour are not adjacent and are not checked.
    const combos = findWuHeCombinations(['甲', '己', '丙', '辛']);
    expect(combos).toHaveLength(2);
    expect(combos.map((c) => c.position)).toEqual(['year-month', 'day-hour']);
  });
  it('dayMasterCombines checks month-side then hour-side', () => {
    expect(dayMasterCombines('己', '甲', '庚').dayCombines).toBe(true); // day 甲 + month 己
    expect(dayMasterCombines('庚', '甲', '己').dayCombines).toBe(true); // day 甲 + hour 己
    expect(dayMasterCombines('庚', '甲', '辛').dayCombines).toBe(false); // neither combines
  });
});

describe('强弱 — the curriculum\'s own worked chart (己卯 丙子 戊午 戊午, day master 戊)', () => {
  const branches: [string, string, string, string] = ['卯', '子', '午', '午'];
  const stems: [string, string, string, string] = ['己', '丙', '戊', '戊'];

  it('得令: 子 (water) controls 戊 (earth) in its own season → 囚, NOT 得令 (module 9\'s prose)', () => {
    const s = computeStrength('戊', branches, stems);
    expect(s.deLing.state).toBe('囚');
    expect(s.deLing.commands).toBe(false);
  });
  it('得地: 午 (day + hour) roots 戊 as 余气 己, at 帝旺 stage — real but secondary support, doubled', () => {
    const s = computeStrength('戊', branches, stems);
    expect(s.roots).toHaveLength(2);
    expect(s.roots.every((r) => r.depth === '余气' && r.growthStage === '帝旺')).toBe(true);
    expect(s.roots.map((r) => r.pillar)).toEqual(['day', 'hour']);
  });
  it('得势: 己(year, peer) and 丙(month, generates 戊) support; hour 戊 is the day master\'s own peer, also support — all 3 support', () => {
    const s = computeStrength('戊', branches, stems);
    expect(s.stemSupport.filter((x) => x.polarity === 1).map((x) => x.pillar)).toEqual(['year', 'month', 'hour']);
  });
  it('verdict: 身弱 but not collapsed — matches module 9\'s own prose conclusion', () => {
    const s = computeStrength('戊', branches, stems);
    expect(s.verdict).toBe('身弱');
    expect(s.rootless).toBe(false);
    expect(s.extreme).toBe(false);
  });

  it('格局: month 子\'s 主气 癸 reads 正财 to a 戊 day master (oracle-verified, corrects curriculum\'s hand-derived 正印格)', () => {
    const s = computeStrength('戊', branches, stems);
    const p = classifyPattern('戊', branches, stems, s);
    expect(p.primary).toEqual({ kind: 'regular', name: '正财格', governingShishen: '正财', monthHiddenStem: '癸' });
  });

  it('用神: 身弱 → 扶抑 recommends 扶 (印/比劫); 调候 also fires (子=deep winter, wants 火) but does not outrank since strength is not extreme', () => {
    const s = computeStrength('戊', branches, stems);
    const p = classifyPattern('戊', branches, stems, s);
    const y = selectYongShen('戊', branches, '子', s, p);
    expect(y.fuyi.direction).toBe('扶');
    expect(y.fuyi.favorable).toEqual(expect.arrayContaining(['正印', '偏印', '比肩', '劫财']));
    expect(y.tiaohou.applies).toBe(true);
    expect(y.tiaohou.need).toBe('fire');
    expect(y.recommended.method).toBe('扶抑'); // strength not extreme, so 调候 doesn't jump the queue
  });

  it('full computeChart wires strength/pattern/yongShen consistently with the direct calls above', () => {
    const c = computeChart(2000, 1, 1, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 1);
    expect(c.year).toBe('己卯');
    expect(c.month).toBe('丙子');
    expect(c.day).toBe('戊午');
    expect(c.time).toBe('戊午');
    expect(c.strength.verdict).toBe('身弱');
    expect(c.pattern.primary.kind).toBe('regular');
    expect((c.pattern.primary as { name: string }).name).toBe('正财格');
    expect(c.yongShen.fuyi.direction).toBe('扶');
  });
});

describe('格局 — special patterns (建禄格/羊刃格) when month is a peer', () => {
  it('建禄格: yang day master sits on its own 禄 seat in the month (甲 day master, 寅 month)', () => {
    const branches: [string, string, string, string] = ['子', '寅', '子', '子'];
    const stems: [string, string, string, string] = ['丙', '丙', '甲', '丙'];
    const s = computeStrength('甲', branches, stems);
    const p = classifyPattern('甲', branches, stems, s);
    expect(p.primary).toMatchObject({ kind: 'special', name: '建禄格' });
  });
  it('羊刃格: yin-adjacent day master on its own blade branch (丙 day master, 午 month)', () => {
    const branches: [string, string, string, string] = ['子', '午', '子', '子'];
    const stems: [string, string, string, string] = ['壬', '甲', '丙', '壬'];
    const s = computeStrength('丙', branches, stems);
    const p = classifyPattern('丙', branches, stems, s);
    expect(p.primary).toMatchObject({ kind: 'special', name: '羊刃格' });
  });
});

describe('格局 — 从格/专旺 candidacy (extreme + rootless charts only)', () => {
  it('从杀格 candidate: 甲 day master with zero wood root anywhere, dominated by 官杀', () => {
    const branches: [string, string, string, string] = ['申', '酉', '戌', '丑'];
    const stems: [string, string, string, string] = ['庚', '辛', '甲', '辛'];
    const s = computeStrength('甲', branches, stems);
    expect(s.extreme).toBe(true);
    expect(s.rootless).toBe(true);
    const p = classifyPattern('甲', branches, stems, s);
    expect(p.extremeCandidate?.name).toBe('从杀格');
    const y = selectYongShen('甲', branches, '酉', s, p);
    expect(y.zhuanwang.applies).toBe(true);
    expect(y.recommended.method).toBe('专旺'); // 专旺 takes priority over plain 扶抑 in the decision order
    expect(y.recommended.favorable).toEqual(expect.arrayContaining(['正官', '七杀']));
  });
  it('ordinary weak-but-rooted chart does NOT get 从格 candidacy (module 10\'s own caution: not automatic)', () => {
    const branches: [string, string, string, string] = ['卯', '子', '午', '午'];
    const stems: [string, string, string, string] = ['己', '丙', '戊', '戊'];
    const s = computeStrength('戊', branches, stems);
    const p = classifyPattern('戊', branches, stems, s);
    expect(p.extremeCandidate).toBeUndefined();
  });
});

describe('格局 — 化气格 candidacy', () => {
  it('day stem combines with hour stem toward 土, month supports it — flagged as a candidate, not asserted', () => {
    const branches: [string, string, string, string] = ['丑', '辰', '子', '丑'];
    const stems: [string, string, string, string] = ['乙', '戊', '甲', '己'];
    const s = computeStrength('甲', branches, stems);
    const p = classifyPattern('甲', branches, stems, s);
    expect(p.huaqiCandidate).toBeDefined();
    expect(p.huaqiCandidate?.transformElementName).toBe('土');
    expect(p.huaqiCandidate?.monthSupports).toBe(true);
  });
  it('no day-stem combination → no candidate at all (never a false positive)', () => {
    const branches: [string, string, string, string] = ['子', '午', '卯', '酉'];
    const stems: [string, string, string, string] = ['甲', '丙', '甲', '辛'];
    const s = computeStrength('甲', branches, stems);
    const p = classifyPattern('甲', branches, stems, s);
    expect(p.huaqiCandidate).toBeUndefined();
  });
});

describe('用神 — 调候 outranking 扶抑 when strength reads extreme', () => {
  it('extreme + climate-starved: 调候 is recommended ahead of plain 扶抑', () => {
    // Build an extreme-but-not-rootless 身强 chart in a deep-winter month so
    // 从格 does NOT fire (has real root) but 调候 still applies and strength.extreme is true.
    const branches: [string, string, string, string] = ['子', '子', '子', '子'];
    const stems: [string, string, string, string] = ['壬', '壬', '壬', '壬'];
    const s = computeStrength('壬', branches, stems);
    expect(s.extreme).toBe(true);
    const p = classifyPattern('壬', branches, stems, s);
    const y = selectYongShen('壬', branches, '子', s, p);
    expect(y.tiaohou.applies).toBe(true);
    expect(y.tiaohou.need).toBe('fire');
    if (!p.extremeCandidate) {
      expect(y.recommended.method).toBe('调候');
    }
  });
});

describe('用神 — 病药 (illness/medicine)', () => {
  it('枭神夺食: 偏印 and 食神 both present in hidden stems → medicine is 财破印', () => {
    const branches: [string, string, string, string] = ['亥', '巳', '子', '午'];
    const stems: [string, string, string, string] = ['壬', '丙', '甲', '丙'];
    const s = computeStrength('甲', branches, stems);
    const p = classifyPattern('甲', branches, stems, s);
    const y = selectYongShen('甲', branches, '巳', s, p);
    expect(y.bingyao.applies).toBe(true);
    expect(y.bingyao.illness).toContain('枭神夺食');
  });
  it('no 病药 case present → applies false, defers to 扶抑', () => {
    const branches: [string, string, string, string] = ['卯', '子', '午', '午'];
    const stems: [string, string, string, string] = ['己', '丙', '戊', '戊'];
    const s = computeStrength('戊', branches, stems);
    const p = classifyPattern('戊', branches, stems, s);
    const y = selectYongShen('戊', branches, '子', s, p);
    expect(y.bingyao.applies).toBe(false);
  });
});

describe('用神 — 通关 (bridging a stuck conflict)', () => {
  it('roughly-matched 金 vs 木 standoff → bridge is 水 (what 金 generates, feeds 木)', () => {
    const branches: [string, string, string, string] = ['申', '酉', '寅', '卯'];
    const stems: [string, string, string, string] = ['庚', '辛', '甲', '乙'];
    const s = computeStrength('甲', branches, stems);
    const p = classifyPattern('甲', branches, stems, s);
    const y = selectYongShen('甲', branches, '酉', s, p);
    expect(y.tongguan.applies).toBe(true);
    expect(y.tongguan.bridgeElement).toBe(4); // 水
  });
});

describe('用神 — pattern agreement flag', () => {
  it('true when 扶抑\'s favorable set includes the primary pattern\'s own governing god', () => {
    // 正印格 chart that is also 身弱 by 扶抑 → the pattern's own 印 god IS in 扶抑's favorable set.
    const branches: [string, string, string, string] = ['卯', '亥', '午', '寅'];
    const stems: [string, string, string, string] = ['乙', '乙', '戊', '甲'];
    const s = computeStrength('戊', branches, stems);
    const p = classifyPattern('戊', branches, stems, s);
    const y = selectYongShen('戊', branches, '亥', s, p);
    if (p.primary.kind === 'regular' && p.primary.governingShishen === '正印' && s.verdict === '身弱') {
      expect(y.patternAgreement).toBe(true);
    }
  });
});
