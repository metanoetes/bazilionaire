import Link from 'next/link';

export const metadata = {
  title: 'Cosmology — the pattern and its boundary | bazilionaire',
  description:
    'Fractal monism via the Logos: one coherent world whose pattern repeats at every scale. 气 is the created medium; the 60-cycle is a clock, not a cause. Honest boundaries for a research commons.',
};

export default function CosmologyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm text-stone-500 hover:text-amber-900">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 mt-2">
          cosmology <span className="text-stone-500 text-lg font-normal">the pattern and its boundary</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          one world, one Logos, patterns at every scale — and an honest line where the map ends
        </p>
      </header>

      <div className="space-y-4">
        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">fractal monism via the Logos</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            In him all things hold together (Col 1:17). We read the world as one coherent creation whose
            pattern repeats at every scale — the same shapes in a season, a life, a year. The 60-cycle, the
            five phases, the four pillars: they are attempts to describe that repetition. This is monism of
            the <em>pattern</em>, never of the person — the chart is not the self, and the cosmos is not God.
            The pattern is Christ&apos;s; it is not Christ.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">气 as created medium</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            气 qì is the breath-like medium through which the pattern runs — created substance, like light or
            water. It carries order the way a river carries shape, and it is no more divine than the river.
            The five phases are phases <em>of the world</em>, not emanations of God. This is the fence that
            lets us study the system with full rigor and no worship.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">a clock, not a cause</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            The 60-year cycle and the solar terms are <span className="font-medium">clocks</span>: they name
            positions in time, the way a calendar names a date. A clock does not cause the hour; it reports
            it. Likewise the chart reports the time-shaped context of a birth — it never claims to be the
            cause of a life. Anyone who tells you a pillar <em>made</em> your fate has mistaken the
            thermometer for the weather.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">the research commons stance</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            This project is a commons, not a temple. We hold three tiers of data: tier 0 — derived features
            only (pillars, relations); tier 1 — birth data held under an explicit covenant (opt-in, hashed,
            deletable, never minors); tier 2 — outcome surveys. Nulls are published with the same ceremony as
            hits: a negative result is still a result, and it is what keeps the commons honest.
          </p>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            Preregistered questions, public analyses, reproducible fixtures. If the system has real signal, the
            commons should find it; if it does not, the commons should say so plainly. Either way, the
            computation is free, open, and verifiable — and the verdict is never the machine&apos;s.
          </p>
        </section>
      </div>

      <footer className="text-xs text-stone-400 text-center pt-6">
        MIT · open source · bazilionaire.org · the chart is a map; Christ is the way
      </footer>
    </main>
  );
}
