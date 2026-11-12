// Keys match the message files. The booking form will reuse these.
export const SERVICE_KEYS = ['airport', 'city', 'outside', 'tours', 'corporate'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];