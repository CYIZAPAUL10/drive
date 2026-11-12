'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { deleteAccountAction } from '@/server/actions/account.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import type { FormState } from '@/shared/types/action';
import AccountSubmit from './AccountSubmit';
import styles from './AccountForms.module.css';

const INITIAL: FormState = {};

export default function DeleteAccountForm({ locale, hasPassword }: { locale: string; hasPassword: boolean }) {
  const t = useTranslations('Account');
  const auth = useTranslations('Auth');
  const [state, action] = useActionState(deleteAccountAction, INITIAL);
  const errors = state.fieldErrors ?? {};

  const message = (code?: string) => {
    if (!code) return undefined;
    if (auth.has(`errors.${code}`)) return auth(`errors.${code}`);
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : t('errors.serverError');
  };

  const secretField = hasPassword ? 'password' : 'email';
  const secretLabel = hasPassword ? t('fields.currentPassword.label') : auth('delete.emailLabel');

  const items = ([secretField, 'confirm'] as const)
    .filter((f) => errors[f])
    .map((f) => ({
      targetId: `f-${f}`,
      text: `${f === 'confirm' ? t('settings.deleteConfirm') : secretLabel}: ${message(errors[f])}`,
    }));

  return (
    <details className={styles.danger} open={Boolean(state.fieldErrors || state.formError)}>
      <summary>{t('settings.deleteSummary')}</summary>
      <p>{t('settings.deleteText')}</p>
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

        {hasPassword ? (
          <Field id="f-password" label={secretLabel} mark={t('required')} error={message(errors.password)}>
            {(aria) => <input {...aria} name="password" type="password" className={controlClass} autoComplete="current-password" />}
          </Field>
        ) : (
          <Field id="f-email" label={secretLabel} mark={t('required')} hint={auth('delete.emailHint')} error={message(errors.email)}>
            {(aria) => <input {...aria} name="email" type="email" className={controlClass} autoComplete="off" />}
          </Field>
        )}

        <div>
          <label className={styles.check}>
            <input id="f-confirm" type="checkbox" name="confirm" value="yes"
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? 'f-confirm-error' : undefined} />
            <span>{t('settings.deleteConfirm')}</span>
          </label>
          {errors.confirm && <p id="f-confirm-error" className={styles.error}>{message(errors.confirm)}</p>}
        </div>
        <AccountSubmit idle={t('settings.deleteSubmit')} busy={t('settings.deleting')} variant="danger" />
      </form>
    </details>
  );
}