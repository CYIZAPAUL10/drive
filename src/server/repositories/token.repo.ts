import 'server-only';
import { db } from '@/server/db/client';

export type TokenKind = 'verify' | 'reset';

/** Only the hash of a token is ever stored. A new token replaces any unused older one. */
export async function replaceToken(identifier: string, type: TokenKind, tokenHash: string, expiresAt: Date) {
  await db.$transaction([
    db.emailToken.deleteMany({ where: { identifier, type, usedAt: null } }),
    db.emailToken.create({ data: { identifier, type, tokenHash, expiresAt } }),
  ]);
}

/** Uses up a valid token. Only one caller can win. Returns who it belongs to, or null. */
export async function consume(tokenHash: string, type: TokenKind, now: Date): Promise<string | null> {
  const claimed = await db.emailToken.updateMany({
    where: { tokenHash, type, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  if (claimed.count !== 1) return null;
  const row = await db.emailToken.findUnique({ where: { tokenHash }, select: { identifier: true } });
  return row?.identifier ?? null;
}

/** Checks a token without using it (to decide whether to show the reset form). */
export async function isValid(tokenHash: string, type: TokenKind, now: Date): Promise<boolean> {
  const row = await db.emailToken.findFirst({
    where: { tokenHash, type, usedAt: null, expiresAt: { gt: now } },
    select: { id: true },
  });
  return row !== null;
}

export const deleteForIdentifier = (identifier: string) => db.emailToken.deleteMany({ where: { identifier } });