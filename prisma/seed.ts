import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from '@node-rs/argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SERVICES = [
  { key: 'airport', sortOrder: 1, allowsMultiDay: false },
  { key: 'city', sortOrder: 2, allowsMultiDay: true },
  { key: 'outside', sortOrder: 3, allowsMultiDay: true },
  { key: 'tours', sortOrder: 4, allowsMultiDay: true },
  { key: 'corporate', sortOrder: 5, allowsMultiDay: true },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env');
  }

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { key: s.key },
      update: { sortOrder: s.sortOrder, allowsMultiDay: s.allowsMultiDay },
      create: s,
    });
  }

  // update: {} so re-running the seed never overwrites edits made in the admin later
  await prisma.driver.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: 'ELVAIS',
      phone: '+250700000000',        // placeholder: set the real number
      whatsappNumber: '250700000000', // placeholder
      email,
      vehicleCapacity: 4,             // placeholder: confirm the car's passenger capacity
      languagesSpoken: [],
    },
  });

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await hash(password) },
  });

  const [services, drivers, admins] = await Promise.all([
    prisma.service.count(),
    prisma.driver.count(),
    prisma.adminUser.count(),
  ]);
  console.log(`Seed OK: ${services} services, ${drivers} driver, ${admins} admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());