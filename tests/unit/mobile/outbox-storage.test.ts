import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OutboxItem } from "@portfolio/shared";

const AsyncStorageMock = vi.hoisted(() => ({
  getItem: vi.fn<(key: string) => Promise<string | null>>(async () => null),
  setItem: vi.fn<(key: string, value: string) => Promise<void>>(
    async () => undefined
  ),
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: AsyncStorageMock,
}));

const { createAsyncStorageStorage } = await import("@mobile/outbox-storage");

function makeItem(overrides: Partial<OutboxItem> = {}): OutboxItem {
  return {
    id: "item-1",
    payload: { name: "Alice", email: "alice@example.com", message: "Hello there" },
    queuedAt: 1_000,
    attempts: 0,
    ...overrides,
  };
}

beforeEach(() => {
  AsyncStorageMock.getItem.mockReset().mockResolvedValue(null);
  AsyncStorageMock.setItem.mockReset().mockResolvedValue(undefined);
});

describe("createAsyncStorageStorage.read", () => {
  it("returns [] when nothing is stored", async () => {
    const storage = createAsyncStorageStorage("outbox");
    await expect(storage.read()).resolves.toEqual([]);
    expect(AsyncStorageMock.getItem).toHaveBeenCalledWith("outbox");
  });

  it("returns stored items on a valid array payload", async () => {
    const items = [makeItem()];
    AsyncStorageMock.getItem.mockResolvedValue(JSON.stringify(items));
    const storage = createAsyncStorageStorage("outbox");
    await expect(storage.read()).resolves.toEqual(items);
  });

  it("returns [] on corrupt JSON instead of throwing", async () => {
    AsyncStorageMock.getItem.mockResolvedValue("{broken");
    const storage = createAsyncStorageStorage("outbox");
    await expect(storage.read()).resolves.toEqual([]);
  });

  it("returns [] when the stored value is not an array", async () => {
    AsyncStorageMock.getItem.mockResolvedValue('{"id":1}');
    const storage = createAsyncStorageStorage("outbox");
    await expect(storage.read()).resolves.toEqual([]);
  });

  it("returns [] when AsyncStorage itself rejects", async () => {
    AsyncStorageMock.getItem.mockRejectedValue(new Error("storage unavailable"));
    const storage = createAsyncStorageStorage("outbox");
    await expect(storage.read()).resolves.toEqual([]);
  });
});

describe("createAsyncStorageStorage.write", () => {
  it("serializes items to JSON under the given key", async () => {
    const storage = createAsyncStorageStorage("outbox");
    const items = [makeItem(), makeItem({ id: "item-2" })];

    await storage.write(items);

    expect(AsyncStorageMock.setItem).toHaveBeenCalledTimes(1);
    const [key, raw] = AsyncStorageMock.setItem.mock.calls[0];
    expect(key).toBe("outbox");
    expect(JSON.parse(raw)).toEqual(items);
  });
});
