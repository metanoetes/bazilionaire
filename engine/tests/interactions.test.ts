import { describe, expect, it } from 'vitest';
import { branchInteraction, tiaohouNeed, isChongKong } from '../src/interactions.js';
import { liunian } from '../src/liunian.js';
import { hehun } from '../src/hehun.js';

describe('六合 pairs', () => {
  it('子丑合, 寅亥合, 巳申合', () => {
    expect(branchInteraction('子', '丑')?.type).toBe('六合');
    expect(branchInteraction('寅', '亥')?.type).toBe('六合');
    expect(branchInteraction('巳', '申')?.type).toBe('六合');
  });
  it('non-pairs return null', () => {
    expect(branchInteraction('子', '寅')).toBeNull();
  });
});

describe('冲 (180° opposition)', () => {
  it('子午冲, 巳亥冲', () => {
    expect(branchInteraction('子', '午')?.type).toBe('冲');
    expect(branchInteraction('巳', '亥')?.type).toBe('冲');
  });
});

describe('三刑 geometry — 90° legs, NOT 120° (corpus doctrine)', () => {
  it('丑戌刑 and 戌未刑 are legs; 丑未 inside 丑戌未 is 冲, NOT 刑', () => {
    expect(branchInteraction('丑', '戌')?.type).toBe('刑');
    expect(branchInteraction('戌', '未')?.type).toBe('刑');
    expect(branchInteraction('丑', '未')?.type).toBe('冲');
  });
  it('寅巳刑 and 巳申刑(also 六合); 寅申 is 冲', () => {
    expect(branchInteraction('寅', '巳')?.type).toBe('刑');
    expect(branchInteraction('巳', '申')?.type).toBe('六合'); // 合 precedes 刑 — 巳申合 seals
    expect(branchInteraction('寅', '申')?.type).toBe('冲');
  });
  it('the 120° pairs are 三合, never 刑', () => {
    expect(branchInteraction('申', '辰')?.type).toBe('半合');
    expect(branchInteraction('寅', '戌')?.type).toBe('半合');
  });
});

describe('害', () => {
  it('丑午害, 子未害', () => {
    expect(branchInteraction('丑', '午')?.type).toBe('害');
    expect(branchInteraction('子', '未')?.type).toBe('害');
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
    // 空亡 戌亥 (甲子旬): 午 clash strikes... 辰戌冲 strikes 戌 (voided)
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
