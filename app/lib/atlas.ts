/**
 * Atlas — the private, local chart store behind the unified /chart page.
 * Every chart computed on /chart (self or someone else's) is a Profile here;
 * "atlas" is what /chart's list becomes automatically once more than one
 * exists — there is no separate route or section (2026-08-28: /chart and
 * /atlas were merged into one page at Peter's request — "I don't want 2
 * separate sections").
 *
 * Local-first per the project's account-free doctrine ("Accounts exist only
 * for LLM users. Curriculum, charts, readings stay account-free.") — this
 * is IndexedDB, not the planned LLM-account system, and it stays that way
 * until a real cross-device need rides that already-planned backend instead
 * of standing up a second, parallel account system just for this.
 *
 * isSelf is the doctrine hinge the merge depends on: exactly the profiles
 * you enter about YOURSELF may feed the research commons (lib/research.ts)
 * — that's the "entering your OWN birth data is consent" doctrine,
 * unchanged. Every other profile (a
 * sister, a friend) is exactly what the old standalone Atlas already was:
 * fully local, never queued, never sent anywhere. The chart page checks
 * this flag before ever touching research.ts — it does not
 * ask a second time.
 *
 * NOT the research commons by default: saving a profile here never
 * auto-queues into lib/research.ts's contribution queue UNLESS isSelf.
 * That queue's "entry is consent" doctrine was written for people entering
 * THEIR OWN data — a third-party profile (your sister, a friend) needs its
 * own explicit action if it ever feeds the commons at all, and this module
 * does not provide one for non-self profiles.
 *
 * Minors: flagging a profile as a minor requires a one-time acknowledgment
 * (see ProfileForm) before it saves — not a hard block (a parent/relative
 * legitimately wants a family member's chart), but not zero-friction either,
 * since this is a public app, not just a private notebook. isSelf profiles
 * skip this (you cannot consent-gate yourself as a minor about yourself).
 *
 * sendEventsToLLM: per-profile, default TRUE (Peter's call) — life events
 * feed the future AI interpreter unless explicitly turned off for that
 * profile. Distinct from the grounded-context contract for the CHART tutor
 * (derived chart facts, never birth time/place) — life events are narrative,
 * third-party, sometimes sensitive, so this flag exists precisely so a
 * profile holding sensitive events (health, legal, relationship) can be
 * opted out without losing the chart itself.
 */
import type { BirthState } from './randomBirth';

export interface LifeEvent {
  id: string;
  /** YYYY-MM-DD, or YYYY-MM / YYYY when the date is only approximately known. */
  date: string;
  label: string;
  category?: 'career' | 'relationship' | 'health' | 'legal' | 'family' | 'move' | 'other';
  notes?: string;
  /**
   * What KIND of entry this is. ABSENT ⇒ 'milestone' — every record written before
   * 2026-08-27 predates this field, so read it through `eventKind()` rather than
   * touching `.kind` directly; that keeps the migration in exactly one place.
   *
   * 'milestone' — something that happened TO the person. Interprets the 大运/流年 it
   *               lands in (the timeline overlay already plots these).
   * 'remedy'    — medicine PRESCRIBED AND TAKEN: a practice deliberately begun
   *               (a jiujitsu class, freestyle rap, a discipline, a move). The
   *               interpretive question a remedy answers is not "what happened" but
   *               "was the 用神 this chart asks for actually administered, when did it
   *               start, and did it hold" — which is why `endedAt` exists.
   */
  kind?: 'milestone' | 'remedy';
  /**
   * For remedies: which of the 五行 the practice is taken FOR. Indices match the
   * engine's `ELEMENT_NAMES` order — 0=木 1=火 2=土 3=金 4=水 (verified against
   * engine/src/elements.ts:10, not assumed).
   *
   * A remedy whose elements do NOT include the chart's 用神 is not an error to
   * correct — it is the finding. Do not validate this against the chart.
   */
  remedyFor?: number[];
  /**
   * For remedies: when it stopped. A remedy that STOPPED is data, not a deletion —
   * a practice held for eight years and dropped at a 大运 boundary is exactly the
   * kind of thing the timeline exists to show. Never delete a lapsed remedy.
   */
  endedAt?: string;
}

/**
 * The one place the `kind` migration lives: records predating the field are
 * milestones. Every consumer (pack, timeline, report) must go through this rather
 * than re-implementing the fallback and drifting.
 */
export function eventKind(e: LifeEvent): 'milestone' | 'remedy' {
  return e.kind === 'remedy' ? 'remedy' : 'milestone';
}

export function isRemedy(e: LifeEvent): boolean {
  return eventKind(e) === 'remedy';
}

