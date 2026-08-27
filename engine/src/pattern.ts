/**
 * 格局 (gé jú) — pattern classification, curriculum module 10's method:
 * the eight regular patterns (named for the month branch's 主气 as a 十神),
 * the two peer-special patterns (建禄格/羊刃格), 从格 (following patterns,
 * split by direction), 专旺 (module 11's term for 从旺格's 用神 logic), and
 * 化气格 (transformed-qi, gated on wuhe.ts's day-stem combination check).
 *
 * Per module 10's own honest caution, 从格/化气格 are the tradition's most
 * argued-over calls — this module returns them as flagged CANDIDATES with
 * the supporting evidence shown, never a silent overwrite of the regular
 * pattern. A human reader (or a later UI layer) decides which to trust,
 * exactly the discipline this project applies everywhere else: structure is
 * computed, judgment is read.
 */
import { HIDDEN_STEMS } from './tables.js';
import { elementOfStem, ELEMENT_NAMES } from './elements.js';
import { shishenOf } from './tenGods.js';
import { STEMS } from './sexagenary.js';
import { dayMasterCombines, findWuHeCombinations, wuheTransform, type WuHeCombination } from './wuhe.js';
import type { StrengthResult } from './strength.js';

export type RegularPatternName =
  | '正官格' | '七杀格' | '正财格' | '偏财格' | '正印格' | '偏印格' | '食神格' | '伤官格';
export type SpecialPatternName = '建禄格' | '羊刃格';
export type ExtremePatternName = '从旺格' | '从儿格' | '从财格' | '从杀格';

export interface RegularPattern {
  kind: 'regular';
  name: RegularPatternName;
  governingShishen: string;
  monthHiddenStem: string;
}

export interface SpecialPattern {
  kind: 'special';
  name: SpecialPatternName;
  note: string;
}

export interface ExtremeCandidate {
  kind: 'extreme';
  name: ExtremePatternName;
  /** What the day master "follows" — the dominant 十神 group's name, for display. */
  follows: string;
  evidence: string[];
}

export interface HuaQiCandidate {
  kind: 'huaqi';
  name: '化气格';
  transformElement: number;
  transformElementName: string;
  combination: WuHeCombination;
  /** Does month + at least one other pillar support the transformed element? The
   *  "near-perfect support" bar module 10 names — shown, not silently assumed. */
  monthSupports: boolean;
  supportCount: number;
  evidence: string[];
}

export interface PatternResult {
  primary: RegularPattern | SpecialPattern;
  /** 从格/专旺 candidacy — present only when strength.extreme && strength.rootless. */
  extremeCandidate?: ExtremeCandidate;
  /** 化气格 candidacy — present only when the day stem combines with an adjacent stem. */
  huaqiCandidate?: HuaQiCandidate;
}

const REGULAR_BY_SHISHEN: Record<string, RegularPatternName> = {
  正官: '正官格', 七杀: '七杀格', 正财: '正财格', 偏财: '偏财格',
  正印: '正印格', 偏印: '偏印格', 食神: '食神格', 伤官: '伤官格',
};

/** 从儿/从财/从杀 target groups — which 十神 set the day master "follows". */
const CHILD_SHISHEN = new Set(['食神', '伤官']); // 从儿格
const WEALTH_SHISHEN = new Set(['正财', '偏财']); // 从财格
const PRESSURE_SHISHEN = new Set(['正官', '七杀']); // 从杀格

