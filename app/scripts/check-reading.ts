/**
 * Gate: the 解盘 prose is DETERMINISTIC.
 *
 * Renders the fact sheet + all eight movements for a set of pinned births at a
 * pinned year, and byte-compares against scripts/golden/reading.golden.txt.
 * Any change to lib/factsheet.ts, lib/reading.ts, or the engine's derived
 * layers shows up here as a diff instead of quietly rewriting what readers see.
 *
 *   bun run --cwd app check:reading              # verify
 *   UPDATE_GOLDEN=1 bun run --cwd app check:reading   # accept new output
 *
 * Also enforces the editorial fence mechanically, on the rendered prose:
 *   - no second-person future ("you will", "you'll", "will be", "is going to")
 *   - no fortune vocabulary (lucky/unlucky/fortunate/success/wealth will …)
 *   - every cited fact id must exist in the fact sheet
 *   - every fact id in the sheet must be cited by some movement, or explicitly
 *     listed as intentionally uncited below (so a new fact can't be added and
 *     silently never read)
 * These are the rules the prose promises in lib/reading.ts's header; a taste
 * rule can't be automated, but these can, so they are.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { computeChart } from '@bazilionaire/engine';
import { factsheet } from '../lib/factsheet';
import { reading, FENCE_PATTERNS } from '../lib/reading';

const PINNED_YEAR = 2026;

/** Pinned births: two from fixtures/inputs.json, plus a no-location case. */
const CASES: Array<{
  name: string;
  args: Parameters<typeof computeChart>;
}> = [
  {
    name: 'anchor-1949 Beijing male, solar-school default',
    args: [1949, 10, 1, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 1],
  },
  {
    name: 'anchor-2024 Beijing female (立春 boundary month)',
    args: [2024, 2, 10, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 0],
  },
  {
    name: 'no location, clock school, male',
    args: [1990, 7, 15, 3, 30, undefined, 1, 'clock'],
  },
  {
    name: 'no gender — 大运 uncomputed',
    args: [2000, 1, 1, 12, 0, { lonDeg: 0, tzHours: 0 }],
  },
  {
    // Review finding (2026-08-27): none of the pinned charts was rootless, so the
    // F-ROOTLESS fact and the rootless paragraph in M-STANDING were never gated.
    // 1960-03-12 06:00 Beijing → 庚子 己卯 己亥 丁卯, 身弱 −0.45, no branch carrying
    // the day master's element.
    name: 'rootless chart (F-ROOTLESS + the rootless paragraph)',
    args: [1960, 3, 12, 6, 0, { lonDeg: 116.391, tzHours: 8 }, 1],
  },
];

/** Facts that legitimately go uncited by the prose. Empty on purpose: today
 *  every computed fact is read by some movement, and a new fact that nothing
 *  reads should fail this gate until either the prose or this set is updated. */
const UNCITED_OK = new Set<string>([]);

const problems: string[] = [];
const out: string[] = [];

for (const c of CASES) {
  const chart = computeChart(...c.args);
  const facts = factsheet(chart, { year: PINNED_YEAR });
  const movements = reading(chart, facts, { year: PINNED_YEAR });
  const ids = new Set(facts.map((f) => f.id));
  const cited = new Set(movements.flatMap((m) => m.cites));

  out.push('='.repeat(78));
  out.push(`CASE: ${c.name}`);
  out.push(`PILLARS: ${chart.year} ${chart.month} ${chart.day} ${chart.time}  (year=${PINNED_YEAR})`);
  out.push('='.repeat(78));
  out.push('');
  out.push('--- FACTS ---');
  for (const f of facts) {
    out.push(`${f.id} [${f.layer}] ${f.term ?? '-'} | ${f.label} = ${f.value}${f.detail ? ` | ${f.detail}` : ''}`);
  }
  out.push('');
  out.push('--- MOVEMENTS ---');
  for (const m of movements) {
    out.push(`## ${m.id} ${m.zh} ${m.pinyin} — ${m.title}`);
    out.push(`   cites: ${m.cites.join(', ') || '(none)'}`);
    for (const p of m.paragraphs) out.push(`   ${p}`);
    out.push('');
  }

  // --- structural checks ---
  for (const m of movements) {
    for (const id of m.cites) {
      if (!ids.has(id)) problems.push(`${c.name}: movement ${m.id} cites unknown fact ${id}`);
    }
    if (m.paragraphs.some((p) => p.includes('undefined') || p.includes('NaN'))) {
      problems.push(`${c.name}: movement ${m.id} rendered undefined/NaN`);
    }
    if (m.paragraphs.length === 0) problems.push(`${c.name}: movement ${m.id} is empty`);
  }
  for (const id of ids) {
    if (!cited.has(id) && !UNCITED_OK.has(id)) {
      problems.push(`${c.name}: fact ${id} is never cited by any movement`);
    }
  }
  if (movements.length !== 8) {
    problems.push(`${c.name}: expected 8 movements, got ${movements.length}`);
  }
  const prose = movements.flatMap((m) => m.paragraphs).join('\n');
  for (const re of FENCE_PATTERNS) {
    const hit = prose.match(re);
    if (hit) problems.push(`${c.name}: banned phrase in prose — "${hit[0]}" (${re})`);
  }
}

const rendered = out.join('\n');
const goldenUrl = new URL('./golden/reading.golden.txt', import.meta.url);

if (problems.length > 0) {
  console.error('解盘 prose check FAILED (structure/fence):');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (process.env.UPDATE_GOLDEN === '1') {
  mkdirSync(new URL('./golden/', import.meta.url), { recursive: true });
  writeFileSync(goldenUrl, rendered);
  console.log(`golden file updated (${rendered.split('\n').length} lines) — review the diff before committing.`);
  process.exit(0);
}

if (!existsSync(goldenUrl)) {
  console.error(`No golden file at ${goldenUrl.pathname}. Create it with: UPDATE_GOLDEN=1 bun run check:reading`);
  process.exit(1);
}

const golden = readFileSync(goldenUrl, 'utf8');
if (golden !== rendered) {
  const g = golden.split('\n');
  const r = rendered.split('\n');
  const firstDiff = g.findIndex((line: string, i: number) => line !== r[i]);
  console.error('解盘 prose check FAILED — output differs from the golden file.');
  console.error(`  first difference at line ${firstDiff + 1}:`);
  console.error(`    golden:   ${g[firstDiff] ?? '(end of file)'}`);
  console.error(`    rendered: ${r[firstDiff] ?? '(end of file)'}`);
  console.error(`  golden lines: ${g.length}, rendered lines: ${r.length}`);
  console.error('  If the change is intended: UPDATE_GOLDEN=1 bun run check:reading');
  process.exit(1);
}

console.log(
  `解盘 prose check passed — ${CASES.length} pinned charts, 8 movements each, byte-identical to the golden file.`,
);
