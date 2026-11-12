import 'server-only';
import * as repo from '@/server/repositories/social.repo';
import { parseSocialForm, sortSocials } from '@/shared/utils/socialUrl';

export async function getSocialLinks() {
  return sortSocials(await repo.listAll());
}

export async function getSocialValuesForEdit(): Promise<Record<string, string>> {
  const values: Record<string, string> = {};
  for (const item of await repo.listAll()) values[item.platform] = item.url;
  return values;
}

export async function saveSocialLinks(values: Record<string, string>) {
  const { entries, removals, errors } = parseSocialForm(values);
  if (Object.keys(errors).length > 0) return { ok: false as const, errors };
  await repo.saveAll(entries, removals);
  return { ok: true as const };
}