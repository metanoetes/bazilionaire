import { FOUNDATIONS } from './curriculum/part1';
import { SYSTEM } from './curriculum/part2';
import { READING } from './curriculum/part3';
import type { CurriculumModule, CurriculumSection, Table2, TermEntry } from './curriculum/types';

export type { CurriculumModule, CurriculumSection, Table2, TermEntry };

/** The full 10-module curriculum, in teaching order. */
export const CURRICULUM: CurriculumModule[] = [...FOUNDATIONS, ...SYSTEM, ...READING];
