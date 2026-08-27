import { STEM_LEXICON, BRANCH_LEXICON } from './lexicon';
import { NAYIN_LEXICON } from './nayin';
import { CURRICULUM } from './curriculum';

export interface GlossEntry {
  pinyin: string;
  gloss: string;
}

const GLOSSARY: Record<string, GlossEntry> = {};

/** First entry for a term wins — curated/specific glosses are added before generic ones. */
function add(term: string | undefined, pinyin: string | undefined, gloss: string) {
  if (!term || !pinyin) return;
  if (GLOSSARY[term]) return;
  GLOSSARY[term] = { pinyin, gloss };
}

// Stems and branches — richest single-char entries, added first.
for (const info of Object.values(STEM_LEXICON)) {
  add(info.char, info.pinyin, `${info.element} · ${info.polarity} — ${info.gloss}`);
}
for (const info of Object.values(BRANCH_LEXICON)) {
  add(info.char, info.pinyin, `${info.element} · ${info.polarity}${info.animal ? ` · ${info.animal}` : ''} — ${info.gloss}`);
}

// 纳音 — the 30 element-tones. Registering them here is what makes the tone
// names clickable everywhere they appear (chart grid, curriculum prose,
// module 5's table) through ClickableCJK's greedy longest-match: 海中金 wins
// over its constituent single characters.
for (const e of NAYIN_LEXICON) {
  add(e.name, e.pinyin, `${e.element} · 纳音 ${e.english} — ${e.image}`);
}

// Curriculum: module titles, section headers, and every curated term entry.
// A section's `chinese` is registered ONLY when it is a single term. Composite
// labels ("太阴 少阴 少阳 太阳", "冲 · 刑 · 害") must not become one glossary key:
// greedy-longest-match would then underline the whole label as a single blob,
// so 太阳 never gets its own popover and only the stray 阳/阴 chars inside it
// match. Skipping them lets ClickableCJK match each constituent separately —
// every constituent is covered by a terms[] entry or another section.
for (const mod of CURRICULUM) {
  add(mod.title, mod.pinyin, mod.subtitle);
  for (const sec of mod.sections) {
    if (sec.chinese && !/[\s·]/.test(sec.chinese)) add(sec.chinese, sec.pinyin, sec.heading);
    for (const t of sec.terms ?? []) add(t.term, t.pinyin, t.gloss);
  }
}

