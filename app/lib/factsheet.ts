/**
 * The fact sheet — the interpretive substrate.
 *
 * Turns a computed `Chart` into a flat list of typed, id'd FACTS. Nothing here
 * infers, scores, or interprets: every value is read straight off engine output
 * and given a stable id, an English label, and the doctrine term it belongs to.
 *
 * Why it exists: three consumers need the same set of facts, and they must
 * never drift apart —
 *   1. lib/reading.ts — the deterministic 解盘 prose (phase 1, no network).
 *   2. the tutor layer (phase 2) — receives THIS, never the birth data, and
 *      must cite a fact id for every sentence it writes. A sentence with no
 *      fact id behind it is, by construction, not something the engine said.
 *   3. the research commons' derived-feature tier.
 *
 * The ids are the contract. They are stable, human-readable, and greppable:
 * F-DAYMASTER, F-DELING, F-TONE-YEAR, F-REL-1 … Renaming one is a breaking
 * change to the prose gate (scripts/check-reading.ts) and, later, to the
 * tutor's citation contract.
 *
 * Deliberately NOT here: meaning. A fact is "the month is 卯; for 壬 that
 * season reads 休" — never "which is bad for you".
 */
import {
  ELEMENT_NAMES,
  branchInteraction,
  sanHeCompletion,
  shishenOf,
  twelveStageOf,
  STEMS,
  type Chart,
} from '@bazilionaire/engine';
import { nayinFor } from './nayin';
import { lexiconFor } from './lexicon';

export type FactLayer =
  | 'frame'
  | 'standing'
  | 'shape'
  | 'medicine'
  | 'tension'
  | 'imagery'
  | 'weather';

export interface Fact {
  /** Stable citation id, e.g. 'F-DELING'. */
  id: string;
  layer: FactLayer;
  /** The doctrine term this fact belongs to (rendered through ClickableCJK). */
  term?: string;
  /** Short English label. */
  label: string;
  /** The computed value, kept short enough to sit in a chip. */
  value: string;
  /** Longer engine-derived detail, when the fact carries reasoning. */
  detail?: string;
}

const PILLAR_CN = ['年', '月', '日', '时'] as const;
const PILLAR_EN = ['year', 'month', 'day', 'hour'] as const;

function el(i: number | undefined): string {
  return i === undefined || i < 0 ? '—' : ELEMENT_NAMES[i];
}

/**
 * Build the fact sheet. `year` is passed in (never read from the clock) so the
 * same chart always produces the same facts — the prose gate depends on it.
 */
