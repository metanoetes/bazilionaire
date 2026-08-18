/**
 * Julian Day Number for a Gregorian date (integer JDN at noon).
 * The day-pillar anchor: 2000-01-01 has JDN 2451545.
 */
export function jdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Day-pillar sexagenary index: (JDN + 49) mod 60, calibrated so
 * 2000-01-01 = 戊午 (index 54). Verified against the oracle anchor chain.
 */
export function dayPillarIndex(year: number, month: number, day: number): number {
  return (((jdn(year, month, day) + 49) % 60) + 60) % 60;
}

/** Inverse of jdn(): (year, month, day) for an integer JDN (Fliegel–Van Flandern). */
export function jdnToDate(j: number): { year: number; month: number; day: number } {
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}
