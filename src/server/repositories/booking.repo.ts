import 'server-only';
import { db } from '@/server/db/client';
import { Prisma } from '@/generated/prisma/client';

export type BookingInput = Prisma.BookingRequestUncheckedCreateInput;

export async function getDriverCapacity(): Promise<number> {
  const driver = await db.driver.findUnique({
    where: { id: 'singleton' },
    select: { vehicleCapacity: true },
  });
  return driver?.vehicleCapacity ?? 4;
}

export function listActiveServices() {
  return db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { key: true },
  });
}

export function findActiveServiceByKey(key: string) {
  return db.service.findFirst({ where: { key, isActive: true }, select: { id: true } });
}

export function findRecentDuplicate(dedupeHash: string, since: Date) {
  return db.bookingRequest.findFirst({
    where: { dedupeHash, createdAt: { gte: since } },
    select: { referenceCode: true },
  });
}

export async function referenceExists(referenceCode: string): Promise<boolean> {
  const row = await db.bookingRequest.findUnique({ where: { referenceCode }, select: { id: true } });
  return row !== null;
}

/** One atomic write: the booking plus its pending notification rows (the email outbox). */
export function insertBooking(
  data: BookingInput,
  notifications: Array<'new_request' | 'customer_confirmation'>,
) {
  return db.bookingRequest.create({
    data: { ...data, notifications: { create: notifications.map((type) => ({ type })) } },
    select: { id: true, referenceCode: true },
  });
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}