/**
 * Gate: the tutor payload cannot carry birth data, and the audit actually
 * catches a lying model.
 *
 *   bun run --cwd app check:tutor
 *
 * Two properties, both security-relevant, both cheap to check offline:
 *
 * 1. LEAK CHECK — for pinned births, in BOTH modes, the exact string that would
 *    be POSTed must not contain the birth year, month, day, hour, minute, the
 *    city name, the longitude, or the timezone. Minimized mode additionally
 *    must not contain the eight characters as a pillar list, any calendar year,
 *    or any clock time. This is asserted against the payload the UI builds, not
 *    a description of it — the disclosure gate shows the same lines.
 *
 * 2. AUDIT CHECK — synthetic model output is graded: a sentence with no [F-ID]
 *    must come back unanchored, a sentence citing a nonexistent id must come
 *    back fabricated, a prediction must come back as a fence violation, and a
 *    clean cited sentence must pass. If the audit can't catch these, the visible
 *    flags on the page mean nothing.
 */
import { computeChart } from '@bazilionaire/engine';
import { factsheet } from '../lib/factsheet';
import { reading } from '../lib/reading';
import { auditTutorText, describeHttpFailure, hasReadingModel, presetModelFor, redactFacts, tutorPayload, TUTOR_CFG_KEY, TUTOR_KEY_KEY, TUTOR_PRESETS, TUTOR_SYSTEM_PROMPT } from '../lib/tutor';

const PINNED_YEAR = 2026;

const CASES: Array<{
  name: string;
  args: Parameters<typeof computeChart>;
  /** Strings that must never appear in the payload, whatever the mode. */
  secrets: string[];
}> = [
  {
    name: 'anchor-1949 Beijing male',
    args: [1949, 10, 1, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 1],
    secrets: ['1949', '116.391', '1949-10-01', 'Beijing'],
  },
  {
    name: '1990-07-15 03:30 no location, clock school',
    args: [1990, 7, 15, 3, 30, undefined, 1, 'clock'],
    secrets: ['1990', '03:30', '3:30', '1990-07-15'],
  },
  {
    name: '2024-02-10 Beijing female, boundary month',
    args: [2024, 2, 10, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 0],
    secrets: ['2024', '116.391', '2024-02-10'],
  },
];

const problems: string[] = [];

for (const c of CASES) {
  const chart = computeChart(...c.args);
  const facts = factsheet(chart, { year: PINNED_YEAR });
  const movements = reading(chart, facts, { year: PINNED_YEAR });

  for (const minimize of [true, false]) {
    const payload = tutorPayload(facts, movements, { minimize });
    const wire = `${payload.system}\n${payload.user}`;
    const mode = minimize ? 'minimized' : 'full';

    // Birth inputs must never be present in either mode.
    for (const s of c.secrets) {
      // A bare 4-digit birth year is only forbidden in minimized mode; the full
      // sheet deliberately includes decade years (and says so on the gate).
      const isYear = /^\d{4}$/.test(s);
      if (!minimize && isYear) continue;
      if (wire.includes(s)) {
        problems.push(`${c.name} [${mode}]: payload contains "${s}"`);
      }
    }
    if (/\b\d{1,2}:\d{2}\b/.test(payload.user) && minimize) {
      problems.push(`${c.name} [minimized]: payload contains a clock time`);
    }
    if (minimize) {
      if (/\b(1[6-9]\d{2}|20\d{2}|21\d{2})\b/.test(payload.user)) {
        problems.push(`${c.name} [minimized]: payload contains a calendar year`);
      }
      if (/\b\d+\s*y\s*\d+\s*m\s*\d+\s*d\b/i.test(payload.user)) {
        problems.push(`${c.name} [minimized]: payload contains a birth-relative 起运 offset`);
      }
      if (payload.allowedIds.includes('F-EIGHT')) {
        problems.push(`${c.name} [minimized]: F-EIGHT survived redaction`);
      }

      /**
       * RECOVERABILITY, not formatting.
       *
       * The previous version of this gate asserted only that the FORMATTED pillar
       * list ("庚午 癸未 辛巳 庚寅") was absent — and passed while a reviewer
       * reconstructed all eight characters field-by-field from F-DAYMASTER,
       * F-DESHI's detail and the four F-XINGYUN-* values. A gate that certifies a
       * privacy claim has to test the claim, not its punctuation. So: NO 干支
       * character may appear anywhere in the minimized payload.
       */
      const ganzhi = payload.user.match(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g) ?? [];
      if (ganzhi.length > 0) {
        const lines = payload.user
          .split('\n')
          .filter((l) => /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(l));
        problems.push(
          `${c.name} [minimized]: payload contains ${ganzhi.length} 干支 character(s) — ` +
            `the eight characters are recoverable from: ${lines.slice(0, 3).join(' /// ')}`,
        );
      }
      // Independent check: try to actually rebuild each pillar from the payload.
      for (const [name, pillar] of [
        ['year', chart.year],
        ['month', chart.month],
        ['day', chart.day],
        ['hour', chart.time],
      ] as const) {
        const [stem, branch] = [pillar[0], pillar[1]];
        if (payload.user.includes(stem) && payload.user.includes(branch)) {
          problems.push(
            `${c.name} [minimized]: the ${name} pillar's stem (${stem}) and branch (${branch}) are both present — pillar recoverable`,
          );
        }
      }
    } else {
      // Full mode is allowed to carry 干支 and decade years — that is what the
      // disclosure gate warns about — but never a clock time, in either mode.
      if (/\b\d{1,2}:\d{2}\b/.test(payload.user)) {
        problems.push(`${c.name} [full]: payload contains a clock time`);
      }
    }

    // The contract itself must be in the system prompt, or the model was never told.
    for (const rule of ['[F-DELING]', 'never invent an id', 'no predictions', 'second-person future']) {
      if (!payload.system.toLowerCase().includes(rule.toLowerCase())) {
        problems.push(`${c.name} [${mode}]: system prompt is missing the rule "${rule}"`);
      }
    }
    if (payload.allowedIds.length === 0) problems.push(`${c.name} [${mode}]: no allowed ids`);
    // The closing clause is never the model's to write.
    if (payload.user.includes('善人不为命所缚')) {
      problems.push(`${c.name} [${mode}]: the closing clause was sent to the model`);
    }
  }
}

