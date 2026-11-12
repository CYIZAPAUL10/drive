'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { hashedClientIp } from '@/server/security/ip';
import { startCustomerSession, endCustomerSession, requireCustomer } from '@/server/auth/customerSession';
import * as account from '@/server/services/account.service';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  deleteAccountSchema,
} from '@/shared/schemas/account.schema';
import { deleteWithEmailSchema } from '@/shared/schemas/passwordless.schema';
import { collectFieldErrors } from '@/shared/schemas/booking.schema';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/shared/constants/locales';
import { safeNext } from '@/shared/utils/safeNext';
import type { FormState } from '@/shared/types/action';

const text = (formData: FormData, name: string) => String(formData.get(name) ?? '');

function localeOf(formData: FormData): Locale {
  const raw = text(formData, 'locale');
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : DEFAULT_LOCALE;
}

const logFailure = (what: string, error: unknown) => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  console.error(`${what} failed:`, error instanceof Error ? error.name : 'unknown error', code);
};

// Passwords are never sent back to the browser: only the other fields are returned in `values`.

export async function registerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const values = { fullName: text(formData, 'fullName'), phone: text(formData, 'phone'), email: text(formData, 'email') };

  const parsed = registerSchema.safeParse({ ...values, password: text(formData, 'password') });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error), values };

  try {
    const outcome = await account.registerCustomer({ ...parsed.data, locale, ipKey: await hashedClientIp() });
    if (outcome === 'limited') return { formError: 'rateLimited', values };
    if (outcome === 'exists') return { formError: 'emailExists', values };
    if (outcome === 'pending') return { success: 'registerPending' };
  } catch (error) {
    logFailure('Registration', error);
    return { formError: 'serverError', values };
  }
  return { success: 'registerSent' };
}

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const values = { email: text(formData, 'email') };

  const parsed = loginSchema.safeParse({ ...values, password: text(formData, 'password') });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error), values };

  try {
    const result = await account.authenticateCustomer({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      ipKey: await hashedClientIp(),
    });
    if (!result.ok) return { formError: result.reason, values };
    await startCustomerSession(result.id, result.tokenVersion);
  } catch (error) {
    logFailure('Customer sign-in', error);
    return { formError: 'serverError', values };
  }

  redirect(safeNext(text(formData, 'next'), `/${locale}/account/requests`));
}

export async function logoutAction(formData: FormData): Promise<void> {
  const locale = localeOf(formData);
  await endCustomerSession();
  redirect(`/${locale}`);
}

export async function resendVerificationAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const parsed = forgotSchema.safeParse({ email: text(formData, 'email') });
  if (!parsed.success) return { formError: 'serverError' };
  try {
    await account.resendVerification({ email: parsed.data.email, locale, ipKey: await hashedClientIp() });
  } catch (error) {
    logFailure('Resending verification', error);
  }
  return { success: 'resendSent' }; // the same answer in every case
}

export async function forgotAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const values = { email: text(formData, 'email') };

  const parsed = forgotSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error), values };

  try {
    const outcome = await account.requestPasswordReset({
      email: parsed.data.email,
      locale,
      ipKey: await hashedClientIp(),
    });
    if (outcome === 'limited') return { formError: 'rateLimited', values };
  } catch (error) {
    logFailure('Password reset request', error);
    return { formError: 'serverError', values };
  }
  return { success: 'forgotSent' };
}

export async function resetAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const parsed = resetSchema.safeParse({ token: text(formData, 'token'), password: text(formData, 'password') });
  if (!parsed.success) {
    const errors = collectFieldErrors(parsed.error);
    return errors.token ? { formError: 'invalidLink' } : { fieldErrors: errors };
  }

  try {
    const result = await account.resetPassword(parsed.data);
    if (result === 'invalid') return { formError: 'invalidLink' };
  } catch (error) {
    logFailure('Password reset', error);
    return { formError: 'serverError' };
  }

  redirect(`/${locale}/account/login?reset=1`);
}

export async function deleteAccountAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeOf(formData);
  const customer = await requireCustomer(locale, `/${locale}/account/settings`);

  // Accounts with a password confirm with it. Google-only accounts retype their email instead.
  const withPassword = customer.hasPassword;
  const parsed = withPassword
    ? deleteAccountSchema.safeParse({ password: text(formData, 'password'), confirm: text(formData, 'confirm') })
    : deleteWithEmailSchema.safeParse({ email: text(formData, 'email'), confirm: text(formData, 'confirm') });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error) };

  try {
    const data = parsed.data as { password?: string; email?: string };
    const result = await account.deleteAccount({
      customerId: customer.id,
      password: data.password,
      email: data.email,
    });
    if (result === 'blocked') return { formError: 'blocked' };
    if (result === 'wrong') {
      return { fieldErrors: withPassword ? { password: 'wrongPassword' } : { email: 'emailMismatch' } };
    }
  } catch (error) {
    logFailure('Account deletion', error);
    return { formError: 'serverError' };
  }

  await endCustomerSession();
  redirect(`/${locale}/account/login?deleted=1`);
}