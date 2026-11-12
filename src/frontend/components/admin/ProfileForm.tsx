'use client';

import { useActionState } from 'react';
import { saveProfileAction } from '@/server/actions/admin.actions';
import { Field, controlClass } from '@/frontend/components/ui/Field';
import { ErrorSummary } from '@/frontend/components/ui/ErrorSummary';
import {
  SPOKEN_LANGUAGES, SPOKEN_LANGUAGE_NAMES, BIO_LANGUAGES, BIO_LANGUAGE_NAMES,
} from '@/shared/constants/spokenLanguages';
import type { FormState } from '@/shared/types/action';
import type { ProfileInitial } from '@/shared/types/profile';
import AdminSubmit from './AdminSubmit';
import styles from './ProfileForm.module.css';

const INITIAL: FormState = {};
const REQ = '(required)';
const OPT = '(optional)';

const FIELDS = [
  { name: 'phone', label: 'Phone number' },
  { name: 'whatsapp', label: 'WhatsApp number' },
  { name: 'email', label: 'Alert email' },
  { name: 'capacity', label: 'Passenger capacity' },
  { name: 'years', label: 'Years of experience' },
  { name: 'languages', label: 'Languages' },
  { name: 'bioEn', label: 'Bio (English)' },
  { name: 'bioRw', label: 'Bio (Kinyarwanda)' },
  { name: 'bioFr', label: 'Bio (French)' },
] as const;

const BIO_KEYS = { en: 'bioEn', rw: 'bioRw', fr: 'bioFr' } as const;

export default function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const [state, action] = useActionState(saveProfileAction, INITIAL);
  const errors = state.fieldErrors ?? {};

  const text = (name: Exclude<keyof ProfileInitial, 'languages'>) => state.values?.[name] ?? initial[name];
  const selected = state.values
    ? (state.values.languages ?? '').split(',').filter(Boolean)
    : initial.languages;

  const summaryItems = FIELDS.filter((f) => errors[f.name]).map((f) => ({
    targetId: `f-${f.name}`,
    text: `${f.label}: ${errors[f.name]}`,
  }));

  // Based on what is saved, not on what is being typed
  const missing = BIO_LANGUAGES.filter((l) => !initial[BIO_KEYS[l]].trim());
  const missingNames = missing.map((l) => BIO_LANGUAGE_NAMES[l]).join(' and ');

  return (
    <form action={action} noValidate className={styles.form}>
      {(summaryItems.length > 0 || state.formError) && (
        <ErrorSummary
          focusKey={state}
          title={state.formError ? 'Your changes were not saved' : 'Please fix the following'}
          message={state.formError}
          items={summaryItems}
        />
      )}

      <section className={styles.section} aria-labelledby="sec-contact">
        <h2 id="sec-contact" className={styles.h2}>Contact details</h2>
        <Field id="f-phone" label="Phone number" mark={REQ}
          hint="Customers call this number. Rwandan numbers can be written 078 123 4567." error={errors.phone}>
          {(aria) => <input {...aria} name="phone" type="tel" className={controlClass} autoComplete="off" defaultValue={text('phone')} />}
        </Field>
        <Field id="f-whatsapp" label="WhatsApp number" mark={REQ}
          hint="Customers chat with this number. Usually the same as the phone number." error={errors.whatsapp}>
          {(aria) => <input {...aria} name="whatsapp" type="tel" className={controlClass} autoComplete="off" defaultValue={text('whatsapp')} />}
        </Field>
        <Field id="f-email" label="Alert email" mark={REQ}
          hint="New booking requests are emailed here. A typo means missed bookings, so send a test after changing it." error={errors.email}>
          {(aria) => <input {...aria} name="email" type="email" className={controlClass} autoComplete="off" defaultValue={text('email')} />}
        </Field>
      </section>

      <section className={styles.section} aria-labelledby="sec-vehicle">
        <h2 id="sec-vehicle" className={styles.h2}>Vehicle and experience</h2>
        <Field id="f-capacity" label="Passengers the car can carry" mark={REQ}
          hint="The booking form does not accept more passengers than this." error={errors.capacity}>
          {(aria) => <input {...aria} name="capacity" type="number" min={1} max={10} inputMode="numeric" className={controlClass} defaultValue={text('capacity')} />}
        </Field>
        <Field id="f-years" label="Years of experience" mark={OPT}
          hint="Shown on the website. Leave empty to hide it." error={errors.years}>
          {(aria) => <input {...aria} name="years" type="number" min={0} max={80} inputMode="numeric" className={controlClass} defaultValue={text('years')} />}
        </Field>

        <fieldset className={styles.group} aria-describedby={errors.languages ? 'f-languages-error' : undefined}>
          <legend className={styles.legend}>Languages you speak <span className={styles.mark}>{OPT}</span></legend>
          <div className={styles.options}>
            {SPOKEN_LANGUAGES.map((code, i) => (
              <label key={code} className={styles.option}>
                <input type="checkbox" name="languages" value={code}
                  id={i === 0 ? 'f-languages' : undefined} defaultChecked={selected.includes(code)} />
                <span>{SPOKEN_LANGUAGE_NAMES[code]}</span>
              </label>
            ))}
          </div>
          {errors.languages && <p id="f-languages-error" className={styles.error}>{errors.languages}</p>}
        </fieldset>
      </section>

      <section className={styles.section} aria-labelledby="sec-bio">
        <h2 id="sec-bio" className={styles.h2}>About you</h2>
        <p className={styles.hint}>
          Write in the first person, for example &ldquo;I&rsquo;m ELVAIS&hellip;&rdquo;. Separate paragraphs with a blank line.
        </p>
        {missing.length > 0 && (
          <p className={styles.warn}>
            {missing.length === 3
              ? 'No bio saved yet: the website shows a short default text.'
              : `Missing: ${missingNames}. Visitors reading the site in ${missing.length === 1 ? 'that language' : 'those languages'} will see ${missing.includes('en') ? 'the default text' : 'the English text'} instead.`}
          </p>
        )}
        {BIO_LANGUAGES.map((l) => (
          <Field key={l} id={`f-${BIO_KEYS[l]}`} label={`Bio (${BIO_LANGUAGE_NAMES[l]})`} mark={OPT} error={errors[BIO_KEYS[l]]}>
            {(aria) => (
              <textarea {...aria} name={BIO_KEYS[l]} rows={6} maxLength={1500} className={controlClass}
                defaultValue={text(BIO_KEYS[l])} />
            )}
          </Field>
        ))}
      </section>

      <AdminSubmit idle="Save changes" busy="Saving…" />
      <p role="status" className={styles.success}>{state.success ?? ''}</p>
    </form>
  );
}