'use client';

import { useState } from 'react';
import { CityPicker, type CitySelection } from './CityPicker';
import { randomBirth, type BirthState } from '@/lib/randomBirth';
import { newProfile, type Profile } from '@/lib/atlas';

const pad2 = (n: number) => String(n).padStart(2, '0');
const dateValue = (b: BirthState) => `${b.year}-${pad2(b.month)}-${pad2(b.day)}`;
const timeValue = (b: BirthState) => `${pad2(b.hour)}:${pad2(b.minute)}`;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_TIME_RE = /^(\d{2}):(\d{2})$/;

/** A complete, real calendar day (rejects Feb 30 etc. and out-of-range years). */
const isRealDate = (y: number, mo: number, d: number) => {
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const probe = new Date(Date.UTC(y, mo - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === mo - 1 && probe.getUTCDate() === d;
};

/**
 * Chart intake — the one form for both "compute my own chart" and "add
 * someone else's" (2026-08-28 merge: /chart and /atlas are one page now).
 * `hasSelf` tells the form whether a self-profile already exists, so a
 * first-time visitor defaults straight into "this is me" and everyone
 * after defaults into "someone else" without either state ever being
 * forced — the toggle is always there, just defaulted sensibly.
 *
 * isSelf is the doctrine hinge: self profiles skip the minors gate (you
 * cannot consent-gate yourself as a minor about yourself) and, on submit,
 * are the only profiles the chart page may offer to the research commons.
 * A profile flagged as a minor (never possible
 * when isSelf) cannot save until the one-time acknowledgment checkbox is
 * checked: this is a public app, not a private notebook, so a minor's data
 * (even stored only locally, never in the research corpus) gets one
 * deliberate extra step rather than zero friction.
 */
export function ProfileForm({
  onSave,
  onCancel,
  hasSelf,
}: {
  onSave: (p: Profile) => void;
  onCancel: () => void;
  hasSelf: boolean;
}) {
  const [isSelf, setIsSelf] = useState(!hasSelf);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [birth, setBirth] = useState<BirthState>(randomBirth());
  const [city, setCity] = useState<CitySelection | null>(null);
  const [notes, setNotes] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [minorAck, setMinorAck] = useState(false);

  const canSave = name.trim().length > 0 && (isSelf || !isMinor || minorAck);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const profile = newProfile({
      name: name.trim(),
      relation: isSelf ? undefined : relation.trim() || undefined,
      isSelf,
      birth,
      city: city?.city.name ?? null,
      lon: city?.lon ?? null,
      tz: city?.tz ?? null,
      notes: notes.trim() || undefined,
      isMinor: isSelf ? false : isMinor,
    });
    onSave(profile);
  };

  return (
    <form className="card p-4 space-y-3" onSubmit={submit}>
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setIsSelf(true)}
          className={`px-3 py-1.5 rounded ${isSelf ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted'}`}
        >
          this is me
        </button>
        <button
          type="button"
          onClick={() => setIsSelf(false)}
          className={`px-3 py-1.5 rounded ${!isSelf ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted'}`}
        >
          someone else
        </button>
      </div>

      <div className={`grid gap-3 ${isSelf ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <label className="text-sm">
          <span className="text-muted block">name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isSelf ? 'your name' : 'e.g. Kat'}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
            required
          />
        </label>
        {!isSelf && (
          <label className="text-sm">
            <span className="text-muted block">relation (optional)</span>
            <input
              type="text"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="e.g. partner, sister, friend"
              className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="text-sm">
          <span className="text-muted block">date</span>
          <input
            type="date"
            value={dateValue(birth)}
            onChange={(e) => {
              // Browsers emit partial values mid-typing (e.g. '1-02-20'); only a
              // complete, real calendar date may reach state — anything else is
              // ignored, and the native field keeps whatever the user is typing.
              const m = ISO_DATE_RE.exec(e.target.value);
              if (!m) return;
              const [y, mo, d] = m.slice(1).map(Number);
              if (!isRealDate(y, mo, d)) return;
              setBirth({ ...birth, year: y, month: mo, day: d });
            }}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
            required
          />
        </label>
        <label className="text-sm">
          <span className="text-muted block">time</span>
          <input
            type="time"
            value={timeValue(birth)}
            onChange={(e) => {
              // Same strictness as the date field: reject partial mid-typing values.
              const m = ISO_TIME_RE.exec(e.target.value);
              if (!m) return;
              const h = Number(m[1]);
              const mi = Number(m[2]);
              if (h > 23 || mi > 59) return;
              setBirth({ ...birth, hour: h, minute: mi });
            }}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
            required
          />
        </label>
        <CityPicker
          year={birth.year} month={birth.month} day={birth.day}
          hour={birth.hour} minute={birth.minute}
          onSelect={setCity}
        />
        <label className="text-sm">
          <span className="text-muted block">gender</span>
          <select
            value={birth.gender}
            onChange={(e) => setBirth({ ...birth, gender: e.target.value as 'male' | 'female' })}
            className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
          >
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
      </div>

      <label className="text-sm block">
        <span className="text-muted block">notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink"
        />
      </label>

      {isSelf ? (
        <p className="text-xs text-muted leading-relaxed">
          Entering your own birth data is consent: this chart becomes part of the research
          commons — birth inputs plus derived features, held under covenant, and listed field by
          field on the research page.
        </p>
      ) : (
        <>
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={isMinor}
              onChange={(e) => {
                setIsMinor(e.target.checked);
                if (!e.target.checked) setMinorAck(false);
              }}
              className="mt-0.5"
            />
            <span>This profile is a minor (under 18).</span>
          </label>

          {isMinor && (
            <div className="card p-3 border-accent/40 text-xs text-body leading-relaxed">
              <p className="font-medium text-accent-strong mb-1">Before saving a minor&apos;s chart</p>
              <p>
                This profile stays local to this browser and is never added to the research commons —
                the project&apos;s own rule bars minors&apos; birth data from that corpus entirely. It is
                still a real record of a real minor, stored under your account of this device. Save it
                only with appropriate authority to do so (a parent, guardian, or family member acting in
                the child&apos;s interest), and delete it if that ever stops being true.
              </p>
              <label className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={minorAck}
                  onChange={(e) => setMinorAck(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="font-medium">I understand and have the authority to save this record.</span>
              </label>
            </div>
          )}

          <p className="text-xs text-muted leading-relaxed">
            This profile stays local to this browser — never part of the research commons, never
            sent anywhere.
          </p>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSave}
          className="bg-accent text-on-accent rounded py-2 px-4 text-sm font-medium disabled:opacity-40"
        >
          {isSelf ? 'Compute my chart' : 'Save profile'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted underline hover:text-accent">
          cancel
        </button>
      </div>
    </form>
  );
}
