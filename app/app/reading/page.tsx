'use client';

/**
 * /reading — 解盘 jiě pán, now the reading room.
 *
 * Peter's call, 2026-08-27: this page is an LLM chat. A list of conversations on the
 * left, one thread in the main pane, and the model composes a full reading of the
 * person's life and destiny from the computed fact sheet and their logged events.
 *
 * The editorial fence was deleted the same day. What remains below the chat is the
 * FLOOR, unchanged: the computed 解盘, composed by template with no model, the same
 * words every time, pinned against a golden file in CI. The chat is the fluent pass
 * over it; the template is what works with no key and no network, forever.
 *
 * Where the chart comes from: the last research record queued in THIS browser by
 * /chart (lib/research.ts, entry-as-consent), re-computed here from its birth inputs.
 * Logged events and remedies are read from the matching atlas profile (lib/atlas.ts),
 * matched on the birth data itself. Nothing is transmitted except what the reader's
 * own endpoint call sends.
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

export default function ReadingPage() {
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
        <Link href="/chart" className="text-sm text-muted hover:text-accent">
          ← the plate
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">
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
        sheet, your logged events, and the conversation, and it composes the tradition&apos;s full
        reading of your life and destiny from them — predictions included, in the tradition&apos;s
        own vocabulary. Where a sentence draws on a computed fact it carries that fact&apos;s chip;
        made-up citations are labelled. Read it as the tradition&apos;s claim, weigh it against
        your own life, and remember <ClickableCJK text="善人不为命所缚" /> — the good are not
        bound by fate.
      </div>

      {record === undefined && (
        <p className="text-sm text-muted mt-6">Looking for your last computed chart…</p>
      )}

      {record === null && (
        <div className="card p-4 mt-4">
          <p className="text-sm text-body">
            Nothing to read yet — no chart has been computed in this browser.
          </p>
          <p className="text-sm text-muted mt-2">
            The reading is built from your last chart&apos;s computed facts, held only here.{' '}
            <Link href="/chart" className="underline hover:text-accent">
              Compute a chart
            </Link>{' '}
            and come back.
          </p>
        </div>
      )}

      {chart && (
        <div className="space-y-4">
          <div className="card p-3 text-xs text-muted flex flex-wrap items-baseline justify-between gap-2">
            <span>
              reading{' '}
              <span className="text-body font-medium">
                {chart.year} {chart.month} {chart.day} {chart.time}
              </span>{' '}
              · <ClickableCJK text="日主" /> {chart.day[0]} ·{' '}
              {chart.hourSchool === 'solar' ? <ClickableCJK text="真太阳时" /> : 'clock time'}
            </span>
            <span className="text-faint">
              {facts.length} facts · {events.length} logged events in context
            </span>
          </div>

          <ChatPanel facts={facts} events={events} />

          <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
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

          <div className="card p-4">
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

          <footer className="text-xs text-faint text-center pt-4 space-y-1">
            <div>
              <Link href="/trust/research" className="underline hover:text-accent">
                methodology
              </Link>
              {' · '}
              <Link href="/curriculum" className="underline hover:text-accent">
                curriculum
              </Link>
              {' · '}
              <Link href="/chart" className="underline hover:text-accent">
                the plate
              </Link>
            </div>
            <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
          </footer>
        </div>
      )}
    </main>
  );
}
