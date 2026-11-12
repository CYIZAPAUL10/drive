import 'server-only';
import { createHash } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/server/config/env';
import * as adminRepo from '@/server/repositories/admin.repo';
import { signToken, verifyToken } from './token';

const ADMIN_COOKIE = 'elvais_admin';
const ADMIN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// A separate key per purpose, derived from the one secret
const adminKey = new Uint8Array(createHash('sha256').update(`admin-session:${env.AUTH_SECRET}`).digest());

export async function startAdminSession(adminId: string, tokenVersion: number): Promise<void> {
  const token = await signToken(adminKey, { sub: adminId, role: 'admin', v: tokenVersion }, ADMIN_MAX_AGE_SECONDS);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: ADMIN_MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
}

/** The signed-in admin, or null. The token must be valid AND match the stored tokenVersion. */
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken(adminKey, token);
  if (!session || session.role !== 'admin') return null;
  const admin = await adminRepo.findById(session.sub);
  if (!admin || admin.tokenVersion !== session.v) return null;
  return { id: admin.id, email: admin.email };
});

/** Call this in every admin page and action. Layouts alone are not enough. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}