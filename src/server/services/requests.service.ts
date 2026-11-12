import 'server-only';
import * as repo from '@/server/repositories/request.repo';
import { kigaliToUtc } from '@/shared/utils/time';
import { parseListParams, PAGE_SIZE } from '@/shared/utils/requestFilters';
import type { BookingStatusName } from '@/shared/constants/status';
import type { RequestRow, RequestDetail } from '@/shared/types/requests';

const DAY_MS = 86_400_000;

type ListItem = Awaited<ReturnType<typeof repo.listRequests>>['items'][number];

function toRow(r: ListItem): RequestRow {
  return {
    id: r.id,
    referenceCode: r.referenceCode,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    createdAt: r.createdAt.toISOString(),
    status: r.status,
    isSpam: r.isSpam,
    tripType: r.tripType,
    serviceKey: r.service.key,
  };
}

export async function listForAdmin(raw: Record<string, string | string[] | undefined>) {
  const filters = parseListParams(raw);
  const from = filters.from ? kigaliToUtc(filters.from, '00:00') : null;
  const toStart = filters.to ? kigaliToUtc(filters.to, '00:00') : null;

  const { items, total } = await repo.listRequests(
    {
      q: filters.q,
      status: filters.status,
      from,
      toExclusive: toStart ? new Date(toStart.getTime() + DAY_MS) : null, // include the whole "to" day
      includeSpam: filters.spam,
    },
    filters.page,
    PAGE_SIZE,
  );

  return {
    filters,
    items: items.map(toRow),
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    notice: raw.deleted === '1' ? ('deleted' as const) : undefined,
  };
}

export async function getRequestForAdmin(id: string): Promise<RequestDetail | null> {
  const r = await repo.findDetail(id);
  if (!r) return null;
  return {
    ...toRow(r),
    guestEmail: r.guestEmail,
    numberOfDays: r.numberOfDays,
    preferredContact: r.preferredContact,
    language: r.language,
    driverPrivateNotes: r.driverPrivateNotes,
    emails: r.notifications.map((n) => ({
      id: n.id,
      type: n.type,
      status: n.status,
      error: n.error,
      sentAt: n.sentAt ? n.sentAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

export const changeStatus = (id: string, status: BookingStatusName) => repo.updateStatus(id, status);
export const saveNotes = (id: string, notes: string | null) => repo.updateNotes(id, notes);
export const setSpam = (id: string, isSpam: boolean) => repo.updateSpam(id, isSpam);
export const removeRequest = (id: string) => repo.remove(id);