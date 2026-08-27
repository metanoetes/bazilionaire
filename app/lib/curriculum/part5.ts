import type { CurriculumModule } from './types';

/**
 * Module 12: 神煞 in depth. Module 9 (大运流年, in part6.ts) already listed
 * the app's seven computed stars in brief; this module goes deep on each —
 * derivation logic, traditional reading, and how they compound — plus a
 * wider doctrine survey of stars the engine does not yet compute, clearly
 * marked as such.
 */
export const SHENSHA_DEEP: CurriculumModule[] = [
  {
    id: 12,
    slug: 'shensha-shendeep',
    title: '神煞深论',
    pinyin: 'shén shà shēn lùn',
    subtitle: 'the named stars, in depth',
    intro: [
      '神煞 shén shà, "spirits and afflictions," are the oldest layer of the whole system — fossils from the Han-to-Tang star-lore tradition (七政四余, 天人感应), bolted onto the Song dynasty\'s later 十神/格局 machinery rather than derived from it. Each star is a lookup: given a stem or a branch group, a table names another branch as "activated." They are vocabulary for named patterns, not forces with their own causal power — read them the way you would read a nickname, not a law of physics.',
      "The engine computes seven stars, the verified convention set from the project's corpus. This module goes deep on each one, then surveys further doctrine stars the engine does not yet compute — honestly marked, so you know exactly where the app's authority ends and a book's begins.",
    ],
    sections: [
      {
        heading: '禄 — the salary star',
        chinese: '禄',
        pinyin: 'lù',
        table: {
          head: ['day stem', '禄 branch'],
          rows: [
            ['甲', '寅'], ['乙', '卯'], ['丙 / 戊', '巳'], ['丁 / 己', '午'],
            ['庚', '申'], ['辛', '酉'], ['壬', '亥'], ['癸', '子'],
          ],
        },
        paragraphs: [
          '禄 lù is simply the day stem\'s own 建禄 seat (module 10\'s pattern of the same name) — the branch whose 主气 hidden stem IS the day stem\'s own element, in its own polarity. It is the oldest and simplest star: a direct root (module 9\'s 通根), given a name. Reading it: a 禄 branch present anywhere in the chart is a steady, self-sufficient kind of strength — traditionally read as "never without a livelihood," a floor under the day master that does not depend on anyone else\'s stem.',
          '禄 overlapping with a 冲 or 刑 in a transit year is read as a disturbance to that steady floor — worth noting when the year\'s marker lands there (module 14).',
        ],
      },
      {
        heading: '羊刃 — the blade star',
        chinese: '羊刃',
        pinyin: 'yáng rèn',
        table: {
          head: ['day stem', '羊刃 branch'],
          rows: [
            ['甲', '卯'], ['乙', '寅'], ['丙 / 戊', '午'], ['丁 / 己', '巳'],
            ['庚', '酉'], ['辛', '申'], ['壬', '子'], ['癸', '亥'],
          ],
        },
        paragraphs: [
          '羊刃 yáng rèn, "sheep blade," is the yang-polarity day stem\'s peak-strength branch one step past its own 禄 seat — for 甲 (禄 at 寅), the 羊刃 sits at 卯, the day master\'s own element in its yin register, at the season\'s height. (Some schools also assign 刃 seats to yin stems by a parallel rule; the mainstream convention above uses the yang-stem derivation, extended to their paired yin stems as shown.) Read as raw, cutting strength — decisive, sometimes reckless, always needing an outlet or a check.',
          'Classical advice: a 羊刃 wants either a 官杀 to discipline it (a blade needs a sheath — the same logic as module 10\'s 建禄格/羊刃格 note) or a clean outlet through 食伤. Left uncontrolled and unchanneled, the tradition reads 羊刃 as a chart prone to sudden, self-inflicted reversals — the blade that cuts its own hand.',
        ],
      },
      {
        heading: '驿马 — the relay-horse of movement',
        chinese: '驿马',
        pinyin: 'yì mǎ',
        table: {
          head: ['三合 group (of year or day branch)', '驿马 branch'],
          rows: [
            ['寅午戌 (fire group)', '申'],
            ['申子辰 (water group)', '寅'],
            ['巳酉丑 (metal group)', '亥'],
            ['亥卯未 (wood group)', '巳'],
          ],
        },
        paragraphs: [
          '驿马 yì mǎ derives from module 8\'s 三合 groups: for each group, the 驿马 branch is the FIRST seat of the group standing 180° across the wheel (a 冲 relation to the group\'s own third seat) — literally the direction "away" from the group\'s home base. Traditionally read from the year branch (ancestral/early-life travel) or the day branch (self-driven movement): relocation, travel, restlessness, a life that does not stay in one place. A 驿马 branch struck by a transit 冲 (module 8) in a given year is the classical marker for an actual move or major travel that year — again, weather, not a promise.',
        ],
      },
      {
        heading: '华盖 — the canopy of solitude',
        chinese: '华盖',
        pinyin: 'huá gài',
        table: {
          head: ['三合 group', '华盖 branch'],
          rows: [
            ['寅午戌 (fire group)', '戌'],
            ['申子辰 (water group)', '辰'],
            ['巳酉丑 (metal group)', '丑'],
            ['亥卯未 (wood group)', '未'],
          ],
        },
        paragraphs: [
          '华盖 huá gài, "flower canopy," is the same 三合 group\'s own vault seat (module 8\'s 库 storehouse branches — 辰戌丑未) landing exactly on the group\'s own element\'s storage point. Traditionally read as the star of solitude, introspection, and study — a mind drawn inward, often gifted in art, philosophy, or spiritual practice, sometimes at the cost of ordinary social ease. Not a misfortune star; a temperament star, and one this project\'s own theology (module 15) treats gently — contemplative depth is a gift, not a wound, even when it reads as isolating in a culture built for extroversion.',
        ],
      },
      {
        heading: '桃花 — the peach blossom of attraction',
        chinese: '桃花',
        pinyin: 'táo huā',
        table: {
          head: ['三合 group', '桃花 branch'],
          rows: [
            ['寅午戌 (fire group)', '卯'],
            ['申子辰 (water group)', '酉'],
            ['巳酉丑 (metal group)', '午'],
            ['亥卯未 (wood group)', '子'],
          ],
        },
        paragraphs: [
          '桃花 táo huā takes its name from the 三合 group\'s SECOND seat — the height of the season, read as the peak of visible, outward-facing attractiveness. Traditionally the star of charisma, romantic and social magnetism, artistic appeal — and, in its shadow register, scandal, overindulgence, or attraction that outruns judgment (module 7\'s vocabulary of "reading, not sentencing" applies with special force here: a 桃花 star names a temperament, never a verdict about anyone\'s choices).',
          'A note on scope: 桃花 in relation to another PERSON\'s chart (rather than one\'s own) belongs to module 13\'s 合婚 method, not this module — this module only teaches the natal-chart lookup.',
        ],
      },
      {
        heading: '天乙贵人 — the heavenly noble',
        chinese: '天乙贵人',
        pinyin: 'tiān yǐ guì rén',
        table: {
          head: ['day stem', '天乙贵人 branches (both count)'],
          rows: [
            ['甲 / 戊 / 庚', '丑, 未'],
            ['乙 / 己', '子, 申'],
            ['丙 / 丁', '亥, 酉'],
            ['壬 / 癸', '卯, 巳'],
            ['辛', '午, 寅'],
          ],
        },
        paragraphs: [
          '天乙贵人 tiān yǐ guì rén, "the heavenly first noble," is widely regarded as the single most auspicious star in the whole 神煞 system — a day stem\'s pair of protector branches, traditionally read as unexpected help arriving exactly when needed: a mentor, a rescuer, a stroke of favor from someone with no obvious reason to give it. Unlike most stars, it is read from EITHER of its two branches, and having both present is traditionally read as doubly fortunate.',
          'Honest caution: precisely because it is the most flattering star in the table, it is also the most over-claimed in casual practice. Read it as a real doctrinal marker, not as license to promise anyone rescue — this project\'s whole discipline (module 8\'s closing note) is that structure is computed, meaning is read, and 天乙贵人 is structure, not a guarantee.',
        ],
      },
      {
        heading: '文昌 — the literary star',
        chinese: '文昌',
        pinyin: 'wén chāng',
        table: {
          head: ['day stem', '文昌 branch'],
          rows: [
            ['甲', '巳'], ['乙', '午'], ['丙 / 戊', '申'], ['丁 / 己', '酉'],
            ['庚', '亥'], ['辛', '子'], ['壬', '寅'], ['癸', '卯'],
          ],
        },
        paragraphs: [
          '文昌 wén chāng, named for the star-god of literature and examinations in the older Chinese sky-lore, marks scholarly aptitude — traditionally read as a talent for study, writing, and the kind of intelligence that examinations reward. In the imperial-examination era this star carried outsized social weight (a 文昌 branch was read almost as career destiny); in a modern reading it is better held as one temperament marker among several, not a career prophecy.',
        ],
      },
      {
        heading: 'further doctrine — stars the app does not yet compute',
        paragraphs: [
          'Honest boundary: everything above is implemented and tested in the engine, even where the app\'s chart view does not yet surface it in the UI (module 9\'s honesty note). What follows is real, widely-taught doctrine that the engine does NOT compute at all — taught here so you recognize it in other books and readers, clearly marked as outside this app\'s current authority.',
          '天德 tiān dé and 月德 yuè dé ("heavenly virtue" and "monthly virtue") are protective stars derived from the birth month, traditionally read as softening misfortune and attracting quiet, unearned goodwill — a gentler cousin of 天乙贵人. 孤辰 gū chén and 寡宿 guǎ sù ("lonely star" and "widowed lodging") are derived from the 三合 groups similarly to 华盖 above, traditionally read as markers of relational distance or delayed partnership — read with real caution, since a mechanical "you will be alone" reading is exactly the certainty-verdict this project refuses to produce (module 8\'s closing discipline). 红鸾 hóng luán and 天喜 tiān xǐ ("red phoenix" and "heavenly joy") are a paired set read as markers of romance, marriage, and celebration — the wedding-adjacent counterpart to 桃花\'s more general attraction reading.',
          'A pattern worth noticing across all four: none of these change the METHOD. They are lookups, same shape as the seven the engine computes — a stem or branch group in, a marker branch out. If you understand how 禄 and 天乙贵人 derive above, you already understand the shape of every star in this family; only the specific tables differ.',
        ],
      },
    ],
  },
];
