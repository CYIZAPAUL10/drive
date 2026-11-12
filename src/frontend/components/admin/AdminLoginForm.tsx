'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAdminAction } from '@/server/actions/admin.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import buttonStyles from '@/frontend/components/ui/Button.module.css';
import styles from './AdminLoginForm.module.css';

const MESSAGES: Record<string, string> = {
  invalid: 'The email or password is not correct.',
  blocked: 'Too many failed attempts. Please wait 15 minutes and try again.',
  tryAgain: 'Something went wrong. Please try again.',
};

const INITIAL: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.primary}`} disabled={pending} aria-busy={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminAction, INITIAL);

  return (
    <form action={formAction} noValidate className={styles.form}>
      {state.formError && (
        <ErrorSummary
          focusKey={state}
          title="Sign in failed"
          message={MESSAGES[state.formError] ?? MESSAGES.tryAgain}
          items={[]}
        />
      )}
      <Field id="f-email" label="Email" mark="(required)">
        {(aria) => (
          <input {...aria} name="email" type="email" className={controlClass}
            autoComplete="username" defaultValue={state.values?.email ?? ''} />
        )}
      </Field>
      <Field id="f-password" label="Password" mark="(required)">
        {(aria) => (
          <input {...aria} name="password" type="password" className={controlClass} autoComplete="current-password" />
        )}
      </Field>
      <SubmitButton />
    </form>
  );
}