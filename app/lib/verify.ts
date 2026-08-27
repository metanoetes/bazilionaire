/**
 * PHASE 3 — the engine grades the tutor.
 *
 * Phase 2 checks that a sentence CITES something. That is a weak bar: a model
 * can cite F-STRENGTH and then say the opposite of what F-STRENGTH says. This
 * module checks the sentence's own CLAIM against the facts it cited, using the
 * only thing checkable deterministically in a browser with no model: the
 * doctrine's closed vocabularies.
 *
 * THREE KINDS OF VOCABULARY, because conflating them produces nonsense:
 *
 *   'chart'    exactly one value for the whole chart — 身强/身弱, 得令/失令, the
 *              season state, the pattern name, the recommended 用神 method.
 *              Naming a different member than the cited fact carries IS a
 *              contradiction, full stop.
 *   'pillar'   exclusive but subject-relative — a growth stage belongs to a stem
 *              in a branch, a 十神 to a particular stem, a relation to a pair.
 *              Contradiction here requires an ANCHOR: the sentence must also
 *              name that fact's branch, stem, or pillar word. Without one it is
 *              a generic mention — "a stem sitting at 帝旺 is at the strongest of
 *              the twelve" teaches the vocabulary, it does not misreport a chart.
 *   'presence' not exclusive at all — a chart has four stems and five elements.
 *              Naming 辛 while citing a fact that mentions 己 contradicts
 *              nothing. These only fire when the token appears NOWHERE in the
 *              sheet, which is the invented-doctrine case.
 *
 * PER-CITATION, NOT POOLED. Exclusive groups are checked against each cited fact
 * separately. Pooling the citations' tokens let a sentence that misattributes a
 * value pass whenever it also named a correct one — cite two stage facts, report
 * the day pillar's stage as the year's, and the union covered the lie.
 *
 * A token can belong to several groups at once (死 is both a season state and a
 * growth stage) and is registered in all of them, or a fact's own 死 would fail
 * to defend the sentence's 死.
 *
 * VERDICTS, worst first: contradicted → ungrounded → miscited → ok.
 *
 * WHAT THIS IS NOT: natural-language inference. It catches swapped verdicts,
 * wrong stages, invented doctrine and invented numbers. KNOWN GAPS, stated so
 * nobody mistakes silence for proof: negation is not modelled ("this chart is
 * not strong" is not read as a claim either way), hedges are not modelled, and a
 * sentence that cites correctly and uses only grounded tokens can still mislead
 * in English. So the UI says "no contradiction found against the cited facts" —
 * never "verified true". A checker that overclaimed would be worse than none.
 */
import type { Fact } from './factsheet';
import { NAYIN_LEXICON } from './nayin';

export type VerifyVerdict = 'ok' | 'miscited' | 'ungrounded' | 'contradicted';
type GroupKind = 'chart' | 'pillar' | 'presence';

export interface VerifyFinding {
  kind: 'contradicted' | 'ungrounded' | 'miscited' | 'enumeration';
  group: string;
  claimed: string[];
  cited?: string[];
  note: string;
}

export interface VerifiedSentence {
  verdict: VerifyVerdict;
  findings: VerifyFinding[];
  /** Tokens the checker actually examined — shown so the reader can see its reach. */
  checked: string[];
}

export interface VerifyReport {
  sentences: VerifiedSentence[];
  contradicted: number;
  ungrounded: number;
  miscited: number;
  unexaminable: number;
}

/**
 * `claimRequires` — some vocabularies get NAMED far more often than they get
 * CLAIMED. Each 用神 lens paragraph names its own method ("调候 — month branch 子
 * is deep winter…"); that is a mention, not an assertion about which method the
 * engine recommends. A method token therefore only counts as a claim when the
 * sentence carries recommendation language. Same principle as the English
 * strength aliases needing a predicate: without it, the checker fired on 12
 * sentences of the template's own known-good prose.
 */
