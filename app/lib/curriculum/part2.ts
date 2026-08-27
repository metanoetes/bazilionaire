import type { CurriculumModule } from './types';
import { NAYIN_LEXICON } from '../nayin';

/** Module 5's 纳音 table, rendered from the shared lexicon (lib/nayin.ts) so
 *  the curriculum and the chart grid can never disagree about a tone name. */
const NAYIN_ROWS: Array<[string, string]> = NAYIN_LEXICON.map((e) => [
  `${e.name} ${e.english}`,
  e.pairs.join(' '),
]);

/** Modules 4–6: the system — branches, the cycle, the four pillars. */
export const SYSTEM: CurriculumModule[] = [
  {
    id: 4,
    slug: 'dizhi',
    title: '地支',
    pinyin: 'dì zhī',
    subtitle: 'twelve earthly branches — the hidden layer',
    intro: [
      'The twelve branches — 子丑寅卯辰巳午未申酉戌亥 — are the working layer of the chart. Each one is a bundle of jobs: it marks a two-hour period of the day (the 时辰), a month of the solar year, a direction, a season, and — as a mnemonic — a zodiac animal. And each branch hides one to three stems inside it, the 藏干 hidden stems, which is why the branch layer is called "hidden."',
      'The branches are read two ways at once: as the branch itself (its phase and polarity) and as the stems it hides. This is the difference between the visible and the concealed — what a moment shows, and what it carries underneath.',
    ],
    sections: [
      {
        heading: 'the twelve branches in full',
        table: {
          head: ['branch', 'phase · polarity · animal · season · hour · hidden stems 藏干'],
          rows: [
            ['子 zǐ', '水 · yang · rat · winter · 23:00–00:59 · hides 癸'],
            ['丑 chǒu', '土 · yin · ox · winter\'s turning · 01:00–02:59 · hides 己 癸 辛'],
            ['寅 yín', '木 · yang · tiger · spring begins · 03:00–04:59 · hides 甲 丙 戊'],
            ['卯 mǎo', '木 · yin · rabbit · spring in leaf · 05:00–06:59 · hides 乙'],
            ['辰 chén', '土 · yang · dragon · wet earth · 07:00–08:59 · hides 戊 乙 癸'],
            ['巳 sì', '火 · yin · snake · fire coiled · 09:00–10:59 · hides 丙 庚 戊'],
            ['午 wǔ', '火 · yang · horse · noon · 11:00–12:59 · hides 丁 己'],
            ['未 wèi', '土 · yin · goat · late summer · 13:00–14:59 · hides 己 丁 乙'],
            ['申 shēn', '金 · yang · monkey · autumn forms · 15:00–16:59 · hides 庚 壬 戊'],
            ['酉 yǒu', '金 · yin · rooster · pure metal · 17:00–18:59 · hides 辛'],
            ['戌 xū', '土 · yang · dog · dry mountain · 19:00–20:59 · hides 戊 辛 丁'],
            ['亥 hài', '水 · yin · pig · deep water · 21:00–22:59 · hides 壬 甲'],
          ],
        },
        paragraphs: [
          'Read the table as four seasons folded across twelve seats: 寅卯辰 spring (wood, then earth storing wood), 巳午未 summer (fire, then earth storing fire), 申酉戌 autumn (metal, then earth storing metal), 亥子丑 winter (water, then earth storing water). The four 土 branches — 辰戌丑未 — are the season\'s storehouses: each one vaults the phase that just finished.',
        ],
      },
      {
        heading: 'hidden stems — the storehouse doctrine',
        chinese: '藏干',
        pinyin: 'cáng gān',
        paragraphs: [
          'Why do branches hide stems? Because a season is not a single thing — it is the arrival, the height, and the departure of its phase. The tradition names the three seats: 主气 zhǔ qì the presiding stem (the season\'s own phase), 中气 zhōng qì the middle stem (what is arriving or leaving), and 余气 yú qì the remnant stem (what the season just finished). 寅, the first month of spring, hides 甲 (wood — presiding), 丙 (fire — arriving), 戊 (earth — the ground everything stands on): three layers in one branch.',
          'Most branches hide fewer: the pure four (子卯午酉) hide only one stem each — they sit at the season\'s exact center, where nothing else is present. The storehouse four (辰戌丑未) hide three, and the four in-between (寅申巳亥) hide three as well, with their main stem leading. The app shows the hidden stems of every pillar in the chart grid\'s 藏干 layer, each tagged with its 十神 (module 7).',
        ],
        terms: [
          { term: '主气', pinyin: 'zhǔ qì', gloss: 'presiding stem — the season\'s own phase' },
          { term: '中气', pinyin: 'zhōng qì', gloss: 'middle stem — what is arriving or departing' },
          { term: '余气', pinyin: 'yú qì', gloss: 'remnant stem — what the season just finished' },
        ],
      },
      {
        heading: 'the twelve hours — 时辰',
        chinese: '时辰',
        pinyin: 'shí chén',
        paragraphs: [
          'The day divides into twelve two-hour periods, and each has a branch. 子时 begins at 23:00 — the day starts at night, at the moment the new thing is first conceived, not at dawn. The hour branch of a birth is the fourth pillar of the chart, and its hidden stems matter as much as the branch itself. (A traditional complication, 晚子时 "late 子 hour," treats the last hour before midnight as belonging to the next day — the app\'s 起运 computation follows the lunar_python convention of counting 23:xx as the day\'s final 时辰.)',
        ],
      },
      {
        heading: 'the zodiac animals',
        paragraphs: [
          'The twelve animals — rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig — are mnemonics for the branches, a folk memory system for a calendar. That is all they are. The animal is a label on the branch, not a personality test: a "dragon" year tells you the year\'s branch was 辰, nothing more. Anyone who tells you what a person is like "because they are a rabbit" has confused the mnemonic with the math.',
        ],
      },
    ],
  },
  {
    id: 5,
    slug: 'liushi-jiazi',
    title: '六十甲子',
    pinyin: 'liùshí jiǎzǐ',
    subtitle: 'the sexagenary cycle — the clock of the chart',
    intro: [
      'Stems and branches turn together like two gears: ten teeth and twelve teeth. They pair only same-parity — yang stem with yang branch, yin with yin — so the full cycle is 60 pairs, from 甲子 to 癸亥, and then it repeats. (10 × 12 would be 120, but parity halves it to 60 — the least common multiple of the two gears, divided by the parity lock.)',
      'This 60-step clock runs everywhere in the system. Years ride it: 1984 was 甲子, 2024 is 甲辰, 2044 will be 甲子 again. Days ride it independently: every date since the calendar\'s epoch has a day pillar, computed by a pure count — no astronomy needed, nothing to believe. Hours and months ride a variant, keyed off the day and year pillars by the 五鼠遁 and 五虎遁 rules (module 6).',
    ],
    sections: [
      {
        heading: 'how the cycle turns',
        paragraphs: [
          'The gears mesh like this: the stem advances one step, the branch advances one step — 甲子, 乙丑, 丙寅, 丁卯 … 癸酉, then the stems exhaust and restart: 甲戌, 乙亥, 丙子 … and after 60 steps, 甲子 returns. Because both gears always advance together, same-parity pairs are the only ones that ever occur: you will never see 甲丑 or 乙子. When someone hands you a "ganzhi" that breaks parity, it is not a real ganzhi.',
          'The 60 pairs are also the skeleton of the 纳音 nayin (below) and of the 旬 xún — the six ten-day weeks the tradition divides the cycle into, each with two void branches (空亡, used in module 8\'s 冲空则实).',
        ],
      },
      {
        heading: '纳音 — the thirty element-tones',
        chinese: '纳音',
        pinyin: 'nà yīn',
        paragraphs: [
          'Each ganzhi pair carries a poetic phase-name, two pairs sharing one name — 30 names across the 60 pairs. They are the tradition\'s most lyrical layer: 海中金 "metal in the sea," 炉中火 "fire in the furnace," 大林木 "timber of the great forest," 天上火 "fire in the heavens." Each name reads the pair\'s phase as situated somewhere — in the sea, the mountain, the street — a flavor, not a fortune. The app prints the nayin of all four pillars under the chart grid.',
        ],
        table: {
          head: ['nayin name', 'the pairs it covers'],
          rows: NAYIN_ROWS,
        },
      },
      {
        heading: 'the day pillar is public math',
        paragraphs: [
          'The day pillar needs no astronomical table and no doctrine: it is the Julian day number of the birth date, taken mod 60, anchored at one known point — 2000-01-01 was 戊午 (index 54). Anyone with a calculator can verify every day pillar in this app by hand. This is the core of the project\'s promise: "computed, not generated." The day pillar is the anchor the rest of the chart is built around, and it is checkable down to the arithmetic.',
        ],
      },
    ],
  },
  {
    id: 6,
    slug: 'sizhu',
    title: '四柱',
    pinyin: 'sì zhù',
    subtitle: 'four pillars — how a chart is actually computed',
    intro: [
      'A 八字 bā zì chart is eight characters arranged as four pillars — year, month, day, hour — each pillar a stem over a branch. Four pillars, three different clocks: the year pillar turns at 立春 (the solar beginning of spring, around February 4 — not January 1); the month pillar turns at the 12 节 solar terms; the day pillar is a pure count; the hour pillar is the 时辰 of birth, with two schools for the clock. Everything else in the system — 十神, 藏干, 大运, 流年 — hangs off these eight characters.',
      'Because the boundaries are astronomical (the exact moment the sun crosses each degree), the app computes them with planetary-series math (VSOP87D), and it is honest about the edge cases: a birth within a minute of a boundary gets a warning instead of a silent guess.',
    ],
    sections: [
      {
        heading: 'the year pillar — 立春, not January 1',
        chinese: '年柱',
        pinyin: 'nián zhù',
        paragraphs: [
          'The bazi year begins at 立春 lì chūn, "spring establishes" — the instant the sun\'s apparent longitude crosses 315°, around February 4 each year. A child born on February 3 belongs to the PREVIOUS bazi year; a child born on February 5 belongs to the new one; a child born within minutes of the exact instant gets the app\'s explicit warning — the pillar may split across schools. This is the most famous trap in 八字: January and early-February births are one bazi year older than their calendar year.',
          'The year pillar\'s stem is the year\'s ganzhi stem (2024 = 甲辰, so the year stem is 甲), and the year pillar sets the month pillar\'s stems through 五虎遁 (below).',
        ],
        terms: [
          { term: '立春', pinyin: 'lì chūn', gloss: 'spring establishes — the year pillar\'s true New Year (~Feb 4, exact instant varies)' },
        ],
      },
      {
        heading: 'the month pillar — the twelve 节',
        chinese: '月柱',
        pinyin: 'yuè zhù',
        paragraphs: [
          'The solar year divides into 24 节气 terms, and 12 of them — the 节 — turn the month pillar. The month branch is the branch of whichever 节 the birth falls after, and the month stem is derived from the year stem by the 五虎遁 rule: the 寅 month (立春 through 惊蛰) carries the stem that follows the year\'s rule — 甲 and 己 years start it at 丙, 乙 and 庚 at 戊, 丙 and 辛 at 庚, 丁 and 壬 at 壬, 戊 and 癸 at 甲. The old mnemonic: 甲己之年丙作首, 乙庚之岁戊为头, 丙辛必定寻庚起, 丁壬壬位顺行流, 戊癸何方发, 甲寅之上好追求.',
          'Then each following month advances one stem: 寅月 = 丙寅 means 卯月 = 丁卯, 辰月 = 戊辰, and so on through the cycle.',
        ],
        table: {
          head: ['节 (approximate date)', 'month branch it opens'],
          rows: [
            ['立春 ~Feb 4', '寅'],
            ['惊蛰 ~Mar 6', '卯'],
            ['清明 ~Apr 5', '辰'],
            ['立夏 ~May 6', '巳'],
            ['芒种 ~Jun 6', '午'],
            ['小暑 ~Jul 7', '未'],
            ['立秋 ~Aug 8', '申'],
            ['白露 ~Sep 8', '酉'],
            ['寒露 ~Oct 8', '戌'],
            ['立冬 ~Nov 7', '亥'],
            ['大雪 ~Dec 7', '子'],
            ['小寒 ~Jan 6', '丑'],
          ],
        },
        terms: [
          { term: '五虎遁', pinyin: 'wǔ hǔ dùn', gloss: 'the year-stem rule that sets the 寅 month\'s stem' },
          { term: '节气', pinyin: 'jié qì', gloss: 'the 24 solar terms; the 12 节 turn the month pillar' },
        ],
      },
      {
        heading: 'the day pillar — a pure count',
        chinese: '日柱',
        pinyin: 'rì zhù',
        paragraphs: [
          'The day pillar is the Julian day number of the birth date modulo 60, anchored at 2000-01-01 = 戊午. No astronomy, no table, no school — pure arithmetic, verifiable by hand (module 5). The day stem of this pillar is the 日主 day master: the lens of the whole reading.',
        ],
      },
      {
        heading: 'the hour pillar — two schools of the clock',
        chinese: '时柱',
        pinyin: 'shí zhù',
        paragraphs: [
          'The hour branch is the 时辰 of birth (module 4\'s table), and the hour stem comes from the day stem by the 五鼠遁 rule: 甲 and 己 days start the 子 hour at 甲, 乙 and 庚 at 丙, 丙 and 辛 at 戊, 丁 and 壬 at 庚, 戊 and 癸 at 壬. Mnemonic: 甲己还加甲, 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何方发, 壬子是真途. Each later 时辰 advances one stem.',
          'The controversy is the clock itself. The 时钟 school reads the local clock time. The 真太阳时 school corrects it twice: for longitude (the sun is not overhead at 12:00 when you are 6° off the timezone\'s meridian) and for the equation of time (the earth\'s orbit makes solar noon drift up to ~16 minutes around mean noon). The app computes both honestly and shows which school it used — the choice is yours, and the school is named. If no longitude is given, the app falls back to clock school rather than pretend precision.',
        ],
        terms: [
          { term: '五鼠遁', pinyin: 'wǔ shǔ dùn', gloss: 'the day-stem rule that sets the 子 hour\'s stem' },
          { term: '真太阳时', pinyin: 'zhēn tài yáng shí', gloss: 'true solar time — clock time corrected for longitude and the equation of time' },
          { term: '时钟', pinyin: 'shí zhōng', gloss: 'the plain clock school — local standard time as read' },
        ],
      },
      {
        heading: 'a worked example — 2000-01-01, 12:00, Beijing',
        paragraphs: [
          'Born at noon on January 1, 2000. Year: the date is before 立春, so the bazi year is 1999 = 己卯. Month: January 6\'s 小寒 has not happened yet, so the month branch is still 子 from the previous December\'s 大雪 — and the year stem 己 sets the 寅 month at 丙寅 (甲己之年丙作首), so the 子 month is ten seats back around the stem ring: 丙子. Day: JDN 2451545, the anchor itself — 戊午. Hour: noon is 午时; the day stem 戊 sets the 子 hour at 壬子, so the 午 hour (six steps later) is 戊午. The chart: 己卯 · 丙子 · 戊午 · 戊午. Every one of those steps is public arithmetic — type the same numbers into the app and it must agree.',
        ],
      },
    ],
  },
];
