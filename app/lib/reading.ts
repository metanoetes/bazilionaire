/**
 * 解盘 jiě pán — unpacking the plate. LAYER 1: deterministic prose.
 *
 * English composed from the fact sheet by template. No network, no model, no
 * randomness: the same chart yields the same words forever, and the prose gate
 * (scripts/check-reading.ts) pins that against a golden file.
 *
 * WHAT THIS IS ALLOWED TO SAY — the fence, in code review terms:
 *   - It may TRANSLATE the doctrine: what a stem, a season state, a tone, a
 *     pattern, a relation IS, in English, with the tradition's own imagery.
 *   - It may NOT APPLY it. No prediction, no advice, no outcome, no dates
 *     tied to events, nothing about money, health, marriage, or death.
 *   - No second-person future. "you will" does not appear; the register is
 *     "this plate is / the tradition reads this as". The only second person in
 *     the whole file is the closing clause's "this chart does not bind you",
 *     which is the site's own shipped line.
 *   - The poetry is the TRADITION'S: 纳音 images, 十二长生 stage names, the
 *     seasonal states. Peter's own voice is reserved for the final movement.
 * The prose gate can't enforce taste, so these rules live here, next to the
 * strings they govern. A sentence that breaks them is a bug, not a style note.
 *
 * Every movement carries `cites` — the fact ids it was composed from. The UI
 * renders them, so any sentence can be traced back to engine output. This is
 * also the contract the phase-2 tutor inherits: same facts, same citations,
 * and anything it writes without a fact id is flagged rather than trusted.
 */
import { lexiconFor } from './lexicon';
import { nayinFor } from './nayin';
import type { Fact } from './factsheet';
import { factsById } from './factsheet';
import { twelveStageOf, type Chart } from '@bazilionaire/engine';

export interface Movement {
  id: string;
  /** Chinese heading term (rendered through ClickableCJK). */
  zh: string;
  pinyin: string;
  /** English subtitle. */
  title: string;
  /** Fact ids this movement was composed from. */
  cites: string[];
  paragraphs: string[];
}

/** 旺相休囚死 — what the month's verdict MEANS, mechanism stated explicitly. */
const SEASON_IMAGE: Record<string, string> = {
  旺: 'its own season — the element at home, in command of the month',
  相: 'the season generates it — supported, carried by what the month already is',
  休: 'it generates the season — resting, spending itself outward into the month',
  囚: 'it controls the season — confined, using itself up holding the month down',
  死: 'the season controls it — dormant, working against the grain of the month',
};

/** What each pattern WANTS, in module 10's own register. Agenda, never advice. */
const PATTERN_AGENDA: Record<string, string> = {
  正官格: 'a 正官格 wants its officer protected and fed — the structure that restrains the day master is the thing worth keeping intact',
  七杀格: 'a 七杀格 wants its pressure channelled rather than removed — the weight is the engine, if something carries it',
  正财格: 'a 正财格 wants its wealth guarded and worked — cultivated ground, not a windfall',
  偏财格: 'a 偏财格 wants its wealth circulating — held loosely, moved often',
  正印格: 'a 正印格 wants its resource unblocked — the shelter that feeds the day master kept clear',
  偏印格: 'a 偏印格 wants its resource put to use — inherited strangeness turned into craft',
  食神格: 'a 食神格 wants its output unblocked — the making is the point, and nothing should starve it',
  伤官格: 'a 伤官格 wants its talent given a channel — invention with somewhere to go',
  建禄格: 'a 建禄格 stands on its own seat of office — a plate that already has standing, and asks what the standing is for',
  羊刃格: 'a 羊刃格 carries the blade — the same edge that cuts well cuts wide, and the tradition reads it as force needing a discipline',
};

const PILLAR_EN = ['year', 'month', 'day', 'hour'] as const;

/**
 * The editorial fence, as patterns — one canonical list, shared by:
 *   - scripts/check-reading.ts, over this file's own composed prose
 *   - lib/tutor.ts, over whatever a model writes at runtime (phase 2)
 * A fence that only applies to the template and not to the model would be
 * decoration.
 *
 * There are NO exemptions. An earlier version allowed a sentence-final "lucky."
 * so the prose could say "the computation has no word for lucky" — and that hole
 * passed model output like "This decade will feel lucky." The prose gave up the
 * word instead; a fence with a carve-out is a fence with a gate in it.
 */