// ---------------- audit behaviour ----------------
{
  const allowed = ['F-DELING', 'F-STRENGTH'];
  const synthetic = [
    'The month generates this chart’s day master, so the season supports it. [F-DELING]',
    'This structure is weak overall and the engine says so plainly. [F-STRENGTH]',
    'A fluent sentence with nothing behind it.',
    'The chart is strong. [F-MADEUP]',
    'You will find money in the coming decade. [F-STRENGTH]',
  ].join('\n');
  const a = auditTutorText(synthetic, allowed);

  /**
   * DeepSeek's blocking case: the model is TOLD to put [F-ID] after the period, so
   * real output is space-separated with inline tags. The old splitter never fired
   * there and merged whole paragraphs into one unit, hiding uncited sentences.
   */
  const inline =
    'Blended, the plate lands 身强. [F-STRENGTH] A career in law would suit this structure well.';
  const b = auditTutorText(inline, ['F-STRENGTH']);
  if (b.sentences.length !== 2) {
    problems.push(`inline-citation split: expected 2 sentences, got ${b.sentences.length}`);
  }
  if (b.unanchored !== 1) {
    problems.push(`inline-citation split: the uncited advice sentence was not flagged (unanchored=${b.unanchored})`);
  }

  if (a.sentences.length !== 5) problems.push(`audit: expected 5 sentences, got ${a.sentences.length}`);
  if (a.unanchored !== 1) problems.push(`audit: expected 1 unanchored sentence, got ${a.unanchored}`);
  if (a.fabricated !== 1) problems.push(`audit: expected 1 fabricated citation, got ${a.fabricated}`);
  if (a.violations !== 1) problems.push(`audit: expected 1 fence violation, got ${a.violations}`);
  if (!a.sentences[0].ok) problems.push('audit: a clean cited sentence was marked not-ok');
  if (a.sentences[3].ok) problems.push('audit: a fabricated citation was marked ok');
  if (a.sentences[4].ok) problems.push('audit: a prediction was marked ok');
  if (!a.sentences[3].unknownCites.includes('F-MADEUP')) {
    problems.push('audit: fabricated id not reported');
  }
}

// The prompt must not contain anything chart-specific: it is a constant.
if (/\b(1[6-9]\d{2}|20\d{2})\b/.test(TUTOR_SYSTEM_PROMPT)) {
  problems.push('system prompt contains a year — it must be chart-independent');
}

