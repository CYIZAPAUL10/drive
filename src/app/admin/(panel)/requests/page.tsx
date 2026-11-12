import AdminRequestsPage from '@/frontend/pages/admin/AdminRequestsPage';
import { requireAdmin } from '@/server/auth/session';
import { listForAdmin } from '@/server/services/requests.service';

export const metadata = { title: 'Requests' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  await requireAdmin();
  const data = await listForAdmin(await searchParams);
  return <AdminRequestsPage {...data} />;
}