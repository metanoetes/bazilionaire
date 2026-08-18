import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata = {
  title: 'Curriculum — 八字 bā zì, ten modules | bazilionaire',
  description:
    'Learn Bazi (八字) as a language: yin-yang, five phases, stems and branches, the sexagenary cycle, four pillars, ten gods, interactions, decades and years — and the frame.',
};

export default function CurriculumPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm text-stone-500 hover:text-amber-900">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 mt-2">
          课程 curriculum <span className="text-stone-500 text-lg font-normal">kè chéng</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          ten modules — the whole system, in one reading · structure only, no predictions ·
          <span className="italic"> read the map, follow the Lion</span>
        </p>
      </header>

      <div className="space-y-6">
        {CURRICULUM.map((m) => (
          <section key={m.id} className="card p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-stone-400 font-mono">{String(m.id).padStart(2, '0')}</span>
              <h2 className="text-xl font-bold text-amber-950">
                {m.title} <span className="text-sm text-stone-500 font-normal">{m.pinyin}</span>
              </h2>
              <span className="text-sm text-stone-500">{m.subtitle}</span>
            </div>
            <p className="text-sm text-stone-700 mt-2 leading-relaxed">{m.intro}</p>

            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {m.terms.map((t) => (
                <div key={t.term + t.pinyin} className="border border-stone-200 rounded p-2">
                  <div className="text-base font-semibold text-amber-900">
                    {t.term} <span className="text-xs text-stone-500 font-normal">{t.pinyin}</span>
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">{t.gloss}</div>
                </div>
              ))}
            </div>

            <ul className="mt-3 space-y-1">
              {m.notes.map((n, i) => (
                <li key={i} className="text-xs text-stone-500 leading-relaxed">
                  · {n}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="text-xs text-stone-400 text-center pt-6">
        MIT · open source · bazilionaire.org · the chart is a map; Christ is the way
      </footer>
    </main>
  );
}
