import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

let keyCounter = 0;
const uniqueKey = () => `rate-limit-test-${++keyCounter}`;

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("counts requests and decrements remaining", () => {
    const key = uniqueKey();
    const first = rateLimit(key);
    expect(first).toEqual({
      success: true,
      remaining: 4,
      resetAt: expect.any(Number),
    });

    const second = rateLimit(key);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(3);
    expect(second.resetAt).toBe(first.resetAt);
  });

  it("blocks the request after the limit is exhausted", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key).success).toBe(true);
    }

    const blocked = rateLimit(key);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetAt).toEqual(expect.any(Number));
  });

  it("honours a custom limit", () => {
    const key = uniqueKey();
    expect(rateLimit(key, 2).remaining).toBe(1);
    expect(rateLimit(key, 2).remaining).toBe(0);
    expect(rateLimit(key, 2).success).toBe(false);
  });

  it("keeps keys isolated from each other", () => {
    const keyA = uniqueKey();
    const keyB = uniqueKey();
    for (let i = 0; i < 5; i++) rateLimit(keyA);

    expect(rateLimit(keyA).success).toBe(false);
    expect(rateLimit(keyB).success).toBe(true);
  });

  it("keeps blocking at the exact reset timestamp (now > resetAt)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const key = uniqueKey();
    const windowMs = 60_000;
    for (let i = 0; i < 5; i++) rateLimit(key, 5, windowMs);

    vi.advanceTimersByTime(windowMs);
    expect(rateLimit(key, 5, windowMs).success).toBe(false);

    vi.advanceTimersByTime(1);
    const fresh = rateLimit(key, 5, windowMs);
    expect(fresh.success).toBe(true);
    expect(fresh.remaining).toBe(4);
  });
});

describe("getClientIp", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const request = new Request("http://localhost/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" },
    });
    expect(getClientIp(request)).toBe("203.0.113.7");
  });

  it("trims whitespace around the forwarded entry", () => {
    const request = new Request("http://localhost/api/contact", {
      headers: { "x-forwarded-for": " 198.51.100.2 , 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("198.51.100.2");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("http://localhost/api/contact", {
      headers: { "x-real-ip": "192.0.2.99" },
    });
    expect(getClientIp(request)).toBe("192.0.2.99");
  });

  it("returns 'unknown' without proxy headers", () => {
    const request = new Request("http://localhost/api/contact");
    expect(getClientIp(request)).toBe("unknown");
  });
});
