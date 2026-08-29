import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';
import { ClickableCJK } from '@/components/ClickableCJK';

export const metadata = {
  title: '课程 (kè chéng) — 八字 (bā zì), fifteen modules to adept | bazilionaire',
  description:
    'Learn Bazi (八字) to adept depth: the vocabulary (yin-yang through interactions), the technical core (strength, pattern, favorable-god selection), named stars and pair-reading in depth, and the moving layer — plus the frame that holds it all.',
};

const PARTS: Array<{ label: string; range: [number, number]; note: string }> = [
  { label: 'foundations', range: [1, 5], note: 'polarity, phases, the two alphabets, the sexagenary clock' },
  { label: 'reading the chart', range: [6, 8], note: 'how a chart is computed, the ten relations, the branch geometry' },
  { label: 'the adept core', range: [9, 13], note: 'strength, pattern, favorable-god selection, named stars, pair reading — the technical machinery a real reader needs' },
  { label: 'the moving layer & the frame', range: [14, 15], note: 'decades, years, and the sentence that holds the whole map still' },
];

export default function CurriculumPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <Link href="/chart" className="text-sm text-muted hover:text-accent">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">
          <ClickableCJK text="课程" /> curriculum
        </h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          fifteen modules, adept depth — the full technical system, taught as if you were going to
          read charts for real: not a folk simplification, but the machinery serious readers use,
          with honest notes on where schools disagree and where the app does not yet compute what
          a book teaches. <span className="italic">read the map, follow Jesus Christ</span>
        </p>
        <p className="mt-2 text-xs text-faint">
          click any underlined Chinese term for its pinyin and gloss
        </p>
      </header>

      <div className="space-y-8">
        {PARTS.map((part) => {
          const modules = CURRICULUM.filter((m) => m.id >= part.range[0] && m.id <= part.range[1]);
          return (
            <section key={part.label}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                  {part.label}
                </h2>
                <span className="text-xs text-muted">{part.note}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {modules.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/curriculum/${m.slug}/`}
                    className="card p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-faint font-mono">{String(m.id).padStart(2, '0')}</span>
                      <span className="text-lg font-bold text-ink">{m.title}</span>
                    </div>
                    <div className="text-sm text-muted mt-1">{m.subtitle}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="text-xs text-faint text-center pt-8 space-y-1">
        <div>
          <Link href="/trust/research" className="underline hover:text-accent">methodology</Link>
        </div>
        <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
      </footer>
    </main>
  );
}
