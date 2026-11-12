import { redirect } from 'next/navigation';
import AdminLoginPage from '@/frontend/pages/admin/AdminLoginPage';
import { getAdmin } from '@/server/auth/session';

export const metadata = { title: 'Sign in' };

export default async function Page() {
  if (await getAdmin()) redirect('/admin');
  return <AdminLoginPage />;
}