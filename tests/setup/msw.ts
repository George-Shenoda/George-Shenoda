import { afterAll, afterEach, beforeAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const CONTACT_URL = "http://contact.test";

export const server = setupServer(
  http.post(`${CONTACT_URL}/api/contact`, () =>
    HttpResponse.json({ success: true })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
