'use client';

import { useState } from 'react';
import { computeChart, hehun, type Chart, type PersonChart } from '@bazilionaire/engine';

/**
 * 合婚 hé hūn — pair reading. The engine computes two layers only:
 *   1. day-master 十神 relations (each stem read as the other's 财/官)
 *   2. the cross-chart branch matrix (合冲刑害, 冲空则实, 调候)
 * The third layer — the human one — always stays with the reader.
 * No verdict is ever produced about two people.
 */
export function HehunPanel({
  chartA,
  genderA,
  birthYearA,
}: {
  chartA: Chart;
  genderA: 'male' | 'female';
  birthYearA: number;
}) {
  const [b, setB] = useState({
    year: birthYearA, month: 1, day: 1, hour: 12, minute: 0,
    gender: 'male' as 'male' | 'female',
  });
  const [submitted, setSubmitted] = useState(false);

  const personA: PersonChart = {
    dayStem: chartA.day[0],
    branches: [chartA.year[1], chartA.month[1], chartA.day[1], chartA.time[1]],
    monthBranch: chartA.month[1],
    dayXunKong: chartA.dayXunKong,
    gender: genderA,
  };

  const report = submitted
    ? hehun(personA, (() => {
        const cB = computeChart(b.year, b.month, b.day, b.hour, b.minute, undefined, b.gender === 'male' ? 1 : 0);
        return {
          dayStem: cB.day[0],
          branches: [cB.year[1], cB.month[1], cB.day[1], cB.time[1]] as [string, string, string, string],
          monthBranch: cB.month[1],
          dayXunKong: cB.dayXunKong,
          gender: b.gender,
        };
      })())
    : null;

  const counts = report
    ? report.interactions.reduce<Record<string, number>>((acc, ix) => {
        acc[ix.type] = (acc[ix.type] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <div className="card p-4">
      <div className="text-sm text-stone-500 mb-2">
        合婚 hé hūn — pair reading · two computed layers: day-master stars and the branch matrix
      </div>

      <form
        className="grid grid-cols-3 sm:grid-cols-7 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        {(
          [
            ['year', 'year', b.year],
            ['month', 'month', b.month],
            ['day', 'day', b.day],
            ['hour', 'hour', b.hour],
            ['minute', 'minute', b.minute],
          ] as const
        ).map(([key, label, value]) => (
          <label key={key} className="text-sm">
            <span className="text-stone-500 block text-[11px]">{label} of the other person</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setB({ ...b, [key]: Number(e.target.value) })}
              className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
              required
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="text-stone-500 block text-[11px]">their gender</span>
          <select
            value={b.gender}
            onChange={(e) => setB({ ...b, gender: e.target.value as 'male' | 'female' })}
            className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
          >
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
        <button type="submit" className="self-end bg-amber-900 text-amber-50 rounded py-1.5 px-2 text-sm font-medium">
          Compare
        </button>
      </form>

      {report && (
        <div className="mt-3 space-y-3">
          <div className="card p-3">
            <div className="text-xs font-semibold text-stone-600 mb-1">
              Layer 1 — day-master relations (日主十神)
            </div>
            <div className="text-sm">
              A&apos;s day stem {personA.dayStem} reads as B&apos;s{' '}
              <span className="font-medium text-amber-900">{report.aStemInB}</span> · B&apos;s day stem reads as
              A&apos;s <span className="font-medium text-amber-900">{report.bStemInA}</span>
            </div>
            <div className="text-sm mt-1">
              marital-star checks:{' '}
              <span className={report.bIsMaritalStarForA ? 'text-amber-900 font-medium' : 'text-stone-500'}>
                B is A&apos;s {genderA === 'male' ? '财 wife-star' : '官 husband-star'}
                {report.bIsMaritalStarForA ? ' ✓' : ' — no'}
              </span>
              {' · '}
              <span className={report.aIsMaritalStarForB ? 'text-amber-900 font-medium' : 'text-stone-500'}>
                A is B&apos;s {b.gender === 'male' ? '财 wife-star' : '官 husband-star'}
                {report.aIsMaritalStarForB ? ' ✓' : ' — no'}
              </span>
            </div>
            {report.mutualMaritalStars && (
              <div className="text-sm mt-1 font-medium text-amber-900">
                男财女官 nán cái nǚ guān — mutual marital stars: the strongest structural signature
              </div>
            )}
          </div>

          <div className="card p-3">
            <div className="text-xs font-semibold text-stone-600 mb-1">
              Layer 2 — branch matrix (cross-chart 合冲刑害)
            </div>
            <div className="text-sm">
              {Object.keys(counts).length === 0 ? (
                <span className="text-stone-500">no interactions between the two charts&apos; branches</span>
              ) : (
                Object.entries(counts).map(([type, n]) => (
                  <span key={type} className="mr-2">
                    {type} ×{n}
                  </span>
                ))
              )}
            </div>
            {report.interactions.length > 0 && (
              <div className="text-xs text-stone-500 mt-1">
                {report.interactions.map((ix) => ix.detail).join(' · ')}
              </div>
            )}
            {report.chongKong.length > 0 && (
              <div className="text-sm mt-1">
                <span className="font-medium">冲空则实 chōng kōng zé shí:</span>{' '}
                {report.chongKong.join(' · ')} — a clash striking a voided branch, filling it
              </div>
            )}
            <div className="text-sm mt-1">
              调候 tiáo hòu:{' '}
              <span className={report.aSuppliesB ? 'text-amber-900 font-medium' : 'text-stone-500'}>
                A supplies B&apos;s climate need{report.aSuppliesB ? ' ✓' : ' — no'}
              </span>
              {' · '}
              <span className={report.bSuppliesA ? 'text-amber-900 font-medium' : 'text-stone-500'}>
                B supplies A&apos;s climate need{report.bSuppliesA ? ' ✓' : ' — no'}
              </span>
            </div>
          </div>

          <div className="card p-3 text-xs text-stone-500 leading-relaxed">
            <span className="font-medium">Layer 3 is yours.</span> The engine computes structure only — it never
            produces a verdict about two people. 合婚 maps the terrain of a relationship; the people in it decide
            the road. <span className="italic">the chart is a map, not a sentence — 善人不为命所缚 shàn rén bù wéi mìng suǒ fù</span>
          </div>
        </div>
      )}
    </div>
  );
}
