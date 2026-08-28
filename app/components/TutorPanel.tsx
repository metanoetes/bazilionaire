'use client';

/**
 * TutorPanel — phase 2, the optional model layer on /reading.
 *
 * Three states, in order, and it starts in the first: OFF → the disclosure gate
 * → output. The gate is not a formality: it prints the exact fact lines that
 * would leave the browser, names the host they would go to, and says plainly
 * what minimization does and does not hide. Nothing is sent before a click that
 * happens after that text is on screen.
 *
 * The output is fenced visually (accent border, "tutor voice" label, italic
 * lead-in) so it can never be mistaken for the computed prose above it, and
 * every sentence is graded by lib/tutor.ts's audit: a sentence with no citation
 * renders as UNCITED, a fabricated id renders as such, a fence violation
 * renders as FLAGGED. Nothing is silently dropped — the failure mode this layer
 * exists to expose is a fluent sentence with nothing behind it, so the UI shows
 * exactly that rather than hiding it.
 *
 * The key lives in sessionStorage (dies with the tab) unless the reader opts
 * into localStorage, is never logged, and goes only to the endpoint they typed.
 */

import { useEffect, useState } from 'react';
import { ClickableCJK } from './ClickableCJK';
import type { Fact } from '@/lib/factsheet';
import type { Movement } from '@/lib/reading';
import {
  auditTutorText,
  endpointHost,
  isLocalEndpoint,
  runTutor,
  tutorPayload,
  TUTOR_CFG_KEY,
  TUTOR_KEY_KEY,
  TUTOR_PRESETS,
  TutorError,
  type TutorAudit,
} from '@/lib/tutor';
import { verifyTutorOutput, type VerifyReport } from '@/lib/verify';

// Re-exported from lib/tutor so /reading can ask "is a reading model configured?"
// without duplicating the strings. One definition, two readers.
const CFG_KEY = TUTOR_CFG_KEY;
const KEY_KEY = TUTOR_KEY_KEY;

type Phase = 'off' | 'gate' | 'running' | 'done';

