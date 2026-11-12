import 'server-only';
import { db } from '@/server/db/client';
import { Prisma } from '@/generated/prisma/client';
import type { BookingStatusName } from '@/shared/constants/status';

export type RepoFilters = {
  q: string;
  status: BookingStatusName | '';
  from: Date | null;
  toExclusive: Date | null;
  includeSpam: boolean;
};

const ROW_SELECT = {
  id: true,
  referenceCode: true,
  guestName: true,
  guestPhone: true,
  createdAt: true,
  status: true,
  isSpam: true,
  tripType: true,
  service: { select: { key: true } },
} satisfies Prisma.BookingRequestSelect;

function buildWhere(f: RepoFilters): Prisma.BookingRequestWhereInput {
  const where: Prisma.BookingRequestWhereInput = {};
  if (!f.includeSpam) where.isSpam = false;
  if (f.status) where.status = f.status;
  if (f.from || f.toExclusive) {
    where.createdAt = {
      ...(f.from ? { gte: f.from } : {}),
      ...(f.toExclusive ? { lt: f.toExclusive } : {}),
    };
  }
  if (f.q) {
    const or: Prisma.BookingRequestWhereInput[] = [
      { guestName: { contains: f.q, mode: 'insensitive' } },
      { referenceCode: { contains: f.q, mode: 'insensitive' } },
      { guestEmail: { contains: f.q, mode: 'insensitive' } },
    ];
    // Phones are stored as +250781234567, but people type 0781234567: search the part after the zero
    const digits = f.q.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length >= 4) or.push({ guestPhone: { contains: digits } });
    where.OR = or;
  }
  return where;
}

export async function listRequests(filters: RepoFilters, page: number, pageSize: number) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    db.bookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ROW_SELECT,
    }),
    db.bookingRequest.count({ where }),
  ]);
  return { items, total };
}

export function findDetail(id: string) {
  return db.bookingRequest.findUnique({
    where: { id },
    select: {
      ...ROW_SELECT,
      guestEmail: true,
      numberOfDays: true,
      preferredContact: true,
      language: true,
      driverPrivateNotes: true,
      notifications: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, type: true, status: true, error: true, sentAt: true, createdAt: true },
      },
    },
  });
}

export async function updateStatus(id: string, status: BookingStatusName): Promise<boolean> {
  const result = await db.bookingRequest.updateMany({ where: { id }, data: { status } });
  return result.count === 1;
}

export async function updateNotes(id: string, notes: string | null): Promise<boolean> {
  const result = await db.bookingRequest.updateMany({ where: { id }, data: { driverPrivateNotes: notes } });
  return result.count === 1;
}

export async function updateSpam(id: string, isSpam: boolean): Promise<boolean> {
  const result = await db.bookingRequest.updateMany({ where: { id }, data: { isSpam } });
  return result.count === 1;
}

export async function remove(id: string): Promise<boolean> {
  // The email log rows for this request are deleted with it (cascade)
  const result = await db.bookingRequest.deleteMany({ where: { id } });
  return result.count === 1;
}