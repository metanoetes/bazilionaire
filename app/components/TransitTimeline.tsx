'use client';

import { useState } from 'react';
import { liunian, shishenOf, STEMS, type Chart } from '@bazilionaire/engine';

/**
 * Transit timeline — 大运 dà yùn (decade pillars) with the 流年 liú nián
 * (annual transit) strip of the selected decade.
 *
 * Every marker renders from engine output. Markers show STRUCTURE
 * (合冲刑害, 冲空则实, 调候), never fortune — no lucky/unlucky coloring.
 */
export function TransitTimeline({ chart, birthYear }: { chart: Chart; birthYear: number }) {
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

  return (
    <div className="card p-4">
      <div className="text-sm text-stone-500 mb-2">
        大运 dà yùn — decade pillars · select a decade, read its 流年 liú nián
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {decades.map((d, i) => (
          <button
            key={d.startYear}
            onClick={() => setDecadeIdx(i)}
            className={`px-2 py-1 rounded text-xs ${i === decadeIdx ? 'bg-amber-900 text-amber-50' : 'bg-stone-100'}`}
            title={`starts 虚岁 ${d.startAge} (${d.startYear})`}
          >
            {d.ganzhi}
            <span className="opacity-70 ml-1">{d.startYear}–{d.startYear + 9}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-stone-500 mb-2">
        decade stem {decade.ganzhi[0]} reads as{' '}
        <span className="font-medium text-amber-900">{shishenOf(dayStemIdx, STEMS.indexOf(decade.ganzhi[0] as (typeof STEMS)[number]))}</span>{' '}
        against the day master {chart.day[0]} · decade branch {decade.ganzhi[1]}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {transits.map((t) => (
          <div key={t.year} className="card p-2 text-center">
            <div className="text-[11px] text-stone-400">{t.year}</div>
            <div className="text-lg font-bold">{t.ganzhi}</div>
            <div className="text-[11px] text-amber-800">{t.shishen}</div>
            <div className="mt-1 flex flex-wrap justify-center gap-0.5 min-h-5">
              {t.interactions.map((ix, j) => (
                <span
                  key={j}
                  className="text-[10px] px-1 rounded bg-stone-100 text-stone-700"
                  title={ix.detail}
                >
                  {ix.type}
                </span>
              ))}
              {t.chongKong.length > 0 && (
                <span
                  className="text-[10px] px-1 rounded bg-amber-100 text-amber-900"
                  title={`冲空则实 chōng kōng zé shí — the clash strikes a voided branch (${t.chongKong.join('')}), filling it`}
                >
                  实
                </span>
              )}
              {t.tiaohouSupply && (
                <span
                  className="text-[10px] px-1 rounded bg-stone-100 text-stone-600"
                  title="调候 tiáo hòu — this year supplies the chart's seasonal need"
                >
                  ●
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-stone-500 leading-relaxed">
        <span className="font-medium">Markers show structure, never fortune:</span>{' '}
        合 hé six-harmony pair · 三合 sān hé three-harmony group · 半合 bàn hé half harmony ·
        冲 chōng clash · 刑 xíng punishment (90° leg of a 三刑 triangle) · 害 hài harm ·
        实 冲空则实 chōng kōng zé shí — a clash filling a voided branch · ● 调候 tiáo hòu — supplies the seasonal need.
        <div className="mt-1 italic">
          the chart is a map, not a sentence — 善人不为命所缚 shàn rén bù wéi mìng suǒ fù:
          the good are not bound by fate
        </div>
      </div>
    </div>
  );
}
