'use client';

import { useActionState } from 'react';
import { deleteCustomerAction } from '@/server/actions/adminCustomers.actions';
import { RadioGroup } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import adminForms from './AdminForms.module.css';
import styles from './CustomerForms.module.css';

const INITIAL: FormState = {};

export default function CustomerDeleteForm({ id, requestCount }: { id: string; requestCount: number }) {
  const [state, action] = useActionState(deleteCustomerAction, INITIAL);
  const errors = state.fieldErrors ?? {};

  const items = [
    ...(errors.requests ? [{ targetId: 'f-requests', text: `Their requests: ${errors.requests}` }] : []),
    ...(errors.confirm ? [{ targetId: 'f-confirm', text: `Confirmation: ${errors.confirm}` }] : []),
  ];

  return (
    <details className={adminForms.danger} open={Boolean(state.fieldErrors || state.formError)}>
      <summary>Delete this customer…</summary>
      <p>
        This permanently deletes the customer&rsquo;s account. They will no longer be able to sign in.
        {requestCount > 0 ? ` They have ${requestCount} ${requestCount === 1 ? 'request' : 'requests'}.` : ''}
      </p>
      <form action={action} noValidate className={adminForms.form}>
        {(items.length > 0 || state.formError) && (
          <ErrorSummary
            focusKey={state}
            title={state.formError ? 'Nothing was deleted' : 'Please fix the following'}
            message={state.formError}
            items={items}
          />
        )}
        <input type="hidden" name="id" value={id} />

        <RadioGroup
          name="requests"
          legend="What should happen to their requests?"
          mark="(required)"
          defaultValue="keep"
          hint="Kept requests stay in your list as guest requests, still holding the customer's name, phone and email until the automatic 2-year cleanup."
          error={errors.requests}
          options={[
            { value: 'keep', label: 'Keep the requests' },
            { value: 'delete', label: 'Delete the requests too' },
          ]}
        />

        <div>
          <label className={styles.check}>
            <input id="f-confirm" type="checkbox" name="confirm" value="yes"
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? 'f-confirm-error' : undefined} />
            <span>Yes, delete this customer</span>
          </label>
          {errors.confirm && <p id="f-confirm-error" className={adminForms.error}>{errors.confirm}</p>}
        </div>

        <AdminSubmit idle="Delete permanently" busy="Deleting…" variant="danger" />
      </form>
    </details>
  );
}