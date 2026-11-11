import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Studio 7 reconoce file://; la URL absoluta apunta a la misma SQLite. */
export function urlSQLiteAbsoluta(url: string): string {
  if (!url.startsWith('file:') || url.startsWith('file://')) return url;
  const absoluta = resolve(url.slice(5));
  // En Windows el motor de Prisma no abre file:///C:/...; acepta file:C:/...
  return process.platform === 'win32' ? `file:${absoluta.replaceAll('\\', '/')}` : pathToFileURL(absoluta).href;
}
