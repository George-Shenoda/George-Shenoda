import { NextRequest } from "next/server";
import {
  clearSessionCookie,
  revokeSession,
  SESSION_COOKIE,
} from "@/lib/admin/auth";
import { getRedis, redisConfigured } from "@/lib/admin/store";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && redisConfigured()) {
    try {
      await revokeSession(getRedis(), token);
    } catch {
      // Best-effort revocation; the cookie is cleared regardless.
    }
  }
  const response = Response.json({ success: true });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}