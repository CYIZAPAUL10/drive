export const SPOKEN_LANGUAGES = ['rw', 'en', 'fr', 'sw'] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];
export const SPOKEN_LANGUAGE_NAMES: Record<SpokenLanguage, string> = {
  rw: 'Kinyarwanda',
  en: 'English',
  fr: 'French',
  sw: 'Swahili',
};

export const BIO_LANGUAGES = ['en', 'rw', 'fr'] as const;
export const BIO_LANGUAGE_NAMES = { en: 'English', rw: 'Kinyarwanda', fr: 'French' } as const;