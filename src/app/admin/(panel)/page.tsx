import AdminOverviewPage from '@/frontend/pages/admin/AdminOverviewPage';
import { requireAdmin } from '@/server/auth/session';
import { getOverview } from '@/server/services/admin.service';

export const metadata = { title: 'Overview' };

export default async function Page() {
  await requireAdmin(); // checked again here: layouts do not re-run on every navigation
  const overview = await getOverview();
  return <AdminOverviewPage overview={overview} />;
}