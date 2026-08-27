'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ChartGrid } from '@/components/ChartGrid';
import { StrengthPanel } from '@/components/StrengthPanel';
import { RebirthSlot } from '@/components/RebirthSlot';
import { TransitTimeline } from '@/components/TransitTimeline';
import { HehunPanel } from '@/components/HehunPanel';
import { ValidationStep } from '@/components/ValidationStep';
import { ProfileForm } from '@/components/ProfileForm';
import { ClickableCJK } from '@/components/ClickableCJK';
import {
  listProfiles, saveProfile, deleteProfile, newEventId,
  exportAtlas, importAtlas, type Profile, type LifeEvent, type AtlasExport,
} from '@/lib/atlas';
import {
  queueContribution, queuedContributions, clearContributions, researchRecord,
  QUEUE_KEY, type ResearchRecord,
} from '@/lib/research';

const EVENT_CATEGORIES: Array<NonNullable<LifeEvent['category']>> = [
  'career', 'relationship', 'health', 'legal', 'family', 'move', 'other',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

function birthSummary(p: Profile): string {
  const { year, month, day, hour, minute } = p.birth;
  return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}${p.city ? ` · ${p.city}` : ''}`;
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * The one chart page — compute your own chart, or a family member's or
 * friend's, in the same place (2026-08-28 merge, Peter: "I don't want 2
 * separate sections"). Every saved chart is a Profile in the same local
 * store (lib/atlas.ts, IndexedDB). First visit is a bare intake form, no
 * list to face; once more than one chart exists, the page automatically
 * becomes what the standalone /atlas used to be — a list you pick from —
 * with no route change and no second section.
 *
 * isSelf (set on the intake form: "this is me" / "someone else") is the
 * doctrine hinge the merge depends on: only profiles you mark as yourself
 * queue into the research commons (lib/research.ts) and unlock the blind
 * validation study (ValidationStep) — every other profile behaves exactly
 * like the old standalone Atlas already promised: fully local, never
 * queued, never sent anywhere. Minors can only be flagged on non-self
 * profiles (ProfileForm/atlas.ts enforce this) and require a one-time
 * acknowledgment before saving.
 */
export default function ChartPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  const [showContributions, setShowContributions] = useState(false);
  const [queued, setQueued] = useState<ResearchRecord[]>([]);
  const [queueFailed, setQueueFailed] = useState(false);

  // Event intake (inline form on the selected profile)
  const [evDate, setEvDate] = useState('');
  const [evLabel, setEvLabel] = useState('');
  const [evCategory, setEvCategory] = useState<LifeEvent['category']>('other');
  const [evNotes, setEvNotes] = useState('');

  // Hour-school VIEW override — local to whichever profile is selected, never
  // persisted, never touches the queued research record (that keeps whatever
  // school was chosen at entry — the actual consent moment). Resets on
  // profile change so switching charts doesn't carry a stale toggle over.
  const [viewSchool, setViewSchool] = useState<'clock' | 'solar' | null>(null);

  const reload = () => {
    listProfiles().then((ps) => {
      setProfiles(ps);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
    setQueued(queuedContributions());
  }, []);

  useEffect(() => setViewSchool(null), [selectedId]);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;
  const hasSelf = profiles.some((p) => p.isSelf);
  const effectiveSchool = selected ? (viewSchool ?? selected.birth.hourSchool) : 'clock';

  const chart: Chart | null = useMemo(() => {
    if (!selected) return null;
    return computeChart(
      selected.birth.year, selected.birth.month, selected.birth.day,
      selected.birth.hour, selected.birth.minute,
      selected.lon != null && selected.tz != null ? { lonDeg: selected.lon, tzHours: selected.tz } : undefined,
      selected.birth.gender === 'male' ? 1 : 0,
      effectiveSchool,
    );
  }, [selected, effectiveSchool]);

  const schoolHint =
    effectiveSchool === 'solar' && !selected?.city
      ? 'needs a birth city for the longitude'
      : '';

  /** Saving a profile is the consent moment for isSelf profiles: exactly one
   *  research-commons contribution gets queued here, matching the old /chart
   *  page's "entering your birth data is consent" behavior — just moved to
   *  fire on profile-save instead of on every form submit, since a saved
   *  profile now persists instead of being ephemeral per-visit state. */
  const handleSaveProfile = async (p: Profile) => {
    const ok = await saveProfile(p);
    setSaveFailed(!ok);
    setShowForm(false);
    if (ok && p.isSelf) {
      const c = computeChart(
        p.birth.year, p.birth.month, p.birth.day, p.birth.hour, p.birth.minute,
        p.lon != null && p.tz != null ? { lonDeg: p.lon, tzHours: p.tz } : undefined,
        p.birth.gender === 'male' ? 1 : 0,
        p.birth.hourSchool,
      );
      const qOk = queueContribution(researchRecord(
        {
          year: p.birth.year, month: p.birth.month, day: p.birth.day,
          hour: p.birth.hour, minute: p.birth.minute,
          lon: p.lon ?? null, tz: p.tz ?? null, city: p.city ?? null,
          gender: p.birth.gender, hourSchool: p.birth.hourSchool,
        },
        c,
      ));
      setQueueFailed(!qOk);
      setQueued(queuedContributions());
    }
    reload();
    if (ok) setSelectedId(p.id);
  };

  const handleDelete = async (id: string) => {
    await deleteProfile(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  };

  const toggleSendToLLM = async (p: Profile) => {
    const next = { ...p, sendEventsToLLM: !p.sendEventsToLLM, updatedAt: new Date().toISOString() };
    const ok = await saveProfile(next);
    setSaveFailed(!ok);
    reload();
  };

  const addEvent = async () => {
    if (!selected || !evDate.trim() || !evLabel.trim()) return;
    const event: LifeEvent = {
      id: newEventId(),
      date: evDate.trim(),
      label: evLabel.trim(),
      category: evCategory,
      notes: evNotes.trim() || undefined,
    };
    const next: Profile = {
      ...selected,
      events: [...selected.events, event].sort((a, b) => a.date.localeCompare(b.date)),
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveProfile(next);
    setSaveFailed(!ok);
    setEvDate(''); setEvLabel(''); setEvCategory('other'); setEvNotes('');
    reload();
  };

  const removeEvent = async (eventId: string) => {
    if (!selected) return;
    const next: Profile = {
      ...selected,
      events: selected.events.filter((e) => e.id !== eventId),
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveProfile(next);
    setSaveFailed(!ok);
    reload();
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as AtlasExport;
      await importAtlas(data, 'merge');
      reload();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  // Show the intake form unconditionally on a first visit (nothing else to
  // show yet) or whenever "+ add chart" was clicked.
  const shouldShowForm = showForm || (!loading && profiles.length === 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="max-w-3xl">
        <header className="mb-6">
          <Link href="/" className="text-sm text-muted hover:text-accent">
            ← bazilionaire
          </Link>
          <h1 className="text-2xl font-bold text-ink mt-2">chart</h1>
          <p className="text-sm text-muted mt-1">
            <ClickableCJK text="八字" /> — eight characters · yours, or someone you love&apos;s ·{' '}
            <Link href="/curriculum" className="underline hover:text-accent">
              课程 curriculum
            </Link>{' '}
            · <span className="italic">read the map, follow the Lion</span> (Rev 5:5)
          </p>
        </header>

        {saveFailed && (
          <div className="card p-3 mb-3 text-sm text-accent-strong border-accent/40">
            ⚠ This browser could not save that change (storage unavailable or full).
          </div>
        )}
        {queueFailed && (
          <div className="card p-3 mb-3 text-sm text-accent-strong border-accent/40">
            ⚠ This browser could not save your contribution to the research commons
            (storage unavailable or full) — your chart is computed correctly, but the
            record was not queued.
          </div>
        )}

        {!selected && (
          <>
            {profiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowForm((v) => !v)}
                  className="bg-accent text-on-accent rounded py-2 px-4 text-sm font-medium"
                >
                  {showForm ? 'cancel' : '+ add chart'}
                </button>
                <button
                  type="button"
                  onClick={() => exportAtlas().then((data) => downloadJSON(data, 'bazilionaire-charts.json'))}
                  className="text-sm text-muted underline hover:text-accent"
                >
                  export all (.json)
                </button>
                <label className="text-sm text-muted underline hover:text-accent cursor-pointer">
                  import (.json)
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowContributions((v) => !v)}
                  className="text-sm text-muted underline hover:text-accent"
                >
                  research commons ({queued.length})
                </button>
              </div>
            )}
            {importError && <p className="text-xs text-accent-strong mb-3">⚠ {importError}</p>}

            {showContributions && (
              <div className="card p-3 mb-3 text-xs text-muted">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-medium text-body">
                    research commons — your contributions ({queued.length})
                  </span>
                  <button
                    onClick={() => setShowContributions(false)}
                    className="text-muted underline hover:text-accent shrink-0"
                  >
                    close
                  </button>
                </div>
                {queued.length === 0 ? (
                  <p>Nothing held yet — compute a chart marked &quot;this is me&quot; to contribute.</p>
                ) : (
                  <>
                    <p className="mb-2">
                      Each record holds the birth inputs you entered and everything the engine
                      derived (pillars, <ClickableCJK text="十神" />, <ClickableCJK text="藏干" />,{' '}
                      <ClickableCJK text="纳音" />, <ClickableCJK text="空亡" />, <ClickableCJK text="大运" />{' '}
                      with start years). Queued in this browser until the commons endpoint ships;
                      nothing has been transmitted.
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {queued.map((r, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <span>
                            {r.birth.year}-{String(r.birth.month).padStart(2, '0')}-
                            {String(r.birth.day).padStart(2, '0')}{' '}
                            {String(r.birth.hour).padStart(2, '0')}:
                            {String(r.birth.minute).padStart(2, '0')} · {r.pillars.year}{' '}
                            {r.pillars.month} {r.pillars.day} {r.pillars.time}
                          </span>
                          <button
                            onClick={() => {
                              const next = queued.filter((_, j) => j !== i);
                              localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
                              setQueued(next);
                            }}
                            className="text-muted underline hover:text-accent shrink-0"
                          >
                            delete
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        clearContributions();
                        setQueued([]);
                      }}
                      className="mt-2 underline hover:text-accent"
                    >
                      clear all my contributions
                    </button>
                  </>
                )}
              </div>
            )}

            {shouldShowForm && (
              <div className="mb-4">
                <ProfileForm onSave={handleSaveProfile} onCancel={() => setShowForm(false)} hasSelf={hasSelf} />
              </div>
            )}

            {!shouldShowForm && (
              loading ? (
                <p className="text-sm text-muted">loading…</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div key={p.id} className="card p-3 flex items-center justify-between gap-3">
                      <button type="button" onClick={() => setSelectedId(p.id)} className="text-left flex-1">
                        <div className="text-sm font-medium text-ink">
                          {p.name}
                          {p.isSelf && <span className="text-accent-strong font-normal text-xs ml-1">(you)</span>}
                          {p.relation && <span className="text-muted font-normal"> · {p.relation}</span>}
                          {p.isMinor && <span className="text-accent-strong font-normal text-xs ml-1">minor</span>}
                        </div>
                        <div className="text-xs text-muted">{birthSummary(p)}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-muted underline hover:text-accent shrink-0"
                      >
                        delete
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {selected && chart && (
        <div className="mt-2 space-y-4">
          <div className="max-w-3xl flex items-center justify-between gap-3 flex-wrap">
            <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-muted hover:text-accent">
              ← all charts
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selected.id)}
              className="text-xs text-muted underline hover:text-accent"
            >
              delete this chart
            </button>
          </div>

          <div className="max-w-3xl card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {selected.name}
                  {selected.isSelf && <span className="text-accent-strong font-normal text-base ml-1">(you)</span>}
                  {selected.relation && <span className="text-muted font-normal text-base"> · {selected.relation}</span>}
                </h2>
                <div className="text-xs text-muted mt-0.5">{birthSummary(selected)}</div>
                {selected.notes && <p className="text-sm text-body mt-2">{selected.notes}</p>}
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted mt-3 pt-3 border-t border-line">
              <input
                type="checkbox"
                checked={selected.sendEventsToLLM}
                onChange={() => toggleSendToLLM(selected)}
                className="mt-0.5"
              />
              <span>
                Let the AI tutor use this chart&apos;s life events as context (default on). Turn off to
                keep events local-only even once the tutor ships.
              </span>
            </label>
          </div>

          {chart.warnings.length > 0 && (
            <div className="max-w-3xl card p-3 text-sm text-accent-strong border-accent/40">
              {chart.warnings.map((w) => (
                <div key={w}>⚠ {w}</div>
              ))}
            </div>
          )}
          <div className="max-w-3xl flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-muted">
              hour school: {effectiveSchool === 'solar'
                ? <>
                    <ClickableCJK text="真太阳时" /> true solar time (born {pad2(selected.birth.hour)}:{pad2(selected.birth.minute)} clock → {chart.trueSolarTime} solar)
                  </>
                : 'clock time'}
            </span>
            <button
              type="button"
              onClick={() => setViewSchool(effectiveSchool === 'clock' ? 'solar' : 'clock')}
              className="text-xs underline hover:text-accent"
            >
              {effectiveSchool === 'clock' ? 'reinterpret as 真太阳时 →' : '← reinterpret as clock time'}
            </button>
          </div>
          {schoolHint && (
            <div className="max-w-3xl text-xs text-accent">⚠ {schoolHint} — showing clock time</div>
          )}

          <ChartGrid chart={chart} />
          <StrengthPanel chart={chart} />
          <RebirthSlot dayun={chart.yun?.dayun} birthYear={selected.birth.year} />
          <TransitTimeline chart={chart} birthYear={selected.birth.year} events={selected.events} />
          <HehunPanel chartA={chart} genderA={selected.birth.gender} birthYearA={selected.birth.year} />
          {selected.isSelf && <ValidationStep chart={chart} />}

          <div className="max-w-3xl card p-4">
            <div className="text-sm text-muted mb-2">life events — plotted on the timeline above</div>
            {selected.events.length > 0 && (
              <div className="space-y-1 mb-3">
                {selected.events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="text-muted">{e.date}</span> · {e.label}
                      {e.category && <span className="text-faint text-xs ml-1">({e.category})</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEvent(e.id)}
                      className="text-xs text-muted underline hover:text-accent shrink-0"
                    >
                      delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="text-xs">
                <span className="text-muted block">date</span>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
                />
              </label>
              <label className="text-xs sm:col-span-2">
                <span className="text-muted block">what happened</span>
                <input
                  type="text"
                  placeholder="e.g. married Kat"
                  value={evLabel}
                  onChange={(e) => setEvLabel(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
                />
              </label>
              <label className="text-xs">
                <span className="text-muted block">category</span>
                <select
                  value={evCategory}
                  onChange={(e) => setEvCategory(e.target.value as LifeEvent['category'])}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs col-span-2 sm:col-span-4">
                <span className="text-muted block">notes (optional)</span>
                <input
                  type="text"
                  value={evNotes}
                  onChange={(e) => setEvNotes(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addEvent}
              disabled={!evDate.trim() || !evLabel.trim()}
              className="mt-2 bg-accent text-on-accent rounded py-1.5 px-3 text-xs font-medium disabled:opacity-40"
            >
              add event
            </button>
          </div>

          <footer className="max-w-3xl text-xs text-faint text-center pt-4 space-y-1">
            <div>
              <Link href="/trust/research" className="underline hover:text-accent">methodology · research</Link>
            </div>
            <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
          </footer>
        </div>
      )}
    </main>
  );
}
