import 'server-only';
import { Resend } from 'resend';
import { env } from '@/server/config/env';

const TIMEOUT_MS = 10_000;
let resend: Resend | null = null;

export type OutgoingEmail = { to: string; subject: string; html: string; text: string };
export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Sends one email. Errors are returned as short codes only: Resend's messages can contain
 * the recipient's address, and personal data must not end up in logs.
 * With EMAIL_TO_OVERRIDE set, every email goes to that address (test mode).
 */
export async function sendEmail(mail: OutgoingEmail): Promise<SendResult> {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'not_configured' };
  resend ??= new Resend(env.RESEND_API_KEY);

  const redirected = Boolean(env.EMAIL_TO_OVERRIDE);
  try {
    const request = resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO_OVERRIDE || mail.to,
      subject: redirected ? `[TEST] ${mail.subject}` : mail.subject,
      html: mail.html,
      text: mail.text,
    });
    const result = await Promise.race([
      request,
      new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), TIMEOUT_MS)),
    ]);
    if (result === 'timeout') return { ok: false, error: 'timeout' };
    if (result.error) return { ok: false, error: result.error.name || 'send_failed' };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.name : 'send_failed' };
  }
}