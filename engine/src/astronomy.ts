/**
 * Solar astronomy for Bazi computation — TypeScript port of the skyfield
 * oracle in oracle/run_oracle.py. Client-side, no network, deterministic.
 *
 * Precision targets (pinned by fixtures/expected.json):
 *   solar-term times: ±120 s vs skyfield+DE421
 *   equation of time: ±30 s
 *
 * Components:
 *   - VSOP87D Earth heliocentric longitude (of date), truncated at 1e-9 rad
 *   - Meeus low-precision nutation (~0.5") and IAU 2006 obliquity
 *   - Meeus low-precision equation of center (identical formula to oracle)
 *   - Morrison–Stephenson ΔT (Espenak–Meeus piecewise polynomials)
 *   - Aberration −20.4898"
 */
import { EARTH_LONGITUDE_TERMS } from './vsop87-earth-l.js';
import { jdn } from './julian.js';

const DEG = Math.PI / 180;
const ARCSEC = DEG / 3600;
const J2000 = 2451545.0;
const DAYS_PER_MILLENNIUM = 365250;
const DAYS_PER_CENTURY = 36525;
const ABERRATION_ARCSEC = 20.4898;
const TWO_PI = 2 * Math.PI;

export interface Location {
  lonDeg: number;
  tzHours: number;
}

export const SOLAR_TERM_DEG: Array<[number, string]> = [
  [285.0, '小寒'], [300.0, '大寒'], [315.0, '立春'], [330.0, '雨水'],
  [345.0, '惊蛰'], [0.0, '春分'], [15.0, '清明'], [30.0, '谷雨'],
  [45.0, '立夏'], [60.0, '小满'], [75.0, '芒种'], [90.0, '夏至'],
  [105.0, '小暑'], [120.0, '大暑'], [135.0, '立秋'], [150.0, '处暑'],
  [165.0, '白露'], [180.0, '秋分'], [195.0, '寒露'], [210.0, '霜降'],
  [225.0, '立冬'], [240.0, '小雪'], [255.0, '大雪'], [270.0, '冬至'],
];

function wrap(a: number): number {
  const r = a % TWO_PI;
  return r < 0 ? r + TWO_PI : r;
}

/** Signed angular difference a−b wrapped to (−π, π]. */
export function wrappedDiff(a: number, b: number): number {
  const r = (a - b) % TWO_PI;
  if (r > Math.PI) return r - TWO_PI;
  if (r <= -Math.PI) return r + TWO_PI;
  return r;
}

