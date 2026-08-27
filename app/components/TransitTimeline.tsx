'use client';

import { useState } from 'react';
import { liunian, shishenOf, STEMS, type Chart } from '@bazilionaire/engine';
import { ClickableCJK } from './ClickableCJK';
import type { LifeEvent } from '@/lib/atlas';

/**
 * Transit timeline — 大运 dà yùn (decade pillars) with the 流年 liú nián
 * (annual transit) strip of the selected decade.
 *
 * Every marker renders from engine output. Markers show STRUCTURE
 * (合冲刑害, 冲空则实, 调候), never fortune — no lucky/unlucky coloring.
 *
 * `events` (optional, Atlas only) overlays life events onto the matching
 * transit year by date prefix — the retrospective correlation Peter's own
 * Bazi Atlas vault notes already do by hand, made queryable. Purely
 * additive: chart/page.tsx's own use of this component (no events) is
 * unaffected.
 */
export function TransitTimeline({ chart, birthYear, events }: { chart: Chart; birthYear: number; events?: LifeEvent[] }) {
  const dayun = chart.yun?.dayun;
  if (!dayun || dayun.length < 2) return null;

  const decades = dayun.slice(1); // drop the pre-起运 placeholder
  const currentYear = new Date().getFullYear();
  const defaultIdx = Math.max(
    0,
    decades.findIndex((d) => currentYear >= d.startYear && currentYear < d.startYear + 10),
  );
  const [decadeIdx, setDecadeIdx] = useState(defaultIdx < 0 ? 0 : defaultIdx);
  const decade = decades[decadeIdx];

  const dayStemIdx = STEMS.indexOf(chart.day[0] as (typeof STEMS)[number]);
  const natal = {
    dayStem: chart.day[0],
    branches: [chart.year[1], chart.month[1], chart.day[1], chart.time[1]] as [string, string, string, string],
    monthBranch: chart.month[1],
    dayXunKong: chart.dayXunKong,
  };

  const years = Array.from({ length: 10 }, (_, i) => decade.startYear + i);
  const transits = years.map((y) => liunian(y, natal));

  /** Events whose date starts with this year (YYYY-MM-DD or YYYY-MM or YYYY, all match on prefix). */
  const eventsForYear = (y: number): LifeEvent[] =>
    (events ?? []).filter((e) => e.date.startsWith(String(y)));

  return (
    <div className="card p-4">
      <div className="text-sm text-muted mb-2">
        <ClickableCJK text="大运" /> — decade pillars · select a decade, read its <ClickableCJK text="流年" />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {decades.map((d, i) => (
          <button
            key={d.startYear}
            onClick={() => setDecadeIdx(i)}
            className={`px-2 py-1 rounded text-xs ${i === decadeIdx ? 'bg-accent text-on-accent' : 'bg-surface-2'}`}
            title={`starts 虚岁 ${d.startAge} (${d.startYear})`}
          >
            {d.ganzhi}
            <span className="opacity-70 ml-1">{d.startYear}–{d.startYear + 9}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-muted mb-2">
        decade stem {decade.ganzhi[0]} reads as{' '}
        <span className="font-medium text-accent-strong">{shishenOf(dayStemIdx, STEMS.indexOf(decade.ganzhi[0] as (typeof STEMS)[number]))}</span>{' '}
        against the day master {chart.day[0]} · decade branch {decade.ganzhi[1]}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {transits.map((t) => {
          const yearEvents = eventsForYear(t.year);
          return (
          <div key={t.year} className={`card p-2 text-center ${yearEvents.length > 0 ? 'ring-1 ring-accent/50' : ''}`}>
            <div className="text-[11px] text-faint">{t.year}</div>
            <div className="text-lg font-bold">{t.ganzhi}</div>
            <div className="text-[11px] text-accent-strong">{t.shishen}</div>
            <div className="mt-1 flex flex-wrap justify-center gap-0.5 min-h-5">
              {t.interactions.map((ix, j) => (
                <span
                  key={j}
                  className="text-[10px] px-1 rounded bg-surface-2 text-body"
                  title={ix.detail}
                >
                  {ix.type}
                </span>
              ))}
              {t.chongKong.length > 0 && (
                <span
                  className="text-[10px] px-1 rounded bg-accent/15 text-accent-strong"
                  title={`冲空则实 — the clash strikes a voided branch (${t.chongKong.join('')}), filling it`}
                >
                  实
                </span>
              )}
              {t.tiaohouSupply && (
                <span
                  className="text-[10px] px-1 rounded bg-surface-2 text-muted"
                  title="调候 — this year supplies the chart's seasonal need"
                >
                  ●
                </span>
              )}
            </div>
            {yearEvents.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {yearEvents.map((e) => (
                  <div key={e.id} className="text-[10px] px-1 rounded bg-accent/15 text-accent-strong truncate" title={e.notes || e.label}>
                    {e.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted leading-relaxed">
        <span className="font-medium">Markers show structure, never fortune:</span>{' '}
        <ClickableCJK text="合" /> six-harmony pair · <ClickableCJK text="三合" /> three-harmony group ·{' '}
        <ClickableCJK text="半合" /> half harmony · <ClickableCJK text="冲" /> clash ·{' '}
        <ClickableCJK text="刑" /> punishment (90° leg of a <ClickableCJK text="三刑" /> triangle) · <ClickableCJK text="害" /> harm ·{' '}
        <ClickableCJK text="实" /> — <ClickableCJK text="冲空则实" />, a clash filling a voided branch · ●{' '}
        <ClickableCJK text="调候" /> — supplies the seasonal need.
        <div className="mt-1 italic">
          the chart is a map, not a sentence — <ClickableCJK text="善人不为命所缚" />:
          the good are not bound by fate
        </div>
      </div>
    </div>
  );
}
