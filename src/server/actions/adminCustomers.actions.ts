'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth/session';
import { editCustomer, deleteCustomer } from '@/server/services/customers.service';
import { customerEditSchema, customerDeleteSchema } from '@/shared/schemas/customerEdit.schema';
import { collectFieldErrors } from '@/shared/schemas/booking.schema';
import type { FormState } from '@/shared/types/action';

const text = (formData: FormData, name: string) => String(formData.get(name) ?? '');
const refresh = () => revalidatePath('/admin', 'layout');

export async function updateCustomerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const values = { fullName: text(formData, 'fullName'), phone: text(formData, 'phone'), language: text(formData, 'language') };
  const parsed = customerEditSchema.safeParse({ id: text(formData, 'id'), ...values });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error), values };

  try {
    if (!(await editCustomer(parsed.data))) return { formError: 'This customer no longer exists.', values };
  } catch (error) {
    console.error('Updating a customer failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'Could not save. Please try again.', values };
  }

  refresh();
  return { success: 'Saved.', values };
}

export async function deleteCustomerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = customerDeleteSchema.safeParse({
    id: text(formData, 'id'),
    requests: text(formData, 'requests'),
    confirm: text(formData, 'confirm'),
  });
  if (!parsed.success) return { fieldErrors: collectFieldErrors(parsed.error) };

  try {
    await deleteCustomer(parsed.data.id, parsed.data.requests === 'keep');
  } catch (error) {
    console.error('Deleting a customer failed:', error instanceof Error ? error.name : 'unknown error');
    return { formError: 'Could not delete. Please try again.' };
  }

  refresh();
  redirect('/admin/customers?deleted=1');
}