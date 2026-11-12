'use client';

import { useActionState } from 'react';
import { setStatusAction } from '@/server/actions/admin.actions';
import { controlClass } from '@/frontend/components/ui/Field';
import { BOOKING_STATUSES, STATUS_LABELS, type BookingStatusName } from '@/shared/constants/status';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

const INITIAL: FormState = {};

export default function StatusForm({ id, status }: { id: string; status: BookingStatusName }) {
  const [state, action] = useActionState(setStatusAction, INITIAL);
  return (
    <form action={action} className={styles.form} key={status}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="status" className={styles.label}>Status</label>
      <select id="status" name="status" className={controlClass} defaultValue={status}>
        {BOOKING_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <AdminSubmit idle="Save status" busy="Saving…" />
      <p role="status" className={styles.status}>{state.success ?? ''}</p>
      {state.formError && <p role="alert" className={styles.error}>{state.formError}</p>}
    </form>
  );
}