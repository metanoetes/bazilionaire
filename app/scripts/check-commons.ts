/**
 * Gate: the research commons discloses exactly what it collects.
 *
 *   bun run --cwd app check:commons
 *
 * `check:tutor` asserts that fields are ABSENT from the wire. This is its mirror
 * image, and it exists because Peter's 2026-08-27 call was **collect everything**:
 * when you keep the raw record, the honesty burden moves off minimization and onto
 * disclosure. So the property asserted here is not "the payload is small" but
 * "the payload holds no surprises."
 *
 * Four properties, all offline:
 *
 * 1. NOTHING UNDISCLOSED — every leaf path a real `ResearchRecord` produces, for
 *    several pinned births, must appear in `COMMONS_DISCLOSURE`. Add a field to the
 *    record and forget the disclosure list and this fails. That is the whole gate.
 *
 * 2. NOTHING STALE — every path in the disclosure list must actually be produced by
 *    a real record. A disclosure that names fields the code stopped sending is not
 *    honesty, it is decoration, and it hides the fields that ARE sent behind noise.
 *
 * 3. NO INVISIBLE FIELDS — top-level key sets must match. An always-empty array or
 *    object contributes no leaf paths, so property 1 alone could not see it.
 *
 * 4. RISK LABELS CANNOT BE QUIETLY DOWNGRADED — the fields that provably narrow the
 *    birth moment must stay marked `identifying`. The reconstruction cliff is at
 *    three pillars (≈263k-moment sweep: day pillar 4,380 candidate moments,
 *    day+month 72, three pillars 12 = unique date, four = the exact 2h slot), so the
 *    four pillars and the raw birth inputs are non-negotiably identifying.
 *
 * One pinned case is deliberately a 立春 boundary birth (found by sweeping February
 * 1990 minute by minute, not guessed) because it is the only way `warnings[]` is
 * populated — and a ±1-minute 节 warning pins a birth time to the minute, so it is
 * exactly the kind of field that must never reach the wire undisclosed.
 */
import { computeChart } from '@bazilionaire/engine';
import {
  COMMONS_DISCLOSURE,
  leafPaths,
  researchRecord,
  type ResearchRecord,
} from '../lib/research';

interface Case {
  name: string;
  args: Parameters<typeof computeChart>;
  birth: ResearchRecord['birth'];
}

const CASES: Case[] = [
  {
    name: 'anchor-1949 Beijing male',
    args: [1949, 10, 1, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 1],
    birth: {
      year: 1949, month: 10, day: 1, hour: 12, minute: 0,
      lon: 116.391, tz: 8, city: 'Beijing', gender: 'male', hourSchool: 'solar',
    },
  },
  {
    name: '1990-07-15 03:30, no location, clock school',
    args: [1990, 7, 15, 3, 30, undefined, 1, 'clock'],
    birth: {
      year: 1990, month: 7, day: 15, hour: 3, minute: 30,
      lon: null, tz: null, city: null, gender: 'male', hourSchool: 'clock',
    },
  },
  {
    // The only way warnings[] is non-empty: within ±1 min of 立春.
    // Found by minute-sweeping 1990-02-03..05 Beijing; 10:14 trips BOTH the year
    // and month boundary warnings.
    name: '1990-02-04 10:14 Beijing male — 立春 boundary, warnings populated',
    args: [1990, 2, 4, 10, 14, { lonDeg: 116.391, tzHours: 8 }, 1],
    birth: {
      year: 1990, month: 2, day: 4, hour: 10, minute: 14,
      lon: 116.391, tz: 8, city: 'Beijing', gender: 'male', hourSchool: 'solar',
    },
  },
  {
    name: '2024-02-10 Beijing female',
    args: [2024, 2, 10, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 0],
    birth: {
      year: 2024, month: 2, day: 10, hour: 12, minute: 0,
      lon: 116.391, tz: 8, city: 'Beijing', gender: 'female', hourSchool: 'solar',
    },
  },
];

