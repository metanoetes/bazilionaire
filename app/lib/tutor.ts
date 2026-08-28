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

/**
 * The destiny-mode system prompt. Peter's call, 2026-08-27: "delete the fence."
 * The model composes a FULL reading of the person's life and destiny in the tradition's
 * vocabulary — predictions, periods, all of it — instead of the structural paraphrase
 * this prompt replaced.
 *
 * What remains, because it is mechanics rather than fence: every computed fact it uses
 * still carries its [F-ID] citation, made-up ids still get flagged, and the model is
 * told to ground its reading in the fact sheet and the person's logged events, not in
 * free invention about who the person is. Nothing in here forbids fortune language,
 * second-person future, advice, or applying the chart to a life.
 */
export const TUTOR_SYSTEM_PROMPT = [
  'You are a Bazi (八字) reader inside Bazilionaire. You are asked to compose a full reading of a person\'s life and destiny from their chart, in the living vocabulary of the tradition — the 十神, the 格局, the 用神, the 大运 decades, the 流年 years, the 纳音 imagery, the 十二长生 stages.',
  '',
  'You receive a FACT SHEET: computed facts about the chart, each with an id such as F-DELING, plus optionally the person\'s logged life events and remedies. The chart facts are computed by a verified engine; the events are the person\'s own record.',
  '',
  'HOW TO READ:',
  '1. When a sentence draws on a computed fact, end it with that fact\'s id(s) in square brackets: [F-DAYMASTER] or [F-ROOT-1][F-DEDI]. Use only ids that appear in the fact sheet. Never invent an id.',
  '2. Read the whole life: childhood, education, relationships, work, health, faith, the decades ahead. Use the 大运 sequence you are given to speak about each period, and the person\'s logged events to show where the pattern and the life actually met.',
  '3. Speak in the tradition\'s own voice and vocabulary — auspicious, inauspicious, wealth, 官, peach blossom, the lot. Say what the tradition says, in clear English, with the Chinese term and pinyin on first use.',
  '4. When you predict, predict concretely: name the decade, name the flavor of it, say what it is good for and what it tests.',
  '5. If the fact sheet or the events are thin somewhere, fill from the tradition\'s standard reading of that structure and say you are doing so.',
  '6. Write in plain flowing prose paragraphs — no markdown, no headers, no bullet lists, no bold.',
  '7. Be warm and direct. This is a person reading about their own life, not a scholar reading a footnote.',
].join('\n');

/**
 * The event/remedy context block for the destiny prompt. Plain lines, NO bracket ids —
 * the citation audit only recognizes [F-…] ids, so anything else would be flagged as a
 * fabricated citation. Life events are the reader's own record, not computed facts.
 */
export function lifeContextLines(
  events: Array<{ date: string; label: string; category?: string; notes?: string; kind?: string; endedAt?: string }>,
): string[] {
  if (events.length === 0) return [];
  const out: string[] = ['', 'THE PERSON\'S OWN RECORD (logged events and remedies):'];
  for (const e of events) {
    const kind = e.kind === 'remedy' ? 'remedy taken' : 'milestone';
    const ended = e.endedAt ? ` (ended ${e.endedAt})` : '';
    const notes = e.notes ? ` — ${e.notes}` : '';
    out.push(
      `- ${e.date} · ${e.label} · ${kind}${e.category ? ` · ${e.category}` : ''}${ended}${notes}`,
    );
  }
  return out;
}

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
  /** Always 0 now — the editorial fence was deleted 2026-08-27 ("delete the fence").
   *  Kept as a field so existing UI and call sites do not churn. */
  violations: number;
}

const CITE_RE = /\[(F-[A-Z0-9-]+)\]/g;

/**
 * Grade model output. Nothing is silently dropped: every sentence comes back
 * with its verdict so the UI can show a flagged sentence AS flagged, which is
 * the whole point — an unanchored fluent sentence is exactly the failure mode
 * this layer exists to make visible.
 *
 * NOTE, 2026-08-27: this no longer checks any editorial fence. The fence was
 * deleted at Peter's instruction; what remains is citation mechanics only —
 * a sentence either cites a real computed fact, cites nothing, or cites a
 * made-up id. Fortune vocabulary, predictions, and applying the chart to a
 * life are now permitted and are NOT flagged.
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
    return {
      text: s,
      cites,
      unknownCites,
      fenceHits: [],
      ok: cites.length > 0 && unknownCites.length === 0,
    };
  });

  return {
    sentences,
    unanchored: sentences.filter((s) => s.cites.length === 0 && s.unknownCites.length === 0).length,
    fabricated: sentences.filter((s) => s.unknownCites.length > 0).length,
    violations: 0,
  };
}

export interface TutorConfig {
  /** OpenAI-compatible base URL, e.g. https://api.openai.com/v1 or http://localhost:11434/v1 */
  baseUrl: string;
  model: string;
  /** The reader's own key. Empty is valid — local servers usually need none. */
  apiKey: string;
}

