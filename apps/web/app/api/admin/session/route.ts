import { NextRequest } from "next/server";
import {
  adminPanelConfigured,
  SESSION_COOKIE,
  sessionValid,
} from "@/lib/admin/auth";
import { getRedis } from "@/lib/admin/store";

export async function GET(request: NextRequest) {
  if (!adminPanelConfigured()) {
    return Response.json({ authenticated: false });
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await sessionValid(getRedis(), token);
  return Response.json({ authenticated });
}