/** Paths that must carry identifying:true, whatever else changes. */
const MUST_BE_IDENTIFYING = [
  'birth.year', 'birth.month', 'birth.day', 'birth.hour', 'birth.minute',
  'birth.city', 'birth.lon',
  'pillars.year', 'pillars.month', 'pillars.day', 'pillars.time',
  'dayun[].startYear', 'warnings[]',
];

const failures: string[] = [];
function fail(msg: string) {
  failures.push(msg);
}

// ---- collect what real records actually contain ----
const seen = new Set<string>();
const topLevelSeen = new Set<string>();
let warningsCovered = false;

for (const c of CASES) {
  const chart = computeChart(...c.args);
  const record = researchRecord(c.birth, chart);
  for (const p of leafPaths(record)) seen.add(p);
  for (const k of Object.keys(record)) topLevelSeen.add(k);
  if (record.warnings.length > 0) warningsCovered = true;
  if (record.dayun.length === 0) {
    fail(`${c.name}: dayun is empty, so its paths cannot be checked — pick a case with 大运`);
  }
}

if (!warningsCovered) {
  fail(
    'no pinned case produced an engine warning, so warnings[] is unverifiable — ' +
      'the 立春 boundary case must stay in CASES (1990-02-04 10:14 Beijing)',
  );
}

const disclosed = new Set(COMMONS_DISCLOSURE.map((f) => f.path));

// ---- 1. nothing undisclosed ----
for (const path of [...seen].sort()) {
  if (!disclosed.has(path)) {
    fail(`UNDISCLOSED: the record sends "${path}" and COMMONS_DISCLOSURE does not name it`);
  }
}

// ---- 2. nothing stale ----
for (const f of COMMONS_DISCLOSURE) {
  if (!seen.has(f.path)) {
    fail(`STALE: COMMONS_DISCLOSURE names "${f.path}" but no pinned record produces it`);
  }
}

// ---- 3. no invisible top-level fields ----
const disclosedTop = new Set(
  COMMONS_DISCLOSURE.map((f) => f.path.replace(/\[\]/g, '').split('.')[0]),
);
for (const k of topLevelSeen) {
  if (!disclosedTop.has(k)) fail(`UNDISCLOSED TOP-LEVEL KEY: "${k}"`);
}
for (const k of disclosedTop) {
  if (!topLevelSeen.has(k)) fail(`STALE TOP-LEVEL KEY: "${k}" is disclosed but never produced`);
}

// ---- 4. risk labels intact ----
const byPath = new Map(COMMONS_DISCLOSURE.map((f) => [f.path, f]));
for (const p of MUST_BE_IDENTIFYING) {
  const f = byPath.get(p);
  if (!f) {
    fail(`MISSING: "${p}" must be disclosed (it narrows the birth moment)`);
  } else if (!f.identifying) {
    fail(
      `RISK DOWNGRADE: "${p}" is no longer marked identifying — it narrows the birth ` +
        'moment (see the reconstruction cliff in DisclosedField)',
    );
  }
}

// ---- hygiene: no duplicate paths, no empty English ----
const counts = new Map<string, number>();
for (const f of COMMONS_DISCLOSURE) {
  counts.set(f.path, (counts.get(f.path) ?? 0) + 1);
  if (!f.english.trim()) fail(`EMPTY ENGLISH: "${f.path}" has no reader-facing description`);
}
for (const [p, n] of counts) {
  if (n > 1) fail(`DUPLICATE: "${p}" is disclosed ${n} times`);
}

// ---- report ----
const identifying = COMMONS_DISCLOSURE.filter((f) => f.identifying).length;
if (failures.length > 0) {
  console.error(`check:commons FAILED — ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    '\nThe commons collects everything by design (2026-08-27). That is only honest if ' +
      'the disclosure list matches the payload exactly — fix lib/research.ts.',
  );
  process.exit(1);
}

console.log(
  `check:commons OK — ${COMMONS_DISCLOSURE.length} disclosed fields across ${CASES.length} ` +
    `pinned births; ${seen.size} distinct leaf paths on the wire; ${identifying} marked ` +
    'identifying (they narrow the birth moment).',
);
