'use client';

import { useState } from 'react';
import {
  branchInteraction,
  sanHeCompletion,
  twelveStageOf,
  type Chart,
  type Interaction,
} from '@bazilionaire/engine';
import { lexiconFor } from '@/lib/lexicon';
import { nayinFor } from '@/lib/nayin';
import { ClickableCJK } from './ClickableCJK';

/**
 * 命盘 mìng pán — the plate.
 *
 * Replaces the old four-card grid + exclusive 字形/十神/藏干 toggle. The toggle
 * made the chart *narrower* than the doctrine: a reader could never see a
 * pillar's stem, its 十神, and its 藏干 at the same time, which is exactly the
 * comparison the tradition teaches. Here every computed layer is a labelled
 * ROW and every pillar is a COLUMN — read down for a pillar, across for a
 * layer — the way a printed 命盘 has always been laid out.
 *
 * Layers shown, all from engine output, nothing inferred here:
 *   十神  stem vs day master (day pillar = 日主 itself)
 *   天干  stem glyph, click to expand
 *   地支  branch glyph, click to expand
 *   藏干  hidden stems with each one's own 十神
 *   星运  day master's 十二长生 stage in that pillar's branch (day = 自坐)
 *   纳音  the pillar's element-tone — name, pinyin, English; click to expand
 *   空亡  whether this pillar's branch is one of the day 旬's two void seats
 *
 * Below the plate: 关系 — the natal branch relations among the four pillars
 * (合冲刑害 + 三合 completion). The engine has computed these all along
 * (branchInteraction/sanHeCompletion) but only the transit timeline ever
 * displayed them; the natal chart's own tensions were invisible.
 */

const PILLARS: Array<{ key: 'year' | 'month' | 'day' | 'time'; cn: string; en: string }> = [
  { key: 'year', cn: '年', en: 'year' },
  { key: 'month', cn: '月', en: 'month' },
  { key: 'day', cn: '日', en: 'day' },
  { key: 'time', cn: '时', en: 'hour' },
];

/** Row label: small Chinese term (clickable when the glossary knows it) + English. */
function RowLabel({ cn, en }: { cn: string; en: string }) {
  return (
    <th
      scope="row"
      className="text-right align-middle py-1.5 pr-3 whitespace-nowrap font-normal border-t border-line-soft"
    >
      <span className="text-[13px] text-muted">
        <ClickableCJK text={cn} />
      </span>
      <span className="hidden sm:inline text-[11px] text-faint ml-1.5">{en}</span>
    </th>
  );
}