const GROUPS: Array<{ name: string; kind: GroupKind; terms: string[]; claimRequires?: RegExp }> = [
  { name: '强弱 verdict', kind: 'chart', terms: ['身强', '身弱'] },
  { name: '得令 season command', kind: 'chart', terms: ['得令', '失令'] },
  // 死/旺/相/休/囚 are shared with the growth-stage vocabulary, so a season-state
  // claim must actually be about the season, or "at the 死 stage" reads as a
  // claim that the month state is 死.
  {
    name: '旺相休囚死 season state',
    kind: 'chart',
    terms: ['旺', '相', '休', '囚', '死'],
    claimRequires: /\bseason\b/i,
  },
  // Only 'rootless' is a checkable claim: it appears verbatim in F-ROOTLESS when
  // true. There is no 'rooted' token in any fact, so treating that word as a
  // claim would flag "巳 gives the day master a rooted seat" as ungrounded.
  { name: 'rootedness', kind: 'chart', terms: ['rootless'] },
  // The recommended 用神 method is ONE chart-wide value (yongshen.recommended.method),
  // so it belongs with the chart-level groups. Typed as 'pillar' it was
  // effectively unenforceable: F-YONGSHEN's anchors are stems/branches, so a
  // sentence naming the wrong method was almost always "unanchored" and passed.
  {
    name: '用神 method',
    kind: 'chart',
    terms: ['扶抑', '调候', '病药', '通关', '专旺'],
    claimRequires: /\b(?:leans? on|recommend|decision order|chosen|primary lens|the method is)\b/i,
  },
  {
    name: '格局 pattern',
    kind: 'chart',
    terms: [
      '正官格', '七杀格', '正财格', '偏财格', '正印格', '偏印格', '食神格', '伤官格',
      '建禄格', '羊刃格',
    ],
  },
  // 从格/化气格 are flagged CANDIDATES that coexist with the primary pattern, so
  // they cannot share its group: naming the candidate would "contradict" the
  // pattern fact and vice versa, though the prose legitimately names both.
  {
    name: '从格 candidate',
    kind: 'chart',
    terms: ['从旺格', '从儿格', '从财格', '从杀格', '化气格', '专旺格'],
  },
  {
    name: '十二长生 stage',
    kind: 'pillar',
    terms: ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'],
  },
  {
    name: '十神',
    kind: 'pillar',
    terms: ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'],
  },
  { name: '关系 relation', kind: 'pillar', terms: ['六合', '三合', '半合', '冲', '刑', '害', '自刑'] },
  { name: '空亡 void', kind: 'pillar', terms: ['空亡'] },
  /**
   * 神煞 star names — presence-kind, and none are in the fact sheet today (the
   * engine computes them but factsheet.ts does not carry them), so ANY mention
   * flags as ungrounded. That is the point: inventing a 神煞 is the most likely
   * hallucination for a Bazi-flavoured model, and naming the star as its own
   * token makes the finding legible ("天乙贵人 appears nowhere in the fact sheet")
   * instead of blaming the stray 乙 inside it. When 神煞 do reach the fact sheet
   * they become grounded automatically.
   */
  {
    name: '神煞 star',
    kind: 'presence',
    terms: [
      '天乙贵人', '文昌', '驿马', '华盖', '桃花', '羊刃', '禄神', '将星',
      '天德', '月德', '孤辰', '寡宿', '红鸾', '天喜', '劫煞', '亡神',
    ],
  },
  { name: '天干 stem', kind: 'presence', terms: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] },
  { name: '地支 branch', kind: 'presence', terms: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] },
  { name: '五行 element', kind: 'presence', terms: ['木', '火', '土', '金', '水'] },
  { name: '纳音 tone', kind: 'presence', terms: NAYIN_LEXICON.map((e) => e.name) },
];

const GROUP_KIND: Record<string, GroupKind> = Object.fromEntries(GROUPS.map((g) => [g.name, g.kind]));

/**
 * Which cited facts may CONTRADICT a claim in a group — i.e. which fact is
 * authoritative about that vocabulary.
 *
 * Necessary because tokens are deliberately registered in every group that
 * contains them (死 is both a season state and a growth stage), so without this
 * a 星运 fact reading 死 "contradicted" a sentence correctly reporting the season
 * state as 旺, and every 用神 lens fact "contradicted" the recommended method.
 * Keyed on fact id, which is stable and greppable; a group with no entry here is
 * never contradiction-checked, only ground-checked.
 */
const AUTHORITY: Record<string, RegExp> = {
  '强弱 verdict': /^F-STRENGTH$/,
  '得令 season command': /^F-DELING$/,
  '旺相休囚死 season state': /^F-DELING$/,
  rootedness: /^F-ROOTLESS$/,
  '用神 method': /^F-YONGSHEN$/,
  '格局 pattern': /^F-PATTERN$/,
  '从格 candidate': /^F-(EXTREME|HUAQI)$/,
  '十二长生 stage': /^F-(XINGYUN-|ROOT-)/,
  十神: /^F-(DESHI|PATTERN|FUYI|YONGSHEN|ZHUANWANG|DECADE-NOW)$/,
  '关系 relation': /^F-(REL-|SANHE-|DECADE-REL)/,
  '空亡 void': /^F-VOID$/,
};

