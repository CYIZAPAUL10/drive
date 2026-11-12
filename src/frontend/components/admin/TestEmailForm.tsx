'use client';

import { useActionState } from 'react';
import { sendTestEmailAction } from '@/server/actions/admin.actions';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};

export default function TestEmailForm() {
  const [state, action] = useActionState(async () => sendTestEmailAction(), INITIAL);
  return (
    <form action={action} className={styles.form}>
      <AdminSubmit idle="Send a test email" busy="Sending…" variant="secondary" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
      {state.formError && <p role="alert" className={styles.error}>{state.formError}</p>}
    </form>
  );
}