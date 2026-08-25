import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendContactEmailMock } = vi.hoisted(() => ({
  sendContactEmailMock: vi.fn(),
}));

vi.mock("@/lib/mailer", () => ({
  sendContactEmail: sendContactEmailMock,
}));

const { OPTIONS, POST } = await import("@/app/api/contact/route");

let ipCounter = 0;
const freshIp = () => `10.0.${Math.floor(++ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`;

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {}
): Request {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": freshIp(),
      origin: "http://localhost:3000",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validBody = {
  name: "Alice",
  email: "alice@example.com",
  message: "A valid contact message.",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  sendContactEmailMock.mockReset().mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OPTIONS preflight", () => {
  it("returns 204 with CORS headers", async () => {
    const response = await OPTIONS(makeRequest(validBody));

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000"
    );
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "POST"
    );
    expect(response.headers.get("access-control-allow-headers")).toContain(
      "Content-Type"
    );
  });

  it("falls back to the allowed origin for unknown origins", async () => {
    const response = await OPTIONS(makeRequest("", { origin: "https://evil.example" }));

    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000"
    );
  });
});

describe("POST /api/contact", () => {
  it("returns 200 with CORS and rate-limit headers on success", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(sendContactEmailMock).toHaveBeenCalledWith(validBody);
    expect(response.headers.get("x-ratelimit-limit")).toBe("5");
    expect(response.headers.get("x-ratelimit-remaining")).toBe("4");
    expect(Number(response.headers.get("x-ratelimit-reset"))).toBeGreaterThan(0);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000"
    );
  });

  it("echoes the mailer failure payload as 400", async () => {
    sendContactEmailMock.mockResolvedValue({
      success: false,
      error: "Failed to send message. Please try again later.",
    });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Failed to send message. Please try again later.");
  });

  it("blocks bots that fill the honeypot field", async () => {
    const response = await POST(
      makeRequest({ ...validBody, website: "http://spam.example" })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Spam detected.");
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("accepts an empty honeypot field", async () => {
    const response = await POST(makeRequest({ ...validBody, website: "" }));

    expect(response.status).toBe(200);
  });

  it("rejects non-string fields", async () => {
    const response = await POST(
      makeRequest({ name: 123, email: validBody.email, message: validBody.message })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe(
      "name, email and message are required."
    );
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("rejects payloads missing required fields", async () => {
    for (const partial of [
      {},
      { name: "Alice" },
      { name: "Alice", email: "a@b.co" },
    ]) {
      const response = await POST(makeRequest(partial));
      expect(response.status, JSON.stringify(partial)).toBe(400);
    }
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("enforces maximum field lengths", async () => {
    const longName = await POST(makeRequest({ ...validBody, name: "a".repeat(101) }));
    const longEmail = await POST(
      makeRequest({ ...validBody, email: `${"a".repeat(243)}@example.com` })
    );
    const longMessage = await POST(
      makeRequest({ ...validBody, message: "m".repeat(5001) })
    );

    expect(longName.status).toBe(400);
    expect(await longName.json()).toEqual({
      success: false,
      error: "Name must be 100 characters or less.",
    });
    expect(longEmail.status).toBe(400);
    expect(longMessage.status).toBe(400);

    const okBoundary = await POST(
      makeRequest({ ...validBody, name: "a".repeat(100), message: "m".repeat(5000) })
    );
    expect(okBoundary.status).toBe(200);
  });

  it("returns 400 for malformed JSON bodies", async () => {
    const response = await POST(makeRequest("{invalid json"));

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Invalid request body.");
  });

  it("returns 413 when the declared content-length exceeds 10KB", async () => {
    const response = await POST(
      makeRequest(JSON.stringify(validBody), { "content-length": "20000" })
    );

    expect(response.status).toBe(413);
    expect((await response.json()).error).toBe("Request body too large.");
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("rate limits by client IP and returns 429 with headers", async () => {
    const ip = freshIp();
    const statuses: number[] = [];
    let lastResponse!: Response;

    for (let i = 0; i < 7; i++) {
      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify(validBody),
      });
      lastResponse = await POST(request);
      statuses.push(lastResponse.status);
    }

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
    expect(statuses[6]).toBe(429);
    expect(lastResponse.headers.get("x-ratelimit-remaining")).toBe("0");
    const body = await lastResponse.json();
    expect(body.error).toMatch(/too many requests/i);
    expect(sendContactEmailMock).toHaveBeenCalledTimes(5);
  });

  it("does not count rejected requests toward a different IP's limit", async () => {
    const blocked = await POST(makeRequest(validBody, { "x-forwarded-for": "10.9.9.9" }));
    expect(blocked.status).toBe(200);

    const other = await POST(makeRequest(validBody, { "x-forwarded-for": "10.8.8.8" }));
    expect(other.status).toBe(200);
    expect(other.headers.get("x-ratelimit-remaining")).toBe("4");
  });
});
