import { NextResponse } from 'next/server';
import { env } from '@/server/config/env';
import { hashedClientIp } from '@/server/security/ip';
import { allow } from '@/server/services/ratelimit.service';
import { randomString } from '@/server/auth/pkce';
import {
  GOOGLE_COOKIE,
  GOOGLE_COOKIE_PATH,
  STATE_MAX_AGE_SECONDS,
  appUrl,
  buildAuthUrl,
  isGoogleConfigured,
  sealState,
  type OAuthState,
} from '@/server/auth/googleOAuth';
import { LOCALES, DEFAULT_LOCALE } from '@/shared/constants/locales';
import { safeNext } from '@/shared/utils/safeNext';

export const dynamic = 'force-dynamic';

/** Sends the visitor to Google, remembering (in a signed, short-lived cookie) how to recognise them on return. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLocale = url.searchParams.get('locale') ?? '';
  const locale = (LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const failTo = appUrl(`/${locale}/account/login?error=google`);

  if (!isGoogleConfigured()) return NextResponse.redirect(failTo, 302);
  if (!(await allow(`google-start:ip:${await hashedClientIp()}`, 30, 60 * 60 * 1000))) {
    return NextResponse.redirect(failTo, 302);
  }

  const state: OAuthState = {
    state: randomString(),
    nonce: randomString(),
    verifier: randomString(48),
    locale,
    next: safeNext(url.searchParams.get('next'), ''),
  };

  const response = NextResponse.redirect(buildAuthUrl(state), 302);
  response.cookies.set(GOOGLE_COOKIE, await sealState(state), {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax', // Google sends the visitor back with a normal link, so Lax is needed
    path: GOOGLE_COOKIE_PATH,
    maxAge: STATE_MAX_AGE_SECONDS,
  });
  return response;
}