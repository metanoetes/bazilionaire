import type { Chart } from '@bazilionaire/engine';

/**
 * Research record v2 — entry is consent.
 * Computing a chart IS agreeing to contribute it to the research commons:
 * the birth inputs you entered and everything the engine derived from them.
 * Queued locally until the commons endpoint ships; "clear my contributions"
 * stays as the exit door.
 */
export interface ResearchRecord {
  schema: 'bazilionaire.research.v2';
  birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    lon: number | null;
    tz: number | null;
    /** City name as picked (GeoNames name); null when no city was selected. */
    city: string | null;
    gender: 'male' | 'female';
    hourSchool: 'clock' | 'solar';
  };
  pillars: { year: string; month: string; day: string; time: string };
  shishenGan: [string, string, string, string];
  shishenZhi: [string[], string[], string[], string[]];
  hideGan: [string[], string[], string[], string[]];
  nayin: [string, string, string, string];
  dayXun: string;
  dayXunKong: string;
  zodiac: string;
  /** Full decade sequence with start ages/years (entry-as-consent: no leak to minimize). */
  dayun: Array<{ ganzhi: string; startAge: number; startYear: number }>;
  warnings: string[];
}

export function researchRecord(
  birth: ResearchRecord['birth'],
  chart: Chart,
): ResearchRecord {
  return {
    schema: 'bazilionaire.research.v2',
    birth,
    pillars: { year: chart.year, month: chart.month, day: chart.day, time: chart.time },
    shishenGan: chart.shishenGan,
    shishenZhi: chart.shishenZhi,
    hideGan: chart.hideGan,
    nayin: chart.nayin,
    dayXun: chart.dayXun,
    dayXunKong: chart.dayXunKong,
    zodiac: chart.zodiac,
    dayun: chart.yun?.dayun ?? [],
    warnings: chart.warnings,
  };
}

/**
 * What the commons actually receives, field by field — the SINGLE source for the
 * gate AND the reader-facing copy.
 *
 * Peter's call, 2026-08-27: **collect everything.** The raw record stays (birth
 * inputs plus every derived layer) because retroactive recomputation is the corpus's
 * real scientific asset — add 神煞 to the fact sheet in 2027 and the whole history
 * re-derives, instead of only collecting forward from that day.
 *
 * That decision is defensible, but only under one condition. The 2026-08-27 ruling
 * killed a project-hosted API key because it would make Bazilionaire the collector
 * *silently*; collecting openly is a different act. "Openly" cannot mean a sentence
 * on a page while the payload quietly grows — the tutor path earned its trust by
 * printing the literal lines it sends and asserting them in CI. So:
 *
 *   1. this list is the disclosure, in code, next to the record it describes;
 *   2. `scripts/check-commons.ts` asserts list ↔ payload in BOTH directions;
 *   3. /trust/research renders FROM this list.
 *
 * Copy therefore cannot drift thinner than the payload — there is only one list.
 * Add a field to `ResearchRecord` without adding it here and the build fails. That
 * is the entire point of the file.
 */
export interface DisclosedField {
  /** Leaf path in the record, arrays normalized to `[]` — e.g. `dayun[].startYear`. */
  path: string;
  /** Plain English, reader-facing. Rendered on /trust/research verbatim. */
  english: string;
  /**
   * True when the field participates in narrowing the birth moment. Measured, not
   * guessed (backend-storage session, ~263k-moment sweep): day stem alone leaves
   * ≈26,300 candidate moments, the day pillar 4,380, day+month 72, three pillars
   * **12** — the birth date is then unique — and four pillars **1**, the exact 2h
   * slot. The cliff is at three pillars, so the pillar fields are marked, and so is
   * anything that cross-validates them (纳音 is 1:1 with two ganzhi; 大运 start years
   * pin the birth year; a ±1-minute 节 warning pins the birth to the minute).
   */
  identifying?: boolean;
}

