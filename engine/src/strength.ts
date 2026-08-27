/**
 * 强弱 (qiáng ruò) — day-master strength, the four-factor method taught in
 * curriculum module 9: 得令 (season), 得地/通根 (branch roots, sharpened by
 * 十二长生), 得势 (stem support/drain). The tradition never reduces this to
 * one number ("neither will this module pretend to" — module 9's own words),
 * so every raw factor is returned individually inspectable. `score` is a
 * transparent, DOCUMENTED heuristic synthesis (not classical doctrine's own
 * arithmetic — schools weight the four factors differently): a normalized
 * [-1, +1] weighted blend using the commonly-taught 50/30/20 split (月令 the
 * season commands roughly half the judgment; 得地 branch roots most of the
 * rest; 得势 stem support the smallest share, since 地支为重，天干为轻 —
 * branches are the true root, stems are comparatively easy to contest away).
 * A |score| under BORDERLINE_BAND is flagged `borderline: true` — an honest
 * signal that this chart is a genuine toss-up, not a confident call, the
 * same discipline the rest of this engine applies to boundary warnings.
 */
import { STEMS } from './sexagenary.js';
import { HIDDEN_STEMS } from './tables.js';
import { elementOfStem, seasonState, type SeasonState } from './elements.js';
import { shishenOf } from './tenGods.js';
import { twelveStageOf, STRONG_STAGES, WEAK_STAGES, type GrowthStage } from './twelveStages.js';

export type PillarKey = 'year' | 'month' | 'day' | 'hour';
export type RootDepth = '主气' | '中气' | '余气';

export interface RootInfo {
  pillar: PillarKey;
  branch: string;
  hiddenStem: string;
  depth: RootDepth;
  growthStage: GrowthStage;
  /** This branch's contribution to the 得地 subscore, pre-normalization. */
  weight: number;
}

export interface StemSupport {
  pillar: 'year' | 'month' | 'hour';
  stem: string;
  shishen: string;
  /** 比肩/劫财/偏印/正印 → +1 (supports); 食神/伤官/正财/偏财/正官/七杀 → -1 (drains/opposes). */
  polarity: 1 | -1;
}

export interface StrengthResult {
  dayMaster: string;
  /** 得令 — does the month command favor the day master? */
  deLing: { seasonElement: number; state: SeasonState; commands: boolean; subscore: number };
  /** 得地/通根 — every branch's root contribution (all 4 pillars). Only literal 藏干 matches listed. */
  roots: RootInfo[];
  deDiSubscore: number;
  /** 得势 — the other three visible stems (year/month/hour), each checked as support or drain. */
  stemSupport: StemSupport[];
  deShiSubscore: number;
  /** Normalized weighted blend (50% 得令 / 30% 得地 / 20% 得势), range approx [-1, +1]. */
  score: number;
  verdict: '身强' | '身弱';
  /** |score| below the borderline band — an honest "this is a toss-up" flag. */
  borderline: boolean;
  /** |score| at or past the extreme band — a 从格/专旺 candidate worth checking in pattern.ts. */
  extreme: boolean;
  /** No literal 藏干 root anywhere — the 从弱 precondition (module 10). */
  rootless: boolean;
}

const DEPTH_WEIGHT: Record<RootDepth, number> = { 主气: 1.0, 中气: 0.55, 余气: 0.3 };
const STAGE_MULT_ROOTED = { strong: 1.3, weak: 0.6, neutral: 1.0 };
const STAGE_BONUS_UNROOTED = { strong: 0.15, weak: -0.1, neutral: 0 };
/** Reference max for normalizing 得地: 4 branches, each 主气-depth at a STRONG stage. */
const DE_DI_REFERENCE_MAX = 4 * DEPTH_WEIGHT['主气'] * STAGE_MULT_ROOTED.strong;

const DE_LING_SUBSCORE: Record<SeasonState, number> = { 旺: 1.0, 相: 0.5, 休: -0.4, 囚: -0.6, 死: -1.0 };
const WEIGHT_DE_LING = 0.5;
const WEIGHT_DE_DI = 0.3;
const WEIGHT_DE_SHI = 0.2;
const BORDERLINE_BAND = 0.1;
/**
 * Max |score| achievable when rootless (deDi ≈ 0, only the small unrooted
 * stage bonus applies) is 0.5·1.0 + 0.3·~0.08 + 0.2·1.0 ≈ 0.72 — so any
 * EXTREME_BAND above ~0.7 would be UNREACHABLE for rootless charts, exactly
 * the population 从格/专旺 candidacy cares about. Set well under that ceiling.
 */
