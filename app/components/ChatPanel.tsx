'use client';

/**
 * ChatPanel — the destiny chat the home page is built around.
 *
 * Peter's call, 2026-08-27: land on the chat. A list of conversations on the left, one
 * thread in the main pane, and the model composes a full reading of the person's life
 * and destiny from the computed fact sheet plus their logged events.
 *
 * Since the same call: the editorial fence is DELETED. What remains is citation
 * mechanics (chips for cited facts, FABRICATED badges for made-up ids). Fortune
 * language is the point of the page now.
 *
 * The reader also explains itself: every new conversation opens with a fixed local
 * greeting — the four systems (八字 / 紫微斗数 / 奇门遁甲 / 大六壬), the Christ-centered
 * frame (we do not worship the stars; we read the creation), the monist fractal cosmos
 * that resonates into the infant at birth, and the request for birth data and name.
 *
 * When the user answers with birth data, the app recognizes it, offers a confirmation
 * panel, computes the pillars locally, and — on confirm — saves the profile into the
 * atlas (isSelf). Imported atlas profiles (right-click → import into reading, on
 * /atlas) join the context with namespaced fact ids and their key notes.
 */

import { useEffect, useRef, useState } from 'react';
import { computeChart, type Chart } from '@bazilionaire/engine';
import { ClickableCJK } from './ClickableCJK';
import { listProfiles, newProfile, saveProfile, type LifeEvent, type Profile } from '@/lib/atlas';
import {
  deleteChat as deleteChatDb,
  listChats,
  newChat as newChatDb,
  newMsgId,
  saveChat,
  type Chat,
  type ChatMsg,
} from '@/lib/chat';
import { factsheet, type Fact } from '@/lib/factsheet';
import {
  auditTutorText,
  factLines,
  lifeContextLines,
  runChat,
  savedTutorConfig,
  TUTOR_CFG_KEY,
  TUTOR_KEY_KEY,
  TUTOR_PRESETS,
  TUTOR_SYSTEM_PROMPT,
  type TutorConfig,
} from '@/lib/tutor';

const IMPORT_KEY = 'bazilionaire.importProfiles';

const KICKOFF =
  'Compose my full reading — my life and destiny from this chart. Begin at the beginning: ' +
  'childhood, education, relationships, work, health, faith. Then walk the decades ahead one by ' +
  'one through the 大运, and read my logged events and remedies against the pattern as you go.';

/** The greeting every new conversation opens with — fixed local prose, not model output.
 *  Minimal by design (Peter, 2026-08-27): one line of identity, then the ask — the five
 *  things a chart needs. */
const GREETING: Array<string> = [
  'I am the reader. I interpret Chinese astrology — 八字, 紫微斗数, 奇门遁甲, 大六壬 — as a way of reading God\u2019s creation; the stars rule no one, and we follow Jesus Christ.',
  'To begin, tell me: your name · your birthday (year, month, day) · your birth hour (and minute if you know it) · the place you were born (city is enough) · your sex.',
];

const BIRTH_RE =
  /(\d{4})\s*[年\-\/\.]\s*(\d{1,2})\s*[月\-\/\.]\s*(\d{1,2})\s*日?\s*(?:(\d{1,2})\s*[:：時时]\s*(\d{1,2})?\s*分?)?/;

interface BirthDraft {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function firstTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 44 ? `${t.slice(0, 44)}…` : t;
}

function cleanSentence(text: string): string {
  return text.replace(/\[[A-Z0-9]+\.[A-Z0-9-]+\]/g, '').replace(/\[F-[A-Z0-9-]+\]/g, '').trim();
}

/** Namespaced facts for an imported profile, so two people's F-DAYMASTER never collide. */
function namespacedLines(prefix: string, facts: Fact[]): string[] {
  return factLines(facts.map((f) => ({ ...f, id: `${prefix}.${f.id}` })));
}

