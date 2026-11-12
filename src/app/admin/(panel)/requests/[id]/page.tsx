import { notFound } from 'next/navigation';
import AdminRequestDetailPage from '@/frontend/pages/admin/AdminRequestDetailPage';
import { requireAdmin } from '@/server/auth/session';
import { getRequestForAdmin } from '@/server/services/requests.service';

export const metadata = { title: 'Request' };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const request = await getRequestForAdmin(id);
  if (!request) notFound();
  return <AdminRequestDetailPage request={request} />;
}