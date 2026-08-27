/**
 * Claim extraction — the research page's actual unit of study. Structural
 * labels (a stem's 十神 name, a chart's 格局 name) are deterministic engine
 * output; rating THEM for "accuracy" is a category error, that's
 * methodology's job. What is genuinely unverified is the TEMPERAMENT PROSE
 * the curriculum attaches to those labels (module 7's 十神 vocabulary,
 * module 9's 强弱 character language, module 10's 格局 agendas, module 12's
 * 神煞 readings) — this module turns each into one short, ratable,
 * second-person claim, tagged with a stable templateId so responses
 * aggregate across users BY CLAIM TYPE, not per chart instance.
 *
 * Every claim string here is a hand-written paraphrase of prose already
 * shipped in app/lib/curriculum/part3.ts (十神), part4.ts (强弱/格局),
 * part5.ts (神煞) — same discipline as lexicon.ts/glossary.ts: curated,
 * not scraped, so the voice stays consistent and no claim outruns what the
 * curriculum itself actually teaches.
 *
 * Deliberately EXCLUDED from v1 (see vault decision log):
 *   - 用神 — a prescription ("what helps"), not a personality description;
 *     doesn't fit an "does this resonate" rating.
 *   - 从格/化气格/合婚 — too rare per-chart to gather N, and pair-context
 *     (合婚) doesn't fit the single-person claim shape.
 *   - borderline 强弱 charts (strength.borderline) — the engine itself flags
 *     these as a genuine toss-up; asking someone to rate a coin-flip
 *     verdict as if it were a confident claim would corrupt the data.
 */
import type { Chart } from '@bazilionaire/engine';
import { YANGREN, LU, TIANYI, WENCHANG, shenshaFor } from '@bazilionaire/engine';

export type ClaimCategory = 'shishen' | 'strength' | 'pattern' | 'shensha';

export interface ExtractedClaim {
  templateId: string;
  category: ClaimCategory;
  term: string;
  pinyin: string;
  claim: string;
  /** Where this showed up in the chart, e.g. "year stem, hour stem" or "day stem". */
  context: string;
}

interface ClaimText {
  term: string;
  pinyin: string;
  claim: string;
}

// ---- 十神 — module 7's temperament vocabulary, one claim per relation ----
const SHISHEN_CLAIMS: Record<string, ClaimText> = {
  比肩: { term: '比肩', pinyin: 'bǐ jiān', claim: 'You are self-reliant, the equal who runs beside people rather than above or below them — the shadow side is stubbornness.' },
  劫财: { term: '劫财', pinyin: 'jié cái', claim: 'You carry a competitive, ambitious edge and take real risks — the shadow side is friction or loss through people of your own kind: a peer, a partner, a sibling.' },
  食神: { term: '食神', pinyin: 'shí shén', claim: 'You make things for the joy of making — real skill and appetite — and the shadow side is indulgence.' },
  伤官: { term: '伤官', pinyin: 'shāng guān', claim: 'You have a rule-breaking brilliance, an inventive streak that challenges convention — the shadow side is rebellion for its own sake.' },
  偏财: { term: '偏财', pinyin: 'piān cái', claim: 'You are drawn to opportunity and the windfall found on the street — enterprising — and the shadow side is speculation.' },
  正财: { term: '正财', pinyin: 'zhèng cái', claim: 'You cultivate a steady, earned harvest rather than chase windfalls — diligent — and the shadow side is miserliness.' },
  七杀: { term: '七杀', pinyin: 'qī shā', claim: 'You perform well under real pressure and weight that tests you — courage under load — and the shadow side is domination, of yourself or others.' },
  正官: { term: '正官', pinyin: 'zhèng guān', claim: 'You value integrity and structure, the law that protects — and the shadow side is rigidity.' },
  偏印: { term: '偏印', pinyin: 'piān yìn', claim: 'You learn from unconventional places, an intuitive, unconventional-teacher streak — and the shadow side is detachment.' },
  正印: { term: '正印', pinyin: 'zhèng yìn', claim: 'You are drawn to scholarship, tradition, and shelter — the school that feeds you — and the shadow side is being coddled.' },
};

