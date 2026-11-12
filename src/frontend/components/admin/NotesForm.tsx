'use client';

import { useActionState } from 'react';
import { saveNotesAction } from '@/server/actions/admin.actions';
import { controlClass } from '@/frontend/components/ui/Field';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};

export default function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action] = useActionState(saveNotesAction, INITIAL);
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="notes" className={styles.label}>Private notes</label>
      <p id="notes-hint" className={styles.hint}>
        Only you can see this, for example the agreed price. It is never shown to customers or included in emails.
      </p>
      <textarea id="notes" name="notes" rows={5} maxLength={2000} className={controlClass}
        aria-describedby="notes-hint" defaultValue={notes} />
      <AdminSubmit idle="Save notes" busy="Saving…" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
      {state.formError && <p role="alert" className={styles.error}>{state.formError}</p>}
    </form>
  );
}