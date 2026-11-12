import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/frontend/i18n/routing';
import PublicLayout from '@/frontend/layouts/PublicLayout';
import { getSiteProfile } from '@/server/services/profile.service';
import '@/frontend/styles/tokens.css';
import '@/frontend/styles/global.css';
import '@/frontend/styles/motion.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

// Pages are generated once and refreshed when the profile is saved, or at most every 5 minutes
export const revalidate = 300;

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const profile = await getSiteProfile(locale);

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <NextIntlClientProvider>
          <PublicLayout profile={profile}>{children}</PublicLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}