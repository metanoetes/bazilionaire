'use client';

// ClickableCJK renders a text string, greedily matching runs of Chinese
// characters against the site glossary (lib/glossary.ts — stems, branches,
// curriculum terms, hand-curated chrome vocabulary). A matched term is
// wrapped in a clickable span; clicking it opens a GlossPopover with its
// pinyin and English gloss (ported from the-big-learn's click-to-define
// pattern). Longest match wins, so multi-char compounds (八字, 善人不为命所缚)
// take priority over their constituent single chars.
//
// Unmatched CJK runs render bare — an honest gap, no fabricated gloss.
// Non-CJK runs (punctuation, latin, pinyin already in the text) render as
// plain text. Only pure/near-pure-Chinese text nodes should use this
// component; prose with embedded JSX (<em>, <Link>) should keep those and
// wrap the plain-string subtrees only.

import { useEffect, useState } from 'react';
import { GLOSSARY, GLOSSARY_TERMS_BY_FIRST_CHAR } from '@/lib/glossary';
import { GlossPopover } from './GlossPopover';

const CJK_RE = /[\u4e00-\u9fff]/;
function isCJK(ch: string): boolean {
  return CJK_RE.test(ch);
}

export function ClickableCJK({
  text,
  className,
  ruby = true,
}: {
  text: string;
  className?: string;
  /** Render pinyin above every glossary-matched term (Peter, 2026-08-27: "all Chinese
   *  should be printed in a font that has pinyin attached"). Unmatched CJK stays bare —
   *  the same honest-gap contract as the click gloss. Set false where the extra line
   *  height would hurt (dense tables). */
  ruby?: boolean;
}) {
  const [open, setOpen] = useState<{ term: string; el: HTMLElement } | null>(null);

  // Click anywhere outside the term or the open popover dismisses it — the
  // popover itself carries [data-gloss-popover] so clicks inside it don't
  // count as "outside" (matches the-big-learn's dismiss convention).
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-gloss-popover]')) return;
      if (target === open.el || open.el.contains(target)) return;
      setOpen(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const runes = Array.from(text);
  const out: React.ReactNode[] = [];
  let buf = '';
  let i = 0;
  const flushBuf = (key: number) => {
    if (!buf) return;
    out.push(<span key={`t-${key}`}>{buf}</span>);
    buf = '';
  };

  while (i < runes.length) {
    const r = runes[i];
    if (!isCJK(r)) {
      buf += r;
      i++;
      continue;
    }
    // Greedy longest-match: only try terms that could start with this rune
    // (indexed by first char, longest-first within the bucket) instead of
    // scanning the entire glossary at every position.
    let matched: string | null = null;
    const candidates = GLOSSARY_TERMS_BY_FIRST_CHAR.get(r);
    if (candidates) {
      for (const term of candidates) {
        const slice = runes.slice(i, i + term.length).join('');
        if (slice === term) {
          matched = term;
          break;
        }
      }
    }
    if (matched) {
      flushBuf(i);
      const term = matched;
      out.push(
        <span
          key={`w-${i}`}
          className="cjk-term"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setOpen({ term, el: e.currentTarget });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setOpen({ term, el: e.currentTarget });
            }
          }}
        >
          {ruby && GLOSSARY[term] ? (
            <ruby className="cjk-ruby">
              {term}
              <rt>{GLOSSARY[term].pinyin}</rt>
            </ruby>
          ) : (
            term
          )}
        </span>,
      );
      i += term.length;
      continue;
    }
    // No glossary match — render this one CJK char bare.
    flushBuf(i);
    out.push(<span key={`b-${i}`}>{r}</span>);
    i++;
  }
  flushBuf(i);

  return (
    <span className={className}>
      {out}
      {open && GLOSSARY[open.term] && (
        <GlossPopover
          term={open.term}
          entry={GLOSSARY[open.term]}
          anchor={open.el}
          onClose={() => setOpen(null)}
        />
      )}
    </span>
  );
}
