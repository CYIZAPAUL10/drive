import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { pkceChallenge, randomString, safeEqual } from '@/server/auth/pkce';

// An independent base64url: normal base64, swap + and /, drop the = padding (RFC 4648, section 5)
const base64url = (bytes: Buffer) =>
  bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('PKCE', () => {
  const verifier = randomString(48);

  it('is the SHA-256 of the verifier, in unpadded base64url', () => {
    expect(pkceChallenge(verifier)).toBe(base64url(createHash('sha256').update(verifier).digest()));
  });
  it('is 43 characters of URL-safe text', () => {
    expect(pkceChallenge(verifier)).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it('is stable for the same verifier and different for another one', () => {
    expect(pkceChallenge(verifier)).toBe(pkceChallenge(verifier));
    expect(pkceChallenge(verifier)).not.toBe(pkceChallenge(randomString(48)));
  });
  it('makes long, different random strings', () => {
    const a = randomString(48);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(a).not.toBe(randomString(48));
  });
});

describe('safeEqual', () => {
  it('is true only for identical strings', () => {
    expect(safeEqual('same-state', 'same-state')).toBe(true);
    expect(safeEqual('same-state', 'other-state')).toBe(false);
    expect(safeEqual('short', 'a-much-longer-value')).toBe(false);
  });
});