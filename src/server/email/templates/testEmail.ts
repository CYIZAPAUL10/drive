import 'server-only';
import { shell, type Rendered } from './shared';

export function renderTestEmail(): Rendered {
  const subject = 'ERVAIS: test alert';
  const body =
    `<h1 style="margin:0 0 8px;font-size:22px;">Test alert</h1>` +
    `<p style="margin:0;">If you can read this, new booking requests will reach this email address.</p>`;
  const html = shell({
    lang: 'en',
    title: subject,
    preheader: 'Booking alerts will reach this address.',
    body,
    footer: 'You asked for this test from the ERVAIS admin.',
  });
  return { subject, html, text: 'If you can read this, new booking requests will reach this email address.' };
}