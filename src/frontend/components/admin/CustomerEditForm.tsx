'use client';

import { useActionState } from 'react';
import { updateCustomerAction } from '@/server/actions/adminCustomers.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};
const FIELDS = [
  { name: 'fullName', label: 'Full name' },
  { name: 'phone', label: 'Phone number' },
  { name: 'language', label: 'Language' },
] as const;

type Props = { id: string; fullName: string; phone: string; language: string };

export default function CustomerEditForm({ id, fullName, phone, language }: Props) {
  const [state, action] = useActionState(updateCustomerAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const value = (name: string, fallback: string) => state.values?.[name] ?? fallback;

  const items = FIELDS.filter((f) => errors[f.name]).map((f) => ({
    targetId: `f-${f.name}`,
    text: `${f.label}: ${errors[f.name]}`,
  }));

  return (
    <form action={action} noValidate className={styles.form}>
      {(items.length > 0 || state.formError) && (
        <ErrorSummary
          focusKey={state}
          title={state.formError ? 'Your changes were not saved' : 'Please fix the following'}
          message={state.formError}
          items={items}
        />
      )}
      <input type="hidden" name="id" value={id} />

      <Field id="f-fullName" label="Full name" mark="(required)" error={errors.fullName}>
        {(aria) => <input {...aria} name="fullName" type="text" className={controlClass} autoComplete="off" maxLength={100} defaultValue={value('fullName', fullName)} />}
      </Field>
      <Field id="f-phone" label="Phone number" mark="(optional)"
        hint="Rwandan numbers can be written 078 123 4567. Leave empty if there is none." error={errors.phone}>
        {(aria) => <input {...aria} name="phone" type="tel" className={controlClass} autoComplete="off" defaultValue={value('phone', phone)} />}
      </Field>
      <Field id="f-language" label="Language" mark="(required)"
        hint="The language of the emails this customer receives." error={errors.language}>
        {(aria) => (
          <select {...aria} name="language" className={controlClass} defaultValue={value('language', language)}>
            <option value="en">English</option>
            <option value="rw">Kinyarwanda</option>
            <option value="fr">French</option>
          </select>
        )}
      </Field>

      <AdminSubmit idle="Save changes" busy="Saving…" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
    </form>
  );
}