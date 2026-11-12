'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashedClientIp } from '@/server/security/ip';
import { authenticateAdmin, changeAdminPassword } from '@/server/services/adminAuth.service';
import { startAdminSession, endAdminSession, requireAdmin } from '@/server/auth/session';
import { changeStatus, saveNotes, setSpam, removeRequest } from '@/server/services/requests.service';
import { updateProfile, sendTestAlert } from '@/server/services/profile.service';
import { allow } from '@/server/services/ratelimit.service';
import { BOOKING_STATUSES } from '@/shared/constants/status';
import { profileSchema } from '@/shared/schemas/profile.schema';
import { passwordChangeSchema } from '@/shared/schemas/account.schema';
import { collectFieldErrors } from '@/shared/schemas/booking.schema';
import type { FormState } from '@/shared/types/action';

const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200), // a length limit keeps huge inputs away from the password hasher
});

export async function loginAdminAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '');
  const parsed = loginSchema.safeParse({ email, password: String(formData.get('password') ?? '') });
  if (!parsed.success) return { formError: 'invalid', values: { email } };

  try {
    const result = await authenticateAdmin({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      ipKey: await hashedClientIp(),
    });
    if (!result.ok) return { formError: result.reason, values: { email } };
    await startAdminSession(result.adminId, result.tokenVersion);
  } catch (error) {
    console.error('Admin login failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'tryAgain', values: { email } };
  }

  redirect('/admin');
}

export async function logoutAdminAction(): Promise<void> {
  await endAdminSession();
  redirect('/admin/login');
}

// ----- Everything below re-checks the session on the server. -----

const idSchema = z.string().min(1).max(64);
const refresh = () => revalidatePath('/admin', 'layout');

const statusSchema = z.object({ id: idSchema, status: z.enum(BOOKING_STATUSES) });
const notesSchema = z.object({ id: idSchema, notes: z.string().max(2000) });
const spamSchema = z.object({ id: idSchema, spam: z.enum(['0', '1']) });

export async function setStatusAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    status: String(formData.get('status') ?? ''),
  });
  if (!parsed.success) return { formError: 'Choose a valid status.' };
  if (!(await changeStatus(parsed.data.id, parsed.data.status))) return { formError: 'This request no longer exists.' };
  refresh();
  return { success: 'Status saved.' };
}

export async function saveNotesAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = notesSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    notes: String(formData.get('notes') ?? ''),
  });
  if (!parsed.success) return { formError: 'Notes can be up to 2,000 characters.' };
  const notes = parsed.data.notes.trim();
  if (!(await saveNotes(parsed.data.id, notes === '' ? null : notes))) {
    return { formError: 'This request no longer exists.' };
  }
  refresh();
  return { success: 'Notes saved.' };
}

export async function toggleSpamAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = spamSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    spam: String(formData.get('spam') ?? ''),
  });
  if (!parsed.success) return { formError: 'Something went wrong.' };
  const isSpam = parsed.data.spam === '1';
  if (!(await setSpam(parsed.data.id, isSpam))) return { formError: 'This request no longer exists.' };
  refresh();
  return { success: isSpam ? 'Marked as spam.' : 'Removed from spam.' };
}

export async function deleteRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(String(formData.get('id') ?? ''));
  if (id.success) await removeRequest(id.data);
  refresh();
  redirect('/admin/requests?deleted=1');
}

export async function saveProfileAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const text = (name: string) => String(formData.get(name) ?? '');
  const languages = formData.getAll('languages').map(String);
  const raw = {
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    email: text('email'),
    capacity: text('capacity'),
    years: text('years'),
    languages,
    bioEn: text('bioEn'),
    bioRw: text('bioRw'),
    bioFr: text('bioFr'),
  };
  const values = { ...raw, languages: languages.join(',') };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error), values };

  try {
    await updateProfile(parsed.data);
  } catch (error) {
    console.error('Saving the profile failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'Could not save. Please try again.', values };
  }

  revalidatePath('/[locale]', 'layout'); // refresh every public page in every language
  refresh();
  return { success: 'Saved. The website now shows your changes.', values };
}

export async function sendTestEmailAction(): Promise<FormState> {
  const admin = await requireAdmin();
  if (!(await allow(`admin-test-email:${admin.id}`, 3, 10 * 60 * 1000))) {
    return { formError: 'Please wait a few minutes before sending another test.' };
  }
  const result = await sendTestAlert();
  if (result === 'sent') return { success: 'Test email sent. Check the inbox (and the spam folder).' };
  if (result === 'no_email') return { formError: 'No alert email address is saved yet.' };
  return { formError: 'The test email could not be sent. Check the email settings.' };
}

export async function changePasswordAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = passwordChangeSchema.safeParse({
    current: String(formData.get('current') ?? ''),
    next: String(formData.get('next') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error) };

  try {
    const result = await changeAdminPassword({
      adminId: admin.id,
      current: parsed.data.current,
      next: parsed.data.next,
    });
    if (!result.ok) {
      return result.reason === 'blocked'
        ? { formError: 'Too many wrong attempts. Please wait 15 minutes and try again.' }
        : { fieldErrors: { current: 'The current password is not correct.' } };
    }
    // Other devices are signed out; this one gets a fresh session so you stay signed in
    await startAdminSession(admin.id, result.tokenVersion);
  } catch (error) {
    console.error('Changing the password failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'Could not change the password. Please try again.' };
  }

  return { success: 'Password changed. Any other devices have been signed out.' };
}