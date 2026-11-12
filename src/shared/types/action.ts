// Returned by form Server Actions. Error values are message codes, translated in the form.
export type FormState = {
  fieldErrors?: Record<string, string>;
  formError?: string;
  success?: string;
  values?: Record<string, string>;
  formToken?: string;
};