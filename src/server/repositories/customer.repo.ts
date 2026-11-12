import 'server-only';
import { db } from '@/server/db/client';

type Lang = 'en' | 'rw' | 'fr';

export const findByEmail = (email: string) => db.customer.findUnique({ where: { email } });
export const findById = (id: string) => db.customer.findUnique({ where: { id } });
export const findByGoogleId = (googleId: string) => db.customer.findUnique({ where: { googleId } });

export const create = (data: {
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  preferredLanguage: Lang;
}) => db.customer.create({ data, select: { id: true } });

/** A second sign-up with a still-unconfirmed email replaces the pending details. */
export const updatePending = (
  id: string,
  data: { fullName: string; phone: string; passwordHash: string; preferredLanguage: Lang },
) => db.customer.update({ where: { id }, data, select: { id: true } });

export const markVerified = (id: string) => db.customer.update({ where: { id }, data: { emailVerified: true } });

/** New password. Also confirms the email (the reset link proved control of it) and signs out every session. */
export async function setPassword(id: string, passwordHash: string): Promise<void> {
  await db.customer.update({
    where: { id },
    data: { passwordHash, hasPassword: true, emailVerified: true, tokenVersion: { increment: 1 } },
  });
}

export const createFromGoogle = (data: {
  fullName: string;
  email: string;
  googleId: string;
  passwordHash: string;
  preferredLanguage: Lang;
}) =>
  db.customer.create({
    data: { ...data, phone: '', hasPassword: false, emailVerified: true },
    select: { id: true, tokenVersion: true },
  });

/**
 * Links a Google account to an existing customer. If the account was never confirmed, whoever created it
 * may not own the email, so its password is thrown away and every session is signed out.
 */
export function attachGoogle(
  id: string,
  googleId: string,
  options: { wasVerified: boolean; randomHash: string },
) {
  return db.customer.update({
    where: { id },
    data: options.wasVerified
      ? { googleId }
      : {
          googleId,
          emailVerified: true,
          passwordHash: options.randomHash,
          hasPassword: false,
          tokenVersion: { increment: 1 },
        },
    select: { tokenVersion: true },
  });
}

/** Attaches earlier guest requests made with this (now confirmed) email. */
export async function linkGuestBookings(customerId: string, email: string): Promise<number> {
  const result = await db.bookingRequest.updateMany({
    where: { customerId: null, guestEmail: email },
    data: { customerId },
  });
  return result.count;
}

export const attachBooking = (bookingId: string, customerId: string) =>
  db.bookingRequest.updateMany({ where: { id: bookingId, customerId: null }, data: { customerId } });

/** The customer's requests are deleted with the account (cascade). */
export const remove = (id: string) => db.customer.deleteMany({ where: { id } });

export const listRequests = (customerId: string) =>
  db.bookingRequest.findMany({
    where: { customerId, isSpam: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      referenceCode: true,
      status: true,
      createdAt: true,
      service: { select: { key: true } },
    },
  });