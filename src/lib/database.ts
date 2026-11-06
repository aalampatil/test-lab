import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
const globalDatabase = globalThis as unknown as { testlabPrisma?: PrismaClient };
export function database() {
  if (!process.env.DATABASE_URL) throw Error('PostgreSQL is not configured.');
  if (!globalDatabase.testlabPrisma)
    globalDatabase.testlabPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  return globalDatabase.testlabPrisma;
}
