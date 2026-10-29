import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generarItinerario, puntuacionBodega, type BodegaPlan } from '../src/utils/planificador.js';

const parametros = { fechaInicio: '2030-01-07', cantidadDias: 2, cantidadPersonas: 2,
  presupuestoPersonaCentavos: 10000, cantidadVisitas: 2, cantidadAlmuerzos: 0,
  favoritas: [] as string[], imprescindibles: [] as string[], desdeMin: 600, hastaMin: 1080 };
function bodega(id: string, rating: number | null, precio = 1000): BodegaPlan {
  return { id, nombre: id, zona: 'Zona', tipo: 'Familiar', caracteristicas: [], rating,
    latitud: -33, longitud: -69, experiencias: [{ id: `${id}-visita`, nombre: 'Visita', tipo: 'Visita',
      precioCentavos: precio, duracionMin: 60, gastronomia: false,
      horarios: [1, 2].map((dia) => ({ dia, tipo: 'FLEXIBLE', desde: 600, hasta: 1080 })) }] };
}

test('filtra fechas antes de seleccionar y prioriza favoritas sobre la puntuación', async () => {
  const cerrada = bodega('cerrada', 5);
  cerrada.experiencias[0].horarios = [{ dia: 7, tipo: 'FLEXIBLE', desde: 600, hasta: 1080 }];
  const plan = await generarItinerario([cerrada, bodega('comun', 5), bodega('favorita', 2)],
    { ...parametros, cantidadVisitas: 1, favoritas: ['favorita'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['favorita-visita']);
  assert.equal(plan.metodo, 'VORAZ');
});

test('completa de mayor a menor puntuación y pasa a la siguiente cuando no puede pagarla', async () => {
  const plan = await generarItinerario([bodega('barata', 3, 500), bodega('muy-cara', 5, 20000), bodega('mejor-accesible', 4.8, 3000)],
    { ...parametros, cantidadVisitas: 1 });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['mejor-accesible-visita']);
});

test('prueba una experiencia más económica de la misma bodega antes de descartarla', async () => {
  const favorita = bodega('favorita', 2, 20000);
  favorita.experiencias.push({ ...favorita.experiencias[0], id: 'economica', precioCentavos: 1000 });
  const plan = await generarItinerario([bodega('otra', 5), favorita], { ...parametros, cantidadVisitas: 1, favoritas: ['favorita'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['economica']);
});

test('inserta un turno temprano antes de una favorita que ya tiene turno fijo tarde', async () => {
  const tarde = bodega('tarde', 2);
  const temprano = bodega('temprano', 5);
  tarde.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 900, hasta: 960 }];
  temprano.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 600, hasta: 660 }];
  const plan = await generarItinerario([temprano, tarde], { ...parametros, cantidadDias: 1, favoritas: ['tarde'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['temprano-visita', 'tarde-visita']);
});

test('cero almuerzos excluye experiencias de almuerzo', async () => {
  const b = bodega('comida', 5);
  b.experiencias[0] = { ...b.experiencias[0], tipo: 'Almuerzo', almuerzo: true, gastronomia: true };
  const plan = await generarItinerario([b, bodega('visita', 4)], { ...parametros, cantidadVisitas: 1 });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['visita-visita']);
  assert.equal(plan.cantidadAlmuerzosIncluida, 0);
});

test('incluye los almuerzos deseados con máximo uno por día', async () => {
  const catalogo = ['a', 'b', 'c'].map((id) => {
    const b = bodega(id, 5);
    b.experiencias[0] = { ...b.experiencias[0], tipo: 'Almuerzo', almuerzo: true, gastronomia: true,
      horarios: [1, 2].map((dia) => ({ dia, tipo: 'FIJO', desde: 780, hasta: 840 })) };
    return b;
  });
  const plan = await generarItinerario(catalogo, { ...parametros, cantidadAlmuerzos: 2, cantidadVisitas: 3 });
  assert.equal(plan.cantidadAlmuerzosIncluida, 2);
  assert.equal(new Set(plan.visitas.map((v) => v.inicio.slice(0, 10))).size, 2);
});

test('puede cambiar la experiencia de una favorita a almuerzo manteniendo la misma bodega', async () => {
  const b = bodega('favorita', 2);
  b.experiencias.push({ ...b.experiencias[0], id: 'almuerzo', tipo: 'Almuerzo', almuerzo: true, gastronomia: true, precioCentavos: 5000 });
  const plan = await generarItinerario([b], { ...parametros, cantidadVisitas: 1, cantidadAlmuerzos: 1, favoritas: ['favorita'] });
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['almuerzo']);
  assert.equal(plan.cantidadAlmuerzosIncluida, 1);
});

