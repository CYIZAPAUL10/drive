'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { resetAction } from '@/server/actions/account.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import AccountSubmit from './AccountSubmit';
import styles from './AccountForms.module.css';

const INITIAL: FormState = {};

export default function ResetPasswordForm({ locale, token }: { locale: string; token: string }) {
  const t = useTranslations('Account');
  const [state, action] = useActionState(resetAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const message = (code?: string) =>
    code ? (t.has(`errors.${code}`) ? t(`errors.${code}`) : t('errors.serverError')) : undefined;

  const items = errors.password
    ? [{ targetId: 'f-password', text: `${t('fields.newPassword.label')}: ${message(errors.password)}` }]
    : [];

  return (
    <form action={action} noValidate className={styles.form}>
      {(items.length > 0 || state.formError) && (
        <ErrorSummary
          focusKey={state}
          title={state.formError ? t('formErrorTitle') : t('summaryTitle')}
          message={message(state.formError)}
          items={items}
        />
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <Field id="f-password" label={t('fields.newPassword.label')} mark={t('required')}
        hint={t('fields.newPassword.hint')} error={message(errors.password)}>
        {(aria) => <input {...aria} name="password" type="password" className={controlClass} autoComplete="new-password" />}
      </Field>
      <AccountSubmit idle={t('reset.submit')} busy={t('reset.submitting')} />
    </form>
  );
}