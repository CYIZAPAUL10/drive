import { SOCIAL_PLATFORMS, SOCIAL_KEYS, type SocialPlatformKey } from '@/shared/constants/socialPlatforms';

export type SocialUrlResult = { ok: true; url: string } | { ok: false; error: string };

const fail = (error: string): SocialUrlResult => ({ ok: false, error });

/** Checks one address. It must be a normal web address on the platform's own domain. */
export function validateSocialUrl(platform: SocialPlatformKey, input: string): SocialUrlResult {
  const raw = input.trim();
  if (raw.length > 300) return fail('This link is too long.');

  const spec = SOCIAL_PLATFORMS.find((p) => p.key === platform);
  if (!spec) return fail('Unknown platform.');

  // "facebook.com/page" is fine: add https. Anything with another scheme is checked as typed.
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return fail('Enter a valid web address.');
  }

  if (url.protocol === 'http:') url.protocol = 'https:';
  if (url.protocol !== 'https:') return fail('The address must start with https://');
  if (url.username || url.password) return fail('Remove the user name or password from the address.');
  if (url.port && url.port !== '443') return fail('Remove the port number from the address.');

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  const onPlatform = spec.domains.some((d) => host === d || host.endsWith(`.${d}`));
  if (!onPlatform) return fail(`This does not look like a ${spec.label} address. It should be on ${spec.domains[0]}.`);

  if (url.pathname === '/' || url.pathname === '') {
    return fail('Add the address of your page or account, not just the site.');
  }

  url.hash = '';
  return { ok: true, url: url.toString() };
}

/** Reads the whole form: blank boxes are removals, filled boxes are checked one by one. */
export function parseSocialForm(values: Record<string, string>) {
  const entries: Array<{ platform: SocialPlatformKey; url: string }> = [];
  const removals: SocialPlatformKey[] = [];
  const errors: Record<string, string> = {};

  for (const platform of SOCIAL_PLATFORMS) {
    const raw = (values[platform.key] ?? '').trim();
    if (raw === '') {
      removals.push(platform.key);
      continue;
    }
    const result = validateSocialUrl(platform.key, raw);
    if (result.ok) entries.push({ platform: platform.key, url: result.url });
    else errors[platform.key] = result.error;
  }
  return { entries, removals, errors };
}

/** Puts links in the standard order and drops unknown platforms. */
export function sortSocials<T extends { platform: string }>(items: T[]): Array<T & { platform: SocialPlatformKey }> {
  return items
    .filter((i): i is T & { platform: SocialPlatformKey } => (SOCIAL_KEYS as string[]).includes(i.platform))
    .sort((a, b) => SOCIAL_KEYS.indexOf(a.platform) - SOCIAL_KEYS.indexOf(b.platform));
}