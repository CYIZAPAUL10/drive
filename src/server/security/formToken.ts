import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '@/server/config/env';

const MAX_AGE_MS = 2 * 60 * 60 * 1000; // a form open for more than 2 hours expires

function sign(payload: string) {
  return createHmac('sha256', env.AUTH_SECRET).update(payload).digest('base64url');
}

/** A signed timestamp embedded in the form. It slows simple bots; it is not a CAPTCHA. */
export function issueFormToken(now = Date.now()): string {
  const payload = `${now}.${randomBytes(8).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck = 'ok' | 'invalid' | 'tooFast' | 'expired';

export function checkFormToken(token: string, minFillSeconds: number, now = Date.now()): TokenCheck {
  const parts = token.split('.');
  if (parts.length !== 3) return 'invalid';
  const [ts, nonce, signature] = parts;

  const a = Buffer.from(signature);
  const b = Buffer.from(sign(`${ts}.${nonce}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalid';

  const age = now - Number(ts);
  if (!Number.isFinite(age) || age < 0) return 'invalid';
  if (age < minFillSeconds * 1000) return 'tooFast';
  if (age > MAX_AGE_MS) return 'expired';
  return 'ok';
}