export interface Profile {
  id: string;
  name: string;
  relation?: string;
  /** True for exactly the profile(s) the account holder enters about themselves —
   *  the doctrine hinge for research-commons + validation-study eligibility. */
  isSelf: boolean;
  birth: BirthState;
  /** City name as picked (GeoNames name), for 真太阳时 — mirrors research.ts's ResearchRecord.birth.city. */
  city?: string | null;
  lon?: number | null;
  tz?: number | null;
  notes?: string;
  /**
   * 重生 — the date this person was born again in Christ (John 3:3), YYYY-MM-DD.
   * Optional and never inferred.
   *
   * Until 2026-08-27 this lived only in `RebirthSlot`'s `useState`, so it died with
   * the page — the single field the two-regime 大运 timeline depends on was the one
   * field never stored. It belongs on the Profile because it is a property of the
   * person, not of a page visit.
   *
   * PRIVACY NOTE, since it is easy to miss: a rebirth date is *itself a date*, and
   * combined with the 大运 decade it splits it narrows the birth year the same way a
   * 起运 offset does. It is redacted on the same footing as birth data — never sent
   * to a remote model, never in a shareable-grade report.
   */
  rebirthAt?: string;
  /**
   * The person's name in Chinese characters — `given` as given, `chosen` if they
   * took another (a baptismal or chosen name). Optional.
   *
   * This is the ONE interpretive layer the pinned Python oracle cannot settle:
   * schools disagree on whether a character's element comes from its radical, its
   * stroke count, or 五格 numerology. Anything derived from this therefore carries
   * its own fact prefix and an honesty badge, and is never blended into
   * oracle-verified facts — otherwise "computed, not generated" becomes a lie by
   * adjacency.
   */
  nameCJK?: { given?: string; chosen?: string };
  isMinor: boolean;
  /** Set once the one-time minors acknowledgment (ProfileForm) has been shown and accepted. */
  minorAcknowledged: boolean;
  /** Default true — opt-out, not opt-in, per profile. */
  sendEventsToLLM: boolean;
  events: LifeEvent[];
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'bazilionaire-atlas';
const DB_VERSION = 1;
const STORE = 'profiles';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable in this environment'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
    tx.oncomplete = () => db.close();
  });
}

export function newProfileId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function newEventId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `e_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** List all saved profiles, newest first. Returns [] (never throws) on any storage failure — an
 *  honest empty state beats a crashed page; callers show their own "unavailable" banner if needed. */
export async function listProfiles(): Promise<Profile[]> {
  try {
    const all = await withStore<Profile[]>('readonly', (s) => s.getAll());
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function getProfile(id: string): Promise<Profile | null> {
  try {
    const p = await withStore<Profile | undefined>('readonly', (s) => s.get(id));
    return p ?? null;
  } catch {
    return null;
  }
}

/** Create or overwrite a profile. Returns false on storage failure (quota, private mode) —
 *  same honest-failure contract as research.ts's queueContribution. */
export async function saveProfile(profile: Profile): Promise<boolean> {
  try {
    await withStore<IDBValidKey>('readwrite', (s) => s.put(profile));
    return true;
  } catch {
    return false;
  }
}

export async function deleteProfile(id: string): Promise<boolean> {
  try {
    await withStore<undefined>('readwrite', (s) => s.delete(id));
    return true;
  } catch {
    return false;
  }
}

export function newProfile(partial: {
  name: string;
  relation?: string;
  isSelf: boolean;
  birth: BirthState;
  city?: string | null;
  lon?: number | null;
  tz?: number | null;
  notes?: string;
  isMinor: boolean;
  /** Optional at creation — both are normally filled in later, on the person's own page. */
  rebirthAt?: string;
  nameCJK?: { given?: string; chosen?: string };
}): Profile {
  const now = new Date().toISOString();
  return {
    id: newProfileId(),
    name: partial.name,
    relation: partial.relation,
    isSelf: partial.isSelf,
    birth: partial.birth,
    city: partial.city ?? null,
    lon: partial.lon ?? null,
    tz: partial.tz ?? null,
    notes: partial.notes,
    rebirthAt: partial.rebirthAt,
    nameCJK: partial.nameCJK,
    isMinor: partial.isSelf ? false : partial.isMinor, // isSelf can't be a minor-of-someone-else
    minorAcknowledged: partial.isSelf ? false : partial.isMinor, // ProfileForm only calls this after acknowledgment is given
    sendEventsToLLM: true, // default ON, per-profile opt-out
    events: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ---- export / import — the local-first "sync" story (JSON file, no backend) ----

export interface AtlasExport {
  schema: 'bazilionaire.atlas.v1';
  exportedAt: string;
  profiles: Profile[];
}

export async function exportAtlas(): Promise<AtlasExport> {
  return {
    schema: 'bazilionaire.atlas.v1',
    exportedAt: new Date().toISOString(),
    profiles: await listProfiles(),
  };
}

/** Import a previously-exported atlas. mode 'merge' (default) keeps existing profiles and adds/
 *  overwrites by id; 'replace' clears the store first. Returns the count imported, or throws with
 *  a message the caller can show — this is a deliberate user action (file picker), not silent. */
export async function importAtlas(data: AtlasExport, mode: 'merge' | 'replace' = 'merge'): Promise<number> {
  if (data.schema !== 'bazilionaire.atlas.v1') {
    throw new Error('Unrecognized atlas file — expected schema bazilionaire.atlas.v1');
  }
  if (mode === 'replace') {
    const existing = await listProfiles();
    for (const p of existing) await deleteProfile(p.id);
  }
  let count = 0;
  for (const p of data.profiles) {
    const ok = await saveProfile(p);
    if (ok) count += 1;
  }
  return count;
}
