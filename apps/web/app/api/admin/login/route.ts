import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import {
  adminPanelConfigured,
  buildSessionCookie,
  createSession,
  newSessionToken,
  passwordMatches,
  SESSION_COOKIE,
  sessionValid,
} from "@/lib/admin/auth";
import { getRedis } from "@/lib/admin/store";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!adminPanelConfigured()) {
    return Response.json(
      { success: false, error: "Admin panel is not configured." },
      { status: 503 }
    );
  }

  const redis = getRedis();
  const limiter = new Ratelimit({
    redis,
    prefix: "portfolio-ratelimit",
    limiter: Ratelimit.slidingWindow(10, "15 m"),
  });

  const rate = await limiter.limit(getClientIp(request));
  if (!rate.success) {
    return Response.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  // A session that already exists is idempotent — no need to re-verify the password.
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing && (await sessionValid(redis, existing))) {
    return Response.json({ success: true });
  }

  let password: unknown;
  try {
    const body = (await request.json()) as { password?: unknown };
    password = body.password;
  } catch {
    password = undefined;
  }

  if (typeof password !== "string" || !passwordMatches(password)) {
    return Response.json({ success: false }, { status: 401 });
  }

  const token = await createSession(redis, newSessionToken());
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", buildSessionCookie(token));
  return response;
}