/** ΔT = TT − UT in seconds (Espenak–Meeus / Morrison–Stephenson polynomials). */
export function deltaTSec(year: number): number {
  if (year < 1941) year = 1941;
  if (year >= 2050) year = 2049.99;
  if (year < 1961) {
    const t = year - 1950;
    return 29.07 + 0.407 * t - 0.0019 * t * t;
  }
  if (year < 1986) {
    const t = year - 1975;
    return 45.45 + 1.067 * t - 0.0037 * t * t - 0.000019 * t * t * t;
  }
  if (year < 2005) {
    const t = year - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
      + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  const t = year - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t * t;
}

/** Julian date (UT) for a calendar instant. */
export function julianUT(y: number, m: number, d: number, h = 12, mi = 0): number {
  return jdn(y, m, d) - 0.5 + (h + mi / 60) / 24;
}

/** TT julian date from a UT julian date. */
export function julianTT(jdUT: number): number {
  const year = decimalYear(jdUT);
  return jdUT + deltaTSec(year) / 86400;
}

function decimalYear(jdUT: number): number {
  const y = 2000 + (jdUT - J2000) / 365.2425;
  return y;
}

/** VSOP87D Earth heliocentric longitude of date, radians 0..2π. */
export function earthLongitude(jdTT: number): number {
  const tau = (jdTT - J2000) / DAYS_PER_MILLENNIUM;
  let L = 0;
  for (const [power, a, b, c] of EARTH_LONGITUDE_TERMS) {
    L += Math.pow(tau, power) * a * Math.cos(b + c * tau);
  }
  return wrap(L);
}

/** Meeus ch. 22 low-precision nutation, returns {dpsi, deps} in radians. */
export function nutation(jdTT: number): { dpsi: number; deps: number } {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  const omega = (125.04452 - 1934.136261 * T) * DEG;
  const ls = (280.4665 + 36000.7698 * T) * DEG;
  const lm = (218.3165 + 481267.8813 * T) * DEG;
  const dpsi = (-17.20 * Math.sin(omega) - 1.32 * Math.sin(2 * ls)
    - 0.23 * Math.sin(2 * lm) + 0.21 * Math.sin(2 * omega)) * ARCSEC;
  const deps = (9.20 * Math.cos(omega) + 0.57 * Math.cos(2 * ls)
    + 0.10 * Math.cos(2 * lm) - 0.09 * Math.cos(2 * omega)) * ARCSEC;
  return { dpsi, deps };
}

/** IAU 2006 mean obliquity, radians. */
export function meanObliquity(jdTT: number): number {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  const eps = 84381.406 - 46.836769 * T - 0.0001831 * T * T + 0.0020034 * T ** 3
    - 5.76e-7 * T ** 4 - 4.34e-8 * T ** 5;
  return eps * ARCSEC;
}

/** Meeus ch. 25 low-precision equation of center, radians (matches the oracle). */
export function equationOfCenter(jdTT: number): number {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  const M = wrap((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  return C * DEG;
}

/**
 * Sun's APPARENT geocentric ecliptic longitude of date, radians 0..2π.
 * = VSOP87 Earth heliocentric + π (geocentric) + nutation − aberration.
 */
export function sunApparentLongitude(jdTT: number): number {
  const L = wrap(earthLongitude(jdTT) + Math.PI);
  const nut = nutation(jdTT);
  return wrap(L + nut.dpsi - ABERRATION_ARCSEC * ARCSEC);
}

/** Sun's apparent right ascension (of date), radians 0..2π. Solar latitude dropped (≤1.2″). */
export function sunApparentRA(jdTT: number): number {
  const lam = sunApparentLongitude(jdTT);
  const eps = meanObliquity(jdTT) + nutation(jdTT).deps;
  return wrap(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)));
}

/**
 * Equation of time in minutes: apparent solar time − mean solar time.
 * Identical definition to the oracle: E = 4 × (L0 − α), L0 = mean longitude
 * (apparent λ − equation of center − aberration), α = apparent RA.
 */
export function eotMinutes(jdTT: number): number {
  const lamApp = sunApparentLongitude(jdTT);
  const ra = sunApparentRA(jdTT);
  const L0 = wrap(lamApp - equationOfCenter(jdTT) - ABERRATION_ARCSEC * ARCSEC);
  const eDeg = wrappedDiff(L0, ra) / DEG;
  return 4 * eDeg;
}

/** True-solar-time offset vs clock: EoT + 4·(lonDeg − 15·tzHours) minutes. */
export function solarOffsetMinutes(jdTT: number, loc: Location): number {
  return eotMinutes(jdTT) + 4 * (loc.lonDeg - 15 * loc.tzHours);
}

/**
 * UTC ISO string of the first crossing of `targetDeg` (apparent ecliptic
 * longitude) within `year`. Newton iteration on the unwrapped longitude
 * in TT, then TT → UT via ΔT. Matches the oracle's bisection to ~1 s.
 */
export function solarTermUTC(year: number, targetDeg: number): string {
  const jan1 = tsTTForCalendar(year, 1, 1, 0, 0);
  const base = sunApparentLongitude(jan1);
  const target = targetDeg * DEG + (targetDeg * DEG < base ? TWO_PI : 0);

  const unwrapped = (jd: number): number => {
    let v = sunApparentLongitude(jd);
    // The sun crosses 2π once per year; late-year dates land below `base`.
    // 1e-6 rad margin avoids re-adding at Jan 1 due to numerical noise.
    while (v < base - 1e-6) v += TWO_PI;
    return v;
  };

  // initial guess: 40 days + term's ordinal month segment
  const order = SOLAR_TERM_DEG.findIndex(([deg]) => deg === targetDeg);
  const guessDays = 15 + order * 15.22; // ~365.25/24
  let jd = tsTTForCalendar(year, 1, 1, 0, 0) + guessDays;
  for (let i = 0; i < 8; i++) {
    const f = unwrapped(jd) - target;
    const h = 0.001;
    const fp = (unwrapped(jd + h) - unwrapped(jd - h)) / (2 * h);
    const step = f / fp;
    jd -= step;
    if (Math.abs(step) < 1e-8) break;
  }
  const jdUT = jd - deltaTSec(decimalYear(jd)) / 86400;
  return isoFromJD(jdUT);
}

/** Solar-term instant in the local timezone (Bazi boundaries apply in local time). */
export function solarTermLocal(year: number, targetDeg: number, tzHours: number): number {
  const [y, mo, d, h, mi, s] = parseISO(solarTermUTC(year, targetDeg));
  return julianUT(y, mo, d, h, mi + s / 60) + tzHours / 24;
}

function tsTTForCalendar(y: number, m: number, d: number, h: number, mi: number): number {
  return julianTT(julianUT(y, m, d, h, mi));
}

function isoFromJD(jd: number): string {
  // Gregorian calendar from JD (Fliegel–Van Flandern)
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z; // fraction of day, [0, 1)
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const secTotal = Math.floor(F * 86400 + 0.5);
  const h = Math.floor(secTotal / 3600);
  const mi = Math.floor((secTotal % 3600) / 60);
  const s = secTotal % 60;
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(h)}:${pad(mi)}:${pad(s)}Z`;
}

function parseISO(iso: string): [number, number, number, number, number, number] {
  const [date, time] = iso.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi, s] = time.replace('Z', '').split(':').map(Number);
  return [y, m, d, h, mi, s];
}
