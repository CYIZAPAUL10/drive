import type { ReactNode } from 'react';
import styles from './Field.module.css';

export const controlClass = styles.control;

type Aria = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true };

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

type FieldProps = {
  id: string;
  label: string;
  mark: string; // "(required)" or "(optional)", written in text, not just colour
  hint?: string;
  error?: string;
  children: (aria: Aria) => ReactNode;
};

export function Field({ id, label, mark, hint, error, children }: FieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} <span className={styles.mark}>{mark}</span>
      </label>
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          <WarningIcon />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

type RadioGroupProps = {
  name: string;
  legend: string;
  mark: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  hint?: string;
  error?: string;
};

export function RadioGroup({ name, legend, mark, options, defaultValue, hint, error }: RadioGroupProps) {
  const id = `f-${name}`;
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={styles.group} aria-describedby={describedBy} data-invalid={error ? 'true' : undefined}>
      <legend className={styles.label}>
        {legend} <span className={styles.mark}>{mark}</span>
      </legend>
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      <div className={styles.options}>
        {options.map((o, i) => (
          <label key={o.value} className={styles.option}>
            {/* The first radio carries the id so the error summary link can focus it */}
            <input type="radio" name={name} value={o.value} id={i === 0 ? id : undefined}
              defaultChecked={defaultValue === o.value} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          <WarningIcon />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}