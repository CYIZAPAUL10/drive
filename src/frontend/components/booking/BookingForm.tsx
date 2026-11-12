'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { submitBookingAction } from '@/server/actions/booking.actions';
import { Field, RadioGroup, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import { FORM_FIELDS, TRIP_TYPES, CONTACT_PREFS, BOOKING_LIMITS } from '@/shared/constants/booking';
import type { FormState } from '@/shared/types/action';
import buttonStyles from '@/frontend/components/ui/Button.module.css';
import styles from './BookingForm.module.css';

type Props = {
  locale: string;
  token: string;
  maxPassengers: number;
  serviceKeys: string[];
  initialService?: string;
  prefill?: { fullName: string; phone: string; email: string };
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.primary}`}
      disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function BookingForm({ locale, token, maxPassengers, serviceKeys, initialService, prefill }: Props) {
  const t = useTranslations('Booking');
  const services = useTranslations('Services');
  const account = useTranslations('Account');
  // A signed-in customer starts with their details filled in. After an error, their own answers win.
  const [state, formAction] = useActionState(submitBookingAction, { values: prefill ?? {} } satisfies FormState);

  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const v = (name: string, fallback = '') => values[name] ?? fallback;

  const errorText = (code: string) => {
    const key = `errors.${code}`;
    return t.has(key)
      ? t(key, { max: maxPassengers, minDays: BOOKING_LIMITS.daysMin, maxDays: BOOKING_LIMITS.daysMax })
      : t('errors.serverError');
  };
  const e = (name: string) => (errors[name] ? errorText(errors[name]) : undefined);

  const summaryItems = FORM_FIELDS.filter((f) => errors[f]).map((f) => ({
    targetId: `f-${f}`,
    text: `${t(`fields.${f}.label`)}: ${errorText(errors[f])}`,
  }));

  const required = t('required');
  const optional = t('optional');

  return (
    <form action={formAction} noValidate className={styles.form}>
      {(summaryItems.length > 0 || state.formError) && (
        <ErrorSummary
          focusKey={state}
          title={state.formError ? t('formErrorTitle') : t('summaryTitle')}
          message={state.formError ? errorText(state.formError) : undefined}
          items={summaryItems}
        />
      )}

      {prefill && <p className={styles.small}>{account('prefillNote', { email: prefill.email })}</p>}

      <input type="hidden" name="formToken" value={state.formToken ?? token} />
      <input type="hidden" name="locale" value={locale} />

      <section className={styles.section} aria-labelledby="sec-contact">
        <h2 id="sec-contact" className={styles.sectionTitle}>{t('sections.contact')}</h2>

        <Field id="f-fullName" label={t('fields.fullName.label')} mark={required} error={e('fullName')}>
          {(aria) => (
            <input {...aria} name="fullName" type="text" className={controlClass}
              autoComplete="name" maxLength={BOOKING_LIMITS.name} defaultValue={v('fullName')} />
          )}
        </Field>

        <Field id="f-phone" label={t('fields.phone.label')} mark={required}
          hint={t('fields.phone.hint')} error={e('phone')}>
          {(aria) => (
            <input {...aria} name="phone" type="tel" className={controlClass}
              autoComplete="tel" inputMode="tel" maxLength={BOOKING_LIMITS.phone} defaultValue={v('phone')} />
          )}
        </Field>

        <Field id="f-email" label={t('fields.email.label')} mark={optional}
          hint={t('fields.email.hint')} error={e('email')}>
          {(aria) => (
            <input {...aria} name="email" type="email" className={controlClass}
              autoComplete="email" maxLength={BOOKING_LIMITS.email} defaultValue={v('email')} />
          )}
        </Field>
      </section>

      <section className={styles.section} aria-labelledby="sec-trip">
        <h2 id="sec-trip" className={styles.sectionTitle}>{t('sections.trip')}</h2>

        <Field id="f-service" label={t('fields.service.label')} mark={required} error={e('service')}>
          {(aria) => (
            <select {...aria} name="service" className={controlClass}
              defaultValue={v('service', initialService ?? '')}>
              <option value="">{t('fields.service.placeholder')}</option>
              {serviceKeys.map((k) => (
                <option key={k} value={k}>{services(`items.${k}.name`)}</option>
              ))}
            </select>
          )}
        </Field>

        <RadioGroup
          name="tripType"
          legend={t('fields.tripType.label')}
          mark={required}
          defaultValue={v('tripType', 'one_way')}
          error={e('tripType')}
          options={TRIP_TYPES.map((k) => ({ value: k, label: t(`fields.tripType.options.${k}`) }))}
        />

        {/* Shown by CSS only when "Multi-day" is chosen, so it works without JavaScript */}
        <div className={styles.daysField}>
          <Field id="f-numberOfDays" label={t('fields.numberOfDays.label')} mark={required}
            hint={t('fields.numberOfDays.hint')} error={e('numberOfDays')}>
            {(aria) => (
              <input {...aria} name="numberOfDays" type="number" className={controlClass}
                inputMode="numeric" min={BOOKING_LIMITS.daysMin} max={BOOKING_LIMITS.daysMax}
                defaultValue={v('numberOfDays')} />
            )}
          </Field>
        </div>


        <RadioGroup
          name="preferredContact"
          legend={t('fields.preferredContact.label')}
          mark={required}
          defaultValue={v('preferredContact')}
          error={e('preferredContact')}
          options={CONTACT_PREFS.map((k) => ({ value: k, label: t(`fields.preferredContact.options.${k}`) }))}
        />
      </section>

      <p className={styles.notice}>{t('notice')}</p>

      <SubmitButton label={t('submit')} pendingLabel={t('submitting')} />
    </form>
  );
}