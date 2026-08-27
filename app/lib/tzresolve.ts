/**
 * Historical-timezone resolution, fully client-side.
 *
 * A city gives an IANA zone name, not a fixed UTC offset — Los Angeles is
 * UTC−8 in winter and UTC−7 under daylight saving, and zone rules have
 * changed repeatedly across the birth-year range this app accepts (1940+).
 * The browser's Intl implementation carries the full IANA tzdb history, so
 * we resolve the offset AT THE BIRTH INSTANT instead of guessing a constant.
 */

/** Parse a packed city entry's tz into a wall-clock formatter cache. */
const fmtCache = new Map<string, Intl.DateTimeFormat>();

function hourCycleFormatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

/**
 * UTC offset (hours, may be fractional) of `tz` at the given LOCAL wall
 * date/time, e.g. tzOffsetHours('America/Los_Angeles', 1995, 7, 1, 12) = -7.
 *
 * Method: format the UTC instant shifted by a trial offset and compare the
 * rendered wall clock with the requested one (two passes converge — the
 * offset changes by at most 1 h between adjacent instants).
 */
export function tzOffsetHours(
  tz: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number | null {
  const wallMs = Date.UTC(year, month - 1, day, hour, minute);
  let guess = 0;
  for (let pass = 0; pass < 3; pass++) {
    let rendered: string;
    try {
      rendered = hourCycleFormatter(tz).format(new Date(wallMs - guess * 3600_000));
    } catch {
      return null; // unknown zone in this browser
    }
    // "MM/DD/YYYY, HH:mm" — extract fields
    const m = rendered.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, mm, dd, yyyy, hh, mi] = m;
    const h24 = hh === '24' ? 0 : Number(hh); // some engines render 24:00
    const shownMs = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), h24, Number(mi));
    const diffH = (wallMs - shownMs) / 3600_000;
    // if the guess is off by δ, the rendered clock is off by +δ → correct by −diff
    const next = Math.round((guess - diffH) * 4) / 4;
    if (next === guess) return next;
    guess = next;
  }
  return guess;
}
