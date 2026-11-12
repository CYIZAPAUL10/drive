export const BOOKING_STATUSES = ['NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
export type BookingStatusName = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<BookingStatusName, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};