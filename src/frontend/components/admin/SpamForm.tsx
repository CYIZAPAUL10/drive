'use client';

import { useActionState } from 'react';
import { toggleSpamAction } from '@/server/actions/admin.actions';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};

export default function SpamForm({ id, isSpam }: { id: string; isSpam: boolean }) {
  const [state, action] = useActionState(toggleSpamAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="spam" value={isSpam ? '0' : '1'} />
      <p className={styles.hint}>
        {isSpam
          ? 'This request is marked as spam. It is hidden from the list unless you tick "Include spam".'
          : 'Mark fake or junk requests as spam to hide them from the list and the New count.'}
      </p>
      <AdminSubmit idle={isSpam ? 'Not spam' : 'Mark as spam'} busy="Saving…" variant="secondary" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
      {state.formError && <p role="alert" className={styles.error}>{state.formError}</p>}
    </form>
  );
}