function dominantShishenGroup(counts: Record<string, number>): { group: string; name: ExtremePatternName; label: string; count: number } | null {
  const child = (counts['食神'] ?? 0) + (counts['伤官'] ?? 0);
  const wealth = (counts['正财'] ?? 0) + (counts['偏财'] ?? 0);
  const pressure = (counts['正官'] ?? 0) + (counts['七杀'] ?? 0);
  const peers = (counts['比肩'] ?? 0) + (counts['劫财'] ?? 0);
  const entries: Array<[string, number, ExtremePatternName, string]> = [
    ['peers', peers, '从旺格', '比劫 — its own strength'],
    ['child', child, '从儿格', '食伤 — what it generates'],
    ['wealth', wealth, '从财格', '财 — the wealth'],
    ['pressure', pressure, '从杀格', '官杀 — the pressure'],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [group, count, name, label] = entries[0];
  if (count === 0) return null;
  return { group, name, label, count };
}

export function classifyPattern(
  dayStem: string,
  branches: [string, string, string, string], // [year, month, day, hour]
  stems: [string, string, string, string], // [year, month, day, hour]
  strength: StrengthResult,
): PatternResult {
  const dayIdx = STEMS.indexOf(dayStem as (typeof STEMS)[number]);
  const monthMainStem = HIDDEN_STEMS[branches[1]][0];
  const monthShishen = shishenOf(dayIdx, STEMS.indexOf(monthMainStem as (typeof STEMS)[number]));

  // ---- primary pattern: regular eight, or the peer-special pair ----
  // 建禄格/羊刃格 gate on the RELATION (比肩 vs 劫财), not the day master's own
  // yin/yang — every stem's own 禄 seat is its same-polarity (比肩) branch and
  // its blade seat is the opposite-polarity (劫财) branch (verified against
  // shensha.ts's LU/YANGREN tables for all ten stems).
  let primary: RegularPattern | SpecialPattern;
  if (monthShishen === '比肩') {
    primary = { kind: 'special', name: '建禄格', note: '月支本气与日主同五行同阴阳 (比肩) — the day master sits on its own 禄 seat in the month.' };
  } else if (monthShishen === '劫财') {
    primary = { kind: 'special', name: '羊刃格', note: '月支本气与日主同五行异阴阳 (劫财) — the day master sits on its own blade seat in the month, raw strength needing 官杀 to discipline it.' };
  } else {
    primary = {
      kind: 'regular',
      name: REGULAR_BY_SHISHEN[monthShishen],
      governingShishen: monthShishen,
      monthHiddenStem: monthMainStem,
    };
  }

  // ---- 从格/专旺 candidacy: only a live question when strength reads extreme + rootless
  // AND at least one contributing factor is itself at genuine extremity (heavy 得令 at
  // 旺/死, or unanimous 得势) — module 10's own bar ("heavy 得令+得地+得势, no root") is a
  // compound condition, not a single blended scalar past a cutoff. ----
  let extremeCandidate: ExtremeCandidate | undefined;
  const factorExtreme = Math.abs(strength.deLing.subscore) === 1 || Math.abs(strength.deShiSubscore) === 1;
  if (strength.extreme && strength.rootless && factorExtreme) {
    // Tally 十神 across all three OTHER stems + every hidden stem in all four
    // branches (the full visible+hidden picture, not just the four naked stems).
    const counts: Record<string, number> = {};
    const tally = (otherStem: string) => {
      const sh = shishenOf(dayIdx, STEMS.indexOf(otherStem as (typeof STEMS)[number]));
      if (sh === '日主') return;
      counts[sh] = (counts[sh] ?? 0) + 1;
    };
    [stems[0], stems[1], stems[3]].forEach(tally); // year/month/hour stems (day stem is 日主 itself)
    branches.forEach((b) => HIDDEN_STEMS[b].forEach(tally));

    const dominant = dominantShishenGroup(counts);
    if (dominant) {
      const evidence = [
        `day master reads 身弱 and rootless: no branch in the chart carries ${dayStem}'s element as a hidden stem.`,
        `dominant 十神 group across all visible + hidden stems: ${dominant.label} (count ${dominant.count}).`,
      ];
      extremeCandidate = { kind: 'extreme', name: dominant.name, follows: dominant.label, evidence };
    }
  }

  // ---- 化气格 candidacy: day stem combines with an adjacent (month or hour) stem ----
  const huaqi = dayMasterCombines(stems[1], stems[2], stems[3]);
  let huaqiCandidate: HuaQiCandidate | undefined;
  if (huaqi.dayCombines && huaqi.transformElement !== undefined) {
    const combos = findWuHeCombinations(stems);
    const combo = combos.find((c) => c.position === (huaqi.partnerPosition === 'year-month-side' ? 'month-day' : 'day-hour'));
    if (combo) {
      const monthSupports = elementOfStem(monthMainStem) === huaqi.transformElement;
      let supportCount = monthSupports ? 1 : 0;
      // Any OTHER branch's 主气 also matching the transformed element counts as further support.
      branches.forEach((b, i) => {
        if (i === 1) return; // month already checked
        if (elementOfStem(HIDDEN_STEMS[b][0]) === huaqi.transformElement) supportCount += 1;
      });
      const evidence = [
        `day stem ${dayStem} combines with ${combo.stems[0] === dayStem ? combo.stems[1] : combo.stems[0]} (${combo.position}) toward ${ELEMENT_NAMES[huaqi.transformElement]}.`,
        monthSupports
          ? `month branch's 主气 (${monthMainStem}) already carries the transformed element — strong support.`
          : `month branch's 主气 (${monthMainStem}) does NOT carry the transformed element — the classical "near-perfect support" bar is not met by the season.`,
        `${supportCount} of 4 branches' 主气 support ${ELEMENT_NAMES[huaqi.transformElement]}.`,
      ];
      huaqiCandidate = {
        kind: 'huaqi',
        name: '化气格',
        transformElement: huaqi.transformElement,
        transformElementName: ELEMENT_NAMES[huaqi.transformElement],
        combination: combo,
        monthSupports,
        supportCount,
        evidence,
      };
    }
  }

  return { primary, extremeCandidate, huaqiCandidate };
}

export { wuheTransform };
