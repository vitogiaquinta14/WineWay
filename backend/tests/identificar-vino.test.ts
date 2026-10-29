import assert from 'node:assert/strict';
import { test } from 'node:test';

const modulo = () => import(new URL('../../src/data/vinos.ts', import.meta.url).href);
const vinoAPI = {
  id: 'blend',
  nombre: 'Blend',
  descripcion: 'Frutado y largo.',
  precioCentavos: 5500000,
  tipo: 'Tinto',
  perfil: 'Intenso',
  imagenUrl: null,
  bodega: { nombre: 'ANAIA Wines', zona: 'Valle de Uco', localidad: 'Tupungato' },
  cepas: [
    { cepa: { nombre: 'Malbec' }, porcentaje: 60 },
    { cepa: { nombre: 'Cabernet Franc' }, porcentaje: null },
  ],
};

test('el vino escaneado conserva descripción, tipo, perfil y localidad del catálogo, sin precio', async () => {
  const v = (await modulo()).identificarVino(vinoAPI);
  assert.equal(v.descripcion, 'Frutado y largo.');
  assert.equal(v.tipo, 'Tinto');
  assert.equal(v.perfil, 'Intenso');
  assert.equal(v.region, 'Tupungato, Valle de Uco');
  assert.equal('precioCentavos' in v, false);
});

test('las cepas muestran el porcentaje sólo cuando el catálogo lo tiene', async () => {
  assert.equal((await modulo()).identificarVino(vinoAPI).varietal, 'Malbec 60%, Cabernet Franc');
});
