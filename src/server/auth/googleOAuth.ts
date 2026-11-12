import 'server-only';
import { createHash } from 'node:crypto';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { env } from '@/server/config/env';
import { pkceChallenge, safeEqual } from './pkce';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

export const GOOGLE_COOKIE = 'ervais_oauth';
export const GOOGLE_COOKIE_PATH = '/api/auth/google';
export const STATE_MAX_AGE_SECONDS = 10 * 60;

const stateKey = new Uint8Array(createHash('sha256').update(`oauth-state:${env.AUTH_SECRET}`).digest());
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export const isGoogleConfigured = () => Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const appUrl = (path: string) => new URL(path, env.APP_URL);
export const redirectUri = () => appUrl('/api/auth/google/callback').toString();

/** What we remember between sending someone to Google and getting them back. */
export type OAuthState = { state: string; nonce: string; verifier: string; locale: string; next: string };

export async function sealState(data: OAuthState): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${STATE_MAX_AGE_SECONDS}s`)
    .sign(stateKey);
}

export async function openState(token: string): Promise<OAuthState | null> {
  try {
    const { payload } = await jwtVerify(token, stateKey, { algorithms: ['HS256'] });
    const { state, nonce, verifier, locale, next } = payload;
    if (
      typeof state === 'string' &&
      typeof nonce === 'string' &&
      typeof verifier === 'string' &&
      typeof locale === 'string' &&
      typeof next === 'string'
    ) {
      return { state, nonce, verifier, locale, next };
    }
    return null;
  } catch {
    return null;
  }
}

export function buildAuthUrl(s: OAuthState): URL {
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state: s.state,
    nonce: s.nonce,
    code_challenge: pkceChallenge(s.verifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return url;
}

export type GoogleProfile = { sub: string; email: string; name: string };

/**
 * Swaps the one-time code for an ID token, then checks it properly: Google's signature, issuer,
 * audience (our client id), the nonce, and that Google verified the email address.
 */
export async function fetchGoogleProfile(code: string, s: OAuthState): Promise<GoogleProfile | 'unverified' | null> {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
      code_verifier: s.verifier,
    }),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const json = (await response.json()) as { id_token?: unknown };
  if (typeof json.id_token !== 'string') return null;

  jwks ??= createRemoteJWKSet(new URL(JWKS_URL));
  const { payload } = await jwtVerify(json.id_token, jwks, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  });

  if (typeof payload.nonce !== 'string' || !safeEqual(payload.nonce, s.nonce)) return null;
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
  if (payload.email_verified !== true && payload.email_verified !== 'true') return 'unverified';

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: typeof payload.name === 'string' ? payload.name.trim().slice(0, 100) : '',
  };
}