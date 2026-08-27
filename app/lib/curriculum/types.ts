export interface TermEntry {
  term: string;
  pinyin: string;
  gloss: string;
}

export interface Table2 {
  head: [string, string];
  rows: Array<[string, string]>;
}

export interface CurriculumSection {
  heading: string;
  chinese?: string;
  pinyin?: string;
  paragraphs: string[];
  terms?: TermEntry[];
  table?: Table2;
}

export interface CurriculumModule {
  id: number;
  /** URL-safe slug for the module's own page: /curriculum/[slug]/. */
  slug: string;
  title: string;
  pinyin: string;
  subtitle: string;
  intro: string[];
  sections: CurriculumSection[];
}
