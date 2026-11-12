export function formatKigali(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Kigali',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export const whatsappLink = (e164: string) => `https://wa.me/${e164.replace(/\D/g, '')}`;

const SAFE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * A mailto link only for plain addresses. Text a visitor typed, such as "a@b.com?bcc=x@y.com",
 * must not be able to add extra headers to the email ELVAIS opens.
 */
export function safeMailto(email: string): string | null {
  return SAFE_EMAIL.test(email) ? `mailto:${email}` : null;
}