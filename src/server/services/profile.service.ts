import 'server-only';
import { cache } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as repo from '@/server/repositories/profile.repo';
import * as socialRepo from '@/server/repositories/social.repo';
import { getDriverEmail } from '@/server/repositories/notification.repo';
import { sendEmail } from '@/server/email/client';
import { renderTestEmail } from '@/server/email/templates/testEmail';
import { normalizePhone } from '@/shared/utils/phone';
import { sortSocials } from '@/shared/utils/socialUrl';
import type { ProfileData } from '@/shared/schemas/profile.schema';
import type { ProfileInitial, SiteProfile } from '@/shared/types/profile';

const FALLBACK = { phone: '+250700000000', whatsapp: '250700000000' };

function display(e164: string): string {
  try {
    return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
  } catch {
    return e164;
  }
}

/** For the public pages. Cached per request, so the layout and the page share one query. */
export const getSiteProfile = cache(async (locale: string): Promise<SiteProfile> => {
  const [driver, bios, socials] = await Promise.all([repo.getDriver(), repo.getBios(), socialRepo.listAll()]);

  const phone = driver?.phone || FALLBACK.phone;
  const whatsappDigits = (driver?.whatsappNumber || FALLBACK.whatsapp).replace(/\D/g, '');

  // The visitor's language first, then English. Null means "use the default text in the message files".
  const lang = locale === 'rw' || locale === 'fr' ? locale : 'en';
  const own = bios[lang];
  const english = bios.en;

  return {
    phone,
    phoneDisplay: display(phone),
    whatsappDigits,
    yearsExperience: driver?.yearsExperience ?? null,
    languages: driver?.languagesSpoken ?? [],
    bio: own ?? english ?? null,
    bioLang: own ? lang : english ? 'en' : null,
    socials: sortSocials(socials),
  };
});

export async function getProfileForEdit(): Promise<ProfileInitial> {
  const [driver, bios] = await Promise.all([repo.getDriver(), repo.getBios()]);
  const withPlus = (value: string) => (value && !value.startsWith('+') ? `+${value}` : value);
  return {
    phone: withPlus(driver?.phone ?? ''),
    whatsapp: withPlus(driver?.whatsappNumber ?? ''),
    email: driver?.email ?? '',
    capacity: String(driver?.vehicleCapacity ?? 4),
    years: driver?.yearsExperience == null ? '' : String(driver.yearsExperience),
    languages: driver?.languagesSpoken ?? [],
    bioEn: bios.en ?? '',
    bioRw: bios.rw ?? '',
    bioFr: bios.fr ?? '',
  };
}

export async function updateProfile(d: ProfileData): Promise<void> {
  await repo.saveProfile(
    {
      phone: normalizePhone(d.phone) ?? d.phone,
      whatsappNumber: normalizePhone(d.whatsapp) ?? d.whatsapp,
      email: d.email.toLowerCase(),
      vehicleCapacity: Number(d.capacity),
      yearsExperience: d.years === '' ? null : Number(d.years),
      languagesSpoken: d.languages,
    },
    { en: d.bioEn, rw: d.bioRw, fr: d.bioFr },
  );
}

/** Sends a test email to the address that receives booking alerts. */
export async function sendTestAlert(): Promise<'sent' | 'no_email' | 'failed'> {
  const to = await getDriverEmail();
  if (!to) return 'no_email';
  const result = await sendEmail({ to, ...renderTestEmail() });
  return result.ok ? 'sent' : 'failed';
}