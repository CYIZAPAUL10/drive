import AdminSocialPage from '@/frontend/pages/admin/AdminSocialPage';
import { requireAdmin } from '@/server/auth/session';
import { getSocialValuesForEdit } from '@/server/services/social.service';

export const metadata = { title: 'Social links' };

export default async function Page() {
  await requireAdmin();
  const initial = await getSocialValuesForEdit();
  return <AdminSocialPage initial={initial} />;
}