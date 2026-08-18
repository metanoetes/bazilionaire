'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ChartGrid } from '@/components/ChartGrid';
import { RebirthSlot } from '@/components/RebirthSlot';
import { TransitTimeline } from '@/components/TransitTimeline';
import { HehunPanel } from '@/components/HehunPanel';

export default function Home() {
  const [birth, setBirth] = useState({
    year: 1992, month: 1, day: 24, hour: 10, minute: 0,
    lon: -95.36, tz: -6, gender: 'male' as 'male' | 'female',
    hourSchool: 'clock' as 'clock' | 'solar',
  });
  const [submitted, setSubmitted] = useState(false);

  const chart: Chart | null = useMemo(() => {
    if (!submitted) return null;
    return computeChart(
      birth.year, birth.month, birth.day, birth.hour, birth.minute,
      birth.hourSchool === 'solar' ? { lonDeg: birth.lon, tzHours: birth.tz } : undefined,
      birth.gender === 'male' ? 1 : 0,
    );
  }, [submitted, birth]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-amber-950">bazilionaire</h1>
        <p className="text-sm text-stone-500 mt-1">
          八字 bā zì — eight characters · a free, open-source learning center ·{' '}
          <Link href="/curriculum" className="underline hover:text-amber-900">
            课程 curriculum
          </Link>{' '}
          · <span className="italic">read the map, follow the Lion</span> (Rev 5:5)
        </p>
      </header>

      <form
        className="card p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        {(
          [
            ['year', 'year', birth.year],
            ['month', 'month', birth.month],
            ['day', 'day', birth.day],
            ['hour', 'hour', birth.hour],
            ['minute', 'minute', birth.minute],
          ] as const
        ).map(([key, label, value]) => (
          <label key={key} className="text-sm">
            <span className="text-stone-500 block">{label}</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setBirth({ ...birth, [key]: Number(e.target.value) })}
              className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
              required
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="text-stone-500 block">longitude (east +)</span>
          <input
            type="number"
            step="0.01"
            value={birth.lon}
            onChange={(e) => setBirth({ ...birth, lon: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
          />
        </label>
        <label className="text-sm">
          <span className="text-stone-500 block">UTC offset (hours)</span>
          <input
            type="number"
            step="1"
            value={birth.tz}
            onChange={(e) => setBirth({ ...birth, tz: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
          />
        </label>
        <label className="text-sm">
          <span className="text-stone-500 block">gender</span>
          <select
            value={birth.gender}
            onChange={(e) => setBirth({ ...birth, gender: e.target.value as 'male' | 'female' })}
            className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
          >
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-stone-500 block">hour school</span>
          <select
            value={birth.hourSchool}
            onChange={(e) => setBirth({ ...birth, hourSchool: e.target.value as 'clock' | 'solar' })}
            className="w-full border border-stone-300 rounded px-2 py-1 bg-white"
          >
            <option value="clock">clock school</option>
            <option value="solar">真太阳时 solar-time</option>
          </select>
        </label>
        <button
          type="submit"
          className="col-span-2 sm:col-span-4 bg-amber-900 text-amber-50 rounded py-2 font-medium"
        >
          Compute — all computation happens in your browser; nothing is sent anywhere
        </button>
      </form>

      {chart && (
        <div className="mt-6 space-y-4">
          {chart.warnings.length > 0 && (
            <div className="card p-3 text-sm text-amber-900 border-amber-700/40">
              {chart.warnings.map((w) => (
                <div key={w}>⚠ {w}</div>
              ))}
            </div>
          )}
          <ChartGrid chart={chart} />
          <RebirthSlot dayun={chart.yun?.dayun} birthYear={birth.year} />
          <TransitTimeline chart={chart} birthYear={birth.year} />
          <HehunPanel chartA={chart} genderA={birth.gender} birthYearA={birth.year} />
          <footer className="text-xs text-stone-400 text-center pt-4 space-y-1">
            <div>
              <Link href="/trust/methodology" className="underline hover:text-amber-900">methodology</Link>
              {' · '}
              <Link href="/trust/theology" className="underline hover:text-amber-900">theology</Link>
              {' · '}
              <Link href="/trust/cosmology" className="underline hover:text-amber-900">cosmology</Link>
            </div>
            <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
          </footer>
        </div>
      )}
    </main>
  );
}
