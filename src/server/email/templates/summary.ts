import 'server-only';
import { shell, button, esc, type Rendered } from './shared';

/** Sent instead of individual alerts when requests arrive faster than the hourly cap. */
export function renderAlertSummary(input: { count: number; appUrl: string }): Rendered {
  const url = `${input.appUrl.replace(/\/$/, '')}/admin/requests`;
  const subject = `ERVAIS: ${input.count} ride requests in the last hour`;

  const body =
    `<h1 style="margin:0 0 8px;font-size:22px;">Many requests in the last hour</h1>` +
    `<p style="margin:0 0 12px;">${input.count} requests arrived in the last hour. To protect the email limit, individual alerts are paused until the rate drops.</p>` +
    `<p style="margin:0 0 16px;">Open the admin list to see all of them. Some may be spam.</p>` +
    `<p style="margin:0;">${button(url, 'Open requests')}</p>`;

  const html = shell({
    lang: 'en',
    title: subject,
    preheader: `${input.count} requests in the last hour`,
    body,
    footer: esc('All requests are saved even when alerts are paused.'),
  });

  const text = `${subject}\n\n${input.count} requests arrived in the last hour. Individual alerts are paused to protect the email limit.\nAdmin: ${url}`;

  return { subject, html, text };
}