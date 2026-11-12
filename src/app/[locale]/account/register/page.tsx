import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import RegisterPage from '@/frontend/pages/account/RegisterPage';
import { getCustomer } from '@/server/auth/customerSession';
import { isGoogleConfigured } from '@/server/auth/googleOAuth';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return accountMetadata(locale, 'register.metaTitle');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getCustomer()) redirect(`/${locale}/account/requests`);
  return <RegisterPage locale={locale} googleEnabled={isGoogleConfigured()} />;
}