/**
 * English the tutor is likely to write → the doctrine token it asserts.
 *
 * These require PREDICATE context with a CHART subject. A bare /\bstrong\b/ read
 * ordinary description as a verdict claim: "the root at 巳 is a weak seat for the
 * day master" was flagged as asserting 身弱, and "巳 gives the day master a strong
 * root" as asserting 身强 — both legitimate prose about a ROOT, not about the
 * chart's strength.
 *
 * Aliases apply in CLAIM mode only (see tokenize's `mode`). Applied to fact text
 * they misfire badly: the engine's own 调候 reasoning contains "when the chart is
 * strong but climate-starved", which made F-TIAOHOU look like it asserted 身强 on
 * a 身弱 chart, and every 用神 sentence citing it "contradicted" the engine.
 */
// The negative lookbehind matters: "The single root under this plate is strong
// enough to matter" contains "this plate is strong" but is a claim about a ROOT.
// A preposition before the subject means the chart is not the subject.
const SUBJ = String.raw`(?<!\b(?:under|of|in|for|with|beneath|below|above|by|near|around|within|across)\s)(?:this|the)\s+(?:chart|plate)`;
const ALIASES: Array<[RegExp, string]> = [
  [new RegExp(`${SUBJ}\\s+(?:is|reads|lands|comes out)\\s+(?:as\\s+)?strong\\b`, 'i'), '身强'],
  [new RegExp(`${SUBJ}\\s+(?:is|reads|lands|comes out)\\s+(?:as\\s+)?weak\\b`, 'i'), '身弱'],
  [/\b(?:is|reads|lands|comes out)\s+(?:as\s+)?strong overall\b/i, '身强'],
  [/\b(?:is|reads|lands|comes out)\s+(?:as\s+)?weak overall\b/i, '身弱'],
  [/\bdoes not command the season\b/i, '失令'],
  [/\bcommands the season\b/i, '得令'],
  [/\brootless\b/i, 'rootless'],
];

/**
 * Negation is not modelled, so a negated verdict asserts nothing rather than
 * asserting the opposite: "this chart is not strong" produces no 身强 claim.
 * Silently reading it as 身弱 would be inference this module has no business
 * doing; flagging it as 身强 would be a false positive.
 */
