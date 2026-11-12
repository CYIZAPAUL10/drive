import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import * as customers from '@/server/repositories/customer.repo';
import * as tokens from '@/server/repositories/token.repo';
import { isUniqueViolation } from '@/server/repositories/booking.repo';
import { logAccountEmail } from '@/server/repositories/emailLog.repo';
import { countSentSince } from '@/server/repositories/notification.repo';
import { sendEmail } from '@/server/email/client';
import { renderVerifyEmail, renderResetEmail } from '@/server/email/templates/accountEmails';
import type { Rendered } from '@/server/email/templates/shared';
import { allow, isBlocked, recordHit } from '@/server/services/ratelimit.service';
import { DAILY_EMAIL_BUDGET } from '@/server/services/notification.service';
import { env } from '@/server/config/env';
import { normalizePhone } from '@/shared/utils/phone';
import type { CustomerRequestRow } from '@/shared/types/account';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const LOGIN_WINDOW_MS = 15 * MINUTE_MS;
const VERIFY_TTL_MS = 24 * HOUR_MS;
const RESET_TTL_MS = HOUR_MS;

type Lang = 'en' | 'rw' | 'fr';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
const toLang = (value: string): Lang => (value === 'rw' || value === 'fr' ? value : 'en');
const link = (locale: Lang, path: string) => `${env.APP_URL.replace(/\/$/, '')}/${locale}${path}`;
const emailKey = (prefix: string, email: string) => `${prefix}:${sha256(email).slice(0, 32)}`;

function startOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

let dummyHash: Promise<string> | undefined;

async function safeVerify(storedHash: string, password: string): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

/** A password nobody knows, for accounts that sign in with Google. */
const unknownPasswordHash = () => hash(randomBytes(32).toString('base64url'));

/** Sends one account email and records it, so it counts toward the daily budget. */
async function sendAccountEmail(type: 'verify_email' | 'password_reset', to: string, mail: Rendered): Promise<void> {
  if ((await countSentSince(startOfUtcDay())) >= DAILY_EMAIL_BUDGET) {
    await logAccountEmail(type, false, 'daily_budget');
    return;
  }
  const result = await sendEmail({ to, ...mail });
  await logAccountEmail(type, result.ok, result.ok ? null : result.error);
}

async function issueAndSendVerification(customer: { id: string; fullName: string; email: string }, language: Lang) {
  const token = newToken();
  await tokens.replaceToken(customer.id, 'verify', sha256(token), new Date(Date.now() + VERIFY_TTL_MS));
  await sendAccountEmail(
    'verify_email',
    customer.email,
    renderVerifyEmail({
      language,
      name: customer.fullName,
      url: link(language, `/account/verify?token=${token}`),
    }),
  );
}

// ---------- Registration ----------

export type RegisterOutcome = 'sent' | 'pending' | 'exists' | 'limited';

export async function registerCustomer(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  locale: string;
  ipKey: string;
}): Promise<RegisterOutcome> {
  // Guessing which emails have accounts is slowed down by these limits
  if (!(await allow(`register:ip:${input.ipKey}`, 8, HOUR_MS))) return 'limited';

  const language = toLang(input.locale);
  const email = input.email.toLowerCase();
  if (!(await allow(emailKey('register:email', email), 3, HOUR_MS))) return 'limited';

  const existing = await customers.findByEmail(email);
  if (existing?.emailVerified) return 'exists';

  const phone = normalizePhone(input.phone) ?? input.phone;
  const passwordHash = await hash(input.password);

  if (existing) {
    // Started before but never confirmed: replace the pending details and send a new link
    await customers.updatePending(existing.id, {
      fullName: input.fullName,
      phone,
      passwordHash,
      preferredLanguage: language,
    });
    await issueAndSendVerification({ id: existing.id, fullName: input.fullName, email }, language);
    return 'pending';
  }

  try {
    const created = await customers.create({
      fullName: input.fullName,
      phone,
      email,
      passwordHash,
      preferredLanguage: language,
    });
    await issueAndSendVerification({ id: created.id, fullName: input.fullName, email }, language);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error; // two quick submits: the other one wins
  }
  return 'sent';
}

/** Confirms the email, then attaches earlier guest requests made with that address. */
export async function verifyEmailToken(token: string): Promise<'verified' | 'invalid'> {
  if (token.length < 20 || token.length > 200) return 'invalid';
  const customerId = await tokens.consume(sha256(token), 'verify', new Date());
  if (!customerId) return 'invalid';
  const customer = await customers.findById(customerId);
  if (!customer) return 'invalid';
  await customers.markVerified(customer.id);
  await customers.linkGuestBookings(customer.id, customer.email);
  return 'verified';
}

export async function resendVerification(input: { email: string; locale: string; ipKey: string }): Promise<void> {
  if (!(await allow(`resend:ip:${input.ipKey}`, 5, HOUR_MS))) return;
  const email = input.email.toLowerCase();
  if (!(await allow(emailKey('resend:email', email), 3, HOUR_MS))) return;
  const customer = await customers.findByEmail(email);
  if (customer && !customer.emailVerified) {
    await issueAndSendVerification(
      { id: customer.id, fullName: customer.fullName, email: customer.email },
      toLang(input.locale),
    );
  }
}

// ---------- Sign in ----------

export type CustomerLogin =
  | { ok: true; id: string; tokenVersion: number }
  | { ok: false; reason: 'invalid' | 'blocked' | 'unverified' };

