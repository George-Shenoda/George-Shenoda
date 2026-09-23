import { Redis } from "@upstash/redis";
import { projects as bundledProjects, type Project } from "@portfolio/shared";

export interface AdminRedis {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
}

const PROJECTS_KEY = "portfolio:projects";

let redis: Redis | null = null;

export function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

// Public read path: Redis-backed store, seeded from the bundled list on first
// load. Fails closed to the bundled list whenever Redis is absent or errs.
export async function readProjects(client?: AdminRedis): Promise<Project[]> {
  const redis = client ?? (redisConfigured() ? getRedis() : null);
  if (!redis) return bundledProjects;
  try {
    const stored = await redis.get<Project[]>(PROJECTS_KEY);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    await redis.set(PROJECTS_KEY, bundledProjects);
    return bundledProjects;
  } catch {
    return bundledProjects;
  }
}

export async function writeProjects(
  projects: Project[],
  client?: AdminRedis
): Promise<void> {
  const redis = client ?? getRedis();
  await redis.set(PROJECTS_KEY, projects);
}