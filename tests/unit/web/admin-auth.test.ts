import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  buildSessionCookie,
  clearSessionCookie,
  createSession,
  passwordMatches,
  requireSession,
  revokeSession,
  SESSION_COOKIE,
  sessionKey,
  sessionValid,
} from "@/lib/admin/auth";
import type { AdminRedis } from "@/lib/admin/store";

class FakeRedis implements AdminRedis {
  private data = new Map<string, unknown>();
  private expires = new Map<string, number>();
  now = Date.now();

  async get<T>(key: string): Promise<T | null> {
    const exp = this.expires.get(key);
    if (exp !== undefined && exp <= this.now) {
      this.data.delete(key);
      this.expires.delete(key);
      return null;
    }
    return (this.data.get(key) as T | undefined) ?? null;
  }

  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown> {
    this.data.set(key, value);
    if (opts?.ex) this.expires.set(key, this.now + opts.ex * 1000);
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      this.data.delete(key);
      this.expires.delete(key);
      deleted += 1;
    }
    return deleted;
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("passwordMatches", () => {
  it("accepts the configured password and rejects everything else", () => {
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery");
    expect(passwordMatches("correct-horse-battery")).toBe(true);
    expect(passwordMatches("wrong-password")).toBe(false);
    expect(passwordMatches("")).toBe(false);
    expect(passwordMatches("correct-horse-battery ")).toBe(false);
  });

  it("fails closed when no password is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(passwordMatches("anything")).toBe(false);
  });
});

describe("session lifecycle", () => {
  it("creates random tokens that validate within TTL", async () => {
    const redis = new FakeRedis();
    const a = await createSession(redis);
    const b = await createSession(redis);

    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await sessionValid(redis, a)).toBe(true);
    expect(b.length).toBeGreaterThanOrEqual(43);
  });

  it("rejects missing, wrong, and revoked tokens", async () => {
    const redis = new FakeRedis();
    const token = await createSession(redis);
    await revokeSession(redis, token);

    expect(await sessionValid(redis, undefined)).toBe(false);
    expect(await sessionValid(redis, "forged")).toBe(false);
    expect(await sessionValid(redis, token)).toBe(false);
  });

  it("expires a session when its TTL elapses", async () => {
    vi.stubEnv("ADMIN_SESSION_TTL_HOURS", "0.001"); // 3.6 seconds
    const redis = new FakeRedis();
    const token = await createSession(redis);

    expect(await sessionValid(redis, token)).toBe(true);
    const before = redis.now;
    redis.now = before + 4_000; // simulate clock move past expiry
    expect(await sessionValid(redis, token)).toBe(false);
  });
});

describe("requireSession", () => {
  it("verifies the session cookie against the store", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    const redis = new FakeRedis();
    const token = await createSession(redis);

    const withCookie = new NextRequest("http://localhost/api/admin/projects", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });
    const withoutCookie = new NextRequest("http://localhost/api/admin/projects");

    expect(await requireSession(withCookie, redis)).toBe(true);
    expect(await requireSession(withoutCookie, redis)).toBe(false);
  });

  it("fails closed when Redis is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const redis = new FakeRedis();
    const token = await createSession(redis);
    const request = new NextRequest("http://localhost/api/admin/projects", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });
    expect(await requireSession(request, redis)).toBe(false);
  });
});

describe("cookies", () => {
  it("builds a hardened session cookie", () => {
    const cookie = buildSessionCookie("tok123");
    expect(cookie).toContain(`${SESSION_COOKIE}=tok123`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=");
  });

  it("clears the cookie on logout", () => {
    const cookie = clearSessionCookie();
    expect(cookie).toContain(`${SESSION_COOKIE}=;`);
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("HttpOnly");
  });

  it("stores sessions under the derived key", () => {
    expect(sessionKey("abc")).toBe("portfolio:session:abc");
  });
});