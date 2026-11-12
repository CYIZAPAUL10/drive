import { z } from 'zod';
import type { ZodError } from 'zod';
import { SERVICE_KEYS } from '@/shared/constants/services';
import { TRIP_TYPES, CONTACT_PREFS, BOOKING_LIMITS, FORM_FIELDS } from '@/shared/constants/booking';

import { normalizePhone } from '@/shared/utils/phone';

// Error messages in this schema are CODES. The form translates them (Booking.errors.<code>).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const WHOLE = /^\d{1,2}$/;


const oneOf = (list: readonly string[]) => (v: string) => list.includes(v);

export function createBookingSchema() {

  return z
    .object({
      fullName: z.string().trim().min(1, 'required').min(2, 'tooShort').max(BOOKING_LIMITS.name, 'tooLong'),
      phone: z
        .string()
        .trim()
        .min(1, 'required')
        .max(BOOKING_LIMITS.phone, 'tooLong')
        .refine((v) => normalizePhone(v) !== null, 'invalidPhone'),
      email: z
        .string()
        .trim()
        .max(BOOKING_LIMITS.email, 'tooLong')
        .refine((v) => v === '' || EMAIL.test(v), 'invalidEmail'),
      service: z.string().refine(oneOf(SERVICE_KEYS), 'required'),
      tripType: z.string().refine(oneOf(TRIP_TYPES), 'required'),
      numberOfDays: z.string().trim(),
      preferredContact: z.string().refine(oneOf(CONTACT_PREFS), 'required'),
    })
    .superRefine((d, ctx) => {
      const add = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (d.tripType === 'multi_day') {
        if (d.numberOfDays === '') add('numberOfDays', 'required');
        else if (!WHOLE.test(d.numberOfDays)) add('numberOfDays', 'invalidNumber');
        else {
          const n = Number(d.numberOfDays);
          if (n < BOOKING_LIMITS.daysMin || n > BOOKING_LIMITS.daysMax) add('numberOfDays', 'daysRange');
        }
      }
    });
}

/** First error code per field. */
export function collectFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Reads the known fields from submitted form data as plain strings. */
export function readBookingValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of FORM_FIELDS) {
    const v = formData.get(key);
    out[key] = typeof v === 'string' ? v : '';
  }
  return out;
}