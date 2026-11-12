import 'server-only';
import { db } from '@/server/db/client';
import type { Prisma } from '@/generated/prisma/client';

export const listAll = () => db.socialLink.findMany({ select: { platform: true, url: true } });

/** Saves the filled boxes and removes the blank ones, all together or not at all. */
export async function saveAll(entries: Array<{ platform: string; url: string }>, removals: string[]): Promise<void> {
  const steps: Prisma.PrismaPromise<unknown>[] = entries.map((e) =>
    db.socialLink.upsert({ where: { platform: e.platform }, create: e, update: { url: e.url } }),
  );
  if (removals.length > 0) steps.push(db.socialLink.deleteMany({ where: { platform: { in: removals } } }));
  await db.$transaction(steps);
}