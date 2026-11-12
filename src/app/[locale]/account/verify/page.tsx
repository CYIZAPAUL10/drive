import { setRequestLocale } from 'next-intl/server';
import VerifyPage from '@/frontend/pages/account/VerifyPage';
import { verifyEmailToken } from '@/server/services/account.service';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { locale } = await params;
  // The link holds a secret token: do not leak it to other sites through the Referer header
  return accountMetadata(locale, 'verify.metaTitle', { referrer: 'no-referrer' });
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const result = typeof token === 'string' ? await verifyEmailToken(token) : 'invalid';
  return <VerifyPage result={result} />;
}