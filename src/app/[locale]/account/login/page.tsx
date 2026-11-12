import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LoginPage from '@/frontend/pages/account/LoginPage';
import { getCustomer } from '@/server/auth/customerSession';
import { isGoogleConfigured } from '@/server/auth/googleOAuth';
import { safeNext } from '@/shared/utils/safeNext';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

const GOOGLE_ERRORS = ['google', 'google_cancelled', 'google_unverified'] as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; reset?: string; deleted?: string; error?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { locale } = await params;
  return accountMetadata(locale, 'login.metaTitle');
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;

  if (await getCustomer()) redirect(safeNext(query.next, `/${locale}/account/requests`));

  const notice = query.reset === '1' ? 'reset' : query.deleted === '1' ? 'deleted' : undefined;
  const error = GOOGLE_ERRORS.find((e) => e === query.error);

  return (
    <LoginPage
      locale={locale}
      next={safeNext(query.next, '')}
      notice={notice}
      googleEnabled={isGoogleConfigured()}
      error={error}
    />
  );
}