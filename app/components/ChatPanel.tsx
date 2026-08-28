'use client';

/**
 * ChatPanel — the destiny chat that /reading is now built around.
 *
 * Peter's call, 2026-08-27: /reading becomes an LLM chat. A list of conversations on
 * the left, one thread in the main pane, and the model composes a full reading of the
 * person's life and destiny from the computed fact sheet plus their logged events.
 *
 * The editorial fence is DELETED (same call). What remains is citation mechanics: the
 * model's sentences that cite computed facts carry their [F-ID] chips; made-up ids get
 * a FABRICATED badge; sentences citing nothing get UNCITED. Fortune language is no
 * longer flagged — that is the point of the page now.
 */

import { useEffect, useRef, useState } from 'react';
import { ClickableCJK } from './ClickableCJK';
import type { LifeEvent } from '@/lib/atlas';
import {
  deleteChat as deleteChatDb,
  getChat,
  listChats,
  newChat as newChatDb,
  newMsgId,
  saveChat,
  type Chat,
  type ChatMsg,
} from '@/lib/chat';
import type { Fact } from '@/lib/factsheet';
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

const KICKOFF =
  'Compose my full reading — my life and destiny from this chart. Begin at the beginning: ' +
  'childhood, education, relationships, work, health, faith. Then walk the decades ahead one by ' +
  'one through the 大运, and read my logged events and remedies against the pattern as you go.';

function firstTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 44 ? `${t.slice(0, 44)}…` : t;
}

function cleanSentence(text: string): string {
  return text.replace(/\[F-[A-Z0-9-]+\]/g, '').trim();
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

  const allowedIds = facts.map((f) => f.id);
  const context = [factLines(facts).join('\n'), ...lifeContextLines(events)].join('\n');

  useEffect(() => {
    void (async () => {
      const c = savedTutorConfig();
      if (c) {
        setCfg(c);
        setBaseUrl(c.baseUrl);
        setModel(c.model);
        setApiKey(c.apiKey);
        setRemember(false);
      } else {
        setShowSettings(true);
      }
      const list = await listChats();
      setChats(list);
      setActive(list.length > 0 ? list[0] : newChatDb());
      setLoaded(true);
    })();
  }, []);

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
    const c = newChatDb();
    setActive(c);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !cfg || !active || sending) return;
    setInput('');
    setError(null);
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
          history: withUser.messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: trimmed,
        },
        controller.signal,
      );
      const audit = auditTutorText(out, allowedIds);
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

  const remove = async (id: string) => {
    await deleteChatDb(id);
    if (active?.id === id) {
      const c = newChatDb();
      setActive(c);
    }
    await refreshList();
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
              logged events, and this conversation — nothing else leaves the browser.
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

        {/* thread */}
        <div className="card p-4 space-y-4 min-h-[320px]">
          {active && active.messages.length === 0 && (
            <div className="text-sm text-muted leading-relaxed">
              <p>
                A reader will compose your full reading here — your chart, your logged events, your
                life, one conversation at a time.
              </p>
              <p className="mt-2 text-xs">
                {facts.length} computed facts and {events.length} logged events will be sent with
                every message. <ClickableCJK text="善人不为命所缚" /> — read it as the tradition
                speaking, never as the machine deciding.
              </p>
            </div>
          )}

          {active &&
            active.messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-surface-2 rounded-lg rounded-tr-sm px-3 py-2 text-sm text-body">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="space-y-2">
                  {m.audit
                    ? m.audit.sentences.map((s, i) => (
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

          {error && (
            <div className="text-xs text-accent-strong">
              ⚠ {error}
            </div>
          )}
        </div>

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
              placeholder={cfg ? 'ask anything about this reading…' : 'set your model above, then ask'}
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
