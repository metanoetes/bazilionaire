/**
 * 十神 (shí shén, "Ten Gods") — the day master's relations to the other stems.
 * Rule: element relation + yin/yang polarity decides the god.
 *   same element:       比肩 (same polarity) / 劫财 (opposite)
 *   I generate:         食神 (same) / 伤官 (opposite)
 *   generates me:       偏印 (same) / 正印 (opposite)
 *   I control:          偏财 (same) / 正财 (opposite)
 *   controls me:        七杀 (same) / 正官 (opposite)
 * Pinned against lunar_python via fixtures/expected.json (doctrine.shishenGan/Zhi).
 */
import { STEMS } from './sexagenary.js';

const ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 木木火火土土金金水水
const YANG = (i: number) => i % 2 === 0;

export function shishenOf(dayMasterIdx: number, otherIdx: number): string {
  const dm = ELEMENT[dayMasterIdx];
  const ot = ELEMENT[otherIdx];
  const samePolarity = YANG(dayMasterIdx) === YANG(otherIdx);
  const rel = (ot - dm + 5) % 5;
  switch (rel) {
    case 0: return samePolarity ? '比肩' : '劫财';
    case 1: return samePolarity ? '食神' : '伤官'; // I generate
    case 4: return samePolarity ? '偏印' : '正印'; // generates me
    case 2: return samePolarity ? '偏财' : '正财'; // I control
    case 3: return samePolarity ? '七杀' : '正官'; // controls me
    default: throw new Error('unreachable');
  }
}

export function shishenForStem(dayMaster: string, other: string): string {
  return shishenOf(STEMS.indexOf(dayMaster as (typeof STEMS)[number]), STEMS.indexOf(other as (typeof STEMS)[number]));
}
