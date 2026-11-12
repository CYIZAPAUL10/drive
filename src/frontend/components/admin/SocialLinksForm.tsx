'use client';

import { useActionState } from 'react';
import { saveSocialLinksAction } from '@/server/actions/adminSocial.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import { SOCIAL_PLATFORMS } from '@/shared/constants/socialPlatforms';
import type { FormState } from '@/shared/types/action';
import AdminSubmit from './AdminSubmit';
import styles from './ProfileForm.module.css';

const INITIAL: FormState = {};

export default function SocialLinksForm({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(saveSocialLinksAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const value = (key: string) => state.values?.[key] ?? initial[key] ?? '';

  const items = SOCIAL_PLATFORMS.filter((p) => errors[p.key]).map((p) => ({
    targetId: `f-${p.key}`,
    text: `${p.label}: ${errors[p.key]}`,
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

      <section className={styles.section} aria-labelledby="sec-social">
        <h2 id="sec-social" className={styles.h2}>Your accounts</h2>
        {SOCIAL_PLATFORMS.map((p) => (
          <Field key={p.key} id={`f-${p.key}`} label={p.label} mark="(optional)"
            hint={`For example ${p.example}`} error={errors[p.key]}>
            {(aria) => (
              <input {...aria} name={`url_${p.key}`} type="url" className={controlClass}
                inputMode="url" autoComplete="off" maxLength={300} defaultValue={value(p.key)} />
            )}
          </Field>
        ))}
      </section>

      <AdminSubmit idle="Save links" busy="Saving…" />
      <p role="status" className={styles.success}>{state.success ?? ''}</p>
    </form>
  );
}