'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { registerAction } from '@/server/actions/account.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import { Link } from '@/frontend/i18n/navigation';
import type { FormState } from '@/shared/types/action';
import AccountSubmit from './AccountSubmit';
import styles from './AccountForms.module.css';

const INITIAL: FormState = {};
const FIELDS = ['fullName', 'phone', 'email', 'password'] as const;

export default function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('Account');
  const auth = useTranslations('Auth');
  const [state, action] = useActionState(registerAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const value = (name: string) => state.values?.[name] ?? '';
  const message = (code?: string) =>
    code ? (t.has(`errors.${code}`) ? t(`errors.${code}`) : t('errors.serverError')) : undefined;

  if (state.success === 'registerPending') {
    return (
      <div role="status" className={styles.panel}>
        <h2>{auth('exists.pendingTitle')}</h2>
        <p>{auth('exists.pendingText')}</p>
      </div>
    );
  }

  if (state.success) {
    return (
      <div role="status" className={styles.panel}>
        <h2>{t('register.sentTitle')}</h2>
        <p>{t('register.sentText')}</p>
      </div>
    );
  }

  const exists = state.formError === 'emailExists';
  const items = FIELDS.filter((f) => errors[f]).map((f) => ({
    targetId: `f-${f}`,
    text: `${t(`fields.${f}.label`)}: ${message(errors[f])}`,
  }));

  return (
    <>
      <form action={action} noValidate className={styles.form}>
        {(items.length > 0 || state.formError) && (
          <ErrorSummary
            focusKey={state}
            title={exists ? auth('exists.title') : state.formError ? t('formErrorTitle') : t('summaryTitle')}
            message={exists ? auth('exists.text') : message(state.formError)}
            items={items}
          />
        )}
        <input type="hidden" name="locale" value={locale} />

        <Field id="f-fullName" label={t('fields.fullName.label')} mark={t('required')} error={message(errors.fullName)}>
          {(aria) => <input {...aria} name="fullName" type="text" className={controlClass} autoComplete="name" defaultValue={value('fullName')} />}
        </Field>
        <Field id="f-phone" label={t('fields.phone.label')} mark={t('required')} hint={t('fields.phone.hint')} error={message(errors.phone)}>
          {(aria) => <input {...aria} name="phone" type="tel" className={controlClass} autoComplete="tel" inputMode="tel" defaultValue={value('phone')} />}
        </Field>
        <Field id="f-email" label={t('fields.email.label')} mark={t('required')} error={message(errors.email)}>
          {(aria) => <input {...aria} name="email" type="email" className={controlClass} autoComplete="email" defaultValue={value('email')} />}
        </Field>
        <Field id="f-password" label={t('fields.password.label')} mark={t('required')} hint={t('fields.password.hint')} error={message(errors.password)}>
          {(aria) => <input {...aria} name="password" type="password" className={controlClass} autoComplete="new-password" />}
        </Field>

        <AccountSubmit idle={t('register.submit')} busy={t('register.submitting')} />
      </form>

      {exists && (
        <p className={styles.links}>
          <Link href="/account/login">{auth('exists.signIn')}</Link>
          <Link href="/account/forgot-password">{auth('exists.forgot')}</Link>
        </p>
      )}

      <p className={styles.links}>
        <span>
          {t('register.haveAccount')} <Link href="/account/login">{t('register.signIn')}</Link>
        </span>
      </p>
    </>
  );
}