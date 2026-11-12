import 'server-only';
import { db } from '@/server/db/client';

export function findByEmail(email: string) {
  return db.adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
}

export function findById(id: string) {
  return db.adminUser.findUnique({ where: { id } });
}

export function touchLogin(id: string) {
  return db.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}

export function countNewRequests() {
  return db.bookingRequest.count({ where: { status: 'NEW', isSpam: false } });
}

/** Saves a new password hash and returns the new tokenVersion, which signs out every other session. */
export async function updatePassword(id: string, passwordHash: string): Promise<number> {
  const row = await db.adminUser.update({
    where: { id },
    data: { passwordHash, tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  return row.tokenVersion;
}