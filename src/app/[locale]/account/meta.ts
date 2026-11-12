import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

/** Account pages are not for search engines. */
export async function accountMetadata(locale: string, key: string, extra: Metadata = {}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Account' });
  return { title: t(key), robots: { index: false, follow: false }, ...extra };
}