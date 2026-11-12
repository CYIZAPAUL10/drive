import { z } from 'zod';
import { normalizePhone } from '@/shared/utils/phone';

// The admin is English-only, so messages are plain English.
export const customerEditSchema = z.object({
  id: z.string().min(1).max(64),
  fullName: z.string().trim().min(1, 'Enter a name.').min(2, 'Enter at least 2 characters.').max(100, 'Keep it under 100 characters.'),
  phone: z
    .string()
    .trim()
    .max(30, 'This is too long.')
    .refine((v) => v === '' || normalizePhone(v) !== null, 'Enter a valid phone number, or leave it empty.'),
  language: z.string().refine((v) => ['en', 'rw', 'fr'].includes(v), 'Choose a language.'),
});

export const customerDeleteSchema = z.object({
  id: z.string().min(1).max(64),
  requests: z.string().refine((v) => v === 'keep' || v === 'delete', 'Choose what happens to their requests.'),
  confirm: z.string().refine((v) => v === 'yes', 'Tick the box to confirm.'),
});