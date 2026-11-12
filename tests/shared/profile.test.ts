import { describe, it, expect } from 'vitest';
import { profileSchema } from '@/shared/schemas/profile.schema';
import { passwordChangeSchema } from '@/shared/schemas/account.schema';
import { collectFieldErrors } from '@/shared/schemas/booking.schema';

const valid = {
  phone: '0781234567',
  whatsapp: '+250781234567',
  email: 'ervais@example.com',
  capacity: '4',
  years: '8',
  languages: ['rw', 'en'],
  bioEn: 'I am ERVAIS.',
  bioRw: '',
  bioFr: '',
};

const errorsFor = (overrides: Record<string, unknown>) => {
  const result = profileSchema.safeParse({ ...valid, ...overrides });
  return result.success ? {} : collectFieldErrors(result.error);
};

describe('profile schema', () => {
  it('accepts valid input, with empty translations allowed', () => {
    expect(errorsFor({})).toEqual({});
  });
  it('rejects a bad phone number', () => {
    expect(errorsFor({ phone: '12' }).phone).toBeDefined();
  });
  it('rejects a bad email', () => {
    expect(errorsFor({ email: 'not-an-email' }).email).toBeDefined();
  });
  it('limits capacity to 1-10', () => {
    expect(errorsFor({ capacity: '0' }).capacity).toBeDefined();
    expect(errorsFor({ capacity: '11' }).capacity).toBeDefined();
    expect(errorsFor({ capacity: '7' }).capacity).toBeUndefined();
  });
  it('allows empty years, and limits them to 0-80', () => {
    expect(errorsFor({ years: '' }).years).toBeUndefined();
    expect(errorsFor({ years: '81' }).years).toBeDefined();
  });
  it('rejects an unknown language code', () => {
    expect(errorsFor({ languages: ['rw', 'xx'] }).languages).toBeDefined();
  });
  it('limits the bio length', () => {
    expect(errorsFor({ bioEn: 'x'.repeat(1501) }).bioEn).toBeDefined();
  });
});

describe('password change schema', () => {
  const errors = (d: { current: string; next: string; confirm: string }) => {
    const result = passwordChangeSchema.safeParse(d);
    return result.success ? {} : collectFieldErrors(result.error);
  };
  it('accepts a long new password that matches', () => {
    expect(errors({ current: 'old-password-123', next: 'a-brand-new-passphrase', confirm: 'a-brand-new-passphrase' })).toEqual({});
  });
  it('rejects a short new password', () => {
    expect(errors({ current: 'old', next: 'short', confirm: 'short' }).next).toBeDefined();
  });
  it('rejects a mismatched confirmation', () => {
    expect(errors({ current: 'old', next: 'a-brand-new-passphrase', confirm: 'different-passphrase' }).confirm).toBeDefined();
  });
  it('rejects reusing the current password', () => {
    expect(errors({ current: 'same-passphrase-12', next: 'same-passphrase-12', confirm: 'same-passphrase-12' }).next).toBeDefined();
  });
});