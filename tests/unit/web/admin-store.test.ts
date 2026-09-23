import { describe, expect, it } from "vitest";
import { projects as bundledProjects } from "@portfolio/shared";
import {
  readProjects,
  writeProjects,
  type AdminRedis,
} from "@/lib/admin/store";

class FakeRedis implements AdminRedis {
  private data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.data.get(key) as T | undefined) ?? null;
  }

  async set(key: string, value: unknown): Promise<unknown> {
    this.data.set(key, value);
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      this.data.delete(key);
      deleted += 1;
    }
    return deleted;
  }
}

describe("readProjects", () => {
  it("falls back to the bundled list when Redis is unavailable", async () => {
    const projects = await readProjects();
    expect(projects).toEqual(bundledProjects);
  });

  it("reads stored projects from Redis", async () => {
    const redis = new FakeRedis();
    const stored = [{ ...bundledProjects[0], id: "overridden" }];
    await writeProjects(stored, redis);

    const projects = await readProjects(redis);
    expect(projects).toEqual(stored);
  });

  it("seeds the store from the bundled list on first load", async () => {
    const redis = new FakeRedis();
    const projects = await readProjects(redis);
    expect(projects).toEqual(bundledProjects);

    const second = await readProjects(redis);
    expect(second).toEqual(bundledProjects);
  });

  it("fails closed to the bundled list when the store errors", async () => {
    const redis = new FakeRedis();
    redis.get = async () => {
      throw new Error("redis down");
    };
    const projects = await readProjects(redis);
    expect(projects).toEqual(bundledProjects);
  });
});