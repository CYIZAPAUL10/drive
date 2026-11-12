import AdminCustomersPage from '@/frontend/pages/admin/AdminCustomersPage';
import { requireAdmin } from '@/server/auth/session';
import { listForAdmin } from '@/server/services/customers.service';

export const metadata = { title: 'Customers' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  await requireAdmin();
  const data = await listForAdmin(await searchParams);
  return <AdminCustomersPage {...data} />;
}