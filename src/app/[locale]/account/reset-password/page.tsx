import { setRequestLocale } from 'next-intl/server';
import ResetPasswordPage from '@/frontend/pages/account/ResetPasswordPage';
import { isResetTokenValid } from '@/server/services/account.service';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { locale } = await params;
  return accountMetadata(locale, 'reset.metaTitle', { referrer: 'no-referrer' });
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const value = typeof token === 'string' ? token : '';
  // Only checked here, not used up: the token is used when the new password is saved
  const valid = value !== '' && (await isResetTokenValid(value));
  return <ResetPasswordPage locale={locale} token={value} valid={valid} />;
}