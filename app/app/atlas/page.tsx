'use client';

/**
 * /atlas — 命谱 mìng pǔ, "the register of fates." The third section, alongside the
 * reading room (the home page) and the curriculum.
 *
 * Peter's call, 2026-08-27: each person with key notes that help the reading. The notes
 * edit inline and persist to the atlas store (lib/atlas.ts). Right-click a person for a
 * menu — "import into reading" attaches their chart and notes to the reading room's
 * conversation context (namespaced fact ids, so nobody's facts collide), which is how
 * the user "imports people's profiles into the reading."
 *
 * Everything here is local-first: profiles live in IndexedDB, charts compute in the
 * browser, and nothing leaves the device except what the reading room's own model call
 * sends on the reader's key.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ClickableCJK } from '@/components/ClickableCJK';
import { deleteProfile, listProfiles, saveProfile, type Profile } from '@/lib/atlas';

const IMPORT_KEY = 'bazilionaire.importProfiles';

interface MenuState {
  x: number;
  y: number;
  profile: Profile;
}

export default function AtlasPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});
  const [menu, setMenu] = useState<MenuState | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      const list = await listProfiles();
      setProfiles(list);
      const drafts: Record<string, string> = {};
      for (const p of list) drafts[p.id] = p.notes ?? '';
      setNotesDrafts(drafts);
    })();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    const onClick = () => setMenu(null);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [menu]);

  const chartFor = useMemo(() => {
    const map = new Map<string, Chart>();
    for (const p of profiles ?? []) {
      const b = p.birth;
      const location =
        p.lon !== null && p.tz !== null
          ? { lonDeg: p.lon as number, tzHours: p.tz as number }
          : undefined;
      try {
        map.set(
          p.id,
          computeChart(
            b.year, b.month, b.day, b.hour, b.minute, location,
            b.gender === 'male' ? 1 : 0, b.hourSchool,
          ),
        );
      } catch {
        /* a profile with unusable birth data simply shows no pillars */
      }
    }
    return map;
  }, [profiles]);

  const importIntoReading = (profile: Profile) => {
    try {
      const raw = localStorage.getItem(IMPORT_KEY);
      const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!ids.includes(profile.id)) ids.push(profile.id);
      localStorage.setItem(IMPORT_KEY, JSON.stringify(ids.slice(-4)));
    } catch {
      /* storage unavailable — navigation still proceeds */
    }
    router.push('/');
  };

  const saveNotes = async (p: Profile) => {
    const notes = (notesDrafts[p.id] ?? '').trim();
    const updated: Profile = { ...p, notes, updatedAt: new Date().toISOString() };
    await saveProfile(updated);
    const list = await listProfiles();
    setProfiles(list);
  };

  const remove = async (p: Profile) => {
    await deleteProfile(p.id);
    const list = await listProfiles();
    setProfiles(list);
  };

  if (profiles === null) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-muted">Opening the atlas…</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" ref={pageRef}>
      <header className="mb-4 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            <ClickableCJK text="命谱" /> — the atlas
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Each person, their pillars, and the key notes that help the reading. Right-click a
            person to bring them into the reading room.
          </p>
        </div>
        <Link href="/chart" className="text-sm underline text-accent hover:text-accent-strong">
          + compute a new chart
        </Link>
      </header>

      {profiles.length === 0 && (
        <div className="card p-4 text-sm text-body leading-relaxed">
          <p>The atlas is empty. The reading room will offer to save your own chart when you
            give it your birth data — or compute one{' '}
            <Link href="/chart" className="underline hover:text-accent">on the plate page</Link>.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((p) => {
          const chart = chartFor.get(p.id);
          return (
            <div
              key={p.id}
              className="card p-4"
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ x: e.clientX, y: e.clientY, profile: p });
              }}
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-base font-semibold text-ink">
                  {p.name}
                  {p.relation && <span className="text-sm text-muted font-normal"> · {p.relation}</span>}
                  {p.isSelf && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-soft text-accent-strong">
                      me
                    </span>
                  )}
                  {p.isMinor && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted">
                      minor
                    </span>
                  )}
                </span>
                <button
                  onClick={() => void remove(p)}
                  className="text-faint hover:text-accent text-xs"
                  title="remove from the atlas"
                >
                  ✕
                </button>
              </div>

              <div className="mt-1 text-xs text-muted">
                {chart ? (
                  <>
                    <span className="text-body font-medium">
                      {chart.year} {chart.month} {chart.day} {chart.time}
                    </span>
                    {' · '}
                    <ClickableCJK text="日主" /> {chart.day[0]}
                    {' · '}
                    {p.birth.gender === 'male' ? 'male' : 'female'}
                    {' · '}
                    {p.birth.hourSchool === 'solar' ? <ClickableCJK text="真太阳时" /> : 'clock time'}
                  </>
                ) : (
                  'no chart'
                )}
                {p.rebirthAt && (
                  <>
                    {' · '}
                    <ClickableCJK text="重生" /> {p.rebirthAt}
                  </>
                )}
                {p.events.length > 0 && <> · {p.events.length} events</>}
              </div>

              <label className="block mt-3">
                <span className="text-[10px] uppercase tracking-wider text-faint">
                  key notes for the reading
                </span>
                <textarea
                  value={notesDrafts[p.id] ?? ''}
                  onChange={(e) =>
                    setNotesDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                  }
                  onBlur={() => void saveNotes(p)}
                  rows={3}
                  placeholder="what the reader should keep in mind about this person…"
                  className="w-full border border-line rounded px-2 py-1.5 bg-surface-2 text-ink text-sm mt-1 resize-y"
                />
              </label>
            </div>
          );
        })}
      </div>

      {menu && (
        <div
          className="fixed z-50 min-w-[180px] card p-1 shadow-lg"
          style={{ left: Math.min(menu.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 200), top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              importIntoReading(menu.profile);
              setMenu(null);
            }}
            className="w-full text-left text-sm px-3 py-2 rounded text-body hover:bg-surface-2"
          >
            import {menu.profile.name} into the reading
          </button>
          <button
            onClick={() => {
              void remove(menu.profile);
              setMenu(null);
            }}
            className="w-full text-left text-sm px-3 py-2 rounded text-body hover:bg-surface-2"
          >
            remove from the atlas
          </button>
        </div>
      )}
    </main>
  );
}
