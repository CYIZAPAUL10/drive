import type { BookingStatusName } from '@/shared/constants/status';

export type CustomerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
  createdAt: string;
  requestCount: number;
};

export type CustomerRequestItem = {
  id: string;
  referenceCode: string;
  status: BookingStatusName;
  createdAt: string;
};

export type CustomerDetail = CustomerRow & {
  preferredLanguage: string;
  requests: CustomerRequestItem[];
};