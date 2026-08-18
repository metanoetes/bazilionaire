import { describe, expect, it } from 'vitest';
import { branchInteraction, sanHeCompletion, tiaohouNeed, isChongKong } from '../src/interactions.js';
import { liunian } from '../src/liunian.js';
import { hehun } from '../src/hehun.js';

function types(a: string, b: string): string[] {
  return branchInteraction(a, b).map((i) => i.type);
}

describe('六合 pairs', () => {
  it('子丑合, 寅亥合', () => {
    expect(types('子', '丑')).toEqual(['六合']);
    expect(types('寅', '亥')).toEqual(['六合']);
  });
  it('non-pairs return an empty list', () => {
    expect(types('子', '寅')).toEqual([]);
  });
});

describe('冲 (180° opposition)', () => {
  it('子午冲, 巳亥冲', () => {
    expect(types('子', '午')).toEqual(['冲']);
    expect(types('巳', '亥')).toEqual(['冲']);
  });
});

describe('刑 — the full canonical set (11 pairs)', () => {
  it('无礼之刑: 子卯 both ways', () => {
    expect(types('子', '卯')).toEqual(['刑']);
    expect(types('卯', '子')).toEqual(['刑']);
  });
  it('恃势之刑 寅巳申: all three legs 刑, incl. the 冲 leg 寅申', () => {
    expect(types('寅', '巳')).toEqual(['刑', '害']); // 寅巳 is BOTH a 刑 leg and a 害 pair
    expect(types('巳', '申')).toEqual(['六合', '刑']); // 巳申 is BOTH 六合 and 刑
    expect(types('申', '寅')).toEqual(['冲', '刑']); // 寅申 is BOTH 冲 and 刑
  });
  it('无恩之刑 丑戌未: all three legs 刑, incl. the 冲 leg 丑未', () => {
    expect(types('丑', '戌')).toEqual(['刑']);
    expect(types('戌', '未')).toEqual(['刑']);
    expect(types('未', '丑')).toEqual(['冲', '刑']);
  });
  it('自刑: 辰午酉亥 self-pairs', () => {
    for (const z of ['辰', '午', '酉', '亥']) {
      expect(types(z, z)).toEqual(['刑']);
      expect(branchInteraction(z, z)[0].detail).toContain('自刑');
    }
  });
  it('non-自刑 self-pairs carry no relation (no 自临 mislabel)', () => {
    expect(types('寅', '寅')).toEqual([]);
    expect(types('子', '子')).toEqual([]);
  });
});

describe('半合 — adjacent legs only', () => {
  it('申子, 子辰, 亥卯, 卯未 are 半合', () => {
    expect(types('申', '子')).toEqual(['半合']);
    expect(types('子', '辰')).toEqual(['半合']);
    expect(types('亥', '卯')).toEqual(['半合']);
    expect(types('卯', '未')).toEqual(['半合']);
  });
  it('生墓 pairs 申辰/亥未/寅戌/巳丑 are NOT 半合', () => {
    expect(types('申', '辰')).toEqual([]);
    expect(types('亥', '未')).toEqual([]);
    expect(types('寅', '戌')).toEqual([]);
    expect(types('巳', '丑')).toEqual([]);
  });
});

describe('三合 completion (chart level, three branches)', () => {
  it('a branch completes the group when the natal chart holds the other two seats', () => {
    expect(sanHeCompletion('辰', ['申', '子', '午', '酉'])).toBe('申子辰');
    expect(sanHeCompletion('辰', ['申', '午', '酉', '戌'])).toBeNull();
    expect(sanHeCompletion('巳', ['酉', '丑', '子', '寅'])).toBe('巳酉丑');
    expect(sanHeCompletion('午', ['寅', '戌', '卯', '丑'])).toBe('寅午戌');
  });
  it('流年 emits a 三合 interaction on completion', () => {
    const natal = {
      dayStem: '己',
      branches: ['申', '子', '午', '酉'] as [string, string, string, string],
      monthBranch: '丑',
      dayXunKong: '辰巳',
    };
    const r = liunian(2024, natal); // 2024 = 甲辰; 辰 completes 申子辰
    expect(r.interactions.map((i) => i.type)).toContain('三合');
    expect(r.interactions.find((i) => i.type === '三合')?.detail).toContain('申子辰');
  });
});

