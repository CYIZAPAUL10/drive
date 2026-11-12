import 'server-only';
import { createHash } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/server/config/env';
import * as customers from '@/server/repositories/customer.repo';
import { signToken, verifyToken } from './token';

const COOKIE = 'ervais_customer';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Its own key, so an admin token can never be used as a customer token, or the other way round
const key = new Uint8Array(createHash('sha256').update(`customer-session:${env.AUTH_SECRET}`).digest());

export async function startCustomerSession(customerId: string, tokenVersion: number): Promise<void> {
  const token = await signToken(key, { sub: customerId, role: 'customer', v: tokenVersion }, MAX_AGE_SECONDS);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endCustomerSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer, or null. The token must be valid, match tokenVersion, and the email must be confirmed. */
export const getCustomer = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken(key, token);
  if (!session || session.role !== 'customer') return null;
  const customer = await customers.findById(session.sub);
  if (!customer || !customer.emailVerified || customer.tokenVersion !== session.v) return null;
  return {
    id: customer.id,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    hasPassword: customer.hasPassword,
    preferredLanguage: customer.preferredLanguage,
  };
});

/** Use in every signed-in page and action. */
export async function requireCustomer(locale: string, next?: string) {
  const customer = await getCustomer();
  if (!customer) {
    redirect(`/${locale}/account/login${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  }
  return customer;
}