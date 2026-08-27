'use client';

import { useMemo, useState } from 'react';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { extractClaims, type ExtractedClaim } from '@/lib/claims';
import { buildValidationRecord, queueValidation, type ClaimRating } from '@/lib/validation';
import { randomBirth } from '@/lib/randomBirth';
import { ClickableCJK } from './ClickableCJK';

type Rating = ClaimRating['rating'];
type ShuffledClaim = ExtractedClaim & { isControl: boolean };

/** Fisher–Yates — avoids the own-chart claims always sorting first (they're
 *  extracted first), which would make the blind trivially guessable. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The research page's within-subject blind control, run inline on /chart
 * right after a chart is computed. Own-chart claims and a freshly-random
 * comparison chart's claims are shuffled together, unlabeled, rated blind;
 * the reveal after submit is the actual signal (own accept rate vs.
 * comparison accept rate) — see lib/validation.ts's doc comment for the
 * full rationale. The comparison chart is generated and claim-extracted
 * client-side and discarded — never queued as a research record itself.
 */
export function ValidationStep({ chart }: { chart: Chart }) {
  const [started, setStarted] = useState(false);
  const [consented, setConsented] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { rating: Rating; note: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [reveal, setReveal] = useState<{ own: number | null; control: number | null } | null>(null);

  // Comparison chart: generated once per mount (stable across re-renders while
  // the step is open), a completely unrelated random chart — never the same
  // gender-locked identity as the respondent's own, just a fresh random birth.
  const shuffled = useMemo<ShuffledClaim[]>(() => {
    const ownClaims = extractClaims(chart).map((c) => ({ ...c, isControl: false }));
    const cb = randomBirth();
    const controlChart = computeChart(cb.year, cb.month, cb.day, cb.hour, cb.minute, undefined, cb.gender === 'male' ? 1 : 0, cb.hourSchool);
    const controlClaims = extractClaims(controlChart).map((c) => ({ ...c, isControl: true }));
    return shuffle([...ownClaims, ...controlClaims]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]); // regenerate the comparison chart fresh each time the step is (re)started

  if (shuffled.length === 0) return null; // nothing extracted for this chart — nothing to rate

  const allRated = shuffled.every((c) => ratings[c.templateId]?.rating);

  const submit = () => {
    const claimRatings: ClaimRating[] = shuffled.map((c) => ({
      templateId: c.templateId,
      category: c.category,
      term: c.term,
      claim: c.claim,
      context: c.context,
      isControl: c.isControl,
      rating: ratings[c.templateId]?.rating ?? 'unsure',
      note: consented ? (ratings[c.templateId]?.note ?? '') : '',
    }));
    const record = buildValidationRecord(claimRatings);
    const ok = queueValidation(record);
    setSaveFailed(!ok);
    setReveal({ own: record.ownAcceptRate, control: record.controlAcceptRate });
    setSubmitted(true);
  };

  if (!started) {
    return (
      <div className="card p-4">
        <div className="text-sm text-muted mb-2">
          research — does this read like you?
        </div>
        <p className="text-sm text-body leading-relaxed">
          The chart&apos;s math is verified; whether its temperament readings actually
          correspond to real people is an open, unproven question — see{' '}
          <ClickableCJK text="研究" /> below. This step shows you a shuffled mix of claims —
          some from your chart, some from an unrelated random comparison chart — and asks you
          to rate each one blind. You find out which was which only at the end.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-3 bg-accent text-on-accent rounded py-2 px-4 text-sm font-medium"
        >
          Rate {Math.ceil(shuffled.length)} claims (blind)
        </button>
      </div>
    );
  }

  if (submitted && reveal) {
    const pct = (n: number | null) => (n === null ? '—' : `${Math.round(n * 100)}%`);
    return (
      <div className="card p-4 border-accent/40">
        <div className="text-sm font-semibold text-accent-strong mb-2">the reveal</div>
        <p className="text-sm text-body leading-relaxed">
          Of the claims from <span className="font-medium">your own chart</span>, you marked{' '}
          <span className="font-medium text-accent-strong">{pct(reveal.own)}</span> as resonant.
          Of the claims from the <span className="font-medium">random comparison chart</span>, you marked{' '}
          <span className="font-medium text-accent-strong">{pct(reveal.control)}</span> as resonant.
        </p>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          If those two numbers are close, that is the honest finding, not a failure — it is
          exactly what a fair test should show when a reading is agreeable rather than specific
          (the Forer/Barnum effect). This response has been queued to the local research
          commons; see <ClickableCJK text="研究" /> for the aggregate, once enough responses exist.
        </p>
        {saveFailed && (
          <p className="mt-2 text-xs text-accent-strong">
            ⚠ This browser could not save your response (storage unavailable or full) — the
            reveal above is still accurate for this session, but the record was not queued.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="text-sm text-muted mb-3">
        Rate each claim blind — you don&apos;t know yet which chart it came from.
      </div>

      <div className="space-y-3">
        {shuffled.map((c, i) => (
          <div key={c.templateId} className="card p-3">
            <div className="text-xs text-faint">claim {i + 1} of {shuffled.length}</div>
            <p className="text-sm text-body leading-relaxed mt-1">{c.claim}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['resonates', 'unsure', 'not'] as Rating[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setRatings((prev) => ({ ...prev, [c.templateId]: { note: prev[c.templateId]?.note ?? '', rating: r } }))
                  }
                  className={`px-3 py-1 rounded text-xs ${
                    ratings[c.templateId]?.rating === r ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted'
                  }`}
                >
                  {r === 'resonates' ? 'resonates' : r === 'not' ? 'doesn\u2019t' : 'unsure'}
                </button>
              ))}
            </div>
            {ratings[c.templateId]?.rating && (
              <input
                type="text"
                placeholder="in what way? (optional)"
                value={ratings[c.templateId]?.note ?? ''}
                onChange={(e) =>
                  setRatings((prev) => ({
                    ...prev,
                    [c.templateId]: { rating: prev[c.templateId]?.rating ?? 'unsure', note: e.target.value },
                  }))
                }
                className="mt-2 w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-xs"
              />
            )}
          </div>
        ))}
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Save my &quot;in what way&quot; notes too (optional, separate from the ratings — free text is
          more identifying than the ratings alone). Leave unchecked to submit ratings only.
        </span>
      </label>

      <button
        type="button"
        disabled={!allRated}
        onClick={submit}
        className="mt-3 bg-accent text-on-accent rounded py-2 px-4 text-sm font-medium disabled:opacity-40"
      >
        {allRated ? 'Submit and reveal' : `Rate all ${shuffled.length} to continue`}
      </button>
    </div>
  );
}
