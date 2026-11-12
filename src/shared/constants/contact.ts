// PLACEHOLDERS. Replace with ELVAIS's real numbers before launch.
export const CONTACT = {
  phone: '+250700000000',          // for tel: links
  phoneDisplay: '+250 700 000 000', // shown on the page
  whatsappDigits: '250700000000',  // digits only, no "+"
} as const;

/** Opens a WhatsApp chat with a prefilled message. `digits` is the number with no "+" or spaces. */
export function whatsappUrl(message: string, digits: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}