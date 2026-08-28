'use client';

/**
 * /reading — 解盘 jiě pán, "unpacking the plate."
 *
 * LAYER 1 of the interpretation surface: the computed chart put into English
 * prose, composed by template from the fact sheet (lib/factsheet.ts →
 * lib/reading.ts). No model, no network, no randomness — and the page says so
 * plainly, because "computed, not generated" has to be true on the surface
 * that most looks like generation.
 *
 * Where the chart comes from: the last research record queued in THIS browser
 * by /chart (lib/research.ts, entry-as-consent), re-computed here from its
 * birth inputs. Nothing is transmitted, no birth data touches the URL — a
 * shareable /reading link would leak the birth moment, since four pillars plus
 * the decade start years invert to a ~2-hour window.
 *
 * Phase 2 (planned, not built): an opt-in tutor that rephrases these same
 * facts on the reader's own API key, cites a fact id per sentence, and is
 * fenced visually from the computed prose. This page has to be complete and
 * useful with that layer switched off, forever.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ClickableCJK } from '@/components/ClickableCJK';
import { TutorPanel } from '@/components/TutorPanel';
import { factsheet, type Fact, type FactLayer } from '@/lib/factsheet';
import { reading } from '@/lib/reading';
import { queuedContributions, type ResearchRecord } from '@/lib/research';
import { hasReadingModel } from '@/lib/tutor';

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
  const [showFacts, setShowFacts] = useState(false);
  // Does the model reading lead? True when this browser already has a reading model
  // (Peter, 2026-08-27: "focus on readings done by deepseek"). Resolved in an effect,
  // never during render, because it reads localStorage — doing it inline would make
  // the server-rendered markup and the first client paint disagree.
  const [modelLeads, setModelLeads] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    setModelLeads(hasReadingModel());
  }, []);

  useEffect(() => {
    const queue = queuedContributions();
    setRecord(queue.length > 0 ? queue[queue.length - 1] : null);
    setYear(new Date().getFullYear());
  }, []);

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
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/chart" className="text-sm text-muted hover:text-accent">
          ← the plate
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">
          <ClickableCJK text="解盘" /> — unpacking the plate
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          The computed chart, in English. Structure translated — never applied.
        </p>
      </header>

      {modelLeads ? (
        <div className="card p-4 text-xs text-muted leading-relaxed">
          <span className="font-medium text-body">A model writes the reading below, on your own key.</span>{' '}
          It receives the computed fact sheet and nothing else — no raw birth inputs, no city — and it
          must cite a fact for every sentence. Afterwards each sentence is graded against the engine:
          uncited, fabricated and contradicted sentences are labelled as such rather than quietly
          printed. Be clear-eyed about the trade the disclosure gate spells out: the full sheet names
          your <ClickableCJK text="干支" />, and those invert back to your birth moment within about
          two hours. One click away sits the computed reading — composed by template, no model, the
          same words every time. That one is the floor; this is the fluent pass over it. Neither one
          applies your chart to your life.
        </div>
      ) : (
        <div className="card p-4 text-xs text-muted leading-relaxed">
          <span className="font-medium text-body">No model wrote a word of the reading below.</span>{' '}
          Every sentence is composed from the computed facts listed beneath it, by template, in your
          browser — the same chart yields the same words every time it is read in the same year (the
          大运 movement names the decade covering today, so that one line moves when the calendar
          does), and a test pins the composition against a golden file. A model that rephrases these
          facts more fluently sits at the bottom of the page, switched off: turning it on runs on your
          own key or your own local model, sends the computed fact sheet (which by default names your
          干支 — the gate lists exactly what leaves before anything is sent), and cites a fact for
          every sentence, with anything uncited shown to you as uncited. This page is complete
          without it.
        </div>
      )}

      {record === undefined && (
        <p className="text-sm text-muted mt-6">Looking for your last computed chart…</p>
      )}

      {record === null && (
        <div className="card p-4 mt-4">
          <p className="text-sm text-body">
            Nothing to unpack yet — no chart has been computed in this browser.
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
        <div className="mt-6 space-y-4">
          <div className="card p-3 text-xs text-muted flex flex-wrap items-baseline justify-between gap-2">
            <span>
              reading{' '}
              <span className="text-body font-medium">
                {chart.year} {chart.month} {chart.day} {chart.time}
              </span>{' '}
              · <ClickableCJK text="日主" /> {chart.day[0]} ·{' '}
              {chart.hourSchool === 'solar' ? <ClickableCJK text="真太阳时" /> : 'clock time'}
            </span>
            <Link href="/chart" className="underline hover:text-accent shrink-0">
              recompute or change the birth data →
            </Link>
          </div>

          {/* The model reading LEADS when this browser has a reading model configured
              (Peter, 2026-08-27). Without one the template 解盘 leads and the page is
              complete with no model at all — that floor does not move, and it is why
              the template is never removed, only collapsed. */}
          {modelLeads && <TutorPanel facts={facts} movements={movements} />}

          {modelLeads && (
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
          )}

          {(!modelLeads || showTemplate) &&
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

          {!modelLeads && <TutorPanel facts={facts} movements={movements} />}

          <div className="card p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-muted">
                the fact sheet — {facts.length} computed facts, every sentence above traces to one
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
