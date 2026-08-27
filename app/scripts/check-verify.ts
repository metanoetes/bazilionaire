/**
 * Gate: the engine's cross-check of tutor claims actually works, in both
 * directions.
 *
 *   bun run --cwd app check:verify
 *
 * Direction 1 — it CATCHES: for a real computed chart, synthetic sentences that
 * swap a verdict, name the wrong stage, invent doctrine, invent a number, or
 * cite the wrong fact must come back with the right verdict. A checker that
 * misses these makes the badges on the page meaningless.
 *
 * Direction 2 — it does NOT FALSE-POSITIVE: hand-written sentences of the kind
 * a good tutor produces (correct, cited, in the register the system prompt asks
 * for) must come back 'ok'. This is the direction that decides whether the
 * feature is usable at all: a checker that flags good output would train the
 * reader to ignore it, which is worse than shipping nothing.
 *
 * The chart is pinned so both directions are stable, and every expectation is
 * written against the ENGINE's real values for it, not invented ones.
 */
import { computeChart } from '@bazilionaire/engine';
import { factsheet } from '../lib/factsheet';
import { reading } from '../lib/reading';
import { verifySentence, tokenize, groupsMissingAuthority } from '../lib/verify';

// 1990-07-15 03:30, clock school, male → 庚午 癸未 辛巳 庚寅.
const chart = computeChart(1990, 7, 15, 3, 30, undefined, 1, 'clock');
const facts = factsheet(chart, { year: 2026 });
const byId = new Map(facts.map((f) => [f.id, f]));

const problems: string[] = [];
let PROSE_CHART_COUNT = 0;

/** Sanity: the pinned chart is what the expectations below assume. */
const expectPillars = '庚午 癸未 辛巳 庚寅';
const actualPillars = `${chart.year} ${chart.month} ${chart.day} ${chart.time}`;
if (actualPillars !== expectPillars) {
  problems.push(`pinned chart drifted: expected ${expectPillars}, got ${actualPillars}`);
}
if (chart.strength.verdict !== '身强') {
  problems.push(`pinned chart strength drifted: expected 身强, got ${chart.strength.verdict}`);
}

type Case = {
  name: string;
  sentence: string;
  cites: string[];
  expect: 'ok' | 'miscited' | 'ungrounded' | 'contradicted';
  /** Substring that must appear in some finding's note. */
  expectNote?: string;
};

