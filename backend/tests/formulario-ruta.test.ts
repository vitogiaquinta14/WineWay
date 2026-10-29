import assert from 'node:assert/strict';
import { test } from 'node:test';

const hoy = '2030-01-01';
const base = { fechaInicio: '2030-01-07', fechaFin: '2030-01-08', personas: '2', presupuesto: '200000',
  cantidadVisitas: '3', cantidadAlmuerzos: '0', automatico: true };

test('el formulario permite cero almuerzos y como máximo uno por día', async () => {
  const { validarFormularioRuta } = await import(new URL('../../src/utils/formulario-ruta.ts', import.meta.url).href);
  assert.deepEqual(validarFormularioRuta(base, hoy), {});
  assert.deepEqual(validarFormularioRuta({ ...base, cantidadAlmuerzos: '2' }, hoy), {});
  assert.ok(validarFormularioRuta({ ...base, cantidadAlmuerzos: '3' }, hoy).cantidadAlmuerzos);
});
test('el formulario exige un entero de almuerzos y que estén incluidos en las visitas', async () => {
  const { validarFormularioRuta } = await import(new URL('../../src/utils/formulario-ruta.ts', import.meta.url).href);
  for (const cantidadAlmuerzos of ['', '-1', '1.5', 'hola'])
    assert.ok(validarFormularioRuta({ ...base, cantidadAlmuerzos }, hoy).cantidadAlmuerzos);
  assert.ok(validarFormularioRuta({ ...base, cantidadVisitas: '1', cantidadAlmuerzos: '2' }, hoy).cantidadAlmuerzos);
});
test('al mover el comienzo del día, el fin queda siempre después', async () => {
  const { ajustarFin } = await import(new URL('../../src/utils/formulario-ruta.ts', import.meta.url).href);
  assert.equal(ajustarFin('10:00', '18:00'), '18:00');
  assert.equal(ajustarFin('18:00', '18:00'), '19:00');
  assert.equal(ajustarFin('19:30', '18:00'), '20:30');
  assert.equal(ajustarFin('23:30', '18:00'), '23:59');
});
