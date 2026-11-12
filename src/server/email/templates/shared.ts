import 'server-only';

export type Rendered = { subject: string; html: string; text: string };

export const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const multiline = (value: string) => esc(value).replace(/\r?\n/g, '<br>');

export function formatKigali(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'Africa/Kigali',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function button(href: string, text: string, kind: 'primary' | 'secondary' = 'primary'): string {
  const style =
    kind === 'primary'
      ? 'background:#f8ca11;color:#1a1a1a;border:2px solid #f8ca11;'
      : 'background:#ffffff;color:#1a1a1a;border:2px solid #1a1a1a;';
  return `<a href="${esc(href)}" style="display:inline-block;padding:12px 18px;margin:0 8px 8px 0;border-radius:6px;font-weight:bold;text-decoration:none;${style}">${esc(text)}</a>`;
}

export function detailsTable(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([name, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#4b5563;vertical-align:top;">${esc(name)}</td>` +
        `<td style="padding:6px 0;font-weight:bold;vertical-align:top;">${multiline(value)}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">${body}</table>`;
}

export function shell(opts: { lang: string; title: string; preheader: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="${esc(opts.lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:20px 24px;"><span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;letter-spacing:1px;color:#ffffff;">ELVAIS</span></td></tr>
<tr><td style="height:4px;background:#f8ca11;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:24px;font-size:16px;line-height:1.5;">${opts.body}</td></tr>
<tr><td style="padding:16px 24px;background:#f5f6f8;font-size:13px;line-height:1.4;color:#4b5563;">${opts.footer}</td></tr>
</table></td></tr></table>
</body></html>`;
}