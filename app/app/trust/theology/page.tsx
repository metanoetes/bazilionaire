import Link from 'next/link';

export const metadata = {
  title: 'Theology — where the chart stands | bazilionaire',
  description:
    'A creation-first frame: the chart maps the God-given temperament — good, to be purified. Rebirth in Christ kills its distortions. The chart is general revelation; Christ is special revelation.',
};

export default function TheologyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm text-stone-500 hover:text-amber-900">
          ← back to the chart
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 mt-2">
          theology <span className="text-stone-500 text-lg font-normal">where the chart stands</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          善人不为命所缚 shàn rén bù wéi mìng suǒ fù — the good are not bound by fate
        </p>
      </header>

      <div className="space-y-4">
        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">the creation-first frame</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            A chart describes the temperament God gave — a nature that was created <em>good</em>. Like all
            created things, that nature is distorted by the fall: strengths bent, gifts misaimed. The chart is
            a map of the given nature, not a sentence about the person.
          </p>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            Rebirth (重生, John 3:3; 2 Cor 5:17) does not discard the created nature — it kills its
            distortions and restores its direction. This is why the app carries a{' '}
            <span className="font-medium">rebirth slot</span>: before that date, the 大运 timeline binds; after
            it, the chart describes but no longer rules. The map remains readable; the chain is broken.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">general and special revelation</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            The heavens declare the glory of God (Ps 19) — general revelation, given to everyone, readable by
            anyone, and <em>incomplete</em>. A birth chart sits on this shelf: it may describe patterns; it
            cannot save, command, or condemn. Special revelation — Scripture, and finally Christ himself — is
            the only voice with that authority.
          </p>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            When the two seem to disagree, the higher word wins. A chart is a telescope for observing the
            created order; it is not a substitute for the Creator&apos;s speech.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">the Ricci fence</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            Matteo Ricci, the Jesuit scholar in Ming China, drew the line this way: 气 (qì — the breath-like
            medium the Chinese classics speak of) is a <em>created substance</em>, part of the world God made.
            It is not God, not an emanation of God, and nothing to be worshipped. We hold the same fence: the
            五行 phases and 气 they describe are creatures, doing what creatures do. Reading them is reading
            creation — never praying to it.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">tool informs, user decides</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            This center computes maps, never sentences. Weather, not verdicts. No prediction here has the
            authority of certainty — not about health, death, or money, and never about your standing before
            God. Where a tool starts deciding outcomes for you, it has stopped being a tool and started being
            an oracle. We refuse that step.
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-base font-semibold text-amber-950">the anti-idol clause</h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            Even a good thing becomes a snare when worshipped. 2 Kings 18:4: Hezekiah smashed the bronze
            serpent Moses had made — because the people had burned incense to it. The serpent had healed; it
            was never meant to be adored. So with charts: read the map. Follow the Lion. (Rev 5:5)
          </p>
        </section>
      </div>

      <footer className="text-xs text-stone-400 text-center pt-6">
        MIT · open source · bazilionaire.org · the chart is a map; Christ is the way
      </footer>
    </main>
  );
}
