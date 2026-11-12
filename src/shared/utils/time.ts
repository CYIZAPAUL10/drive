// Rwanda uses Central Africa Time (UTC+2) all year, with no daylight saving.
const KIGALI_OFFSET_HOURS = 2;
const HOUR_MS = 3_600_000;

/** Turns a Kigali date ("2026-12-31") and time ("10:30") into a UTC Date, or null if invalid. */
export function kigaliToUtc(date: string, time: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;

  const y = Number(d[1]);
  const mo = Number(d[2]);
  const da = Number(d[3]);
  const h = Number(t[1]);
  const mi = Number(t[2]);
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || h > 23 || mi > 59) return null;

  const ms = Date.UTC(y, mo - 1, da, h - KIGALI_OFFSET_HOURS, mi);
  const back = new Date(ms + KIGALI_OFFSET_HOURS * HOUR_MS);
  // Reject dates that roll over, such as 2026-02-31
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== da) {
    return null;
  }
  return new Date(ms);
}

/** Today's date in Kigali as "YYYY-MM-DD". */
export function kigaliToday(now = new Date()): string {
  return new Date(now.getTime() + KIGALI_OFFSET_HOURS * HOUR_MS).toISOString().slice(0, 10);
}