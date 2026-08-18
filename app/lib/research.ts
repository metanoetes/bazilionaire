import type { Chart } from '@bazilionaire/engine';

/**
 * Tier-0 research payload — the ONLY thing a contribution contains.
 * Derived features exclusively: pillars, relations, and computed tables.
 * NEVER: birth date/time/place, name, email, gender, or anything identifying.
 * The covenant: opt-in, pseudonymous (no identity fields exist to hash),
 * deletable (local queue only until the commons endpoint ships).
 */
export interface Tier0Payload {
  schema: 'bazilionaire.tier0.v1';
  year: string;
  month: string;
  day: string;
  time: string;
  shishenGan: [string, string, string, string];
  shishenZhi: [string[], string[], string[], string[]];
  hideGan: [string[], string[], string[], string[]];
  nayin: [string, string, string, string];
  dayXun: string;
  dayXunKong: string;
  zodiac: string;
  hourSchool: 'clock' | 'solar';
  /** Decade-pillar ganzhi SEQUENCE only — start years would leak the birth year. */
  dayun: string[];
}

export function tier0Payload(chart: Chart): Tier0Payload {
  return {
    schema: 'bazilionaire.tier0.v1',
    year: chart.year,
    month: chart.month,
    day: chart.day,
    time: chart.time,
    shishenGan: chart.shishenGan,
    shishenZhi: chart.shishenZhi,
    hideGan: chart.hideGan,
    nayin: chart.nayin,
    dayXun: chart.dayXun,
    dayXunKong: chart.dayXunKong,
    zodiac: chart.zodiac,
    hourSchool: chart.hourSchool,
    dayun: (chart.yun?.dayun ?? []).map((d) => d.ganzhi),
  };
}

const QUEUE_KEY = 'bazilionaire.contributions.v1';

/**
 * Local contribution queue: holds opt-in tier-0 payloads until the commons
 * endpoint ships (Cloudflare Workers + D1). Nothing is transmitted today.
 */
export function queueContribution(payload: Tier0Payload): void {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: Tier0Payload[] = raw ? (JSON.parse(raw) as Tier0Payload[]) : [];
    queue.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // storage unavailable (private mode) — contribution is silently dropped
  }
}

export function queuedContributions(): Tier0Payload[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Tier0Payload[]) : [];
  } catch {
    return [];
  }
}
