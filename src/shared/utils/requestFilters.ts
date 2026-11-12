import { BOOKING_STATUSES, type BookingStatusName } from '@/shared/constants/status';

export const PAGE_SIZE = 20;

export type ListFilters = {
  q: string;
  status: BookingStatusName | '';
  from: string; // YYYY-MM-DD, Kigali date
  to: string;
  spam: boolean;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const asDate = (value: string | string[] | undefined) => {
  const s = first(value) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
};

/** Turns the page's query string into safe filter values. Anything unexpected is ignored. */
export function parseListParams(raw: Raw): ListFilters {
  const statusRaw = first(raw.status) ?? '';
  const status = (BOOKING_STATUSES as readonly string[]).includes(statusRaw) ? (statusRaw as BookingStatusName) : '';
  const page = Number.parseInt(first(raw.page) ?? '1', 10);

  return {
    q: (first(raw.q) ?? '').trim().slice(0, 100),
    status,
    from: asDate(raw.from),
    to: asDate(raw.to),
    spam: first(raw.spam) === '1',
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 1000) : 1,
  };
}

/** Builds the query string for a link to a given page, keeping the current filters. */
export function buildQuery(filters: ListFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.spam) params.set('spam', '1');
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}