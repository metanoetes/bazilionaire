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