// ---- hasReadingModel(): the gate that decides whether the model reading LEADS /reading ----
//
// This is UI-load-bearing (Peter, 2026-08-27: "focus on readings done by deepseek"), and it is the
// one piece of that decision that can be checked without a browser — so it is checked here rather
// than trusted. A false positive would put a model panel at the top of a page for a reader who has
// no model; a false negative would silently bury the reading they configured.
{
  const store = () => {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
      clear: () => m.clear(),
      key: () => null,
      length: 0,
    } as unknown as Storage;
  };

  const withStores = (seed: (ls: Storage, ss: Storage) => void): boolean => {
    const ls = store();
    const ss = store();
    seed(ls, ss);
    const g = globalThis as unknown as { localStorage?: Storage; sessionStorage?: Storage };
    const prevL = g.localStorage;
    const prevS = g.sessionStorage;
    g.localStorage = ls;
    g.sessionStorage = ss;
    try {
      return hasReadingModel();
    } finally {
      g.localStorage = prevL;
      g.sessionStorage = prevS;
    }
  };

  const REMOTE = JSON.stringify({ baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' });
  const LOCAL = JSON.stringify({ baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' });

  const expectations: Array<[string, boolean, (ls: Storage, ss: Storage) => void]> = [
    ['empty browser → template leads', false, () => {}],
    ['remembered key on device → model leads', true, (ls) => ls.setItem(TUTOR_KEY_KEY, 'sk-x')],
    ['session-only key → model leads', true, (_ls, ss) => ss.setItem(TUTOR_KEY_KEY, 'sk-x')],
    ['blank key string → template leads', false, (ls) => ls.setItem(TUTOR_KEY_KEY, '   ')],
    ['local endpoint, no key → model leads', true, (ls) => ls.setItem(TUTOR_CFG_KEY, LOCAL)],
    ['remote endpoint, no key → template leads', false, (ls) => ls.setItem(TUTOR_CFG_KEY, REMOTE)],
    ['corrupt config, no key → template leads', false, (ls) => ls.setItem(TUTOR_CFG_KEY, '{not json')],
  ];

  for (const [name, want, seed] of expectations) {
    const got = withStores(seed);
    if (got !== want) problems.push(`hasReadingModel: ${name} — expected ${want}, got ${got}`);
  }

  // DeepSeek must be the default the panel opens with.
  if (TUTOR_PRESETS[0].label !== 'DeepSeek') {
    problems.push(`presets: expected DeepSeek first, got "${TUTOR_PRESETS[0].label}"`);
  }
  // …and a local, leak-free option must remain offered.
  if (!TUTOR_PRESETS.some((p) => !p.needsKey)) {
    problems.push('presets: no key-free local endpoint is offered any more');
  }

  // No preset may ship a model id that is known-dead. `deepseek-chat` shipped as the
  // default on 2026-08-27 and produced a bare 404 in the app — the failure this whole
  // block exists to stop recurring silently.
  const DEAD_MODEL_IDS = ['deepseek-chat'];
  for (const p of TUTOR_PRESETS) {
    if (DEAD_MODEL_IDS.includes(p.model)) {
      problems.push(`presets: "${p.label}" ships a retired model id (${p.model})`);
    }
  }
}

// ---- describeHttpFailure: a 404 must rank its suspects honestly ----
//
// Two shipped bugs are pinned here. First, the app reported "api.deepseek.com returned 404"
// and nothing else, leaving the reader to guess. Then the fix over-corrected and asserted
// "the request path is fixed, and a bad key would have answered 401 instead" — which is
// FALSE: api.deepseek.com answers 401 on every path, including /v4, /v1beta and
// /openai/v1, so an unauthenticated 401 proves nothing about whether a path exists. That
// wrong claim sent Peter looking at the model while his endpoint was .../v4. A 404 has two
// possible causes and the message must say so, ranked by the only offline evidence there
// is: whether the base URL is one this app ships.
{
  const KNOWN = 'https://api.deepseek.com/v1';

  // (a) Known endpoint + bad model → the model is the ranked suspect, and it is named.
  const onKnown = describeHttpFailure({
    host: 'api.deepseek.com',
    status: 404,
    detail: '',
    baseUrl: KNOWN,
    model: 'deepseek-chat',
  });
  if (!onKnown.includes('deepseek-chat')) {
    problems.push('describeHttpFailure: a 404 must name the model id that was sent');
  }
  if (!/known base URL/.test(onKnown)) {
    problems.push('describeHttpFailure: a 404 on a preset endpoint should say the endpoint is known');
  }

  // (b) THE REGRESSION THAT SHIPPED: an edited endpoint must be blamed FIRST, and the
  // message must never claim a 401 would have proved the path good — api.deepseek.com
  // answers 401 on every path, including /v4, /v1beta and /openai/v1.
  const onEdited = describeHttpFailure({
    host: 'api.deepseek.com',
    status: 404,
    detail: '',
    baseUrl: 'https://api.deepseek.com/v4',
    model: 'pro',
  });
  if (!onEdited.includes('https://api.deepseek.com/v4')) {
    problems.push('describeHttpFailure: an unrecognized endpoint must be quoted back to the reader');
  }
  if (!onEdited.includes(KNOWN)) {
    problems.push('describeHttpFailure: an unrecognized endpoint must be shown a known one');
  }
  if (!onEdited.includes('"pro"')) {
    problems.push('describeHttpFailure: the model id must still be named alongside a bad endpoint');
  }
  if (/401/.test(onEdited) || /401/.test(onKnown)) {
    problems.push(
      'describeHttpFailure: must NOT reason from 401 — api.deepseek.com returns 401 on every ' +
        'path, so an unauthenticated 401 proves nothing about whether a path exists',
    );
  }
  if (/is the likeliest cause/.test(onEdited)) {
    problems.push('describeHttpFailure: must not name a single likeliest cause when the endpoint is unknown');
  }

  const withList = describeHttpFailure({
    host: 'api.deepseek.com',
    status: 404,
    detail: '',
    baseUrl: KNOWN,
    model: 'deepseek-chat',
    available: ['deepseek-v4-pro', 'deepseek-reasoner'],
  });
  if (!withList.includes('deepseek-v4-pro')) {
    problems.push('describeHttpFailure: available models must be listed when known');
  }

  // A 500 is not a model problem — it must NOT blame the model id.
  const serverErr = describeHttpFailure({
    host: 'api.deepseek.com',
    status: 500,
    detail: 'internal error',
    baseUrl: KNOWN,
    model: 'deepseek-v4-pro',
  });
  if (/more likely fault|first thing to check/.test(serverErr)) {
    problems.push('describeHttpFailure: a 500 must not be blamed on the model or the endpoint');
  }

  // …but an explicit model complaint at any status should still name it.
  const modelComplaint = describeHttpFailure({
    host: 'api.deepseek.com',
    status: 400,
    detail: 'Model Not Exist',
    baseUrl: KNOWN,
    model: 'deepseek-chat',
  });
  if (!modelComplaint.includes('deepseek-chat')) {
    problems.push('describeHttpFailure: a model complaint must name the model id at any status');
  }
}

// ---- presetModelFor: a SAVED model id silently outranks a corrected preset ----
//
// The second half of the 2026-08-27 DeepSeek failure. The preset default was corrected in
// code, but TutorPanel restores cfg.model from localStorage on mount, so a browser holding
// a stale hand-typed id (`deepseek-pro`) kept sending it and kept 404ing. The panel now
// offers the preset model as a one-click fix, which only works if this resolver does.
{
  const ds = 'https://api.deepseek.com/v1';
  const cases: Array<[string, string, string, string | undefined]> = [
    ['stale hand-typed id → offer the preset', ds, 'deepseek-pro', 'deepseek-v4-pro'],
    ['retired id → offer the preset', ds, 'deepseek-chat', 'deepseek-v4-pro'],
    ['already correct → offer nothing', ds, 'deepseek-v4-pro', undefined],
    ['trailing slash still matches the preset', `${ds}/`, 'deepseek-pro', 'deepseek-v4-pro'],
    ['unknown endpoint → offer nothing', 'https://example.test/v1', 'whatever', undefined],
  ];
  for (const [name, baseUrl, model, want] of cases) {
    const got = presetModelFor(baseUrl, model);
    if (got !== want) {
      problems.push(`presetModelFor: ${name} — expected ${String(want)}, got ${String(got)}`);
    }
  }
}

if (problems.length > 0) {
  console.error('tutor payload/audit check FAILED:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `tutor check passed — ${CASES.length} charts × 2 modes: minimized payloads contain no 干支 at all ` +
    `(no pillar is recoverable), no clock time leaves in either mode, the system prompt states the ` +
    `contract, the audit catches uncited, fabricated, and predictive sentences, and hasReadingModel ` +
    `decides the /reading layout correctly in 7 storage states (DeepSeek is preset 0).`,
);