// ---- 强弱 — module 9's day-master strength character language ----
const STRENGTH_CLAIMS: Record<'身强' | '身弱', ClaimText> = {
  身强: { term: '身强', pinyin: 'shēn qiáng', claim: 'You tend to have more than enough internal resource and drive — the challenge is usually restraint and outlet, not lack.' },
  身弱: { term: '身弱', pinyin: 'shēn ruò', claim: 'You tend to need real outside support to thrive — circumstances and the people around you matter more to your outcomes than they do for most.' },
};

// ---- 格局 — module 10's pattern agendas (regular eight + the two peer-specials) ----
const PATTERN_CLAIMS: Record<string, ClaimText> = {
  正官格: { term: '正官格', pinyin: 'zhèng guān gé', claim: 'You do well inside structure and clear rules, and you protect that structure once it exists — you are unsettled by chaos more than most.' },
  七杀格: { term: '七杀格', pinyin: 'qī shā gé', claim: 'You are shaped by real pressure and need it controlled or channeled rather than left to run wild — you do not thrive un-pressured either.' },
  正财格: { term: '正财格', pinyin: 'zhèng cái gé', claim: 'You are oriented around building and guarding something of steady value — earned, not windfall — and you are wary of it being taken by people close to you.' },
  偏财格: { term: '偏财格', pinyin: 'piān cái gé', claim: 'You are opportunistic in a productive sense — you move on a deal or an opening quickly, and steady routine can feel confining.' },
  正印格: { term: '正印格', pinyin: 'zhèng yìn gé', claim: 'You draw real strength from a tradition, teacher, or institution behind you — you do not do your best work fully unmoored from one.' },
  偏印格: { term: '偏印格', pinyin: 'piān yìn gé', claim: 'You learn and draw resource in an unconventional way, off the beaten path — and you can go quiet or withdrawn under stress rather than reach out.' },
  食神格: { term: '食神格', pinyin: 'shí shén gé', claim: 'Your output — craft, voice, what you make — needs room to run unblocked; when it is blocked, you feel it more than most people would.' },
  伤官格: { term: '伤官格', pinyin: 'shāng guān gé', claim: 'You are brilliant in a rule-breaking way — genuinely gifted, and genuinely prone to friction with authority; the tradition itself is split on whether this is more gift or more hazard for you.' },
  建禄格: { term: '建禄格', pinyin: 'jiàn lù gé', claim: 'You reached a kind of structural self-sufficiency early and by your own footing, rather than by being carried there — the open question for you is what channels that strength once it is already at its peak.' },
  羊刃格: { term: '羊刃格', pinyin: 'yáng rèn gé', claim: 'You carry raw, cutting strength that needs real discipline or a clean outlet — left unchanneled, the tradition reads this as a life prone to sudden, self-inflicted reversals.' },
};

// ---- 神煞 — module 12's seven engine-computed stars ----
interface ShenshaClaimText extends ClaimText {
  templateId: string;
}
const SHENSHA_CLAIMS: Record<string, ShenshaClaimText> = {
  lu: { templateId: 'shensha.lu', term: '禄', pinyin: 'lù', claim: 'You have a steady, self-sufficient kind of floor under you — traditionally read as rarely being without a livelihood, independent of any one relationship.' },
  yangren: { templateId: 'shensha.yangren', term: '羊刃', pinyin: 'yáng rèn', claim: 'You carry raw, decisive strength that can tip into recklessness without an outlet or something to discipline it.' },
  yima: { templateId: 'shensha.yima', term: '驿马', pinyin: 'yì mǎ', claim: 'Movement and change recur through your life — travel, relocation, restlessness, not staying in one place.' },
  huagai: { templateId: 'shensha.huagai', term: '华盖', pinyin: 'huá gài', claim: 'You have a solitary, inward, spiritually- or intellectually-inclined streak — comfortable working or thinking alone.' },
  taohua: { templateId: 'shensha.taohua', term: '桃花', pinyin: 'táo huā', claim: 'You draw romantic or social attraction more easily than most, for better or worse.' },
  tianyi: { templateId: 'shensha.tianyi', term: '天乙贵人', pinyin: 'tiān yǐ guì rén', claim: 'You tend to find real help arriving at the right moment, from unexpected people — the tradition\u2019s most flattering marker, worth reading as structure, not a guarantee.' },
  wenchang: { templateId: 'shensha.wenchang', term: '文昌', pinyin: 'wén chāng', claim: 'You have a natural aptitude for study, writing, or scholarship.' },
};

