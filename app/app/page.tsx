import Link from 'next/link';
import { ClickableCJK } from '@/components/ClickableCJK';

export const metadata = {
  title: 'Bazilionaire — read the map, follow the Lion',
  description:
    'A free, open-source Bazi (八字) learning center and research commons. A language and framework for understanding character — your own and other people’s — so each person can be given the medicine they actually need. The chart is a map, never a verdict.',
};

export default function LandingPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">bazi·lion·aire</h1>
        <p className="text-base text-muted mt-3 max-w-xl mx-auto leading-relaxed">
          A Christian, free, open-source, nonprofit <ClickableCJK text="八字" /> learning center.
          <br />
          A language for character: your own, and the people you are trying to love well.
        </p>
        <p className="text-sm text-accent-strong mt-3 italic">
          <ClickableCJK text="善人不为命所缚" /> — the good are not bound by fate
        </p>
      </header>

      {/* Character first: language, framework, medicine */}
      <section className="card p-5 mb-4">
        <h2 className="text-lg font-semibold text-ink">
          a language for character — and the medicine it asks for
        </h2>
        <p className="mt-3 text-sm text-body leading-relaxed">
          Bazi usually arrives as fortune-telling. This center is for something else. A chart
          is a <span className="font-medium text-ink">vocabulary for temperament</span> —{' '}
          <ClickableCJK text="五行" /> elements, <ClickableCJK text="十神" /> ten gods,{' '}
          <ClickableCJK text="藏干" /> hidden stems — precise enough to say what a person is
          actually like, which &ldquo;introvert&rdquo; never manages. Two things follow:
        </p>
        <ol className="mt-3 space-y-2 text-sm text-body leading-relaxed list-decimal list-inside">
          <li>
            <span className="font-medium text-ink">A framework for character</span> — yours and
            other people&apos;s, named in the same terms, so difference stops reading as defect.
            Not to sort people, but to see them.
          </li>
          <li>
            <span className="font-medium text-ink">The medicine each of us needs</span> — what
            runs hot needs different care from what runs dry, and what steadies you can starve
            someone else. Not a forecast; a prescription pad for attention.
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/curriculum" className="underline hover:text-accent">
            learn the language — 课程 curriculum
          </Link>
        </div>
      </section>

      {/* Theology second: the frame everything above sits inside */}
      <section className="card p-5 mb-4">
        <h2 className="text-lg font-semibold text-ink">
          a Christian frame, stated up front
        </h2>
        <p className="mt-3 text-sm text-body leading-relaxed">
          God first — before the chart, and over it. Four commitments:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-body leading-relaxed list-disc list-inside">
          <li>
            <span className="font-medium text-ink">We do not worship the stars.</span> No prayer
            or offering to a pillar, a planet, or a phase. 2 Kings 18:4: Hezekiah smashed the
            bronze serpent once people burned incense to it — it had healed, it was never meant
            to be adored.
          </li>
          <li>
            <span className="font-medium text-ink">We read pattern in creation, nothing
            more.</span> <ClickableCJK text="气" /> and the <ClickableCJK text="五行" /> it moves
            through are created substances — like light, like water — not spirits, not powers.
            The heavens declare the glory of God (Ps 19); they are not God.
          </li>
          <li>
            <span className="font-medium text-ink">The good are not bound by fate.</span>{' '}
            <ClickableCJK text="善人不为命所缚" />. A chart maps the temperament God gave you;
            it describes, it does not sentence.
          </li>
          <li>
            <span className="font-medium text-ink">Every chart has a rebirth slot.</span>{' '}
            <ClickableCJK text="重生" /> — John 3:3. Enter the day you were reborn in Christ and
            the <ClickableCJK text="大运" /> timeline is marked there: the same weather, falling
            on a new creation (2 Cor 5:17).
          </li>
        </ul>
        <p className="mt-3 text-sm text-body leading-relaxed">
          Where chart and Scripture disagree, Scripture wins. Nothing computed here has authority
          over your standing before God.{' '}
          <span className="italic">Follow the Lion, not the chart</span> (Rev 5:5).
        </p>
      </section>

      {/* What you get + the research aims */}
      <section className="card p-5 mb-8">
        <h2 className="text-lg font-semibold text-ink">what the chart page gives you</h2>
        <ul className="mt-3 space-y-2 text-sm text-body leading-relaxed list-disc list-inside">
          <li>Your full four-pillar chart, computed in your browser — nothing leaves it until you submit.</li>
          <li>A rebirth slot: the <ClickableCJK text="大运" /> decade timeline marked at the day you were reborn in Christ.</li>
          <li><ClickableCJK text="合婚" /> pair reading — two computed layers, no verdict.</li>
          <li>Every warning the engine can give: boundary honesty near a <ClickableCJK text="节" />, unknown-hour handling, both hour schools.</li>
        </ul>
        <p className="mt-4 text-sm text-body leading-relaxed">
          It also makes the system testable — a thousand years of practice, almost no record of
          anyone checking whether it works. Every chart is computed deterministically
          (VSOP87D solar terms, a pinned Python oracle, byte-matched in CI), so the same birth
          data gives the same chart anywhere. Entering yours joins the commons: each chart becomes
          a research record, held under covenant, deletable, and disclosed field by field on the
          research page. If Bazi carries real signal a public commons is how anyone finds out; if
          it doesn&apos;t, it should say so plainly.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/trust/research" className="underline hover:text-accent">
            how the chart is computed
          </Link>
        </div>
      </section>

      <div className="text-center">
        <Link
          href="/chart"
          className="inline-block bg-accent text-on-accent rounded px-8 py-3 font-medium text-base hover:opacity-90"
        >
          Compute my chart →
        </Link>
        <p className="text-xs text-muted mt-3">
          Entering your birth data is consent to the research commons.{' '}
          <Link href="/trust/research" className="underline hover:text-accent">
            what that means
          </Link>
        </p>
      </div>

      <footer className="text-xs text-faint text-center pt-10 space-y-1">
        <div>
          <Link href="/trust/research" className="underline hover:text-accent">methodology</Link>
          {' · '}
          <Link href="/curriculum" className="underline hover:text-accent">curriculum</Link>
        </div>
        <div>MIT · open source · bazilionaire.org · the chart is a map; Christ is the way</div>
      </footer>
    </main>
  );
}
