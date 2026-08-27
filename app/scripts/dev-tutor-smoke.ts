/**
 * Dev smoke test: the whole tutor pipeline against a LIVE endpoint, no browser.
 *
 *   bun run --cwd app scripts/dev-tutor-smoke.ts [baseUrl] [model] [--full]
 *   # defaults to http://localhost:11434/v1 llama3.1 (Ollama)
 *
 * Runs exactly what TutorPanel runs — tutorPayload → runTutor → auditTutorText →
 * verifyTutorOutput — and prints the badges the panel would render per sentence.
 * Not in CI: it needs a live endpoint. Use it against Ollama/LM Studio, or
 * against a mock, to see how a real model behaves under the fence before
 * trusting the UI.
 *
 * A key is read from TUTOR_API_KEY if the endpoint needs one. It is never
 * printed.
 */
import { computeChart } from '@bazilionaire/engine';
import { factsheet } from '../lib/factsheet';
import { reading } from '../lib/reading';
import { auditTutorText, runTutor, tutorPayload } from '../lib/tutor';
import { verifyTutorOutput } from '../lib/verify';

const [, , baseUrlArg, modelArg, ...rest] = process.argv;
const baseUrl = baseUrlArg ?? 'http://localhost:11434/v1';
const model = modelArg ?? 'llama3.1';
const minimize = !rest.includes('--full');

const chart = computeChart(1990, 7, 15, 3, 30, undefined, 1, 'clock');
const facts = factsheet(chart, { year: new Date().getFullYear() });
const movements = reading(chart, facts, { year: new Date().getFullYear() });
const payload = tutorPayload(facts, movements, { minimize });

console.log(`chart: ${chart.year} ${chart.month} ${chart.day} ${chart.time}`);
console.log(`endpoint: ${baseUrl} · model: ${model} · ${minimize ? 'minimized' : 'FULL'} sheet`);
console.log(`sending ${payload.lines.length} fact lines\n`);

const text = await runTutor({ baseUrl, model, apiKey: process.env.TUTOR_API_KEY ?? '' }, payload);
const audit = auditTutorText(text, payload.allowedIds);
const verified = verifyTutorOutput(
  audit.sentences.map((s) => ({ text: s.text, cites: s.cites })),
  payload.sent,
);

audit.sentences.forEach((s, i) => {
  const v = verified.sentences[i];
  const badges: string[] = [];
  if (s.cites.length > 0) badges.push(s.cites.join(' '));
  if (s.cites.length === 0 && s.unknownCites.length === 0) badges.push('UNCITED');
  for (const c of s.unknownCites) badges.push(`FABRICATED:${c}`);
  if (s.fenceHits.length > 0) badges.push(`FLAGGED:${s.fenceHits.join(',')}`);
  if (v.verdict === 'contradicted') badges.push('CONTRADICTS THE ENGINE');
  else if (v.verdict === 'ungrounded') badges.push('NOT IN THE FACTS');
  else if (v.verdict === 'miscited') badges.push('MISCITED');

  console.log(`${i + 1}. ${s.text.replace(/\[(F-[A-Z0-9-]+)\]/g, '').trim()}`);
  console.log(`   → ${badges.join(' | ') || 'clean'}`);
  for (const f of v.findings.filter((x) => x.kind !== 'enumeration')) {
    console.log(`     · ${f.note}`);
  }
});

console.log(
  `\nsummary: ${audit.unanchored} uncited · ${audit.fabricated} fabricated citation(s) · ` +
    `${audit.violations} fence violation(s) · ${verified.contradicted} contradicting the engine · ` +
    `${verified.ungrounded} ungrounded · ${verified.miscited} miscited`,
);
