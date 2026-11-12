import 'server-only';
import { db } from '@/server/db/client';
import { Prisma } from '@/generated/prisma/client';

export type CustomerRepoFilters = { q: string; status: '' | 'confirmed' | 'unconfirmed' };

const ROW_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  emailVerified: true,
  hasPassword: true,
  googleId: true,
  createdAt: true,
  _count: { select: { bookings: true } },
} satisfies Prisma.CustomerSelect;

function buildWhere(f: CustomerRepoFilters): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = {};
  if (f.status === 'confirmed') where.emailVerified = true;
  if (f.status === 'unconfirmed') where.emailVerified = false;
  if (f.q) {
    const or: Prisma.CustomerWhereInput[] = [
      { fullName: { contains: f.q, mode: 'insensitive' } },
      { email: { contains: f.q, mode: 'insensitive' } },
    ];
    // Phones are stored as +250781234567, but people type 0781234567: search the part after the zero
    const digits = f.q.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length >= 4) or.push({ phone: { contains: digits } });
    where.OR = or;
  }
  return where;
}

export async function listCustomers(filters: CustomerRepoFilters, page: number, pageSize: number) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ROW_SELECT,
    }),
    db.customer.count({ where }),
  ]);
  return { items, total };
}

export function findDetail(id: string) {
  return db.customer.findUnique({
    where: { id },
    select: {
      ...ROW_SELECT,
      preferredLanguage: true,
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          referenceCode: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function updateDetails(
  id: string,
  data: { fullName: string; phone: string; preferredLanguage: 'en' | 'rw' | 'fr' },
): Promise<boolean> {
  const result = await db.customer.updateMany({ where: { id }, data });
  return result.count === 1;
}

/**
 * Deletes a customer in one all-or-nothing step. With keepRequests, their requests are turned back into
 * guest requests first. Otherwise they are deleted with the account (cascade), emails log included.
 */
export async function remove(id: string, keepRequests: boolean): Promise<boolean> {
  const steps: Prisma.PrismaPromise<unknown>[] = [];
  if (keepRequests) {
    steps.push(db.bookingRequest.updateMany({ where: { customerId: id }, data: { customerId: null } }));
  }
  steps.push(db.emailToken.deleteMany({ where: { identifier: id } }));
  steps.push(db.customer.deleteMany({ where: { id } }));
  const results = await db.$transaction(steps);
  return (results[results.length - 1] as { count: number }).count === 1;
}