const CASES: Case[] = [
  // ---- direction 1: must catch ----
  {
    name: 'swapped strength verdict (English alias)',
    sentence: 'This chart is weak overall, so it needs support. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'contradicted',
    expectNote: '身强',
  },
  {
    name: 'swapped 得令',
    sentence: 'The month does not command the season for this day master. [F-DELING]',
    cites: ['F-DELING'],
    expect: 'contradicted',
    expectNote: '得令',
  },
  {
    name: 'wrong growth stage for the day pillar',
    sentence: 'In its own branch the day master stands at 帝旺, its peak. [F-XINGYUN-DAY]',
    cites: ['F-XINGYUN-DAY'],
    expect: 'contradicted',
    expectNote: '死',
  },
  {
    name: 'invented 神煞 doctrine',
    sentence: 'The chart carries 天乙贵人, the noble one. [F-PATTERN]',
    cites: ['F-PATTERN'],
    expect: 'ungrounded',
    expectNote: '天乙贵人',
  },
  {
    name: 'invented number',
    sentence: 'The blended score lands at +0.91 for this plate. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'ungrounded',
    expectNote: '0.91',
  },
  {
    // Right answer, wrong receipt — on a chart-level group, which is where
    // miscitation is worth flagging. Presence tokens (a stem, a branch, an
    // element) are deliberately NOT flagged this way: a sentence may mention the
    // day master while citing the season fact, and calling that a problem would
    // train the reader to ignore the badges.
    name: 'right chart-level value, wrong citation',
    sentence: 'Blended over its factors this plate lands 身强. [F-DELING]',
    cites: ['F-DELING'],
    expect: 'miscited',
    expectNote: '身强',
  },
  {
    name: 'wrong 十神 for the year stem',
    sentence: 'The year stem reads 正官 against the day master. [F-DESHI]',
    cites: ['F-DESHI'],
    expect: 'contradicted',
  },

  // ---- direction 2: must not false-positive ----
  {
    name: 'good: season command, correctly cited',
    sentence:
      'The month 未 is earth, and earth generates metal, so the season carries this 辛 day master rather than draining it — 相, and 得令. [F-DELING]',
    cites: ['F-DELING'],
    expect: 'ok',
  },
  {
    name: 'good: the single root',
    sentence: 'One branch answers underneath: 巳 holds 庚 at 中气 depth. [F-ROOT-1]',
    cites: ['F-ROOT-1'],
    expect: 'ok',
  },
  {
    name: 'good: strength with its own number',
    sentence: 'Blended, the plate lands 身强 at 0.33. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'ok',
  },
  {
    name: 'good: stage naming, correctly cited',
    sentence: 'In its own branch 巳 the day master sits at 死. [F-XINGYUN-DAY]',
    cites: ['F-XINGYUN-DAY'],
    expect: 'ok',
  },
  {
    name: 'good: teaching the twelve stages (enumeration, not a claim)',
    sentence:
      'The twelve run 长生, 沐浴, 冠带, 临官, 帝旺, 衰, 病, 死, 墓, 绝, 胎, 养 — a cycle, not a scorecard. [F-XINGYUN-DAY]',
    cites: ['F-XINGYUN-DAY'],
    expect: 'ok',
  },
  {
    name: 'good: 帝旺 mentioned as the strongest STAGE, not a strength claim',
    sentence: 'A stem sitting at 帝旺 is at the strongest of the twelve stages. [F-XINGYUN-MONTH]',
    cites: ['F-XINGYUN-MONTH'],
    expect: 'ok',
  },
  {
    name: 'good: nayin tone with its image',
    sentence: 'The day pillar sounds 白蜡金, metal pale and new out of the mold. [F-TONE-DAY]',
    cites: ['F-TONE-DAY'],
    expect: 'ok',
  },
  {
    name: 'good: no checkable content at all',
    sentence: 'None of this describes what to do about any of it. [F-YONGSHEN]',
    cites: ['F-YONGSHEN'],
    expect: 'ok',
  },

  // ---- regressions from the 2026-08-27 three-model review (each was an
  // executed counter-example produced by a reviewer, not a hypothetical) ----
  {
    // GLM: /\bweak\b/ read ordinary description of a ROOT as a claim about the
    // chart's strength verdict.
    name: 'review/GLM: "weak seat" describes a root, not the chart',
    sentence: 'The root at 巳 is a weak seat for the day master. [F-ROOT-1]',
    cites: ['F-ROOT-1'],
    expect: 'ok',
  },
  {
    name: 'review/GLM: "strong root" describes a root, not the chart',
    sentence: '巳 gives the day master a strong root underneath. [F-ROOT-1]',
    cites: ['F-ROOT-1'],
    expect: 'ok',
  },
  {
    // Sonnet: negation is not modelled, so a negated verdict asserts nothing.
    name: 'review/Sonnet: negated verdict asserts neither value',
    sentence: 'This chart is not strong. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'ok',
  },
  {
    // GLM: the 用神 method is one chart-wide value; typed 'pillar' it was
    // unenforceable because F-YONGSHEN's anchors are stems/branches.
    name: 'review/GLM: wrong 用神 method must contradict',
    sentence: 'The lens the decision order leans on here is 调候. [F-YONGSHEN]',
    cites: ['F-YONGSHEN'],
    expect: 'contradicted',
    expectNote: '扶抑',
  },
  {
    // GLM: substring number matching let 0.3 pass against a fact's 0.33.
    name: 'review/GLM: a decimal that is only a substring of the real one',
    sentence: 'Blended, the plate lands 身强 at 0.3. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'ungrounded',
    expectNote: '0.3',
  },
  {
    // Sonnet: pooling citations let a misattribution hide behind a correct one.
    name: 'review/Sonnet: misattributed stage across two cited stage facts',
    sentence: 'At the day pillar the day master stands at 衰. [F-XINGYUN-YEAR][F-XINGYUN-DAY]',
    cites: ['F-XINGYUN-YEAR', 'F-XINGYUN-DAY'],
    expect: 'contradicted',
    expectNote: 'F-XINGYUN-DAY',
  },
  {
    // DeepSeek: "under this plate is strong" is about a ROOT, not the chart.
    name: 'review/DeepSeek: prepositional subject is not a strength claim',
    sentence: 'The single root under this plate is strong enough to matter. [F-ROOT-1]',
    cites: ['F-ROOT-1'],
    expect: 'ok',
  },
  {
    name: 'review/DeepSeek: "strong seasonal footing" is not a strength claim',
    sentence: 'The month branch gives a strong seasonal footing. [F-DELING]',
    cites: ['F-DELING'],
    expect: 'ok',
  },
  {
    name: 'review/DeepSeek: "weak channel of output" is not a strength claim',
    sentence: 'Metal here has a weak channel of output. [F-DESHI]',
    cites: ['F-DESHI'],
    expect: 'ok',
  },
  {
    // DeepSeek: teaching a closed vocabulary must not read as invented doctrine.
    name: 'review/DeepSeek: enumerating the ten stems is teaching, not invention',
    sentence: 'The ten stems run 甲 乙 丙 丁 戊 己 庚 辛 壬 癸. [F-DAYMASTER]',
    cites: ['F-DAYMASTER'],
    expect: 'ok',
  },
  {
    // DeepSeek: 0.3 must not pass as grounded against a fact reading 0.33.
    name: 'review/DeepSeek: truncated decimal is not grounded',
    sentence: 'The score is 0.3 exactly. [F-STRENGTH]',
    cites: ['F-STRENGTH'],
    expect: 'ungrounded',
  },
  {
    // GLM: an explicit seat assertion must not hide inside an enumeration.
    name: 'review/GLM: enumeration must not launder an explicit seat claim',
    sentence:
      'The day master passes 长生, 帝旺 and 绝 across the plate; at the day pillar it is at 绝. [F-XINGYUN-DAY]',
    cites: ['F-XINGYUN-DAY'],
    expect: 'contradicted',
  },
];

