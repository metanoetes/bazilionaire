/**
 * 纳音 nà yīn — the thirty element-tones, in lexicon form.
 *
 * The engine's `NAYIN` table (engine/src/tables.ts) maps each of the 60
 * ganzhi to one of these 30 names; this module is the *reading* side of that
 * table — pinyin, the short English name, and the image the name depicts.
 *
 * Source of truth for three consumers, so the names can never drift apart:
 *   1. lib/glossary.ts — registers all 30, which makes every nayin name
 *      clickable through ClickableCJK/GlossPopover wherever it appears.
 *   2. lib/curriculum/part2.ts — module 5's nayin table renders from here.
 *   3. components/ChartGrid.tsx — the 纳音 row of the 命盘 grid.
 *
 * Pinyin verified with pypinyin (TONE style) rather than hand-typed.
 *
 * EDITORIAL RULE: `image` describes what the *name* depicts — nothing about
 * a person's life, luck, money, or outcome. The site's own line for this
 * layer (curriculum module 5) is "a flavor, not a fortune"; these strings
 * have to hold that line, because they are the poetic register the reading
 * page will draw on and the tradition's imagery is doing the work, not us.
 */

export interface NayinEntry {
  /** 3-character nayin name, e.g. 海中金. */
  name: string;
  pinyin: string;
  /** The tone's 五行 phase, named in words — the UI does not color-code phases. */
  element: '木 wood' | '火 fire' | '土 earth' | '金 metal' | '水 water';
  /** Short translation, as printed in the curriculum table. */
  english: string;
  /** What the name depicts — image only, never an outcome. */
  image: string;
  /** The two ganzhi pairs that share this tone. */
  pairs: [string, string];
}

