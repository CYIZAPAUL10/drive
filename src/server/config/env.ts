import 'server-only';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  BOOKING_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(5),
  MIN_FILL_SECONDS: z.coerce.number().int().min(0).default(3),
  REMINDER_AFTER_MINUTES: z.coerce.number().int().min(1).default(30),
  APP_URL: z.string().min(1).default('http://localhost:3000'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(3).default('ERVAIS <onboarding@resend.dev>'),
  EMAIL_TO_OVERRIDE: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Empty values (KEY="") are treated as unset
const source = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''));

export const env = schema.parse(source);