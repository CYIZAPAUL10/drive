export const TRIP_TYPES = ['one_way', 'round_trip', 'multi_day'] as const;
export const CONTACT_PREFS = ['call', 'whatsapp'] as const;

export const BOOKING_LIMITS = {
  name: 100,
  phone: 30,
  email: 254,
  location: 200,
  notes: 1000,
  daysMin: 2,
  daysMax: 30,
  maxAdvanceDays: 365,
} as const;

// Order here is the order errors are listed in the summary
export const FORM_FIELDS = [
  'fullName',
  'phone',
  'email',
  'service',
  'tripType',
  'numberOfDays',
  'preferredContact',
] as const;

export const HIDE_TRIP_DETAILS = true;
export const TRIP_TBC = 'To be confirmed by phone';
