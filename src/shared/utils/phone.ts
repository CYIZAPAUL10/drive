import { parsePhoneNumberFromString } from 'libphonenumber-js';

/** Returns the number in E.164 form (+250781234567), or null if it is not a valid number. */
export function normalizePhone(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input.trim(), 'RW');
  return parsed && parsed.isValid() ? parsed.number : null;
}