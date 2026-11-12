import 'server-only';
import { db } from '@/server/db/client';

/** Adds one hit to the counter for this key and window, and returns the new count. */
export async function hit(key: string, windowStart: Date): Promise<number> {
  const row = await db.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });
  return row.count;
}

/** Reads the counter without changing it. */
export async function count(key: string, windowStart: Date): Promise<number> {
  const row = await db.rateLimit.findUnique({
    where: { key_windowStart: { key, windowStart } },
    select: { count: true },
  });
  return row?.count ?? 0;
}