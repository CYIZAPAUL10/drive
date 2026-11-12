import { describe, it, expect } from 'vitest';
import { validateSocialUrl, parseSocialForm, sortSocials } from '@/shared/utils/socialUrl';
import { parseCustomerParams, buildCustomerQuery } from '@/shared/utils/customerFilters';
import { customerEditSchema, customerDeleteSchema } from '@/shared/schemas/customerEdit.schema';

describe('validateSocialUrl', () => {
  it('accepts a normal page and adds https when it is missing', () => {
    expect(validateSocialUrl('facebook', 'facebook.com/elvais.taxi')).toEqual({ ok: true, url: 'https://facebook.com/elvais.taxi' });
  });
  it('accepts www and mobile subdomains, and upgrades http', () => {
    expect(validateSocialUrl('instagram', 'https://www.instagram.com/elvais').ok).toBe(true);
    expect(validateSocialUrl('facebook', 'https://m.facebook.com/elvais').ok).toBe(true);
    expect(validateSocialUrl('youtube', 'http://youtube.com/@elvais')).toEqual({ ok: true, url: 'https://youtube.com/@elvais' });
  });
  it('drops the #fragment', () => {
    expect(validateSocialUrl('x', 'https://x.com/elvais#top')).toEqual({ ok: true, url: 'https://x.com/elvais' });
  });
  it.each([
    'javascript:alert(1)',
    'https://evil.com/facebook.com',
    'https://facebook.com.evil.com/x',
    'https://notfacebook.com/x',
    'https://user:pass@facebook.com/x',
    'https://facebook.com/',
    'ftp://facebook.com/x',
    'not a url',
  ])('rejects %s', (input) => {
    expect(validateSocialUrl('facebook', input).ok).toBe(false);
  });
  it('rejects an address from the wrong platform', () => {
    expect(validateSocialUrl('instagram', 'https://facebook.com/elvais').ok).toBe(false);
  });
});

describe('parseSocialForm', () => {
  it('saves filled boxes and removes blank ones', () => {
    const result = parseSocialForm({ facebook: 'facebook.com/elvais', instagram: '   ' });
    expect(result.entries).toEqual([{ platform: 'facebook', url: 'https://facebook.com/elvais' }]);
    expect(result.removals).toContain('instagram');
    expect(result.errors).toEqual({});
  });
  it('reports an error for each bad box', () => {
    const result = parseSocialForm({ x: 'https://evil.com/x', tiktok: 'tiktok.com/@elvais' });
    expect(Object.keys(result.errors)).toEqual(['x']);
  });
});

describe('sortSocials', () => {
  it('uses the standard order and drops unknown platforms', () => {
    const sorted = sortSocials([{ platform: 'x' }, { platform: 'nope' }, { platform: 'facebook' }]);
    expect(sorted.map((s) => s.platform)).toEqual(['facebook', 'x']);
  });
});

describe('customer filters', () => {
  it('uses safe defaults and ignores a bad status', () => {
    expect(parseCustomerParams({})).toEqual({ q: '', status: '', page: 1 });
    expect(parseCustomerParams({ status: 'hacked', page: '-4' })).toEqual({ q: '', status: '', page: 1 });
  });
  it('keeps filters in page links', () => {
    expect(buildCustomerQuery(parseCustomerParams({ q: 'jean', status: 'confirmed' }), 2)).toBe('?q=jean&status=confirmed&page=2');
  });
});

describe('customer edit and delete schemas', () => {
  const ok = { id: 'c1', fullName: 'Jean Claude', phone: '0781234567', language: 'fr' };
  it('accepts valid details, and an empty phone', () => {
    expect(customerEditSchema.safeParse(ok).success).toBe(true);
    expect(customerEditSchema.safeParse({ ...ok, phone: '' }).success).toBe(true);
  });
  it('rejects a bad phone, a short name and an unknown language', () => {
    expect(customerEditSchema.safeParse({ ...ok, phone: '12' }).success).toBe(false);
    expect(customerEditSchema.safeParse({ ...ok, fullName: 'J' }).success).toBe(false);
    expect(customerEditSchema.safeParse({ ...ok, language: 'xx' }).success).toBe(false);
  });
  it('delete needs a choice and the confirmation', () => {
    expect(customerDeleteSchema.safeParse({ id: 'c1', requests: 'keep', confirm: 'yes' }).success).toBe(true);
    expect(customerDeleteSchema.safeParse({ id: 'c1', requests: 'maybe', confirm: 'yes' }).success).toBe(false);
    expect(customerDeleteSchema.safeParse({ id: 'c1', requests: 'keep', confirm: '' }).success).toBe(false);
  });
});