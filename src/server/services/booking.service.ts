import 'server-only';
import { createHash, randomInt } from 'node:crypto';
import { createBookingSchema, collectFieldErrors } from '@/shared/schemas/booking.schema';
import { SERVICE_KEYS } from '@/shared/constants/services';
import { normalizePhone } from '@/shared/utils/phone';
import type { FormState } from '@/shared/types/action';
import * as repo from '@/server/repositories/booking.repo';
import { allow } from '@/server/services/ratelimit.service';
import { checkFormToken, issueFormToken } from '@/server/security/formToken';
import { env } from '@/server/config/env';

type Input = repo.BookingInput;

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0, O, 1, I or L: easy to read aloud
const RATE_WINDOW_MS = 10 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

export function generateReferenceCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) code += ALPHABET[randomInt(ALPHABET.length)];
  return `ELV-${code}`;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export type SubmitResult =
  | { ok: true; referenceCode: string; bookingId?: string }
  | { ok: false; state: FormState };

export async function createBookingRequest(args: {
  values: Record<string, string>;
  token: string;
  ipKey: string;
  locale: string;
}): Promise<SubmitResult> {
  const { values, token, ipKey, locale } = args;
  const fail = (state: FormState): SubmitResult => ({
    ok: false,
    state: { ...state, values, formToken: issueFormToken() },
  });

  // 1. Timing check
  const tokenResult = checkFormToken(token, env.MIN_FILL_SECONDS);
  if (tokenResult !== 'ok') return fail({ formError: tokenResult === 'expired' ? 'formExpired' : 'tryAgain' });

  // 2. Validate
  const parsed = createBookingSchema().safeParse(values);
  if (!parsed.success) return fail({ fieldErrors: collectFieldErrors(parsed.error) });
  const d = parsed.data;

  // 3. Rate limit (counts only valid submissions, so honest typos don't use it up)
  if (!(await allow(`book:${ipKey}`, env.BOOKING_RATE_LIMIT_MAX, RATE_WINDOW_MS))) {
    return fail({ formError: 'rateLimited' });
  }

  // 4. The service must exist and be active
  const service = await repo.findActiveServiceByKey(d.service);
  if (!service) return fail({ fieldErrors: { service: 'required' } });

  // 5. Normalise, then check for an identical request in the last 5 minutes
  const phone = normalizePhone(d.phone);
  if (!phone) return fail({ formError: 'tryAgain' });

  const dedupeHash = sha256([phone, d.service, d.tripType, d.numberOfDays].join('|'));
  const duplicate = await repo.findRecentDuplicate(dedupeHash, new Date(Date.now() - DUPLICATE_WINDOW_MS));
  if (duplicate) return { ok: true, referenceCode: duplicate.referenceCode };

  // 6. Save. The insert commits before any email is sent (emails come in step 4).
  const email = d.email ? d.email.toLowerCase() : null;
  const purgeAfter = new Date();
  purgeAfter.setFullYear(purgeAfter.getFullYear() + 2);
  const language = (['en', 'rw', 'fr'].includes(locale) ? locale : 'en') as Input['language'];

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceCode = generateReferenceCode();
    try {
      const created = await repo.insertBooking(
        {
          referenceCode,
          guestName: d.fullName,
          guestPhone: phone,
          guestEmail: email,
          serviceId: service.id,
          tripType: d.tripType as Input['tripType'],
          numberOfDays: d.tripType === 'multi_day' ? Number(d.numberOfDays) : null,
          preferredContact: d.preferredContact as Input['preferredContact'],
          language,
          dedupeHash,
          purgeAfter,
        },
        email ? ['new_request', 'customer_confirmation'] : ['new_request'],
      );
      return { ok: true, referenceCode: created.referenceCode, bookingId: created.id };
    } catch (error) {
      if (repo.isUniqueViolation(error)) continue; // reference code collision: try another
      throw error;
    }
  }
  return fail({ formError: 'serverError' });
}

export async function getBookingFormData() {
  const [maxPassengers, active] = await Promise.all([repo.getDriverCapacity(), repo.listActiveServices()]);
  const activeKeys = new Set(active.map((s) => s.key));
  return {
    maxPassengers,
    serviceKeys: SERVICE_KEYS.filter((k) => activeKeys.has(k)) as string[],
    token: issueFormToken(),
  };
}

export function bookingExists(referenceCode: string) {
  return repo.referenceExists(referenceCode);
}