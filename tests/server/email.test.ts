import { describe, it, expect } from 'vitest';
import { renderDriverAlert } from '@/server/email/templates/driverAlert';
import { renderCustomerConfirmation } from '@/server/email/templates/customerConfirmation';
import { renderAlertSummary } from '@/server/email/templates/summary';

const alert = {
  referenceCode: 'ELV-ABC234',
  bookingId: 'booking123',
  appUrl: 'https://example.com/',
  guestName: 'Jean <script>alert(1)</script>',
  guestPhone: '+250781234567',
  guestEmail: 'jean@example.com',
  serviceKey: 'airport',
  tripType: 'multi_day',
  numberOfDays: 3,
  preferredContact: 'whatsapp',
  language: 'fr',
};

describe('driver alert', () => {
  const mail = renderDriverAlert(alert);

  it('keeps user text out of the subject', () => {
    expect(mail.subject).toBe('New ride request ELV-ABC234');
  });
  it('escapes HTML in user text', () => {
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
  });
  it('links to call, WhatsApp and the admin page', () => {
    expect(mail.html).toContain('tel:+250781234567');
    expect(mail.html).toContain('https://wa.me/250781234567');
    expect(mail.html).toContain('https://example.com/admin/requests/booking123');
  });
});

describe('customer confirmation', () => {
  const input = { ...alert, guestName: 'Jean' };

  it.each(['en', 'fr', 'rw'])('%s: has the reference in the subject and the right lang', (language) => {
    const mail = renderCustomerConfirmation({ ...input, language });
    expect(mail.subject).toContain('ELV-ABC234');
    expect(mail.html).toContain(`<html lang="${language}">`);
    expect(mail.text).toContain('ELV-ABC234');
  });
  it('never says the ride is confirmed', () => {
    const mail = renderCustomerConfirmation({ ...input, language: 'en' });
    expect(mail.subject.toLowerCase()).not.toContain('confirmed');
    expect(mail.text.toLowerCase()).not.toContain('is confirmed');
  });
  it('falls back to English for an unknown language', () => {
    const mail = renderCustomerConfirmation({ ...input, language: 'xx' });
    expect(mail.html).toContain('<html lang="en">');
  });
  it('escapes the visitor name', () => {
    const mail = renderCustomerConfirmation({ ...input, guestName: '<b>Eve</b>' });
    expect(mail.html).not.toContain('<b>Eve</b>');
  });
});

describe('alert summary', () => {
  it('states the count and links to the admin list', () => {
    const mail = renderAlertSummary({ count: 42, appUrl: 'https://example.com' });
    expect(mail.subject).toContain('42');
    expect(mail.html).toContain('https://example.com/admin/requests');
  });
});