for (const c of CASES) {
  for (const id of c.cites) {
    if (!byId.has(id)) problems.push(`${c.name}: test cites ${id}, which the sheet does not have`);
  }
  const r = verifySentence(c.sentence, c.cites, facts);
  if (r.verdict !== c.expect) {
    problems.push(
      `${c.name}: expected ${c.expect}, got ${r.verdict} — findings: ${
        r.findings.map((f) => `${f.kind}:${f.group}(${f.note})`).join(' | ') || 'none'
      }`,
    );
  }
  if (c.expectNote && !r.findings.some((f) => f.note.includes(c.expectNote!))) {
    problems.push(`${c.name}: no finding mentioned "${c.expectNote}"`);
  }
}

/**
 * DeepSeek's 羊刃 case, on its own chart: 1950-05-12 06:00 Beijing → 庚寅 辛巳 丁未 丙午,
 * pattern 羊刃格. The sheet's 羊刃格 tokenizes as a PATTERN, so tokenized membership
 * said the 神煞 羊刃 was absent and a correct sentence was flagged as invented.
 */
{
  const bladeChart = computeChart(1950, 5, 12, 6, 0, { lonDeg: 116.391, tzHours: 8 }, 1);
  const bladeFacts = factsheet(bladeChart, { year: 2026 });
  if (bladeChart.pattern.primary.name !== '羊刃格') {
    problems.push(`blade case drifted: expected 羊刃格, got ${bladeChart.pattern.primary.name}`);
  }
  const r = verifySentence(
    'This plate carries the 羊刃 — the blade seat in the month. [F-PATTERN]',
    ['F-PATTERN'],
    bladeFacts,
  );
  if (r.verdict !== 'ok') {
    problems.push(
      `羊刃 on a 羊刃格 chart: expected ok, got ${r.verdict} — ${r.findings.map((f) => f.note).join('; ')}`,
    );
  }
}

