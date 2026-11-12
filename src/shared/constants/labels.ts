// English names for the admin. (The admin is English-only by decision.)
export const SERVICE_NAMES: Record<string, string> = {
  airport: 'Airport transfer',
  city: 'City rides',
  outside: 'Trips outside Kigali',
  tours: 'Tours',
  corporate: 'Corporate and regular service',
};
export const TRIP_NAMES: Record<string, string> = {
  one_way: 'One way',
  round_trip: 'Round trip',
  multi_day: 'Multi-day',
};
export const CONTACT_NAMES: Record<string, string> = { call: 'Phone call', whatsapp: 'WhatsApp' };
export const LANGUAGE_NAMES: Record<string, string> = { en: 'English', rw: 'Kinyarwanda', fr: 'French' };
export const EMAIL_TYPE_NAMES: Record<string, string> = {
  new_request: 'Alert to ELVAIS',
  customer_confirmation: 'Confirmation to customer',
  reminder: 'Reminder to ELVAIS',
  alert_summary: 'Summary alert',
  verify_email: 'Email verification',
  password_reset: 'Password reset',
};
export const EMAIL_STATUS_NAMES: Record<string, string> = {
  pending: 'Waiting to send',
  sent: 'Sent',
  failed: 'Failed',
};

export const nameOf = (map: Record<string, string>, key: string) => map[key] ?? key;