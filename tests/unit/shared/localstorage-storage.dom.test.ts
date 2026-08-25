import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalStorageStorage } from "@portfolio/shared";
import type { OutboxItem } from "@portfolio/shared";

const KEY = "contact-outbox-test";

function makeItem(overrides: Partial<OutboxItem> = {}): OutboxItem {
  return {
    id: "item-1",
    payload: { name: "Alice", email: "alice@example.com", message: "Hello there" },
    queuedAt: 1_000,
    attempts: 0,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("createLocalStorageStorage", () => {
  it("round-trips items through localStorage", async () => {
    const storage = createLocalStorageStorage(KEY);
    const items = [makeItem(), makeItem({ id: "item-2" })];

    await storage.write(items);

    expect(await storage.read()).toEqual(items);
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual(items);
  });

  it("returns an empty queue for a missing key", async () => {
    const storage = createLocalStorageStorage("missing-key");
    expect(await storage.read()).toEqual([]);
  });

  it("returns an empty queue for corrupt JSON", async () => {
    window.localStorage.setItem(KEY, "{not valid json");
    const storage = createLocalStorageStorage(KEY);
    expect(await storage.read()).toEqual([]);
  });

  it("returns an empty queue when stored value is not an array", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ id: "not-an-array" }));
    const storage = createLocalStorageStorage(KEY);
    expect(await storage.read()).toEqual([]);
  });

  it("reads return [] outside the browser (SSR guard)", async () => {
    const realLocalStorage = window.localStorage;
    vi.stubGlobal("window", undefined);
    const storage = createLocalStorageStorage(KEY);
    await expect(storage.read()).resolves.toEqual([]);
    await expect(storage.write([makeItem()])).resolves.toBeUndefined();
    expect(realLocalStorage.getItem(KEY)).toBeNull();
  });
});