// Hand-curated: terms used in site chrome / prose that aren't module titles
// or curriculum terms.terms[] entries.
const EXTRA: Array<[string, string, string]> = [
  ['八字', 'bā zì', 'eight characters — the chart, the map (year/month/day/hour, stem + branch)'],
  ['气', 'qì', 'the created, breath-like medium the classics describe — never worshipped'],
  ['犹大之狮', 'yóu dà zhī shī', 'the Lion of Judah (Rev 5:5) — Christ, the way'],
  ['课程', 'kè chéng', 'curriculum — the ten learning modules'],
  ['研究', 'yán jiū', 'research — the open question of whether interpretations correspond to anything real, tested with a blind own-vs-comparison-chart control'],
  ['合婚', 'hé hūn', 'pair reading — two computed structural layers, never a verdict about two people'],
  ['命', 'mìng', 'decree, fate — the given lot; not a cage for the reborn'],
  ['运', 'yùn', 'flow, luck — the moving decade/year layer over the fixed chart'],
  ['命与运', 'mìng yǔ yùn', 'decree and flow — the fixed chart and its moving decades'],
  ['重生', 'chóng shēng', 'rebirth (John 3:3; 2 Cor 5:17) — the app records the date; the same weather falls, on a new creation'],
  ['善人不为命所缚', 'shàn rén bù wéi mìng suǒ fù', 'the good are not bound by fate — the project’s closing line on every reading'],
  ['大运', 'dà yùn', 'the decade pillars — the moving ten-year layer over the fixed natal chart'],
  ['起运', 'qǐ yùn', 'when the decade sequence begins, counted from birth to the next governing 节'],
  ['日主', 'rì zhǔ', 'the day master — the day stem, the lens the whole chart is read through'],
  ['干支', 'gān zhī', 'stems and branches — the whole sexagenary system'],
  ['财', 'cái', 'wealth — the day master’s restrained phase, 偏财 / 正财'],
  ['官', 'guān', 'officer, discipline — the phase that restrains the day master, 七杀 / 正官'],
  ['汉字', 'hàn zì', 'Chinese characters'],
  ['合', 'hé', 'harmony — a pair or group of stems/branches that combine'],
  ['冲', 'chōng', 'opposition — the most energetic branch relation, a clash across the wheel'],
  ['刑', 'xíng', 'punishment — a structural strain between branches, eleven canonical pairs'],
  ['三刑', 'sān xíng', 'the three-branch punishment triangle — two 90° 刑 legs plus one 180° 冲 leg, distinct from the evenly-spaced 三合 group'],
  ['害', 'hài', 'harm — the quiet branch relation, neither harmony nor clash'],
  ['三合', 'sān hé', 'a three-branch group spanning one phase’s whole season'],
  ['半合', 'bàn hé', 'half harmony — the adjacent pair inside a 三合 group'],
  ['实', 'shí', '冲空则实 — a clash striking a voided branch, filling it'],
  ['调候', 'tiáo hòu', 'adjusting the climate — the chart’s elemental, seasonal need'],
  ['字形', 'zì xíng', 'glyph form — the chart grid’s stem/branch character layer'],
  ['节', 'jié', 'a solar term — one of the 12 that turn the month pillar, or 24 total'],
  ['空亡', 'kōng wáng', 'void branches — the two empty seats of the day pillar’s 旬'],
  ['用神', 'yòng shén', 'the useful god — a chart’s medicine; computed by all five classical methods, shown with reasoning, never prescribed'],
  ['命盘', 'mìng pán', 'the plate — the whole chart laid out as a grid: four pillars read down, each doctrine layer read across'],
  ['星运', 'xīng yùn', 'the day master’s 十二长生 growth stage in each pillar’s branch — 长生, 帝旺, 绝 …'],
  ['自坐', 'zì zuò', 'self-seat — the day master’s own growth stage in its own day branch'],
  ['关系', 'guān xì', 'relations — the 合冲刑害 structure between branches, computed, never scored as luck'],
  ['旬', 'xún', 'a ten-day week of the sexagenary cycle; each 旬 has two empty branch seats (空亡)'],
  ['冲空则实', 'chōng kōng zé shí', 'a clash against a voided branch fills it — the void is thin, not sealed'],
  // 十神 — module 7's ten relations, distilled to the register the module uses
  // ("reads as X; its shadow is Y"). The chart grid's 十神 row tags every stem
  // with one of these, so all ten need a gloss or the row underlines unevenly.
  ['比肩', 'bǐ jiān', 'the peer — same phase, same polarity: the comrade. Reads as self-reliance; its shadow is stubbornness'],
  ['劫财', 'jié cái', 'the rival — same phase, opposite polarity: the sparring partner. Reads as ambition; its shadow is dispute'],
  ['食神', 'shí shén', 'the output — what you generate in your own register: the craftsman’s joy. Shadow: indulgence'],
  ['伤官', 'shāng guān', 'the talent — output in the crossed register: invention that challenges the rules. Shadow: rebellion for its own sake'],
  ['偏财', 'piān cái', 'wealth, same register — the windfall, the deal found on the street. Reads as enterprise; shadow: speculation'],
  ['正财', 'zhèng cái', 'wealth, crossed register — the harvest you cultivate. Reads as diligence; shadow: miserliness'],
  ['七杀', 'qī shā', 'the pressure — restraint in your own register, the weight that tests. Reads as courage under load; shadow: domination'],
  ['正官', 'zhèng guān', 'the discipline — restraint in the crossed register, the law that protects. Reads as integrity; shadow: rigidity'],
  ['偏印', 'piān yìn', 'the resource, same register — the unconventional teacher. Reads as intuition; shadow: detachment'],
  ['正印', 'zhèng yìn', 'the resource, crossed register — the school, the shelter. Reads as scholarship; shadow: coddling'],
  // 十二长生 — the 星运 row prints one of these per pillar. 长生/帝旺/墓 already
  // come from module 9's terms[]; first-add-wins leaves those untouched.
  ['沐浴', 'mù yù', 'bathing — the second growth stage: newly born, exposed, not yet dressed'],
  ['冠带', 'guān dài', 'capping — the third stage: coming of age, taking the cap and sash'],
  ['临官', 'lín guān', 'office — the fourth stage: entering duty, strength nearly at peak'],
  ['衰', 'shuāi', 'decline — the stage just past the peak'],
  ['病', 'bìng', 'illness — a weakened stage of the twelve'],
  ['死', 'sǐ', 'death — one of the three weakest growth stages (死/绝/病)'],
  ['绝', 'jué', 'severance — the emptiest of the twelve stages, the phase cut off from support'],
  ['胎', 'tāi', 'conception — the stage of what has been conceived but not yet born'],
  ['养', 'yǎng', 'nurture — the last stage, gestation completing before 长生 begins again'],
];
for (const [term, pinyin, gloss] of EXTRA) add(term, pinyin, gloss);

export function lookupGloss(term: string): GlossEntry | null {
  return GLOSSARY[term] ?? null;
}

/** Longest terms first, so greedy scanning prefers multi-char compounds over single chars. */
export const GLOSSARY_TERMS: string[] = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

export const MAX_TERM_LEN = GLOSSARY_TERMS.reduce((m, t) => Math.max(m, t.length), 1);

/**
 * Terms indexed by first character, longest-first within each bucket —
 * ClickableCJK's greedy scan only needs to try terms that could actually
 * start at the current position, instead of every term in the glossary.
 */
export const GLOSSARY_TERMS_BY_FIRST_CHAR: Map<string, string[]> = (() => {
  const idx = new Map<string, string[]>();
  for (const term of GLOSSARY_TERMS) {
    const first = term[0];
    const bucket = idx.get(first);
    if (bucket) bucket.push(term);
    else idx.set(first, [term]);
  }
  return idx;
})();

export { GLOSSARY };
