'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth/session';
import { saveSocialLinks } from '@/server/services/social.service';
import { SOCIAL_KEYS } from '@/shared/constants/socialPlatforms';
import type { FormState } from '@/shared/types/action';

export async function saveSocialLinksAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const values: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) values[key] = String(formData.get(`url_${key}`) ?? '');

  try {
    const result = await saveSocialLinks(values);
    if (!result.ok) return { fieldErrors: result.errors, values };
  } catch (error) {
    console.error('Saving social links failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'Could not save. Please try again.', values };
  }

  revalidatePath('/[locale]', 'layout'); // refresh the footer on every public page, in every language
  revalidatePath('/admin', 'layout');
  return { success: 'Saved. The website footer now shows these links.', values };
}