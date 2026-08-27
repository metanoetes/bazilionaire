/**
 * Gate: the app's 纳音 reading lexicon must line up exactly with the engine's
 * doctrine table. NAYIN_LEXICON[i] has to name the same tone the engine gives
 * ganzhi 2i and 2i+1, and claim those two ganzhi as its own pairs.
 *
 * Run: bun run --cwd app check:nayin   (or `bun run check:nayin` from root)
 *
 * Why a script and not a unit test: the app has no test runner, and the
 * engine's vitest suite is deliberately standalone (it must pass with the app
 * absent). This is the seam between them, so it gets its own gate, wired into
 * CI next to the engine tests.
 */
import { NAYIN, ganzhiOf } from '@bazilionaire/engine';
import { NAYIN_LEXICON } from '../lib/nayin';

const errors: string[] = [];

if (NAYIN_LEXICON.length !== 30) {
  errors.push(`expected 30 nayin entries, found ${NAYIN_LEXICON.length}`);
}

const seen = new Set<string>();
for (const e of NAYIN_LEXICON) {
  if (seen.has(e.name)) errors.push(`duplicate nayin name: ${e.name}`);
  seen.add(e.name);
}

NAYIN_LEXICON.forEach((e, i) => {
  const a = 2 * i;
  const b = 2 * i + 1;

  if (NAYIN[a] !== e.name) {
    errors.push(`entry ${i}: engine NAYIN[${a}] is ${NAYIN[a]}, lexicon says ${e.name}`);
  }
  if (NAYIN[b] !== e.name) {
    errors.push(`entry ${i}: engine NAYIN[${b}] is ${NAYIN[b]}, lexicon says ${e.name}`);
  }

  const pa = ganzhiOf(a).name;
  const pb = ganzhiOf(b).name;
  if (e.pairs[0] !== pa || e.pairs[1] !== pb) {
    errors.push(`${e.name}: pairs are ${e.pairs.join(' ')}, engine indices ${a}/${b} are ${pa} ${pb}`);
  }

  // The tone's element is the name's last character (海中金 → 金).
  const tail = e.name.slice(-1);
  if (!e.element.startsWith(tail)) {
    errors.push(`${e.name}: element "${e.element}" does not start with the name's tail ${tail}`);
  }

  if (e.pinyin.split(' ').length !== e.name.length) {
    errors.push(`${e.name}: pinyin "${e.pinyin}" does not have ${e.name.length} syllables`);
  }
  if (!e.english || !e.image) {
    errors.push(`${e.name}: missing english/image gloss`);
  }
});

if (errors.length > 0) {
  console.error('纳音 lexicon check FAILED:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`纳音 lexicon check passed — 30 tones aligned with the engine's 60-ganzhi table.`);