const NEGATED = /\b(?:not|never|hardly|isn't|is not)\s+(?:really\s+|especially\s+|very\s+)?(?:strong|weak)\b/i;

/**
 * Conditional and modal framing is a statement about WHEN a rule applies, not a
 * claim about this chart — "this can outrank 扶抑 when the chart is strong but
 * climate-starved" is doctrine, not a verdict. Guard the strength aliases with it.
 */
const HYPOTHETICAL = /\b(?:when|whenever|if|unless|can|could|would|might|should)\b/i;

/** Longest-match index, first character → candidates, each with ALL its groups. */
const TOKEN_INDEX: Map<string, Array<{ term: string; groups: string[] }>> = (() => {
  const byTerm = new Map<string, string[]>();
  for (const g of GROUPS) {
    for (const t of g.terms) {
      const groups = byTerm.get(t);
      if (groups) groups.push(g.name);
      else byTerm.set(t, [g.name]);
    }
  }
  const all = [...byTerm.entries()].map(([term, groups]) => ({ term, groups }));
  all.sort((a, b) => b.term.length - a.term.length);
  const idx = new Map<string, Array<{ term: string; groups: string[] }>>();
  for (const entry of all) {
    const key = entry.term[0];
    const bucket = idx.get(key);
    if (bucket) bucket.push(entry);
    else idx.set(key, [entry]);
  }
  return idx;
})();

/**
 * Tokenize into {group → tokens}. Longest match wins and consumes the run.
 *
 * `mode` matters:
 *   'claim' (default) — a sentence the model wrote. English aliases apply, and a
 *                       group with `claimRequires` only yields tokens when the
 *                       sentence carries that predicate.
 *   'fact'            — engine-derived fact text. Aliases and claim predicates
 *                       are OFF: facts assert their values in Chinese, and the
 *                       engine's English reasoning discusses doctrine generically
 *                       ("when the chart is strong…"), which must not be read as
 *                       an assertion about this chart.
 */
export function tokenize(text: string, mode: 'claim' | 'fact' = 'claim'): Record<string, Set<string>> {
  const found: Record<string, Set<string>> = {};
  const add = (group: string, term: string) => {
    (found[group] ??= new Set()).add(term);
  };

  if (mode === 'claim') {
    const guarded = NEGATED.test(text) || HYPOTHETICAL.test(text);
    for (const [re, token] of ALIASES) {
      if (!re.test(text)) continue;
      if (guarded && (token === '身强' || token === '身弱')) continue;
      for (const g of GROUPS) if (g.terms.includes(token)) add(g.name, token);
    }
  }

  const chars = Array.from(text);
  let i = 0;
  while (i < chars.length) {
    const bucket = TOKEN_INDEX.get(chars[i]);
    let step = 1;
    if (bucket) {
      for (const { term, groups } of bucket) {
        if (chars.slice(i, i + term.length).join('') === term) {
          for (const g of groups) {
            if (mode === 'claim') {
              const def = GROUPS.find((x) => x.name === g);
              if (def?.claimRequires && !def.claimRequires.test(text)) continue;
            }
            add(g, term);
          }
          step = term.length;
          break;
        }
      }
    }
    i += step;
  }
  return found;
}

/**
 * Only DECIMALS are checked, not bare integers.
 *
 * Sweeping 200 sentences of the template's own (known-correct) prose through this
 * checker flagged 10, and every flag was a count the prose had legitimately
 * derived — "the branches pull on each other in 4 places", "3 branches answer",
 * "the tones run 1×火 · 2×金". Counts and doctrine constants (four pillars,
 * twelve stages, sixty ganzhi) are in no single fact's text and never will be,
 * so checking integers is noise — and noise teaches the reader to ignore the
 * badges. Decimals are the opposite: every decimal here is an engine value (a
 * strength score, a subscore), so a decimal absent from the cited fact is
 * exactly the fabricated-figure case worth flagging.
 */
const NUM_RE = /[+-]?\d+\.\d+/g;
/**
 * Seats are matched POSITIONALLY — "the day pillar", "the month branch", "自坐" —
 * never by the bare word. "day" appears in "day master" and "month" in "the grain
 * of the month", so bare-word anchoring attached every 星运 fact to almost every
 * sentence and manufactured contradictions across seats.
 */
const POSITIONAL = /\b(year|month|day|hour)\s+(?:pillar|branch|stem|seat)\b/gi;
const OWN_SEAT = /\bits\s+own\s+(?:branch|seat|pillar)\b|自坐/i;

function seatsNamedIn(text: string): Set<string> {
  const seats = new Set<string>();
  for (const m of text.matchAll(POSITIONAL)) seats.add(m[1].toLowerCase());
  if (OWN_SEAT.test(text)) seats.add('day'); // the day pillar is the only "own" seat
  return seats;
}

/** Which seat a fact is about, from its id (F-XINGYUN-DAY → 'day'). */
function seatOfFact(id: string): string | null {
  const m = /-(YEAR|MONTH|DAY|HOUR)$/.exec(id);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Some facts carry SEVERAL seats in one string: F-DESHI's detail is
 * "year 庚 劫财 · month 癸 食神 · hour 庚 劫财". When a sentence names one seat, the
 * fact's claim for that seat is the matching segment — otherwise "the year stem
 * reads 正官" could be defended by the month stem's 十神.
 */
function factSegmentsForSeat(f: Fact, seat: string): string[] {
  return factText(f)
    .split(/[·;]/)
    .map((seg) => seg.trim())
    .filter((seg) => new RegExp(`\\b${seat}\\b`, 'i').test(seg));
}

function factText(f: Fact): string {
  return `${f.term ?? ''} ${f.label} ${f.value} ${f.detail ?? ''}`;
}

/** Numeric values in a text, parsed — so 0.3 no longer "matches" 0.33 by substring. */
function numbersIn(text: string): number[] {
  return (text.match(NUM_RE) ?? []).map(Number).filter((n) => Number.isFinite(n));
}

/**
 * Anchors of one fact: the concrete subjects it is about — its stems, branches,
 * and any pillar word anywhere in it (F-DESHI's label is "stem support" while its
 * DETAIL is what names year/month/hour).
 */
function anchorsOf(f: Fact): { tokens: Set<string>; seat: string | null } {
  const t = tokenize(factText(f), 'fact');
  const tokens = new Set<string>();
  // BRANCHES only. The day master's stem appears in every 星运 and root fact, so
  // a stem anchor identifies no particular seat — it anchored every stage fact to
  // every sentence that named the day master, which is most of them.
  for (const tok of t['地支 branch'] ?? []) tokens.add(tok);
  return { tokens, seat: seatOfFact(f.id) };
}

/**
 * Every exclusive group MUST name its authoritative fact(s), or claims in that
 * group are silently never contradiction-checked. Exported so the gate can
 * assert coverage: a new group added without an AUTHORITY entry is a checker
 * that quietly stops checking, which is the worst failure mode available here.
 */
export function groupsMissingAuthority(): string[] {
  return GROUPS.filter((g) => g.kind !== 'presence' && !AUTHORITY[g.name]).map((g) => g.name);
}

export function verifySentence(sentence: string, cites: string[], sheet: Fact[]): VerifiedSentence {
  const byId = new Map(sheet.map((f) => [f.id, f]));
  const citedFacts = cites.map((id) => byId.get(id)).filter((f): f is Fact => f !== undefined);

  const clean = sentence.replace(/\[(F-[A-Z0-9-]+)\]/g, ' ');
  const said = tokenize(clean);
  // Sentence-side tokens, used for anchoring: tokenized, not substring-matched,
  // so a stem character inside an unrelated compound cannot anchor a claim.
  const saidStems = new Set([...(said['天干 stem'] ?? []), ...(said['地支 branch'] ?? [])]);
  const seatsSaid = seatsNamedIn(clean);

  const citedText = citedFacts.map(factText).join(' ');
  const cited = tokenize(citedText, 'fact');
  const sheetText = sheet.map(factText).join(' ');
  const sheetTokens = tokenize(sheetText, 'fact');

  const findings: VerifyFinding[] = [];
  const checked: string[] = [];
  const contradictedGroups = new Set<string>();

  // ---- per-citation contradiction pass over exclusive groups ----
  for (const f of citedFacts) {
    const anchors = anchorsOf(f);
    // If the sentence names exactly one seat and this fact carries a segment for
    // that seat, judge the fact by that segment alone.
    const namedSeat = seatsSaid.size === 1 ? [...seatsSaid][0] : null;
    const seatSegments = namedSeat ? factSegmentsForSeat(f, namedSeat) : [];
    const factTokens = tokenize(
      seatSegments.length > 0 ? seatSegments.join(' ') : factText(f),
      'fact',
    );
    const anchoredToThisFact =
      [...anchors.tokens].some((t) => saidStems.has(t)) ||
      (anchors.seat !== null && seatsSaid.has(anchors.seat)) ||
      seatSegments.length > 0;

    for (const [group, saidSet] of Object.entries(said)) {
      const kind = GROUP_KIND[group];
      if (kind === 'presence') continue;
      const authority = AUTHORITY[group];
      if (!authority || !authority.test(f.id)) continue; // this fact is not authoritative here
      const factList = [...(factTokens[group] ?? [])];
      if (factList.length === 0) continue;

      const saidList = [...saidSet];
      // A seat assertion defeats the enumeration escape here: naming many stages
      // is teaching, but "at the day pillar it is at X" is still a claim.
      const enumerating = saidList.length >= 3 && seatsSaid.size === 0;
      if (enumerating) continue;
      if (kind === 'pillar' && !anchoredToThisFact) continue;
      if (saidList.some((t) => factList.includes(t))) continue;

      contradictedGroups.add(group);
      findings.push({
        kind: 'contradicted',
        group,
        claimed: saidList,
        cited: factList,
        note: `the sentence says ${saidList.join('/')} but ${f.id} says ${factList.join('/')}`,
      });
    }
  }

  // ---- grounding pass: is each claimed token anywhere in the citation / sheet ----
  // Subject-relative (pillar-kind) groups are only ground-checked when the
  // sentence is anchored to some cited fact. Otherwise a teaching sentence that
  // names a stage this chart happens not to have — "the cycle runs 长生 through
  // 墓 and round again" — reads as an invented value instead of vocabulary.
  const anchoredToAny = citedFacts.some((f) => {
    const a = anchorsOf(f);
    return [...a.tokens].some((t) => saidStems.has(t)) || (a.seat !== null && seatsSaid.has(a.seat));
  });

  for (const [group, saidSet] of Object.entries(said)) {
    const kind = GROUP_KIND[group];
    const saidList = [...saidSet];
    const citedList = [...(cited[group] ?? [])];
    const inSheet = sheetTokens[group] ?? new Set<string>();
    checked.push(...saidList);

    if (kind === 'pillar' && !anchoredToAny) continue;

    // The enumeration escape has to come BEFORE the presence branch, or a sentence
    // teaching a closed vocabulary ("the ten stems run 甲 乙 丙 …") is reported as
    // inventing every member this chart happens not to contain. Teaching the terms
    // is what the tutor is asked to do.
    if (saidList.length >= 3 && kind === 'presence') {
      findings.push({
        kind: 'enumeration',
        group,
        claimed: saidList,
        note: `${saidList.length} members of ${group} named at once — read as explaining the vocabulary`,
      });
      continue;
    }

    if (kind === 'presence') {
      for (const t of saidList) {
        // Substring, not tokenized membership: 羊刃 is a real 神煞 that is also the
        // head of the pattern name 羊刃格, and longest-match tokenization files the
        // sheet's 羊刃格 as a pattern — so on a 羊刃格 chart a correct sentence about
        // the 羊刃 was reported as invented doctrine.
        if (!inSheet.has(t) && !sheetText.includes(t)) {
          findings.push({
            kind: 'ungrounded',
            group,
            claimed: [t],
            note: `${t} appears nowhere in the fact sheet`,
          });
        }
      }
      continue;
    }

    if (contradictedGroups.has(group)) continue; // already reported, worse verdict

    // Unlike the contradiction pass, the enumeration escape here applies even
    // with a seat assertion present: a sentence listing many members of a
    // vocabulary is teaching it, and the members beyond this chart's own values
    // are the vocabulary, not fabrications ("the cycle runs 长生 through 墓").
    // The seat's own value has already been checked for contradiction above.
    if (saidList.length >= 3) {
      findings.push({
        kind: 'enumeration',
        group,
        claimed: saidList,
        note: `${saidList.length} members of ${group} named at once — read as explaining the vocabulary, not asserting a value`,
      });
      continue;
    }

    for (const t of saidList) {
      if (citedList.includes(t)) continue;
      if (!inSheet.has(t)) {
        findings.push({
          kind: 'ungrounded',
          group,
          claimed: [t],
          cited: citedList.length > 0 ? citedList : undefined,
          note: `${t} appears nowhere in the fact sheet`,
        });
      } else if (kind === 'chart' && citedFacts.length > 0) {
        findings.push({
          kind: 'miscited',
          group,
          claimed: [t],
          cited: citedList.length > 0 ? citedList : undefined,
          note: `${t} is true of this chart but is not in the cited fact`,
        });
      }
    }
  }

  // ---- numbers: compared as values, not substrings ----
  const citedNums = numbersIn(citedText);
  const sheetNums = numbersIn(sheetText);
  for (const n of numbersIn(clean)) {
    checked.push(String(n));
    if (citedNums.includes(n)) continue;
    findings.push({
      kind: sheetNums.includes(n) ? 'miscited' : 'ungrounded',
      group: 'number',
      claimed: [String(n)],
      note: sheetNums.includes(n)
        ? `the number ${n} is in the sheet but not in the cited fact`
        : `the number ${n} appears nowhere in the fact sheet`,
    });
  }

  const verdict: VerifyVerdict = findings.some((f) => f.kind === 'contradicted')
    ? 'contradicted'
    : findings.some((f) => f.kind === 'ungrounded')
      ? 'ungrounded'
      : findings.some((f) => f.kind === 'miscited')
        ? 'miscited'
        : 'ok';

  return { verdict, findings, checked };
}

export function verifyTutorOutput(
  sentences: Array<{ text: string; cites: string[] }>,
  sheet: Fact[],
): VerifyReport {
  const results = sentences.map((s) => verifySentence(s.text, s.cites, sheet));
  return {
    sentences: results,
    contradicted: results.filter((r) => r.verdict === 'contradicted').length,
    ungrounded: results.filter((r) => r.verdict === 'ungrounded').length,
    miscited: results.filter((r) => r.verdict === 'miscited').length,
    unexaminable: results.filter((r) => r.checked.length === 0).length,
  };
}
