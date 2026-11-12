import { z } from 'zod';
import { normalizePhone } from '@/shared/utils/phone';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ----- Admin: change password (messages are plain English) -----

export const MIN_PASSWORD_LENGTH = 12;

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password.').max(200),
    next: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters. A few unrelated words work well.`)
      .max(200, 'This is too long.'),
    confirm: z.string().max(200),
  })
  .superRefine((d, ctx) => {
    if (d.confirm !== d.next) {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'The two new passwords do not match.' });
    }
    if (d.next === d.current && d.next !== '') {
      ctx.addIssue({ code: 'custom', path: ['next'], message: 'The new password must be different from the current one.' });
    }
  });

// ----- Customers: messages are CODES, translated in the forms (Account.errors.<code>) -----

export const CUSTOMER_MIN_PASSWORD = 10;

const email = z
  .string()
  .trim()
  .min(1, 'required')
  .max(254, 'tooLong')
  .refine((v) => EMAIL.test(v), 'invalidEmail');

const newPassword = z
  .string()
  .min(1, 'required')
  .min(CUSTOMER_MIN_PASSWORD, 'passwordShort')
  .max(200, 'tooLong');

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'required').min(2, 'tooShort').max(100, 'tooLong'),
  phone: z
    .string()
    .trim()
    .min(1, 'required')
    .max(30, 'tooLong')
    .refine((v) => normalizePhone(v) !== null, 'invalidPhone'),
  email,
  password: newPassword,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'required').max(200, 'tooLong'),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: newPassword,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'required').max(200, 'tooLong'),
  confirm: z.string().refine((v) => v === 'yes', 'confirmRequired'),
});