export function ChartGrid({ chart }: { chart: Chart }) {
  const [selected, setSelected] = useState<string | null>(null);

  const stems = [chart.year[0], chart.month[0], chart.day[0], chart.time[0]];
  const branches = [chart.year[1], chart.month[1], chart.day[1], chart.time[1]];
  const dayStem = chart.day[0];

  const cellBase = 'text-center align-middle py-1.5 px-1 border-t border-line-soft';
  const dayTint = (i: number) => (i === 2 ? ' bg-accent/8' : '');

  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div className="text-sm text-muted">
          <ClickableCJK text="命盘" /> — the plate · <ClickableCJK text="四柱" /> four pillars ·{' '}
          <span className="text-accent-strong">{chart.day[0]}</span> <ClickableCJK text="日主" /> highlighted
        </div>
        <div className="text-xs text-faint">
          {chart.zodiac} year ·{' '}
          {chart.hourSchool === 'solar' ? (
            <>
              <ClickableCJK text="真太阳时" /> solar-time school
            </>
          ) : (
            'clock school'
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Four pillars by doctrine layer: ten gods, stems, branches, hidden stems, growth stage,
            nayin tone, and void status.
          </caption>
          <thead>
            <tr>
              <th className="w-0" />
              {PILLARS.map(({ key, cn, en }, i) => (
                <th key={key} scope="col" className={`text-center px-1 pb-1 font-normal${dayTint(i)}`}>
                  <div className="text-sm text-body">
                    <ClickableCJK text={cn} /> <span className="text-faint text-xs">{en}</span>
                  </div>
                  {i === 2 && (
                    <div className="text-[10px] text-accent-strong tracking-wide">
                      <ClickableCJK text="日主" /> the lens
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* 十神 — stem vs day master */}
            <tr>
              <RowLabel cn="十神" en="ten gods" />
              {PILLARS.map((p, i) => (
                <td key={p.key} className={cellBase + dayTint(i)}>
                  <span className="text-xs text-accent-strong font-medium">
                    {i === 2 ? <ClickableCJK text="日主" /> : <ClickableCJK text={chart.shishenGan[i]} />}
                  </span>
                </td>
              ))}
            </tr>

            {/* 天干 — stem glyph */}
            <tr>
              <RowLabel cn="天干" en="stem" />
              {PILLARS.map((p, i) => {
                const s = lexiconFor(stems[i]);
                return (
                  <td key={p.key} className={cellBase + dayTint(i)}>
                    <button
                      type="button"
                      onClick={() => setSelected(stems[i])}
                      title={`${s.pinyin} — ${s.gloss}`}
                      className="block mx-auto text-3xl font-bold leading-none cursor-pointer hover:opacity-80 text-accent-strong"
                    >
                      {stems[i]}
                    </button>
                    <div className="text-[11px] text-muted mt-1">
                      {s.pinyin} · {s.element}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 地支 — branch glyph */}
            <tr>
              <RowLabel cn="地支" en="branch" />
              {PILLARS.map((p, i) => {
                const b = lexiconFor(branches[i]);
                return (
                  <td key={p.key} className={cellBase + dayTint(i)}>
                    <button
                      type="button"
                      onClick={() => setSelected(branches[i])}
                      title={`${b.pinyin} — ${b.gloss}`}
                      className="block mx-auto text-3xl font-bold leading-none cursor-pointer hover:opacity-80 text-accent-strong"
                    >
                      {branches[i]}
                    </button>
                    <div className="text-[11px] text-muted mt-1">
                      {b.pinyin} · {b.element}
                      {b.animal ? ` · ${b.animal}` : ''}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 藏干 — hidden stems, each with its own 十神 */}
            <tr>
              <RowLabel cn="藏干" en="hidden stems" />
              {PILLARS.map((p, i) => (
                <td key={p.key} className={cellBase + dayTint(i)}>
                  <div className="flex flex-wrap justify-center gap-1">
                    {chart.hideGan[i].map((h, j) => {
                      const hi = lexiconFor(h);
                      return (
                        <span
                          key={j}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-surface-2 whitespace-nowrap"
                          title={`${h} ${hi?.pinyin ?? ''} — ${chart.shishenZhi[i][j]}`}
                        >
                          <span className="font-medium">
                            {h}
                          </span>
                          <span className="text-muted ml-0.5">{chart.shishenZhi[i][j]}</span>
                        </span>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>

            {/* 星运 — day master's growth stage in this branch */}
            <tr>
              <RowLabel cn="星运" en="growth stage" />
              {PILLARS.map((p, i) => (
                <td key={p.key} className={cellBase + dayTint(i)}>
                  <span className="text-[11px] text-body">
                    <ClickableCJK text={twelveStageOf(dayStem, branches[i])} />
                    {i === 2 && <span className="text-faint ml-1">(<ClickableCJK text="自坐" />)</span>}
                  </span>
                </td>
              ))}
            </tr>

            {/* 纳音 — the element-tone. Name is glossary-registered, so it is
                clickable like every other term on the site; the English name
                prints inline so the row is readable without any click. */}
            <tr>
              <RowLabel cn="纳音" en="element-tone" />
              {PILLARS.map((p, i) => {
                const tone = chart.nayin[i];
                const entry = nayinFor(tone);
                return (
                  <td key={p.key} className={cellBase + dayTint(i)}>
                    <div className="text-sm font-medium">
                      <ClickableCJK text={tone} />
                    </div>
                    {entry && (
                      <div className="text-[10px] text-muted leading-snug mt-0.5">
                        {entry.pinyin}
                        <span className="block text-faint">{entry.english}</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 空亡 — is this pillar's branch one of the day 旬's void seats? */}
            <tr>
              <RowLabel cn="空亡" en="void" />
              {PILLARS.map((p, i) => {
                const isVoid = chart.dayXunKong.includes(branches[i]);
                return (
                  <td key={p.key} className={cellBase + dayTint(i)}>
                    {isVoid ? (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent/15 text-accent-strong">
                        空 void
                      </span>
                    ) : (
                      <span className="text-[11px] text-faint">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-muted">
        day pillar&apos;s <ClickableCJK text="旬" /> is <span className="text-body">{chart.dayXun}</span> — its two
        void seats are <span className="text-body">{chart.dayXunKong}</span>. A branch sitting in a void seat is
        read as thin, not absent; a <ClickableCJK text="冲" /> against it can fill it (
        <ClickableCJK text="冲空则实" />, see the transit strip below).
      </div>

      <NatalRelations branches={branches} />

      {selected && <CharCard char={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/**
 * 关系 — branch relations WITHIN the natal chart: every unordered pillar pair
 * through branchInteraction, plus any 三合 group the four branches complete.
 * Structure only, in the same register as the transit strip: no lucky/unlucky
 * coloring, no verdicts.
 */
function NatalRelations({ branches }: { branches: string[] }) {
  const pairs: Array<{ label: string; branches: string; ix: Interaction[] }> = [];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const ix = branchInteraction(branches[i], branches[j]);
      if (ix.length > 0) {
        pairs.push({
          label: `${PILLARS[i].cn}${PILLARS[j].cn}`,
          branches: `${branches[i]}${branches[j]}`,
          ix,
        });
      }
    }
  }

  const groups = Array.from(
    new Set(branches.map((b) => sanHeCompletion(b, branches)).filter((g): g is string => g !== null)),
  );

  return (
    <div className="mt-3 pt-3 border-t border-line">
      <div className="text-xs text-muted mb-2">
        <ClickableCJK text="关系" /> — relations among the four branches ·{' '}
        <span className="text-faint">structure, never fortune</span>
      </div>

      {pairs.length === 0 && groups.length === 0 ? (
        <div className="text-[11px] text-faint">
          no <ClickableCJK text="合" />, <ClickableCJK text="冲" />, <ClickableCJK text="刑" /> or{' '}
          <ClickableCJK text="害" /> among these four branches — an unusually quiet plate.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <span
              key={g}
              className="text-[11px] px-2 py-1 rounded bg-accent/15 text-accent-strong"
              title={`三合 — the chart holds all three seats of the ${g} group`}
            >
              <ClickableCJK text="三合" /> {g}
            </span>
          ))}
          {pairs.map((p, i) => (
            <span key={i} className="text-[11px] px-2 py-1 rounded bg-surface-2 text-body" title={p.ix.map((x) => x.detail).join(' · ')}>
              <span className="text-faint">{p.label}</span>{' '}
              <span className="font-medium">{p.branches}</span>{' '}
              {p.ix.map((x, j) => (
                <span key={j} className="text-accent-strong ml-0.5">
                  <ClickableCJK text={x.type} />
                </span>
              ))}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CharCard({ char, onClose }: { char: string; onClose: () => void }) {
  const info = lexiconFor(char);
  if (!info) return null;
  return (
    <div className="card mt-3 p-3 flex gap-4 items-start">
      <div className="text-5xl font-bold leading-none text-accent-strong">
        {char}
      </div>
      <div className="text-sm flex-1">
        <div className="font-semibold">
          {info.pinyin} · {info.element} · {info.polarity}
          {info.animal ? ` · ${info.animal}` : ''}
        </div>
        <div className="text-muted mt-1">{info.gloss}</div>
      </div>
      <button onClick={onClose} className="text-faint text-xs shrink-0">
        ✕ close
      </button>
    </div>
  );
}