/** In sexagenary order: entry i covers ganzhi indices 2i and 2i+1. */
export const NAYIN_LEXICON: NayinEntry[] = [
  {
    name: '海中金', pinyin: 'hǎi zhōng jīn', element: '金 metal',
    english: 'metal in the sea',
    image: 'ore still under water — metal that exists but has not been raised into the air',
    pairs: ['甲子', '乙丑'],
  },
  {
    name: '炉中火', pinyin: 'lú zhōng huǒ', element: '火 fire',
    english: 'fire in the furnace',
    image: 'flame with walls around it — heat that is contained and put to work',
    pairs: ['丙寅', '丁卯'],
  },
  {
    name: '大林木', pinyin: 'dà lín mù', element: '木 wood',
    english: 'timber of the forest',
    image: 'wood among wood — growth measured against a whole canopy',
    pairs: ['戊辰', '己巳'],
  },
  {
    name: '路旁土', pinyin: 'lù páng tǔ', element: '土 earth',
    english: 'earth by the roadside',
    image: 'ground everyone passes and nobody tends',
    pairs: ['庚午', '辛未'],
  },
  {
    name: '剑锋金', pinyin: 'jiàn fēng jīn', element: '金 metal',
    english: 'sword-blade metal',
    image: 'metal ground to an edge — the most finished and least forgiving form',
    pairs: ['壬申', '癸酉'],
  },
  {
    name: '山头火', pinyin: 'shān tóu huǒ', element: '火 fire',
    english: 'fire on the mountain',
    image: 'a blaze seen from far off, exposed to all weather',
    pairs: ['甲戌', '乙亥'],
  },
  {
    name: '涧下水', pinyin: 'jiàn xià shuǐ', element: '水 water',
    english: 'water in the ravine',
    image: 'water down in the cut of the rock, moving where the channel takes it',
    pairs: ['丙子', '丁丑'],
  },
  {
    name: '城头土', pinyin: 'chéng tóu tǔ', element: '土 earth',
    english: 'earth on the rampart',
    image: 'soil piled into a wall — earth given the shape of a defense',
    pairs: ['戊寅', '己卯'],
  },
  {
    name: '白蜡金', pinyin: 'bái là jīn', element: '金 metal',
    english: 'wax-white metal',
    image: 'metal pale and soft-looking, new out of the mold',
    pairs: ['庚辰', '辛巳'],
  },
  {
    name: '杨柳木', pinyin: 'yáng liǔ mù', element: '木 wood',
    english: 'willow wood',
    image: 'wood that bends and hangs — pliancy rather than frame',
    pairs: ['壬午', '癸未'],
  },
  {
    name: '泉中水', pinyin: 'quán zhōng shuǐ', element: '水 water',
    english: 'spring water',
    image: 'water at its source, small and continuous',
    pairs: ['甲申', '乙酉'],
  },
  {
    name: '屋上土', pinyin: 'wū shàng tǔ', element: '土 earth',
    english: 'earth on the roof',
    image: 'earth carried up and laid where it shelters, far from its own bed',
    pairs: ['丙戌', '丁亥'],
  },
  {
    name: '霹雳火', pinyin: 'pī lì huǒ', element: '火 fire',
    english: 'thunderbolt fire',
    image: 'fire that arrives all at once and does not stay',
    pairs: ['戊子', '己丑'],
  },
  {
    name: '松柏木', pinyin: 'sōng bǎi mù', element: '木 wood',
    english: 'pine and cypress',
    image: 'wood that keeps its needles through winter',
    pairs: ['庚寅', '辛卯'],
  },
  {
    name: '长流水', pinyin: 'cháng liú shuǐ', element: '水 water',
    english: 'long flowing water',
    image: 'a current that reaches far because it never stops',
    pairs: ['壬辰', '癸巳'],
  },
  {
    name: '沙中金', pinyin: 'shā zhōng jīn', element: '金 metal',
    english: 'metal in the sand',
    image: 'metal scattered fine — present everywhere, gathered only by patience',
    pairs: ['甲午', '乙未'],
  },
  {
    name: '山下火', pinyin: 'shān xià huǒ', element: '火 fire',
    english: 'fire below the mountain',
    image: 'a fire at the foot of something larger, sheltered and low',
    pairs: ['丙申', '丁酉'],
  },
  {
    name: '平地木', pinyin: 'píng dì mù', element: '木 wood',
    english: 'wood on level ground',
    image: 'a tree with no slope to lean on, standing by its own trunk',
    pairs: ['戊戌', '己亥'],
  },
  {
    name: '壁上土', pinyin: 'bì shàng tǔ', element: '土 earth',
    english: 'earth on the wall',
    image: 'earth pressed flat into plaster — soil made a surface',
    pairs: ['庚子', '辛丑'],
  },
  {
    name: '金箔金', pinyin: 'jīn bó jīn', element: '金 metal',
    english: 'gold-foil metal',
    image: 'metal beaten thin enough to cover another thing',
    pairs: ['壬寅', '癸卯'],
  },
  {
    name: '覆灯火', pinyin: 'fù dēng huǒ', element: '火 fire',
    english: 'lamp-light fire',
    image: 'a covered lamp — small flame kept from the wind, lighting one room',
    pairs: ['甲辰', '乙巳'],
  },
  {
    name: '天河水', pinyin: 'tiān hé shuǐ', element: '水 water',
    english: 'river of heaven',
    image: 'the Milky Way read as water — rain\u2019s source, far overhead',
    pairs: ['丙午', '丁未'],
  },
  {
    name: '大驿土', pinyin: 'dà yì tǔ', element: '土 earth',
    english: 'earth of the great highway',
    image: 'the packed ground of a post road — earth defined by traffic',
    pairs: ['戊申', '己酉'],
  },
  {
    name: '钗钏金', pinyin: 'chāi chuàn jīn', element: '金 metal',
    english: 'hairpin metal',
    image: 'metal worked into ornament — worn, not wielded',
    pairs: ['庚戌', '辛亥'],
  },
  {
    name: '桑柘木', pinyin: 'sāng zhè mù', element: '木 wood',
    english: 'mulberry wood',
    image: 'the tree that feeds silkworms — wood valued for what it hosts',
    pairs: ['壬子', '癸丑'],
  },
  {
    name: '大溪水', pinyin: 'dà xī shuǐ', element: '水 water',
    english: 'water of the great stream',
    image: 'a broad, shallow run — water spread across its bed',
    pairs: ['甲寅', '乙卯'],
  },
  {
    name: '沙中土', pinyin: 'shā zhōng tǔ', element: '土 earth',
    english: 'earth in the sand',
    image: 'earth that will not hold a shape or hold water',
    pairs: ['丙辰', '丁巳'],
  },
  {
    name: '天上火', pinyin: 'tiān shàng huǒ', element: '火 fire',
    english: 'fire in the heavens',
    image: 'the sun itself — fire nothing shelters and nothing feeds',
    pairs: ['戊午', '己未'],
  },
  {
    name: '石榴木', pinyin: 'shí liú mù', element: '木 wood',
    english: 'pomegranate wood',
    image: 'small hard wood that carries heavy fruit',
    pairs: ['庚申', '辛酉'],
  },
  {
    name: '大海水', pinyin: 'dà hǎi shuǐ', element: '水 water',
    english: 'water of the great sea',
    image: 'all water arrived at once — depth without a bank',
    pairs: ['壬戌', '癸亥'],
  },
];

const BY_NAME: Record<string, NayinEntry> = {};
for (const e of NAYIN_LEXICON) BY_NAME[e.name] = e;

/** Lookup by nayin name (the engine's `chart.nayin[i]` values). */
export function nayinFor(name: string): NayinEntry | undefined {
  return BY_NAME[name];
}
