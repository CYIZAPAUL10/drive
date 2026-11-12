import { notFound } from 'next/navigation';
import AdminCustomerDetailPage from '@/frontend/pages/admin/AdminCustomerDetailPage';
import { requireAdmin } from '@/server/auth/session';
import { getCustomerForAdmin } from '@/server/services/customers.service';

export const metadata = { title: 'Customer' };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const customer = await getCustomerForAdmin(id);
  if (!customer) notFound();
  return <AdminCustomerDetailPage customer={customer} />;
}