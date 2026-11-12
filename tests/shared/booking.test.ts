import { describe, it, expect } from 'vitest';
import { createBookingSchema, collectFieldErrors } from '@/shared/schemas/booking.schema';
import { normalizePhone } from '@/shared/utils/phone';
import { kigaliToUtc } from '@/shared/utils/time';

describe('normalizePhone', () => {
  it('turns a local Rwandan number into E.164', () => {
    expect(normalizePhone('078 123 4567')).toBe('+250781234567');
  });
  it('accepts a valid international number', () => {
    expect(normalizePhone('+250788123456')).toBe('+250788123456');
  });
  it('rejects junk', () => {
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
  });
});

describe('kigaliToUtc', () => {
  it('converts Kigali time (UTC+2) to UTC', () => {
    expect(kigaliToUtc('2026-12-31', '10:30')?.toISOString()).toBe('2026-12-31T08:30:00.000Z');
  });
  it('rejects impossible dates', () => {
    expect(kigaliToUtc('2026-02-31', '10:00')).toBeNull();
  });
});

describe('booking schema', () => {
  const valid = {
    fullName: 'Jean Claude', phone: '0781234567', email: '', service: 'airport',
    tripType: 'one_way', numberOfDays: '', preferredContact: 'call',
  };
  const errorsFor = (overrides: Record<string, string>) => {
    const result = createBookingSchema().safeParse({ ...valid, ...overrides });
    return result.success ? {} : collectFieldErrors(result.error);
  };

  it('accepts a valid request', () => {
    expect(errorsFor({})).toEqual({});
  });
  it('needs only contact details, not trip details', () => {
    const result = createBookingSchema().safeParse(valid);
    expect(result.success).toBe(true);
  });
  it('requires the name', () => {
    expect(errorsFor({ fullName: '' }).fullName).toBe('required');
  });
  it('rejects a bad phone number', () => {
    expect(errorsFor({ phone: '12' }).phone).toBe('invalidPhone');
  });
  it('needs a number of days for multi-day trips only', () => {
    expect(errorsFor({ tripType: 'multi_day' }).numberOfDays).toBe('required');
    expect(errorsFor({ tripType: 'multi_day', numberOfDays: '3' }).numberOfDays).toBeUndefined();
    expect(errorsFor({ tripType: 'one_way' }).numberOfDays).toBeUndefined();
  });
});