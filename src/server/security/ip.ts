import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { env } from '@/server/config/env';

/**
 * Salted hash of the visitor's IP, used only for rate limiting. The raw IP is never stored.
 * [VERIFY] how the host sets x-forwarded-for before launch: a spoofable value defeats rate limiting.
 */
export async function hashedClientIp(): Promise<string> {
  const h = await headers();
  const raw = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(`${env.AUTH_SECRET}:${raw}`).digest('hex').slice(0, 32);
}