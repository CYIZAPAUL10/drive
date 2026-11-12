import 'server-only';
import { SERVICE_LABELS, TRIP_LABELS, CONTACT_LABELS, LANGUAGE_NAMES, label } from '@/server/email/labels';
import { button, detailsTable, shell, esc, type Rendered } from './shared';

export type AlertInput = {
  referenceCode: string;
  bookingId: string;
  appUrl: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  serviceKey: string;
  tripType: string;
  numberOfDays: number | null;
  preferredContact: string;
  language: string;
};

/** English only: the driver's mailbox. User text never goes in the subject. */
export function renderDriverAlert(i: AlertInput): Rendered {
  const base = i.appUrl.replace(/\/$/, '');
  const adminUrl = `${base}/admin/requests/${i.bookingId}`;
  const waUrl = `https://wa.me/${i.guestPhone.replace(/\D/g, '')}`;
  const telUrl = `tel:${i.guestPhone}`;

  const trip =
    label(TRIP_LABELS, i.tripType, 'en') + (i.numberOfDays ? ` (${i.numberOfDays} days)` : '');

  const rows: Array<[string, string]> = [
    ['Reference', i.referenceCode],
    ['Name', i.guestName],
    ['Phone', i.guestPhone],
    ['Service', label(SERVICE_LABELS, i.serviceKey, 'en')],
    ['Trip', trip],
    ['Prefers', label(CONTACT_LABELS, i.preferredContact, 'en')],
    ['Language', LANGUAGE_NAMES[i.language] ?? i.language],
  ];
  if (i.guestEmail) rows.push(['Email', i.guestEmail]);


  const subject = `New ride request ${i.referenceCode}`;

  const body =
    `<h1 style="margin:0 0 8px;font-size:22px;">New ride request</h1>` +
    `<p style="margin:0;">Call the customer to get the trip details (where, when, how many people) and agree the price.</p>` +
    detailsTable(rows) +
    `<p style="margin:16px 0 0;">${button(telUrl, `Call ${i.guestPhone}`)}${button(waUrl, 'WhatsApp', 'secondary')}${button(adminUrl, 'Open in admin', 'secondary')}</p>`;

  const html = shell({
    lang: 'en',
    title: subject,
    preheader: `${i.guestName} asked for a ride`,
    body,
    footer: `Reference ${esc(i.referenceCode)}. This alert was sent because someone used the booking form on the ELVAIS website.`,
  });

  const text = [
    subject,
    '',
    ...rows.map(([name, value]) => `${name}: ${value}`),
    '',
    `Call: ${telUrl}`,
    `WhatsApp: ${waUrl}`,
    `Admin: ${adminUrl}`,
  ].join('\n');

  return { subject, html, text };
}