const EXTREME_BAND = 0.55;

const SUPPORT_SHISHEN = new Set(['比肩', '劫财', '偏印', '正印']);

/**
 * Depth of a hidden stem by position within its branch's 藏干 list.
 * Two-stem branches (午, 亥) skip 中气 entirely — the second stem is 余气,
 * per the curriculum's own module-4 usage ("午 hides 丁己, 主气丁, 余气己")
 * and standard 地支藏干歌 convention (人元司事: multi-day/single-day split,
 * not a three-way split, for these two branches).
 */
function depthOf(branch: string, position: number): RootDepth {
  const len = HIDDEN_STEMS[branch].length;
  if (position === 0) return '主气';
  if (len === 2) return '余气';
  if (position === len - 1) return '余气';
  return '中气';
}

function stageBucket(stage: GrowthStage): 'strong' | 'weak' | 'neutral' {
  if (STRONG_STAGES.has(stage)) return 'strong';
  if (WEAK_STAGES.has(stage)) return 'weak';
  return 'neutral';
}

export function computeStrength(
  dayStem: string,
  branches: [string, string, string, string], // [year, month, day, hour]
  stems: [string, string, string, string], // [year, month, day, hour]
): StrengthResult {
  const dmElement = elementOfStem(dayStem);
  const pillars: PillarKey[] = ['year', 'month', 'day', 'hour'];

  // ---- 得令 ----
  const monthElement = elementOfStem(HIDDEN_STEMS[branches[1]][0]); // month branch's 主气
  const { state, deLing: commands } = seasonState(dmElement, monthElement);
  const deLingSubscore = DE_LING_SUBSCORE[state];

  // ---- 得地 / 通根 (all four branches; 十二长生 sharpens every branch) ----
  const roots: RootInfo[] = [];
  let deDiRaw = 0;
  branches.forEach((branch, i) => {
    const hidden = HIDDEN_STEMS[branch];
    const matchPos = hidden.findIndex((g) => elementOfStem(g) === dmElement);
    const stage = twelveStageOf(dayStem, branch);
    const bucket = stageBucket(stage);
    if (matchPos >= 0) {
      const depth = depthOf(branch, matchPos);
      const weight = DEPTH_WEIGHT[depth] * STAGE_MULT_ROOTED[bucket];
      roots.push({ pillar: pillars[i], branch, hiddenStem: hidden[matchPos], depth, growthStage: stage, weight });
      deDiRaw += weight;
    } else {
      deDiRaw += STAGE_BONUS_UNROOTED[bucket];
    }
  });
  const deDiSubscore = Math.max(-1, Math.min(1, deDiRaw / DE_DI_REFERENCE_MAX));

  // ---- 得势 — the other three visible stems (year, month, hour) ----
  const dayIdx = STEMS.indexOf(dayStem as (typeof STEMS)[number]);
  const supportKeys: Array<'year' | 'month' | 'hour'> = ['year', 'month', 'hour'];
  const supportStemIdx = [0, 1, 3]; // year, month, hour indices into `stems`
  const stemSupport: StemSupport[] = supportKeys.map((pillar, i) => {
    const stem = stems[supportStemIdx[i]];
    const otherIdx = STEMS.indexOf(stem as (typeof STEMS)[number]);
    const shishen = shishenOf(dayIdx, otherIdx);
    const polarity: 1 | -1 = SUPPORT_SHISHEN.has(shishen) ? 1 : -1;
    return { pillar, stem, shishen, polarity };
  });
  const deShiSubscore = stemSupport.reduce((sum, s) => sum + s.polarity, 0) / 3;

  const score =
    WEIGHT_DE_LING * deLingSubscore + WEIGHT_DE_DI * deDiSubscore + WEIGHT_DE_SHI * deShiSubscore;
  const verdict: StrengthResult['verdict'] = score >= 0 ? '身强' : '身弱';
  const rootless = roots.length === 0;

  return {
    dayMaster: dayStem,
    deLing: { seasonElement: monthElement, state, commands, subscore: deLingSubscore },
    roots,
    deDiSubscore,
    stemSupport,
    deShiSubscore,
    score,
    verdict,
    borderline: Math.abs(score) < BORDERLINE_BAND,
    extreme: Math.abs(score) >= EXTREME_BAND,
    rootless,
  };
}
