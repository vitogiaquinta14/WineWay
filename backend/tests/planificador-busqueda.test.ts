import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { generarItinerario, type BodegaPlan, type ExperienciaPlan } from '../src/utils/planificador.js';

test('construye cuatro días y seis visitas con presupuesto suficiente y explica una cantidad parcial', async () => {
  const inicio = performance.now();
  const datos: {
    bodegas: (Omit<BodegaPlan, 'experiencias'> & { ratingDemostracion: number | null; experiencias: (ExperienciaPlan & { tipoId: string })[] })[];
    tiposExperiencia: { id: string; nombre: string; gastronomia: boolean }[];
  } = JSON.parse(readFileSync(new URL('../prisma/data/catalogo.json', import.meta.url), 'utf8'));
  const catalogo = datos.bodegas.map((b) => ({ ...b, rating: b.ratingDemostracion,
    experiencias: b.experiencias.map((e) => ({ ...e,
      tipo: datos.tiposExperiencia.find((t) => t.id === e.tipoId)!.nombre,
      gastronomia: datos.tiposExperiencia.find((t) => t.id === e.tipoId)!.gastronomia,
    })),
  }));
  const parametros = {
    fechaInicio: '2026-10-29', cantidadDias: 4, cantidadPersonas: 2,
    presupuestoPersonaCentavos: 40000000, cantidadVisitas: 6,
    favoritas: ['anaia'], imprescindibles: ['anaia', 'monteviejo'], desdeMin: 600, hastaMin: 1080,
  };
  const plan = await generarItinerario(catalogo, { ...parametros, presupuestoPersonaCentavos: 100000000 });
  assert.equal(plan.visitas.length, 6);
  assert.equal(plan.cumpleImprescindibles, true);
  assert.equal(plan.metodo, 'VORAZ');
  assert.ok(plan.costoPersonaCentavos <= 100000000);
  assert.ok(!plan.advertencias.some((a) => /límite de exploración/.test(a)));
  const limitada = await generarItinerario(catalogo, parametros);
  assert.ok(limitada.visitas.length <= 6);
  assert.equal(limitada.cumpleImprescindibles, true);
  assert.ok(limitada.costoPersonaCentavos <= parametros.presupuestoPersonaCentavos);
  if (limitada.visitas.length < 6) assert.ok(limitada.advertencias.some((a) => /presupuesto/i.test(a)));
  assert.ok(performance.now() - inicio < 2000, 'La construcción directa debe evitar las demoras de la búsqueda anterior.');
});
