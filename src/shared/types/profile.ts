import type { SocialPlatformKey } from '@/shared/constants/socialPlatforms';

/** What the public pages need. Built on the server, in the visitor's language. */
export type SiteProfile = {
  phone: string; // E.164, for tel: links
  phoneDisplay: string; // international format, for display
  whatsappDigits: string; // digits only, for wa.me links
  yearsExperience: number | null;
  languages: string[]; // language codes
  bio: string | null; // null: use the default text from the message files
  bioLang: string | null; // language the bio is actually written in
  socials: Array<{ platform: SocialPlatformKey; url: string }>;
};

/** Values shown in the admin profile form. */
export type ProfileInitial = {
  phone: string;
  whatsapp: string;
  email: string;
  capacity: string;
  years: string;
  languages: string[];
  bioEn: string;
  bioRw: string;
  bioFr: string;
};