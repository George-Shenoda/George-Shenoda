import type { ContactPayload, ContactResult } from "./contact-client";

export type OutboxItem = {
  id: string;
  payload: ContactPayload;
  queuedAt: number;
  attempts: number;
  lastError?: string;
};

export type OutboxStorage = {
  read(): Promise<OutboxItem[]>;
  write(items: OutboxItem[]): Promise<void>;
};

export type FlushResult = {
  sent: number;
  remaining: OutboxItem[];
  dropped: OutboxItem[];
};

export type Outbox = {
  add(payload: ContactPayload): Promise<OutboxItem>;
  list(): Promise<OutboxItem[]>;
  pendingCount(): Promise<number>;
  flush(): Promise<FlushResult>;
  clear(): Promise<void>;
};

type OutboxOptions = {
  storage: OutboxStorage;
  submit: (payload: ContactPayload) => Promise<ContactResult>;
  /** Give up on an item after this many failed attempts. Default 10. */
  maxAttempts?: number;
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createOutbox(options: OutboxOptions): Outbox {
  const { storage, submit, maxAttempts = 10 } = options;

  async function add(payload: ContactPayload): Promise<OutboxItem> {
    const items = await storage.read();
    const item: OutboxItem = {
      id: makeId(),
      payload,
      queuedAt: Date.now(),
      attempts: 0,
    };
    await storage.write([...items, item]);
    return item;
  }

  async function list(): Promise<OutboxItem[]> {
    return storage.read();
  }

  async function pendingCount(): Promise<number> {
    return (await storage.read()).length;
  }

  async function clear(): Promise<void> {
    await storage.write([]);
  }

  /**
   * Attempts to send queued messages oldest-first. Stops at the first
   * failure (network is presumably down) and records the attempt.
   * Items exceeding maxAttempts are dropped and reported back.
   */
  async function flush(): Promise<FlushResult> {
    const items = await storage.read();
    const remaining: OutboxItem[] = [];
    const dropped: OutboxItem[] = [];
    let sent = 0;
    let stopped = false;

    for (const item of items) {
      if (stopped) {
        remaining.push(item);
        continue;
      }
      const result = await submit(item.payload);
      if (result.success) {
        sent += 1;
        continue;
      }
      const attempts = item.attempts + 1;
      const updated: OutboxItem = { ...item, attempts, lastError: result.error };
      if (attempts >= maxAttempts) {
        dropped.push(updated);
      } else {
        remaining.push(updated);
        stopped = true;
      }
    }

    if (sent > 0 || dropped.length > 0) {
      await storage.write(remaining);
    }

    return { sent, remaining, dropped };
  }

  return { add, list, pendingCount, flush, clear };
}

/**
 * window.localStorage-backed adapter for web + Electron renderer.
 * Server-side safe: reads return an empty queue outside the browser.
 */
export function createLocalStorageStorage(key: string): OutboxStorage {
  return {
    async read() {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as OutboxItem[]) : [];
      } catch {
        return [];
      }
    },
    async write(items) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, JSON.stringify(items));
    },
  };
}
