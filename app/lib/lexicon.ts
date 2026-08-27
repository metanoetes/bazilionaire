/** Module 1 of the curriculum — the 22 干支 characters, lexicon format. */
export interface CharInfo {
  char: string;
  pinyin: string;
  element: string;
  polarity: 'yang' | 'yin';
  animal?: string;
  gloss: string;
}

export const STEM_LEXICON: Record<string, CharInfo> = {
  甲: { char: '甲', pinyin: 'jiǎ', element: '木 wood', polarity: 'yang', gloss: 'sprouting tree; the first, armor, beginning' },
  乙: { char: '乙', pinyin: 'yǐ', element: '木 wood', polarity: 'yin', gloss: 'new shoot; supple, winding growth' },
  丙: { char: '丙', pinyin: 'bǐng', element: '火 fire', polarity: 'yang', gloss: 'blazing sun; brilliance made visible' },
  丁: { char: '丁', pinyin: 'dīng', element: '火 fire', polarity: 'yin', gloss: 'candle flame; steady, focused heat' },
  戊: { char: '戊', pinyin: 'wù', element: '土 earth', polarity: 'yang', gloss: 'mountain; massive, defensive ground' },
  己: { char: '己', pinyin: 'jǐ', element: '土 earth', polarity: 'yin', gloss: 'field; soil that grows what is planted' },
  庚: { char: '庚', pinyin: 'gēng', element: '金 metal', polarity: 'yang', gloss: 'forged blade; the seventh, harvest and renewal' },
  辛: { char: '辛', pinyin: 'xīn', element: '金 metal', polarity: 'yin', gloss: 'jewel; metal refined, sharp but precious' },
  壬: { char: '壬', pinyin: 'rén', element: '水 water', polarity: 'yang', gloss: 'great river; carried, vast and moving' },
  癸: { char: '癸', pinyin: 'guǐ', element: '水 water', polarity: 'yin', gloss: 'rain and dew; the gentle water that nourishes' },
};

export const BRANCH_LEXICON: Record<string, CharInfo> = {
  子: { char: '子', pinyin: 'zǐ', element: '水 water', polarity: 'yang', animal: 'rat', gloss: 'seed, midnight, the first hour of a new thing' },
  丑: { char: '丑', pinyin: 'chǒu', element: '土 earth', polarity: 'yin', animal: 'ox', gloss: 'turning point; winter earth holding the new year' },
  寅: { char: '寅', pinyin: 'yín', element: '木 wood', polarity: 'yang', animal: 'tiger', gloss: 'dawn; the first month of spring, movement begins' },
  卯: { char: '卯', pinyin: 'mǎo', element: '木 wood', polarity: 'yin', animal: 'rabbit', gloss: 'opening gate; spring in full leaf, gentleness' },
  辰: { char: '辰', pinyin: 'chén', element: '土 earth', polarity: 'yang', animal: 'dragon', gloss: 'wet earth, the dragon; a vault that stores and releases' },
  巳: { char: '巳', pinyin: 'sì', element: '火 fire', polarity: 'yin', animal: 'snake', gloss: 'serpent; fire coiled, ready to strike or rise' },
  午: { char: '午', pinyin: 'wǔ', element: '火 fire', polarity: 'yang', animal: 'horse', gloss: 'noon; the sun at its height, full speed' },
  未: { char: '未', pinyin: 'wèi', element: '土 earth', polarity: 'yin', animal: 'goat', gloss: 'garden earth; late summer, fruit not yet fallen' },
  申: { char: '申', pinyin: 'shēn', element: '金 metal', polarity: 'yang', animal: 'monkey', gloss: 'metal formed; extension, the reach of autumn' },
  酉: { char: '酉', pinyin: 'yǒu', element: '金 metal', polarity: 'yin', animal: 'rooster', gloss: 'pure metal; harvest sealed, the evening bell' },
  戌: { char: '戌', pinyin: 'xū', element: '土 earth', polarity: 'yang', animal: 'dog', gloss: 'dry mountain earth; a fire-vault, the watchful hour' },
  亥: { char: '亥', pinyin: 'hài', element: '水 water', polarity: 'yin', animal: 'pig', gloss: 'deep water; the end that carries the next beginning' },
};

export function lexiconFor(char: string): CharInfo {
  return STEM_LEXICON[char] ?? BRANCH_LEXICON[char];
}
