import 'server-only';
import { db } from '@/server/db/client';
import { MAX_ATTEMPTS } from '@/server/repositories/notification.repo';

/** Records an account email so it counts toward the daily email budget. These are not retried. */
export function logAccountEmail(type: 'verify_email' | 'password_reset', ok: boolean, errorCode: string | null) {
  return db.notificationLog.create({
    data: {
      type,
      status: ok ? 'sent' : 'failed',
      retryCount: MAX_ATTEMPTS,
      sentAt: ok ? new Date() : null,
      error: errorCode,
    },
  });
}