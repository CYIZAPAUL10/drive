import { z } from 'zod';

/** Deleting a Google-only account: there is no password, so the customer retypes their email. */
export const deleteWithEmailSchema = z.object({
  email: z.string().trim().min(1, 'required').max(254, 'tooLong'),
  confirm: z.string().refine((v) => v === 'yes', 'confirmRequired'),
});