/**
 * Presets. **DeepSeek leads** because it is the reading model this project uses
 * (Peter, 2026-08-27: "we want to focus on readings done by deepseek"), so it is
 * also the default the panel opens with.
 *
 * The local endpoints stay listed directly beneath it, and not out of politeness:
 * they are the only leak-free path — nothing leaves the machine — which makes them
 * the right choice for reading a chart that is not your own.
 */
export const TUTOR_PRESETS: Array<{ label: string; baseUrl: string; model: string; needsKey: boolean }> = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-v4-pro', needsKey: true },
  { label: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1', needsKey: false },
  { label: 'LM Studio (local)', baseUrl: 'http://localhost:1234/v1', model: 'local-model', needsKey: false },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', needsKey: true },
];

/**
 * Storage keys for the reader's own endpoint config and key. Exported so a page can
 * ask whether a reading model exists without duplicating the strings — they were
 * private to TutorPanel until /reading needed to know.
 */
export const TUTOR_CFG_KEY = 'bazilionaire.tutor.config.v1';
export const TUTOR_KEY_KEY = 'bazilionaire.tutor.key.v1';

/**
 * True when this browser already has a usable reading model: a stored key (session
 * or device), or a configured LOCAL endpoint, which needs no key at all.
 *
 * `/reading` uses this to decide whether the model reading LEADS the page. It never
 * reads out, returns, or logs the key itself — only whether one is present.
 * When it returns false the template 解盘 leads and the page is complete without any
 * model, which is the floor this project does not give up.
 */
export function hasReadingModel(): boolean {
  const cfg = savedTutorConfig();
  return cfg !== null;
}

/**
 * The reader's saved endpoint/key/model, if a usable one exists. A stored key (session or
 * device) makes any endpoint usable; a configured LOCAL endpoint needs no key. Returns
 * null when nothing is saved, and never logs or returns the key itself — only the config
 * object, which the caller is responsible for not printing.
 */
export function savedTutorConfig(): TutorConfig | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const key = localStorage.getItem(TUTOR_KEY_KEY) ?? sessionStorage.getItem(TUTOR_KEY_KEY);
    const raw = localStorage.getItem(TUTOR_CFG_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as { baseUrl?: string; model?: string };
    if (!cfg.baseUrl) return null;
    const hasKey = Boolean(key && key.trim().length > 0);
    if (!hasKey && !isLocalEndpoint(cfg.baseUrl)) return null;
    return {
      baseUrl: cfg.baseUrl,
      model: cfg.model ?? TUTOR_PRESETS[0].model,
      apiKey: key ?? '',
    };
  } catch {
    return null;
  }
}

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
  /**
   * Model ids the endpoint says this key can use, when we managed to ask. Carried on
   * the ERROR rather than only baked into its text so the panel can offer them as one
   * click each — a message naming a wrong model still leaves the reader retyping.
   */
  readonly available?: string[];
  /** The preset default for this endpoint, when the current model differs from it. */
  readonly suggestedModel?: string;
  /**
   * A known base URL to offer when the reader's endpoint matches no preset. Paired with
   * suggestedModel so one click can fix BOTH fields — the observed failure was an endpoint
   * of `.../v4` with a model of `pro`, i.e. `deepseek-v4-pro` split across the two inputs.
   */
  readonly suggestedBaseUrl?: string;

  constructor(
    message: string,
    extra?: { available?: string[]; suggestedModel?: string; suggestedBaseUrl?: string },
  ) {
    super(message);
    this.name = 'TutorError';
    this.available = extra?.available;
    this.suggestedModel = extra?.suggestedModel;
    this.suggestedBaseUrl = extra?.suggestedBaseUrl;
  }
}

