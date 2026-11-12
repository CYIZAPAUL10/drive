import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hashedClientIp } from '@/server/security/ip';
import { allow } from '@/server/services/ratelimit.service';
import { safeEqual } from '@/server/auth/pkce';
import { startCustomerSession } from '@/server/auth/customerSession';
import { signInWithGoogle } from '@/server/services/account.service';
import {
  GOOGLE_COOKIE,
  GOOGLE_COOKIE_PATH,
  appUrl,
  fetchGoogleProfile,
  isGoogleConfigured,
  openState,
} from '@/server/auth/googleOAuth';
import { DEFAULT_LOCALE } from '@/shared/constants/locales';
import { safeNext } from '@/shared/utils/safeNext';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sealed = (await cookies()).get(GOOGLE_COOKIE)?.value;
  const saved = sealed ? await openState(sealed) : null;
  const locale = saved?.locale ?? DEFAULT_LOCALE;

  const finish = (target: string) => {
    const response = NextResponse.redirect(appUrl(target), 302);
    response.cookies.delete({ name: GOOGLE_COOKIE, path: GOOGLE_COOKIE_PATH }); // each sign-in attempt is used once
    return response;
  };
  const fail = (code: 'google' | 'google_cancelled' | 'google_unverified') =>
    finish(`/${locale}/account/login?error=${code}`);

  if (!isGoogleConfigured() || !saved) return fail('google');

  const googleError = url.searchParams.get('error');
  if (googleError) return fail(googleError === 'access_denied' ? 'google_cancelled' : 'google');

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  if (!code || !returnedState || !safeEqual(returnedState, saved.state)) return fail('google');

  if (!(await allow(`google-callback:ip:${await hashedClientIp()}`, 30, 60 * 60 * 1000))) return fail('google');

  try {
    const profile = await fetchGoogleProfile(code, saved);
    if (profile === 'unverified') return fail('google_unverified');
    if (!profile) return fail('google');

    const customer = await signInWithGoogle({ ...profile, locale });
    await startCustomerSession(customer.id, customer.tokenVersion);
    return finish(safeNext(saved.next, `/${locale}/account/requests`));
  } catch (error) {
    console.error('Google sign-in failed:', error instanceof Error ? error.name : 'unknown error');
    return fail('google');
  }
}