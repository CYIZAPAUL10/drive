import 'server-only';
import { createHash } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import * as adminRepo from '@/server/repositories/admin.repo';
import { isBlocked, recordHit } from '@/server/services/ratelimit.service';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 10;
const MAX_PASSWORD_FAILURES = 5;

let dummyHash: Promise<string> | undefined;

async function safeVerify(storedHash: string, password: string): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

export type LoginResult =
  | { ok: true; adminId: string; tokenVersion: number }
  | { ok: false; reason: 'invalid' | 'blocked' };

export async function authenticateAdmin(input: {
  email: string; // already lowercased
  password: string;
  ipKey: string; // hashed IP
}): Promise<LoginResult> {
  // Keys hold hashes only: no email address or raw IP is stored
  const emailKey = `admin-login:email:${createHash('sha256').update(input.email).digest('hex').slice(0, 32)}`;
  const ipKey = `admin-login:ip:${input.ipKey}`;

  if (
    (await isBlocked(emailKey, MAX_FAILURES_PER_EMAIL, WINDOW_MS)) ||
    (await isBlocked(ipKey, MAX_FAILURES_PER_IP, WINDOW_MS))
  ) {
    return { ok: false, reason: 'blocked' };
  }

  const admin = await adminRepo.findByEmail(input.email);

  // Always do one password check, even for an unknown email, so timing does not reveal which emails exist
  dummyHash ??= hash('not-a-real-password');
  const valid = await safeVerify(admin?.passwordHash ?? (await dummyHash), input.password);

  if (!admin || !valid) {
    await Promise.all([recordHit(emailKey, WINDOW_MS), recordHit(ipKey, WINDOW_MS)]);
    return { ok: false, reason: 'invalid' };
  }

  await adminRepo.touchLogin(admin.id);
  return { ok: true, adminId: admin.id, tokenVersion: admin.tokenVersion };
}

export type PasswordChangeResult =
  | { ok: true; tokenVersion: number }
  | { ok: false; reason: 'wrong_current' | 'blocked' };

export async function changeAdminPassword(input: {
  adminId: string;
  current: string;
  next: string;
}): Promise<PasswordChangeResult> {
  const key = `admin-password:${input.adminId}`;
  if (await isBlocked(key, MAX_PASSWORD_FAILURES, WINDOW_MS)) return { ok: false, reason: 'blocked' };

  const admin = await adminRepo.findById(input.adminId);
  if (!admin || !(await safeVerify(admin.passwordHash, input.current))) {
    await recordHit(key, WINDOW_MS);
    return { ok: false, reason: 'wrong_current' };
  }

  const tokenVersion = await adminRepo.updatePassword(admin.id, await hash(input.next));
  return { ok: true, tokenVersion };
}