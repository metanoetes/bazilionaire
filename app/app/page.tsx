'use client';

/**
 * The home page IS the chat — nothing else (Peter, 2026-08-27: make it minimal;
 * drop the headers, banners and explainers; just display the chat interface).
 *
 * The reader's opening prompt asks for the five things a chart needs: name,
 * birthday, birth hour, location, sex. Chart context still comes from the last
 * research record queued by /chart (entry-as-consent) or from the chat's own
 * birth-data confirmation, which saves the profile into the atlas.
 */

import { useEffect, useMemo, useState } from 'react';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ChatPanel } from '@/components/ChatPanel';
import { listProfiles, type LifeEvent } from '@/lib/atlas';
import { factsheet, type Fact } from '@/lib/factsheet';
import { queuedContributions, type ResearchRecord } from '@/lib/research';

export default function HomePage() {
  // undefined = still reading storage (SSR/first paint), null = nothing stored.
  const [record, setRecord] = useState<ResearchRecord | null | undefined>(undefined);
  const [year, setYear] = useState<number | null>(null);
  const [events, setEvents] = useState<LifeEvent[]>([]);

  useEffect(() => {
    const queue = queuedContributions();
    setRecord(queue.length > 0 ? queue[queue.length - 1] : null);
    setYear(new Date().getFullYear());
  }, []);

  // The matching atlas profile supplies the person's own record: logged events and
  // remedies, matched on the birth data itself (date/time/gender/hour school).
  useEffect(() => {
    if (!record) return;
    const b = record.birth;
    void (async () => {
      const profiles = await listProfiles();
      const match = profiles.find(
        (p) =>
          p.birth.year === b.year &&
          p.birth.month === b.month &&
          p.birth.day === b.day &&
          p.birth.hour === b.hour &&
          p.birth.minute === b.minute &&
          p.birth.gender === b.gender &&
          p.birth.hourSchool === b.hourSchool,
      );
      setEvents(match?.events ?? []);
    })();
  }, [record]);

  const chart: Chart | null = useMemo(() => {
    if (!record) return null;
    const b = record.birth;
    const location = b.lon !== null && b.tz !== null ? { lonDeg: b.lon, tzHours: b.tz } : undefined;
    return computeChart(
      b.year, b.month, b.day, b.hour, b.minute,
      location,
      b.gender === 'male' ? 1 : 0,
      b.hourSchool,
    );
  }, [record]);

  const facts: Fact[] = useMemo(
    () => (chart && year ? factsheet(chart, { year }) : []),
    [chart, year],
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <ChatPanel facts={facts} events={events} />
    </main>
  );
}
