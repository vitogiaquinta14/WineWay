import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';
export function crearPrisma(url = process.env.DATABASE_URL ?? 'file:./wineway.db') {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}
export type DB = ReturnType<typeof crearPrisma>;
