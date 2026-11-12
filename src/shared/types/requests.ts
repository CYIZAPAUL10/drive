import type { BookingStatusName } from '@/shared/constants/status';

// Dates are ISO strings so these objects can be passed to client components.
export type RequestRow = {
  id: string;
  referenceCode: string;
  guestName: string;
  guestPhone: string;
  createdAt: string;
  status: BookingStatusName;
  isSpam: boolean;
  tripType: string;
  serviceKey: string;
};

export type EmailLogRow = {
  id: string;
  type: string;
  status: string;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type RequestDetail = RequestRow & {
  guestEmail: string | null;
  numberOfDays: number | null;
  preferredContact: string;
  language: string;
  driverPrivateNotes: string | null;
  emails: EmailLogRow[];
};