export const LOCALES = ['en', 'rw', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Each language is named in its own language (accessibility requirement)
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  rw: 'Kinyarwanda',
  fr: 'Français',
};

// Short labels shown in the language button
export const LOCALE_CODES: Record<Locale, string> = {
  en: 'En',
  rw: 'Ki',
  fr: 'Fr',
};