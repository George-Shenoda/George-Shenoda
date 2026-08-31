interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Bounded map: prevents unbounded growth if attacker spams random x-forwarded-for values
const MAX_MAP_SIZE = 5000;

function pruneExpired(now: number): void {
  // Opportunistic sweep: clean expired entries when map grows or randomly
  if (rateLimitMap.size > MAX_MAP_SIZE || Math.random() < 0.02) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }
  // Hard cap: drop oldest entries if still over limit (Map preserves insertion order)
  while (rateLimitMap.size > MAX_MAP_SIZE) {
    const oldest = rateLimitMap.keys().next().value as string | undefined;
    if (!oldest) break;
    rateLimitMap.delete(oldest);
  }
}

export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  pruneExpired(now);
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    if (entry && now > entry.resetAt) rateLimitMap.delete(key);
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(key, newEntry);
    return { success: true, remaining: limit - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  // On Vercel, x-forwarded-for is set by the edge; x-real-ip mirrors the client.
  // x-forwarded-for can be spoofed by prepending values — we take first value as
  // best-effort. For stronger guarantees use Vercel middleware or `x-vercel-forwarded-for`.
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}