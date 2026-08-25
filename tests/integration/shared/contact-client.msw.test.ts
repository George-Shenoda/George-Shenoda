import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { submitContact } from "@portfolio/shared";
import { CONTACT_URL, server } from "../../setup/msw";

const payload = {
  name: "Alice",
  email: "alice@example.com",
  message: "Hello from the integration test",
};

describe("submitContact", () => {
  it("posts JSON to <baseUrl>/api/contact and reports success", async () => {
    const bodies: unknown[] = [];
    let requestedUrl = "";
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, async ({ request }) => {
        requestedUrl = request.url;
        bodies.push(await request.json());
        return HttpResponse.json({ success: true });
      })
    );

    const result = await submitContact(CONTACT_URL, payload);

    expect(result).toEqual({ success: true });
    expect(requestedUrl).toBe(`${CONTACT_URL}/api/contact`);
    expect(bodies).toEqual([payload]);
  });

  it("strips a trailing slash from baseUrl", async () => {
    const urls: string[] = [];
    server.use(
      http.post("*", ({ request }) => {
        urls.push(request.url);
        return HttpResponse.json({ success: true });
      })
    );

    await submitContact(`${CONTACT_URL}/`, payload);

    expect(urls[0]).toBe(`${CONTACT_URL}/api/contact`);
  });

  it("surfaces the API error message on 4xx responses", async () => {
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () =>
        HttpResponse.json({ error: "Spam detected." }, { status: 400 })
      )
    );

    const result = await submitContact(CONTACT_URL, payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Spam detected.");
    expect(result.networkError).toBe(false);
  });

  it("falls back to a status message when the error body is not JSON", async () => {
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () =>
        new HttpResponse("Internal Server Error", { status: 500 })
      )
    );

    const result = await submitContact(CONTACT_URL, payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Request failed with status 500.");
    expect(result.networkError).toBe(false);
  });

  it("falls back to a status message when the error body has no error field", async () => {
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () =>
        HttpResponse.json({ unexpected: true }, { status: 503 })
      )
    );

    const result = await submitContact(CONTACT_URL, payload);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Request failed with status 503.");
    expect(result.networkError).toBe(false);
  });

  it("classifies connection failures as network errors (retryable)", async () => {
    server.use(
      http.post(`${CONTACT_URL}/api/contact`, () => HttpResponse.error())
    );

    const result = await submitContact(CONTACT_URL, payload);

    expect(result.success).toBe(false);
    expect(result.networkError).toBe(true);
    expect(result.error).toBe(
      "Could not reach the contact service. Please try again later."
    );
  });

  it("never marks HTTP errors as retryable network errors", async () => {
    for (const status of [400, 401, 403, 429, 500, 503]) {
      server.use(
        http.post(`${CONTACT_URL}/api/contact`, () =>
          HttpResponse.json({ error: `status ${status}` }, { status })
        )
      );
      const result = await submitContact(CONTACT_URL, payload);
      expect(result.networkError, `status ${status}`).toBe(false);
      expect(result.error, `status ${status}`).toBe(`status ${status}`);
    }
  });
});
