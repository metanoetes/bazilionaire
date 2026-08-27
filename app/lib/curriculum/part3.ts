import type { CurriculumModule } from './types';

/** Modules 7-8: reading the chart — ten gods, interactions. */
export const READING: CurriculumModule[] = [
  {
    id: 7,
    slug: 'shishen',
    title: '十神',
    pinyin: 'shí shén',
    subtitle: "ten gods — the day master's ten relations",
    intro: [
      "The 十神 are not gods and not ghosts: they are the ten ways another stem can relate to the day master. Five relations, each in two registers (same polarity / opposite polarity), makes ten. The five relations are just the 五行 cycles from module 2, seen from one seat: the day master's.",
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
          "Run the same table for any other day master and you get the whole system — swap the day master's phase, keep the five verbs, and the ten names follow. The app does exactly this for every pillar of your chart and every hidden stem: the chart grid's 十神 layer tags each character with its relation to the day master.",
        ],
      },
      {
        heading: 'the ten, one by one — vocabulary, not verdicts',
        paragraphs: [
          'The tradition gives each 十神 a temperament vocabulary. Read these as lenses — ways a relationship shows up — never as sentences. A "wealth" in your chart does not promise money; a "pressure" does not threaten harm.',
          '比肩 bǐ jiān — the peer: same phase, same polarity. The equal, the comrade, the one who runs beside you. Strong 比肩 reads as self-reliance; its shadow is stubbornness.',
          '劫财 jié cái — the rival: same phase, opposite polarity. The competitive edge of your own element — the sparring partner. It reads as ambition and risk; its shadow is dispute. In its harshest register 劫财夺财 ("the rival robs the wealth") names the loss of money or reputation through people of your own kind — a partner, a peer, a sibling.',
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
      {
        heading: 'reading two 十神 together — the paired patterns',
        paragraphs: [
          'A single 十神 is a letter; two together, transparent in the chart, are a word. The tradition names a handful of recurring pairs — worth learning now, because module 12 (神煞深论) and every real chart you read will lean on them.',
          '枭神夺食 xiāo shén duó shí — "the owl seizes the food": 偏印 (the same-register resource — inherited doctrine, esoterica, the received code) controlling 食神 (the same-register output — voice, craft, joy, children in the old vocabulary). The nurturing star turned cannibal, named for a mythic owl said to eat its own brood. Reads as a chart where inherited authority quietly starves the person\'s own expression. The classical remedy is 财破印 (a wealth stem controlling the resource stem, breaking the owl\'s grip) — never destroy the resource outright, only its excess.',
          '财破印 cái pò yìn — "wealth breaks the resource": the fix for an over-strong 印 smothering the day master\'s own expression — a 财 stem or branch controls the 印, thinning it back to useful size. Read together with 财生官 (wealth feeding the officer) as a two-step repair: break the excess, then feed the discipline.',
          '伤官见官 shāng guān jiàn guān — "the talent meets the officer": 伤官 (rule-breaking brilliance) and 正官 (rule-keeping discipline) transparent in the same chart is the tradition\'s classic tension — invention against law. Not automatically bad; read the third element mediating them (often 印 or 财) before calling it a conflict.',
          '生官护煞 shēng guān hù shā — "feeding the officer, sheltering the pressure": 财 generating 官 while something (often 印) shelters a 七杀 from over-attacking the day master — a stable-power reading, common in charts that read as capable under real load.',
        ],
      },
    ],
  },
  {
    id: 8,
    slug: 'hechongxinghai',
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
            ['卯戌', "leaf and dry mountain — wood kept warm by the fire-vault"],
            ['辰酉', 'wet earth and pure metal — ore drawn from the wet vault'],
            ['巳申', "coiled fire and formed metal — the forge's two halves"],
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
          "Four three-branch groups, each the three seats of one phase across the year: 申子辰 (water), 亥卯未 (wood), 寅午戌 (fire), 巳酉丑 (metal). Each group is a season's arc — beginning, height, storehouse — so the three branches are phase-pure even though two of them are nominally other elements.",
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
          { term: '空亡', pinyin: 'kōng wáng', gloss: "the two void branches of the day pillar's 旬 — the chart's empty seats" },
          { term: '伏吟', pinyin: 'fú yín', gloss: 'a transit branch identical to a natal branch' },
          { term: '反吟', pinyin: 'fǎn yín', gloss: 'a transit branch opposite a natal branch' },
        ],
      },
      {
        heading: '刑 — the full canonical set',
        chinese: '刑',
        pinyin: 'xíng',
        paragraphs: [
          "Punishment is the system's most misunderstood relation — folk tables often leave out half of it. The full canonical set is eleven pairs in four families:",
          '无礼之刑 wú lǐ zhī xíng — "punishment of the unmannered": 子卯, the single pair of the yang-water / yin-wood axis, across the wheel.',
          '恃势之刑 shì shì zhī xíng — "punishment of the presumptuous": the triangle 寅巳申 — ALL three legs punish, including the 冲 leg 寅申 and the 六合 leg 巳申. Note the multi-relations: 巳申 is BOTH harmony and punishment; 寅申 is BOTH opposition and punishment.',
          '无恩之刑 wú ēn zhī xíng — "punishment of the ungrateful": the triangle 丑戌未 — all three legs punish, including the 冲 leg 丑未.',
          '自刑 zì xíng — "self-punishment": 辰辰, 午午, 酉酉, 亥亥. When a transit branch lands on one of these four and the same branch sits in the natal chart, the year\'s marker reads 刑 — the chart meeting itself in the one place that hurts.',
          'The engine implements exactly this set — it is the set pinned in the project\'s review process, and the transit timeline shows every 刑 leg, never a subset.',
          '一个几何笔记 (worth knowing before you read a folk chart): the two 90°-triangle 刑s are NOT the 120° equilateral of 三合. Confusing them is the single most common folk-table error — a 三刑 triangle carries a 180° 冲 leg (丑未冲 inside 丑戌未; 寅申冲 inside 寅巳申) plus two 90° 刑 legs, while a 三合 group (申子辰, etc.) is evenly spaced at 120° and carries no clash at all. If a table shows a triangle with no 冲 leg, it is describing 三合, not 三刑.',
        ],
      },
      {
        heading: '害 — the six harms',
        chinese: '害',
        pinyin: 'hài',
        paragraphs: [
          "Six pairs: 丑午, 子未, 寅巳, 卯辰, 申亥, 酉戌. Harm is the quiet relation — the pair that shares space without harmonizing or opposing, like two neighbors who keep tripping over each other's fence. Note again the overlaps: 寅巳 is BOTH a punishment leg and a harm pair — the app shows both.",
          "一个推导捷径: 害 is sometimes taught as \"the branch that clashes with your 六合 partner\" — 子's 合 partner is 丑; 丑's 冲 partner is 未; so 子未 is a 害 pair. Run it for any branch and the six 害 pairs fall out without memorizing a table.",
        ],
      },
      {
        heading: '调候 — the climate of the chart',
        chinese: '调候',
        pinyin: 'tiáo hòu',
        paragraphs: [
          'The month branch names the climate: winter months (亥子丑) are cold and look for fire; summer months (巳午未) are hot and look for water. 调候 "adjusting the climate" is the chart\'s elemental need — and the transit timeline marks the years whose branch supplies it (a 巳 or 午 year feeding a winter chart). It is the most concrete, least interpretive relation in the whole system: a season and its fuel. Module 11 (用神) makes 调候 one of the five formal ways to choose a chart\'s favorable god — this module gives you the raw climate-reading; module 11 gives you the decision procedure.',
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
];
