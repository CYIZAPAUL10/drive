import 'server-only';
import * as repo from '@/server/repositories/notification.repo';
import { sendEmail, type OutgoingEmail } from '@/server/email/client';
import { renderDriverAlert, type AlertInput } from '@/server/email/templates/driverAlert';
import { renderDriverReminder } from '@/server/email/templates/driverReminder';
import { renderCustomerConfirmation } from '@/server/email/templates/customerConfirmation';
import { renderAlertSummary } from '@/server/email/templates/summary';
import { env } from '@/server/config/env';

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const RETRY_AFTER_MS = 2 * MINUTE_MS;
const REMINDER_WINDOW_MS = 24 * HOUR_MS; // never remind about requests older than a day

/** More than this many alerts in an hour: send one summary instead of individual alerts. */
export const ALERT_CAP_PER_HOUR = 30;
/** Resend's free plan allows 100 emails a day [VERIFY]. Keep headroom for driver alerts. */
export const DAILY_EMAIL_BUDGET = 80;

type Row = { id: string; bookingId: string | null; type: string; retryCount: number };
type Outcome = 'sent' | 'failed' | 'suppressed' | 'skipped';
type Booking = NonNullable<Awaited<ReturnType<typeof repo.loadBooking>>>;

function startOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function alertInput(b: Booking): AlertInput {
  return {
    referenceCode: b.referenceCode,
    bookingId: b.id,
    appUrl: env.APP_URL,
    guestName: b.guestName,
    guestPhone: b.guestPhone,
    guestEmail: b.guestEmail,
    serviceKey: b.service.key,
    tripType: b.tripType,
    numberOfDays: b.numberOfDays,
    preferredContact: b.preferredContact,
    language: b.language,
  };
}

async function sendSummaryIfNeeded(): Promise<void> {
  const hourAgo = new Date(Date.now() - HOUR_MS);
  if (await repo.hasSummarySince(hourAgo)) return;

  const to = await repo.getDriverEmail();
  const id = await repo.createClaimedSummary();
  if (!to) {
    await repo.markFailed(id, 'no_driver_email', true);
    return;
  }
  const count = await repo.countBookingsSince(hourAgo);
  const result = await sendEmail({ to, ...renderAlertSummary({ count, appUrl: env.APP_URL }) });
  if (result.ok) await repo.markSent(id);
  else await repo.markFailed(id, result.error, true);
}

async function processRow(row: Row): Promise<Outcome> {
  if (!(await repo.claim(row.id, row.retryCount))) return 'skipped';

  const fail = async (code: string, exhaust = false): Promise<Outcome> => {
    await repo.markFailed(row.id, code, exhaust);
    return 'failed';
  };

  if (!row.bookingId) return fail('no_booking', true);
  const booking = await repo.loadBooking(row.bookingId);
  if (!booking) return fail('booking_missing', true);

  let mail: OutgoingEmail;

  if (row.type === 'new_request') {
    const sentLastHour = await repo.countSentSince(new Date(Date.now() - HOUR_MS), 'new_request');
    if (sentLastHour >= ALERT_CAP_PER_HOUR) {
      await repo.markSent(row.id, 'suppressed_by_cap');
      await sendSummaryIfNeeded();
      return 'suppressed';
    }
    const to = await repo.getDriverEmail();
    if (!to) return fail('no_driver_email', true);
    mail = { to, ...renderDriverAlert(alertInput(booking)) };
  } else if (row.type === 'reminder') {
    // Handled in the meantime? Then there is nothing to remind about.
    if (booking.status !== 'NEW' || booking.isSpam) {
      await repo.markSent(row.id, 'no_longer_new');
      return 'skipped';
    }
    const to = await repo.getDriverEmail();
    if (!to) return fail('no_driver_email', true);
    const waitedMinutes = Math.max(1, Math.round((Date.now() - booking.createdAt.getTime()) / MINUTE_MS));
    mail = { to, ...renderDriverReminder({ ...alertInput(booking), waitedMinutes }) };
  } else if (row.type === 'customer_confirmation') {
    if (!booking.guestEmail) {
      await repo.markSent(row.id, 'no_email');
      return 'skipped';
    }
    // Customer emails are the first thing dropped when the daily budget runs low
    if ((await repo.countSentSince(startOfUtcDay())) >= DAILY_EMAIL_BUDGET) return fail('daily_budget', true);
    mail = {
      to: booking.guestEmail,
      ...renderCustomerConfirmation({
        referenceCode: booking.referenceCode,
        guestName: booking.guestName,
        serviceKey: booking.service.key,
        tripType: booking.tripType,
        numberOfDays: booking.numberOfDays,
        preferredContact: booking.preferredContact,
        language: booking.language,
      }),
    };
  } else {
    return fail('unsupported_type', true);
  }

  const result = await sendEmail(mail);
  if (!result.ok) return fail(result.error);
  await repo.markSent(row.id);
  return 'sent';
}

/** Queues one reminder for each request that has waited long enough. Returns the new rows. */
async function queueDueReminders(now: Date) {
  const candidates = await repo.findReminderCandidates(
    new Date(now.getTime() - env.REMINDER_AFTER_MINUTES * MINUTE_MS),
    new Date(now.getTime() - REMINDER_WINDOW_MS),
    now,
    10,
  );
  const rows = [];
  for (const candidate of candidates) {
    const row = await repo.queueReminder(candidate.id, now);
    if (row) rows.push(row);
  }
  return rows;
}

/** Sends the emails for one new booking. Never throws: a failed email must not affect the visitor. */
export async function sendForBooking(bookingId: string): Promise<void> {
  try {
    const rows = await repo.findForBooking(bookingId);
    for (const row of rows) await processRow(row);
  } catch (error) {
    console.error('Sending booking emails failed:', error instanceof Error ? error.name : 'unknown error');
  }
}

/** Sends due reminders and retries anything still pending or failed. Called every 5 minutes by the scheduler. */
export async function runNotificationsJob() {
  const counts = { sent: 0, failed: 0, suppressed: 0, skipped: 0 };
  let due = 0;
  let reminders = 0;
  try {
    const reminderRows = await queueDueReminders(new Date());
    reminders = reminderRows.length;
    for (const row of reminderRows) counts[await processRow(row)] += 1;

    const rows = await repo.findDue(new Date(Date.now() - RETRY_AFTER_MS), 10);
    due = rows.length;
    for (const row of rows) counts[await processRow(row)] += 1;

    await repo.recordCronRun(
      'notifications',
      true,
      `reminders=${reminders} due=${due} sent=${counts.sent} failed=${counts.failed} suppressed=${counts.suppressed}`,
    );
  } catch (error) {
    await repo.recordCronRun('notifications', false, error instanceof Error ? error.name : 'unknown error');
    throw error;
  }
  return { reminders, due, ...counts };
}