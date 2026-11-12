import { describe, it, expect } from 'vitest';
import { whatsappUrl } from '@/shared/constants/contact';

describe('WhatsApp link', () => {
  const digits = '250788584963'; // made-up number, used for both the input and the check

  it('uses the number it is given', () => {
    const url = whatsappUrl('Hello ERVAIS, I would like a ride.', digits);
    expect(url.startsWith(`https://wa.me/${digits}?text=`)).toBe(true);
  });

  it('encodes the prefilled message', () => {
    expect(whatsappUrl('Hello ERVAIS, I would like a ride.', digits)).toContain('Hello%20ERVAIS');
  });
});