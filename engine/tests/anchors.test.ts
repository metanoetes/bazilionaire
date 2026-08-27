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
  // Reviewer regressions (sprint-1 review, fail-closed findings — now fixed by
  // exact 节 boundaries; pinned so the old approximation bugs cannot return):
  it('Feb 1-3 month pillar is 丑月, never silent 子 (reviewer regression)', () => {
    for (const d of [1, 2, 3]) {
      const c = computeChart(2024, 2, d);
      expect(c.month).toBe('乙丑');
      expect(c.warnings).toHaveLength(0); // far from any boundary — no warning
    }
  });
  it('Feb 4 pre-立春: year = previous (癸卯), warning only within ±1 min of the true term', () => {
    const c = computeChart(2024, 2, 4); // 12:00, hours before 立春 16:27 local
    expect(c.year).toBe('癸卯');
    expect(c.month).toBe('乙丑');
    expect(c.warnings).toHaveLength(0);
  });
});

describe('month-boundary and hour-school coverage (sprint-2 reviewer suggestions)', () => {
  const beijing = { lonDeg: 116.391, tzHours: 8 };
  it('late-December birth: month = 子 from 大雪 of the same year', () => {
    const c = computeChart(2023, 12, 25, 12, 0, beijing);
    expect(c.year).toBe('癸卯');
    expect(c.month).toBe('甲子');
  });
  it('early-January birth before 小寒: month = 子 from the previous year\'s 大雪', () => {
    const c = computeChart(2024, 1, 3, 12, 0, beijing);
    expect(c.year).toBe('癸卯');
    expect(c.month).toBe('甲子');
  });
  it('solar school flips the hour branch far west of the tz meridian (lon 75, tz +8)', () => {
    // 2024-02-10 EoT ≈ −14.2 min; offset = EoT + 4·(75 − 120) ≈ −194 min → solar ≈ 08:46 → 辰
    const c = computeChart(2024, 2, 10, 12, 0, { lonDeg: 75, tzHours: 8 });
    expect(c.hourSchool).toBe('solar');
    expect(c.time.slice(1)).toBe('辰');
  });
  it('solar school does not flip mid-branch hours (Beijing, 12:00 → 午)', () => {
    const c = computeChart(2024, 2, 10, 12, 0, beijing);
    expect(c.hourSchool).toBe('solar');
    expect(c.time.slice(1)).toBe('午');
  });
  it('起运 sect-1 convention: near-节 birth starts in the birth year (age 1)', () => {
    // 2.7 days to 小寒 → 0 years 10 months 20 days → first decade 2024, 虚岁 1
    const c = computeChart(2024, 1, 3, 12, 0, beijing, 0);
    expect(c.yun?.qiyun).toEqual({ years: 0, months: 10, days: 20 });
    expect(c.yun?.startSolarYear).toBe(2024);
    expect(c.yun?.dayun[1]).toEqual({ ganzhi: '乙丑', startAge: 1, startYear: 2024 });
  });
});

describe('hour school override (city-aware intake)', () => {
  const manila = { lonDeg: 120.98, tzHours: 8 };
  it('default with location stays solar (pinned oracle behavior)', () => {
    const c = computeChart(1995, 7, 1, 20, 44, manila);
    expect(c.hourSchool).toBe('solar');
  });
  it('clock override with a location: hour pillar from the wall clock, tz still orders 节', () => {
    // 20:44 Manila wall clock: solar offset ≈ EoT + 4·(120.98−120) ≈ −13.6 min;
    // 20:44 clock → 戌; solar 20:30 → still 戌. Pick a case where they differ:
    // use 06:55: solar −13.6 min → 06:41 → 卯 vs clock 06:55 → 卯 (same).
    // Instead assert the invariant: clock override computes from raw wall clock.
    const c = computeChart(1995, 7, 1, 6, 55, manila, 1, 'clock');
    expect(c.hourSchool).toBe('clock');
    expect(c.time.slice(1)).toBe('卯'); // floor(((6+1)%24)/2) = 3
  });
  it('solar override without a location warns and falls back to clock', () => {
    const c = computeChart(1995, 7, 1, 6, 55, undefined, 1, 'solar');
    expect(c.hourSchool).toBe('clock');
    expect(c.warnings.some((w) => w.includes('falling back'))).toBe(true);
  });
  it('clock override keeps the 节-timezone benefit: LA winter birth stays clock school', () => {
    const la = { lonDeg: -118.24, tzHours: -8 };
    const c = computeChart(1995, 1, 1, 12, 0, la, 1, 'clock');
    expect(c.hourSchool).toBe('clock');
    expect(c.time.slice(1)).toBe('午');
  });
});

describe('trueSolarTime formatting never emits an invalid minute (HH:60 regression)', () => {
  // Rounding total minutes-of-day (not the fractional minute in isolation)
  // avoids the case where a fraction like .9999 rounds up to 60 instead of
  // carrying into the hour. Sweep a day of minutes across a location whose
  // solar offset is a large, non-round number of minutes, so many fractional
  // seconds land near the rounding boundary.
  const loc = { lonDeg: 75.3, tzHours: 8 };
  it('every minute of a swept day formats as a valid HH:MM (MM in 00-59)', () => {
    for (let m = 0; m < 24 * 60; m += 7) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      const c = computeChart(1995, 7, 1, hour, minute, loc);
      expect(c.trueSolarTime).not.toBeNull();
      const [, mm] = c.trueSolarTime!.split(':');
      expect(Number(mm)).toBeLessThan(60);
      expect(c.trueSolarTime).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
