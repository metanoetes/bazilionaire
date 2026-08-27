/**
 * 用神 (yòng shén) — the favorable god, curriculum module 11's five methods:
 * 扶抑 (support/restrain, the default), 调候 (climate tiebreaker), 病药
 * (illness/medicine), 通关 (bridging a stuck conflict), 专旺 (join, don't
 * fight, for 从格/专旺 charts). This module runs all five as INDEPENDENT
 * lenses — never collapsing them into one silent answer — and applies
 * module 11's own decision order to surface a recommendation, exactly as
 * the curriculum teaches it: "these are not five competing final answers —
 * they are five lenses... when they disagree, that disagreement is itself
 * the honest finding."
 *
 * This is the computed first pass module 4's honesty note anticipated
 * ("A future engine release may surface a computed first pass; the
 * judgment will always stay a human layer") — every method's reasoning is
 * returned in full so a reader can check, weigh, or reject it. The engine
 * names a direction; it does not prescribe what a person should do with it.
 */
import { HIDDEN_STEMS } from './tables.js';
import { elementOfStem, ELEMENT_NAMES, controls, generates } from './elements.js';
import { tiaohouNeed } from './interactions.js';
import type { StrengthResult } from './strength.js';
import type { PatternResult } from './pattern.js';

export type YongShenMethod = '扶抑' | '调候' | '病药' | '通关' | '专旺';

export interface FuyiResult {
  method: '扶抑';
  direction: '扶' | '抑';
  /** The 十神 group(s) recommended: 印/比劫 for 扶, 官杀/食伤/财 for 抑. */
  favorable: string[];
  reasoning: string;
}

export interface TiaohouResult {
  method: '调候';
  applies: boolean;
  need: 'fire' | 'water' | null;
  favorableElement?: number;
  reasoning: string;
}

export interface BingyaoResult {
  method: '病药';
  applies: boolean;
  illness?: string;
  medicine?: string;
  reasoning: string;
}

export interface TongguanResult {
  method: '通关';
  applies: boolean;
  stuckElements?: [number, number];
  bridgeElement?: number;
  reasoning: string;
}

export interface ZhuanwangResult {
  method: '专旺';
  applies: boolean;
  favorable?: string[];
  reasoning: string;
}

export interface YongShenResult {
  fuyi: FuyiResult;
  tiaohou: TiaohouResult;
  bingyao: BingyaoResult;
  tongguan: TongguanResult;
  zhuanwang: ZhuanwangResult;
  /** module 11's decision order applied: which method(s) the engine leans on, and why. */
  recommended: { method: YongShenMethod; favorable: string[]; reasoning: string };
  /** Do 扶抑 and the primary pattern's own governing god agree? (module 11's "unusually solid" case) */
  patternAgreement: boolean;
}

const RESOURCE_SHISHEN = ['正印', '偏印'];
const PEER_SHISHEN = ['比肩', '劫财'];
const PRESSURE_SHISHEN = ['正官', '七杀'];
const OUTPUT_SHISHEN = ['食神', '伤官'];
const WEALTH_SHISHEN = ['正财', '偏财'];

/**
 * 专旺's favorable 十神 for each extreme-pattern name: strengthen what the
 * day master follows. 从旺 follows its own side (比劫/印, module 11's own
 * example). 从儿/从财/从杀 follow the dominant OUTSIDE force — favorable is
 * that force's own group plus whatever generates it (module 11: "join it,
 * don't fight it" — never 官杀/财/食伤 fighting back toward the day master).
 */
function extremeFollowShishen(name: '从旺格' | '从儿格' | '从财格' | '从杀格'): string[] {
  switch (name) {
    case '从旺格': return [...PEER_SHISHEN, ...RESOURCE_SHISHEN];
    case '从儿格': return [...OUTPUT_SHISHEN, ...WEALTH_SHISHEN]; // 食伤, and 财 (what 食伤 generates — feeds the child further)
    case '从财格': return [...WEALTH_SHISHEN, ...PRESSURE_SHISHEN]; // 财, and 官杀 (what 财 generates — feeds the wealth further)
    case '从杀格': return [...PRESSURE_SHISHEN, ...WEALTH_SHISHEN]; // 官杀, and 财 (what feeds 官杀)
  }
}

