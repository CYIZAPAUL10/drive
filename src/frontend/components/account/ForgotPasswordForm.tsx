'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { forgotAction } from '@/server/actions/account.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import { Link } from '@/frontend/i18n/navigation';
import type { FormState } from '@/shared/types/action';
import AccountSubmit from './AccountSubmit';
import styles from './AccountForms.module.css';

const INITIAL: FormState = {};

export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('Account');
  const [state, action] = useActionState(forgotAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const message = (code?: string) =>
    code ? (t.has(`errors.${code}`) ? t(`errors.${code}`) : t('errors.serverError')) : undefined;

  if (state.success) {
    return (
      <>
        <div role="status" className={styles.panel}>
          <h2>{t('forgot.sentTitle')}</h2>
          <p>{t('forgot.sentText')}</p>
        </div>
        <p className={styles.links}><Link href="/account/login">{t('forgot.back')}</Link></p>
      </>
    );
  }

  const items = errors.email
    ? [{ targetId: 'f-email', text: `${t('fields.email.label')}: ${message(errors.email)}` }]
    : [];

  return (
    <>
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
        <Field id="f-email" label={t('fields.email.label')} mark={t('required')} error={message(errors.email)}>
          {(aria) => <input {...aria} name="email" type="email" className={controlClass} autoComplete="email" defaultValue={state.values?.email ?? ''} />}
        </Field>
        <AccountSubmit idle={t('forgot.submit')} busy={t('forgot.submitting')} />
      </form>
      <p className={styles.links}><Link href="/account/login">{t('forgot.back')}</Link></p>
    </>
  );
}