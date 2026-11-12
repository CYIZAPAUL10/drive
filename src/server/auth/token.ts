import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

export type SessionPayload = { sub: string; role: 'admin' | 'customer'; v: number };

/** Signs a session token. `nowSeconds` is a parameter so tests can control the clock. */
export async function signToken(
  key: Uint8Array,
  payload: SessionPayload,
  ttlSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
  return new SignJWT({ role: payload.role, v: payload.v })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + ttlSeconds)
    .sign(key);
}

/** Returns the payload, or null for anything wrong: bad signature, wrong algorithm, expired, malformed. */
export async function verifyToken(
  key: Uint8Array,
  token: string,
  now: Date = new Date(),
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'], currentDate: now });
    const role = payload.role === 'admin' ? 'admin' : payload.role === 'customer' ? 'customer' : null;
    if (typeof payload.sub !== 'string' || typeof payload.v !== 'number' || !role) return null;
    return { sub: payload.sub, role, v: payload.v };
  } catch {
    return null;
  }
}