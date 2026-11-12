import { setRequestLocale } from 'next-intl/server';
import ForgotPasswordPage from '@/frontend/pages/account/ForgotPasswordPage';
import { accountMetadata } from '../meta';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return accountMetadata(locale, 'forgot.metaTitle');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordPage locale={locale} />;
}