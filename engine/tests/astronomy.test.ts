import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { eotMinutes, julianTT, julianUT, solarOffsetMinutes, solarTermUTC } from '../src/astronomy.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const expected = JSON.parse(readFileSync(join(root, 'fixtures', 'expected.json'), 'utf-8')) as Record<
  string,
  {
    input: { datetime: [number, number, number, number, number]; location: { lon: number; tzHours: number } };
    astronomy: {
      eotMin: number;
      solarOffsetMin: number;
      terms: Record<string, Record<string, string>>;
    };
  }
>;

const TERM_TOLERANCE_SEC = 120;
const EOT_TOLERANCE_MIN = 0.5;

const TERM_DEG: Record<string, number> = {
  小寒: 285, 大寒: 300, 立春: 315, 雨水: 330, 惊蛰: 345, 春分: 0,
  清明: 15, 谷雨: 30, 立夏: 45, 小满: 60, 芒种: 75, 夏至: 90,
  小暑: 105, 大暑: 120, 立秋: 135, 处暑: 150, 白露: 165, 秋分: 180,
  寒露: 195, 霜降: 210, 立冬: 225, 小雪: 240, 大雪: 255, 冬至: 270,
};

function isoToSec(iso: string): number {
  const [date, time] = iso.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi, s] = time.replace('Z', '').split(':').map(Number);
  return Date.UTC(y, m - 1, d, h, mi, s) / 1000;
}

describe('solar terms — TS VSOP87 vs skyfield oracle (±120 s)', () => {
  for (const [name, exp] of Object.entries(expected)) {
    for (const [yearStr, terms] of Object.entries(exp.astronomy.terms)) {
      const year = Number(yearStr);
      for (const [termName, iso] of Object.entries(terms)) {
        it(`${name} ${year} ${termName}`, () => {
          const deg = TERM_DEG[termName];
          const got = solarTermUTC(year, deg);
          expect(Math.abs(isoToSec(got) - isoToSec(iso))).toBeLessThanOrEqual(TERM_TOLERANCE_SEC);
        });
      }
    }
  }
});

describe('equation of time — TS vs skyfield oracle (±30 s)', () => {
  for (const [name, exp] of Object.entries(expected)) {
    it(`${name} EoT`, () => {
      const [y, m, d, h, mi] = exp.input.datetime;
      const tt = julianTT(julianUT(y, m, d, h, mi));
      const got = eotMinutes(tt);
      expect(Math.abs(got - exp.astronomy.eotMin)).toBeLessThanOrEqual(EOT_TOLERANCE_MIN);
    });
    it(`${name} solar offset`, () => {
      const [y, m, d, h, mi] = exp.input.datetime;
      const { lon, tzHours } = exp.input.location;
      const tt = julianTT(julianUT(y, m, d, h, mi));
      const got = solarOffsetMinutes(tt, { lonDeg: lon, tzHours });
      expect(Math.abs(got - exp.astronomy.solarOffsetMin)).toBeLessThanOrEqual(EOT_TOLERANCE_MIN);
    });
  }
});

describe('published anchors (from the bazi-charting corpus)', () => {
  it('小寒 1992 ≈ 1992-01-06T02:08:30Z (±120 s)', () => {
    const got = solarTermUTC(1992, 285);
    expect(Math.abs(isoToSec(got) - isoToSec('1992-01-06T02:08:30Z'))).toBeLessThanOrEqual(120);
  });
  it('立春 1992 ≈ 1992-02-04T13:48:16Z (±120 s)', () => {
    const got = solarTermUTC(1992, 315);
    expect(Math.abs(isoToSec(got) - isoToSec('1992-02-04T13:48:16Z'))).toBeLessThanOrEqual(120);
  });
  it('Houston 1992-01-24 10:00 CST → true solar 9:26.6 (±30 s)', () => {
    // 10:00 CST = 16:00 UTC; solar = clock + EoT + 4·(lon − 15·tz)
    const tt = julianTT(julianUT(1992, 1, 24, 16, 0));
    const solarMin = 10 * 60 + eotMinutes(tt) + 4 * (-95.36 + 90);
    expect(Math.abs(solarMin - (9 * 60 + 26.6))).toBeLessThanOrEqual(0.5);
  });
});
