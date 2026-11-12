import 'server-only';
import { db } from '@/server/db/client';
import type { Prisma } from '@/generated/prisma/client';

type Lang = 'en' | 'rw' | 'fr';
const LANGS: readonly Lang[] = ['en', 'rw', 'fr'];

export function getDriver() {
  return db.driver.findUnique({ where: { id: 'singleton' } });
}

export async function getBios(): Promise<Partial<Record<Lang, string>>> {
  const rows = await db.translation.findMany({
    where: { entityType: 'driver', entityId: 'singleton', field: 'bio' },
    select: { language: true, text: true },
  });
  const out: Partial<Record<Lang, string>> = {};
  for (const row of rows) out[row.language] = row.text;
  return out;
}

export async function saveProfile(
  driver: {
    phone: string;
    whatsappNumber: string;
    email: string;
    vehicleCapacity: number;
    yearsExperience: number | null;
    languagesSpoken: string[];
  },
  bios: Record<Lang, string>,
): Promise<void> {
  const operations = [
    db.driver.update({ where: { id: 'singleton' }, data: driver }),
    ...LANGS.map((language) => {
      const text = bios[language];
      const key = { entityType: 'driver', entityId: 'singleton', field: 'bio', language } as const;
      return text === ''
        ? db.translation.deleteMany({ where: key })
        : db.translation.upsert({
            where: { entityType_entityId_field_language: key },
            create: { ...key, text },
            update: { text },
          });
    }),
  ];
  // All changes are saved together or not at all
  await db.$transaction(operations as Prisma.PrismaPromise<unknown>[]);
}