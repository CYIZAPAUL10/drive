import type { BookingStatusName } from '@/shared/constants/status';

// What a customer may see about their own request. Private notes and spam flags are never included.
export type CustomerRequestRow = {
  id: string;
  referenceCode: string;
  status: BookingStatusName;
  serviceKey: string;
  createdAt: string;
};