import { describe, it, expect } from 'vitest';
import { initialsOf } from '@/shared/utils/initials';
import { deleteWithEmailSchema } from '@/shared/schemas/passwordless.schema';

describe('initialsOf', () => {
  it('uses the first letters of the first two words', () => {
    expect(initialsOf('Jean Claude')).toBe('JC');
    expect(initialsOf('  marie   louise  uwase ')).toBe('ML');
  });
  it('handles one word, accents and empty names', () => {
    expect(initialsOf('ervais')).toBe('E');
    expect(initialsOf('Émile Zola')).toBe('ÉZ');
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('deleteWithEmailSchema', () => {
  it('needs the email and the confirmation', () => {
    expect(deleteWithEmailSchema.safeParse({ email: 'a@b.co', confirm: 'yes' }).success).toBe(true);
    expect(deleteWithEmailSchema.safeParse({ email: '', confirm: 'yes' }).success).toBe(false);
    expect(deleteWithEmailSchema.safeParse({ email: 'a@b.co', confirm: '' }).success).toBe(false);
  });
});