import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI uses the direct connection; the app uses the pooled DATABASE_URL at runtime
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
});