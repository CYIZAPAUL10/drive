'use server';

import 'server-only';
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { hashedClientIp } from '@/server/security/ip';
import { issueFormToken } from '@/server/security/formToken';
import { getCustomer } from '@/server/auth/customerSession';
import { createBookingRequest } from '@/server/services/booking.service';
import { sendForBooking } from '@/server/services/notification.service';
import { attachBookingToCustomer } from '@/server/services/account.service';
import { readBookingValues } from '@/shared/schemas/booking.schema';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/shared/constants/locales';
import type { FormState } from '@/shared/types/action';

export async function submitBookingAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = readBookingValues(formData);
  const token = String(formData.get('formToken') ?? '');
  const rawLocale = String(formData.get('locale') ?? '');
  const locale: Locale = (LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : DEFAULT_LOCALE;

  let referenceCode: string;
  let bookingId: string | undefined;
  try {
    const result = await createBookingRequest({ values, token, ipKey: await hashedClientIp(), locale });
    if (!result.ok) return result.state;
    referenceCode = result.referenceCode;
    bookingId = result.bookingId;
  } catch (error) {
    // Log the error type only: error objects can contain the visitor's personal data
    console.error('Booking submission failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'serverError', values, formToken: issueFormToken() };
  }

  if (bookingId) {
    const id = bookingId;
    try {
      const customer = await getCustomer();
      if (customer) await attachBookingToCustomer(id, customer.id);
    } catch {
      // The booking is saved either way. Linking by email can still happen later.
    }
    // Emails go out after the response, so they never slow the visitor
    after(() => sendForBooking(id));
  }

  redirect(`/${locale}/book/received/${referenceCode}`);
}