export function ChatPanel({ facts, events }: { facts: Fact[]; events: LifeEvent[] }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<Chat | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cfg, setCfg] = useState<TutorConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [baseUrl, setBaseUrl] = useState(TUTOR_PRESETS[0].baseUrl);
  const [model, setModel] = useState(TUTOR_PRESETS[0].model);
  const [apiKey, setApiKey] = useState('');
  const [remember, setRemember] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Birth-data capture: a draft detected in the user's last message, awaiting confirmation.
  const [draft, setDraft] = useState<BirthDraft | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftGender, setDraftGender] = useState<'male' | 'female'>('male');
  const [savedSelf, setSavedSelf] = useState<{ profile: Profile; facts: Fact[] } | null>(null);

  // Imported atlas profiles (right-click → import into reading on /atlas).
  const [imported, setImported] = useState<Array<{ profile: Profile; facts: Fact[] }>>([]);

  useEffect(() => {
    void (async () => {
      const c = savedTutorConfig();
      if (c) {
        setCfg(c);
        setBaseUrl(c.baseUrl);
        setModel(c.model);
        setApiKey(c.apiKey);
      } else {
        setShowSettings(true);
      }
      const list = await listChats();
      setChats(list);
      setActive(list.length > 0 ? list[0] : newChatDb());
      setLoaded(true);
    })();
  }, []);

  // Load imported profiles once.
  useEffect(() => {
    void (async () => {
      try {
        const raw = localStorage.getItem(IMPORT_KEY);
        if (!raw) return;
        const ids = JSON.parse(raw) as string[];
        if (!Array.isArray(ids) || ids.length === 0) return;
        const all = await listProfiles();
        const picked = ids
          .map((id) => all.find((p) => p.id === id))
          .filter((p): p is Profile => Boolean(p))
          .slice(0, 4);
        const year = new Date().getFullYear();
        setImported(
          picked.map((profile) => {
            const b = profile.birth;
            const location =
              profile.lon !== null && profile.tz !== null
                ? { lonDeg: profile.lon as number, tzHours: profile.tz as number }
                : undefined;
            const chart = computeChart(
              b.year, b.month, b.day, b.hour, b.minute, location,
              b.gender === 'male' ? 1 : 0, b.hourSchool,
            );
            return { profile, facts: factsheet(chart, { year }) };
          }),
        );
      } catch {
        /* no imports */
      }
    })();
  }, []);

  // ---- context pack: self facts + self events + imported profiles + their notes ----
  const selfFacts = savedSelf?.facts ?? facts;
  const selfEvents = savedSelf ? (savedSelf.profile.events ?? []) : events;
  const allowedIds = new Set<string>(selfFacts.map((f) => f.id));
  const contextParts: string[] = [factLines(selfFacts).join('\n'), ...lifeContextLines(selfEvents)];
  for (const [i, imp] of imported.entries()) {
    const p = imp.profile;
    const prefix = `P${i + 1}`;
    for (const f of imp.facts) allowedIds.add(`${prefix}.${f.id}`);
    contextParts.push('');
    contextParts.push(
      `${p.name}${p.relation ? ` (${p.relation})` : ''} — a profile imported from the atlas, ` +
        `fact ids namespaced as ${prefix}.F-…`,
    );
    contextParts.push(...namespacedLines(prefix, imp.facts));
    if (p.notes?.trim()) {
      contextParts.push(`KEY NOTES ON ${p.name}: ${p.notes.trim()}`);
    }
    if (p.rebirthAt) {
      contextParts.push(`${p.name} was reborn in Christ on ${p.rebirthAt} — the same weather, a new creation.`);
    }
  }
  const context = contextParts.join('\n');

  const persistConfig = () => {
    try {
      localStorage.setItem(TUTOR_CFG_KEY, JSON.stringify({ baseUrl, model, minimize: false }));
      if (apiKey.trim().length > 0) {
        if (remember) {
          localStorage.setItem(TUTOR_KEY_KEY, apiKey.trim());
          sessionStorage.removeItem(TUTOR_KEY_KEY);
        } else {
          sessionStorage.setItem(TUTOR_KEY_KEY, apiKey.trim());
          localStorage.removeItem(TUTOR_KEY_KEY);
        }
      }
      setCfg({ baseUrl, model, apiKey: apiKey.trim() });
      setShowSettings(false);
    } catch {
      /* storage unavailable — the chat still works for this session */
    }
  };

  const refreshList = async (preferred?: Chat) => {
    const list = await listChats();
    setChats(list);
    if (preferred) {
      setActive(preferred);
    } else if (active && !list.some((c) => c.id === active.id)) {
      setActive(list.length > 0 ? list[0] : null);
    }
  };

  const startNew = () => {
    setActive(newChatDb());
  };

  const appendLocalAssistant = (chat: Chat, content: string): Chat => ({
    ...chat,
    updatedAt: new Date().toISOString(),
    messages: [
      ...chat.messages,
      { id: newMsgId(), role: 'assistant', content, at: new Date().toISOString() },
    ],
  });

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !cfg || !active || sending) return;
    setInput('');
    setError(null);

    // Birth-data capture: scan the user's message before it goes anywhere else.
    const m = trimmed.match(BIRTH_RE);
    if (m && !savedSelf) {
      const year = Number(m[1]);
      const month = Number(m[2]);
      const day = Number(m[3]);
      const hour = m[4] ? Number(m[4]) : 12;
      const minute = m[5] ? Number(m[5]) : 0;
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour <= 23 && minute <= 59) {
        setDraft({ year, month, day, hour, minute });
        setDraftName(draftName || '');
      }
    }

    const userMsg: ChatMsg = { id: newMsgId(), role: 'user', content: trimmed, at: new Date().toISOString() };
    const withUser: Chat = {
      ...active,
      title: active.title === 'new reading' ? firstTitle(trimmed) : active.title,
      updatedAt: new Date().toISOString(),
      messages: [...active.messages, userMsg],
    };
    setActive(withUser);
    await saveChat(withUser);

    setSending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const out = await runChat(
        cfg,
        {
          system: TUTOR_SYSTEM_PROMPT,
          context,
          history: withUser.messages.map((mm) => ({ role: mm.role, content: mm.content })),
          userMessage: trimmed,
        },
        controller.signal,
      );
      const audit = auditTutorText(out, [...allowedIds]);
      const reply: ChatMsg = {
        id: newMsgId(),
        role: 'assistant',
        content: out,
        audit,
        at: new Date().toISOString(),
      };
      const done: Chat = {
        ...withUser,
        updatedAt: new Date().toISOString(),
        messages: [...withUser.messages, reply],
      };
      setActive(done);
      await saveChat(done);
      await refreshList(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The request failed.');
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  };

  const confirmSaveToAtlas = async () => {
    if (!draft || !active) return;
    const birth = {
      year: draft.year,
      month: draft.month,
      day: draft.day,
      hour: draft.hour,
      minute: draft.minute,
      gender: draftGender,
      hourSchool: 'clock' as const,
    };
    const profile = newProfile({
      name: draftName.trim() || 'me',
      isSelf: true,
      birth,
      city: draftCity.trim() || null,
      isMinor: false,
    });
    const ok = await saveProfile(profile);
    if (!ok) {
      setError('The atlas could not save this profile (storage unavailable).');
      setDraft(null);
      return;
    }
    const chart: Chart = computeChart(
      birth.year, birth.month, birth.day, birth.hour, birth.minute,
      undefined,
      birth.gender === 'male' ? 1 : 0,
      birth.hourSchool,
    );
    const factsForSelf = factsheet(chart, { year: new Date().getFullYear() });
    setSavedSelf({ profile, facts: factsForSelf });
    setDraft(null);
    const done = appendLocalAssistant(
      active,
      `Saved. Your pillars — ${chart.year} ${chart.month} ${chart.day} ${chart.time} — are now in the ` +
        `atlas, and I will read your life from this chart. (Say "continue" and I will compose the full reading.)`,
    );
    setActive(done);
    await saveChat(done);
    await refreshList(done);
  };

  const remove = async (id: string) => {
    await deleteChatDb(id);
    if (active?.id === id) {
      setActive(newChatDb());
    }
    await refreshList();
  };

  const clearImports = () => {
    try {
      localStorage.removeItem(IMPORT_KEY);
    } catch {
      /* noop */
    }
    setImported([]);
  };

  if (!loaded) {
    return <div className="card p-4 text-sm text-muted">Loading your readings…</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] items-start">
      {/* ---- left rail: the list of chats ---- */}
      <aside className="card p-3 lg:sticky lg:top-4">
        <button
          onClick={startNew}
          className="w-full bg-accent text-on-accent rounded py-1.5 text-sm font-medium hover:opacity-90"
        >
          + new reading
        </button>
        <ul className="mt-3 space-y-1">
          {chats.map((c) => (
            <li key={c.id} className="flex items-stretch gap-1">
              <button
                onClick={() => setActive(c)}
                className={`flex-1 text-left text-xs rounded px-2 py-1.5 truncate ${
                  active?.id === c.id
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-muted hover:bg-surface-2 hover:text-body'
                }`}
              >
                {c.title}
                <span className="block text-[10px] text-faint">{c.messages.length} msg</span>
              </button>
              <button
                onClick={() => void remove(c.id)}
                title="delete this reading"
                className="text-faint hover:text-accent px-1 text-xs shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="mt-3 text-[11px] underline text-muted hover:text-accent"
        >
          {showSettings ? 'hide model settings' : 'model settings'}
        </button>
      </aside>

      {/* ---- main thread ---- */}
      <div className="min-w-0">
        {/* settings */}
        {showSettings && (
          <div className="card p-4 mb-4">
            <div className="text-xs text-muted mb-2 leading-relaxed">
              Your endpoint, your key, your account. The model receives the computed fact sheet, your
              logged events, the imported profiles, and this conversation — nothing else leaves the
              browser.
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-muted block">
                endpoint (OpenAI-compatible)
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                  spellCheck={false}
                />
              </label>
              <label className="text-xs text-muted block">
                model
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                  spellCheck={false}
                />
              </label>
              <label className="text-xs text-muted block sm:col-span-2">
                your API key
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                  spellCheck={false}
                  placeholder="sk-… (empty is fine for a local endpoint)"
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
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mt-0.5"
                />
                remember the key on this device — left unticked it is held only for this tab
              </label>
              <button
                onClick={persistConfig}
                className="bg-accent text-on-accent rounded px-3 py-1.5 text-sm font-medium"
              >
                save settings
              </button>
            </div>
          </div>
        )}

        {/* who's in the room */}
        {imported.length > 0 && (
          <div className="card p-2.5 mb-3 text-xs text-muted flex flex-wrap items-center gap-2">
            <span className="font-medium text-body">in the room:</span>
            {imported.map((imp) => (
              <span key={imp.profile.id} className="px-1.5 py-0.5 rounded bg-surface-2">
                {imp.profile.name}
                {imp.profile.relation ? ` (${imp.profile.relation})` : ''}
              </span>
            ))}
            <button onClick={clearImports} className="underline text-faint hover:text-accent ml-auto">
              remove from the room
            </button>
          </div>
        )}

        {/* thread */}
        <div className="card p-4 space-y-4 min-h-[320px]">
          {active && active.messages.length === 0 && (
            <div className="space-y-3 text-sm text-body leading-relaxed">
              <div className="text-[10px] uppercase tracking-wider text-faint">the reader</div>
              {GREETING.map((para, i) => (
                <p key={i}>
                  <ClickableCJK text={para} />
                </p>
              ))}
              <p className="text-xs text-muted">
                {selfFacts.length > 0
                  ? `${selfFacts.length} computed facts and ${selfEvents.length} logged events are already in context — just ask.`
                  : 'No chart is in context yet — tell me your birth data above and I will offer to save it into the atlas.'}
              </p>
            </div>
          )}

          {active &&
            active.messages.map((mm) =>
              mm.role === 'user' ? (
                <div key={mm.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-surface-2 rounded-lg rounded-tr-sm px-3 py-2 text-sm text-body">
                    {mm.content}
                  </div>
                </div>
              ) : (
                <div key={mm.id} className="space-y-2">
                  {mm.audit
                    ? mm.audit.sentences.map((s, i) => (
                        <div key={i} className="text-sm text-body leading-relaxed">
                          <ClickableCJK text={cleanSentence(s.text)} />
                          {(s.cites.length > 0 || s.unknownCites.length > 0) && (
                            <span className="inline-flex flex-wrap gap-1 ml-2 align-middle">
                              {s.cites.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-1 py-0.5 rounded bg-surface-2 text-muted font-mono"
                                >
                                  {c}
                                </span>
                              ))}
                              {s.unknownCites.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-1 py-0.5 rounded bg-accent-soft text-accent-strong font-mono"
                                  title="cites an id that does not exist"
                                >
                                  FABRICATED:{c}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      ))
                    : null}
                </div>
              ),
            )}

          {sending && <div className="text-sm text-muted animate-pulse">the reader is writing… (this can take a minute or two)</div>}

          {error && <div className="text-xs text-accent-strong">⚠ {error}</div>}
        </div>

        {/* birth-data confirmation */}
        {draft && (
          <div className="card p-4 mt-3 border-accent/50">
            <div className="text-sm text-body font-medium mb-2">
              Save these pillars into the atlas?
            </div>
            <div className="grid gap-2 sm:grid-cols-6 text-xs">
              <label className="text-muted block">
                name
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="your name"
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                birth place (city)
                <input
                  value={draftCity}
                  onChange={(e) => setDraftCity(e.target.value)}
                  placeholder="e.g. Manila"
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                year
                <input
                  type="number"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                month
                <input
                  type="number"
                  value={draft.month}
                  onChange={(e) => setDraft({ ...draft, month: Number(e.target.value) })}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                day
                <input
                  type="number"
                  value={draft.day}
                  onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                hour:minute
                <input
                  value={`${String(draft.hour).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, mi] = e.target.value.split(':').map((n) => Number(n));
                    if (!Number.isNaN(h) && h <= 23) setDraft({ ...draft, hour: h });
                    if (!Number.isNaN(mi) && mi <= 59) setDraft({ ...draft, minute: mi });
                  }}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                />
              </label>
              <label className="text-muted block">
                gender
                <select
                  value={draftGender}
                  onChange={(e) => setDraftGender(e.target.value as 'male' | 'female')}
                  className="w-full border border-line rounded px-2 py-1 bg-surface-2 text-ink text-sm mt-0.5"
                >
                  <option value="male">male</option>
                  <option value="female">female</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => void confirmSaveToAtlas()}
                className="bg-accent text-on-accent rounded px-4 py-1.5 text-sm font-medium"
              >
                confirm — save to the atlas
              </button>
              <button
                onClick={() => setDraft(null)}
                className="text-xs underline text-muted hover:text-accent px-2"
              >
                not now
              </button>
            </div>
          </div>
        )}

        {/* composer */}
        <div className="mt-3">
          <div className="flex items-stretch gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              disabled={sending}
              placeholder={cfg ? 'tell the reader your birth data, or ask anything…' : 'set your model above, then ask'}
              className="flex-1 border border-line rounded px-3 py-2 bg-surface-2 text-ink text-sm"
            />
            <button
              onClick={() => void send(input)}
              disabled={sending || !cfg}
              className="bg-accent text-on-accent rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              send
            </button>
          </div>
          {active && active.messages.length === 0 && (
            <button
              onClick={() => void send(KICKOFF)}
              disabled={sending || !cfg}
              className="mt-2 w-full border border-accent text-accent-strong rounded py-2 text-sm font-medium hover:bg-accent hover:text-on-accent disabled:opacity-50"
            >
              begin the full reading
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
