import type { CurriculumModule } from './types';

/** Modules 14-15: the moving layer, and the frame that holds everything. */
export const TRANSITS_AND_FRAME: CurriculumModule[] = [
  {
    id: 14,
    slug: 'dayun-liunian',
    title: '大运流年',
    pinyin: 'dà yùn liú nián',
    subtitle: 'decades and years — the moving layer',
    intro: [
      'The natal chart is fixed forever — it is the map drawn at birth. But the sky keeps moving, and the tradition layers two moving clocks over the fixed chart: 大运 dà yùn, the decade pillars, and 流年 liú nián, the annual pillars. The natal chart is the terrain; the decades are the seasons; the years are the weather.',
      'Modules 9-11 gave you the strength/pattern/用神 method; this module tells you what to actually watch for as the decades and years move — a 大运 or 流年 pillar that supplies your 用神, or attacks it, or completes a 三合 group, is the tradition\'s primary timing signal.',
    ],
    sections: [
      {
        heading: '起运 — when the decades begin',
        chinese: '起运',
        pinyin: 'qǐ yùn',
        paragraphs: [
          'The decade sequence does not start at birth — it starts when the chart has "traveled" from birth to the next governing 节 (or back to the previous one, for backward charts). The count is the sect-1 convention: 3 days = 1 year, 1 day = 4 months, 1 时辰 (two hours) = 10 days.',
          'Worked example: born 2024-01-03 at noon, a forward chart. The next 节 is 小寒 on January 6, roughly 2.7 days away — 2 days 6 时辰. 2 days = 8 months; 6 时辰 = 60 days = 2 months; total 0 years 10 months 20 days. The first decade therefore starts within the birth year, at 虚岁 1. A birth farther from its 节 counts more years — the distance from birth to the turn of the season IS the length of childhood before the decades open.',
          "One convention note: the tradition counts ages in 虚岁 xū suì — one at birth, two at the first new year. The app's decade headers use this convention, matching the oracle it is pinned against.",
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
        terms: [
          { term: '顺行', pinyin: 'shùn xíng', gloss: 'forward — the decades ascend the sexagenary cycle from the month pillar' },
          { term: '逆行', pinyin: 'nì xíng', gloss: 'backward — the decades descend the sexagenary cycle from the month pillar' },
        ],
      },
      {
        heading: '流年 — the year\'s pillar against your chart',
        chinese: '流年',
        pinyin: 'liú nián',
        paragraphs: [
          'Each calendar year brings one ganzhi (2024 = 甲辰), and the 流年 reading folds it onto the natal chart: the year stem\'s 十神 against your day master (module 7), and the year branch\'s every interaction with your four natal branches (module 8) — harmonies, clashes, punishments, harms, 三合 completions, 冲空则实 strikes, and 调候 supply. The app\'s transit timeline shows all of them per year, inside whichever decade you select — markers only, no fortunes.',
          '岁运并临 suì yùn bìng lín — "the year star and the luck cycle arrive together" — names the special case where the 流年 pillar is IDENTICAL to the current 大运 pillar. The tradition reads this as the strongest activation the timeline produces: whatever that pillar\'s 十神 and branch relations carry, this doubling intensifies it — a decade\'s theme and a single year\'s theme, perfectly aligned, land together rather than in sequence.',
        ],
        terms: [
          { term: '岁运并临', pinyin: 'suì yùn bìng lín', gloss: 'year and decade arriving together — the strongest single-year activation' },
        ],
      },
      {
        heading: '神煞 in the moving layer',
        chinese: '神煞',
        pinyin: 'shén shà',
        paragraphs: [
          'Module 12 taught the seven named stars the engine computes in depth. In the transit context specifically: a 流年 or 大运 branch landing on your natal 驿马 (relay-horse) is the classical marker for travel or relocation that period; landing on your 桃花 marks heightened social/romantic visibility; landing on your 天乙贵人 marks a period the tradition reads as unusually favorable for outside help arriving. Honest note carried over from module 12: implemented and tested in the engine, not yet surfaced in the app\'s chart view — apply these tables by hand against the pillars the app shows you.',
        ],
      },
      {
        heading: 'the rebirth slot',
        chinese: '重生',
        pinyin: 'chóng shēng',
        paragraphs: [
          'The app carries one field no traditional chart has: the date you died to self and were reborn in Christ (John 3:3). It marks the 大运 timeline at that point. The same weather still falls after it — the decades keep their structure — but it falls on a new creation (2 Cor 5:17). The chart describes; its authority ends at the cross.',
        ],
      },
    ],
  },
  {
    id: 15,
    slug: 'the-frame',
    title: 'the frame',
    pinyin: 'shàn rén bù wéi mìng suǒ fù',
    subtitle: '善人不为命所缚 — the good are not bound by fate',
    intro: [
      'Everything in the first fourteen modules is a language for reading a map — vocabulary (1-8), the technical machinery a real reader needs (9-13), and the moving layer that times it all (14). The frame is the sentence that holds the map still: 善人不为命所缚 — "the good are not bound by fate." It is the counter-line to every determinism, Chinese or otherwise. The one who walks with the Shepherd (Psalm 23) is not charted by the stars.',
      'This module is also where the cosmology lives: what kind of world makes a chart readable at all (one coherent creation, patterned at every scale), what 气 and the five phases actually are (created substances, never spirits), and what the 60-cycle does and does not claim (a clock, not a cause). This center exists because the language is worth learning in full — not a simplified folk version, but the actual technical tradition, taught honestly about where it is settled and where schools disagree — and the frame is worth holding just as firmly. The language: a two-thousand-year-old vocabulary for reading time, temperament, and pattern. The frame: Christ is the way; the chart is only the weather.',
    ],
    sections: [
      {
        heading: 'fractal monism via the Logos',
        paragraphs: [
          'In him all things hold together (Col 1:17). We read the world as one coherent creation whose pattern repeats at every scale — the same shapes in a season, a life, a year. The 60-cycle, the five phases, the four pillars: they are attempts to describe that repetition, which is why the same 五行 grammar can describe a month, a temperament, and a decade without changing its terms.',
          'This is monism of the PATTERN, never of the person — the chart is not the self, and the cosmos is not God. The pattern is Christ\'s; it is not Christ. Hold that one distinction and the whole system stays a description of creation rather than a rival to its Creator.',
        ],
      },
      {
        heading: 'creation-first: what the chart actually is',
        paragraphs: [
          'A chart describes the temperament God gave — a nature created GOOD (Gen 1:31). Like all created things, that nature is distorted by the fall: strengths bent, gifts misaimed, the map torn. The chart reads the torn map of a good original. It does not invent the distortion; it describes the terrain.',
          'Rebirth does not discard the created nature — it kills its distortions and restores its direction. The strengths remain strengths, now aimed; the wounds remain visible, now bound. This is why the chart is not an enemy to be burned but a map to be read soberly — and why the app carries a rebirth slot: the timeline is marked at that date, and the same weather afterward falls on a new creation.',
        ],
      },
      {
        heading: 'general and special revelation',
        paragraphs: [
          'The heavens declare the glory of God (Ps 19:1) — general revelation: given to everyone, readable by anyone, and INCOMPLETE. A birth chart sits on this shelf. It may describe patterns; it cannot save, command, or condemn. Special revelation — Scripture, and finally Christ himself — is the only voice with that authority.',
          "When the two seem to disagree, the higher word wins. A chart is a telescope for the created order; it is not a substitute for the Creator's speech. Study it with full rigor, and hold it in its place — the deeper you go into modules 9-13's technical machinery, the more this discipline matters, not less: real skill is more persuasive than folk vocabulary, and persuasive tools need the firmest boundaries.",
        ],
      },
      {
        heading: 'the Ricci fence',
        paragraphs: [
          'Matteo Ricci, the Jesuit scholar of Ming China, drew the boundary this way: 气 qì — the breath-like medium the classics speak of — is a CREATED substance, part of the world God made. It is not God, not an emanation of God, and nothing to be worshipped. We hold the same fence. The five phases and the 气 they describe are creatures doing what creatures do. Reading them is reading creation — never praying to it. The fence is what lets us study the system with total rigor and zero worship.',
        ],
      },
      {
        heading: 'a clock, not a cause',
        paragraphs: [
          'The 60-cycle and the solar terms are CLOCKS: they name positions in time, the way a calendar names a date. A clock does not cause the hour; it reports it. Likewise the chart reports the time-shaped context of a birth — it never claims to be the cause of a life. Anyone who tells you a pillar MADE your fate has mistaken the thermometer for the weather.',
          'This is also the quiet answer to the commonest objection — "how could the month of my birth do anything to me?" On this reading it does not have to. The claim is not that 立春 exerts a force on a newborn; it is that time has shape, and the calendar names it.',
        ],
      },
      {
        heading: 'weather, not sentences — the three refusals',
        paragraphs: [
          'This project refuses three things, and the refusals are the product. First, NO certainty-verdicts: never a computed claim about health, death, or money — the tradition\'s worst habit, and the one this app cannot perform by construction. Second, NO oracle stance: the tool informs, the user decides — the app computes maps and reads markers; it never tells a person what to do. Third, NO idol: even the map itself must not be worshipped — see the clause below.',
          'Weather, not sentences. The chart can tell you the season; it cannot tell you who you are becoming. This holds exactly as much at module 13\'s 合婚 depth as at module 1\'s first distinction between yin and yang — more technical skill is not more authority over another person\'s life.',
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
          'This is a learning center, not a temple: free, open-source, nonprofit. The engine is public under MIT — anyone can rerun every computation. The research side is a commons: entering your birth data is consent — every chart computed becomes a research record (inputs + everything derived), held under covenant and deletable. Nulls are published with the same ceremony as hits: a negative result is still a result, and it is what keeps the commons honest.',
          'Preregistered questions, public analyses, reproducible fixtures. If the system has real signal, the commons should find it; if it does not, the commons should say so plainly. Either way the verdict is never the machine\'s — and the good are not bound by fate.',
        ],
      },
    ],
  },
];