test('informa la cantidad de almuerzos faltantes por presupuesto sin excederlo', async () => {
  const b = bodega('comida', 5, 20000);
  b.experiencias[0] = { ...b.experiencias[0], tipo: 'Almuerzo', almuerzo: true, gastronomia: true };
  const plan = await generarItinerario([b, bodega('visita', 4)], { ...parametros, cantidadAlmuerzos: 1 });
  assert.equal(plan.cantidadAlmuerzosIncluida, 0);
  assert.ok(plan.advertencias.some((a) => /almuerzos/i.test(a) && /presupuesto/i.test(a)));
  assert.ok(plan.costoPersonaCentavos <= parametros.presupuestoPersonaCentavos);
});

test('un tapeo no cuenta como almuerzo ni elimina la pausa para comer', async () => {
  const b = bodega('tapeo', 5);
  b.experiencias[0] = { ...b.experiencias[0], tipo: 'Tapeo', gastronomia: true,
    horarios: [{ dia: 1, tipo: 'FIJO', desde: 780, hasta: 840 }] };
  const plan = await generarItinerario([b, bodega('visita', 4)], { ...parametros, cantidadDias: 1, cantidadAlmuerzos: 1 });
  assert.equal(plan.cantidadAlmuerzosIncluida, 0);
  assert.deepEqual(plan.visitas.map((v) => v.experienciaId), ['visita-visita']);
});

test('entre las cinco más cercanas elige la mejor puntuada y excluye a la sexta aunque tenga más rating', async () => {
  const favorita = bodega('favorita', 2);
  const cercanas = [3, 3.5, 4, 4.9, 4.2, 5].map((rating, i) => ({
    ...bodega(`opcion-${i + 1}`, rating), latitud: -33 - (i + 1) * 0.001,
  }));
  const plan = await generarItinerario([favorita, ...cercanas], {
    ...parametros, cantidadDias: 1, favoritas: ['favorita'],
  });
  assert.deepEqual(new Set(plan.visitas.map((v) => v.experienciaId)), new Set(['favorita-visita', 'opcion-4-visita']));
});

test('también selecciona el almuerzo mejor puntuado entre los cinco más cercanos', async () => {
  const favorita = bodega('favorita', 2);
  const almuerzos = [3, 3.5, 4, 4.9, 4.2, 5].map((rating, i) => {
    const b = { ...bodega(`almuerzo-${i + 1}`, rating), latitud: -33 - (i + 1) * 0.001 };
    b.experiencias[0] = { ...b.experiencias[0], tipo: 'Almuerzo', almuerzo: true,
      horarios: [{ dia: 1, tipo: 'FIJO', desde: 780, hasta: 840 }] };
    return b;
  });
  const plan = await generarItinerario([favorita, ...almuerzos], {
    ...parametros, cantidadDias: 1, cantidadAlmuerzos: 1, favoritas: ['favorita'],
  });
  assert.ok(plan.visitas.some((v) => v.experienciaId === 'almuerzo-4-visita'));
  assert.ok(!plan.visitas.some((v) => v.experienciaId === 'almuerzo-6-visita'));
});

test('la cercanía se mide dentro del día y permite favoritas lejanas en días distintos', async () => {
  const a = bodega('favorita-a', 2);
  const b = { ...bodega('favorita-b', 2), latitud: -34 };
  const cercaA = { ...bodega('cerca-a', 4), latitud: -33.001 };
  const cercaB = { ...bodega('cerca-b', 5), latitud: -34.001 };
  const plan = await generarItinerario([a, b, cercaA, cercaB], {
    ...parametros, cantidadVisitas: 3, favoritas: ['favorita-a', 'favorita-b'],
  });
  assert.equal(plan.visitas.length, 3);
  assert.ok(plan.distanciaEstimadaKm < 1);
  const visitaB = plan.visitas.find((v) => v.experienciaId === 'favorita-b-visita')!;
  const cercanaB = plan.visitas.find((v) => v.experienciaId === 'cerca-b-visita')!;
  assert.equal(visitaB.inicio.slice(0, 10), cercanaB.inicio.slice(0, 10));
});

test('si hay candidatas a menos de 20 km, una más lejana no entra aunque tenga mejor puntuación', async () => {
  const favorita = bodega('favorita', 2);
  const opciones = [0.01, 0.02, 0.03, 0.04, 0.2, 0.3].map((distancia, i) => ({
    ...bodega(`opcion-${i + 1}`, i === 5 ? 5 : i === 4 ? 4.9 : 3), latitud: -33 - distancia,
  }));
  const plan = await generarItinerario([favorita, ...opciones], { ...parametros, cantidadDias: 1, favoritas: ['favorita'] });
  assert.ok(plan.visitas.some((v) => v.experienciaId === 'opcion-1-visita'));
  assert.ok(!plan.visitas.some((v) => /opcion-[56]/.test(v.experienciaId)));
});

