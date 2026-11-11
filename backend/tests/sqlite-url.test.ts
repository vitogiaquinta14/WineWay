import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { urlSQLiteAbsoluta } from '../src/utils/sqlite-url.js';
const esperada = (ruta: string) =>
  process.platform === 'win32' ? `file:${resolve(ruta).replaceAll('\\', '/')}` : pathToFileURL(resolve(ruta)).href;
test('Studio recibe URL absoluta sin cambiar el archivo ni URLs existentes', () => {
  assert.equal(urlSQLiteAbsoluta('file:./wineway.db'), esperada('wineway.db'));
  assert.equal(urlSQLiteAbsoluta('file:./base con espacios.db'), esperada('base con espacios.db'));
  assert.equal(urlSQLiteAbsoluta('file:///tmp/wineway.db'), 'file:///tmp/wineway.db');
});