export const COMMONS_DISCLOSURE: DisclosedField[] = [
  { path: 'schema', english: 'which version of this record format was used' },

  { path: 'birth.year', english: 'the birth year you entered', identifying: true },
  { path: 'birth.month', english: 'the birth month you entered', identifying: true },
  { path: 'birth.day', english: 'the birth day you entered', identifying: true },
  { path: 'birth.hour', english: 'the birth hour you entered', identifying: true },
  { path: 'birth.minute', english: 'the birth minute you entered', identifying: true },
  { path: 'birth.city', english: 'the city you picked, by name', identifying: true },
  { path: 'birth.lon', english: "that city's longitude, used for 真太阳时", identifying: true },
  { path: 'birth.tz', english: 'the timezone offset used', identifying: true },
  { path: 'birth.gender', english: 'gender, which sets the direction the 大运 decades run', identifying: true },
  { path: 'birth.hourSchool', english: 'whether you chose clock time or 真太阳时' },

  { path: 'pillars.year', english: 'the year pillar', identifying: true },
  { path: 'pillars.month', english: 'the month pillar', identifying: true },
  { path: 'pillars.day', english: 'the day pillar', identifying: true },
  { path: 'pillars.time', english: 'the hour pillar', identifying: true },

  { path: 'shishenGan[]', english: 'the 十神 of each pillar’s visible stem' },
  { path: 'shishenZhi[][]', english: 'the 十神 of every stem hidden inside each branch' },
  { path: 'hideGan[][]', english: 'the 藏干 — hidden stems inside each branch', identifying: true },
  { path: 'nayin[]', english: 'the 纳音 element-tone of each pillar', identifying: true },

  { path: 'dayXun', english: 'the ten-day 旬 the birth day falls in', identifying: true },
  { path: 'dayXunKong', english: 'the 空亡 pair that 旬 leaves empty' },
  { path: 'zodiac', english: 'the birth-year animal', identifying: true },

  { path: 'dayun[].ganzhi', english: 'each 大运 decade, in order' },
  { path: 'dayun[].startAge', english: 'the age each decade begins' },
  { path: 'dayun[].startYear', english: 'the calendar year each decade begins', identifying: true },

  { path: 'warnings[]', english: 'any engine warning about the chart — including a birth within ±1 minute of a 节, which pins the birth time to the minute', identifying: true },
];

/**
 * Every leaf path in a value, with array indices normalized to `[]`, so a record
 * can be compared against COMMONS_DISCLOSURE structurally rather than by eye.
 * An empty array contributes no leaves — which is why the gate also compares the
 * top-level key sets (an always-empty new field would otherwise be invisible).
 */
export function leafPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    const out = new Set<string>();
    for (const item of value) {
      for (const p of leafPaths(item, `${prefix}[]`)) out.add(p);
    }
    return [...out];
  }
  if (value !== null && typeof value === 'object') {
    const out: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out.push(...leafPaths(v, prefix ? `${prefix}.${k}` : k));
    }
    return out;
  }
  return [prefix];
}

export const QUEUE_KEY = 'bazilionaire.contributions.v2';

/**
 * Local contribution queue: every computed chart lands here until the commons
 * endpoint ships (Cloudflare Workers + D1). Nothing is transmitted today.
 * Returns false when the write failed (e.g. quota exceeded in private mode)
 * so callers can surface an honest "not saved" signal instead of the page
 * silently claiming the record is "held under covenant" when it wasn't.
 */
export function queueContribution(record: ResearchRecord): boolean {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: ResearchRecord[] = raw ? (JSON.parse(raw) as ResearchRecord[]) : [];
    queue.push(record);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    // storage unavailable or quota exceeded — contribution is dropped;
    // caller is responsible for telling the user.
    return false;
  }
}

export function queuedContributions(): ResearchRecord[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as ResearchRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearContributions(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    // nothing to clear
  }
}
