import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMailMock } = vi.hoisted(() => {
  type MailArg = {
    from?: string;
    to?: string;
    replyTo?: string;
    subject?: string;
  };
  return { sendMailMock: vi.fn(async (_mail: MailArg) => undefined) };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

const { POST } = await import("@/app/api/contact/route");

let ipCounter = 0;
const visitorIp = () => `192.168.${Math.floor(++ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`;

function submit(
  body: unknown,
  ip = visitorIp()
): Promise<Response> {
  return POST(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
        origin: "http://localhost:3000",
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  vi.stubEnv("EMAIL_USER", "me@georgeshenoda.dev");
  vi.stubEnv("EMAIL_PASS", "app-password");
  vi.stubEnv("EMAIL_TO", "inbox@georgeshenoda.dev");
  delete process.env.CONTACT_AUTO_REPLY;
  sendMailMock.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("feature: a real visitor journey against the contact API", () => {
  it("delivers a human submission end-to-end (notification + auto-reply)", async () => {
    const response = await submit({
      name: "Hana",
      email: "hana@example.com",
      message: "Saw your IoT project — let's talk.",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    const [notification, autoReply] = sendMailMock.mock.calls.map(
      ([mail]) => mail
    );
    expect(notification?.to).toBe("inbox@georgeshenoda.dev");
    expect(notification?.replyTo).toBe("hana@example.com");
    expect(autoReply?.to).toBe("hana@example.com");
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000"
    );
  });

  it("blocks a bot that fills the honeypot without sending email", async () => {
    const response = await submit({
      name: "Bot",
      email: "bot@spam.example",
      message: "Buy my thing now!!!",
      website: "https://spam.example",
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Spam detected.");
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects garbage bodies before touching the mailer", async () => {
    const malformed = await submit("{not-json");
    expect(malformed.status).toBe(400);

    const oversized = await submit("x".repeat(100), visitorIp());
    // Body under 10KB but declared too large via content-length is checked first.
    const huge = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "999999",
        "x-forwarded-for": visitorIp(),
      },
      body: JSON.stringify({ name: "A", email: "a@b.co", message: "hello" }),
    });
    const tooLarge = await POST(huge);

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(400); // invalid json
    expect(tooLarge.status).toBe(413);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("throttles bursts from one visitor, then recovers after the window", async () => {
    const ip = visitorIp();
    const statuses: number[] = [];

    for (let i = 0; i < 6; i++) {
      const response = await submit(
        { name: `Burst ${i}`, email: `burst${i}@example.com`, message: "Rapid fire." },
        ip
      );
      statuses.push(response.status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    expect(sendMailMock).toHaveBeenCalledTimes(10); // 5 × (notification + auto-reply)

    vi.useFakeTimers();
    vi.advanceTimersByTime(61_000);

    const afterWindow = await submit(
      { name: "Patient", email: "patient@example.com", message: "Tried again later." },
      ip
    );
    expect(afterWindow.status).toBe(200);
    expect(sendMailMock.mock.calls.at(-1)?.[0]?.to).toBe("patient@example.com");
  });
});
