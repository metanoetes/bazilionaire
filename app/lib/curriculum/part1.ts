import type { CurriculumModule } from './types';

/** Modules 1–3: the foundations — polarity, phases, stems. */
export const FOUNDATIONS: CurriculumModule[] = [
  {
    id: 1,
    slug: 'yinyang',
    title: '阴阳',
    pinyin: 'yīn yáng',
    subtitle: 'polarity — the first distinction',
    intro: [
      'Everything in 八字 begins with one cut: the world divides into 阳 yáng and 阴 yīn. The characters themselves draw the picture. 陽 (traditional form) is a hill 阝 with the sun 日 shining on it — the lit side, the exposed slope. 陰 is the same hill under a cloud — the shaded side, the hidden slope. Same hill, two faces. That is the whole doctrine in one image: polarity is not a ranking of things, it is the two faces of one thing.',
      'In the chart, polarity is a grammar of rhythm. Every one of the ten stems and twelve branches is either yang or yin — they alternate, the way day alternates with night. Polarity decides nothing by itself, but it tunes everything else: it splits the 十神 into 正 and 偏 (module 7), it sets the direction of your 大运 (module 14), and it gives each character its texture.',
    ],
    sections: [
      {
        heading: 'the two strokes of the brush',
        chinese: '阳 与 阴',
        pinyin: 'yáng yǔ yīn',
        paragraphs: [
          'Yang is the outward stroke: movement, initiation, expansion, heat, day, the visible. Yin is the inward stroke: rest, reception, contraction, coolness, night, the hidden. Neither is better. A lung does both — one beat out, one beat in. A life does both — seasons of pushing and seasons of waiting. The tradition reads them as complements, not competitors.',
          'Two cautions the tradition itself insists on. First, yin-yang is not the western "good versus evil" — a yin stem is not a dark force, and a yang stem is not a virtue. Second, it is not a gender essentialism: yang and yin appear in every person and every chart in shifting proportions. Anyone who uses polarity to rank people has left the doctrine and started fortune-telling.',
        ],
        terms: [
          { term: '阳', pinyin: 'yáng', gloss: 'yang — the sunlit slope; outward, initiating, warm, visible' },
          { term: '阴', pinyin: 'yīn', gloss: 'yin — the shaded slope; inward, receiving, cool, hidden' },
          { term: '太极', pinyin: 'tài jí', gloss: 'the supreme pole — the undivided pattern from which the two arise' },
        ],
      },
      {
        heading: 'the four degrees',
        chinese: '太阴 少阴 少阳 太阳',
        pinyin: 'tài yīn · shào yīn · shào yáng · tài yáng',
        paragraphs: [
          'The tradition does not stop at two. Each pole splits again: 太阳 tài yáng (great yang, midday), 少阴 shào yīn (young yin, evening), 太阴 tài yīn (great yin, midnight), 少阳 shào yáng (young yang, dawn). These four degrees are the ancestor of the 五行 phases — the day understood as a circle, not a line. In the chart they appear indirectly: the twelve branches are the four degrees folded three times over.',
        ],
        terms: [
          { term: '太阳', pinyin: 'tài yáng', gloss: 'great yang — midday, the pole of full expansion' },
          { term: '少阴', pinyin: 'shào yīn', gloss: 'young yin — evening, expansion beginning to turn inward' },
          { term: '太阴', pinyin: 'tài yīn', gloss: 'great yin — midnight, the pole of full contraction' },
          { term: '少阳', pinyin: 'shào yáng', gloss: 'young yang — dawn, contraction beginning to turn outward' },
        ],
      },
      {
        heading: 'polarity in your chart',
        paragraphs: [
          'In the app, polarity appears on every character card: each stem and branch shows 阳 or 阴. A chart can run all-yang, all-yin, or any mix. The tradition reads the mix as texture — a chart heavy in yang reads as outwardly driven; heavy in yin reads as inwardly drawn. That is a description of style, not a sentence about worth. Count yours, notice the balance, and move on: polarity is the drumbeat, not the song.',
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'wuxing',
    title: '五行',
    pinyin: 'wǔ xíng',
    subtitle: 'five phases — verbs, not substances',
    intro: [
      'The five phases are the engine room of the whole system. The crucial move is in the name: 行 xíng means "to move, to walk." The five are not elements sitting in a periodic table — they are five kinds of movement, five phases in a cycle. 木 wood is not lumber; it is growing. 火 fire is not a campfire; it is rising and giving light. 土 earth is not dirt; it is steadying and transforming. 金 metal is not a sword; it is condensing and cutting. 水 water is not a glass of water; it is descending and storing.',
      'Two cycles connect the five. 生 shēng — the generating cycle — is the order of the seasons: wood feeds fire, fire leaves ash that feeds earth, earth yields ore that is metal, metal condenses dew that is water, water nourishes wood. 克 kè — the restraining cycle — is the order of the check: wood holds soil with its roots, soil channels water with its banks, water cools fire, fire forges metal, metal fells wood.',
    ],
    sections: [
      {
        heading: 'the five, and where each one sits',
        paragraphs: [
          'Each phase owns a season, an hour, and a direction — and those three are one circle read at three scales. That is why spring, dawn, and east name a single position without strain: a year, a day, and a compass are the same shape at different sizes (module 1\'s four degrees are this same circle, cut in four instead of five). Read the correspondences as positions on that circle, never as causes: being born in spring does not make a person wood; it means the wood position was the one the season occupied.',
        ],
        terms: [
          { term: '木', pinyin: 'mù', gloss: 'wood · spring · dawn · east — the beginning: plans before it acts, the way a seed already knows the tree' },
          { term: '火', pinyin: 'huǒ', gloss: 'fire · summer · noon · south — the climax: gives light without keeping any of it, the least storing phase' },
          { term: '土', pinyin: 'tǔ', gloss: 'earth · late summer · the turn between seasons · center — the pivot: the compost that makes one season into the next' },
          { term: '金', pinyin: 'jīn', gloss: 'metal · autumn · evening · west — the harvest: condenses what was scattered, cuts away what does not belong' },
          { term: '水', pinyin: 'shuǐ', gloss: 'water · winter · night · north — the deep: descends to the lowest place and stores what it finds' },
        ],
      },
      {
        heading: 'the generating cycle, link by link',
        chinese: '生',
        pinyin: 'shēng',
        paragraphs: [
          '木生火 — wood feeds fire: every flame is the past season burning. 火生土 — fire leaves earth: ash is the memory of flame. 土生金 — earth yields metal: ore is mined from the mountain. 金生水 — metal condenses water: a cold blade gathers dew. 水生木 — water nourishes wood: the seed drinks the dark. Each link is a parent and a child; the cycle has no top and no bottom, only a current.',
        ],
      },
      {
        heading: 'the restraining cycle, link by link',
        chinese: '克',
        pinyin: 'kè',
        paragraphs: [
          '克 is the most misread word in the system. It is restraint, not destruction: the riverbank, not the flood. 木克土 — roots hold the soil against the rain. 土克水 — the bank gives the river its channel; without the bank, no river. 水克火 — water sets the fire\'s boundary. 火克金 — the forge softens the blade so it can be shaped. 金克木 — the axe fells the tree so the wood can serve. Every one of these is care with teeth. The tradition even has names for the broken forms: 乘 chéng, restraint over-applied, and 侮 wǔ, the weaker turning on the stronger — the pathological cases that show the healthy cycle by contrast.',
        ],
        terms: [
          { term: '生', pinyin: 'shēng', gloss: 'generates — 木生火, 火生土, 土生金, 金生水, 水生木' },
          { term: '克', pinyin: 'kè', gloss: 'restrains — 木克土, 土克水, 水克火, 火克金, 金克木' },
          { term: '乘', pinyin: 'chéng', gloss: 'over-restraint — restraint applied beyond its measure' },
          { term: '侮', pinyin: 'wǔ', gloss: 'rebellion — the weaker phase turning on the stronger' },
        ],
      },
      {
        heading: 'the phases in your chart',
        paragraphs: [
          'Every character in your chart belongs to one phase. The day stem\'s phase is the chart\'s center of gravity — the 日主 day master. The month branch names the season you were born into, and the season sets the climate: a winter month (亥子丑) looks for fire the way a cold room looks for a stove; a summer month (巳午未) looks for water. That need is called 调候 tiáo hòu (module 8), and the transit timeline marks the years that supply it.',
          'The classical doctrine of seasonal strength — 旺相休囚死 — says a phase is at its fullest in its own season and weakest in the season that restrains it: wood flourishes in spring, rests in winter, is confined by autumn metal. Read it as weather vocabulary: it describes the season\'s climate for each phase, not a verdict on a person.',
        ],
        terms: [
          { term: '旺', pinyin: 'wàng', gloss: 'flourishing — the phase in its own season' },
          { term: '相', pinyin: 'xiàng', gloss: 'supported — the phase generated by the season' },
          { term: '休', pinyin: 'xiū', gloss: 'resting — the phase that generates the season' },
          { term: '囚', pinyin: 'qiú', gloss: 'confined — the phase that restrains the season' },
          { term: '死', pinyin: 'sǐ', gloss: 'dormant — the phase the season restrains' },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'tiangan',
    title: '天干',
    pinyin: 'tiān gān',
    subtitle: 'ten heavenly stems — the visible layer',
    intro: [
      'The chart is built from two alphabets. The first is the ten stems — 甲乙丙丁戊己庚辛壬癸 — the "heavenly" layer. 干 gān means trunk; the stems are the tree\'s main line, and the twelve branches (module 4) hang off them. Together they form the 干支 gān zhī system, older than the Shang dynasty oracle bones that first record it.',
      'Each stem is a bundle of three facts: a phase (two stems per phase), a polarity (yang then yin, alternating), and an image (the traditional picture of how that phase-pair behaves). Ten stems, five pairs — each pair is one phase in its yang and yin register.',
    ],
    sections: [
      {
        heading: 'the ten stems in full',
        table: {
          head: ['stem', 'phase · polarity · image'],
          rows: [
            ['甲 jiǎ', '木 wood · yang · the sprouting tree — armor, the first, beginnings that break ground'],
            ['乙 yǐ', '木 wood · yin · the winding shoot — supple growth that finds the gap'],
            ['丙 bǐng', '火 fire · yang · the blazing sun — brilliance made visible, warmth for everyone'],
            ['丁 dīng', '火 fire · yin · the candle flame — steady, focused heat that lights one room well'],
            ['戊 wù', '土 earth · yang · the mountain — massive, defensive ground that does not move'],
            ['己 jǐ', '土 earth · yin · the field — soil that grows exactly what is planted in it'],
            ['庚 gēng', '金 metal · yang · the forged blade — harvest and renewal, the edge that clears'],
            ['辛 xīn', '金 metal · yin · the jewel — metal refined, sharp but precious'],
            ['壬 rén', '水 water · yang · the great river — carried, vast, moving toward the sea'],
            ['癸 guǐ', '水 water · yin · rain and dew — the gentle water that nourishes without flooding'],
          ],
        },
        paragraphs: [
          'Notice the pattern: each yang stem is the phase at full display; each yin stem is the same phase turned inward. The sun and the candle are both fire; the mountain and the field are both earth. The distinction is register, not rank.',
        ],
      },
      {
        heading: 'stem combinations — 五合',
        chinese: '天干五合',
        pinyin: 'tiān gān wǔ hé',
        paragraphs: [
          'Beyond the ten, the stems pair across the two polarities in five classical combinations: 甲己合 (wood-earth), 乙庚合 (wood-metal), 丙辛合 (fire-metal), 丁壬合 (fire-water), 戊癸合 (earth-water). The tradition reads each as a fusion that transforms into a phase — 甲己合化土, 乙庚合化金, 丙辛合化水, 丁壬合化木, 戊癸合化火. This is classic doctrine: an attraction across the cycle, a yang stem meeting its yin counterpart five places away.',
          'The engine computes this pair-and-transform table exactly, and uses it for one specific job: checking whether the DAY MASTER itself combines with an adjacent stem (year-month or day-hour position — the classical 合绊 tether condition) as the first gate of module 10\'s 化气格 (transformed-qi pattern). It is a candidacy check, not an assertion — module 10 shows the evidence (which pair, which element, how much of the rest of the chart supports the transformation) and lets you weigh it, because 化气格 is the single most disputed pattern classification in the whole system.',
        ],
      },
      {
        heading: 'the day master',
        chinese: '日主',
        pinyin: 'rì zhǔ',
        paragraphs: [
          'One stem in the chart carries the reading: the day stem, called the 日主 day master. It is the traditional "you" — the lens every other character is read through (module 7 builds the whole 十神 system on this). Read it as a lens, not a label: the day master names the register your chart speaks in, not your final identity. In the app, the day pillar is ringed in the chart grid — you can always find the lens.',
        ],
      },
    ],
  },
];
