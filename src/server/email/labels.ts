import 'server-only';

// Used only by emails. The frontend has its own copies in the message files, because
// server code may not import from /frontend. Keep both in step when a label changes.
export type Lang = 'en' | 'rw' | 'fr';
type Labels = Record<string, Record<Lang, string>>;

export const SERVICE_LABELS: Labels = {
  airport: { en: 'Airport transfer', rw: "Kujyana no kuzana ku kibuga cy'indege", fr: 'Transfert aéroport' },
  city: { en: 'City rides', rw: 'Ingendo mu mujyi wa Kigali', fr: 'Courses en ville' },
  outside: { en: 'Trips outside Kigali', rw: 'Ingendo hanze ya Kigali', fr: 'Trajets hors de Kigali' },
  tours: { en: 'Tours', rw: "Ingendo z'ubukerarugendo", fr: 'Excursions' },
  corporate: { en: 'Corporate and regular service', rw: "Ibigo n'ingendo zihoraho", fr: 'Service entreprises et réguliers' },
};

export const TRIP_LABELS: Labels = {
  one_way: { en: 'One way', rw: 'Kugenda gusa', fr: 'Aller simple' },
  round_trip: { en: 'Round trip', rw: 'Kugenda no kugaruka', fr: 'Aller-retour' },
  multi_day: { en: 'Multi-day', rw: 'Iminsi myinshi', fr: 'Plusieurs jours' },
};

export const CONTACT_LABELS: Labels = {
  call: { en: 'Phone call', rw: 'Guhamagara kuri telefoni', fr: 'Appel téléphonique' },
  whatsapp: { en: 'WhatsApp', rw: 'WhatsApp', fr: 'WhatsApp' },
};

export const LANGUAGE_NAMES: Record<string, string> = { en: 'English', rw: 'Kinyarwanda', fr: 'French' };

export function label(map: Labels, key: string, lang: Lang): string {
  return map[key]?.[lang] ?? key;
}

export function toLang(value: string): Lang {
  return value === 'rw' || value === 'fr' ? value : 'en';
}