// Coverage: an exclusive group with no authoritative fact silently stops being
// checked. Fail loudly instead.
{
  const missing = groupsMissingAuthority();
  if (missing.length > 0) {
    problems.push(`groups with no AUTHORITY entry (claims there are never checked): ${missing.join(', ')}`);
  }
}

// Tokenizer: longest match must win, or every check above is unsound.
{
  const t = tokenize('正财格 and 正财 and 海中金 and 帝旺 and 旺');
  const pattern = [...(t['格局 pattern'] ?? [])];
  const shishen = [...(t['十神'] ?? [])];
  const tone = [...(t['纳音 tone'] ?? [])];
  const stage = [...(t['十二长生 stage'] ?? [])];
  if (!pattern.includes('正财格')) problems.push('tokenizer: 正财格 not read as a pattern');
  if (!shishen.includes('正财')) problems.push('tokenizer: standalone 正财 not read as a 十神');
  if (!tone.includes('海中金')) problems.push('tokenizer: 海中金 not read as a tone');
  if ((t['五行 element'] ?? new Set()).has('金')) {
    problems.push('tokenizer: 金 inside 海中金 leaked as a bare element');
  }
  if (!stage.includes('帝旺')) problems.push('tokenizer: 帝旺 not read as a stage');
}

/**
 * The strongest false-positive net available: the template's OWN prose is
 * known-correct by construction (it is composed from the facts and gated by the
 * golden file), so running every sentence of it through the checker must produce
 * zero findings. This sweep is what caught the checker flagging counts the prose
 * had legitimately derived ("in 4 places", "1×火 · 2×金") — 10 sentences out of
 * 200 — which is why only decimals are number-checked now.
 */
{
  const PROSE_CASES: Array<Parameters<typeof computeChart>> = [
    [1949, 10, 1, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 1],
    [2024, 2, 10, 12, 0, { lonDeg: 116.391, tzHours: 8 }, 0],
    [1990, 7, 15, 3, 30, undefined, 1, 'clock'],
    [2000, 1, 1, 12, 0, { lonDeg: 0, tzHours: 0 }],
    [1960, 3, 12, 6, 0, { lonDeg: 116.391, tzHours: 8 }, 1], // rootless
  ];
  PROSE_CHART_COUNT = PROSE_CASES.length;
  let checkedSentences = 0;
  for (const args of PROSE_CASES) {
    const c = computeChart(...args);
    const f = factsheet(c, { year: 2026 });
    for (const m of reading(c, f, { year: 2026 })) {
      if (m.cites.length === 0) continue; // the closing clause cites nothing by design
      for (const para of m.paragraphs) {
        for (const s of para.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
          if (s.trim().length < 8) continue;
          checkedSentences += 1;
          const r = verifySentence(s, m.cites, f);
          if (r.verdict !== 'ok') {
            problems.push(
              `prose sweep [${c.day} ${m.id}] flagged known-good prose as ${r.verdict}: "${s.slice(0, 70)}" — ${r.findings
                .filter((x) => x.kind !== 'enumeration')
                .map((x) => x.note)
                .join('; ')}`,
            );
          }
        }
      }
    }
  }
  if (checkedSentences < 100) {
    problems.push(`prose sweep only examined ${checkedSentences} sentences — expected 100+`);
  }
}

if (problems.length > 0) {
  console.error('claim cross-check FAILED:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const caught = CASES.filter((c) => c.expect !== 'ok').length;
const clean = CASES.filter((c) => c.expect === 'ok').length;
console.log(
  `claim cross-check passed — ${caught} bad claims caught (swapped verdicts, wrong stage, invented doctrine, invented number, miscitation), ${clean} good sentences left alone, and every sentence of the template's own prose across ${PROSE_CHART_COUNT} charts came back clean.`,
);
