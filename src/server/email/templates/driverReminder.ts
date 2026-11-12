import 'server-only';
import { button, detailsTable, shell, esc, type Rendered } from './shared';
import type { AlertInput } from './driverAlert';

export type ReminderInput = AlertInput & { waitedMinutes: number };

/** English only: the driver's mailbox. User text never goes in the subject. */
export function renderDriverReminder(i: ReminderInput): Rendered {
  const base = i.appUrl.replace(/\/$/, '');
  const adminUrl = `${base}/admin/requests/${i.bookingId}`;
  const waUrl = `https://wa.me/${i.guestPhone.replace(/\D/g, '')}`;
  const telUrl = `tel:${i.guestPhone}`;

  const rows: Array<[string, string]> = [
    ['Reference', i.referenceCode],
    ['Name', i.guestName],
    ['Phone', i.guestPhone],
  ];

  const subject = `Reminder: ${i.referenceCode} has not been contacted`;

  const body =
    `<h1 style="margin:0 0 8px;font-size:22px;">Still waiting for you</h1>` +
    `<p style="margin:0;">This request arrived about ${i.waitedMinutes} minutes ago and is still marked <strong>New</strong>. ` +
    `Contact the customer, or set a different status in the admin so you are not reminded again.</p>` +
    detailsTable(rows) +
    `<p style="margin:16px 0 0;">${button(telUrl, `Call ${i.guestPhone}`)}${button(waUrl, 'WhatsApp', 'secondary')}${button(adminUrl, 'Open in admin', 'secondary')}</p>`;

  const html = shell({
    lang: 'en',
    title: subject,
    preheader: `${i.guestName} is still waiting`,
    body,
    footer: `This is the only reminder for ${esc(i.referenceCode)}.`,
  });

  const text = [
    subject,
    '',
    `This request arrived about ${i.waitedMinutes} minutes ago and is still marked New.`,
    ...rows.map(([name, value]) => `${name}: ${value}`),
    '',
    `Call: ${telUrl}`,
    `WhatsApp: ${waUrl}`,
    `Admin: ${adminUrl}`,
  ].join('\n');

  return { subject, html, text };
}