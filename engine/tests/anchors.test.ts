import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeChart } from '../src/index.js';
import { solarTermUTC } from '../src/astronomy.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const expected = JSON.parse(readFileSync(join(root, 'fixtures', 'expected.json'), 'utf-8')) as Record<
  string,
  {
    input: { datetime: [number, number, number, number, number]; location: { lon: number; tzHours: number } };
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
    it(`${name} (${exp.input.datetime.slice(0, 3).join('-')})`, () => {
      const chart = computeChart(...exp.input.datetime, {
        lonDeg: exp.input.location.lon,
        tzHours: exp.input.location.tzHours,
      });
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
  it('flags birth within ±1 min of 立春 (at the computed local boundary, Beijing)', () => {
    const lichun = solarTermUTC(2024, 315); // UTC ISO of TS's own boundary
    const local = new Date(lichun);
    local.setUTCHours(local.getUTCHours() + 8); // to Beijing local wall-clock
    const birth = computeChart(
      local.getUTCFullYear(),
      local.getUTCMonth() + 1,
      local.getUTCDate(),
      local.getUTCHours(),
      local.getUTCMinutes(),
      { lonDeg: 116.391, tzHours: 8 },
    );
    expect(birth.warnings).toContain(
      'year: birth within ±1 min of 立春 — pillars may split across schools',
    );
  });
  it('does not flag mid-segment dates', () => {
    expect(computeChart(2024, 2, 10).warnings).toHaveLength(0);
  });
  it('2000-01-01 year pillar is 己卯 (pre-立春, exact boundary logic)', () => {
    expect(computeChart(2000, 1, 1).year).toBe('己卯');
  });
});