export function selectYongShen(
  dayStem: string,
  branches: [string, string, string, string], // [year, month, day, hour]
  monthBranch: string,
  strength: StrengthResult,
  pattern: PatternResult,
): YongShenResult {
  const dmElement = elementOfStem(dayStem);

  // ---- 专旺 first (module 11: check 从格/专旺 territory before applying normal 扶抑) ----
  const zhuanwang: ZhuanwangResult = pattern.extremeCandidate
    ? {
        method: '专旺',
        applies: true,
        favorable: extremeFollowShishen(pattern.extremeCandidate.name),
        reasoning: `${pattern.extremeCandidate.name} candidate: the day master follows ${pattern.extremeCandidate.follows} rather than resisting it. 用神 STRENGTHENS the dominant force — never opposes it.`,
      }
    : { method: '专旺', applies: false, reasoning: 'strength does not read extreme+rootless — normal 扶抑 logic applies, not 专旺.' };

  // ---- 扶抑 (the default) ----
  const fuyi: FuyiResult =
    strength.verdict === '身弱'
      ? { method: '扶抑', direction: '扶', favorable: [...RESOURCE_SHISHEN, ...PEER_SHISHEN], reasoning: `身弱 (score ${strength.score.toFixed(2)}) — the day master needs support: 印 (resource) or 比劫 (peer).` }
      : { method: '扶抑', direction: '抑', favorable: [...PRESSURE_SHISHEN, ...OUTPUT_SHISHEN, ...WEALTH_SHISHEN], reasoning: `身强 (score ${strength.score.toFixed(2)}) — the day master needs restraint: 官杀 (discipline), 食伤 (output), or 财 (wealth).` };

  // ---- 调候 (climate tiebreaker) ----
  const need = tiaohouNeed(monthBranch);
  const tiaohou: TiaohouResult = need
    ? {
        method: '调候',
        applies: true,
        need,
        favorableElement: need === 'fire' ? 1 : 4,
        reasoning: `month branch ${monthBranch} is deep ${need === 'fire' ? 'winter' : 'summer'} — climate need is ${need === 'fire' ? '火 fire' : '水 water'}. This can OUTRANK 扶抑 when the chart is strong but climate-starved.`,
      }
    : { method: '调候', applies: false, need: null, reasoning: `month branch ${monthBranch} is not in a climate-extreme season — 调候 does not apply as a tiebreaker.` };

  // ---- 病药 (illness/medicine): 枭神夺食 and unchecked 七杀 are the two named cases module 11 gives ----
  const bingyao = detectBingyao(dayStem, branches);

  // ---- 通关 (bridging): two roughly-matched 克 forces with no clear winner ----
  const tongguan = detectTongguan(dayStem, branches);

  // ---- decision order (module 11's own procedure) ----
  let recommended: YongShenResult['recommended'];
  if (zhuanwang.applies) {
    recommended = { method: '专旺', favorable: zhuanwang.favorable ?? [], reasoning: zhuanwang.reasoning };
  } else if (tiaohou.applies && strength.extreme) {
    // climate can outrank 扶抑 specifically when strength is lopsided AND climate-starved
    recommended = {
      method: '调候',
      favorable: [ELEMENT_NAMES[tiaohou.favorableElement!]],
      reasoning: `${tiaohou.reasoning} Applied ahead of 扶抑 because strength already reads extreme.`,
    };
  } else if (bingyao.applies) {
    recommended = { method: '病药', favorable: [bingyao.medicine ?? ''], reasoning: bingyao.reasoning };
  } else {
    recommended = { method: '扶抑', favorable: fuyi.favorable, reasoning: fuyi.reasoning };
  }

  // ---- pattern agreement: does 扶抑's direction match the primary pattern's own governing god? ----
  const patternAgreement =
    pattern.primary.kind === 'regular' &&
    fuyi.favorable.includes(pattern.primary.governingShishen);

  return { fuyi, tiaohou, bingyao, tongguan, zhuanwang, recommended, patternAgreement };
}

