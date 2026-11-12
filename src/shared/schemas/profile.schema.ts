import { z } from 'zod';
import { normalizePhone } from '@/shared/utils/phone';
import { SPOKEN_LANGUAGES } from '@/shared/constants/spokenLanguages';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHOLE = /^\d{1,3}$/;

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((v) => normalizePhone(v) !== null, 'Enter a valid phone number, for example 078 123 4567 or +250 78 123 4567.');

const bio = z.string().trim().max(1500, 'Keep it under 1,500 characters.');

// The admin is English-only, so messages here are plain English, not codes.
export const profileSchema = z.object({
  phone: phone('Phone number'),
  whatsapp: phone('WhatsApp number'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .max(254, 'This is too long.')
    .refine((v) => EMAIL.test(v), 'Enter a valid email address.'),
  capacity: z
    .string()
    .trim()
    .refine((v) => WHOLE.test(v) && Number(v) >= 1 && Number(v) <= 10, 'Enter a number from 1 to 10.'),
  years: z
    .string()
    .trim()
    .refine((v) => v === '' || (WHOLE.test(v) && Number(v) <= 80), 'Enter a number from 0 to 80, or leave it empty.'),
  languages: z.array(z.enum(SPOKEN_LANGUAGES)),
  bioEn: bio,
  bioRw: bio,
  bioFr: bio,
});

export type ProfileData = z.infer<typeof profileSchema>;