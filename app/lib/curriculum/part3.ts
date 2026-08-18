import type { CurriculumModule } from './types';

/** Modules 7–10: reading the chart — ten gods, interactions, decades and years, the frame. */
export const READING: CurriculumModule[] = [
  {
    id: 7,
    title: '十神',
    pinyin: 'shí shén',
    subtitle: 'ten gods — the day master\'s ten relations',
    intro: [
      'The 十神 are not gods and not ghosts: they are the ten ways another stem can relate to the day master. Five relations, each in two registers (same polarity / opposite polarity), makes ten. The five relations are just the 五行 cycles from module 2, seen from one seat: the day master\'s.',
      'Same phase → the peers (比肩, 劫财). The day master generates → the outputs (食神, 伤官). The day master restrains → the wealth (偏财, 正财). Restrains the day master → the discipline (七杀, 正官). Generates the day master → the resources (偏印, 正印). That is the entire system: five verbs, ten names.',
    ],
    sections: [
      {
        heading: 'the five relations × two polarities',
        table: {
          head: ['relation (what the other stem does to the day master)', 'same polarity / opposite polarity'],
          rows: [
            ['same phase — a peer', '比肩 bǐ jiān / 劫财 jié cái'],
            ['the day master generates it — an output', '食神 shí shén / 伤官 shāng guān'],
            ['the day master restrains it — wealth', '偏财 piān cái / 正财 zhèng cái'],
            ['it restrains the day master — discipline', '七杀 qī shā / 正官 zhèng guān'],
            ['it generates the day master — resource', '偏印 piān yìn / 正印 zhèng yìn'],
          ],
        },
        paragraphs: [
          'The polarity rule: when the other stem shares the day master\'s polarity, the name takes the 偏/比/食/杀 register (the "same" register); when polarities differ, it takes the 正/劫/伤/官 register (the "crossed" register). One exception in naming: among the peers, same polarity is 比肩 and opposite is 劫财 — the pair itself is called 比劫.',
        ],
      },
      {
        heading: 'a complete worked table — 甲 day master',
        table: {
          head: ['other stem', 'its 十神 to 甲 (yang wood)'],
          rows: [
            ['甲 (yang wood, same phase & polarity)', '比肩 — the peer'],
            ['乙 (yin wood, same phase)', '劫财 — the rival'],
            ['丙 (yang fire; wood generates fire)', '食神 — the output'],
            ['丁 (yin fire; wood generates fire)', '伤官 — the talent'],
            ['戊 (yang earth; wood restrains earth)', '偏财 — the wealth'],
            ['己 (yin earth; wood restrains earth)', '正财 — the wealth'],
            ['庚 (yang metal; metal restrains wood)', '七杀 — the pressure'],
            ['辛 (yin metal; metal restrains wood)', '正官 — the discipline'],
            ['壬 (yang water; water generates wood)', '偏印 — the resource'],
            ['癸 (yin water; water generates wood)', '正印 — the resource'],
          ],
        },
        paragraphs: [
          'Run the same table for any other day master and you get the whole system — swap the day master\'s phase, keep the five verbs, and the ten names follow. The app does exactly this for every pillar of your chart and every hidden stem: the chart grid\'s 十神 layer tags each character with its relation to the day master.',
        ],
      },
      {
        heading: 'the ten, one by one — vocabulary, not verdicts',
        paragraphs: [
          'The tradition gives each 十神 a temperament vocabulary. Read these as lenses — ways a relationship shows up — never as sentences. A "wealth" in your chart does not promise money; a "pressure" does not threaten harm.',
          '比肩 bǐ jiān — the peer: same phase, same polarity. The equal, the comrade, the one who runs beside you. Strong 比肩 reads as self-reliance; its shadow is stubbornness.',
          '劫财 jié cái — the rival: same phase, opposite polarity. The competitive edge of your own element — the sparring partner. It reads as ambition and risk; its shadow is dispute.',
          '食神 shí shén — the output: what you generate in your own register. The craftsman\'s joy — making for the sake of making. It reads as skill and appetite; its shadow is indulgence.',
          '伤官 shāng guān — the talent: what you generate in the crossed register. The contrarian\'s brilliance — making that challenges the rules. It reads as invention; its shadow is rebellion for its own sake.',
          '偏财 piān cái — the wealth, same register: opportunity\'s windfall, the deal found on the street. It reads as enterprise; its shadow is speculation.',
          '正财 zhèng cái — the wealth, crossed register: the harvest you cultivate — steady, earned, kept. It reads as diligence; its shadow is miserliness.',
          '七杀 qī shā — the pressure: restraint in your own register — the weight that tests. It reads as courage under load; its shadow is domination. (Its older name, 偏官, means exactly "crossed officer.")',
          '正官 zhèng guān — the discipline: restraint in the crossed register — the law that protects. It reads as integrity and structure; its shadow is rigidity.',
          '偏印 piān yìn — the resource, same register: the unconventional teacher, learning from odd places. It reads as intuition; its shadow is detachment.',
          '正印 zhèng yìn — the resource, crossed register: the school, the shelter, the tradition that feeds you. It reads as scholarship and kindness; its shadow is coddling.',
          'One naming note for 合婚 readings (the pair panel in the app): for a male chart, 财 is traditionally called the "wife star," and for a female chart, 官 the "husband star." This is a naming convention inside the system — a label for a relation, never a verdict about a marriage.',
        ],
      },
    ],
  },
  {
    id: 8,
    title: '合冲刑害',
    pinyin: 'hé chōng xíng hài',
    subtitle: 'interactions — how branches talk to each other',
    intro: [
      'Branches relate to each other in fixed geometries, the same way musical notes form chords. Six relation types: 六合 (harmony pairs), 三合 (three-branch groups) with 半合 (half groups), 冲 (opposition), 刑 (punishment), 害 (harm). The first rule of reading them: a pair can carry MORE than one relation at once. 巳申 is a harmony pair AND a punishment leg; 寅申 is an opposition AND a punishment leg. The app lists every relation a pair carries — it never hides one behind another.',
      'The second rule: these are structural facts, not fortunes. A 冲 marks a geometry; what it means in a life is a reading, and readings are yours.',
    ],
    sections: [
      {
        heading: '六合 — the six harmony pairs',
        chinese: '六合',
        pinyin: 'liù hé',
        table: {
          head: ['pair', 'the traditional picture'],
          rows: [
            ['子丑', 'seed and turning soil — water absorbed by winter earth'],
            ['寅亥', 'dawn and deep water — spring watered from the night'],
            ['卯戌', 'leaf and dry mountain — wood kept warm by the fire-vault'],
            ['辰酉', 'wet earth and pure metal — ore drawn from the wet vault'],
            ['巳申', 'coiled fire and formed metal — the forge\'s two halves'],
            ['午未', 'noon and garden earth — the sun ripening the fruit'],
          ],
        },
        paragraphs: [
          'Six pairs, each one yang and one yin branch, each a complement. The tradition adds a layer of 合化 "transformations" (each pair said to fuse into a phase — 子丑合化土, 寅亥合化木, 卯戌合化火, 辰酉合化金, 巳申合化水; schools differ on 午未). That layer is interpretation; the app computes the pair, not the transformation.',
        ],
      },
      {
        heading: '三合 and 半合 — the four great groups',
        chinese: '三合 · 半合',
        pinyin: 'sān hé · bàn hé',
        paragraphs: [
          'Four three-branch groups, each the three seats of one phase across the year: 申子辰 (water), 亥卯未 (wood), 寅午戌 (fire), 巳酉丑 (metal). Each group is a season\'s arc — beginning, height, storehouse — so the three branches are phase-pure even though two of them are nominally other elements.',
          '半合 "half harmony" is the adjacent pair inside a group: 申子 or 子辰, but NOT 申辰 — the end pair skips the middle seat and carries no relation by itself. (Some schools call the end pair 拱 gǒng, "the arch," and read it as the missing middle — a further layer the app does not compute.) The app\'s 流年 also detects 三合 completion: when a transit branch fills the one missing seat of a group whose other two sit in your chart, the year\'s marker reads 三合 — the arc closes.',
        ],
      },
      {
        heading: '冲 — the six oppositions',
        chinese: '冲',
        pinyin: 'chōng',
        paragraphs: [
          'Six opposite pairs across the wheel: 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥. Opposition is the most energetic relation — two forces facing each other across the chart. In a transit year, a 冲 to a natal branch is traditionally the loudest event of the year — a confrontation, a move, a change of season. Read it as weather: a storm is neither good nor bad until you know what was standing in the field.',
          'Two special cases. 冲空则实 chōng kōng zé shí — "a clash on a void fills it": when the year\'s branch clashes with a natal branch that sits in the chart\'s 空亡 (void) seats, the tradition reads the void as filled — the empty chair gets an occupant. The app marks these with 实. And 伏吟/反吟: a transit branch identical to a natal branch (伏吟, "hidden chant") or opposite to it (反吟, "returning chant") — the same-pair and opposite-pair cases of the year touching your chart. The app shows them through the same matrix: 反吟 is the 冲 marker; 伏吟 shows only when the branch is one of the four 自刑 (below).',
        ],
        terms: [
          { term: '冲空则实', pinyin: 'chōng kōng zé shí', gloss: 'a clash striking a voided branch fills it' },
          { term: '空亡', pinyin: 'kōng wáng', gloss: 'the two void branches of the day pillar\'s 旬 — the chart\'s empty seats' },
          { term: '伏吟', pinyin: 'fú yín', gloss: 'a transit branch identical to a natal branch' },
          { term: '反吟', pinyin: 'fǎn yín', gloss: 'a transit branch opposite a natal branch' },
        ],
      },
      {
        heading: '刑 — the full canonical set',
        chinese: '刑',
        pinyin: 'xíng',
        paragraphs: [
          'Punishment is the system\'s most misunderstood relation — folk tables often leave out half of it. The full canonical set is eleven pairs in four families:',
          '无礼之刑 wú lǐ zhī xíng — "punishment of the unmannered": 子卯, the single pair of the yang-water / yin-wood axis, across the wheel.',
          '恃势之刑 shì shì zhī xíng — "punishment of the presumptuous": the triangle 寅巳申 — ALL three legs punish, including the 冲 leg 寅申 and the 六合 leg 巳申. Note the multi-relations: 巳申 is BOTH harmony and punishment; 寅申 is BOTH opposition and punishment.',
          '无恩之刑 wú ēn zhī xíng — "punishment of the ungrateful": the triangle 丑戌未 — all three legs punish, including the 冲 leg 丑未.',
          '自刑 zì xíng — "self-punishment": 辰辰, 午午, 酉酉, 亥亥. When a transit branch lands on one of these four and the same branch sits in the natal chart, the year\'s marker reads 刑 — the chart meeting itself in the one place that hurts.',
          'The engine implements exactly this set — it is the set pinned in the project\'s review process, and the transit timeline shows every 刑 leg, never a subset.',
        ],
      },
      {
        heading: '害 — the six harms',
        chinese: '害',
        pinyin: 'hài',
        paragraphs: [
          'Six pairs: 丑午, 子未, 寅巳, 卯辰, 申亥, 酉戌. Harm is the quiet relation — the pair that shares space without harmonizing or opposing, like two neighbors who keep tripping over each other\'s fence. Note again the overlaps: 寅巳 is BOTH a punishment leg and a harm pair — the app shows both.',
        ],
      },
      {
        heading: '调候 — the climate of the chart',
        chinese: '调候',
        pinyin: 'tiáo hòu',
        paragraphs: [
          'The month branch names the climate: winter months (亥子丑) are cold and look for fire; summer months (巳午未) are hot and look for water. 调候 "adjusting the climate" is the chart\'s elemental need — and the transit timeline marks the years whose branch supplies it (a 巳 or 午 year feeding a winter chart). It is the most concrete, least interpretive relation in the whole system: a season and its fuel.',
        ],
      },
      {
        heading: 'reading interactions honestly',
        paragraphs: [
          'Every marker in the app\'s timeline is a geometric fact from the engine: which pair, which relation, which void was struck. What it MEANS is deliberately not computed. The markers have no colors of fortune, no red for "bad" and green for "good" — because a clash in one life is a rescue in another, and no arithmetic knows which is which. Structure is computed; meaning is read. The line between them is this project\'s whole discipline.',
        ],
      },
    ],
  },
  {
    id: 9,
    title: '大运流年',
    pinyin: 'dà yùn liú nián',
    subtitle: 'decades and years — the moving layer',
    intro: [
      'The natal chart is fixed forever — it is the map drawn at birth. But the sky keeps moving, and the tradition layers two moving clocks over the fixed chart: 大运 dà yùn, the decade pillars, and 流年 liú nián, the annual pillars. The natal chart is the terrain; the decades are the seasons; the years are the weather.',
    ],
    sections: [
      {
        heading: '起运 — when the decades begin',
        chinese: '起运',
        pinyin: 'qǐ yùn',
        paragraphs: [
          'The decade sequence does not start at birth — it starts when the chart has "traveled" from birth to the next governing 节 (or back to the previous one, for backward charts). The count is the sect-1 convention: 3 days = 1 year, 1 day = 4 months, 1 时辰 (two hours) = 10 days.',
          'Worked example: born 2024-01-03 at noon, a forward chart. The next 节 is 小寒 on January 6, roughly 2.7 days away — 2 days 6 时辰. 2 days = 8 months; 6 时辰 = 60 days = 2 months; total 0 years 10 months 20 days. The first decade therefore starts within the birth year, at 虚岁 1. A birth farther from its 节 counts more years — the distance from birth to the turn of the season IS the length of childhood before the decades open.',
          'One convention note: the tradition counts ages in 虚岁 xū suì — one at birth, two at the first new year. The app\'s decade headers use this convention, matching the oracle it is pinned against.',
        ],
        terms: [
          { term: '虚岁', pinyin: 'xū suì', gloss: 'the traditional count — one year old at birth' },
        ],
      },
      {
        heading: 'direction — forward or back',
        chinese: '顺行 · 逆行',
        pinyin: 'shùn xíng · nì xíng',
        paragraphs: [
          'The rule: a chart born in a YANG year moves forward if male, backward if female; a chart born in a YIN year moves forward if female, backward if male. (Compactly: the direction matches when the year\'s polarity matches the gender\'s yang-ness.) Each decade then steps one ganzhi from the month pillar — forward charts ascend (month 辛丑 → decades 壬寅, 癸卯, 甲辰 …), backward charts descend (辛丑 → 庚子, 己亥, 戊戌 …). Ten years per step, nine decades shown.',
          'The year for this rule is the BAZI year (after 立春), not the calendar year — a January birth counts as the previous year\'s polarity.',
        ],
      },
      {
        heading: '流年 — the year\'s pillar against your chart',
        chinese: '流年',
        pinyin: 'liú nián',
        paragraphs: [
          'Each calendar year brings one ganzhi (2024 = 甲辰), and the 流年 reading folds it onto the natal chart: the year stem\'s 十神 against your day master (module 7), and the year branch\'s every interaction with your four natal branches (module 8) — harmonies, clashes, punishments, harms, 三合 completions, 冲空则实 strikes, and 调候 supply. The app\'s transit timeline shows all of them per year, inside whichever decade you select — markers only, no fortunes.',
        ],
      },
      {
        heading: '神煞 — the named stars',
        chinese: '神煞',
        pinyin: 'shén shà',
        paragraphs: [
          'Beyond the five relations, the tradition maintains tables of "named stars" — lookup markers attached to the day stem and branch groups. The engine carries seven, the verified convention set: 禄 lù (each stem\'s home branch — 甲→寅, 庚→申, 壬→亥 …), 羊刃 yáng rèn (each stem\'s blade branch — 甲→卯, 庚→酉, 壬→子 …), 驿马 yì mǎ (the relay-horse of travel, from the 三合 group of the year or day branch — 申子辰→寅, 寅午戌→申 …), 华盖 huá gài (the canopy of solitude and study — 申子辰→辰, 寅午戌→戌 …), 桃花 táo huā (the peach-blossom of attraction — 申子辰→酉, 寅午戌→卯 …), 天乙贵人 tiān yǐ guì rén (the heavenly noble — each stem\'s pair of protector branches, e.g. 甲→丑未), and 文昌 wén chāng (the literary star — 庚→亥, 壬→寅 …).',
          'These are vocabulary for named patterns — the "travel star," the "study canopy" — and like everything else here, they name structure, not destiny. Honest note: the tables are implemented and tested in the engine, but not yet surfaced in the app\'s chart view — they arrive in a coming release.',
        ],
      },
      {
        heading: 'the rebirth slot',
        chinese: '重生',
        pinyin: 'chóng shēng',
        paragraphs: [
          'The app carries one field no traditional chart has: the date you died to self and were reborn in Christ (John 3:3). It splits the 大运 timeline into two regimes. Before that date, the chart binds — the old nature runs its course. After it, the chart describes but no longer rules: the same weather falls, but it falls on a new creation (2 Cor 5:17). The timeline keeps its structure; its authority ends at the cross.',
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'the frame',
    pinyin: 'shàn rén bù wéi mìng suǒ fù',
    subtitle: '善人不为命所缚 — the good are not bound by fate',
    intro: [
      'Everything in the first nine modules is a language for reading a map. The frame is the sentence that holds the map still: 善人不为命所缚 — "the good are not bound by fate." It is the counter-line to every determinism, Chinese or otherwise. The one who walks with the Shepherd (Psalm 23) is not charted by the stars.',
      'This center exists because the language is worth learning and the frame is worth holding. The language: a two-thousand-year-old vocabulary for reading time, temperament, and pattern. The frame: Christ is the way; the chart is only the weather.',
    ],
    sections: [
      {
        heading: 'creation-first: what the chart actually is',
        paragraphs: [
          'A chart describes the temperament God gave — a nature created GOOD (Gen 1:31). Like all created things, that nature is distorted by the fall: strengths bent, gifts misaimed, the map torn. The chart reads the torn map of a good original. It does not invent the distortion; it describes the terrain.',
          'Rebirth does not discard the created nature — it kills its distortions and restores its direction. The strengths remain strengths, now aimed; the wounds remain visible, now bound. This is why the chart is not an enemy to be burned but a map to be read soberly — and why the rebirth slot splits the timeline into binding and describing.',
        ],
      },
      {
        heading: 'general and special revelation',
        paragraphs: [
          'The heavens declare the glory of God (Ps 19:1) — general revelation: given to everyone, readable by anyone, and INCOMPLETE. A birth chart sits on this shelf. It may describe patterns; it cannot save, command, or condemn. Special revelation — Scripture, and finally Christ himself — is the only voice with that authority.',
          'When the two seem to disagree, the higher word wins. A chart is a telescope for the created order; it is not a substitute for the Creator\'s speech. Study it with full rigor, and hold it in its place.',
        ],
      },
      {
        heading: 'the Ricci fence',
        paragraphs: [
          'Matteo Ricci, the Jesuit scholar of Ming China, drew the boundary this way: 气 qì — the breath-like medium the classics speak of — is a CREATED substance, part of the world God made. It is not God, not an emanation of God, and nothing to be worshipped. We hold the same fence. The five phases and the 气 they describe are creatures doing what creatures do. Reading them is reading creation — never praying to it. The fence is what lets us study the system with total rigor and zero worship.',
        ],
      },
      {
        heading: 'weather, not sentences — the three refusals',
        paragraphs: [
          'This project refuses three things, and the refusals are the product. First, NO certainty-verdicts: never a computed claim about health, death, or money — the tradition\'s worst habit, and the one this app cannot perform by construction. Second, NO oracle stance: the tool informs, the user decides — the app computes maps and reads markers; it never tells a person what to do. Third, NO idol: even the map itself must not be worshipped — see the clause below.',
          'Weather, not sentences. The chart can tell you the season; it cannot tell you who you are becoming.',
        ],
      },
      {
        heading: 'the anti-idol clause',
        paragraphs: [
          '2 Kings 18:4 — Hezekiah "broke in pieces the bronze serpent that Moses had made, for until those days the people of Israel had made offerings to it." The serpent had healed them once, at God\'s command. It was never meant to be adored. The people turned the medicine into a god, and the good king smashed it.',
          'Charts are like the serpent: useful in their place, fatal on the altar. Read the map. Follow the Lion. (Rev 5:5)',
        ],
      },
      {
        heading: 'the commons',
        paragraphs: [
          'This is a learning center, not a temple: free, open-source, nonprofit. The engine is public under MIT — anyone can rerun every computation. The research side holds data in three tiers — derived features (tier 0), birth data under an explicit covenant (tier 1: opt-in, hashed, deletable, never minors), and outcome surveys (tier 2). Nulls are published with the same ceremony as hits: a negative result is still a result, and it is what keeps the commons honest.',
          'Preregistered questions, public analyses, reproducible fixtures. If the system has real signal, the commons should find it; if it does not, the commons should say so plainly. Either way the verdict is never the machine\'s — and the good are not bound by fate.',
        ],
      },
    ],
  },
];
