import AdminAccountPage from '@/frontend/pages/admin/AdminAccountPage';
import { requireAdmin } from '@/server/auth/session';

export const metadata = { title: 'Account' };

export default async function Page() {
  const admin = await requireAdmin();
  return <AdminAccountPage email={admin.email} />;
}