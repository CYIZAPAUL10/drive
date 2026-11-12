export type FailedAlert = { id: string; referenceCode: string; guestName: string };

export type Overview = {
  newRequests: number;
  failedAlerts: { count: number; items: FailedAlert[] };
  waitingEmails: number;
  lastRun: { at: string; ok: boolean; stale: boolean } | null;
};