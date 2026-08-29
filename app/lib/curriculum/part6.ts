import type { CurriculumModule } from './types';

/**
 * Module 13: 合婚 in depth. The app's pair-reading panel (HehunPanel)
 * computes exactly two structural layers — day-master relations, and the
 * cross-chart branch matrix — and stops there by design (see the theology
 * page's "no verdict about two people" clause). This module teaches the
 * full method those two layers are drawn from, plus the human third layer
 * the engine deliberately never computes, so a reader understands both what
 * the app shows and what it is refusing to show.
 */
export const HEHUN_DEEP: CurriculumModule[] = [
  {
    id: 13,
    slug: 'hehun-shendeep',
    title: '合婚深论',
    pinyin: 'hé hūn shēn lùn',
    subtitle: 'pair reading, in depth',
    intro: [
      "合婚 hé hūn, literally \"matching the marriage,\" is the tradition's method for reading two charts against each other. The app's 合婚 panel computes precisely two layers and refuses a third — this module explains why, and teaches the full method so a trained reader understands both layers deeply AND recognizes exactly where the engine's authority ends.",
      'Three layers, by design: (1) day-master relations — how each person\'s day stem reads as a 十神 to the other. (2) the branch matrix — every 合冲刑害 relation (module 8) between the two charts\' eight branches. (3) the human layer — age, culture, family role, the actual two people in the room. The engine computes layers 1 and 2 exactly. Layer 3 belongs to the reader, always, by construction — see the app\'s own comment on this: "the engine computes structure only — it never produces a verdict about two people."',
    ],
    sections: [
      {
        heading: 'layer 1 — the marital-star signature',
        chinese: '财官相配',
        pinyin: 'cái guān xiāng pèi',
        paragraphs: [
          "The tradition's strongest single structural signature: read each person's day stem as the other's 十神 (module 7's table, applied cross-chart). For a male chart, if the OTHER person's day stem reads as his 正财 or 偏财 (module 7's wealth 十神 — the \"wife star\" naming convention), that is read as a marital signature. For a female chart, if the other's day stem reads as her 正官 or 七杀 (the \"husband star\"), same signature, opposite direction.",
          '男财女官 nán cái nǚ guān — "man\'s wealth, woman\'s officer" — names the strongest possible version: BOTH directions hold at once (his day stem is her marital star AND her day stem is his). The app\'s HehunPanel computes this exact check and flags it explicitly when both directions fire. Read it as the tradition\'s highest-confidence structural marker for a marriage-shaped pairing — not proof of love, and not required for a real relationship (module 8\'s discipline: structure is computed, meaning is read), but the pattern the tradition watches for first.',
          "One direction firing without the other is common and not a bad sign by itself — read it as an asymmetric structural relation (one person's stem organizes something in the other, without the reverse), worth naming honestly rather than forcing into the mutual pattern.",
        ],
        terms: [
          { term: '男财女官', pinyin: 'nán cái nǚ guān', gloss: "man's wealth, woman's officer — the mutual marital-star signature" },
        ],
      },
      {
        heading: 'layer 2a — combines: where two charts bond',
        chinese: '六合 · 三合',
        pinyin: 'liù hé · sān hé',
        paragraphs: [
          "Every 六合 and 三合/半合 relation (module 8) between the two charts' branches reads as a bonding point — a place where the structures naturally fit. The classical emphasis: combines on the SELF axes (each person's own day and hour branches, the pillars closest to their adult, chosen life) read as the two people themselves bonding; combines on the FAR axes (year and month, the pillars closest to family origin) read more as the families' or contexts' expectations aligning, which is a different — sometimes weaker, sometimes just differently-located — kind of fit.",
          "This distinction (self-axis vs far-axis combines) is a reading convention layered on top of the app's raw branch-matrix output — the engine reports every relation without weighting by pillar position; the weighting is the human layer's job.",
        ],
      },
      {
        heading: 'layer 2b — clashes: where two charts rub',
        chinese: '冲 · 刑 · 害',
        pinyin: 'chōng · xíng · hài',
        paragraphs: [
          'Every 冲/刑/害 relation between the two charts\' branches reads as friction — not automatically bad (module 8\'s "storm is neither good nor bad until you know what was standing in the field" applies with full force here), but a place demanding real negotiation rather than easy agreement. The same self-axis/far-axis convention from layer 2a applies in reverse: a clash on the SELF axes (day/hour) reads as friction between the two people\'s own temperaments; a clash on the far axes reads more as differing family/contextual expectations — a very different kind of friction to navigate.',
          "A chart's own internal 刑/害 (present without the partner) is not a compatibility signal at all — only CROSS-chart relations (one person's branch against the other's) belong in this layer. Reading a person's own natal 刑 as though it says something about the pairing is a common and avoidable error.",
        ],
      },
      {
        heading: '冲空则实 across two charts — the clash that heals',
        chinese: '冲空则实',
        pinyin: 'chōng kōng zé shí',
        paragraphs: [
          "Module 8 taught 冲空则实 within one chart's own 大运/流年. The same principle applies cross-chart in 合婚: when one person's branch clashes with a branch that sits in the OTHER person's 空亡 (void) seats, the tradition reads this as the clash filling that void — sometimes read as a notably positive signature, the clash that completes rather than merely disrupts. The app's HehunPanel computes this exact check in both directions and marks it explicitly.",
          'Read it as one of the more counter-intuitive findings in the whole method: a 冲 relation, normally friction, landing on a partner\'s voided seat inverts its usual reading. This is exactly the kind of structural nuance that rewards understanding the mechanism (module 8\'s 空亡 derivation) rather than memorizing "冲 = bad."',
        ],
      },
      {
        heading: '调候 completion across two charts',
        chinese: '调候互补',
        pinyin: 'tiáo hòu hù bǔ',
        paragraphs: [
          "Module 8's climate need (a winter chart wants fire, a summer chart wants water) can be read cross-chart: does one person's branches supply the OTHER's climate need? The app's HehunPanel computes this in both directions. A pairing where each supplies the other's missing season is a favorite pattern in practitioner readings — read as complementary temperament, one warming what the other lacks.",
          'As with every layer here: this is a structural observation, not a requirement. Two people who do NOT supply each other\'s 调候 are not thereby mismatched — they simply do not carry this particular signature, and the reading should say so plainly rather than manufacture a finding.',
        ],
      },
      {
        heading: 'layer 3 — the human layer, and why the engine stops before it',
        paragraphs: [
          "Two computed layers, and then the method stops. The third layer — age, birth order, family role, culture, the actual history and choices of the two specific people — is real, often decisive, and permanently outside what any chart can compute. This is not a limitation the engine will outgrow; it is the project's central discipline, stated plainly on the app's own pair panel: \"the engine computes structure only — it never produces a verdict about two people. 合婚 maps the terrain of a relationship; the people in it decide the road.\"",
          "A trained reader's actual skill is not memorizing more tables — it is holding layers 1 and 2 as real, useful, structural information, while never mistaking a strong computed signature for permission to tell two people what to do with each other, and never mistaking a weak or absent signature for a verdict against them either. 财官相配 without a single combine is not a doomed pairing; a chart soaked in mutual 六合 with no marital-star signature is not a guaranteed one. The map is real. It is still only a map — read the map, follow Jesus Christ (Rev 5:5), same closing line as everywhere else in this curriculum.",
        ],
      },
    ],
  },
];
