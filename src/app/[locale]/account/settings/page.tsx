import { setRequestLocale } from 'next-intl/server';
import SettingsPage from '@/frontend/pages/account/SettingsPage';
import { requireCustomer } from '@/server/auth/customerSession';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return accountMetadata(locale, 'settings.metaTitle');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireCustomer(locale, `/${locale}/account/settings`);
  return (
    <SettingsPage
      fullName={customer.fullName}
      email={customer.email}
      phone={customer.phone}
      hasPassword={customer.hasPassword}
    />
  );
}