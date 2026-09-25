import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getRedis, redisConfigured, type AdminRedis } from "./store";

export const SESSION_COOKIE = "portfolio_admin_session";

function sha256(input: string): Buffer {
  return createHash("sha256").update(input, "utf8").digest();
}

export function sessionKey(token: string): string {
  return `portfolio:session:${token}`;
}

export function sessionTtlSeconds(): number {
  const hours = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? 24);
  const safe = Number.isFinite(hours) && hours > 0 ? hours : 24;
  return Math.round(safe * 3600);
}

export function adminPanelConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && redisConfigured();
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || input.length === 0) return false;
  const actual = sha256(input);
  const wanted = sha256(expected);
  return timingSafeEqual(actual, wanted);
}

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(
  client: AdminRedis,
  token: string = newSessionToken()
): Promise<string> {
  await client.set(sessionKey(token), "1", { ex: sessionTtlSeconds() });
  return token;
}

export async function sessionValid(
  client: AdminRedis,
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    return Boolean(await client.get(sessionKey(token)));
  } catch {
    return false;
  }
}

export async function revokeSession(
  client: AdminRedis,
  token: string
): Promise<void> {
  await client.del(sessionKey(token));
}

export async function requireSession(
  request: NextRequest,
  client?: AdminRedis
): Promise<boolean> {
  if (!redisConfigured()) return false;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return sessionValid(client ?? getRedis(), token);
}

export function buildSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production";
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${sessionTtlSeconds()}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}