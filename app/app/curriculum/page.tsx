import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata = {
  title: 'Curriculum — 八字 bā zì, ten modules in depth | bazilionaire',
  description:
    'Learn Bazi (八字) as a language, in depth: yin-yang, five phases, stems and branches, the sexagenary cycle and nayin, four pillars, ten gods, interactions, decades and years — and the frame.',
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
          ten modules, in depth — the whole system, one reading · structure only, no predictions ·
          <span className="italic"> read the map, follow the Lion</span>
        </p>
        <div className="mt-2 text-xs text-stone-500 space-y-0.5">
          <div>01 阴阳 yīn yáng · 02 五行 wǔ xíng · 03 天干 tiān gān · 04 地支 dì zhī · 05 六十甲子 liùshí jiǎzǐ</div>
          <div>06 四柱 sì zhù · 07 十神 shí shén · 08 合冲刑害 hé chōng xíng hài · 09 大运流年 dà yùn liú nián · 10 the frame</div>
        </div>
      </header>

      <div className="space-y-8">
        {CURRICULUM.map((m) => (
          <section key={m.id} className="card p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-xs text-stone-400 font-mono">{String(m.id).padStart(2, '0')}</span>
              <h2 className="text-xl font-bold text-amber-950">
                {m.title} <span className="text-sm text-stone-500 font-normal">{m.pinyin}</span>
              </h2>
              <span className="text-sm text-stone-500">{m.subtitle}</span>
            </div>

            <div className="mt-3 space-y-3">
              {m.intro.map((p, i) => (
                <p key={i} className="text-sm text-stone-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-4 space-y-5">
              {m.sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="text-base font-semibold text-amber-950">
                    {s.heading}
                    {s.chinese && (
                      <span className="text-sm text-stone-500 font-normal"> — {s.chinese} </span>
                    )}
                    {s.pinyin && <span className="text-sm text-stone-400 font-normal">{s.pinyin}</span>}
                  </h3>

                  <div className="mt-2 space-y-2.5">
                    {s.paragraphs.map((p, i) => (
                      <p key={i} className="text-sm text-stone-700 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {s.table && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left text-xs text-stone-500 font-medium border-b border-stone-300 py-1 pr-4">
                              {s.table.head[0]}
                            </th>
                            <th className="text-left text-xs text-stone-500 font-medium border-b border-stone-300 py-1">
                              {s.table.head[1]}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.table.rows.map(([a, b]) => (
                            <tr key={a + b} className="border-b border-stone-100">
                              <td className="py-1.5 pr-4 text-amber-950 font-medium whitespace-nowrap">{a}</td>
                              <td className="py-1.5 text-stone-700">{b}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {s.terms && s.terms.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {s.terms.map((t) => (
                        <div key={t.term + t.pinyin} className="border border-stone-200 rounded p-2">
                          <div className="text-base font-semibold text-amber-900">
                            {t.term} <span className="text-xs text-stone-500 font-normal">{t.pinyin}</span>
                          </div>
                          <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">{t.gloss}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="text-xs text-stone-400 text-center pt-6 space-y-1">
        <div>
          <Link href="/trust/methodology" className="underline hover:text-amber-900">methodology</Link>
          {' · '}
          <Link href="/trust/theology" className="underline hover:text-amber-900">theology</Link>
          {' · '}
          <Link href="/trust/cosmology" className="underline hover:text-amber-900">cosmology</Link>
        </div>
        <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
      </footer>
    </main>
  );
}
