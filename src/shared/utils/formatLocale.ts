const INTL: Record<string, string> = { en: 'en-GB', fr: 'fr-FR', rw: 'rw-RW' };

export function formatKigaliFor(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(INTL[locale] ?? 'en-GB', {
      timeZone: 'Africa/Kigali',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}