export function TutorPanel({ facts, movements }: { facts: Fact[]; movements: Movement[] }) {
  const [phase, setPhase] = useState<Phase>('off');
  const [baseUrl, setBaseUrl] = useState(TUTOR_PRESETS[0].baseUrl);
  const [model, setModel] = useState(TUTOR_PRESETS[0].model);
  const [apiKey, setApiKey] = useState('');
  const [remember, setRemember] = useState(false);
  // Full sheet by DEFAULT (Peter, 2026-08-27): minimization strips every 干支, so a
  // minimized reading cannot name your day master — it can only talk about structure.
  // The disclosure gate states plainly that the full sheet inverts to the birth moment.
  const [minimize, setMinimize] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [text, setText] = useState('');
  const [audit, setAudit] = useState<TutorAudit | null>(null);
  const [verify, setVerify] = useState<VerifyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Model ids offered as one-click fixes after a failure: what the endpoint says the key
  // can use, else this endpoint's preset default. A message that only NAMES a bad model
  // still leaves the reader retyping it correctly from memory.
  const [modelChoices, setModelChoices] = useState<string[]>([]);
  const [abort, setAbort] = useState<AbortController | null>(null);

  // Endpoint/model are a preference; the key is only restored if the reader
  // asked for it to be remembered on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) {
        const cfg = JSON.parse(raw) as { baseUrl?: string; model?: string; minimize?: boolean };
        if (cfg.baseUrl) setBaseUrl(cfg.baseUrl);
        if (cfg.model) setModel(cfg.model);
        if (typeof cfg.minimize === 'boolean') setMinimize(cfg.minimize);
      }
      const storedKey = localStorage.getItem(KEY_KEY) ?? sessionStorage.getItem(KEY_KEY);
      if (storedKey) {
        setApiKey(storedKey);
        setRemember(localStorage.getItem(KEY_KEY) !== null);
      }
    } catch {
      /* storage unavailable — the panel still works, nothing is remembered */
    }
  }, []);

  const payload = tutorPayload(facts, movements, { minimize });
  const host = endpointHost(baseUrl);
  const local = isLocalEndpoint(baseUrl);

  const persist = () => {
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify({ baseUrl, model, minimize }));
      if (apiKey.trim().length > 0) {
        if (remember) {
          localStorage.setItem(KEY_KEY, apiKey.trim());
          sessionStorage.removeItem(KEY_KEY);
        } else {
          sessionStorage.setItem(KEY_KEY, apiKey.trim());
          localStorage.removeItem(KEY_KEY);
        }
      }
    } catch {
      /* nothing remembered; not fatal */
    }
  };

  const send = async () => {
    setError(null);
    setPhase('running');
    persist();
    const controller = new AbortController();
    setAbort(controller);
    try {
      const out = await runTutor({ baseUrl, model, apiKey }, payload, controller.signal);
      setText(out);
      const a = auditTutorText(out, payload.allowedIds);
      setAudit(a);
      // Phase 3: the engine grades the claims, not just the citations. The
      // check runs against the SENT sheet, so a sentence cannot be defended by
      // a fact the model never saw.
      setVerify(verifyTutorOutput(a.sentences.map((s) => ({ text: s.text, cites: s.cites })), payload.sent));
      setPhase('done');
    } catch (e) {
      if (e instanceof TutorError) {
        setError(e.message);
        const choices = e.available ?? (e.suggestedModel ? [e.suggestedModel] : []);
        setModelChoices(choices.filter((c) => c !== model));
      } else {
        setError('The request failed.');
        setModelChoices([]);
      }
      setPhase('gate');
    } finally {
      setAbort(null);
    }
  };

  // ---------------- OFF ----------------
  if (phase === 'off') {
    return (
      <div className="card p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-ink">the tutor — off</h2>
          <button onClick={() => setPhase('gate')} className="text-xs underline hover:text-accent shrink-0">
            turn the tutor on →
          </button>
        </div>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          The reading above is complete without a model, and that is the point. If you want the same
          facts said in plainer English, a tutor can rephrase them — on{' '}
          <span className="text-body">your own key or your own local model</span>, receiving only the
          fact sheet, and citing a fact for every sentence it writes. It is a rephraser, not a source:
          it cannot add doctrine, cannot predict, and anything it writes without a citation is shown
          to you as uncited rather than trusted.
        </p>
      </div>
    );
  }

  // ---------------- OUTPUT ----------------
  if (phase === 'done' && audit) {
    const clean = audit.unanchored === 0 && audit.fabricated === 0 && audit.violations === 0;
    return (
      <div className="card p-4 border-accent/40">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-accent-strong">
            tutor voice — model-written, cited
          </h2>
          <div className="flex gap-3 shrink-0">
            <button onClick={send} className="text-xs underline hover:text-accent">
              regenerate
            </button>
            <button
              onClick={() => {
                setText('');
                setAudit(null);
                setVerify(null);
                setPhase('off');
              }}
              className="text-xs underline hover:text-accent"
            >
              turn off
            </button>
          </div>
        </div>

        <p className="mt-1 text-[11px] text-muted italic">
          Written by {model} at {host} from the fact sheet only. The computed reading above is the
          authority; this is a paraphrase of it.
        </p>

        <div className="mt-3 space-y-2 text-sm leading-relaxed">
          {audit.sentences.map((s, i) => {
            const v = verify?.sentences[i];
            const flagged = !s.ok || (v && v.verdict !== 'ok');
            return (
            <p key={i} className="text-body">
              <span className={flagged ? 'bg-accent/10 rounded px-1' : ''}>
                <ClickableCJK text={s.text.replace(/\[(F-[A-Z0-9-]+)\]/g, '').trim()} />
              </span>
              {s.cites.map((c) => (
                <span key={c} className="text-[10px] font-mono text-faint ml-1.5">
                  {' '}
                  {c}
                </span>
              ))}
              {s.cites.length === 0 && s.unknownCites.length === 0 && (
                <span className="text-[10px] font-mono text-accent-strong ml-1.5"> UNCITED</span>
              )}
              {s.unknownCites.map((c) => (
                <span key={c} className="text-[10px] font-mono text-accent-strong ml-1.5">
                  {' '}
                  FABRICATED:{c}
                </span>
              ))}
              {s.fenceHits.length > 0 && (
                <span className="text-[10px] font-mono text-accent-strong ml-1.5">
                  {' '}
                  FLAGGED:{s.fenceHits.join(',')}
                </span>
              )}
              {v && v.verdict !== 'ok' && (
                <span className="text-[10px] font-mono text-accent-strong ml-1.5">
                  {' '}
                  {v.verdict === 'contradicted'
                    ? 'CONTRADICTS THE ENGINE'
                    : v.verdict === 'ungrounded'
                      ? 'NOT IN THE FACTS'
                      : 'MISCITED'}
                </span>
              )}
              {v && v.verdict !== 'ok' && (
                <span className="block text-[10px] text-muted mt-0.5">
                  {v.findings
                    .filter((f) => f.kind !== 'enumeration')
                    .map((f) => f.note)
                    .join(' · ')}
                </span>
              )}
            </p>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-line text-[11px] text-muted">
          {clean && verify && verify.contradicted + verify.ungrounded + verify.miscited === 0 ? (
            <>
              Audit: every sentence cites a real computed fact, none tripped the editorial fence, and
              the engine found no contradiction between any claim and the fact it cites. That is the
              bar, not a compliment — and it is not a guarantee of truth: the cross-check compares
              closed doctrine vocabularies (verdicts, stages, patterns, 十神, numbers), so a fluent
              sentence that cites correctly and still misleads in English would pass it.
            </>
          ) : (
            <>
              Problems found, left visible on purpose:{' '}
              {audit.unanchored > 0 && <>{audit.unanchored} uncited sentence(s); </>}
              {audit.fabricated > 0 && <>{audit.fabricated} sentence(s) citing an id that does not exist; </>}
              {audit.violations > 0 && <>{audit.violations} sentence(s) breaking the no-prediction rules; </>}
              {verify && verify.contradicted > 0 && (
                <>{verify.contradicted} sentence(s) contradicting the engine on the fact they cite; </>
              )}
              {verify && verify.ungrounded > 0 && (
                <>{verify.ungrounded} sentence(s) naming doctrine or numbers absent from the fact sheet; </>
              )}
              {verify && verify.miscited > 0 && (
                <>{verify.miscited} sentence(s) whose value is true of this chart but not in the fact cited. </>
              )}
              Trust the computed reading above over anything flagged here.
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------------- DISCLOSURE GATE ----------------
  return (
    <div className="card p-4 border-accent/40">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-ink">before anything is sent</h2>
        <button onClick={() => setPhase('off')} className="text-xs underline hover:text-accent shrink-0">
          cancel
        </button>
      </div>

      <div className="mt-2 text-sm text-body leading-relaxed space-y-2">
        <p>
          Nothing has left this browser yet. If you continue, {payload.lines.length} fact lines — the
          list below — are sent to <span className="font-medium">{host}</span> with your key, plus a
          fixed instruction prompt that says how to write and contains nothing about you (a test
          asserts that). Nothing else goes. The reply comes straight back here; no Bazilionaire server
          is involved, there isn&apos;t one.
        </p>
        <p className="text-muted">
          <span className="font-medium text-body">What never leaves, in either mode:</span> your birth
          date, time, city, longitude and timezone — they are not in the fact sheet at all — and the
          solar-time conversion, which would pin your birth time to the minute.{' '}
          {minimize ? (
            <>
              <span className="font-medium text-body">Minimized</span> goes further and removes every
              <span className="font-medium text-body"> 干支</span>: no stems, no branches, no ganzhi,
              no 纳音 tone names, no year animal, no 旬 — along with every calendar year and the 起运
              offset. What is left is structure: 十神, growth stages, the pattern, the strength score,
              relation types. A test asserts that not one pillar can be rebuilt from it, because an
              earlier version of this page claimed minimization and a reviewer reconstructed all eight
              characters from the fields it had left behind. The trade: the tutor cannot name your
              stems or branches, so its paraphrase talks about structure rather than characters.
            </>
          ) : (
            <>
              <span className="font-medium text-accent-strong">Full sheet:</span> the eight characters,
              the 纳音 tones and the decade years are all included, and those invert to your birth
              moment within about two hours. Only do this with an endpoint you trust — ideally a local
              one.
            </>
          )}
        </p>
        {!local && (
          <p className="text-accent-strong text-xs">
            {host} is a remote provider: your key, your account, their retention policy. A local
            endpoint is the only configuration where nothing leaves your machine.
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-muted block text-xs">endpoint (OpenAI-compatible)</span>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm"
            spellCheck={false}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted block text-xs">model</span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm"
            spellCheck={false}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-muted block text-xs">
            your API key {local && <span className="text-faint">— local servers usually need none</span>}
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={local ? '(leave empty)' : 'sk-…'}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        {TUTOR_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setBaseUrl(p.baseUrl);
              setModel(p.model);
            }}
            className="underline text-muted hover:text-accent"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={minimize} onChange={(e) => setMinimize(e.target.checked)} className="mt-0.5" />
          <span className="text-muted">
            send the <span className="text-body">minimized</span> fact sheet instead — safer, but the
            reading cannot name your stems or branches
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5" />
          <span className="text-muted">
            remember the key on this device — it is written to this browser&apos;s local storage and
            stays there until you clear it. Left unticked, it is held only for this tab and forgotten
            when the tab closes.
          </span>
        </label>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setShowPayload((v) => !v)}
          className="text-xs underline text-muted hover:text-accent"
        >
          {showPayload ? 'hide' : 'show'} the exact {payload.lines.length} lines that would be sent
        </button>
        {showPayload && (
          <pre className="mt-2 max-h-64 overflow-auto text-[10px] leading-snug bg-surface-2 rounded p-2 text-muted whitespace-pre-wrap">
            {payload.lines.join('\n')}
          </pre>
        )}
      </div>

      {error && (
        <div className="mt-3 text-xs text-accent-strong">
          ⚠ {error}
          {modelChoices.length > 0 && (
            <div className="mt-2 flex flex-wrap items-baseline gap-2 text-muted">
              <span>try:</span>
              {modelChoices.slice(0, 8).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModel(m);
                    setError(null);
                    setModelChoices([]);
                  }}
                  className="px-1.5 py-0.5 rounded border border-line font-mono text-[11px] text-ink hover:border-accent hover:text-accent"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={send}
          disabled={phase === 'running'}
          className="flex-1 bg-accent text-on-accent rounded py-2 text-sm font-medium disabled:opacity-60"
        >
          {phase === 'running'
            ? 'asking the tutor…'
            : `send ${payload.lines.length} fact lines to ${host} and ask for a paraphrase`}
        </button>
        {phase === 'running' && (
          <button
            onClick={() => abort?.abort()}
            className="px-3 rounded border border-line text-sm text-muted hover:text-accent"
          >
            cancel
          </button>
        )}
      </div>
    </div>
  );
}
