import { FOUNDATIONS } from './curriculum/part1';
import { SYSTEM } from './curriculum/part2';
import { READING } from './curriculum/part3';
import { STRENGTH_AND_PATTERN } from './curriculum/part4';
import { SHENSHA_DEEP } from './curriculum/part5';
import { HEHUN_DEEP } from './curriculum/part6';
import { TRANSITS_AND_FRAME } from './curriculum/part7';
import type { CurriculumModule, CurriculumSection, Table2, TermEntry } from './curriculum/types';

export type { CurriculumModule, CurriculumSection, Table2, TermEntry };

/**
 * The full 15-module curriculum, in teaching order.
 * 1-8: foundations + vocabulary (阴阳 through 合冲刑害).
 * 9-13: the adept core — strength, pattern, favorable-god selection,
 *   named stars in depth, pair-reading in depth. This is the technical
 *   machinery a folk-table reader skips.
 * 14-15: the moving layer (大运流年) and the frame that holds it all.
 */
export const CURRICULUM: CurriculumModule[] = [
  ...FOUNDATIONS,
  ...SYSTEM,
  ...READING,
  ...STRENGTH_AND_PATTERN,
  ...SHENSHA_DEEP,
  ...HEHUN_DEEP,
  ...TRANSITS_AND_FRAME,
];

export function moduleBySlug(slug: string): CurriculumModule | undefined {
  return CURRICULUM.find((m) => m.slug === slug);
}
