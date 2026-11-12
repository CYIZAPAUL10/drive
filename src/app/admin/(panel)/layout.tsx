import type { ReactNode } from 'react';
import AdminShell from '@/frontend/layouts/admin/AdminShell';
import { requireAdmin } from '@/server/auth/session';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}