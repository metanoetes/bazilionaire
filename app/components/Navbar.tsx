'use client';

// Sticky global navbar, mounted once in layout.tsx so it appears on every
// route. Desktop (md+): full link row inline. Below md: brand + hamburger
// that opens an overlay dropdown panel (positioned like CityPicker's
// suggestion list — absolute, over content, not pushing it down). Closes
// on route change, outside click, or Escape — same dismiss convention as
// CityPicker / ClickableCJK's GlossPopover.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/', label: '解盘 reading' },
  { href: '/atlas', label: '命谱 atlas' },
  { href: '/curriculum', label: 'curriculum' },
  { href: '/trust/research', label: 'research' },
];

/** Strip a trailing slash (except the bare root) so trailingSlash:true
 *  export paths ('/chart/') compare cleanly against href strings ('/chart'). */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function isActive(pathname: string, href: string): boolean {
  const p = normalize(pathname);
  const h = normalize(href);
  return p === h || p.startsWith(`${h}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Route changed (link click, back/forward) — always close the panel.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const linkClass = (href: string) =>
    'transition-colors ' +
    (isActive(pathname, href) ? 'text-accent-strong' : 'text-muted hover:text-accent');

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-sm font-bold tracking-wide text-ink shrink-0"
        >
          bazi·lion·aire
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="navbar-mobile-panel"
          className="md:hidden h-9 w-9 flex items-center justify-center rounded border border-line text-ink shrink-0"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div
          id="navbar-mobile-panel"
          className="md:hidden absolute inset-x-0 top-full bg-surface border-b border-line shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  'py-2.5 text-sm border-b border-line-soft last:border-b-0 ' + linkClass(l.href)
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
