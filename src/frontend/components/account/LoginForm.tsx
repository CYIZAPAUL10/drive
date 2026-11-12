'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAction, resendVerificationAction } from '@/server/actions/account.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import { Link } from '@/frontend/i18n/navigation';
import type { FormState } from '@/shared/types/action';
import AccountSubmit from './AccountSubmit';
import styles from './AccountForms.module.css';

const INITIAL: FormState = {};

function ResendForm({ locale, email }: { locale: string; email: string }) {
  const t = useTranslations('Account');
  const [state, action] = useActionState(resendVerificationAction, INITIAL);
  return (
    <form action={action} className={styles.inline}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="email" value={email} />
      <AccountSubmit idle={t('login.resend')} busy={t('login.resending')} variant="secondary" />
      <p role="status" className={styles.status}>{state.success ? t('login.resendSent') : ''}</p>
    </form>
  );
}

type Props = { locale: string; next: string; notice?: 'reset' | 'deleted' };

export default function LoginForm({ locale, next, notice }: Props) {
  const t = useTranslations('Account');
  const [state, action] = useActionState(loginAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const message = (code?: string) =>
    code ? (t.has(`errors.${code}`) ? t(`errors.${code}`) : t('errors.serverError')) : undefined;

  const items = (['email', 'password'] as const)
    .filter((f) => errors[f])
    .map((f) => ({ targetId: `f-${f}`, text: `${t(`fields.${f}.label`)}: ${message(errors[f])}` }));

  return (
    <>
      <p role="status" className={notice ? styles.notice : 'sr-only'}>
        {notice === 'reset' ? t('login.resetDone') : notice === 'deleted' ? t('login.deleted') : ''}
      </p>

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
        <input type="hidden" name="next" value={next} />

        <Field id="f-email" label={t('fields.email.label')} mark={t('required')} error={message(errors.email)}>
          {(aria) => <input {...aria} name="email" type="email" className={controlClass} autoComplete="username" defaultValue={state.values?.email ?? ''} />}
        </Field>
        <Field id="f-password" label={t('fields.password.label')} mark={t('required')} error={message(errors.password)}>
          {(aria) => <input {...aria} name="password" type="password" className={controlClass} autoComplete="current-password" />}
        </Field>

        <AccountSubmit idle={t('login.submit')} busy={t('login.submitting')} />
      </form>

      {state.formError === 'unverified' && <ResendForm locale={locale} email={state.values?.email ?? ''} />}

      <p className={styles.links}>
        <Link href="/account/forgot-password">{t('login.forgot')}</Link>
        <span>
          {t('login.noAccount')} <Link href="/account/register">{t('login.createAccount')}</Link>
        </span>
        <span className={styles.hint}>{t('login.guestHint')}</span>
      </p>
    </>
  );
}