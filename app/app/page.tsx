'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ChartGrid } from '@/components/ChartGrid';
import { RebirthSlot } from '@/components/RebirthSlot';
import { TransitTimeline } from '@/components/TransitTimeline';
import { HehunPanel } from '@/components/HehunPanel';
import { queueContribution, queuedContributions, tier0Payload } from '@/lib/research';

type BirthState = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lon: number;
  tz: number;
  gender: 'male' | 'female';
  hourSchool: 'clock' | 'solar';
};

/** A plausible, non-personal random birth for the intake defaults. */
function randomBirth(): BirthState {
  const year = 1940 + Math.floor(Math.random() * 81); // 1940–2020
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const lon = Math.round((Math.random() * 360 - 180) * 100) / 100;
  const tz = Math.max(-12, Math.min(12, Math.round(lon / 15))); // plausible tz for the longitude
  const gender = Math.random() < 0.5 ? ('male' as const) : ('female' as const);
  return { year, month, day, hour, minute, lon, tz, gender, hourSchool: 'clock' as const };
}

// Hydration-safe: SSR renders this neutral sentinel; the random intake is
// swapped in once on the client, so the prerendered HTML and the client DOM agree.
const SENTINEL: BirthState = {
  year: 2000, month: 1, day: 1, hour: 12, minute: 0,
  lon: 0, tz: 0, gender: 'male', hourSchool: 'clock',
};

export default function Home() {
  const [birth, setBirth] = useState<BirthState>(SENTINEL);
  const [submitted, setSubmitted] = useState(false);
  const [contribute, setContribute] = useState(false);
  const [contributed, setContributed] = useState(0);

  useEffect(() => {
    setBirth(randomBirth());
  }, []);

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
          const c = computeChart(
            birth.year, birth.month, birth.day, birth.hour, birth.minute,
            birth.hourSchool === 'solar' ? { lonDeg: birth.lon, tzHours: birth.tz } : undefined,
            birth.gender === 'male' ? 1 : 0,
          );
          if (contribute) {
            queueContribution(tier0Payload(c));
            setContributed(queuedContributions().length);
          }
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
          Compute — all computation happens in your browser
        </button>
        <label className="col-span-2 sm:col-span-4 flex items-start gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            checked={contribute}
            onChange={(e) => setContribute(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Contribute this chart&apos;s <span className="font-medium">derived features only</span> to the
            research commons (pillars, relations, tables —{' '}
            <span className="font-medium">never birth data, never name or email</span>). Opt-in, deletable,
            held under covenant.
          </span>
        </label>
      </form>

      {contributed > 0 && (
        <div className="card p-3 mt-3 text-xs text-stone-600 flex items-center justify-between gap-3">
          <span>
            {contributed} chart{contributed === 1 ? '' : 's'} contributed (derived features only). Submission
            to the commons activates when its endpoint opens; your contributions live only in this
            browser&apos;s local queue until then.
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('bazilionaire.contributions.v1');
              setContributed(0);
            }}
            className="text-stone-500 underline hover:text-amber-900 shrink-0"
          >
            clear my contributions
          </button>
        </div>
      )}

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
