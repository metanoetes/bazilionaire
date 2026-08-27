'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES, COUNTRY_NAMES, type CityEntry } from '@/lib/cities';
import { tzOffsetHours } from '@/lib/tzresolve';

export interface CitySelection {
  city: CityEntry;
  lon: number;
  tz: number;
}

function label(c: CityEntry): string {
  const country = COUNTRY_NAMES[c.cc] ?? c.cc;
  return c.admin ? `${c.name}, ${c.admin} · ${country}` : `${c.name} · ${country}`;
}

/**
 * City typeahead → resolves longitude + the UTC offset valid AT THE BIRTH
 * DATE (DST and historical zone rules included, via the browser's IANA tzdb).
 */
export function CityPicker({
  year,
  month,
  day,
  hour,
  minute,
  onSelect,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  onSelect: (sel: CitySelection | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState<CityEntry | null>(null);
  const [tzNote, setTzNote] = useState<string>('');
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts: CityEntry[] = [];
    const contains: CityEntry[] = [];
    for (const c of CITIES) {
      const n = c.name.toLowerCase();
      if (n.startsWith(q)) {
        starts.push(c);
        if (starts.length >= 7) break;
      } else if (contains.length < 7 && n.includes(q)) {
        contains.push(c);
      }
    }
    return [...starts, ...contains].slice(0, 7);
  }, [query]);

  // re-resolve the offset whenever the selected city or birth date changes
  useEffect(() => {
    if (!selected) return;
    const off = tzOffsetHours(selected.tz, year, month, day, hour, minute);
    if (off === null) {
      setTzNote(`${selected.tz} — this browser cannot resolve its history; offset unknown`);
      onSelect(null);
      return;
    }
    setTzNote(`${selected.tz} · UTC${off >= 0 ? '+' : ''}${off} on this date`);
    onSelect({ city: selected, lon: selected.lon, tz: off });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, year, month, day, hour, minute]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const choose = (c: CityEntry) => {
    setSelected(c);
    setQuery(c.name);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative sm:col-span-2">
      <label className="text-sm block">
        <span className="text-muted block">birth city</span>
        <input
          type="text"
          value={query}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls="city-picker-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            open && matches.length > 0 ? `city-picker-option-${highlight}` : undefined
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setTzNote('');
            onSelect(null);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || matches.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => (h + 1) % matches.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => (h - 1 + matches.length) % matches.length);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              choose(matches[highlight]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="e.g. Manila, Beijing, Los Angeles"
          className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
          autoComplete="off"
        />
      </label>
      {selected && tzNote && (
        <div className="text-[11px] text-muted mt-0.5">
          {selected.name}: lon {selected.lon} · {tzNote}
        </div>
      )}
      {open && matches.length > 0 && !selected && (
        <ul
          id="city-picker-listbox"
          role="listbox"
          className="absolute z-10 left-0 right-0 mt-1 bg-surface border border-line rounded shadow-lg max-h-56 overflow-y-auto text-sm"
        >
          {matches.map((c, i) => (
            <li key={`${c.name}|${c.cc}|${c.admin}`} id={`city-picker-option-${i}`} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onClick={() => choose(c)}
                onMouseEnter={() => setHighlight(i)}
                className={
                  'w-full text-left px-3 py-1.5 ' + (i === highlight ? 'bg-surface-2' : '')
                }
              >
                {label(c)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
