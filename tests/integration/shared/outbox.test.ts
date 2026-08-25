import { describe, expect, it, vi } from "vitest";
import {
  createOutbox,
  type ContactResult,
  type OutboxItem,
  type OutboxStorage,
} from "@portfolio/shared";

function makePayload(overrides: Partial<OutboxItem["payload"]> = {}) {
  return {
    name: "Alice",
    email: "alice@example.com",
    message: "Hello there",
    ...overrides,
  };
}

/** In-memory storage that clones on every read/write, mimicking real adapters. */
function createMemoryStorage(initial: OutboxItem[] = []) {
  let items: OutboxItem[] = structuredClone(initial);
  const write = vi.fn(async (next: OutboxItem[]) => {
    items = structuredClone(next);
  });
  const storage: OutboxStorage = {
    async read() {
      return structuredClone(items);
    },
    write,
  };
  return { storage, write };
}

const ok = (): Promise<ContactResult> => Promise.resolve({ success: true });
const fail = (error = "Network unreachable"): Promise<ContactResult> =>
  Promise.resolve({ success: false, error, networkError: true });

describe("createOutbox — queue management", () => {
  it("add persists a new pending item", async () => {
    const { storage } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: ok });

    const item = await outbox.add(makePayload());

    expect(item.attempts).toBe(0);
    expect(item.lastError).toBeUndefined();
    expect(item.id).toEqual(expect.any(String));
    expect(item.queuedAt).toEqual(expect.any(Number));
    expect(await outbox.pendingCount()).toBe(1);
    expect((await outbox.list())[0].payload).toEqual(makePayload());
  });

  it("generates unique ids across adds", async () => {
    const { storage } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: ok });

    const a = await outbox.add(makePayload());
    const b = await outbox.add(makePayload({ name: "Bob" }));

    expect(a.id).not.toBe(b.id);
  });

  it("clear empties the queue", async () => {
    const { storage } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: ok });
    await outbox.add(makePayload());

    await outbox.clear();

    expect(await outbox.pendingCount()).toBe(0);
  });

  it("preserves items already in storage", async () => {
    const seeded: OutboxItem[] = [
      {
        id: "seeded-1",
        payload: makePayload(),
        queuedAt: 1,
        attempts: 2,
        lastError: "older failure",
      },
    ];
    const { storage } = createMemoryStorage(seeded);
    const outbox = createOutbox({ storage, submit: ok });

    await outbox.add(makePayload({ name: "Bob" }));

    const list = await outbox.list();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("seeded-1");
    expect(list[0].attempts).toBe(2);
  });
});

describe("createOutbox — flush semantics", () => {
  it("sends everything oldest-first and empties the queue", async () => {
    const { storage } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: ok });
    await outbox.add(makePayload({ name: "First" }));
    await outbox.add(makePayload({ name: "Second" }));
    const order: string[] = [];
    const spy = vi.fn(async (payload: { name: string }) => {
      order.push(payload.name);
      return ok();
    });

    const result = await createOutbox({ storage, submit: spy }).flush();

    expect(order).toEqual(["First", "Second"]);
    expect(result.sent).toBe(2);
    expect(result.remaining).toEqual([]);
    expect(result.dropped).toEqual([]);
    expect(await outbox.pendingCount()).toBe(0);
  });

  it("stops at the first failure and leaves later items untouched", async () => {
    const { storage, write } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: ok });
    await outbox.add(makePayload({ name: "First" }));
    await outbox.add(makePayload({ name: "Second" }));
    await outbox.add(makePayload({ name: "Third" }));

    const calls: string[] = [];
    const flaky = vi.fn(async (payload: { name: string }) => {
      calls.push(payload.name);
      return payload.name === "Second" ? fail() : ok();
    });

    const result = await createOutbox({ storage, submit: flaky }).flush();

    expect(calls).toEqual(["First", "Second"]);
    expect(result.sent).toBe(1);
    expect(result.dropped).toEqual([]);
    expect(result.remaining).toHaveLength(2);
    expect(result.remaining[0]).toMatchObject({
      attempts: 1,
      lastError: "Network unreachable",
    });
    expect(result.remaining[0].payload.name).toBe("Second");
    expect(result.remaining[1]).toMatchObject({ attempts: 0 });
    expect(result.remaining[1].payload.name).toBe("Third");
    expect(write).toHaveBeenCalled();
    expect(await outbox.pendingCount()).toBe(2);
  });

  it("drops an item once its attempts reach maxAttempts", async () => {
    const { storage } = createMemoryStorage([
      {
        id: "old-1",
        payload: makePayload(),
        queuedAt: 1,
        attempts: 9,
      },
    ]);
    const outbox = createOutbox({ storage, submit: () => fail() });

    const result = await outbox.flush();

    expect(result.sent).toBe(0);
    expect(result.dropped).toHaveLength(1);
    expect(result.dropped[0]).toMatchObject({
      id: "old-1",
      attempts: 10,
      lastError: "Network unreachable",
    });
    expect(result.remaining).toEqual([]);
    expect(await outbox.pendingCount()).toBe(0);
  });

  it("honours a custom maxAttempts", async () => {
    const { storage } = createMemoryStorage([
      { id: "old-1", payload: makePayload(), queuedAt: 1, attempts: 1 },
    ]);
    const outbox = createOutbox({ storage, submit: () => fail(), maxAttempts: 2 });

    const result = await outbox.flush();

    expect(result.dropped).toHaveLength(1);
    expect(result.dropped[0].attempts).toBe(2);
  });

  it("does not persist when nothing was sent or dropped", async () => {
    const { storage, write } = createMemoryStorage();
    const outbox = createOutbox({ storage, submit: () => fail() });
    await outbox.add(makePayload());
    write.mockClear(); // add() legitimately persists the queued item

    const result = await outbox.flush();

    expect(result.sent).toBe(0);
    expect(result.dropped).toEqual([]);
    expect(write).not.toHaveBeenCalled();
    expect(await outbox.pendingCount()).toBe(1);
  });

  it("persists the empty queue after dropping all failed items", async () => {
    const { storage, write } = createMemoryStorage([
      { id: "old-1", payload: makePayload(), queuedAt: 1, attempts: 9 },
    ]);

    await createOutbox({ storage, submit: () => fail() }).flush();

    expect(write).toHaveBeenCalledTimes(1);
    expect(await storage.read()).toEqual([]);
  });

  it("flushing an empty queue is a no-op", async () => {
    const { storage, write } = createMemoryStorage();
    const submitSpy = vi.fn(ok);

    const result = await createOutbox({ storage, submit: submitSpy }).flush();

    expect(result).toEqual({ sent: 0, remaining: [], dropped: [] });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
