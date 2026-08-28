/**
 * Chat — the conversation store behind /reading's chat surface.
 *
 * Peter's call, 2026-08-27: /reading becomes a chat. A list of conversations on the
 * left, one thread in the main pane, the model composing a full destiny reading.
 *
 * Local-first, same doctrine as the atlas: IndexedDB, nothing leaves the browser
 * except what the reader's own endpoint call sends. Each conversation is bound to
 * the browser, and export/import rides the atlas JSON mechanism later if needed.
 *
 * Assistant messages persist their AUDIT alongside the text so a reload still shows
 * which sentences were uncited or fabricated — the badges are part of the record,
 * not just the live render.
 */
import type { TutorAudit } from './tutor';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** The citation audit, persisted for assistant messages only. */
  audit?: TutorAudit;
  at: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMsg[];
}

const DB_NAME = 'bazilionaire-chats';
const DB_VERSION = 1;
const STORE = 'chats';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable in this environment'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
    tx.oncomplete = () => db.close();
  });
}

export function newChatId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function newMsgId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Newest first, like the atlas list. Returns [] on any storage failure. */
export async function listChats(): Promise<Chat[]> {
  try {
    const all = await withStore<Chat[]>('readonly', (s) => s.getAll());
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function getChat(id: string): Promise<Chat | null> {
  try {
    const c = await withStore<Chat | undefined>('readonly', (s) => s.get(id));
    return c ?? null;
  } catch {
    return null;
  }
}

export async function saveChat(chat: Chat): Promise<boolean> {
  try {
    await withStore<IDBValidKey>('readwrite', (s) => s.put(chat));
    return true;
  } catch {
    return false;
  }
}

export async function deleteChat(id: string): Promise<boolean> {
  try {
    await withStore<undefined>('readwrite', (s) => s.delete(id));
    return true;
  } catch {
    return false;
  }
}

export function newChat(title?: string): Chat {
  const now = new Date().toISOString();
  return {
    id: newChatId(),
    title: title ?? 'new reading',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}
