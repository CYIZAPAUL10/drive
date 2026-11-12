import 'server-only';
import { db } from '@/server/db/client';
import type { Prisma } from '@/generated/prisma/client';

export const MAX_ATTEMPTS = 2; // first send + one retry

export type NotifTypeName =
  | 'new_request'
  | 'reminder'
  | 'customer_confirmation'
  | 'verify_email'
  | 'password_reset'
  | 'alert_summary';

const ELIGIBLE = ['pending', 'failed'] as const;
const SELECT = { id: true, bookingId: true, type: true, retryCount: true } as const;

export function findForBooking(bookingId: string) {
  return db.notificationLog.findMany({
    where: { bookingId, status: { in: [...ELIGIBLE] }, retryCount: { lt: MAX_ATTEMPTS } },
    orderBy: { createdAt: 'asc' },
    select: SELECT,
  });
}

export function findDue(createdBefore: Date, limit: number) {
  return db.notificationLog.findMany({
    where: {
      status: { in: [...ELIGIBLE] },
      retryCount: { lt: MAX_ATTEMPTS },
      createdAt: { lte: createdBefore },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: SELECT,
  });
}

/**
 * Takes the row for this attempt. Only one caller can win, so two processes never send the same
 * email twice. The row is marked "failed" until the send succeeds, so a crash mid-send leaves it
 * retryable instead of lost.
 */
export async function claim(id: string, expectedRetryCount: number): Promise<boolean> {
  const result = await db.notificationLog.updateMany({
    where: { id, retryCount: expectedRetryCount, status: { in: [...ELIGIBLE] } },
    data: { status: 'failed', retryCount: { increment: 1 } },
  });
  return result.count === 1;
}

export function markSent(id: string, note?: string) {
  return db.notificationLog.update({
    where: { id },
    data: { status: 'sent', sentAt: new Date(), error: note ?? null },
  });
}

export function markFailed(id: string, errorCode: string, exhaust = false) {
  return db.notificationLog.update({
    where: { id },
    data: { status: 'failed', error: errorCode, ...(exhaust ? { retryCount: MAX_ATTEMPTS } : {}) },
  });
}

/** Counts real sends only (suppressed or skipped rows carry an error note). */
export function countSentSince(since: Date, type?: NotifTypeName) {
  return db.notificationLog.count({
    where: { status: 'sent', error: null, sentAt: { gte: since }, ...(type ? { type } : {}) },
  });
}

export async function hasSummarySince(since: Date): Promise<boolean> {
  const row = await db.notificationLog.findFirst({
    where: { type: 'alert_summary', createdAt: { gte: since } },
    select: { id: true },
  });
  return row !== null;
}

export async function createClaimedSummary(): Promise<string> {
  const row = await db.notificationLog.create({
    data: { type: 'alert_summary', status: 'failed', retryCount: 1 },
    select: { id: true },
  });
  return row.id;
}

export function countBookingsSince(since: Date) {
  return db.bookingRequest.count({ where: { createdAt: { gte: since }, isSpam: false } });
}

export function loadBooking(id: string) {
  return db.bookingRequest.findUnique({
    where: { id },
    include: { service: { select: { key: true } } },
  });
}

export async function getDriverEmail(): Promise<string | null> {
  const driver = await db.driver.findUnique({ where: { id: 'singleton' }, select: { email: true } });
  return driver?.email ?? null;
}

export function recordCronRun(job: string, ok: boolean, detail: string) {
  return db.cronRun.create({ data: { job, ok, detail } });
}

// ----- Reminders -----

/** Requests still New, not spam, never reminded, in the window,*/
export function findReminderCandidates(createdBefore: Date, createdAfter: Date, now: Date, limit: number) {
  return db.bookingRequest.findMany({
    where: {
      status: 'NEW',
      isSpam: false,
      reminderSentAt: null,
      createdAt: { lte: createdBefore, gte: createdAfter },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true },
  });
}

/**
 * Marks the request as reminded and queues the email. The mark happens first and only one caller can
 * win it, so a request can never be reminded twice, even if two jobs run at the same moment.
 */
export async function queueReminder(bookingId: string, now: Date) {
  const claimed = await db.bookingRequest.updateMany({
    where: { id: bookingId, reminderSentAt: null, status: 'NEW', isSpam: false },
    data: { reminderSentAt: now },
  });
  if (claimed.count !== 1) return null;
  return db.notificationLog.create({ data: { bookingId, type: 'reminder' }, select: SELECT });
}

// ----- For the Overview page -----

function failedAlertWhere(since: Date): Prisma.NotificationLogWhereInput {
  return {
    type: { in: ['new_request', 'reminder'] },
    status: 'failed',
    retryCount: { gte: MAX_ATTEMPTS },
    createdAt: { gte: since },
    booking: { is: { status: 'NEW' } }, // only requests nobody has dealt with yet
  };
}

export function countFailedAlerts(since: Date) {
  return db.notificationLog.count({ where: failedAlertWhere(since) });
}

export function listFailedAlerts(since: Date, limit: number) {
  return db.notificationLog.findMany({
    where: failedAlertWhere(since),
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { booking: { select: { id: true, referenceCode: true, guestName: true } } },
  });
}

/** Emails that should have gone out by now. If this is not zero, the background job is probably not running. */
export function countWaiting(olderThan: Date) {
  return db.notificationLog.count({
    where: {
      status: { in: [...ELIGIBLE] },
      retryCount: { lt: MAX_ATTEMPTS },
      createdAt: { lte: olderThan },
    },
  });
}

export function lastCronRun(job: string) {
  return db.cronRun.findFirst({
    where: { job },
    orderBy: { ranAt: 'desc' },
    select: { ranAt: true, ok: true },
  });
}