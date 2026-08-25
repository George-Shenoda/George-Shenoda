import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { createOutbox, submitContact } from "@portfolio/shared";
import type { OutboxItem, OutboxStorage } from "@portfolio/shared";
import { CONTACT_URL, server } from "../setup/msw";

function createMemoryStorage(initial: OutboxItem[] = []) {
  let items: OutboxItem[] = structuredClone(initial);
  const storage: OutboxStorage = {
    async read() {
      return structuredClone(items);
    },
    async write(next: OutboxItem[]) {
      items = structuredClone(next);
    },
  };
  return {
    storage,
    snapshot: (): OutboxItem[] => structuredClone(items),
  };
}

describe("feature: visitor goes offline, messages queue, then deliver", () => {
  it("queues while offline and flushes everything once the API recovers", async () => {
    const receivedBodies: unknown[] = [];

    // Network is down: every attempt dies before reaching the server.
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () => HttpResponse.error())
    );

    const { storage, snapshot } = createMemoryStorage();
    const outbox = createOutbox({
      storage,
      submit: (payload) => submitContact(CONTACT_URL, payload),
      maxAttempts: 3,
    });

    await outbox.add({
      name: "Offline Olivia",
      email: "olivia@example.com",
      message: "Sent while the tunnel was down.",
    });
    await outbox.add({
      name: "Offline Omar",
      email: "omar@example.com",
      message: "Me too, from the same dead network.",
    });

    expect(await outbox.pendingCount()).toBe(2);

    // Flushing while still offline keeps both messages queued.
    // NOTE: the outbox only persists attempt counters when something was sent
    // or dropped — a pure-failure flush reports attempts in its result but
    // leaves stored items untouched.
    const failedFlush = await outbox.flush();
    expect(failedFlush.sent).toBe(0);
    expect(failedFlush.dropped).toEqual([]);
    expect(await outbox.pendingCount()).toBe(2);
    expect(failedFlush.remaining[0]).toMatchObject({ attempts: 1 });
    expect(snapshot()[0]).toMatchObject({ attempts: 0 });

    // Network is restored.
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, async ({ request }) => {
        receivedBodies.push(await request.json());
        return HttpResponse.json({ success: true });
      })
    );

    const recoveredFlush = await outbox.flush();

    expect(recoveredFlush).toMatchObject({ sent: 2 });
    expect(recoveredFlush.remaining).toEqual([]);
    expect(recoveredFlush.dropped).toEqual([]);
    expect(await outbox.pendingCount()).toBe(0);
    expect(snapshot()).toEqual([]);
    expect(receivedBodies).toHaveLength(2);
    expect(receivedBodies.map((b) => (b as { name: string }).name)).toEqual([
      "Offline Olivia",
      "Offline Omar",
    ]);
  });

  it("stops mid-flush when the network drops again between messages", async () => {
    let calls = 0;

    const { storage, snapshot } = createMemoryStorage();
    const outbox = createOutbox({
      storage,
      submit: (payload) => submitContact(CONTACT_URL, payload),
    });

    for (const name of ["First", "Second", "Third"]) {
      await outbox.add({ name, email: `${name.toLowerCase()}@example.com`, message: "Hello" });
    }

    // First request succeeds; the connection dies right after.
    server.use(
      http.post(
        `${CONTACT_URL}/api/contact`,
        () => {
          calls += 1;
          if (calls === 1) return HttpResponse.json({ success: true });
          return HttpResponse.error();
        }
      )
    );

    const result = await outbox.flush();

    expect(result.sent).toBe(1);
    expect(result.dropped).toEqual([]);
    expect(await outbox.pendingCount()).toBe(2);
    expect(snapshot()[0]).toMatchObject({ attempts: 1, lastError: expect.any(String) });
    expect(snapshot()[1]).toMatchObject({ attempts: 0 });
  });

  it("keeps retrying a lone permanently-failing message (attempt counter resets between pure-failure flushes)", async () => {
    const { storage } = createMemoryStorage();
    const outbox = createOutbox({
      storage,
      submit: (payload) => submitContact(CONTACT_URL, payload),
      maxAttempts: 2,
    });

    // The API always rejects this one with a validation error — never retryable.
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () =>
        HttpResponse.json({ error: "Unprocessable." }, { status: 422 })
      )
    );

    await outbox.add({
      name: "Poison Patty",
      email: "patty@example.com",
      message: "This will keep failing.",
    });

    for (let round = 1; round <= 3; round++) {
      const result = await outbox.flush();
      expect(result.sent, `round ${round}`).toBe(0);
      expect(result.dropped, `round ${round}`).toEqual([]);
      expect(result.remaining, `round ${round}`).toHaveLength(1);
      expect(result.remaining[0], `round ${round}`).toMatchObject({
        attempts: 1,
        lastError: "Unprocessable.",
      });
      expect(await outbox.pendingCount(), `round ${round}`).toBe(1);
    }

    // Consequence of stop-at-first-failure + unpersisted attempts:
    // a failing head-of-line message blocks every later message forever.
    await outbox.add({
      name: "Healthy Hank",
      email: "hank@example.com",
      message: "This one would go through.",
    });

    server.use(
      http.post(`${CONTACT_URL}/api/contact`, async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return body.name === "Healthy Hank"
          ? HttpResponse.json({ success: true })
          : HttpResponse.json({ error: "Unprocessable." }, { status: 422 });
      })
    );

    const blocked = await outbox.flush();
    expect(blocked.sent).toBe(0); // Hank never gets a turn
    expect(await outbox.pendingCount()).toBe(2);
    expect((await outbox.list()).map((item) => item.payload.name)).toEqual([
      "Poison Patty",
      "Healthy Hank",
    ]);
  });
});
