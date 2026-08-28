/**
 * Live end-to-end: call the REAL runTutor() with the REAL payload against a real endpoint,
 * then grade the reply with the real audit + engine cross-check.
 *
 *   DEEPSEEK_API_KEY=... bun run app/scripts/live-deepseek-smoke.ts [model]
 *
 * Not in CI (needs a key and the network). It exists so "the reading works" is measured rather
 * than inferred from green offline gates — the failure it was written for was a 200 response
 * carrying an empty completion, which every offline gate happily passed.
 */
import { computeChart } from '@bazilionaire/engine';
import { factsheet } from '../lib/factsheet';
import { reading } from '../lib/reading';
import { auditTutorText, MAX_COMPLETION_TOKENS, runTutor, tutorPayload } from '../lib/tutor';
import { verifyTutorOutput } from '../lib/verify';

const key = (process.env.DEEPSEEK_API_KEY ?? '').trim();
if (!key) {
  console.error('DEEPSEEK_API_KEY is required');
  process.exit(1);
}
const model = process.argv[2] ?? 'deepseek-v4-pro';
const baseUrl = process.argv[3] ?? 'https://api.deepseek.com/v1';

// The same pinned chart the offline gates use: 1990-07-15 03:30, clock school, male.
const chart = computeChart(1990, 7, 15, 3, 30, undefined, 1, 'clock');
const facts = factsheet(chart, { year: 2026 });
const movements = reading(chart, facts, { year: 2026 });
const payload = tutorPayload(facts, movements, { minimize: false });

console.log(`model=${model}  budget=${MAX_COMPLETION_TOKENS}  fact lines=${payload.lines.length}`);
console.log('calling runTutor() — the same function the panel calls…\n');

const started = Date.now();
let text: string;
try {
  text = await runTutor({ baseUrl, model, apiKey: key }, payload);
} catch (e) {
  console.error('FAILED:', e instanceof Error ? e.message : String(e));
  process.exit(1);
}
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`returned ${text.length} chars in ${secs}s\n`);

const audit = auditTutorText(text, payload.allowedIds);
const verdicts = verifyTutorOutput(
  audit.sentences.map((s) => ({ text: s.text, cites: s.cites })),
  payload.sent,
);

console.log(
  `sentences=${audit.sentences.length}  uncited=${audit.unanchored}  ` +
    `fabricated=${audit.fabricated}  fence_violations=${audit.violations}`,
);
const flagged = (verdicts.sentences ?? []).filter((s) => (s.findings ?? []).length > 0);
console.log(`engine cross-check: ${flagged.length} sentence(s) with findings`);
for (const s of flagged.slice(0, 4)) {
  for (const f of s.findings ?? []) console.log(`  - ${f.kind}: ${f.note}`.slice(0, 200));
}

console.log('\n--- first 900 chars ---');
console.log(text.trim().slice(0, 900));
