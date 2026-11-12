import { setRequestLocale } from 'next-intl/server';
import RequestsPage from '@/frontend/pages/account/RequestsPage';
import { requireCustomer } from '@/server/auth/customerSession';
import { listMyRequests } from '@/server/services/account.service';
import { accountMetadata } from '../meta';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return accountMetadata(locale, 'requests.metaTitle');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireCustomer(locale, `/${locale}/account/requests`);
  const rows = await listMyRequests(customer.id); // always the signed-in customer's own, never an id from the URL
  return <RequestsPage rows={rows} />;
}