export async function authenticateCustomer(input: {
  email: string;
  password: string;
  ipKey: string;
}): Promise<CustomerLogin> {
  const byEmail = emailKey('customer-login:email', input.email);
  const byIp = `customer-login:ip:${input.ipKey}`;

  if ((await isBlocked(byEmail, 5, LOGIN_WINDOW_MS)) || (await isBlocked(byIp, 10, LOGIN_WINDOW_MS))) {
    return { ok: false, reason: 'blocked' };
  }

  const customer = await customers.findByEmail(input.email);

  // Always one password check, even for an unknown email, so timing reveals nothing
  dummyHash ??= hash('not-a-real-password');
  const valid = await safeVerify(customer?.passwordHash ?? (await dummyHash), input.password);

  if (!customer || !valid) {
    await Promise.all([recordHit(byEmail, LOGIN_WINDOW_MS), recordHit(byIp, LOGIN_WINDOW_MS)]);
    return { ok: false, reason: 'invalid' };
  }
  // Only someone who knows the password sees this, so it does not reveal who has an account
  if (!customer.emailVerified) return { ok: false, reason: 'unverified' };

  return { ok: true, id: customer.id, tokenVersion: customer.tokenVersion };
}

/**
 * Sign in with a Google identity that Google says has a verified email.
 * An unconfirmed password account with the same email is taken over (its password is discarded).
 */
export async function signInWithGoogle(input: {
  sub: string;
  email: string;
  name: string;
  locale: string;
}): Promise<{ id: string; tokenVersion: number }> {
  const byGoogle = await customers.findByGoogleId(input.sub);
  if (byGoogle) {
    await customers.linkGuestBookings(byGoogle.id, byGoogle.email);
    return { id: byGoogle.id, tokenVersion: byGoogle.tokenVersion };
  }

  const byEmail = await customers.findByEmail(input.email);
  if (byEmail) {
    if (byEmail.googleId) throw new Error('A different Google account is already linked to this email');
    const updated = await customers.attachGoogle(byEmail.id, input.sub, {
      wasVerified: byEmail.emailVerified,
      randomHash: await unknownPasswordHash(),
    });
    await customers.linkGuestBookings(byEmail.id, byEmail.email);
    return { id: byEmail.id, tokenVersion: updated.tokenVersion };
  }

  try {
    const created = await customers.createFromGoogle({
      fullName: input.name || input.email.split('@')[0],
      email: input.email,
      googleId: input.sub,
      passwordHash: await unknownPasswordHash(),
      preferredLanguage: toLang(input.locale),
    });
    await customers.linkGuestBookings(created.id, input.email);
    return created;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    // Two quick callbacks: use the account the other one just created
    const again = (await customers.findByGoogleId(input.sub)) ?? (await customers.findByEmail(input.email));
    if (!again) throw error;
    return { id: again.id, tokenVersion: again.tokenVersion };
  }
}

// ---------- Forgot and reset password ----------

export async function requestPasswordReset(input: {
  email: string;
  locale: string;
  ipKey: string;
}): Promise<'sent' | 'limited'> {
  if (!(await allow(`forgot:ip:${input.ipKey}`, 5, HOUR_MS))) return 'limited';

  const email = input.email.toLowerCase();
  if (!(await allow(emailKey('forgot:email', email), 3, HOUR_MS))) return 'sent';

  const customer = await customers.findByEmail(email);
  if (customer) {
    const language = toLang(input.locale);
    const token = newToken();
    await tokens.replaceToken(customer.id, 'reset', sha256(token), new Date(Date.now() + RESET_TTL_MS));
    await sendAccountEmail(
      'password_reset',
      customer.email,
      renderResetEmail({ language, url: link(language, `/account/reset-password?token=${token}`) }),
    );
  }
  return 'sent'; // the same answer whether or not an account exists
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  if (token.length < 20 || token.length > 200) return false;
  return tokens.isValid(sha256(token), 'reset', new Date());
}

export async function resetPassword(input: { token: string; password: string }): Promise<'ok' | 'invalid'> {
  const customerId = await tokens.consume(sha256(input.token), 'reset', new Date());
  if (!customerId) return 'invalid';
  await customers.setPassword(customerId, await hash(input.password));
  await tokens.deleteForIdentifier(customerId);
  return 'ok';
}

// ---------- Signed-in features ----------

export async function listMyRequests(customerId: string): Promise<CustomerRequestRow[]> {
  const rows = await customers.listRequests(customerId);
  return rows.map((r) => ({
    id: r.id,
    referenceCode: r.referenceCode,
    status: r.status,
    serviceKey: r.service.key,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function attachBookingToCustomer(bookingId: string, customerId: string): Promise<void> {
  await customers.attachBooking(bookingId, customerId);
}

/**
 * Deletes the account and every request linked to it.
 * Accounts with a password need that password; Google-only accounts retype their email.
 */
export async function deleteAccount(input: {
  customerId: string;
  password?: string;
  email?: string;
}): Promise<'ok' | 'wrong' | 'blocked'> {
  const key = `customer-delete:${input.customerId}`;
  if (await isBlocked(key, 5, LOGIN_WINDOW_MS)) return 'blocked';

  const customer = await customers.findById(input.customerId);
  const confirmed = customer
    ? customer.hasPassword
      ? await safeVerify(customer.passwordHash, input.password ?? '')
      : (input.email ?? '').trim().toLowerCase() === customer.email
    : false;

  if (!customer || !confirmed) {
    await recordHit(key, LOGIN_WINDOW_MS);
    return 'wrong';
  }
  await tokens.deleteForIdentifier(customer.id);
  await customers.remove(customer.id);
  return 'ok';
}