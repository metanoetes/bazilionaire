/**
 * Shared random-birth generator: intake defaults (chart/page.tsx) and the
 * Atlas profile-form default. One implementation, one range, one place to
 * change the plausible-birth window.
 *
 * It also used to generate the blinded comparison chart for the claim-rating
 * control condition; that instrument was removed 2026-08-27, so this is back
 * to being a defaults generator only.
 */
export interface BirthState {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  hourSchool: 'clock' | 'solar';
}

/** A plausible, non-personal random birth. */
export function randomBirth(): BirthState {
  const year = 1940 + Math.floor(Math.random() * 81); // 1940–2020
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const gender = Math.random() < 0.5 ? ('male' as const) : ('female' as const);
  return { year, month, day, hour, minute, gender, hourSchool: 'clock' as const };
}

/** Hydration-safe neutral sentinel — SSR renders this; client swaps in randomBirth() once. */
export const BIRTH_SENTINEL: BirthState = {
  year: 2000, month: 1, day: 1, hour: 12, minute: 0,
  gender: 'male', hourSchool: 'clock',
};
