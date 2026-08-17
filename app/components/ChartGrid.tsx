'use client';

import { useState } from 'react';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ELEMENT_COLOR, lexiconFor } from '@/lib/lexicon';

const PILLARS: Array<{ key: keyof Chart; label: string; pinyin: string }> = [
  { key: 'year', label: '年 year', pinyin: 'nián' },
  { key: 'month', label: '月 month', pinyin: 'yuè' },
  { key: 'day', label: '日 day', pinyin: 'rì' },
  { key: 'time', label: '时 hour', pinyin: 'shí' },
];

export function ChartGrid({ chart }: { chart: Chart }) {
  const [layer, setLayer] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const pillarChars = [chart.year, chart.month, chart.day, chart.time].map((p) => [p[0], p[1]] as [string, string]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-stone-500">
          四柱 sì zhù — four pillars · day master highlighted · {chart.zodiac} year ·{' '}
          {chart.hourSchool === 'solar' ? '真太阳时 solar-time school' : 'clock school'}
        </div>
        <div className="flex gap-1 text-xs">
          {['字形', '十神', '藏干'].map((l, i) => (
            <button
              key={l}
              onClick={() => setLayer(i)}
              className={`px-2 py-1 rounded ${layer === i ? 'bg-amber-900 text-amber-50' : 'bg-stone-100'}`}
            >
              {i === 0 ? '字形 glyphs' : i === 1 ? '十神 Ten Gods' : '藏干 hidden stems'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PILLARS.map(({ key, label, pinyin }, i) => {
          const [stem, branch] = pillarChars[i];
          const s = lexiconFor(stem);
          const b = lexiconFor(branch);
          const isDay = key === 'day';
          const shishen = chart.shishenGan[i];
          const hide = chart.hideGan[i];
          const hideShishen = chart.shishenZhi[i];
          return (
            <div key={key} className={`card p-3 text-center ${isDay ? 'ring-2 ring-amber-700' : ''}`}>
              <div className="text-xs text-stone-400">{label}</div>
              <div className="mt-1 space-y-1">
                <div
                  className="text-3xl font-bold cursor-pointer"
                  style={{ color: ELEMENT_COLOR[s.element] }}
                  onClick={() => setSelected(stem)}
                  title={`${s.pinyin} — ${s.gloss}`}
                >
                  {stem}
                </div>
                <div
                  className="text-3xl font-bold cursor-pointer"
                  style={{ color: ELEMENT_COLOR[b.element] }}
                  onClick={() => setSelected(branch)}
                  title={`${b.pinyin} — ${b.gloss}`}
                >
                  {branch}
                </div>
              </div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>{s.pinyin} {s.element}</div>
                <div>{b.pinyin} {b.element}{b.animal ? ` · ${b.animal}` : ''}</div>
              </div>
              {layer === 1 && (
                <div className="text-xs mt-1 text-amber-800 font-medium">{shishen}</div>
              )}
              {layer === 2 && (
                <div className="text-[11px] mt-1 text-stone-500">
                  {hide.map((h, j) => (
                    <span key={j} className="mr-1">
                      {h}({hideShishen[j]})
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-stone-500">
        纳音 nayin: {chart.nayin.join(' · ')} &nbsp;|&nbsp; 空亡 xún kōng: {chart.dayXun} (voids {chart.dayXunKong})
      </div>

      {selected && (
        <CharCard char={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function CharCard({ char, onClose }: { char: string; onClose: () => void }) {
  const info = lexiconFor(char);
  return (
    <div className="card mt-3 p-3 flex gap-4 items-start">
      <div className="text-5xl font-bold" style={{ color: ELEMENT_COLOR[info.element] }}>
        {char}
      </div>
      <div className="text-sm flex-1">
        <div className="font-semibold">
          {info.pinyin} · {info.element} · {info.polarity}
          {info.animal ? ` · ${info.animal}` : ''}
        </div>
        <div className="text-stone-600 mt-1">{info.gloss}</div>
      </div>
      <button onClick={onClose} className="text-stone-400 text-xs">✕ close</button>
    </div>
  );
}
