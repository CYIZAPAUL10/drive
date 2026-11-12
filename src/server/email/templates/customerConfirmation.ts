import 'server-only';
import { SERVICE_LABELS, TRIP_LABELS, CONTACT_LABELS, label, toLang, type Lang } from '@/server/email/labels';
import { detailsTable, esc, shell, type Rendered } from './shared';

export type ConfirmationInput = {
  referenceCode: string;
  guestName: string;
  serviceKey: string;
  tripType: string;
  numberOfDays: number | null;
  preferredContact: string;
  language: string;
};

type Copy = {
  subject: (ref: string) => string;
  preheader: string;
  hello: (name: string) => string;
  intro: string;
  refLabel: string;
  next: string;
  tripTitle: string;
  rows: { service: string; trip: string; from: string; to: string; when: string; passengers: string; contact: string };
  days: (n: number) => string;
  footer: string;
  locale: string;
};

// Kinyarwanda is a DRAFT and needs a native-speaker review before launch.
const COPY: Record<Lang, Copy> = {
  en: {
    subject: (ref) => `ERVAIS: we received your request (${ref})`,
    preheader: 'Your ride request has been received.',
    hello: (name) => `Hello ${name},`,
    intro: 'Thank you. Your ride request has been received.',
    refLabel: 'Your reference code',
    next: 'ERVAIS will contact you to confirm the details and agree the price. No online payment is required.',
    tripTitle: 'Your request',
    rows: { service: 'Service', trip: 'Trip', from: 'From', to: 'To', when: 'When (Kigali time)', passengers: 'Passengers', contact: 'Preferred contact' },
    days: (n) => `${n} days`,
    footer: 'If you did not make this request, you can ignore this email.',
    locale: 'en-GB',
  },
  fr: {
    subject: (ref) => `ERVAIS : demande reçue (${ref})`,
    preheader: 'Votre demande de course a bien été reçue.',
    hello: (name) => `Bonjour ${name},`,
    intro: 'Merci. Votre demande de course a bien été reçue.',
    refLabel: 'Votre code de référence',
    next: "ERVAIS vous contactera pour confirmer les détails et convenir du prix. Aucun paiement en ligne n'est requis.",
    tripTitle: 'Votre demande',
    rows: { service: 'Service', trip: 'Trajet', from: 'Départ', to: 'Destination', when: 'Date et heure (heure de Kigali)', passengers: 'Passagers', contact: 'Contact souhaité' },
    days: (n) => `${n} jours`,
    footer: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.",
    locale: 'fr-FR',
  },
  rw: {
    subject: (ref) => `ERVAIS: ubusabe bwawe bwakiriwe (${ref})`,
    preheader: "Ubusabe bwawe bw'urugendo bwakiriwe.",
    hello: (name) => `Muraho ${name},`,
    intro: "Murakoze. Ubusabe bwawe bw'urugendo bwakiriwe.",
    refLabel: "Kode yawe y'ubusabe",
    next: "ERVAIS azaguhamagara kugira ngo mwemeranye ku bisobanuro n'igiciro. Nta kwishyura kuri interineti bikenewe.",
    tripTitle: 'Ubusabe bwawe',
    rows: { service: 'Serivisi', trip: 'Urugendo', from: 'Aho utangirira', to: 'Aho ugiye', when: "Itariki n'isaha (igihe cya Kigali)", passengers: 'Abagenzi', contact: 'Uburyo ushaka ko akugeraho' },
    days: (n) => `iminsi ${n}`,
    footer: 'Niba utari wowe watanze ubusabe, ushobora kutita kuri iyi imeri.',
    locale: 'rw-RW',
  },
};

/** Subject contains only our own reference code, never user text. Says "received", never "confirmed". */
export function renderCustomerConfirmation(i: ConfirmationInput): Rendered {
  const lang = toLang(i.language);
  const c = COPY[lang];

  const trip = label(TRIP_LABELS, i.tripType, lang) + (i.numberOfDays ? ` (${c.days(i.numberOfDays)})` : '');
  const rows: Array<[string, string]> = [
    [c.rows.service, label(SERVICE_LABELS, i.serviceKey, lang)],
    [c.rows.trip, trip],
    [c.rows.contact, label(CONTACT_LABELS, i.preferredContact, lang)],
  ];

  const subject = c.subject(i.referenceCode);

  const body =
    `<p style="margin:0 0 12px;">${esc(c.hello(i.guestName))}</p>` +
    `<p style="margin:0 0 16px;">${esc(c.intro)}</p>` +
    `<p style="margin:0 0 4px;color:#4b5563;">${esc(c.refLabel)}</p>` +
    `<p style="margin:0 0 16px;padding:16px;text-align:center;background:#f5f6f8;border:2px solid #1a1a1a;border-radius:6px;font-family:Consolas,Menlo,monospace;font-size:26px;font-weight:bold;letter-spacing:2px;">${esc(i.referenceCode)}</p>` +
    `<p style="margin:0 0 8px;font-weight:bold;">${esc(c.next)}</p>` +
    `<h2 style="margin:20px 0 0;font-size:18px;">${esc(c.tripTitle)}</h2>` +
    detailsTable(rows);

  const html = shell({
    lang,
    title: subject,
    preheader: c.preheader,
    body,
    footer: `${esc(c.footer)}<br>ERVAIS, Kigali, Rwanda`,
  });

  const text = [
    c.hello(i.guestName),
    '',
    c.intro,
    `${c.refLabel}: ${i.referenceCode}`,
    '',
    c.next,
    '',
    c.tripTitle,
    ...rows.map(([name, value]) => `${name}: ${value}`),
    '',
    c.footer,
  ].join('\n');

  return { subject, html, text };
}