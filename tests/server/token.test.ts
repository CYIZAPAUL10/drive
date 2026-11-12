import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '@/server/auth/token';

const key = new TextEncoder().encode('test-key-test-key-test-key-test-key!');
const otherKey = new TextEncoder().encode('another-key-another-key-another-key!');
const payload = { sub: 'admin1', role: 'admin' as const, v: 3 };
const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await signToken(key, payload, 60);
    expect(await verifyToken(key, token)).toEqual(payload);
  });

  it('rejects a token signed with another key', async () => {
    const token = await signToken(otherKey, payload, 60);
    expect(await verifyToken(key, token)).toBeNull();
  });

  it('rejects a token whose payload was tampered with', async () => {
    const token = await signToken(key, payload, 60);
    const [header, , signature] = token.split('.');
    const forged = `${header}.${b64({ sub: 'attacker', role: 'admin', v: 3, exp: 9999999999 })}.${signature}`;
    expect(await verifyToken(key, forged)).toBeNull();
  });

  it('rejects an unsigned token (alg "none")', async () => {
    const unsigned = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'admin1', role: 'admin', v: 3 })}.`;
    expect(await verifyToken(key, unsigned)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await signToken(key, payload, 60, 1_000_000);
    expect(await verifyToken(key, token, new Date(2_000_000 * 1000))).toBeNull();
  });

  it('rejects garbage', async () => {
    expect(await verifyToken(key, 'not-a-token')).toBeNull();
    expect(await verifyToken(key, '')).toBeNull();
  });
});