import 'server-only';
import * as repo from '@/server/repositories/ratelimit.repo';

const windowStart = (windowMs: number, now = Date.now()) => new Date(Math.floor(now / windowMs) * windowMs);

/** Fixed-window limit: counts this hit, and says whether the key is still within `max`. */
export async function allow(key: string, max: number, windowMs: number, now = Date.now()): Promise<boolean> {
  const count = await repo.hit(key, windowStart(windowMs, now));
  return count <= max;
}

/** True when the key has already used up its allowance in the current window. */
export async function isBlocked(key: string, max: number, windowMs: number): Promise<boolean> {
  return (await repo.count(key, windowStart(windowMs))) >= max;
}

export async function recordHit(key: string, windowMs: number): Promise<void> {
  await repo.hit(key, windowStart(windowMs));
}