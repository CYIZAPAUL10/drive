import 'server-only';
import * as repo from '@/server/repositories/customerAdmin.repo';
import { normalizePhone } from '@/shared/utils/phone';
import { parseCustomerParams, CUSTOMER_PAGE_SIZE } from '@/shared/utils/customerFilters';
import type { CustomerDetail, CustomerRow } from '@/shared/types/customers';

type ListItem = Awaited<ReturnType<typeof repo.listCustomers>>['items'][number];

function toRow(c: ListItem): CustomerRow {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    emailVerified: c.emailVerified,
    hasPassword: c.hasPassword,
    hasGoogle: c.googleId !== null,
    createdAt: c.createdAt.toISOString(),
    requestCount: c._count.bookings,
  };
}

export async function listForAdmin(raw: Record<string, string | string[] | undefined>) {
  const filters = parseCustomerParams(raw);
  const { items, total } = await repo.listCustomers(
    { q: filters.q, status: filters.status },
    filters.page,
    CUSTOMER_PAGE_SIZE,
  );
  return {
    filters,
    items: items.map(toRow),
    total,
    pageCount: Math.max(1, Math.ceil(total / CUSTOMER_PAGE_SIZE)),
    notice: raw.deleted === '1' ? ('deleted' as const) : undefined,
  };
}

export async function getCustomerForAdmin(id: string): Promise<(CustomerDetail & { totalRequests: number }) | null> {
  const c = await repo.findDetail(id);
  if (!c) return null;
  return {
    ...toRow(c),
    preferredLanguage: c.preferredLanguage,
    totalRequests: c._count.bookings,
    requests: c.bookings.map((b) => ({
      id: b.id,
      referenceCode: b.referenceCode,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
  };
}

export function editCustomer(input: { id: string; fullName: string; phone: string; language: string }) {
  return repo.updateDetails(input.id, {
    fullName: input.fullName,
    phone: input.phone === '' ? '' : (normalizePhone(input.phone) ?? input.phone),
    preferredLanguage: input.language === 'rw' || input.language === 'fr' ? input.language : 'en',
  });
}

export const deleteCustomer = (id: string, keepRequests: boolean) => repo.remove(id, keepRequests);