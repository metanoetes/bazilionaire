/**
 * PHASE 2 — the tutor layer. A model rephrases the fact sheet; it is never a
 * source of facts.
 *
 * Everything here is pure except `runTutor`, so the security-critical parts are
 * testable offline and gated in CI (scripts/check-tutor.ts):
 *
 *   tutorPayload()   builds exactly what will leave the browser
 *   redactFacts()    the minimization rule, applied BEFORE the payload exists
 *   auditTutorText() grades what came back: citations, unknown ids, fence hits
 *   runTutor()       the single fetch, to an OpenAI-compatible /chat/completions
 *
 * WHAT LEAVES: fact lines only. Never the birth date, time, minute, city,
 * longitude, or timezone — those are not in the fact sheet to begin with, and
 * the gate asserts it for pinned charts in both modes.
 *
 * WHAT MINIMIZATION CAN AND CANNOT DO (stated honestly, because the UI repeats
 * it to the reader): stripping F-EIGHT, the true-solar-time detail, the engine
 * warnings and every calendar year removes the literal birth moment. It does
 * NOT make the sheet unlinkable — 星运 and the root facts still name all four
 * branches, which narrows a birth date to a set of candidates recurring across
 * years. A reader who needs that gone should point the endpoint at a local
 * model, which is why localhost presets are first-class here.
 *
 * The key is the reader's own, is never logged, never stored by default beyond
 * the tab, and goes nowhere except the endpoint they typed.
 */
import type { Fact } from './factsheet';
import type { Movement } from './reading';
import { FENCE_PATTERNS } from './reading';

/**
 * Facts dropped outright when minimizing, and the reason each one is a leak:
 *   F-EIGHT     the pillar list itself
 *   F-ZODIAC    the year animal is the birth year mod 12
 *   F-TONE-*    a 纳音 name maps 1:1 to two ganzhi, so four tones ≈ four pillars
 *   F-SANHE-*   a 三合 group names three branches outright
 *   F-WARN-*    boundary warnings quote 节 times
 */
const SENSITIVE_IDS = new Set(['F-EIGHT', 'F-ZODIAC']);
const SENSITIVE_PREFIXES = ['F-WARN-', 'F-TONE-', 'F-SANHE-'];

/**
 * Every 天干 and 地支 character. Minimization removes ALL of them.
 *
 * This is the fix for the review finding that broke the previous design: the old
 * rule dropped only the F-EIGHT *line*, and a reviewer reconstructed the complete
 * 八字 byte-for-byte from what remained — F-DAYMASTER gave the day stem, F-DESHI's
 * detail gave the other three stems verbatim ("year 己 正财 · month 癸 正印 · hour 庚
 * 七杀"), and the four F-XINGYUN-* values gave all four branches ("甲 in 丑" …).
 * Dropping one formatted string while leaving the same information in five other
 * fields is not minimization; it is a claim of minimization.
 *
 * What survives is the structure a tutor actually needs: 十神, stages, pattern,
 * strength, relation TYPES, subscores, the day master's element and polarity.
 * What does not survive is any concrete 干支 — and the gate asserts exactly that,
 * so this cannot regress into a formatting check again.
 */
const GANZHI_CHARS = /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g;

const YEAR_RE = /\b(1[6-9]\d{2}|20\d{2}|21\d{2})\b/g;
// Signed/offset forms too (+05:30, -8:00): a timezone-shaped string is as
// birth-identifying as a wall clock. Review finding, 2026-08-27.
const CLOCK_RE = /[+-]?\b\d{1,2}:\d{2}\b/g;
/** 起运 offsets ("7y 11m 20d after birth") measure FROM the birth instant: with
 *  the month branch in hand they narrow a birth date to within days, so they are
 *  birth data for minimization purposes even though they carry no calendar. */
const OFFSET_RE = /\b\d+\s*y\s*\d+\s*m\s*\d+\s*d\b/gi;

