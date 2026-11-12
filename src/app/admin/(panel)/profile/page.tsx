import AdminProfilePage from '@/frontend/pages/admin/AdminProfilePage';
import { requireAdmin } from '@/server/auth/session';
import { getProfileForEdit } from '@/server/services/profile.service';

export const metadata = { title: 'Profile and content' };

export default async function Page() {
  await requireAdmin();
  const initial = await getProfileForEdit();
  return <AdminProfilePage initial={initial} />;
}