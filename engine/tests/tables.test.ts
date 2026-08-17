import { describe, expect, it } from 'vitest';
import {
  BRANCHES,
  HIDDEN_STEMS,
  HOUR_STEM_START,
  MONTH_STEM_START,
  NAYIN,
  STEMS,
  ZODIAC,
  ganzhiOf,
  yearGanzhiIndex,
} from '../src/index.js';

describe('sexagenary cycle', () => {
  it('has 10 stems and 12 branches', () => {
    expect(STEMS).toHaveLength(10);
    expect(BRANCHES).toHaveLength(12);
  });
  it('甲子 = 0, 癸亥 = 59', () => {
    expect(ganzhiOf(0).name).toBe('甲子');
    expect(ganzhiOf(59).name).toBe('癸亥');
  });
  it('1984 = 甲子', () => {
    expect(ganzhiOf(yearGanzhiIndex(1984)).name).toBe('甲子');
  });
  it('stem/branch parity always matches', () => {
    for (let i = 0; i < 60; i++) {
      const g = ganzhiOf(i);
      expect(STEMS.indexOf(g.stem) % 2).toBe(BRANCHES.indexOf(g.branch) % 2);
    }
  });
});

describe('static tables', () => {
  it('纳音 covers all 60 indices', () => {
    expect(NAYIN).toHaveLength(60);
  });
  it('藏干 covers all 12 branches', () => {
    for (const b of BRANCHES) expect(HIDDEN_STEMS[b]).toBeTruthy();
  });
  it('zodiac matches branch order', () => {
    expect(ZODIAC).toHaveLength(12);
  });
  it('五虎遁 spot checks', () => {
    expect(MONTH_STEM_START['甲']).toBe(2); // 丙
    expect(MONTH_STEM_START['戊']).toBe(0); // 甲
  });
  it('五鼠遁 spot checks', () => {
    expect(HOUR_STEM_START['甲']).toBe(0); // 甲
    expect(HOUR_STEM_START['戊']).toBe(8); // 壬
  });
});