/** Scrub calendar years, clock times, birth-relative offsets, and every 干支. */
function scrub(s: string | undefined): string | undefined {
  if (s === undefined) return undefined;
  return s
    .replace(YEAR_RE, 'a year')
    .replace(CLOCK_RE, 'a time')
    .replace(OFFSET_RE, 'an offset')
    .replace(/\ban offset after birth\b/gi, 'some way after birth')
    // Placeholder is '⋯', deliberately NOT '·': facts use ' · ' as a field
    // separator (F-DESHI's "year 庚 劫财 · month 癸 食神"), and the checker splits
    // on it to scope a claim to one seat. Redacting to '·' merged the placeholder
    // with the separator and silently emptied those segments, which made a wrong
    // stage claim look merely ungrounded instead of contradicting its own fact.
    .replace(GANZHI_CHARS, '⋯')
    .replace(/⋯+/g, '⋯')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * The minimization rule. Returns a NEW fact list; never mutates the input.
 * Applied before the payload is built, so no un-redacted copy exists downstream.
 *
 * Fail-SAFE, not whitelist: after dropping the birth-moment facts, every
 * remaining field — label included — is scrubbed of years and clock times. The
 * first version whitelisted which ids to scrub and leaked immediately, because
 * F-DECADE-NOW carries the year in its LABEL ("decade covering 2026"), not just
 * its value. A new fact that happens to carry a year is now redacted by default
 * instead of silently escaping.
 */
export function redactFacts(facts: Fact[]): Fact[] {
  const out: Fact[] = [];
  for (const f of facts) {
    if (SENSITIVE_IDS.has(f.id)) continue;
    if (SENSITIVE_PREFIXES.some((p) => f.id.startsWith(p))) continue;
    const value = scrub(f.value) as string;
    const detail = scrub(f.detail);
    // A fact whose whole value WAS a 干支 (F-DAYMASTER is the day stem) would
    // scrub down to a bare '·'. Fall back to its detail, which carries the
    // element and polarity — the part a tutor can actually teach from.
    const usable = value.replace(/[⋯\s]/g, '').length > 0;
    if (!usable && !detail) continue;
    out.push({
      ...f,
      label: scrub(f.label) as string,
      value: usable ? value : (detail as string),
      detail: usable ? detail : undefined,
    });
  }
  return out;
}

/** One line per fact — the exact text that goes over the wire, shown in the UI first. */
export function factLines(facts: Fact[]): string[] {
  return facts.map(
    (f) => `${f.id} | ${f.term ?? '-'} | ${f.label} = ${f.value}${f.detail ? ` | ${f.detail}` : ''}`,
  );
}

export const TUTOR_SYSTEM_PROMPT = [
  'You are a tutor inside Bazilionaire, a Bazi (八字) learning center. You are not an oracle and not a fortune teller.',
  '',
  'You receive a FACT SHEET: computed facts about one chart, each with an id such as F-DELING. An engine computed them; a template has already written a literal reading. Your only job is to say the same things in clearer English, so a beginner understands what the doctrine terms mean.',
  '',
  'HARD RULES:',
  '1. End every sentence with the id(s) of the fact(s) it came from, in square brackets: [F-DELING] or [F-ROOT-1][F-DEDI]. Use only ids that appear in the fact sheet. Never invent an id.',
  '2. If something is not in the fact sheet, do not say it. No extra doctrine, no 神煞, no numbers you were not given.',
  '3. Describe structure; never apply it. No predictions, no advice, no outcomes. Nothing about money, career, health, marriage, children, death, lawsuits, or the timing of events.',
  '4. Never use the second-person future. "You will", "you\'ll", "this year brings" are forbidden. Write "this chart", "the structure", "the tradition reads this as".',
  '5. No fortune vocabulary: lucky, unlucky, fortunate, auspicious, blessed, cursed, destined, guaranteed.',
  '6. Imagery is welcome only when it is the tradition\'s own — the 纳音 tone images, the 十二长生 stage names, the seasonal states you were given. Do not invent mystical imagery.',
  '7. Keep each section to one short paragraph, at most 60 words. Plain English. Keep Chinese terms and give the pinyin on first use.',
  '8. If the sheet is thin on a section, say so plainly instead of filling.',
  '',
  'You are the third voice in a chain: the engine computed, the template wrote, you clarify. The reader\'s own discernment is the last word, and nothing you write carries authority over it.',
].join('\n');

export interface TutorPayload {
  system: string;
  user: string;
  /** Ids the model is allowed to cite — the audit rejects anything else. */
  allowedIds: string[];
  /** The redacted fact lines, exactly as sent, for the disclosure gate to display. */
  lines: string[];
  minimized: boolean;
  /**
   * The facts as sent (post-redaction). Phase 3's cross-check grades claims
   * against THIS, not the full sheet: a sentence must not be defensible by a
   * fact the model never received.
   */
  sent: Fact[];
}

export function tutorPayload(
  facts: Fact[],
  movements: Movement[],
  opts: { minimize: boolean },
): TutorPayload {
  // F-SCHOOL's detail ("clock time converted to 11:56 solar") pins the birth time
  // to the minute AND leaks the longitude offset from the timezone meridian, so it
  // never goes on the wire — in either mode. The school NAME is all a tutor needs.
  const base = facts.map((f) => (f.id === 'F-SCHOOL' ? { ...f, detail: undefined } : f));
  const sent = opts.minimize ? redactFacts(base) : base;
  const lines = factLines(sent);
  const sections = movements
    .filter((m) => m.cites.length > 0) // the closing clause is not the model's to rewrite
    .map((m) => `- ${m.zh} ${m.pinyin} — ${m.title}`);

  const user = [
    'FACT SHEET (the only material you may use):',
    ...lines,
    '',
    'SECTIONS — write one short paragraph for each, in this order:',
    ...sections,
    '',
    'Remember: every sentence ends with its [F-ID] citation, and the closing clause of the reading is not yours to write.',
  ].join('\n');

  return {
    system: TUTOR_SYSTEM_PROMPT,
    user,
    allowedIds: sent.map((f) => f.id),
    lines,
    minimized: opts.minimize,
    sent,
  };
}

export interface TutorSentence {
  text: string;
  /** Valid fact ids cited by this sentence. */
  cites: string[];
  /** Ids the model cited that are not in the fact sheet — fabricated citations. */
  unknownCites: string[];
  /** Fence violations found in this sentence. */
  fenceHits: string[];
  /** True only when the sentence cites at least one real fact and breaks no rule. */
  ok: boolean;
}

export interface TutorAudit {
  sentences: TutorSentence[];
  /** Sentences with no citation at all. */
  unanchored: number;
  /** Sentences citing an id that does not exist. */
  fabricated: number;
  /** Sentences that hit the editorial fence. */
  violations: number;
}

const CITE_RE = /\[(F-[A-Z0-9-]+)\]/g;

/**
 * Grade model output. Nothing is silently dropped: every sentence comes back
 * with its verdict so the UI can show a flagged sentence AS flagged, which is
 * the whole point — an unanchored fluent sentence is exactly the failure mode
 * this layer exists to make visible.
 */
export function auditTutorText(text: string, allowedIds: string[]): TutorAudit {
  const allowed = new Set(allowedIds);
  // Split AFTER the citation tags, not just after the period.
  //
  // The system prompt tells the model to end each sentence with [F-ID], which
  // means the text is "… . [F-DELING] Next sentence. [F-STRENGTH]" — and a plain
  // sentence splitter never fires there, because what follows the period is '['
  // rather than a capital letter. A reviewer demonstrated the consequence: a whole
  // paragraph collapsed into ONE audit unit, so an uncited advice sentence riding
  // behind a cited one got no UNCITED badge, and a false stage claim that verifies
  // as 'contradicted' on its own verified as 'ok' merged. The layer's entire job is
  // per-sentence accountability, so the tag boundary has to be a split boundary.
  const raw = text
    .split(/\n+/)
    .flatMap((para) => para.split(/(?<=\])\s+(?=\S)/)) // after a citation tag
    .flatMap((seg) => seg.split(/(?<=[.!?])\s+(?=[A-Z“"(\u4e00-\u9fff])/)) // plain sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentences: TutorSentence[] = raw.map((s) => {
    const cites: string[] = [];
    const unknownCites: string[] = [];
    for (const m of s.matchAll(CITE_RE)) {
      if (allowed.has(m[1])) cites.push(m[1]);
      else unknownCites.push(m[1]);
    }
    const fenceHits: string[] = [];
    for (const re of FENCE_PATTERNS) {
      const hit = s.match(re);
      if (hit) fenceHits.push(hit[0]);
    }
    return {
      text: s,
      cites,
      unknownCites,
      fenceHits,
      ok: cites.length > 0 && unknownCites.length === 0 && fenceHits.length === 0,
    };
  });

  return {
    sentences,
    unanchored: sentences.filter((s) => s.cites.length === 0 && s.unknownCites.length === 0).length,
    fabricated: sentences.filter((s) => s.unknownCites.length > 0).length,
    violations: sentences.filter((s) => s.fenceHits.length > 0).length,
  };
}

export interface TutorConfig {
  /** OpenAI-compatible base URL, e.g. https://api.openai.com/v1 or http://localhost:11434/v1 */
  baseUrl: string;
  model: string;
  /** The reader's own key. Empty is valid — local servers usually need none. */
  apiKey: string;
}

/** Presets: the local ones come first, because they are the only leak-free path. */
export const TUTOR_PRESETS: Array<{ label: string; baseUrl: string; model: string; needsKey: boolean }> = [
  { label: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1', needsKey: false },
  { label: 'LM Studio (local)', baseUrl: 'http://localhost:1234/v1', model: 'local-model', needsKey: false },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', needsKey: true },
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', needsKey: true },
];

/** Host shown on the disclosure gate — never the full URL with a key in it. */
export function endpointHost(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

export function isLocalEndpoint(baseUrl: string): boolean {
  const host = endpointHost(baseUrl).split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local');
}

export class TutorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TutorError';
  }
}

/**
 * One non-streaming call. Errors carry status and provider message but NEVER
 * the key or the request body — an error string that echoes the payload would
 * defeat the point of the disclosure gate.
 */
/**
 * Is the endpoint a usable absolute http(s) URL? An empty or scheme-less value
 * ("localhost:11434") makes fetch resolve RELATIVE to the site's own origin, so
 * the whole fact sheet would be POSTed to bazilionaire.org — flatly contradicting
 * the disclosure gate's "no Bazilionaire server is involved; there isn't one."
 */
export function endpointProblem(baseUrl: string): string | null {
  const raw = baseUrl.trim();
  if (raw.length === 0) return 'Enter an endpoint URL.';
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return 'That is not a full URL — include http:// or https:// (e.g. http://localhost:11434/v1).';
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return `Only http:// and https:// endpoints are supported (got ${u.protocol}).`;
  }
  return null;
}

export async function runTutor(
  cfg: TutorConfig,
  payload: TutorPayload,
  signal?: AbortSignal,
): Promise<string> {
  const problem = endpointProblem(cfg.baseUrl);
  if (problem) throw new TutorError(problem);
  // A hung endpoint must not strand the caller: without a deadline the panel sat
  // in 'running' with its button disabled forever (review finding, 2026-08-27).
  const timeout = AbortSignal.timeout(120_000);
  const effectiveSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cfg.apiKey.trim().length > 0) headers.Authorization = `Bearer ${cfg.apiKey.trim()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      signal: effectiveSignal,
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.4,
        max_tokens: 900,
        messages: [
          { role: 'system', content: payload.system },
          { role: 'user', content: payload.user },
        ],
      }),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new TutorError(
        `${endpointHost(cfg.baseUrl)} did not answer within two minutes — the request was cancelled.`,
      );
    }
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new TutorError('Cancelled.');
    }
    throw new TutorError(
      `Could not reach ${endpointHost(cfg.baseUrl)}. ${
        isLocalEndpoint(cfg.baseUrl)
          ? 'Is the local server running, and does it allow browser requests from this origin (CORS)?'
          : 'Check the base URL, your network, and whether the provider allows browser requests (CORS).'
      }`,
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body?.error?.message ? ` — ${body.error.message}` : '';
    } catch {
      /* non-JSON error body */
    }
    throw new TutorError(`${endpointHost(cfg.baseUrl)} returned ${res.status}${detail}`);
  }

  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = body.choices?.[0]?.message?.content;
  if (!text || text.trim().length === 0) {
    throw new TutorError('The endpoint returned an empty completion.');
  }
  return text.trim();
}