/**
 * 病药 detection: the two named cases from module 11.
 *   枭神夺食 — an over-strong 偏印 controlling a present 食神 (illness: the owl;
 *     medicine: 财, which controls 偏印, breaking its grip — 财破印).
 *   unchecked 七杀 — a 七杀 present with no 食神/印 anywhere to control or
 *     absorb it (illness: the unchecked pressure; medicine: 食神 or 印).
 */
function detectBingyao(dayStem: string, branches: [string, string, string, string]): BingyaoResult {
  const dayIdx0 = elementOfStem(dayStem);
  const hiddenShishen: string[] = [];
  for (const b of branches) {
    for (const g of HIDDEN_STEMS[b]) {
      hiddenShishen.push(shishenLite(dayIdx0, elementOfStem(g), sameParity(dayStem, g)));
    }
  }
  const has = (s: string) => hiddenShishen.includes(s);

  if (has('偏印') && has('食神')) {
    return {
      method: '病药', applies: true, illness: '枭神夺食 (偏印 controlling 食神)', medicine: '财 (财破印 — controls the excess 偏印)',
      reasoning: '偏印 and 食神 both present in the hidden stems — the owl pattern. Illness: 偏印 smothering 食神. Medicine: 财破印, a 财 stem/branch controlling the excess resource.',
    };
  }
  if (has('七杀') && !has('食神') && !has('正印') && !has('偏印')) {
    return {
      method: '病药', applies: true, illness: '七杀 unchecked (no 食神/印 present)', medicine: '食神 or 印 (to control or absorb the pressure)',
      reasoning: '七杀 present with no 食神 or 印 anywhere in the hidden stems to control or absorb it — the pressure runs unchecked. Medicine: 食神 (control) or 印 (absorb).',
    };
  }
  return { method: '病药', applies: false, reasoning: 'neither named 病药 case (枭神夺食, unchecked 七杀) is present — 扶抑 is the more relevant lens for this chart.' };
}

/** Small local 十神-by-element+parity helper (avoids importing full shishenOf just for hidden-stem sweeps). */
function sameParity(a: string, b: string): boolean {
  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return STEMS.indexOf(a) % 2 === STEMS.indexOf(b) % 2;
}
function shishenLite(dmEl: number, otherEl: number, sameP: boolean): string {
  const rel = (otherEl - dmEl + 5) % 5;
  switch (rel) {
    case 0: return sameP ? '比肩' : '劫财';
    case 1: return sameP ? '食神' : '伤官';
    case 4: return sameP ? '偏印' : '正印';
    case 2: return sameP ? '偏财' : '正财';
    case 3: return sameP ? '七杀' : '正官';
    default: return '';
  }
}

/**
 * 通关 detection: two elements present among the four branches' 主气 sit in a
 * direct 克 relation, each with at least one branch, and no third branch tips
 * the balance clearly — the bridging element is what the stronger generates
 * en route to the weaker (module 11's example: strong 金 vs strong 木 → 水 bridges).
 */
function detectTongguan(dayStem: string, branches: [string, string, string, string]): TongguanResult {
  const mainElements = branches.map((b) => elementOfStem(HIDDEN_STEMS[b][0]));
  const counts = [0, 0, 0, 0, 0];
  mainElements.forEach((e) => (counts[e] += 1));
  for (let a = 0; a < 5; a++) {
    for (let b = 0; b < 5; b++) {
      if (a === b) continue;
      if (controls(a, b) && counts[a] >= 1 && counts[b] >= 1 && Math.abs(counts[a] - counts[b]) <= 1) {
        const bridge = (a + 1) % 5; // what `a` generates next — the classical bridge choice
        return {
          method: '通关', applies: true, stuckElements: [a, b], bridgeElement: bridge,
          reasoning: `${ELEMENT_NAMES[a]} (${counts[a]} branch main-qi) directly controls ${ELEMENT_NAMES[b]} (${counts[b]}) with neither side dominant — a stuck conflict. Bridge: ${ELEMENT_NAMES[bridge]}, which ${ELEMENT_NAMES[a]} generates and which in turn feeds ${ELEMENT_NAMES[b]}.`,
        };
      }
    }
  }
  return { method: '通关', applies: false, reasoning: 'no two branch main-qi elements sit in a roughly-matched direct 克 standoff — 通关 does not apply.' };
}