test('sin candidatas a menos de 20 km gana la más cercana sobre la mejor puntuada', async () => {
  const favorita = bodega('favorita', 2);
  const cerca = { ...bodega('a-25-km', 3), latitud: -33.225 };
  const lejos = { ...bodega('a-40-km', 5), latitud: -33.36 };
  const plan = await generarItinerario([favorita, lejos, cerca], { ...parametros, cantidadDias: 1, favoritas: ['favorita'] });
  assert.deepEqual(new Set(plan.visitas.map((v) => v.experienciaId)), new Set(['favorita-visita', 'a-25-km-visita']));
});

test('completa la carga de un día con lugar antes de sumar una tercera visita a un día lleno', async () => {
  const catalogo = [bodega('a', 5), { ...bodega('b', 4.95), latitud: -33.01 }, { ...bodega('x', 4.94), latitud: -33.5 },
    { ...bodega('cerca-de-a', 4.9), latitud: -33.02 }, { ...bodega('cerca-de-x', 4), latitud: -33.55 }];
  const plan = await generarItinerario(catalogo, { ...parametros, cantidadVisitas: 4 });
  const porDia = new Map<string, number>();
  for (const v of plan.visitas) porDia.set(v.inicio.slice(0, 10), (porDia.get(v.inicio.slice(0, 10)) ?? 0) + 1);
  assert.deepEqual([...porDia.values()], [2, 2]);
  assert.ok(plan.visitas.some((v) => v.experienciaId === 'cerca-de-x-visita'));
});

test('el almuerzo empieza antes de las 15:00 aunque se distribuya el tiempo libre', async () => {
  const almuerzo = bodega('almuerzo', 4);
  almuerzo.experiencias[0] = { ...almuerzo.experiencias[0], tipo: 'Almuerzo', almuerzo: true, duracionMin: 150,
    horarios: [{ dia: 1, tipo: 'FLEXIBLE', desde: 720, hasta: 1080 }] };
  const plan = await generarItinerario([bodega('visita', 5), almuerzo],
    { ...parametros, cantidadDias: 1, cantidadAlmuerzos: 1 });
  const visita = plan.visitas.find((v) => v.experienciaId === 'almuerzo-visita')!;
  assert.ok(visita, 'Debe incluir el almuerzo.');
  assert.ok(visita.inicio < '2030-01-07T18:00:00.000Z', `Almuerzo a las ${visita.inicio}`); // 15:00 Mendoza
  almuerzo.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 900, hasta: 1050 }];
  const tarde = await generarItinerario([bodega('visita', 5), almuerzo], { ...parametros, cantidadDias: 1, cantidadAlmuerzos: 1 });
  assert.equal(tarde.cantidadAlmuerzosIncluida, 0);
});

test('usa el presupuesto sobrante para mejorar experiencias sin superarlo', async () => {
  const conPremium = (id: string, rating: number) => {
    const b = bodega(id, rating);
    b.experiencias.push({ ...b.experiencias[0], id: `${id}-premium`, precioCentavos: 5000, duracionMin: 90 });
    return b;
  };
  const sola = await generarItinerario([conPremium('a', 5)], { ...parametros, cantidadVisitas: 1 });
  assert.deepEqual(sola.visitas.map((v) => v.experienciaId), ['a-premium']);
  const dos = await generarItinerario([conPremium('a', 5), conPremium('b', 4)],
    { ...parametros, cantidadDias: 1, presupuestoPersonaCentavos: 7000 });
  assert.deepEqual(new Set(dos.visitas.map((v) => v.experienciaId)), new Set(['a-premium', 'b-visita']));
  assert.equal(dos.costoPersonaCentavos, 6000);
});

test('ubica primero la imprescindible con menos horarios posibles', async () => {
  const flexible = bodega('flexible', 5);
  flexible.experiencias[0].horarios = [1, 2].map((dia) => ({ dia, tipo: 'FIJO', desde: 600, hasta: 660 }));
  const unica = bodega('unica', 2);
  unica.experiencias[0].horarios = [{ dia: 1, tipo: 'FIJO', desde: 600, hasta: 660 }];
  const plan = await generarItinerario([flexible, unica], { ...parametros, imprescindibles: ['flexible', 'unica'] });
  assert.equal(plan.cumpleImprescindibles, true);
  assert.equal(plan.visitas.length, 2);
});

test('la puntuación combina reseñas WineWay con el rating de demostración', () => {
  assert.ok(puntuacionBodega(4, [5])! < puntuacionBodega(4.8, [])!);
  assert.equal(puntuacionBodega(4.8, []), 4.8);
  assert.equal(puntuacionBodega(null, [5, 4]), 4.5);
  assert.equal(puntuacionBodega(null, []), null);
  assert.ok(puntuacionBodega(4, Array(95).fill(5))! > 4.9);
});
