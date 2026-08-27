'use client';

import { useEffect, useState } from 'react';

const KEY = 'bazilionaire.theme';

/**
 * Fixed bottom-right light/dark toggle. Dark is the product default;
 * the choice persists in localStorage and applies before first paint
 * (see the inline script in layout.tsx).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the toggle still works for this session */
    }
  };

  return (
    <button
      onClick={flip}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full border border-line bg-surface text-accent leading-none flex items-center justify-center shadow-lg hover:border-accent transition-colors"
    >
      {theme === 'dark' ? (
        // sun — shown in dark mode, click to switch to light
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="3.75" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M9 0.75L9 2.25M9 15.75L9 17.25M3.16 3.16L4.23 4.23M13.77 13.77L14.84 14.84M0.75 9L2.25 9M15.75 9L17.25 9M3.16 14.84L4.23 13.77M13.77 4.23L14.84 3.16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // crescent moon — shown in light mode, click to switch to dark
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M15.75 9.59A6.75 6.75 0 1 1 8.41 2.25 5.25 5.25 0 0 0 15.75 9.59Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
