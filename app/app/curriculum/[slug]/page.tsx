import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CURRICULUM, moduleBySlug } from '@/lib/curriculum';
import { ClickableCJK } from '@/components/ClickableCJK';

export function generateStaticParams() {
  return CURRICULUM.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = moduleBySlug(slug);
  if (!m) return { title: 'Module not found | bazilionaire' };
  return {
    title: `${String(m.id).padStart(2, '0')} ${m.title} (${m.pinyin}) — ${m.subtitle} | bazilionaire curriculum`,
    description: m.intro[0] ?? m.subtitle,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = moduleBySlug(slug);
  if (!m) notFound();

  const idx = CURRICULUM.findIndex((mm) => mm.slug === m.slug);
  const prev = idx > 0 ? CURRICULUM[idx - 1] : null;
  const next = idx < CURRICULUM.length - 1 ? CURRICULUM[idx + 1] : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap text-sm">
          <Link href="/curriculum" className="text-muted hover:text-accent">
            ← all modules
          </Link>
          <Link href="/chart" className="text-muted hover:text-accent">
            back to the chart →
          </Link>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap mt-3">
          <span className="text-xs text-faint font-mono">{String(m.id).padStart(2, '0')} / 15</span>
          <h1 className="text-2xl font-bold text-ink">
            <ClickableCJK text={m.title} />
          </h1>
        </div>
        <p className="text-sm text-muted mt-1">{m.subtitle}</p>
      </header>

      <div className="space-y-3 mb-6">
        {m.intro.map((p, i) => (
          <p key={i} className="text-sm text-body leading-relaxed">
            <ClickableCJK text={p} />
          </p>
        ))}
      </div>

      <div className="space-y-8">
        {m.sections.map((s) => (
          <section key={s.heading} className="card p-5">
            <h2 className="text-base font-semibold text-ink">
              {s.heading}
              {s.chinese && (
                <span className="text-sm text-muted font-normal">
                  {' — '}
                  <ClickableCJK text={s.chinese} />
                </span>
              )}
            </h2>

            <div className="mt-3 space-y-2.5">
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-body leading-relaxed">
                  <ClickableCJK text={p} />
                </p>
              ))}
            </div>

            {s.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-muted font-medium border-b border-line py-1 pr-4">
                        {s.table.head[0]}
                      </th>
                      <th className="text-left text-xs text-muted font-medium border-b border-line py-1">
                        {s.table.head[1]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map(([a, b]) => (
                      <tr key={a + b} className="border-b border-line-soft">
                        <td className="py-1.5 pr-4 text-ink font-medium whitespace-nowrap">
                          <ClickableCJK text={a} />
                        </td>
                        <td className="py-1.5 text-body">
                          <ClickableCJK text={b} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {s.terms && s.terms.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                {s.terms.map((t) => (
                  <div key={t.term + t.pinyin} className="border border-line-soft rounded p-2">
                    <div className="text-base font-semibold text-accent-strong">
                      <ClickableCJK text={t.term} />
                    </div>
                    <div className="text-xs text-muted mt-0.5 leading-relaxed">{t.gloss}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <nav className="mt-8 grid grid-cols-2 gap-3 text-sm">
        <div>
          {prev && (
            <Link href={`/curriculum/${prev.slug}/`} className="card p-3 block hover:border-accent/50">
              <div className="text-xs text-faint">← {String(prev.id).padStart(2, '0')}</div>
              <div className="text-ink font-medium">
                {prev.title}
              </div>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link href={`/curriculum/${next.slug}/`} className="card p-3 block hover:border-accent/50">
              <div className="text-xs text-faint">{String(next.id).padStart(2, '0')} →</div>
              <div className="text-ink font-medium">
                {next.title}
              </div>
            </Link>
          )}
        </div>
      </nav>

      <footer className="text-xs text-faint text-center pt-8 space-y-1">
        <div>
          <Link href="/trust/research" className="underline hover:text-accent">methodology</Link>
        </div>
        <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
      </footer>
    </main>
  );
}
