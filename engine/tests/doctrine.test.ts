import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeChart } from '../src/index.js';
import { LU, TIANYI, WENCHANG, YANGREN, YIMA_TARGET, TAOHUA_TARGET, HUAGAI_TARGET } from '../src/shensha.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const expected = JSON.parse(readFileSync(join(root, 'fixtures', 'expected.json'), 'utf-8')) as Record<
  string,
  {
    input: { datetime: [number, number, number, number, number]; gender?: 1 | 0; location: { lon: number; tzHours: number } };
    doctrine: {
      shishenGan: string[];
      shishenZhi: string[][];
      dayXun: string;
      dayXunKong: string;
      yun: { gender: number; start: number; startMonth: number; startDay: number; dayun: Array<{ ganzhi: string; startAge: number; startYear: number }> };
    };
  }
>;

describe('doctrine — TS vs lunar_python oracle', () => {
  for (const [name, exp] of Object.entries(expected)) {
    const [y, m, d, h, mi] = exp.input.datetime;
    const gender = exp.input.gender as 1 | 0 | undefined;

    it(`${name} 十神 gan`, () => {
      const chart = computeChart(y, m, d, h, mi, { lonDeg: exp.input.location.lon, tzHours: exp.input.location.tzHours }, gender);
      expect(chart.shishenGan).toEqual(exp.doctrine.shishenGan);
    });
    it(`${name} 十神 zhi`, () => {
      const chart = computeChart(y, m, d, h, mi, { lonDeg: exp.input.location.lon, tzHours: exp.input.location.tzHours }, gender);
      expect(chart.shishenZhi).toEqual(exp.doctrine.shishenZhi);
    });
    it(`${name} 空亡`, () => {
      const chart = computeChart(y, m, d, h, mi, { lonDeg: exp.input.location.lon, tzHours: exp.input.location.tzHours }, gender);
      expect(chart.dayXun).toBe(exp.doctrine.dayXun);
      expect(chart.dayXunKong).toBe(exp.doctrine.dayXunKong);
    });
    it(`${name} 大运 (first 6 decades)`, () => {
      const chart = computeChart(y, m, d, h, mi, { lonDeg: exp.input.location.lon, tzHours: exp.input.location.tzHours }, gender);
      expect(chart.yun).toBeDefined();
      const got = chart.yun!.dayun.slice(0, 6);
      const want = exp.doctrine.yun.dayun.slice(0, 6);
      for (let k = 0; k < want.length; k++) {
        expect(got[k].ganzhi).toBe(want[k].ganzhi);
        expect(got[k].startAge).toBe(want[k].startAge);
        expect(got[k].startYear).toBe(want[k].startYear);
      }
    });
  }
});

describe('神煞 doctrine tables (bazi-charting corpus conventions)', () => {
  it('禄: 甲→寅, 庚→申, 壬→亥', () => {
    expect(LU['甲']).toBe('寅'); expect(LU['庚']).toBe('申'); expect(LU['壬']).toBe('亥');
  });
  it('羊刃: 甲→卯, 庚→酉, 癸→亥', () => {
    expect(YANGREN['甲']).toBe('卯'); expect(YANGREN['庚']).toBe('酉'); expect(YANGREN['癸']).toBe('亥');
  });
  it('驿马: 寅午戌→申, 申子辰→寅, 巳酉丑→亥, 亥卯未→巳', () => {
    expect(YIMA_TARGET['寅午戌']).toBe('申'); expect(YIMA_TARGET['申子辰']).toBe('寅');
    expect(YIMA_TARGET['巳酉丑']).toBe('亥'); expect(YIMA_TARGET['亥卯未']).toBe('巳');
  });
  it('华盖: 寅午戌→戌, 亥卯未→未', () => {
    expect(HUAGAI_TARGET['寅午戌']).toBe('戌'); expect(HUAGAI_TARGET['亥卯未']).toBe('未');
  });
  it('桃花: 申子辰→酉, 巳酉丑→午', () => {
    expect(TAOHUA_TARGET['申子辰']).toBe('酉'); expect(TAOHUA_TARGET['巳酉丑']).toBe('午');
  });
  it('天乙贵人: 甲→丑未, 辛→午寅', () => {
    expect(TIANYI['甲']).toEqual(['丑', '未']); expect(TIANYI['辛']).toEqual(['午', '寅']);
  });
  it('文昌: 庚→亥, 壬→寅', () => {
    expect(WENCHANG['庚']).toBe('亥'); expect(WENCHANG['壬']).toBe('寅');
  });
});