export const FENCE_PATTERNS: RegExp[] = [
  /\byou will\b/i,
  /\byou'll\b/i,
  /\byou are going to\b/i,
  /\bwill bring\b/i,
  /\bwill be\b/i,
  /\bpromises\b/i,
  /\blucky\b/i,
  /\bunlucky\b/i,
  /\bfortunate\b/i,
  /\bauspicious\b/i,
  /\binauspicious\b/i,
  /\bblessed\b/i,
  /\bcursed\b/i,
  /\bwill (?:feel|read|prove|turn out|come|arrive|favou?r|reward)\b/i,
  /\bexpect\b/i,
  /\byou should\b/i,
  /\byou can expect\b/i,
  /\badvise\b/i,
  /\bbrings\b/i,
  /\bguarantee/i,
  /\bdestined\b/i,
  /\bfated to\b/i,
];

function pluralize(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/** Capitalize a sentence-initial fragment (the agenda strings start lowercase). */
function cap(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/** Engine evidence strings each end in '.'; join them without doubling periods. */
function joinEvidence(evidence: string[]): string {
  return evidence.map((e) => e.replace(/\.\s*$/, '')).join('; ');
}

/** Join with commas and a final 'and'. */
function listJoin(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function reading(chart: Chart, facts: Fact[], opts: { year: number }): Movement[] {
  const F = factsById(facts);
  const { strength, pattern, yongShen } = chart;
  const dayStem = chart.day[0];
  const dayInfo = lexiconFor(dayStem);
  const monthBranch = chart.month[1];
  const branches: string[] = [chart.year[1], chart.month[1], chart.day[1], chart.time[1]];
  const movements: Movement[] = [];

  // ---------------- 1. the lens ----------------
  const lens: string[] = [
    `Eight characters, four pillars: ${chart.year} ${chart.month} ${chart.day} ${chart.time}. ` +
      `The lens is ${dayStem} — ${dayInfo.pinyin}, ${dayInfo.element}, ${dayInfo.polarity}: ${dayInfo.gloss}. ` +
      `Every line below is read from that one seat. The same eight characters around a different day stem would describe a different plate entirely.`,
    `The hour is read on the ${F['F-SCHOOL'].value} school${
      F['F-SCHOOL'].detail ? ` (${F['F-SCHOOL'].detail})` : ''
    }, and the year animal is ${chart.zodiac}.`,
  ];
  const warnings = facts.filter((f) => f.id.startsWith('F-WARN-'));
  if (warnings.length > 0) {
    lens.push(
      `The engine attached ${pluralize(warnings.length, 'a warning', 'warnings')} to this computation: ${listJoin(
        warnings.map((w) => w.value),
      )}. Boundary honesty comes before a clean reading — a plate computed near a 节 boundary is a plate with a question in it.`,
    );
  }
  movements.push({
    id: 'M-LENS',
    zh: '日主',
    pinyin: 'rì zhǔ',
    title: 'the lens',
    cites: ['F-EIGHT', 'F-DAYMASTER', 'F-SCHOOL', 'F-ZODIAC', ...warnings.map((w) => w.id)],
    paragraphs: lens,
  });

  // ---------------- 2. where it stands ----------------
  const standing: string[] = [];
  standing.push(
    `The month branch is ${monthBranch}. For ${dayStem} that season reads ${strength.deLing.state} — ${
      SEASON_IMAGE[strength.deLing.state] ?? 'a state the table names'
    }; the plate ${strength.deLing.commands ? 'commands the season (得令)' : 'does not command the season (失令)'}.`,
  );

  const roots = strength.roots;
  if (strength.rootless) {
    standing.push(
      `Underneath, nothing answers: no branch carries ${dayStem}'s element as a hidden stem. The tradition calls this rootless — a stem standing in the open, with the whole question of support thrown onto the season and the company it keeps.`,
    );
  } else {
    const rootPhrases = roots.map(
      (r) => `${r.branch} in the ${r.pillar} pillar holds ${r.hiddenStem} at ${r.depth} depth, at the ${r.growthStage} stage`,
    );
    standing.push(
      `Underneath, ${pluralize(roots.length, 'one branch answers', `${roots.length} branches answer`)}: ${listJoin(
        rootPhrases,
      )}. That is what 得地 measures — not whether the day master is visible, but whether the ground under it carries the same element.`,
    );
  }

  const allies = strength.stemSupport.filter((s) => s.polarity === 1);
  const drains = strength.stemSupport.filter((s) => s.polarity === -1);
  standing.push(
    `Of the three other visible stems, ${allies.length} ${pluralize(allies.length, 'supports', 'support')} and ${
      drains.length
    } ${pluralize(drains.length, 'draws', 'draw')} off: ${listJoin(
      strength.stemSupport.map((s) => `${s.stem} in the ${s.pillar} pillar reads ${s.shishen}`),
    )}.`,
  );
  standing.push(
    `Read through the twelve stages — 十二长生, a life cycle laid over every stem-and-branch pairing — the day master sits at ${listJoin(
      branches.map(
        (b, i) =>
          `${twelveStageOf(dayStem, b)} in ${b}${i === 2 ? ' (自坐, its own seat)' : ` (the ${PILLAR_EN[i]} branch)`}`,
      ),
    )}. The engine uses those stages as a finer supplement to the roots above. The tradition reads them as phases of a cycle — 长生 through 墓 and round again — not as a scorecard, and the schools do not agree on whether the yin stems run the cycle backwards.`,
  );
  standing.push(
    `Blended — half the weight on the season, a third on the roots, a fifth on the company — the plate lands ${
      strength.verdict
    } at ${strength.score >= 0 ? '+' : ''}${strength.score.toFixed(2)}. ${
      strength.borderline
        ? 'That is inside the band the engine calls a genuine toss-up: two competent readers could take this plate in opposite directions, and the honest report is that the number does not settle it.'
        : 'The weights and the arithmetic are printed on the chart page; the judgment is a documented heuristic, not a classical formula, and it is meant to be argued with.'
    }`,
  );
  movements.push({
    id: 'M-STANDING',
    zh: '强弱',
    pinyin: 'qiáng ruò',
    title: 'where it stands',
    cites: [
      'F-DELING',
      ...(strength.rootless ? ['F-ROOTLESS'] : roots.map((_, i) => `F-ROOT-${i + 1}`)),
      'F-DEDI',
      'F-DESHI',
      'F-XINGYUN-YEAR',
      'F-XINGYUN-MONTH',
      'F-XINGYUN-DAY',
      'F-XINGYUN-HOUR',
      'F-STRENGTH',
    ],
    paragraphs: standing,
  });

  // ---------------- 3. the shape it makes ----------------
  const shape: string[] = [];
  if (pattern.primary.kind === 'regular') {
    shape.push(
      `The month's presiding god is ${pattern.primary.governingShishen}, carried by the hidden stem ${pattern.primary.monthHiddenStem} — which names this plate a ${pattern.primary.name}. ${cap(
        PATTERN_AGENDA[pattern.primary.name] ?? 'the pattern names the plate\u2019s own agenda',
      )}.`,
    );
  } else {
    shape.push(
      `This plate does not take its name from the month's presiding god. It classifies as ${pattern.primary.name}: ${pattern.primary.note} ${
        PATTERN_AGENDA[pattern.primary.name] ? `${cap(PATTERN_AGENDA[pattern.primary.name])}.` : ''
      }`.trim(),
    );
  }
  shape.push(
    `Pattern comes before medicine: it sets what the plate is trying to do, and the favorable god below is chosen in service of that, not in isolation.`,
  );
  const shapeCites = ['F-PATTERN'];
  if (pattern.extremeCandidate) {
    shapeCites.push('F-EXTREME');
    shape.push(
      `Flagged, not decided: this plate is a ${pattern.extremeCandidate.name} candidate — the tradition's name for a day master that follows the dominant force instead of holding its own (here it would follow ${pattern.extremeCandidate.follows}). This is the most argued-over call in the system, so it surfaces as evidence rather than a verdict: ${joinEvidence(
        pattern.extremeCandidate.evidence,
      )}.`,
    );
  }
  if (pattern.huaqiCandidate) {
    shapeCites.push('F-HUAQI');
    shape.push(
      `Also flagged: a 化气格 candidacy, the plate transforming toward ${pattern.huaqiCandidate.transformElementName} — the rarest and most disputed pattern in the tradition, shown with its evidence and nothing more: ${joinEvidence(
        pattern.huaqiCandidate.evidence,
      )}.`,
    );
  }
  movements.push({
    id: 'M-SHAPE',
    zh: '格局',
    pinyin: 'gé jú',
    title: 'the shape it makes',
    cites: shapeCites,
    paragraphs: shape,
  });

  // ---------------- 4. the medicine it asks for ----------------
  const medicine: string[] = [
    `Five classical lenses run over this plate, and the one the decision order leans on here is ${
      yongShen.recommended.method
    }: ${yongShen.recommended.favorable.join(' / ') || '—'}. ${yongShen.recommended.reasoning}`,
    yongShen.patternAgreement
      ? `扶抑 and the pattern's own governing god agree — the tradition treats that convergence as an unusually solid call.`
      : `扶抑 and the pattern's own god do not agree here. That disagreement is itself the finding: the plate wants two things, and no formula resolves it.`,
    `All five lenses, in the engine's own words:`,
    `扶抑 (${yongShen.fuyi.direction}) — ${yongShen.fuyi.reasoning}`,
    `调候 — ${yongShen.tiaohou.reasoning}`,
    `病药 — ${yongShen.bingyao.reasoning}`,
    `通关 — ${yongShen.tongguan.reasoning}`,
    `专旺 — ${yongShen.zhuanwang.reasoning}`,
    `Naming a medicine is not prescribing one. The engine can say which phase this structure is short of; it cannot say what to do on Monday, and it will not pretend to.`,
  ];
  movements.push({
    id: 'M-MEDICINE',
    zh: '用神',
    pinyin: 'yòng shén',
    title: 'the medicine it asks for',
    cites: ['F-YONGSHEN', 'F-FUYI', 'F-TIAOHOU', 'F-BINGYAO', 'F-TONGGUAN', 'F-ZHUANWANG', 'F-AGREE'],
    paragraphs: medicine,
  });

  // ---------------- 5. where it pulls ----------------
  const rel = facts.filter((f) => f.id.startsWith('F-REL-'));
  const sanhe = facts.filter((f) => f.id.startsWith('F-SANHE-'));
  const tension: string[] = [];
  if (rel.length === 0 && sanhe.length === 0) {
    tension.push(
      `Among the four branches there is no 合, no 冲, no 刑, no 害 — an unusually quiet plate. Quiet is not the same as empty: it means the structure's tension, wherever it lives, is not in the branch relations.`,
    );
  } else {
    tension.push(
      `The branches pull on each other in ${pluralize(rel.length, 'one place', `${rel.length} places`)}: ${listJoin(
        rel.map((r) => `${r.value} (${r.label})`),
      )}.`,
    );
    if (sanhe.length > 0) {
      tension.push(
        `And ${pluralize(sanhe.length, 'a whole three-harmony group closes', 'whole three-harmony groups close')}: ${listJoin(
          sanhe.map((s) => s.value),
        )} — three seats of one phase's season present at once, which the tradition reads as that phase gathered rather than scattered.`,
      );
    }
  }
  // Branch on the CHART, not on the wording of F-VOID's value. Comparing prose
  // against a string literal owned by factsheet.ts meant an innocuous reword
  // there would silently flip this sentence to the wrong branch.
  const voidedPillars = branches.filter((b) => chart.dayXunKong.includes(b));
  tension.push(
    voidedPillars.length === 0
      ? `No pillar sits in a void seat (the day pillar's 旬 is ${chart.dayXun}, voiding ${chart.dayXunKong}).`
      : `Void seats: ${F['F-VOID'].value}. The day pillar's 旬 is ${chart.dayXun}, which empties ${chart.dayXunKong}. A branch in a void seat is read thin, not absent — and a 冲 against it can fill it (冲空则实).`,
  );
  tension.push(`These are relations, not omens. The computation carries no verdict about fortune at all.`);
  movements.push({
    id: 'M-TENSION',
    zh: '关系',
    pinyin: 'guān xì',
    title: 'where it pulls',
    cites: [...rel.map((r) => r.id), ...sanhe.map((s) => s.id), 'F-VOID', ...(rel.length === 0 && sanhe.length === 0 ? ['F-QUIET'] : [])],
    paragraphs: tension,
  });

  // ---------------- 6. how it sounds ----------------
  const toneLines = chart.nayin.map((tone, i) => {
    const entry = nayinFor(tone);
    const pillar = [chart.year, chart.month, chart.day, chart.time][i];
    return `The ${PILLAR_EN[i]} pillar ${pillar} sounds ${tone}${entry ? ` — ${entry.english}: ${entry.image}` : ''}.`;
  });
  const toneElements = chart.nayin.map((t) => nayinFor(t)?.element.split(' ')[0] ?? '—');
  const toneTally = Array.from(new Set(toneElements)).map(
    (e) => `${toneElements.filter((x) => x === e).length}×${e}`,
  );
  const imagery: string[] = [
    `The 纳音 are the tradition's most lyrical layer: each pillar's ganzhi carries a phase-name that situates it somewhere — in the sea, on the rampart, under the lamp. A flavor, not a fortune.`,
    toneLines.join(' '),
    `Across the four pillars the tones run ${toneTally.join(' · ')}. Read them as a register the plate sounds in, not as four more verdicts stacked on the eight characters.`,
  ];
  movements.push({
    id: 'M-IMAGERY',
    zh: '纳音',
    pinyin: 'nà yīn',
    title: 'how it sounds',
    cites: ['F-TONE-YEAR', 'F-TONE-MONTH', 'F-TONE-DAY', 'F-TONE-HOUR'],
    paragraphs: imagery,
  });

  // ---------------- 7. the weather over it ----------------
  const weather: string[] = [];
  const weatherCites: string[] = [];
  if (chart.yun) {
    weatherCites.push('F-QIYUN', 'F-DECADES');
    weather.push(
      `The fixed plate above does not move. Over it runs the 大运 — decade pillars, beginning ${F['F-QIYUN'].value} (${F['F-QIYUN'].detail}), then turning every ten years.`,
    );
    const now = F['F-DECADE-NOW'];
    if (now) {
      weatherCites.push('F-DECADE-NOW');
      weather.push(`The decade covering ${opts.year} is ${now.value}: ${now.detail}.`);
      if (F['F-DECADE-REL']) {
        weatherCites.push('F-DECADE-REL');
        weather.push(
          `That decade's branch meets the month branch as ${F['F-DECADE-REL'].value} — a relation between the moving layer and the plate's strongest seat.`,
        );
      }
    } else {
      weather.push(
        `No computed decade covers ${opts.year} — either the sequence has not begun yet, or it runs past the ${
          chart.yun.dayun.length
        } decades the engine generated.`,
      );
    }
  } else {
    weatherCites.push('F-NOYUN');
    weather.push(
      `The 大运 sequence is not computed for this plate: the decade order depends on gender, which was not supplied.`,
    );
  }
  weather.push(
    `The timeline says what SHAPE the weather has — which stem, which branch, which relation to the plate. It does not say whether the weather is good. That word is not in the computation, and adding it would be a different kind of claim than anything this engine can check.`,
  );
  movements.push({
    id: 'M-WEATHER',
    zh: '大运',
    pinyin: 'dà yùn',
    title: 'the weather over it',
    cites: weatherCites,
    paragraphs: weather,
  });

  // ---------------- 8. the clause ----------------
  movements.push({
    id: 'M-CLAUSE',
    zh: '善人不为命所缚',
    pinyin: 'shàn rén bù wéi mìng suǒ fù',
    title: 'the good are not bound by fate',
    cites: [],
    paragraphs: [
      `This chart does not bind you.`,
      `Everything above is structure: a temperament named precisely enough to be useful, and a moving layer over it. It describes; it does not sentence. Where the map and Scripture disagree, Scripture wins, and nothing computed here carries authority over your standing before God.`,
      `Every chart here has a rebirth slot for exactly this reason — 重生, John 3:3: the same weather still falls, and it falls on a new creation. The instrument carries its own dethroning (2 Kings 18:4). Read the map, follow the Lion (Rev 5:5).`,
      `What to do with any of this stays with people: a teacher, a friend, and finally Christ. The engine computed a map, and a map has never once told anyone where to go.`,
    ],
  });

  return movements;
}
