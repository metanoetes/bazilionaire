import type { ExtractedClaim } from './claims';

/**
 * Validation record v1 — the research page's within-subject blind control.
 * Every rating session shows BOTH the respondent's own chart's claims and an
 * equal-sized set from a freshly-randomized, unrelated comparison chart,
 * shuffled together and unlabeled which is which (ClaimRating.isControl
 * carries the true origin, never shown to the respondent until AFTER they
 * submit). The reveal — own-chart acceptance rate vs. comparison-chart
 * acceptance rate — is the actual signal a Forer/Barnum-effect critique
 * would ask for: if the two rates land close together, that is the honest
 * null, and it gets published exactly like a hit (the project's own
 * preregistered-commons discipline, research.ts's sibling doctrine).
 *
 * Rating a claim is a SEPARATE consent moment from computing a chart: free
 * text ("in what way") is more identifying than derived chart facts, so it
 * gets its own explicit opt-in line rather than riding the birth-data
 * consent already given in research.ts. Local-queued until the commons
 * Workers endpoint ships — same queue/clear/view pattern as research.ts.
 */
export interface ClaimRating {
  templateId: string;
  category: ExtractedClaim['category'];
  term: string;
  claim: string;
  context: string;
  /** True origin — a respondent's own chart, or the blind comparison chart. Never shown before reveal. */
  isControl: boolean;
  rating: 'resonates' | 'not' | 'unsure';
  /** Optional free text: "in what way" — the identifying part, own opt-in line. */
  note: string;
}

export interface ValidationRecord {
  schema: 'bazilionaire.validation.v1';
  claims: ClaimRating[];
  /** Own-chart vs. comparison-chart accept rate, computed at submit time for the reveal + aggregate. */
  ownAcceptRate: number | null;
  controlAcceptRate: number | null;
  submittedAt: string;
}

export function buildValidationRecord(claims: ClaimRating[]): ValidationRecord {
  const rate = (subset: ClaimRating[]) =>
    subset.length === 0 ? null : subset.filter((c) => c.rating === 'resonates').length / subset.length;
  return {
    schema: 'bazilionaire.validation.v1',
    claims,
    ownAcceptRate: rate(claims.filter((c) => !c.isControl)),
    controlAcceptRate: rate(claims.filter((c) => c.isControl)),
    submittedAt: new Date().toISOString(),
  };
}

export const VALIDATION_QUEUE_KEY = 'bazilionaire.validations.v1';

/** Local contribution queue — mirrors research.ts's queueContribution exactly:
 *  returns false on storage failure so callers can show an honest banner
 *  instead of silently claiming the rating was saved. */
export function queueValidation(record: ValidationRecord): boolean {
  try {
    const raw = localStorage.getItem(VALIDATION_QUEUE_KEY);
    const queue: ValidationRecord[] = raw ? (JSON.parse(raw) as ValidationRecord[]) : [];
    queue.push(record);
    localStorage.setItem(VALIDATION_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
}

export function queuedValidations(): ValidationRecord[] {
  try {
    const raw = localStorage.getItem(VALIDATION_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as ValidationRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearValidations(): void {
  try {
    localStorage.removeItem(VALIDATION_QUEUE_KEY);
  } catch {
    // nothing to clear
  }
}
