import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, resetSchema, deleteAccountSchema } from '@/shared/schemas/account.schema';
import { collectFieldErrors } from '@/shared/schemas/booking.schema';
import { safeNext } from '@/shared/utils/safeNext';

const validRegistration = {
  fullName: 'Jean Claude',
  phone: '0781234567',
  email: 'jean@example.com',
  password: 'a-long-passphrase',
};

const errorsOf = (result: { success: boolean; error?: Parameters<typeof collectFieldErrors>[0] }) =>
  result.success || !result.error ? {} : collectFieldErrors(result.error);

describe('register schema', () => {
  it('accepts valid input', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });
  it('rejects a short password', () => {
    expect(errorsOf(registerSchema.safeParse({ ...validRegistration, password: 'short' })).password).toBe('passwordShort');
  });
  it('rejects a bad phone and a bad email', () => {
    const errors = errorsOf(registerSchema.safeParse({ ...validRegistration, phone: '12', email: 'nope' }));
    expect(errors.phone).toBe('invalidPhone');
    expect(errors.email).toBe('invalidEmail');
  });
  it('requires every field', () => {
    const errors = errorsOf(registerSchema.safeParse({ fullName: '', phone: '', email: '', password: '' }));
    expect(Object.keys(errors).sort()).toEqual(['email', 'fullName', 'password', 'phone']);
  });
});

describe('login, reset and delete schemas', () => {
  it('login needs an email and a password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
  it('reset needs a long enough token and password', () => {
    expect(resetSchema.safeParse({ token: 'x'.repeat(43), password: 'a-long-passphrase' }).success).toBe(true);
    expect(resetSchema.safeParse({ token: 'short', password: 'a-long-passphrase' }).success).toBe(false);
  });
  it('delete needs the confirmation to be exactly "yes"', () => {
    expect(deleteAccountSchema.safeParse({ password: 'x', confirm: 'yes' }).success).toBe(true);
    expect(errorsOf(deleteAccountSchema.safeParse({ password: 'x', confirm: '' })).confirm).toBe('confirmRequired');
  });
});

describe('safeNext (open-redirect protection)', () => {
  const fallback = '/en/account/requests';
  it('allows internal language-prefixed paths', () => {
    expect(safeNext('/fr/book', fallback)).toBe('/fr/book');
    expect(safeNext('/rw/account/settings', fallback)).toBe('/rw/account/settings');
  });
  it.each(['//evil.com', 'https://evil.com', 'javascript:alert(1)', '/en/../admin', '/xx/book', '/en/book?x=1', '', undefined, 42])(
    'falls back for %s',
    (value) => {
      expect(safeNext(value, fallback)).toBe(fallback);
    },
  );
});