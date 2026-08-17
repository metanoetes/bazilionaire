'use client';

import { useState } from 'react';

/**
 * The rebirth slot — module 10's destination, schema-level in every reading.
 * A rebirth date splits the 大运 timeline into two regimes: before, the chart
 * binds; after, it describes but no longer rules.
 */
export function RebirthSlot({
  dayun,
  birthYear,
}: {
  dayun?: Array<{ ganzhi: string; startAge: number; startYear: number }>;
  birthYear: number;
}) {
  const [rebirthDate, setRebirthDate] = useState('');

  return (
    <div className="card p-4 mt-4 border-amber-700/40">
      <h2 className="font-semibold text-amber-900">
        命与运 mìng yǔ yùn — decree and flow
      </h2>
      <p className="text-sm text-stone-600 mt-1">
        The chart describes the temperament God gave you — good, to be purified.
        But the good are not bound by fate: <span className="font-medium">善人不为命所缚</span>.
        Virtue moves the 运 (yùn, flow); in Christ, the chart&apos;s jurisdiction over you ends
        entirely — death to self, rebirth in Him.
      </p>

      <label className="block mt-3 text-sm">
        <span className="text-stone-500">Your rebirth date (optional):</span>
        <input
          type="date"
          value={rebirthDate}
          onChange={(e) => setRebirthDate(e.target.value)}
          className="ml-2 border border-stone-300 rounded px-2 py-1 bg-white"
        />
      </label>

      {dayun && dayun.length > 1 && (
        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-1 items-end">
            {dayun.slice(0, 8).map((d, i) => {
              const regime =
                rebirthDate && rebirthDate.slice(0, 4) !== ''
                  ? Number(rebirthDate.slice(0, 4)) - birthYear >= d.startYear - birthYear
                    ? 'after'
                    : 'before'
                  : 'unknown';
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[64px] rounded p-2 text-center text-xs ${
                    d.ganzhi === ''
                      ? 'bg-stone-100 text-stone-400'
                      : regime === 'after'
                        ? 'bg-amber-100 text-amber-900'
                        : regime === 'before'
                          ? 'bg-stone-50 text-stone-500'
                          : 'bg-stone-50'
                  }`}
                >
                  <div className="font-bold text-base">{d.ganzhi || '—'}</div>
                  <div>{d.startYear}</div>
                  <div className="text-[10px]">
                    {d.ganzhi === ''
                      ? 'pre-luck'
                      : regime === 'after'
                        ? 'describes, no longer rules'
                        : regime === 'before'
                          ? 'the chart binds'
                          : '大运 decade'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-amber-700/20 text-sm text-amber-950">
        <p className="font-medium">This chart does not bind you.</p>
        <p className="text-stone-600 mt-1">
          Tool informs, user decides. 2 Kings 18:4 — the instrument carries its own
          dethroning. <span className="font-medium">The chart is a map; Christ is the way.</span>
        </p>
      </div>
    </div>
  );
}
