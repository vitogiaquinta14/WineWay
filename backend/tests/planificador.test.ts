import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generarItinerario, type BodegaPlan } from '../src/utils/planificador.js';

const bodegas: BodegaPlan[] = [
  { id: 'a', nombre: 'A', zona: 'Uco', tipo: 'Familiar', caracteristicas: [], latitud: -33, longitud: -69, rating: 4,
    experiencias: [{ id: 'a1', nombre: 'A1', precioCentavos: 1000, duracionMin: 60, tipo: 'Degustación', horarios: [{ dia: 1, tipo: 'FLEXIBLE', desde: 540, hasta: 720 }] }] },
  { id: 'b', nombre: 'B', zona: 'Uco', tipo: 'Familiar', caracteristicas: [], latitud: -33.01, longitud: -69, rating: 4,
    experiencias: [{ id: 'b1', nombre: 'B1', precioCentavos: 1000, duracionMin: 60, tipo: 'Degustación', horarios: [{ dia: 1, tipo: 'FIJO', desde: 660, hasta: 720 }] }] },
  { id: 'c', nombre: 'C', zona: 'Uco', tipo: 'Familiar', caracteristicas: [], latitud: -34, longitud: -69, rating: 3,
    experiencias: [{ id: 'c1', nombre: 'C1', precioCentavos: 1000, duracionMin: 60, tipo: 'Degustación', horarios: [{ dia: 1, tipo: 'FIJO', desde: 600, hasta: 660 }] }] },
];

test('respeta presupuesto por persona, horarios, traslados y cantidad de visitas', async () => {
  const plan = await generarItinerario(bodegas, { fechaInicio: '2030-01-07', cantidadDias: 1, cantidadPersonas: 3, presupuestoPersonaCentavos: 2000, cantidadVisitas: 3, desdeMin: 540 });
  assert.equal(plan.visitas.length, 2);
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['a1', 'b1']);
  assert.equal(plan.costoPersonaCentavos, 2000);
  assert.ok(plan.visitas[1].trasladoMin! > 0);
  assert.equal(plan.visitas[1].inicio, '2030-01-07T14:00:00.000Z');
});

test('no recomienda una experiencia sin cupo temporal ni presupuesto', async () => {
  const plan = await generarItinerario(bodegas, { fechaInicio: '2030-01-07', cantidadDias: 1, cantidadPersonas: 1, presupuestoPersonaCentavos: 999, cantidadVisitas: 2 });
  assert.deepEqual(plan.visitas, []);
});
