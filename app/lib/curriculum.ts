/**
 * The 10-module curriculum — the literacy spine of the learning center.
 * Lexicon format throughout: Chinese term + pinyin + English gloss.
 * Every module teaches STRUCTURE. Nothing here predicts anyone's life.
 */

export interface TermEntry {
  term: string;
  pinyin: string;
  gloss: string;
}

export interface CurriculumModule {
  id: number;
  title: string;
  pinyin: string;
  subtitle: string;
  intro: string;
  terms: TermEntry[];
  notes: string[];
}

export const CURRICULUM: CurriculumModule[] = [
  {
    id: 1,
    title: '阴阳',
    pinyin: 'yīn yáng',
    subtitle: 'polarity — the rhythm of the chart',
    intro:
      'Every stem and branch carries a polarity: yang (阳) is outward, active, day; yin (阴) is inward, receptive, night. Polarity marks rhythm and texture — it is never good-versus-evil. The chart\'s first lesson: structure, not morality.',
    terms: [
      { term: '阳', pinyin: 'yáng', gloss: 'yang — sun-side of the hill; outward, initiating, warm' },
      { term: '阴', pinyin: 'yīn', gloss: 'yin — shaded side; inward, receiving, still' },
    ],
    notes: [
      'The ten stems alternate 阳/阴 in order: 甲阳 乙阴 丙阳 丁阴 … 癸阴. Same for the twelve branches.',
      '阴阳 is a grammar of movement, like expansion and contraction — not a ranking of people.',
    ],
  },
  {
    id: 2,
    title: '五行',
    pinyin: 'wǔ xíng',
    subtitle: 'five phases — verbs, not substances',
    intro:
      'The five phases are not static elements: they are processes. Wood grows, fire rises, earth steadies, metal condenses, water descends. Two cycles connect them — 生 (generation) and 克 (restraint). 克 is not destruction; it is the riverbank that gives the river its channel.',
    terms: [
      { term: '木', pinyin: 'mù', gloss: 'wood — growth, direction, the spring push' },
      { term: '火', pinyin: 'huǒ', gloss: 'fire — light, expression, summer at height' },
      { term: '土', pinyin: 'tǔ', gloss: 'earth — center, stability, the turning of seasons' },
      { term: '金', pinyin: 'jīn', gloss: 'metal — consolidation, discernment, autumn harvest' },
      { term: '水', pinyin: 'shuǐ', gloss: 'water — depth, flow, winter storage' },
      { term: '生', pinyin: 'shēng', gloss: 'generates — 木生火, 火生土, 土生金, 金生水, 水生木' },
      { term: '克', pinyin: 'kè', gloss: 'restrains — 木克土, 土克水, 水克火, 火克金, 金克木' },
    ],
    notes: [
      'Every character in your chart belongs to one phase. The day master\'s phase is the chart\'s center of gravity.',
    ],
  },
  {
    id: 3,
    title: '天干',
    pinyin: 'tiān gān',
    subtitle: 'ten heavenly stems — the visible layer',
    intro:
      'Ten stems — 甲乙丙丁戊己庚辛壬癸 — pair with the phases: two stems per phase, one yang and one yin. The day stem of your chart is the 日主 (day master): the traditional "you" of the chart. Treat it as a lens for reading temperament — not a verdict on anyone.',
    terms: [
      { term: '甲', pinyin: 'jiǎ', gloss: 'yang wood — the sprouting tree, armor, beginning' },
      { term: '乙', pinyin: 'yǐ', gloss: 'yin wood — the winding shoot, supple growth' },
      { term: '丙', pinyin: 'bǐng', gloss: 'yang fire — the blazing sun, brilliance made visible' },
      { term: '丁', pinyin: 'dīng', gloss: 'yin fire — the candle, steady focused heat' },
      { term: '戊', pinyin: 'wù', gloss: 'yang earth — the mountain, massive ground' },
      { term: '己', pinyin: 'jǐ', gloss: 'yin earth — the field, soil that grows what is planted' },
      { term: '庚', pinyin: 'gēng', gloss: 'yang metal — the forged blade, harvest and renewal' },
      { term: '辛', pinyin: 'xīn', gloss: 'yin metal — the jewel, refined and precise' },
      { term: '壬', pinyin: 'rén', gloss: 'yang water — the great river, carried and vast' },
      { term: '癸', pinyin: 'guǐ', gloss: 'yin water — rain and dew, gentle nourishment' },
    ],
    notes: ['日主 rì zhǔ — day master: the day stem, read against all other stems in the chart.'],
  },
  {
    id: 4,
    title: '地支',
    pinyin: 'dì zhī',
    subtitle: 'twelve earthly branches — the hidden layer',
    intro:
      'Twelve branches mark the hours, months, and the zodiac animals. Each also hides one to three 藏干 (hidden stems) — a second, deeper layer of the chart. The month branch is the strongest of the four: it names the season the chart is born into.',
    terms: [
      { term: '子', pinyin: 'zǐ', gloss: 'rat · midnight · yang water' },
      { term: '丑', pinyin: 'chǒu', gloss: 'ox · the turning of winter · yin earth' },
      { term: '寅', pinyin: 'yín', gloss: 'tiger · dawn, spring begins · yang wood' },
      { term: '卯', pinyin: 'mǎo', gloss: 'rabbit · spring in leaf · yin wood' },
      { term: '辰', pinyin: 'chén', gloss: 'dragon · wet earth vault · yang earth' },
      { term: '巳', pinyin: 'sì', gloss: 'snake · fire coiled · yin fire' },
      { term: '午', pinyin: 'wǔ', gloss: 'horse · noon · yang fire' },
      { term: '未', pinyin: 'wèi', gloss: 'goat · late summer · yin earth' },
      { term: '申', pinyin: 'shēn', gloss: 'monkey · autumn metal forms · yang metal' },
      { term: '酉', pinyin: 'yǒu', gloss: 'rooster · pure metal, the evening bell · yin metal' },
      { term: '戌', pinyin: 'xū', gloss: 'dog · dry mountain earth · yang earth' },
      { term: '亥', pinyin: 'hài', gloss: 'pig · deep water · yin water' },
    ],
    notes: [
      '藏干 cáng gān — hidden stems: the stems stored inside each branch (e.g. 寅 hides 甲, 丙, 戊).',
      'The hour branch divides the day into twelve 时辰 (two-hour periods) starting at 23:00 (子时).',
    ],
  },
  {
    id: 5,
    title: '六十甲子',
    pinyin: 'liùshí jiǎzǐ',
    subtitle: 'the sexagenary cycle — the clock of the chart',
    intro:
      'Stems and branches pair only same-parity (yang-with-yang, yin-with-yin): 10 × 12 / 2 = 60 combinations, from 甲子 to 癸亥, then the cycle repeats. Years, days, and hours all ride this clock — it is how 2024 becomes 甲辰 and your birthday becomes a day pillar.',
    terms: [
      { term: '甲子', pinyin: 'jiǎzǐ', gloss: 'the first of the 60 — the cycle\'s beginning' },
      { term: '纳音', pinyin: 'nà yīn', gloss: 'nayin — a poetic element-tone assigned to each pair (e.g. 海中金 "metal in the sea")' },
    ],
    notes: [
      'The day pillar is a pure calendar computation (Julian day count) — no astronomy needed, fully verifiable.',
      'The 60-year cycle gives the year pillar; the 60-day cycle gives the day pillar. They run independently.',
    ],
  },
  {
    id: 6,
    title: '四柱',
    pinyin: 'sì zhù',
    subtitle: 'four pillars — how a chart is actually computed',
    intro:
      'A 八字 (eight characters) chart is four pillars of two characters each: year, month, day, hour. The year pillar turns at 立春 (not January 1); the month pillar turns at the 12 节 solar terms; the day pillar is a pure count; the hour pillar has two schools — clock time and 真太阳时 (true solar time).',
    terms: [
      { term: '年柱', pinyin: 'nián zhù', gloss: 'year pillar — the year\'s ganzhi, turning at 立春' },
      { term: '月柱', pinyin: 'yuè zhù', gloss: 'month pillar — the 节 boundaries of the solar year' },
      { term: '日柱', pinyin: 'rì zhù', gloss: 'day pillar — Julian-day count, exact and checkable' },
      { term: '时柱', pinyin: 'shí zhù', gloss: 'hour pillar — clock school or solar-time school' },
      { term: '节气', pinyin: 'jié qì', gloss: 'the 24 solar terms; the 12 "节" ones turn the month pillar' },
      { term: '立春', pinyin: 'lì chūn', gloss: 'spring begins — the year pillar\'s true New Year (~Feb 4)' },
      { term: '真太阳时', pinyin: 'zhēn tài yáng shí', gloss: 'true solar time — clock time corrected by longitude and the equation of time' },
    ],
    notes: [
      'Honesty features: if a birth lands within ±1 minute of a boundary, the app says so — pillars may split across schools.',
      'Both hour schools are shown with the school named. No school is silently chosen for you.',
      'Every pillar in this app is computed in your browser from astronomy-grade math — "computed, not generated."',
    ],
  },
  {
    id: 7,
    title: '十神',
    pinyin: 'shí shén',
    subtitle: 'ten gods — the day master\'s relations',
    intro:
      'The 十神 are not deities. They are the ten ways another stem can RELATE to the day master: same phase (比劫), the day master generates (食伤), the day master restrains (财), restrains the day master (官), generates the day master (印). The 正/偏 split is pure polarity. They name relationships — nothing more.',
    terms: [
      { term: '比肩', pinyin: 'bǐ jiān', gloss: 'peer — same phase, same polarity' },
      { term: '劫财', pinyin: 'jié cái', gloss: 'rival — same phase, opposite polarity' },
      { term: '食神', pinyin: 'shí shén', gloss: 'output — day master generates, same polarity' },
      { term: '伤官', pinyin: 'shāng guān', gloss: 'talent — day master generates, opposite polarity' },
      { term: '偏财', pinyin: 'piān cái', gloss: 'wealth — day master restrains, same polarity' },
      { term: '正财', pinyin: 'zhèng cái', gloss: 'wealth — day master restrains, opposite polarity' },
      { term: '七杀', pinyin: 'qī shā', gloss: 'pressure — restrains the day master, same polarity' },
      { term: '正官', pinyin: 'zhèng guān', gloss: 'discipline — restrains the day master, opposite polarity' },
      { term: '偏印', pinyin: 'piān yìn', gloss: 'resource — generates the day master, same polarity' },
      { term: '正印', pinyin: 'zhèng yìn', gloss: 'resource — generates the day master, opposite polarity' },
    ],
    notes: [
      'In 合婚 readings, 财 reads as the traditional "wife star" for a male chart and 官 the "husband star" for a female chart — a naming convention, not a sentence.',
      'The chart grid shows each pillar\'s 十神 against the day master, so the relation is always visible.',
    ],
  },
  {
    id: 8,
    title: '合冲刑害',
    pinyin: 'hé chōng xíng hài',
    subtitle: 'interactions — how branches talk to each other',
    intro:
      'Branches relate in fixed geometries: 六合 (six harmony pairs), 三合 (three-branch groups), 半合 (adjacent legs), 冲 (opposition), 刑 (punishment — including the four 自刑 self-punishments), 害 (harm). A pair can carry more than one relation — 巳申 is both 六合 and 刑. These are STRUCTURAL facts, not fortunes.',
    terms: [
      { term: '六合', pinyin: 'liù hé', gloss: 'six harmony — 子丑, 寅亥, 卯戌, 辰酉, 巳申, 午未' },
      { term: '三合', pinyin: 'sān hé', gloss: 'three harmony — 申子辰(水), 亥卯未(木), 寅午戌(火), 巳酉丑(金); a transit branch can complete a group' },
      { term: '半合', pinyin: 'bàn hé', gloss: 'half harmony — the adjacent legs of a 三合 group (申子, 子辰 …)' },
      { term: '冲', pinyin: 'chōng', gloss: 'clash — the 180° opposites (子午, 丑未 …)' },
      { term: '刑', pinyin: 'xíng', gloss: 'punishment — 无礼之刑 子卯; 恃势之刑 寅巳申; 无恩之刑 丑戌未; 自刑 辰午酉亥' },
      { term: '害', pinyin: 'hài', gloss: 'harm — 丑午, 子未, 寅巳, 卯辰, 申亥, 酉戌' },
      { term: '冲空则实', pinyin: 'chōng kōng zé shí', gloss: 'a clash striking a voided branch "fills" it' },
      { term: '调候', pinyin: 'tiáo hòu', gloss: 'climate need — winter charts look for fire, summer charts for water' },
    ],
    notes: [
      'The transit timeline shows markers, not verdicts: a 冲 is a fact of geometry, and its meaning in a life is a reading — never computed.',
      'Some pairs carry several relations at once (巳申 = 六合 + 刑; 寅申 = 冲 + 刑). The app lists them all.',
    ],
  },
  {
    id: 9,
    title: '大运流年',
    pinyin: 'dà yùn liú nián',
    subtitle: 'decades and years — the moving layer',
    intro:
      'The natal chart is fixed; 大运 (decade pillars) and 流年 (annual pillars) move over it. 起运 — when the decades start — is computed from the time between birth and the governing 节: 3 days counts as 1 year, 1 day as 4 months, one 时辰 as 10 days. Each decade steps one ganzhi from the month pillar; each year brings its own pillar to read against the chart.',
    terms: [
      { term: '起运', pinyin: 'qǐ yùn', gloss: 'the start of the decade sequence, computed from the birth-to-节 interval' },
      { term: '大运', pinyin: 'dà yùn', gloss: 'decade pillar — ten years, stepping forward (顺行) or backward (逆行) by the chart\'s rule' },
      { term: '流年', pinyin: 'liú nián', gloss: 'the year\'s pillar read against the natal branches' },
      { term: '神煞', pinyin: 'shén shā', gloss: 'named star-markers (禄, 羊刃, 驿马, 华盖, 桃花, 天乙贵人, 文昌 …) — tables for further study' },
    ],
    notes: [
      'Direction rule: yang-year male and yin-year female step forward; the other two step backward.',
      'The moving layer describes climates and seasons — it never decides outcomes. Weather, not sentences.',
    ],
  },
  {
    id: 10,
    title: 'the frame',
    pinyin: '善人不为命所缚',
    subtitle: 'the good are not bound by fate',
    intro:
      'Everything in the first nine modules is a language for reading a map. The map describes the God-given temperament: created good, distorted by the fall, and — the heart of this center — recreated in Christ. A chart cannot sentence anyone. The one who follows Christ is not bound by it.',
    terms: [
      { term: '善人', pinyin: 'shàn rén', gloss: 'the good person — the one walking with the Shepherd (Ps 23)' },
      { term: '不为命所缚', pinyin: 'bù wéi mìng suǒ fù', gloss: 'is not bound by fate — the chart may describe, it never rules' },
      { term: '重生', pinyin: 'chóng shēng', gloss: 'rebirth — 死 to self, new creation in Christ (Jn 3:3; 2 Cor 5:17)' },
    ],
    notes: [
      'The rebirth slot in the app splits your 大运 timeline into two regimes: before it, the chart binds; after it, the chart describes but no longer rules.',
      'Tool informs, user decides. This center computes maps, never sentences — no health, death, or money verdicts, ever.',
      'The anti-idol clause: even a good thing becomes a snare when worshipped. 2 Kings 18:4 — Hezekiah broke the bronze serpent Moses had made, because the people had made it an idol. Charts are for reading; only Christ is for following.',
      'Read the map. Follow the Lion. (Rev 5:5)',
    ],
  },
];
