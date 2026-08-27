'use client';

import { useState } from 'react';
import type { Chart } from '@bazilionaire/engine';
import { ClickableCJK } from './ClickableCJK';

/**
 * 强弱/格局/用神 — curriculum modules 9-11, now computed (not just taught by
 * hand). Every number here is a documented, inspectable heuristic synthesis
 * (see engine/src/strength.ts's own comment) — never hidden behind a bare
 * verdict. 从格/化气格 render as flagged CANDIDATES with their evidence, not
 * silent overwrites: the tradition's most argued-over calls stay visibly
 * contestable. This panel computes the vocabulary and shows its work; it
 * still never tells you what to do with the answer — see the site's own
 * "follow the Lion, not the chart" line on the landing page.
 */
export function StrengthPanel({ chart }: { chart: Chart }) {
  const [expanded, setExpanded] = useState(false);
  const { strength, pattern, yongShen } = chart;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted">
          <ClickableCJK text="强弱" /> · <ClickableCJK text="格局" /> · <ClickableCJK text="用神" /> — day-master
          strength, pattern, favorable god
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs underline hover:text-accent shrink-0"
        >
          {expanded ? 'hide the breakdown' : 'show the breakdown'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 强弱 */}
        <div className="card p-3">
          <div className="text-xs text-faint">
            <ClickableCJK text="强弱" /> day-master strength
          </div>
          <div className="mt-1 text-2xl font-bold text-accent-strong">{strength.verdict}</div>
          <div className="text-[11px] text-muted mt-1">
            score {strength.score >= 0 ? '+' : ''}
            {strength.score.toFixed(2)}
            {strength.borderline && <span className="text-accent ml-1">· borderline, a genuine toss-up</span>}
          </div>
        </div>

        {/* 格局 */}
        <div className="card p-3">
          <div className="text-xs text-faint">
            <ClickableCJK text="格局" /> pattern
          </div>
          <div className="mt-1 text-2xl font-bold text-accent-strong">{pattern.primary.name}</div>
          <div className="text-[11px] text-muted mt-1">
            {pattern.primary.kind === 'regular'
              ? `month's presiding god: ${pattern.primary.governingShishen} (${pattern.primary.monthHiddenStem})`
              : pattern.primary.note}
          </div>
        </div>

        {/* 用神 */}
        <div className="card p-3">
          <div className="text-xs text-faint">
            <ClickableCJK text="用神" /> favorable god ({yongShen.recommended.method})
          </div>
          <div className="mt-1 text-2xl font-bold text-accent-strong">
            {yongShen.recommended.favorable.join(' / ') || '—'}
          </div>
          <div className="text-[11px] text-muted mt-1">
            {yongShen.patternAgreement ? '扶抑 and the pattern\'s own god agree — an unusually solid call.' : 'one lens among five — see the breakdown.'}
          </div>
        </div>
      </div>

      {(pattern.extremeCandidate || pattern.huaqiCandidate) && (
        <div className="mt-3 card p-3 border-accent/40">
          {pattern.extremeCandidate && (
            <div className="text-xs text-body">
              <span className="font-medium text-accent-strong">
                <ClickableCJK text="从格" /> candidate: {pattern.extremeCandidate.name}
              </span>{' '}
              — the tradition's most argued-over call. Evidence, not a verdict:
              <ul className="list-disc list-inside mt-1 text-muted">
                {pattern.extremeCandidate.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {pattern.huaqiCandidate && (
            <div className={`text-xs text-body ${pattern.extremeCandidate ? 'mt-2 pt-2 border-t border-line' : ''}`}>
              <span className="font-medium text-accent-strong">
                <ClickableCJK text="化气格" /> candidate: transforms toward {pattern.huaqiCandidate.transformElementName}
              </span>{' '}
              — the rarest, most disputed pattern. Evidence, not a verdict:
              <ul className="list-disc list-inside mt-1 text-muted">
                {pattern.huaqiCandidate.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 text-xs text-body">
          <div className="border-t border-line pt-3">
            <div className="font-medium text-ink mb-1">
              <ClickableCJK text="得令" /> — season command
            </div>
            <div className="text-muted">
              month state: <span className="font-medium text-body">{strength.deLing.state}</span>{' '}
              ({strength.deLing.commands ? '得令 — commands the season' : '失令 — does not command the season'}),
              subscore {strength.deLing.subscore.toFixed(2)}
            </div>
          </div>

          <div className="border-t border-line pt-3">
            <div className="font-medium text-ink mb-1">
              <ClickableCJK text="得地" /> / <ClickableCJK text="通根" /> — branch roots
            </div>
            {strength.roots.length === 0 ? (
              <div className="text-muted">no branch carries the day master's element as a hidden stem — rootless.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {strength.roots.map((r, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-surface-2 text-muted">
                    {r.pillar} {r.branch} → {r.hiddenStem} ({r.depth}, {r.growthStage})
                  </span>
                ))}
              </div>
            )}
            <div className="text-muted mt-1">得地 subscore {strength.deDiSubscore.toFixed(2)}</div>
          </div>

          <div className="border-t border-line pt-3">
            <div className="font-medium text-ink mb-1">
              <ClickableCJK text="得势" /> — stem support
            </div>
            <div className="flex flex-wrap gap-2">
              {strength.stemSupport.map((s, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded ${s.polarity === 1 ? 'bg-accent/15 text-accent-strong' : 'bg-surface-2 text-muted'}`}
                >
                  {s.pillar} {s.stem} → {s.shishen}
                </span>
              ))}
            </div>
            <div className="text-muted mt-1">得势 subscore {strength.deShiSubscore.toFixed(2)}</div>
          </div>

          <div className="border-t border-line pt-3">
            <div className="font-medium text-ink mb-1">the five 用神 lenses (module 11's decision order)</div>
            <ul className="space-y-1.5 text-muted">
              <li>
                <span className="font-medium text-body"><ClickableCJK text="扶抑" /></span> ({yongShen.fuyi.direction}):{' '}
                {yongShen.fuyi.reasoning}
              </li>
              <li>
                <span className="font-medium text-body"><ClickableCJK text="调候" /></span>:{' '}
                {yongShen.tiaohou.reasoning}
              </li>
              <li>
                <span className="font-medium text-body"><ClickableCJK text="病药" /></span>:{' '}
                {yongShen.bingyao.reasoning}
              </li>
              <li>
                <span className="font-medium text-body"><ClickableCJK text="通关" /></span>:{' '}
                {yongShen.tongguan.reasoning}
              </li>
              <li>
                <span className="font-medium text-body"><ClickableCJK text="专旺" /></span>:{' '}
                {yongShen.zhuanwang.reasoning}
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-line text-[11px] text-muted leading-relaxed">
        Computed structure, not a prescription: the tradition itself argues over 从格 thresholds and
        whether 十二长生 truly reverses for yin stems (curriculum modules 9-11). This panel shows every
        factor so you can weigh, check, or reject the computed reading — the discernment of what to do
        with it stays with people: a teacher, a friend, and finally Christ. <span className="italic">Follow the Lion, not the chart</span> (Rev 5:5).
      </div>
    </div>
  );
}
