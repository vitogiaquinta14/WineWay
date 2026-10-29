import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  esMayorDeEdad,
  fechaCalendario,
  horarioAdmite,
  validarVisitas,
  totalesRuta,
} from '../src/utils/reglas.js';

test('mayoría de edad exacta y fechas reales', () => {
  assert.equal(esMayorDeEdad('2008-10-22', '2026-10-22'), true);
  assert.equal(esMayorDeEdad('2008-10-23', '2026-10-22'), false);
  assert.equal(fechaCalendario('2026-02-30'), false);
  assert.equal(fechaCalendario('2024-02-29'), true);
});
test('horario fijo y flexible consideran toda la duración', () => {
  assert.equal(horarioAdmite({ tipo: 'FIJO', desde: 540, hasta: 540 }, 540, 90), true);
  assert.equal(horarioAdmite({ tipo: 'FIJO', desde: 540, hasta: 540 }, 541, 90), false);
  assert.equal(horarioAdmite({ tipo: 'FLEXIBLE', desde: 600, hasta: 1320 }, 1230, 90), true);
  assert.equal(horarioAdmite({ tipo: 'FLEXIBLE', desde: 600, hasta: 1320 }, 1231, 90), false);
});
test('rutas requieren visitas y rechazan solapamientos; permiten contiguas', () => {
  assert.throws(() => validarVisitas([], '2030-01-07', 1));
  const a = { inicio: new Date('2030-01-07T12:00:00Z'), duracionMin: 90 };
  assert.throws(() =>
    validarVisitas([a, { ...a, inicio: new Date('2030-01-07T13:00:00Z') }], '2030-01-07', 1),
  );
  assert.doesNotThrow(() =>
    validarVisitas([a, { ...a, inicio: new Date('2030-01-07T13:30:00Z') }], '2030-01-07', 1),
  );
  assert.throws(() => validarVisitas([a], '2030-01-08', 1));
});
test('dinero en centavos y presupuesto por persona para todo el viaje', () => {
  assert.deepEqual(totalesRuta([1000000, 250050], 3, 2000000), {
    costoPersonaCentavos: 1250050,
    costoGrupoCentavos: 3750150,
    presupuestoGrupoCentavos: 6000000,
  });
});
