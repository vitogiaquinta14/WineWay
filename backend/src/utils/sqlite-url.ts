import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Studio 7 reconoce file://; la URL absoluta apunta a la misma SQLite. */
export function urlSQLiteAbsoluta(url: string): string {
  return url.startsWith('file:') && !url.startsWith('file://')
    ? pathToFileURL(resolve(url.slice(5))).href
    : url;
}