/**
 * The preset model for a base URL, when the given model is not already it.
 *
 * Exists because a SAVED config silently outranks a fixed preset: TutorPanel restores
 * `cfg.model` from localStorage on mount, so correcting a preset default in code does
 * nothing for a browser that already stored a bad id. Observed 2026-08-27 — the
 * DeepSeek preset was corrected to deepseek-v4-pro and the app still sent a stale
 * hand-typed `deepseek-pro`.
 */
export function presetModelFor(baseUrl: string, currentModel: string): string | undefined {
  const norm = (u: string) => u.replace(/\/+$/, '');
  const hit = TUTOR_PRESETS.find((p) => norm(p.baseUrl) === norm(baseUrl));
  if (!hit) return undefined;
  return hit.model === currentModel ? undefined : hit.model;
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

/**
 * Ask the endpoint what models this key can actually use. Best-effort and bounded:
 * every failure returns undefined, because this only ever runs to make ANOTHER error
 * message more useful and must never replace it or hang.
 */
export async function fetchAvailableModels(cfg: TutorConfig): Promise<string[] | undefined> {
  try {
    const url = `${cfg.baseUrl.replace(/\/+$/, '')}/models`;
    const headers: Record<string, string> = {};
    if (cfg.apiKey.trim().length > 0) headers.Authorization = `Bearer ${cfg.apiKey.trim()}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: Array<{ id?: string }> };
    const ids = (body.data ?? []).map((m) => m.id).filter((id): id is string => Boolean(id));
    return ids.length > 0 ? ids : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The preset whose base URL matches this one, if any. Trailing slashes normalized.
 * Used to decide whether the ENDPOINT is above suspicion when a 404 arrives.
 */
export function presetFor(baseUrl: string): (typeof TUTOR_PRESETS)[number] | undefined {
  const norm = (u: string) => u.replace(/\/+$/, '');
  return TUTOR_PRESETS.find((p) => norm(p.baseUrl) === norm(baseUrl));
}

/**
 * Failure text for a non-OK response. Pure, so the gate can assert it offline.
 *
 * TWO CORRECTIONS ARE BAKED INTO THIS FUNCTION, both from getting it wrong in public:
 *
 * 1. A bare "returned 404" sends the reader hunting the base URL with no evidence.
 *    So the message names its suspects.
 * 2. **It must not claim more than it knows.** An earlier version asserted "the request
 *    path is fixed, and a bad key would have answered 401 instead of 404" — and that
 *    inference is false. Probed 2026-08-27: api.deepseek.com answers **401 on every
 *    path**, including `/v4`, `/v1beta` and `/openai/v1`. Auth really is checked before
 *    routing, but that means an unauthenticated 401 proves NOTHING about whether a path
 *    exists, and with a valid key a 404 can be the path OR the model. The message that
 *    told Peter the model was "the likeliest cause" was wrong: his endpoint was
 *    `https://api.deepseek.com/v4` and the path was the actual fault.
 *
 * So a 404 now names BOTH suspects and ranks them by the only evidence available
 * offline — whether the base URL is one this app ships as a preset.
 */
export function describeHttpFailure(args: {
  host: string;
  status: number;
  detail: string;
  baseUrl: string;
  model: string;
  available?: string[];
}): string {
  const { host, status, detail, baseUrl, model, available } = args;
  let msg = `${host} returned ${status}${detail ? ` — ${detail}` : ''}`;

  if (status === 404 || /model/i.test(detail)) {
    const preset = presetFor(baseUrl);
    if (preset) {
      // The endpoint is a base URL this app ships, so the model id is the open question.
      msg +=
        `. The endpoint is a known base URL, so the model id "${model}" is the more likely fault ` +
        `of the two things a 404 can mean here.`;
    } else {
      // The reader has edited the endpoint. That is the first thing to check, because a
      // wrong path 404s no matter how good the model id is.
      msg +=
        `. A 404 here means either the endpoint path or the model id, and the endpoint is the ` +
        `first thing to check: "${baseUrl}" is not a base URL this app knows.`;
      const known = TUTOR_PRESETS.map((p) => p.baseUrl).filter((u, i, a) => a.indexOf(u) === i);
      if (known.length > 0) msg += ` Known endpoints: ${known.join(', ')}.`;
      msg += ` The model id sent was "${model}".`;
    }
    if (available && available.length > 0) {
      msg += ` This key can use: ${available.join(', ')}.`;
    }
  }
  return msg;
}

/**
 * Completion budget. Measured against api.deepseek.com on 2026-08-27, because the old value
 * of 900 made the panel fail outright with "The endpoint returned an empty completion":
 *
 *   TOY task (2 sentences):
 *     deepseek-v4-pro   @  900 →  900 tokens, ALL reasoning,   0 chars, finish=length
 *     deepseek-v4-pro   @ 2000 → 1839 tokens (1723 reasoning), 434 chars, finish=stop
 *     deepseek-v4-flash @  900 →  656 tokens ( 598 reasoning),  62 chars, finish=stop
 *
 *   REAL reading payload (33 fact lines, 7 sections) — the number that matters:
 *     deepseek-v4-pro   @ 4000 → 4000 tokens, ALL reasoning, 0 chars, finish=length
 *     deepseek-v4-flash @ 4000 → 4000 tokens, ALL reasoning, 0 chars, finish=length
 *
 * So raising the budget alone does NOT fix this: a bigger allowance just buys more
 * deliberation on a task this open-ended. The real lever is REASONING_OFF below.
 */
export const MAX_COMPLETION_TOKENS = 4000;

/**
 * How to ask an OpenAI-compatible endpoint to stop reasoning and just answer.
 *
 * Probed against api.deepseek.com 2026-08-27 (reasoning tokens for the same small task):
 *   baseline 302 · reasoning_effort:"low" 175 · "minimal" 136 · **"none" → no reasoning at
 *   all** · thinking:{type:"disabled"} → no reasoning at all.
 *
 * `reasoning_effort` is the OpenAI-compatible spelling, so it is the one we send — but it is
 * NOT sent on the first attempt, because an endpoint that rejects unknown fields (some local
 * servers, some proxies) would fail a request that would otherwise have worked. It is a
 * RETRY, applied only after the model has demonstrably burned the whole budget thinking.
 */
export const REASONING_OFF = { reasoning_effort: 'none' } as const;

/**
 * Why a 200 response carried no text. Pure, so the gate can assert it offline.
 *
 * "The endpoint returned an empty completion." was technically true and diagnostically
 * useless — Peter hit it twice and it named nothing. The usual cause is a reasoning model
 * whose budget ran out before it started answering, and the response says so plainly in
 * `finish_reason` and `usage.completion_tokens_details.reasoning_tokens`.
 */
export function describeEmptyCompletion(args: {
  model: string;
  finishReason?: string;
  reasoningTokens?: number;
  budget: number;
}): string {
  const { model, finishReason, reasoningTokens, budget } = args;
  if (finishReason === 'length' && (reasoningTokens ?? 0) > 0) {
    return (
      `"${model}" is a reasoning model: it spent the whole ${budget}-token budget thinking ` +
      `(${reasoningTokens} reasoning tokens) and never began the answer. Raise the budget, or ` +
      `pick a model that reasons less before it writes.`
    );
  }
  if (finishReason === 'length') {
    return `"${model}" reached the ${budget}-token budget before writing any answer.`;
  }
  return (
    `The endpoint returned an empty completion for "${model}"` +
    `${finishReason ? ` (finish reason: ${finishReason})` : ''}.`
  );
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * One request with the full reasoning-retry machinery. runTutor and runChat both go
 * through here so the two surfaces share one behaviour: honest HTTP errors, the
 * 404-suspect-ranking, the reasoning-suppression retry, and the empty-completion
 * diagnosis.
 */
export async function requestChat(
  cfg: TutorConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const problem = endpointProblem(cfg.baseUrl);
  if (problem) throw new TutorError(problem);
  // A hung endpoint must not strand the caller: without a deadline the panel sat
  // in 'running' with its button disabled forever (review finding, 2026-08-27).
  //
  // 240s because this deadline covers TWO attempts: a reasoning model can burn the
  // whole budget thinking, and the retry with reasoning suppressed follows on the
  // same signal. Measured 2026-08-27: deepseek-v4-pro took 93.1s for both attempts
  // combined on the real 33-fact payload.
  const timeout = AbortSignal.timeout(240_000);
  const effectiveSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cfg.apiKey.trim().length > 0) headers.Authorization = `Bearer ${cfg.apiKey.trim()}`;

  const requestBody = (suppressReasoning: boolean) =>
    JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      max_tokens: MAX_COMPLETION_TOKENS,
      messages,
      ...(suppressReasoning ? REASONING_OFF : {}),
    });

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      signal: effectiveSignal,
      body: requestBody(false),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new TutorError(
        `${endpointHost(cfg.baseUrl)} did not answer within four minutes — the request was cancelled.`,
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
      detail = body?.error?.message ? `${body.error.message}` : '';
    } catch {
      /* non-JSON error body */
    }
    // A 404 (or any complaint mentioning the model) earns one extra round trip so the
    // message can name the models that actually exist instead of leaving the reader to guess.
    const available =
      res.status === 404 || /model/i.test(detail) ? await fetchAvailableModels(cfg) : undefined;
    throw new TutorError(
      describeHttpFailure({
        host: endpointHost(cfg.baseUrl),
        status: res.status,
        detail,
        baseUrl: cfg.baseUrl,
        model: cfg.model,
        available,
      }),
      presetFor(cfg.baseUrl)
        ? { available, suggestedModel: presetModelFor(cfg.baseUrl, cfg.model) }
        : // Endpoint is unrecognized: offer the DeepSeek preset outright, since a wrong
          // path 404s regardless of the model id.
          {
            available,
            suggestedBaseUrl: TUTOR_PRESETS[0].baseUrl,
            suggestedModel: TUTOR_PRESETS[0].model,
          },
    );
  }

  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    usage?: { completion_tokens_details?: { reasoning_tokens?: number } };
  };
  const text = body.choices?.[0]?.message?.content;
  if (!text || text.trim().length === 0) {
    const finishReason = body.choices?.[0]?.finish_reason;
    const reasoningTokens = body.usage?.completion_tokens_details?.reasoning_tokens;

    // THE RETRY THAT MAKES REASONING MODELS USABLE. Measured 2026-08-27: on the real reading
    // payload, both deepseek-v4-pro and deepseek-v4-flash spend the ENTIRE budget reasoning and
    // return no answer, at 900 and at 4000 alike — a bigger allowance only buys more
    // deliberation. Asking the endpoint to stop reasoning is the lever that works, and it is
    // applied here rather than on the first attempt so that an endpoint which rejects unknown
    // fields is never broken by a parameter it does not know.
    if (finishReason === 'length' && (reasoningTokens ?? 0) > 0) {
      try {
        const retry = await fetch(url, {
          method: 'POST',
          headers,
          signal: effectiveSignal,
          body: requestBody(true),
        });
        if (retry.ok) {
          const rbody = (await retry.json()) as {
            choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
          };
          const rtext = rbody.choices?.[0]?.message?.content;
          if (rtext && rtext.trim().length > 0) return rtext.trim();
        }
      } catch {
        /* fall through to the honest error below — the retry is a bonus, not a promise */
      }
    }

    // A reasoning model that ate the budget is a MODEL choice problem, so offer the other
    // ids this key can use rather than leaving the reader to guess which reason less.
    const available =
      finishReason === 'length' ? await fetchAvailableModels(cfg) : undefined;
    throw new TutorError(
      describeEmptyCompletion({
        model: cfg.model,
        finishReason,
        reasoningTokens,
        budget: MAX_COMPLETION_TOKENS,
      }),
      { available },
    );
  }
  return text.trim();
}

export async function runTutor(
  cfg: TutorConfig,
  payload: TutorPayload,
  signal?: AbortSignal,
): Promise<string> {
  return requestChat(
    cfg,
    [
      { role: 'system', content: payload.system },
      { role: 'user', content: payload.user },
    ],
    signal,
  );
}

/**
 * The multi-turn destiny chat: sends the context pack, the conversation history, and the
 * new message in one call. History is trimmed from the tail to stay inside the token
 * budget — the context pack is never dropped, because it is what every reply must stay
 * grounded in.
 */
export async function runChat(
  cfg: TutorConfig,
  args: {
    system: string;
    context: string;
    history: ChatMessage[];
    userMessage: string;
  },
  signal?: AbortSignal,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: args.system },
    { role: 'user', content: args.context },
  ];
  const trimmed = args.history.slice(-20);
  for (const m of trimmed) messages.push(m);
  messages.push({ role: 'user', content: args.userMessage });
  return requestChat(cfg, messages, signal);
}
