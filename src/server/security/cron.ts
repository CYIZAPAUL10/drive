import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '@/server/config/env';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Constant-time check of "Authorization: Bearer <CRON_SECRET>". Without a secret, nothing passes. */
export function isCronAuthorised(request: Request): boolean {
  const secret = env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return timingSafeEqual(digest(token), digest(secret));
}