'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/server/actions/admin.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};
const LABELS = { current: 'Current password', next: 'New password', confirm: 'Confirm new password' } as const;

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, INITIAL);
  const errors = state.fieldErrors ?? {};

  const items = (Object.keys(LABELS) as Array<keyof typeof LABELS>)
    .filter((k) => errors[k])
    .map((k) => ({ targetId: `f-${k}`, text: `${LABELS[k]}: ${errors[k]}` }));

  return (
    <form action={action} noValidate className={styles.form}>
      {(items.length > 0 || state.formError) && (
        <ErrorSummary
          focusKey={state}
          title={state.formError ? 'Your password was not changed' : 'Please fix the following'}
          message={state.formError}
          items={items}
        />
      )}
      <Field id="f-current" label={LABELS.current} mark="(required)" error={errors.current}>
        {(aria) => <input {...aria} name="current" type="password" className={controlClass} autoComplete="current-password" />}
      </Field>
      <Field id="f-next" label={LABELS.next} mark="(required)" error={errors.next}>
        {(aria) => <input {...aria} name="next" type="password" className={controlClass} autoComplete="new-password" />}
      </Field>
      <Field id="f-confirm" label={LABELS.confirm} mark="(required)" error={errors.confirm}>
        {(aria) => <input {...aria} name="confirm" type="password" className={controlClass} autoComplete="new-password" />}
      </Field>
      <AdminSubmit idle="Change password" busy="Saving…" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
    </form>
  );
}