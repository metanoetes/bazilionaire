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