function branchesOf(chart: Chart): [string, string, string, string] {
  return [chart.year[1], chart.month[1], chart.day[1], chart.time[1]];
}

/**
 * Extract the ratable claim set for a computed chart. Naked stems only for
 * 十神 (year/month/hour vs the day master) — the same "得势" scope the
 * engine's own strength.stemSupport already uses; hidden-stem 十神 are left
 * out to keep the list short and each claim traceable to a visible pillar.
 */
export function extractClaims(chart: Chart): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  const dayStem = chart.day[0];
  const branches = branchesOf(chart);
  const pillarLabels = ['year', 'month', 'day', 'hour'] as const;

  // ---- 十神: naked stems, year(0)/month(1)/hour(3) — day(2) is 日主 itself ----
  const shishenContexts: Record<string, string[]> = {};
  ([0, 1, 3] as const).forEach((i) => {
    const sh = chart.shishenGan[i];
    if (sh === '日主' || !SHISHEN_CLAIMS[sh]) return;
    (shishenContexts[sh] ??= []).push(`${pillarLabels[i]} stem`);
  });
  for (const [sh, contexts] of Object.entries(shishenContexts)) {
    const t = SHISHEN_CLAIMS[sh];
    claims.push({ templateId: `shishen.${sh}`, category: 'shishen', term: t.term, pinyin: t.pinyin, claim: t.claim, context: contexts.join(', ') });
  }

  // ---- 强弱: skip borderline charts — an honest toss-up isn't a ratable claim ----
  if (!chart.strength.borderline) {
    const t = STRENGTH_CLAIMS[chart.strength.verdict];
    claims.push({ templateId: `strength.${chart.strength.verdict}`, category: 'strength', term: t.term, pinyin: t.pinyin, claim: t.claim, context: 'day-master strength (四柱, all pillars)' });
  }

  // ---- 格局: primary pattern only (regular eight or the two peer-specials) ----
  const patternName = chart.pattern.primary.name;
  const patternClaim = PATTERN_CLAIMS[patternName];
  if (patternClaim) {
    claims.push({ templateId: `pattern.${patternName}`, category: 'pattern', term: patternClaim.term, pinyin: patternClaim.pinyin, claim: patternClaim.claim, context: 'month branch\u2019s governing stem' });
  }

  // ---- 神煞: day-stem-keyed stars (禄/羊刃/天乙贵人/文昌) ----
  const dayStemStars: Array<[keyof typeof SHENSHA_CLAIMS, string | undefined | [string, string]]> = [
    ['lu', LU[dayStem]],
    ['yangren', YANGREN[dayStem]],
    ['tianyi', TIANYI[dayStem]],
    ['wenchang', WENCHANG[dayStem]],
  ];
  for (const [key, target] of dayStemStars) {
    if (!target) continue;
    const targets = Array.isArray(target) ? target : [target];
    const hitPillars = branches
      .map((b, i) => (targets.includes(b) ? pillarLabels[i] : null))
      .filter((x): x is (typeof pillarLabels)[number] => x !== null);
    if (hitPillars.length === 0) continue;
    const t = SHENSHA_CLAIMS[key];
    claims.push({ templateId: t.templateId, category: 'shensha', term: t.term, pinyin: t.pinyin, claim: t.claim, context: `${hitPillars.join(', ')} branch` });
  }

  // ---- 神煞: 三合-group stars (驿马/华盖/桃花), from year OR day branch per convention ----
  const groupStars = [shenshaFor(chart.year[1]), shenshaFor(chart.day[1])];
  const groupKeys: Array<['yima' | 'huagai' | 'taohua', keyof typeof SHENSHA_CLAIMS]> = [
    ['yima', 'yima'], ['huagai', 'huagai'], ['taohua', 'taohua'],
  ];
  for (const [field, key] of groupKeys) {
    const targets = new Set(groupStars.map((g) => g[field]).filter((x): x is string => !!x));
    const hitPillars = branches
      .map((b, i) => (targets.has(b) ? pillarLabels[i] : null))
      .filter((x): x is (typeof pillarLabels)[number] => x !== null);
    if (hitPillars.length === 0) continue;
    const t = SHENSHA_CLAIMS[key];
    claims.push({ templateId: t.templateId, category: 'shensha', term: t.term, pinyin: t.pinyin, claim: t.claim, context: `${hitPillars.join(', ')} branch` });
  }

  return claims;
}