export function factsheet(chart: Chart, opts: { year: number }): Fact[] {
  const facts: Fact[] = [];
  const push = (f: Fact) => facts.push(f);

  const branches = [chart.year[1], chart.month[1], chart.day[1], chart.time[1]];
  const dayStem = chart.day[0];
  const { strength, pattern, yongShen } = chart;

  // ---------------- frame ----------------
  push({
    id: 'F-EIGHT',
    layer: 'frame',
    term: '四柱',
    label: 'the eight characters',
    value: `${chart.year} ${chart.month} ${chart.day} ${chart.time}`,
  });
  push({
    id: 'F-DAYMASTER',
    layer: 'frame',
    term: '日主',
    label: 'day master',
    value: dayStem,
    detail: `${lexiconFor(dayStem).element} · ${lexiconFor(dayStem).polarity} — ${lexiconFor(dayStem).gloss}`,
  });
  push({
    id: 'F-ZODIAC',
    layer: 'frame',
    label: 'year animal',
    value: chart.zodiac,
  });
  push({
    id: 'F-SCHOOL',
    layer: 'frame',
    term: chart.hourSchool === 'solar' ? '真太阳时' : undefined,
    label: 'hour school',
    value: chart.hourSchool === 'solar' ? 'true solar time' : 'clock time',
    detail: chart.trueSolarTime ? `clock time converted to ${chart.trueSolarTime} solar` : undefined,
  });
  chart.warnings.forEach((w, i) =>
    push({ id: `F-WARN-${i + 1}`, layer: 'frame', label: 'engine warning', value: w }),
  );

  // ---------------- standing (module 9) ----------------
  push({
    id: 'F-DELING',
    layer: 'standing',
    term: '得令',
    label: 'season command',
    value: `${chart.month[1]} → ${strength.deLing.state}${strength.deLing.commands ? ' (得令)' : ' (失令)'}`,
    detail: `the month's element is ${el(strength.deLing.seasonElement)}; subscore ${strength.deLing.subscore.toFixed(2)}`,
  });

  if (strength.rootless) {
    push({
      id: 'F-ROOTLESS',
      layer: 'standing',
      term: '通根',
      label: 'branch roots',
      value: 'rootless — no branch carries the day master as a hidden stem',
    });
  } else {
    strength.roots.forEach((r, i) =>
      push({
        id: `F-ROOT-${i + 1}`,
        layer: 'standing',
        term: '得地',
        label: `root in the ${r.pillar} branch`,
        value: `${r.branch} → ${r.hiddenStem} (${r.depth}, ${r.growthStage})`,
      }),
    );
  }
  push({
    id: 'F-DEDI',
    layer: 'standing',
    term: '得地',
    label: 'root subscore',
    value: strength.deDiSubscore.toFixed(2),
  });

  const allies = strength.stemSupport.filter((s) => s.polarity === 1);
  const drains = strength.stemSupport.filter((s) => s.polarity === -1);
  push({
    id: 'F-DESHI',
    layer: 'standing',
    term: '得势',
    label: 'stem support',
    value: `${allies.length} support / ${drains.length} draw off`,
    detail: strength.stemSupport.map((s) => `${s.pillar} ${s.stem} ${s.shishen}`).join(' · '),
  });
  push({
    id: 'F-STRENGTH',
    layer: 'standing',
    term: '强弱',
    label: 'day-master strength',
    value: `${strength.verdict} (${strength.score >= 0 ? '+' : ''}${strength.score.toFixed(2)})`,
    detail: strength.borderline
      ? 'borderline — inside the band the engine calls a genuine toss-up'
      : undefined,
  });
  branches.forEach((b, i) =>
    push({
      id: `F-XINGYUN-${PILLAR_EN[i].toUpperCase()}`,
      layer: 'standing',
      term: '星运',
      label: `${PILLAR_EN[i]} growth stage`,
      value: `${dayStem} in ${b} → ${twelveStageOf(dayStem, b)}`,
    }),
  );

  // ---------------- shape (module 10) ----------------
  push({
    id: 'F-PATTERN',
    layer: 'shape',
    term: '格局',
    label: 'pattern',
    value: pattern.primary.name,
    detail:
      pattern.primary.kind === 'regular'
        ? `the month's presiding god is ${pattern.primary.governingShishen}, through the hidden stem ${pattern.primary.monthHiddenStem}`
        : pattern.primary.note,
  });
  if (pattern.extremeCandidate) {
    push({
      id: 'F-EXTREME',
      layer: 'shape',
      term: '从格',
      label: 'extreme-pattern candidate',
      value: `${pattern.extremeCandidate.name} — follows ${pattern.extremeCandidate.follows}`,
      detail: pattern.extremeCandidate.evidence.join(' · '),
    });
  }
  if (pattern.huaqiCandidate) {
    push({
      id: 'F-HUAQI',
      layer: 'shape',
      term: '化气格',
      label: 'transformation candidate',
      value: `transforms toward ${pattern.huaqiCandidate.transformElementName}`,
      detail: pattern.huaqiCandidate.evidence.join(' · '),
    });
  }

  // ---------------- medicine (module 11) ----------------
  push({
    id: 'F-YONGSHEN',
    layer: 'medicine',
    term: '用神',
    label: 'favorable god',
    value: `${yongShen.recommended.favorable.join(' / ') || '—'} (${yongShen.recommended.method})`,
    detail: yongShen.recommended.reasoning,
  });
  push({
    id: 'F-FUYI',
    layer: 'medicine',
    term: '扶抑',
    label: `support-or-restrain (${yongShen.fuyi.direction})`,
    value: yongShen.fuyi.favorable.join(' / ') || '—',
    detail: yongShen.fuyi.reasoning,
  });
  push({
    id: 'F-TIAOHOU',
    layer: 'medicine',
    term: '调候',
    label: 'climate',
    value: yongShen.tiaohou.applies
      ? `${yongShen.tiaohou.need ?? '—'} → ${el(yongShen.tiaohou.favorableElement)}`
      : 'does not apply',
    detail: yongShen.tiaohou.reasoning,
  });
  push({
    id: 'F-BINGYAO',
    layer: 'medicine',
    term: '病药',
    label: 'illness and medicine',
    value: yongShen.bingyao.applies
      ? `${yongShen.bingyao.illness ?? '—'} → ${yongShen.bingyao.medicine ?? '—'}`
      : 'does not apply',
    detail: yongShen.bingyao.reasoning,
  });
  push({
    id: 'F-TONGGUAN',
    layer: 'medicine',
    term: '通关',
    label: 'bridging a stalemate',
    value: yongShen.tongguan.applies
      ? `${el(yongShen.tongguan.stuckElements?.[0])}/${el(yongShen.tongguan.stuckElements?.[1])} bridged by ${el(yongShen.tongguan.bridgeElement)}`
      : 'does not apply',
    detail: yongShen.tongguan.reasoning,
  });
  push({
    id: 'F-ZHUANWANG',
    layer: 'medicine',
    term: '专旺',
    label: 'join the dominant force',
    value: yongShen.zhuanwang.applies ? (yongShen.zhuanwang.favorable ?? []).join(' / ') : 'does not apply',
    detail: yongShen.zhuanwang.reasoning,
  });
  push({
    id: 'F-AGREE',
    layer: 'medicine',
    label: 'do 扶抑 and the pattern agree?',
    value: yongShen.patternAgreement ? 'yes' : 'no',
  });

  // ---------------- tension ----------------
  let relN = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const ix = branchInteraction(branches[i], branches[j]);
      if (ix.length === 0) continue;
      relN += 1;
      push({
        id: `F-REL-${relN}`,
        layer: 'tension',
        term: ix[0].type,
        label: `${PILLAR_EN[i]}–${PILLAR_EN[j]} branches`,
        value: `${branches[i]}${branches[j]} ${ix.map((x) => x.type).join(' + ')}`,
        detail: ix.map((x) => x.detail).join(' · '),
      });
    }
  }
  const groups = Array.from(
    new Set(branches.map((b) => sanHeCompletion(b, branches)).filter((g): g is string => g !== null)),
  );
  groups.forEach((g, i) =>
    push({
      id: `F-SANHE-${i + 1}`,
      layer: 'tension',
      term: '三合',
      label: 'complete three-harmony group',
      value: g,
    }),
  );
  if (relN === 0 && groups.length === 0) {
    push({
      id: 'F-QUIET',
      layer: 'tension',
      term: '关系',
      label: 'branch relations',
      value: 'none — no 合, 冲, 刑 or 害 among the four branches',
    });
  }
  const voided = branches
    .map((b, i) => (chart.dayXunKong.includes(b) ? `${PILLAR_CN[i]} ${b}` : null))
    .filter((v): v is string => v !== null);
  push({
    id: 'F-VOID',
    layer: 'tension',
    term: '空亡',
    label: 'void seats',
    value: voided.length > 0 ? voided.join(' · ') : 'no pillar sits in a void seat',
    detail: `day pillar's 旬 is ${chart.dayXun}; its void branches are ${chart.dayXunKong}`,
  });

  // ---------------- imagery ----------------
  chart.nayin.forEach((tone, i) => {
    const entry = nayinFor(tone);
    push({
      id: `F-TONE-${PILLAR_EN[i].toUpperCase()}`,
      layer: 'imagery',
      term: tone,
      label: `${PILLAR_EN[i]} tone`,
      value: entry ? `${tone} — ${entry.english}` : tone,
      // The tone's own element belongs in the fact: it is doctrine, the reading's
      // element tally is derived from it, and without it a sentence naming the
      // tone's element had nothing in the sheet to stand on.
      detail: entry ? `${entry.element} · ${entry.image}` : undefined,
    });
  });

  // ---------------- weather ----------------
  if (chart.yun) {
    const decades = chart.yun.dayun.filter((d) => d.ganzhi !== '');
    push({
      id: 'F-QIYUN',
      layer: 'weather',
      term: '起运',
      label: 'decades begin',
      value: `${chart.yun.startSolarYear}`,
      detail: `${chart.yun.qiyun.years}y ${chart.yun.qiyun.months}m ${chart.yun.qiyun.days}d after birth`,
    });
    const current = decades.find((d) => opts.year >= d.startYear && opts.year < d.startYear + 10);
    if (current) {
      const dayIdx = STEMS.indexOf(dayStem as (typeof STEMS)[number]);
      const decIdx = STEMS.indexOf(current.ganzhi[0] as (typeof STEMS)[number]);
      push({
        id: 'F-DECADE-NOW',
        layer: 'weather',
        term: '大运',
        label: `decade covering ${opts.year}`,
        value: `${current.ganzhi} (${current.startYear}–${current.startYear + 9})`,
        detail: `its stem ${current.ganzhi[0]} reads ${shishenOf(dayIdx, decIdx)} to the day master; its branch is ${current.ganzhi[1]}`,
      });
      const ix = branchInteraction(current.ganzhi[1], chart.month[1]);
      if (ix.length > 0) {
        push({
          id: 'F-DECADE-REL',
          layer: 'weather',
          term: ix[0].type,
          label: 'decade branch against the month branch',
          value: `${current.ganzhi[1]}${chart.month[1]} ${ix.map((x) => x.type).join(' + ')}`,
        });
      }
    }
    push({
      id: 'F-DECADES',
      layer: 'weather',
      term: '大运',
      label: 'decade sequence',
      value: `${decades.length} decades computed, ${decades[0]?.ganzhi ?? '—'} onward`,
    });
  } else {
    push({
      id: 'F-NOYUN',
      layer: 'weather',
      term: '大运',
      label: 'decade sequence',
      value: 'not computed — 大运 needs a gender, which orders the sequence',
    });
  }

  return facts;
}

/** Index a fact sheet by id, for citation lookup. */
export function factsById(facts: Fact[]): Record<string, Fact> {
  const out: Record<string, Fact> = {};
  for (const f of facts) out[f.id] = f;
  return out;
}
