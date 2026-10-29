import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generarItinerario, type BodegaPlan } from '../src/utils/planificador.js';

const parametros = { fechaInicio: '2030-01-07', cantidadDias: 1, cantidadPersonas: 2,
  presupuestoPersonaCentavos: 10000, cantidadVisitas: 2, favoritas: [] as string[],
  imprescindibles: [] as string[], desdeMin: 600, hastaMin: 1080 };
function bodega(id: string, latitud = -33, precio = 1000): BodegaPlan {
  return { id, nombre: id, zona: 'Zona', tipo: 'Familiar', caracteristicas: [], rating: null,
    latitud, longitud: -69, experiencias: [{ id: `${id}-e`, nombre: id, precioCentavos: precio,
      duracionMin: 60, tipo: 'Visita', gastronomia: false,
      horarios: [1, 2].map((dia) => ({ dia, tipo: 'FLEXIBLE', desde: 600, hasta: 1080 })) }] };
}

test('A2: prioriza favoritas sobre cantidad y las imprescindibles sobre otras favoritas', async () => {
  const catalogo = [bodega('a', -33, 1000), bodega('b', -33, 1000), bodega('favorita', -33, 3000)];
  const p = { ...parametros, presupuestoPersonaCentavos: 3000, favoritas: ['favorita'] };
  assert.deepEqual((await generarItinerario(catalogo, p)).visitas.map((v) => v.experienciaId), ['favorita-e']);
  const plan = await generarItinerario(catalogo, { ...p, favoritas: ['a', 'favorita'], imprescindibles: ['favorita'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['favorita-e']);
  assert.equal(plan.cumpleImprescindibles, true);
});

test('A1/A5: franja, margen, almuerzo y horarios flexibles distribuidos sin superposición', async () => {
  const plan = await generarItinerario([bodega('a'), bodega('b')], parametros);
  assert.equal(plan.visitas.length, 2);
  assert.equal(plan.visitas[0].inicio, '2030-01-07T13:00:00.000Z'); // 10:00 Mendoza
  assert.equal(plan.visitas[1].inicio, '2030-01-07T20:00:00.000Z'); // 17:00 Mendoza
  assert.ok(new Date(plan.visitas[1].inicio).getTime() >= new Date(plan.visitas[0].inicio).getTime() + (60 + 30 + plan.visitas[1].trasladoMin!) * 60000);
  const cerrada = bodega('cerrada');
  cerrada.experiencias[0].horarios = [{ dia: 2, tipo: 'FIJO', desde: 600, hasta: 660 }];
  assert.equal((await generarItinerario([cerrada], parametros)).visitas.length, 0);
});

test('A3: agrupa bodegas cercanas por día y no conecta días distintos', async () => {
  const plan = await generarItinerario([bodega('a'), bodega('b', -33.001), bodega('c', -34), bodega('d', -34.001)],
    { ...parametros, cantidadDias: 2, cantidadVisitas: 4 });
  assert.equal(plan.visitas.length, 4);
  const dias = new Map<string, typeof plan.visitas>();
  for (const v of plan.visitas) {
    const fecha = v.inicio.slice(0, 10);
    dias.set(fecha, [...(dias.get(fecha) ?? []), v]);
  }
  assert.equal(dias.size, 2);
  for (const visitas of dias.values()) {
    assert.equal(visitas.length, 2);
    const ids = visitas.map((v) => v.experienciaId).sort().join(',');
    assert.ok(ids === 'a-e,b-e' || ids === 'c-e,d-e');
    assert.equal(visitas[0].trasladoMin, null);
  }
  assert.ok(plan.distanciaEstimadaKm < 1);
});

test('A4/A6: elige una experiencia accesible y explica imprescindible excluida por presupuesto', async () => {
  const a = bodega('a', -33, 5000);
  a.experiencias.push({ ...a.experiencias[0], id: 'economica', precioCentavos: 1000 });
  const plan = await generarItinerario([a, bodega('b', -33, 9000)], { ...parametros,
    presupuestoPersonaCentavos: 2000, favoritas: ['a', 'b'], imprescindibles: ['a', 'b'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['economica']);
  assert.equal(plan.cumpleImprescindibles, false);
  assert.ok(plan.noIncluidas.find((b) => b.bodegaId === 'b')?.motivos.includes('PRESUPUESTO'));
  assert.ok(plan.advertencias.some((a) => /presupuesto/i.test(a)));
});

test('A5: turnos fijos no se mueven y un almuerzo contratado puede ocupar la pausa', async () => {
  const a = bodega('a');
  a.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 780, hasta: 840 }];
  assert.equal((await generarItinerario([a], parametros)).visitas.length, 0);
  a.experiencias[0].gastronomia = true;
  a.experiencias[0].almuerzo = true;
  const plan = await generarItinerario([a], { ...parametros, cantidadAlmuerzos: 1 });
  assert.equal(plan.visitas[0].inicio, '2030-01-07T16:00:00.000Z');
});

test('A7: imprescindibles con turnos simultáneos no se superponen y se explica la exclusión', async () => {
  const catalogo = [bodega('a'), bodega('b')];
  for (const b of catalogo) b.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 600, hasta: 660 }];
  const plan = await generarItinerario(catalogo, { ...parametros, favoritas: ['a', 'b'], imprescindibles: ['a', 'b'] });
  assert.equal(plan.visitas.length, 1);
  assert.equal(plan.noIncluidas.length, 1);
  assert.ok(plan.noIncluidas[0].motivos.includes('AGENDA'));
  assert.equal(plan.cumpleImprescindibles, false);
});

test('A3: construye un recorrido factible y termina sin prometer el mínimo global', async () => {
  const catalogo = [bodega('a', -33), bodega('b', -33.005), bodega('c', -33.025), bodega('d', -33.03)];
  catalogo[1].longitud = -69.01;
  catalogo[2].longitud = -69.015;
  for (const b of catalogo) b.experiencias[0].gastronomia = true;
  const plan = await generarItinerario(catalogo, { ...parametros, cantidadVisitas: 4 });
  assert.equal(plan.visitas.length, 4);
  assert.equal(plan.metodo, 'VORAZ');
  for (let i = 1; i < plan.visitas.length; i++)
    assert.ok(Date.parse(plan.visitas[i].inicio) >= Date.parse(plan.visitas[i - 1].inicio) + (60 + 30 + plan.visitas[i].trasladoMin!) * 60000);
});

test('A5: reintenta una imprescindible cuando un almuerzo libera la pausa', async () => {
  const a = bodega('a');
  const b = bodega('b');
  a.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 750, hasta: 810 }];
  b.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 850, hasta: 910 }];
  b.experiencias[0].gastronomia = true;
  b.experiencias[0].almuerzo = true;
  const plan = await generarItinerario([a, b], { ...parametros, cantidadAlmuerzos: 1, imprescindibles: ['a', 'b'], favoritas: ['a', 'b'] });
  assert.equal(plan.visitas.length, 2);
  assert.equal(plan.cumpleImprescindibles, true);
});

test('las bodegas inactivas se excluyen aunque conserven experiencias', async () => {
  const a = { ...bodega('a'), activa: false };
  const plan = await generarItinerario([a], { ...parametros, favoritas: ['a'], imprescindibles: ['a'] });
  assert.equal(plan.visitas.length, 0);
  assert.ok(plan.noIncluidas[0].motivos.includes('INACTIVA'));
});
