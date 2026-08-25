import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMailMock, createTransportMock } = vi.hoisted(() => {
  type MailArg = {
    from?: string;
    to?: string;
    replyTo?: string;
    subject?: string;
    text?: string;
    html?: string;
  };
  const sendMailMock = vi.fn(async (_mail: MailArg) => undefined);
  const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));
  return { sendMailMock, createTransportMock };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: createTransportMock },
}));

const { sendContactEmail } = await import("@/lib/mailer");

const ENV_KEYS = [
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_TO",
  "GMAIL_USER",
  "GMAIL_PASS",
  "GMAIL_APP_PASSWORD",
  "CONTACT_TO_EMAIL",
  "CONTACT_AUTO_REPLY",
] as const;

let savedEnv: Record<string, string | undefined>;

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const validInput = {
  name: "Alice",
  email: "alice@example.com",
  message: "I would like to work with you on a project.",
};

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  setEnv({
    EMAIL_USER: "me@georgeshenoda.dev",
    EMAIL_PASS: "app-password",
    EMAIL_TO: "inbox@georgeshenoda.dev",
  });
  sendMailMock.mockClear().mockResolvedValue(undefined);
  createTransportMock.mockClear();
});

afterEach(() => {
  setEnv(savedEnv);
});

describe("sendContactEmail — validation", () => {
  it("rejects names shorter than 2 characters without sending", async () => {
    const result = await sendContactEmail({ ...validInput, name: "A" });

    expect(result).toEqual({
      success: false,
      error: "Please enter a valid name (at least 2 characters).",
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects invalid email addresses", async () => {
    for (const email of ["not-an-email", "a@b", "@example.com", "a b@c.com"]) {
      const result = await sendContactEmail({ ...validInput, email });
      expect(result.success, email).toBe(false);
      expect(result.error, email).toMatch(/email/i);
    }
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects messages shorter than 5 characters", async () => {
    const result = await sendContactEmail({ ...validInput, message: "hi" });

    expect(result.error).toBe(
      "Please enter a message with at least 5 characters."
    );
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("trims values before validating", async () => {
    const result = await sendContactEmail({
      name: "  Alice  ",
      email: " alice@example.com ",
      message: "  A perfectly valid message.  ",
    });

    expect(result.success).toBe(true);
  });
});

describe("sendContactEmail — SMTP configuration", () => {
  it("fails with a configuration error when credentials are missing", async () => {
    setEnv({ EMAIL_USER: undefined, GMAIL_USER: undefined });

    const result = await sendContactEmail(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain("EMAIL_USER");
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("falls back to GMAIL_USER / GMAIL_PASS when EMAIL_* is unset", async () => {
    setEnv({
      EMAIL_USER: undefined,
      EMAIL_PASS: undefined,
      GMAIL_USER: "gmail-fallback@gmail.com",
      GMAIL_PASS: "gmail-password",
    });

    const result = await sendContactEmail(validInput);

    expect(result.success).toBe(true);
    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "gmail",
        auth: { user: "gmail-fallback@gmail.com", pass: "gmail-password" },
      })
    );
  });

  it("prefers EMAIL_TO, then CONTACT_TO_EMAIL, then the sender account", async () => {
    // Each submission sends two mails: notification first, auto-reply second.
    await sendContactEmail(validInput);
    expect(sendMailMock.mock.calls[0][0].to).toBe("inbox@georgeshenoda.dev");

    setEnv({ EMAIL_TO: undefined, CONTACT_TO_EMAIL: "other@georgeshenoda.dev" });
    await sendContactEmail(validInput);
    expect(sendMailMock.mock.calls[2][0].to).toBe("other@georgeshenoda.dev");

    setEnv({
      CONTACT_TO_EMAIL: undefined,
      EMAIL_USER: "me@georgeshenoda.dev",
    });
    await sendContactEmail(validInput);
    expect(sendMailMock.mock.calls[4][0].to).toBe("me@georgeshenoda.dev");
  });
});

describe("sendContactEmail — outgoing mail", () => {
  it("sends the notification to the owner and replies to the visitor", async () => {
    const result = await sendContactEmail(validInput);

    expect(result).toEqual({ success: true });
    expect(sendMailMock).toHaveBeenCalledTimes(2);

    const notification = sendMailMock.mock.calls[0][0];
    expect(notification.from).toBe('"Alice (Portfolio)" <me@georgeshenoda.dev>');
    expect(notification.to).toBe("inbox@georgeshenoda.dev");
    expect(notification.replyTo).toBe("alice@example.com");
    expect(notification.subject).toBe("New Portfolio Message from Alice");
    expect(notification.text).toContain("alice@example.com");

    const autoReply = sendMailMock.mock.calls[1][0];
    expect(autoReply.to).toBe("alice@example.com");
    expect(autoReply.subject).toBe("Re: New Portfolio Message from Alice");
    expect(autoReply.html).toContain("Thank You for Your Message!");
  });

  it("strips CRLF from headers before sending", async () => {
    const result = await sendContactEmail({
      ...validInput,
      name: "Alice\r\nBcc: victim@example.com",
    });

    expect(result.success).toBe(true);
    const mail = sendMailMock.mock.calls[0][0];
    const headers: Array<keyof typeof mail> = ["from", "replyTo", "subject", "to"];
    for (const header of headers) {
      expect(String(mail[header]), header).not.toMatch(/[\r\n]/);
    }
    expect(mail.from).toBe(
      '"AliceBcc: victim@example.com (Portfolio)" <me@georgeshenoda.dev>'
    );
  });

  it("escapes HTML in the rendered email body", async () => {
    await sendContactEmail({
      ...validInput,
      name: "Eve <script>",
      message: '<img src=x onerror="alert(1)">',
    });

    const html = sendMailMock.mock.calls[0][0].html as string;
    expect(html).toContain("Eve &lt;script&gt;");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>");
  });

  it("skips the auto-reply only when CONTACT_AUTO_REPLY is 'false'", async () => {
    setEnv({ CONTACT_AUTO_REPLY: "false" });
    await sendContactEmail(validInput);
    expect(sendMailMock).toHaveBeenCalledTimes(1);

    setEnv({ CONTACT_AUTO_REPLY: "true" });
    await sendContactEmail(validInput);
    expect(sendMailMock).toHaveBeenCalledTimes(3);

    setEnv({ CONTACT_AUTO_REPLY: undefined });
    await sendContactEmail(validInput);
    expect(sendMailMock).toHaveBeenCalledTimes(5);
  });

  it("returns a generic error when SMTP rejects the message", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP connection refused"));

    const result = await sendContactEmail(validInput);

    expect(result).toEqual({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  });
});
