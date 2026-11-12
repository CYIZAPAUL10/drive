import { describe, it, expect } from 'vitest';
import en from '@/frontend/messages/en.json';
import fr from '@/frontend/messages/fr.json';
import rw from '@/frontend/messages/rw.json';
import enBooking from '@/frontend/messages/booking/en.json';
import frBooking from '@/frontend/messages/booking/fr.json';
import rwBooking from '@/frontend/messages/booking/rw.json';
import enAccount from '@/frontend/messages/account/en.json';
import frAccount from '@/frontend/messages/account/fr.json';
import rwAccount from '@/frontend/messages/account/rw.json';
import enAuth from '@/frontend/messages/auth/en.json';
import frAuth from '@/frontend/messages/auth/fr.json';
import rwAuth from '@/frontend/messages/auth/rw.json';
import enUi from '@/frontend/messages/ui/en.json';
import frUi from '@/frontend/messages/ui/fr.json';
import rwUi from '@/frontend/messages/ui/rw.json';

function keys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe.each([
  ['common', en, fr, rw],
  ['booking', enBooking, frBooking, rwBooking],
  ['account', enAccount, frAccount, rwAccount],
  ['auth', enAuth, frAuth, rwAuth],
  ['ui', enUi, frUi, rwUi],
])('%s messages', (_name, base, french, kinyarwanda) => {
  it('fr has exactly the same keys as en', () => {
    expect(keys(french).sort()).toEqual(keys(base).sort());
  });
  it('rw has exactly the same keys as en', () => {
    expect(keys(kinyarwanda).sort()).toEqual(keys(base).sort());
  });
});