import 'server-only';
import * as adminRepo from '@/server/repositories/admin.repo';
import * as notificationRepo from '@/server/repositories/notification.repo';
import type { Overview } from '@/shared/types/overview';

const DAY_MS = 86_400_000;
const WAITING_AFTER_MS = 10 * 60_000;
const STALE_AFTER_MS = 15 * 60_000; // the job should run every 5 minutes

export async function getOverview(): Promise<Overview> {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY_MS);

  const [newRequests, failedCount, failedList, waiting, lastRun] = await Promise.all([
    adminRepo.countNewRequests(),
    notificationRepo.countFailedAlerts(weekAgo),
    notificationRepo.listFailedAlerts(weekAgo, 5),
    notificationRepo.countWaiting(new Date(now - WAITING_AFTER_MS)),
    notificationRepo.lastCronRun('notifications'),
  ]);

  return {
    newRequests,
    failedAlerts: {
      count: failedCount,
      items: failedList.flatMap((row) => (row.booking ? [row.booking] : [])),
    },
    waitingEmails: waiting,
    lastRun: lastRun
      ? {
          at: lastRun.ranAt.toISOString(),
          ok: lastRun.ok,
          stale: now - lastRun.ranAt.getTime() > STALE_AFTER_MS,
        }
      : null,
  };
}