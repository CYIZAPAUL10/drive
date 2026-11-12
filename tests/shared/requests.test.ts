import { describe, it, expect } from 'vitest';
import { parseListParams, buildQuery } from '@/shared/utils/requestFilters';
import { safeMailto, whatsappLink, formatKigali } from '@/shared/utils/format';

describe('parseListParams', () => {
  it('uses safe defaults', () => {
    expect(parseListParams({})).toEqual({ q: '', status: '', from: '', to: '', spam: false, page: 1 });
  });
  it('ignores an invalid status', () => {
    expect(parseListParams({ status: 'HACKED' }).status).toBe('');
  });
  it('accepts a valid status and trims the search', () => {
    const f = parseListParams({ status: 'NEW', q: '  jean  ' });
    expect(f.status).toBe('NEW');
    expect(f.q).toBe('jean');
  });
  it('keeps only well-formed dates', () => {
    expect(parseListParams({ from: '2026-10-05', to: 'tomorrow' })).toMatchObject({ from: '2026-10-05', to: '' });
  });
  it('clamps the page number', () => {
    expect(parseListParams({ page: '-3' }).page).toBe(1);
    expect(parseListParams({ page: 'abc' }).page).toBe(1);
    expect(parseListParams({ page: '999999' }).page).toBe(1000);
  });
  it('takes the first value when a parameter repeats', () => {
    expect(parseListParams({ status: ['NEW', 'CANCELLED'] }).status).toBe('NEW');
  });
});

describe('buildQuery', () => {
  const base = parseListParams({ status: 'NEW', q: 'jean', spam: '1' });
  it('keeps the filters and adds the page', () => {
    expect(buildQuery(base, 3)).toBe('?q=jean&status=NEW&spam=1&page=3');
  });
  it('omits page 1 and empty filters', () => {
    expect(buildQuery(parseListParams({}), 1)).toBe('');
  });
});

describe('contact links', () => {
  it('builds a WhatsApp link from digits only', () => {
    expect(whatsappLink('+250781234567')).toBe('https://wa.me/250781234567');
  });
  it('allows a plain email in a mailto link', () => {
    expect(safeMailto('jean@example.com')).toBe('mailto:jean@example.com');
  });
  it('refuses an address that tries to add mail headers', () => {
    expect(safeMailto('a@b.com?bcc=evil@x.com')).toBeNull();
    expect(safeMailto('a@b.com&cc=x@y.com')).toBeNull();
  });
});

describe('formatKigali', () => {
  it('shows Kigali time (UTC+2)', () => {
    expect(formatKigali('2027-01-15T08:00:00Z')).toContain('10:00');
  });
});