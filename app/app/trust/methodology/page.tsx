import Link from 'next/link';

export const metadata = {
  title: 'Methodology — how the chart is computed | bazilionaire',
  description:
    'Bazilionaire computes charts from astronomy-grade math in your browser: VSOP87D solar terms, exact 节 boundaries, a pinned Python oracle, and privacy by architecture.',
};

export default function MethodologyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm text-stone-500 hover:text-amber-900">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 mt-2">
          methodology <span className="text-stone-500 text-lg font-normal">verified computation</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          computed, not generated — every number on your chart is reproducible from public math
        </p>
      </header>

      <div className="space-y-4">
        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">the engine</h2>
          <ul className="mt-2 space-y-2 text-sm text-stone-700 leading-relaxed list-disc list-inside">
            <li>
              <span className="font-medium">Day pillar</span> — a pure Julian-day count, exact and checkable by
              hand. 2000-01-01 = 戊午; that anchor calibrates every other day.
            </li>
            <li>
              <span className="font-medium">Year and month pillars</span> — the true solar-term boundaries
              (立春 for the year; the 12 节 for the months), computed with the VSOP87D planetary series,
              nutation, ΔT, and the equation of time.
            </li>
            <li>
              <span className="font-medium">Hour pillar</span> — two schools, both shown: clock time and 真太阳时
              true solar time (longitude + equation of time). No school is chosen for you silently.
            </li>
            <li>
              <span className="font-medium">Doctrine tables</span> — 十神, 藏干, 纳音, 空亡, 大运/起运, 合冲刑害,
              神煞 — pinned test-by-test against an independent Python oracle (lunar_python) in CI.
            </li>
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">how we verify</h2>
          <ul className="mt-2 space-y-2 text-sm text-stone-700 leading-relaxed list-disc list-inside">
            <li>
              <span className="font-medium">The oracle gate</span> — a Python reference implementation
              (skyfield + JPL DE421 ephemeris, lunar_python) regenerates the pinned fixtures on every CI run;
              the TypeScript engine must byte-match. The badge is the trust artifact.
            </li>
            <li>
              <span className="font-medium">Precision targets</span> — solar-term times within ±120 seconds of
              skyfield+DE421; equation of time within ±30 seconds.
            </li>
            <li>
              <span className="font-medium">Independent review</span> — every engine sprint is reviewed by a
              fresh, independent code reviewer before it is accepted; findings are fixed and pinned as
              regression tests.
            </li>
            <li>
              <span className="font-medium">Open source</span> — MIT-licensed. Anyone can rerun the corpus, the
              fixtures, and the tests. Nothing here depends on our say-so.
            </li>
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">boundary honesty</h2>
          <ul className="mt-2 space-y-2 text-sm text-stone-700 leading-relaxed list-disc list-inside">
            <li>
              A birth within <span className="font-medium">±1 minute of a 节</span> gets an explicit warning:
              the pillar may split across schools. The app says so instead of guessing.
            </li>
            <li>
              Unknown birth hour? The app supports it as a question mark — better an honest gap than a
              fabricated pillar.
            </li>
            <li>
              Both hour schools (clock / true solar) are always displayed with their school named.
            </li>
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">privacy by architecture, with a door you open</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            All computation happens <span className="font-medium">in your browser</span>. Birth data never
            leaves your device — not by policy, by construction. There is no server that could leak what the
            server never receives.
          </p>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            The research commons is an explicit, opt-in door: if you choose to contribute, only{' '}
            <span className="font-medium">derived features</span> — the pillars, relations, and tables the
            chart computes — are queued for the commons. Never birth date, time, or place; never name or
            email; nothing that identifies anyone. Contributions are deletable and held under covenant, and
            nothing is transmitted until the commons endpoint ships.
          </p>
        </section>

        <section className="card p-4 text-sm text-stone-600 leading-relaxed">
          <span className="font-medium">What the math cannot do:</span> the engine computes positions, pillars,
          and relations — a map. It computes no meaning, no fortune, no verdict. Where the map stops, reading
          begins — and reading is yours, not the machine&apos;s.
        </section>
      </div>

      <footer className="text-xs text-stone-400 text-center pt-6">
        MIT · open source · bazilionaire.org · the chart is a map; Christ is the way
      </footer>
    </main>
  );
}
