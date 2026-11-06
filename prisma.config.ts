import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/testlab',
  },
});
