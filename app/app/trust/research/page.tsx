import Link from 'next/link';
import { ClickableCJK } from '@/components/ClickableCJK';
import { COMMONS_DISCLOSURE } from '@/lib/research';

export const metadata = {
  title: 'Research — computation vs. interpretation | bazilionaire',
  description:
    'Bazilionaire computes charts from astronomy-grade math in your browser — that part is verified. Whether the interpretations correspond to anything real is an open question this project refuses to paper over. Entering birth data is consent to the research commons.',
};

export default function ResearchPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/chart" className="text-sm text-muted hover:text-accent">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">
          research <span className="text-muted text-lg font-normal">what&apos;s verified, and what isn&apos;t</span>
        </h1>
        <p className="text-sm text-muted mt-1">
          the math is checked; the interpretations are an open question
        </p>
      </header>

      <div className="space-y-4">
        {/* ---- §1: methodology, ported verbatim as the first section ---- */}
        <section className="card p-4">
          <h2 className="text-lg font-bold text-ink">1 · how the chart is computed</h2>
          <p className="text-sm text-muted mt-1 mb-3">
            computed, not generated — every number on your chart is reproducible from public math
          </p>

          <h3 className="text-base font-semibold text-ink">the engine</h3>
          <ul className="mt-2 space-y-2 text-sm text-body leading-relaxed list-disc list-inside">
            <li>
              <span className="font-medium">Day pillar</span> — a pure Julian-day count, exact and checkable by
              hand. 2000-01-01 = <ClickableCJK text="戊午" />; that anchor calibrates every other day.
            </li>
            <li>
              <span className="font-medium">Year and month pillars</span> — the true solar-term boundaries
              (<ClickableCJK text="立春" /> for the year; the 12 <ClickableCJK text="节" /> for the months), computed with the VSOP87D planetary series,
              nutation, ΔT, and the equation of time.
            </li>
            <li>
              <span className="font-medium">Hour pillar</span> — two schools, both shown: clock time and <ClickableCJK text="真太阳时" />{' '}
              true solar time (longitude + equation of time). No school is chosen for you silently.
            </li>
            <li>
              <span className="font-medium">Doctrine tables</span> — <ClickableCJK text="十神" />, <ClickableCJK text="藏干" />, <ClickableCJK text="纳音" />,{' '}
              <ClickableCJK text="空亡" />, <ClickableCJK text="大运" /> / <ClickableCJK text="起运" />, <ClickableCJK text="合冲刑害" />, <ClickableCJK text="神煞" />, <ClickableCJK text="十二长生" /> — pinned
              test-by-test against an independent Python oracle (lunar_python) in CI.
            </li>
            <li>
              <span className="font-medium">强弱 / 格局 / 用神</span> — day-master strength (the four-factor
              method), pattern classification (the eight regular patterns plus 建禄格/羊刃格 and{' '}
              <ClickableCJK text="从格" />/<ClickableCJK text="化气格" /> candidacy), and the favorable god by
              all five classical methods. Every factor and every method&apos;s reasoning is shown — a
              documented, inspectable heuristic synthesis of doctrine the tradition itself never reduces to
              one formula, never a bare verdict. <ClickableCJK text="从格" /> and <ClickableCJK text="化气格" />{' '}
              render as flagged candidates with their evidence, not silent overrides — the tradition&apos;s
              most argued-over calls stay visibly contestable.
            </li>
          </ul>

          <h3 className="text-base font-semibold text-ink mt-4">how we verify</h3>
          <ul className="mt-2 space-y-2 text-sm text-body leading-relaxed list-disc list-inside">
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

          <h3 className="text-base font-semibold text-ink mt-4">boundary honesty</h3>
          <ul className="mt-2 space-y-2 text-sm text-body leading-relaxed list-disc list-inside">
            <li>
              A birth within <span className="font-medium">±1 minute of a <ClickableCJK text="节" /></span> gets an explicit warning:
              the pillar may split across schools. The app says so instead of guessing.
            </li>
            <li>
              Unknown birth hour? The app supports it as a question mark — better an honest gap than a
              fabricated pillar.
            </li>
            <li>
              Both hour schools (clock / true solar) are always displayed with their school named.
            </li>
            <li>
              强弱/格局/用神 render every number as inspectable, never a bare scalar: a chart the engine reads
              as a genuine toss-up is flagged <span className="font-medium">borderline</span>, and{' '}
              <ClickableCJK text="从格" />/<ClickableCJK text="化气格" /> — the tradition&apos;s most disputed
              calls — surface as candidates with their evidence shown, not silent overrides of the regular
              reading.
            </li>
          </ul>
        </section>

        {/* ---- §2: the open question ---- */}
        <section className="card p-4 border-accent/40">
          <h2 className="text-lg font-bold text-ink">2 · the open question</h2>
          <p className="mt-2 text-sm text-body leading-relaxed">
            Everything in §1 is checked math — reproducible, byte-matched, independently reviewed. Nobody has
            to take our word for a pillar or a solar term. But a chart doesn&apos;t stop at pillars: the
            tradition attaches a temperament vocabulary to them — <ClickableCJK text="十神" /> readings,{' '}
            <ClickableCJK text="强弱" /> character language, <ClickableCJK text="格局" /> agendas,{' '}
            <ClickableCJK text="神煞" /> readings. <span className="font-medium">That part is not verified,
            and this project will not pretend otherwise.</span> No controlled test of Bazi&apos;s predictive
            or descriptive validity has held up (the same honesty this project inherits from Western
            astrology&apos;s own literature — Carlson 1985 is the anchor result there). This page exists to
            treat that gap as a real research question instead of quietly stepping around it.
          </p>
          <p className="mt-2 text-sm text-body leading-relaxed">
            <span className="font-medium">The trap to avoid:</span> simply asking &quot;does this feel true to
            you?&quot; and publishing the acceptance rate would not be evidence of anything. Flattering,
            general-sounding personality language gets accepted at high rates regardless of whose chart it
            came from — the Forer/Barnum effect. <span className="font-medium">So this app does not ask you to
            rate claims.</span> A rating with no blind control measures how agreeable the prose is, not
            whether it is true — and a number like that is worse than no number, because it looks like
            evidence.
          </p>
          <p className="mt-2 text-sm text-body leading-relaxed">
            <span className="font-medium">What it does instead:</span> keeps the unverified layer visibly
            separate from the checked one, and makes the machine show its work. The{' '}
            <Link href="/reading" className="underline hover:text-accent">computed 解盘 reading</Link> is
            composed by template with no model involved — the same chart yields the same words, every
            time. The reading room on that page also offers a chat: a model you configure composes
            the tradition&apos;s full reading of your life and destiny on your request. That prose is
            the tradition speaking, not the engine&apos;s output — sentences that draw on computed
            facts carry those facts&apos; chips, and made-up citations are labelled. The temperament
            vocabulary stays labelled as tradition, not as measurement.
          </p>
        </section>

        {/* ---- §3: data, plainly + boundary honesty on data ---- */}
        <section className="card p-4">
          <h2 className="text-base font-semibold text-ink">data, plainly</h2>
          <p className="mt-2 text-sm text-body leading-relaxed">
            Computing runs <span className="font-medium">in your browser</span>, and there is no
            account to make. But this is a research commons: <span className="font-medium">entering
            your birth data is consent</span> — every chart computed here becomes a research record.
            Records are held under covenant and are deletable from the intake
            page; they are queued in this browser until the commons endpoint ships.
          </p>
          <p className="mt-2 text-sm text-body leading-relaxed">
            Below is the <span className="font-medium">whole record, field by field</span> — not a
            summary of it. The list is rendered from the same constant the code sends, and CI fails
            the build if the two ever disagree (<span className="font-mono text-xs">check:commons</span>).
            Fields marked <span className="text-accent-strong">◆</span> narrow the birth moment,
            alone or in combination — three of the four pillars are already enough to make a birth
            date unique.
          </p>
          <ul className="mt-2 grid gap-x-5 gap-y-1 text-xs text-body sm:grid-cols-2">
            {COMMONS_DISCLOSURE.map((f) => (
              <li key={f.path} className="flex items-baseline gap-1.5">
                <span aria-hidden className={f.identifying ? 'text-accent-strong' : 'text-faint'}>
                  {f.identifying ? '◆' : '·'}
                </span>
                <span>
                  <ClickableCJK text={f.english} />
                  {f.identifying ? (
                    <span className="sr-only"> (narrows the birth moment)</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-sm text-body leading-relaxed">
            If that trade is not for you, close the tab — the engine is MIT-licensed and can be run
            offline from source, no data kept by anyone.
          </p>
        </section>

        <section className="card p-4 text-sm text-muted leading-relaxed">
          <span className="font-medium">What the math cannot do:</span> the engine computes positions, pillars,
          and relations — a map. It computes no meaning, no fortune, no verdict. The reading room
          (<Link href="/reading" className="underline hover:text-accent">解盘</Link>) adds a model that
          composes the tradition&apos;s reading on your request — that prose is the tradition speaking,
          clearly labelled, never presented as the engine&apos;s output. This page is where we go
          looking for evidence about the reading itself, in the open, and publish whatever we find.
        </section>
      </div>

      <footer className="text-xs text-faint text-center pt-6">
        MIT · open source · bazilionaire.org · the chart is a map; Christ is the way
      </footer>
    </main>
  );
}
