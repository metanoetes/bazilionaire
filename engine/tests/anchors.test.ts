import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeChart } from '../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const expected = JSON.parse(readFileSync(join(root, 'fixtures', 'expected.json'), 'utf-8')) as Record<
  string,
  {
    input: [number, number, number, number, number];
    year: string;
    month: string;
    day: string;
    time: string;
    nayin: string[];
    hideGan: string[][];
    zodiac: string;
  }
>;

describe('anchor chain — TS vs lunar_python oracle', () => {
  for (const [name, exp] of Object.entries(expected)) {
    it(`${name} (${exp.input.slice(0, 3).join('-')})`, () => {
      const chart = computeChart(...exp.input);
      expect(chart.year).toBe(exp.year);
      expect(chart.month).toBe(exp.month);
      expect(chart.day).toBe(exp.day);
      expect(chart.time).toBe(exp.time);
      expect(chart.nayin).toEqual(exp.nayin);
      expect(chart.hideGan).toEqual(exp.hideGan);
      expect(chart.zodiac).toBe(exp.zodiac);
    });
  }
});

describe('anchor chain — known published values', () => {
  it('1949-10-01 day pillar = 甲子', () => {
    expect(computeChart(1949, 10, 1).day).toBe('甲子');
  });
  it('2000-01-01 day pillar = 戊午', () => {
    expect(computeChart(2000, 1, 1).day).toBe('戊午');
  });
  it('2024-02-10 day pillar = 甲辰', () => {
    expect(computeChart(2024, 2, 10).day).toBe('甲辰');
  });
});

describe('boundary honesty', () => {
  it('flags the 立春 window', () => {
    expect(computeChart(2024, 2, 4).warnings).toContain(
      'year: 立春 boundary ±1 day — exact term time required',
    );
  });
  it('does not flag mid-segment dates', () => {
    expect(computeChart(2024, 2, 10).warnings).toHaveLength(0);
  });
});
