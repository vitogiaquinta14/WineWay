import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { urlSQLiteAbsoluta } from '../src/utils/sqlite-url.js';
test('Studio recibe file:// absoluto sin cambiar el archivo ni URLs existentes', () => {
  assert.equal(urlSQLiteAbsoluta('file:./wineway.db'), pathToFileURL(resolve('wineway.db')).href);
  assert.equal(urlSQLiteAbsoluta('file:./base con espacios.db'), pathToFileURL(resolve('base con espacios.db')).href);
  assert.equal(urlSQLiteAbsoluta('file:///tmp/wineway.db'), 'file:///tmp/wineway.db');
});
