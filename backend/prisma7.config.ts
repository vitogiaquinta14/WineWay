import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { urlSQLiteAbsoluta } from './src/utils/sqlite-url.js';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: urlSQLiteAbsoluta(process.env.DATABASE_URL ?? 'file:./wineway.db') },
});
