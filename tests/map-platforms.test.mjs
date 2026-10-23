import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const componentPath = 'src/components/explorar';
const nativePath = `${componentPath}/bodegas-map.native.tsx`;
const webPath = `${componentPath}/bodegas-map.web.tsx`;

 test('el mapa separa dependencias web y nativas', () => {
  assert.equal(existsSync(`${componentPath}/bodegas-map.ts`), false);

  const native = readFileSync(nativePath, 'utf8');
  const web = readFileSync(webPath, 'utf8');

  assert.match(native, /react-native-maps/);
  assert.doesNotMatch(native, /leaflet|\bdocument\b/i);
  assert.match(web, /leaflet/);
  assert.doesNotMatch(web, /react-native-maps/);
});
