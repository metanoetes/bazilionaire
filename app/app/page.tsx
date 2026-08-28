'use client';

/**
 * The home page IS the reading room (Peter, 2026-08-27: land on the chat).
 * /reading redirects here. The chat is the page: a list of conversations on the left,
 * one thread in the main pane, the model composing a full reading of the person's life
 * and destiny from the computed fact sheet, their logged events, and any atlas profiles
 * imported into the room.
 *
 * The editorial fence was deleted the same day. Below the chat sits the FLOOR, unchanged:
 * the computed 解盘, composed by template with no model, pinned against a golden file in
 * CI — the same words every time, working with no key and no network, forever.
 *
 * Chart context: the last research record queued by /chart (entry-as-consent), or a
 * chart saved here through the chat's own birth-data confirmation, which lands in the
 * atlas. Logged events come from the matching atlas profile.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ChatPanel } from '@/components/ChatPanel';
import { ClickableCJK } from '@/components/ClickableCJK';
import { listProfiles, type LifeEvent } from '@/lib/atlas';
import { factsheet, type Fact, type FactLayer } from '@/lib/factsheet';
import { reading } from '@/lib/reading';
import { queuedContributions, type ResearchRecord } from '@/lib/research';

const LAYER_LABEL: Record<FactLayer, string> = {
  frame: 'frame',
  standing: '强弱 standing',
  shape: '格局 shape',
  medicine: '用神 medicine',
  tension: '关系 tension',
  imagery: '纳音 imagery',
  weather: '大运 weather',
};

const LAYER_ORDER: FactLayer[] = ['frame', 'standing', 'shape', 'medicine', 'tension', 'imagery', 'weather'];

export default function HomePage() {
  // undefined = still reading storage (SSR/first paint), null = nothing stored.
  const [record, setRecord] = useState<ResearchRecord | null | undefined>(undefined);
  const [year, setYear] = useState<number | null>(null);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [showFacts, setShowFacts] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    const queue = queuedContributions();
    setRecord(queue.length > 0 ? queue[queue.length - 1] : null);
    setYear(new Date().getFullYear());
  }, []);

  // The matching atlas profile supplies the person's own record: logged events and
  // remedies, matched on the birth data itself (date/time/gender/hour school).
  useEffect(() => {
    if (!record) return;
    const b = record.birth;
    void (async () => {
      const profiles = await listProfiles();
      const match = profiles.find(
        (p) =>
          p.birth.year === b.year &&
          p.birth.month === b.month &&
          p.birth.day === b.day &&
          p.birth.hour === b.hour &&
          p.birth.minute === b.minute &&
          p.birth.gender === b.gender &&
          p.birth.hourSchool === b.hourSchool,
      );
      setEvents(match?.events ?? []);
    })();
  }, [record]);

  const chart: Chart | null = useMemo(() => {
    if (!record) return null;
    const b = record.birth;
    const location = b.lon !== null && b.tz !== null ? { lonDeg: b.lon, tzHours: b.tz } : undefined;
    return computeChart(
      b.year, b.month, b.day, b.hour, b.minute,
      location,
      b.gender === 'male' ? 1 : 0,
      b.hourSchool,
    );
  }, [record]);

  const facts: Fact[] = useMemo(
    () => (chart && year ? factsheet(chart, { year }) : []),
    [chart, year],
  );
  const movements = useMemo(
    () => (chart && year ? reading(chart, facts, { year }) : []),
    [chart, facts, year],
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-ink">
          <ClickableCJK text="解盘" /> — the reading room
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Your chart, your life, one conversation at a time. The engine computed the chart; the
          reader composes the reading.
        </p>
      </header>

      <div className="card p-4 text-xs text-muted leading-relaxed mb-4">
        <span className="font-medium text-body">The reading is the tradition speaking, on your own key.</span>{' '}
        The engine computes no meaning, no fortune, no verdict — that promise still holds for the
        computation. The reader below is a model you configured: it receives the computed fact
        sheet, your logged events, the imported profiles, and the conversation, and it composes
        the tradition&apos;s full reading of your life and destiny from them — predictions
        included, in the tradition&apos;s own vocabulary. Where a sentence draws on a computed
        fact it carries that fact&apos;s chip; made-up citations are labelled. Read it as the
        tradition&apos;s claim, weigh it against your own life, and remember{' '}
        <ClickableCJK text="善人不为命所缚" /> — the good are not bound by fate.
      </div>

      <ChatPanel facts={facts} events={events} />

      <div className="card p-4 mt-4 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-muted">
          the computed reading — composed by template, no model, the same words every time
        </span>
        <button
          onClick={() => setShowTemplate((v) => !v)}
          className="text-xs underline hover:text-accent shrink-0"
        >
          {showTemplate ? 'hide the computed reading' : 'show the computed reading'}
        </button>
      </div>

      {showTemplate &&
        movements.map((m) => (
          <section key={m.id} className="card p-4">
            <h2 className="text-base font-semibold text-ink">
              <ClickableCJK text={m.zh} />{' '}
              <span className="text-xs text-faint font-normal">{m.pinyin}</span>
              <span className="text-muted font-normal"> — {m.title}</span>
            </h2>
            <div className="mt-2 space-y-2 text-sm text-body leading-relaxed">
              {m.paragraphs.map((p, i) => (
                <p key={i}>
                  <ClickableCJK text={p} />
                </p>
              ))}
            </div>
            {m.cites.length > 0 && (
              <div className="mt-3 pt-2 border-t border-line-soft flex flex-wrap gap-1">
                <span className="text-[10px] text-faint mr-1">composed from</span>
                {m.cites.map((c) => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted font-mono">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </section>
        ))}

      <div className="card p-4 mt-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-muted">
            the fact sheet — {facts.length} computed facts, the reader cites these
          </span>
          <button
            onClick={() => setShowFacts((v) => !v)}
            className="text-xs underline hover:text-accent shrink-0"
          >
            {showFacts ? 'hide the facts' : 'show the facts'}
          </button>
        </div>

        {showFacts && (
          <div className="mt-3 space-y-3">
            {LAYER_ORDER.map((layer) => {
              const inLayer = facts.filter((f) => f.layer === layer);
              if (inLayer.length === 0) return null;
              return (
                <div key={layer} className="border-t border-line pt-2">
                  <div className="text-xs text-faint mb-1">
                    <ClickableCJK text={LAYER_LABEL[layer]} />
                  </div>
                  <dl className="space-y-1.5">
                    {inLayer.map((f) => (
                      <div key={f.id} className="text-xs">
                        <dt className="flex flex-wrap items-baseline gap-1.5">
                          <span className="font-mono text-[10px] text-faint">{f.id}</span>
                          {f.term && (
                            <span className="text-accent-strong">
                              <ClickableCJK text={f.term} />
                            </span>
                          )}
                          <span className="text-muted">{f.label}</span>
                        </dt>
                        <dd className="text-body">
                          <ClickableCJK text={f.value} />
                          {f.detail && (
                            <span className="text-muted">
                              {' — '}
                              <ClickableCJK text={f.detail} />
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="text-xs text-faint text-center pt-6 space-y-1">
        <div>
          <Link href="/atlas" className="underline hover:text-accent">
            the atlas
          </Link>
          {' · '}
          <Link href="/chart" className="underline hover:text-accent">
            the plate
          </Link>
          {' · '}
          <Link href="/curriculum" className="underline hover:text-accent">
            curriculum
          </Link>
          {' · '}
          <Link href="/trust/research" className="underline hover:text-accent">
            research
          </Link>
        </div>
        <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
      </footer>
    </main>
  );
}
