// Where to send someone after signing in. Only internal, language-prefixed paths are allowed,
// so a crafted link can never redirect to another website.
const SAFE = /^\/(en|rw|fr)(\/[a-z0-9-]+)*$/;

export function safeNext(value: unknown, fallback: string): string {
  return typeof value === 'string' && SAFE.test(value) ? value : fallback;
}