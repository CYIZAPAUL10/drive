import { describe, it, expect } from 'vitest';
import { renderVerifyEmail, renderResetEmail, renderAccountExistsEmail } from '@/server/email/templates/accountEmails';

const url = 'https://example.com/en/account/verify?token=abc123';

describe('verification email', () => {
  it.each(['en', 'fr', 'rw'])('%s: has the link, the right language, and no user text in the subject', (language) => {
    const mail = renderVerifyEmail({ language, name: 'Jean <b>Claude</b>', url });
    expect(mail.html).toContain(`<html lang="${language}">`);
    expect(mail.html).toContain(url);
    expect(mail.text).toContain(url);
    expect(mail.subject).not.toContain('Jean');
  });
  it('escapes the name in the HTML', () => {
    const mail = renderVerifyEmail({ language: 'en', name: '<script>x</script>', url });
    expect(mail.html).not.toContain('<script>x</script>');
  });
  it('falls back to English for an unknown language', () => {
    expect(renderVerifyEmail({ language: 'xx', name: 'A', url }).html).toContain('<html lang="en">');
  });
});

describe('password reset email', () => {
  it.each(['en', 'fr', 'rw'])('%s: contains the link', (language) => {
    const mail = renderResetEmail({ language, url: 'https://example.com/en/account/reset-password?token=zzz' });
    expect(mail.html).toContain('reset-password?token=zzz');
    expect(mail.html).toContain(`<html lang="${language}">`);
  });
});

describe('account-exists email', () => {
  it('links to sign-in and to forgot-password', () => {
    const mail = renderAccountExistsEmail({
      language: 'en',
      loginUrl: 'https://example.com/en/account/login',
      forgotUrl: 'https://example.com/en/account/forgot-password',
    });
    expect(mail.html).toContain('/account/login');
    expect(mail.html).toContain('/account/forgot-password');
  });
});