describe('害', () => {
  it('丑午害, 子未害', () => {
    expect(types('丑', '午')).toEqual(['害']);
    expect(types('子', '未')).toEqual(['害']);
  });
});

describe('调候', () => {
  it('winter months need fire, summer need water, others null', () => {
    expect(tiaohouNeed('丑')).toBe('fire');
    expect(tiaohouNeed('午')).toBe('water');
    expect(tiaohouNeed('申')).toBeNull();
  });
});

describe('冲空则实', () => {
  it('a clash striking a voided branch fills it', () => {
    // 空亡 戌亥 (甲子旬): 辰戌冲 strikes 戌 (voided)
    expect(isChongKong('辰', '戌', '戌亥')).toBe(true);
    expect(isChongKong('辰', '戌', '子丑')).toBe(false);
  });
});

describe('流年', () => {
  it('2024 = 甲辰, 甲 vs 己土 day master = 正官', () => {
    const natal = {
      dayStem: '己',
      branches: ['酉', '戌', '卯', '子'] as [string, string, string, string],
      monthBranch: '丑',
      dayXunKong: '辰巳',
    };
    const r = liunian(2024, natal);
    expect(r.ganzhi).toBe('甲辰');
    expect(r.shishen).toBe('正官');
    expect(r.interactions.map((i) => i.type)).toEqual(expect.arrayContaining(['六合', '冲', '害', '半合']));
  });
  it('甲辰 year supplies fire? no — 辰 is earth; winter chart not fed by 辰', () => {
    const natal = {
      dayStem: '己',
      branches: ['未', '丑', '亥', '巳'] as [string, string, string, string],
      monthBranch: '丑',
      dayXunKong: '辰巳',
    };
    expect(liunian(2024, natal).tiaohouSupply).toBe(false);
  });
});

describe('合婚 layer 1 — marital stars (synthetic stems only)', () => {
  it('己土 male × 癸水 female: mutual 男财女官 (the corpus signature)', () => {
    const a = { dayStem: '己', branches: ['未', '丑', '亥', '巳'] as [string, string, string, string], monthBranch: '丑', dayXunKong: '辰巳', gender: 'male' as const };
    const b = { dayStem: '癸', branches: ['亥', '午', '巳', '戌'] as [string, string, string, string], monthBranch: '午', dayXunKong: '寅卯', gender: 'female' as const };
    const r = hehun(a, b);
    expect(r.bStemInA).toBe('偏财'); // 癸 = 己's 偏财 wife-star
    expect(r.aStemInB).toBe('七杀'); // 己 = 癸's 七杀 husband-star
    expect(r.mutualMaritalStars).toBe(true);
  });
  it('庚金 male × 甲木 female: mutual 偏财/七杀 (甲 is 庚之偏财; 庚 is 甲之七杀)', () => {
    const a = { dayStem: '庚', branches: ['子', '申', '辰', '午'] as [string, string, string, string], monthBranch: '申', dayXunKong: '午未', gender: 'male' as const };
    const b = { dayStem: '甲', branches: ['寅', '午', '戌', '子'] as [string, string, string, string], monthBranch: '寅', dayXunKong: '申酉', gender: 'female' as const };
    const r = hehun(a, b);
    expect(r.mutualMaritalStars).toBe(true);
  });
  it('甲木 male × 乙木 female: no marital-star link (比劫, not 财官)', () => {
    const a = { dayStem: '甲', branches: ['寅', '午', '戌', '子'] as [string, string, string, string], monthBranch: '寅', dayXunKong: '申酉', gender: 'male' as const };
    const b = { dayStem: '乙', branches: ['卯', '未', '亥', '丑'] as [string, string, string, string], monthBranch: '卯', dayXunKong: '子丑', gender: 'female' as const };
    const r = hehun(a, b);
    expect(r.mutualMaritalStars).toBe(false);
    expect(r.bStemInA).toBe('劫财');
  });
});
