import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const randomString = (bytes = 32) => randomBytes(bytes).toString('base64url');

/** PKCE: the code challenge is the SHA-256 of the verifier, base64url-encoded (RFC 7636). */
export const pkceChallenge = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');

/** Compares two secrets without leaking where they differ. */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}