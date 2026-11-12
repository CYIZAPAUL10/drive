export const CUSTOMER_PAGE_SIZE = 20;

export type CustomerFilters = {
  q: string;
  status: '' | 'confirmed' | 'unconfirmed';
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseCustomerParams(raw: Raw): CustomerFilters {
  const status = first(raw.status);
  const page = Number.parseInt(first(raw.page) ?? '1', 10);
  return {
    q: (first(raw.q) ?? '').trim().slice(0, 100),
    status: status === 'confirmed' || status === 'unconfirmed' ? status : '',
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 1000) : 1,
  };
}

export function buildCustomerQuery(filters: CustomerFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}