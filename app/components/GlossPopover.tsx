'use client';

// GlossPopover — a speech-bubble that opens above a clicked Chinese term,
// showing its pinyin and English gloss. Ported from the-big-learn's
// CharacterPopover pattern: portaled to <body>, `position: fixed` so it
// floats above page chrome, placed above the anchor by default (reading
// flow: text above a clicked term is already-read, so the bubble never
// obstructs what's next) and flips below only when it would clip the top
// of the viewport. A small rotated-square notch points at the term's
// horizontal center, re-pointing on flip. Tracks the anchor on scroll/
// resize since the portal isn't in normal page flow.

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GlossEntry } from '@/lib/glossary';

type Placement = 'above' | 'below';
type Pos = { top: number; left: number; placement: Placement; arrowX: number } | null;

const GAP = 8;
const TOP_MARGIN = 4;

export function GlossPopover({
  term,
  entry,
  anchor,
  onClose,
}: {
  term: string;
  entry: GlossEntry;
  anchor: HTMLElement | null;
  onClose: () => void;
}) {
  const [pos, setPos] = useState<Pos>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => setMounted(true), []);

  // Depends on `mounted`: on first render the portal hasn't committed yet,
  // so this effect's initial pass would measure a null/zero-sized node.
  // Re-running once `mounted` flips true finds the real, sized bubble.
  useLayoutEffect(() => {
    if (!anchor || !mounted) return;
    const el = document.querySelector('[data-gloss-popover]') as HTMLElement | null;
    const measure = () => {
      if (!anchor) return;
      if (!anchor.isConnected) {
        onClose();
        return;
      }
      const a = anchor.getBoundingClientRect();
      const bubbleW = el?.offsetWidth ?? 0;
      const bubbleH = el?.offsetHeight ?? 0;
      const vw = document.documentElement.clientWidth;

      const roomAbove = a.top - TOP_MARGIN;
      const placement: Placement = roomAbove >= bubbleH + GAP ? 'above' : 'below';

      const center = a.left + a.width / 2;
      const margin = 8;
      const maxLeft = vw - bubbleW - margin;
      let left = center - bubbleW / 2;
      left = Math.max(margin, Math.min(left, maxLeft));

      let arrowX = center - left;
      const arrowMin = 14;
      const arrowMax = bubbleW - 14;
      arrowX = Math.max(arrowMin, Math.min(arrowX, arrowMax));

      const top = placement === 'above' ? a.top - bubbleH - GAP : a.bottom + GAP;
      // Clamp against the viewport bottom too: a tall bubble placed 'below'
      // near the bottom of a short viewport would otherwise overflow.
      const vh = document.documentElement.clientHeight;
      const maxTop = vh - bubbleH - margin;
      const clampedTop = placement === 'below' ? Math.min(top, maxTop) : top;
      setPos({ top: clampedTop, left, placement, arrowX });
    };
    measure();
    document.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    const ro = el ? new ResizeObserver(() => measure()) : null;
    if (el && ro) ro.observe(el);
    return () => {
      document.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [anchor, mounted, onClose]);

  if (!mounted) return null;

  const body = (
    <div
      role="note"
      aria-label={`Definition of ${term}`}
      aria-live="polite"
      data-gloss-popover
      className="gloss-popover"
      style={
        pos
          ? {
              position: 'fixed',
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              ['--arrow-x' as string]: `${pos.arrowX}px`,
            }
          : { position: 'fixed', top: '-9999px', left: '-9999px', visibility: 'hidden' }
      }
      data-placement={pos?.placement ?? 'above'}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-ink">{term}</span>
        <span className="text-sm text-accent-strong">({entry.pinyin})</span>
      </div>
      <div className="mt-1 text-sm text-body leading-snug">{entry.gloss}</div>
    </div>
  );

  return createPortal(body, document.body);
}
