import { describe, it, expect } from 'vitest';
import { renderDriverReminder } from '@/server/email/templates/driverReminder';

const input = {
  referenceCode: 'ELV-ABC234',
  bookingId: 'booking123',
  appUrl: 'https://example.com',
  guestName: 'Jean <b>Claude</b>',
  guestPhone: '+250781234567',
  guestEmail: null,
  serviceKey: 'airport',
  tripType: 'one_way',
  numberOfDays: null,
  preferredContact: 'call',
  language: 'en',
  waitedMinutes: 35,
};

describe('driver reminder', () => {
  const mail = renderDriverReminder(input);

  it('has a subject with only our own reference code', () => {
    expect(mail.subject).toBe('Reminder: ELV-ABC234 has not been contacted');
  });
  it('says how long the request has waited', () => {
    expect(mail.text).toContain('about 35 minutes ago');
  });
  it('escapes HTML in user text', () => {
    expect(mail.html).not.toContain('<b>Claude</b>');
  });
  it('links to call, WhatsApp and the admin page', () => {
    expect(mail.html).toContain('tel:+250781234567');
    expect(mail.html).toContain('https://wa.me/250781234567');
    expect(mail.html).toContain('https://example.com/admin/requests/booking123');
  });
});