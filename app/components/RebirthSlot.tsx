'use client';

import { useState } from 'react';
import { ClickableCJK } from './ClickableCJK';

/**
 * The rebirth slot — module 10's destination, schema-level in every reading.
 * A rebirth date marks the 大运 timeline at that point: the same weather still
 * falls after it, but it falls on a new creation.
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
    <div className="card p-4 mt-4 border-accent/40">
      <h2 className="font-semibold text-accent-strong">
        <ClickableCJK text="命与运" /> — decree and flow
      </h2>
      <p className="text-sm text-muted mt-1">
        The chart describes the temperament God gave you — good, to be purified.
        But the good are not bound by fate: <span className="font-medium"><ClickableCJK text="善人不为命所缚" /></span>.{' '}
        Virtue moves the <ClickableCJK text="运" /> — flow; in Christ, the chart&apos;s jurisdiction over you ends
        entirely — death to self, rebirth in Him.
      </p>

      <label className="block mt-3 text-sm">
        <span className="text-muted">Your rebirth date (optional):</span>
        <input
          type="date"
          value={rebirthDate}
          onChange={(e) => setRebirthDate(e.target.value)}
          className="ml-2 border border-line rounded px-2 py-1 bg-surface-2 text-ink"
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
                      ? 'bg-surface-2 text-faint'
                      : regime === 'after'
                        ? 'bg-accent/15 text-accent-strong'
                        : regime === 'before'
                          ? 'bg-surface-2 text-muted'
                          : 'bg-surface-2'
                  }`}
                >
                  <div className="font-bold text-base">{d.ganzhi || '—'}</div>
                  <div>{d.startYear}</div>
                  <div className="text-[10px]">
                    {d.ganzhi === ''
                      ? 'pre-luck'
                      : regime === 'after'
                        ? 'after rebirth'
                        : regime === 'before'
                          ? 'before rebirth'
                          : <><ClickableCJK text="大运" /> decade</>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-accent/25 text-sm text-ink">
        <p className="font-medium">This chart does not bind you.</p>
        <p className="text-muted mt-1">
          Tool informs, user decides. 2 Kings 18:4 — the instrument carries its own
          dethroning. <span className="font-medium">The chart is a map; Christ is the way.</span>
        </p>
      </div>
    </div>
  );
}
