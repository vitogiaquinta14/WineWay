import assert from 'node:assert/strict';
import { test } from 'node:test';

const modulo = () => import(new URL('../../src/utils/agregar-a-ruta.ts', import.meta.url).href);
// 2030-01-07 es lunes (dia 1); 2030-01-09 es miércoles (dia 3).
const ruta = { fechaInicio: '2030-01-07', cantidadDias: 3, visitas: [] as { experienciaId: string; inicio: string; duracionMin: number }[] };
const flexible = { id: 'e1', duracionMin: 60, horarios: [{ dia: 1, tipo: 'FLEXIBLE', desde: 600, hasta: 750 }] };

test('la ruta ofrece todos sus días y sólo habilita los que abre la experiencia', async () => {
  const { diasParaAgregar } = await modulo();
  assert.deepEqual(diasParaAgregar(ruta, flexible), [
    { fecha: '2030-01-07', abierto: true },
    { fecha: '2030-01-08', abierto: false },
    { fecha: '2030-01-09', abierto: false },
  ]);
});

test('un horario flexible se ofrece cada 30 minutos sin pasarse del cierre', async () => {
  const { horariosParaAgregar } = await modulo();
  assert.deepEqual(horariosParaAgregar(ruta, flexible, '2030-01-07').map((h: { hora: string }) => h.hora),
    ['10:00', '10:30', '11:00', '11:30']);
});

test('un horario fijo ofrece sólo su hora de inicio, ordenado y sin repetidos', async () => {
  const { horariosParaAgregar } = await modulo();
  const fija = { id: 'e2', duracionMin: 90, horarios: [
    { dia: 3, tipo: 'FIJO', desde: 900, hasta: 990 }, { dia: 3, tipo: 'FIJO', desde: 660, hasta: 750 },
    { dia: 3, tipo: 'FIJO', desde: 660, hasta: 750 }, { dia: 1, tipo: 'FIJO', desde: 600, hasta: 690 }] };
  assert.deepEqual(horariosParaAgregar(ruta, fija, '2030-01-09'), [
    { hora: '11:00', inicio: '2030-01-09T14:00:00.000Z', libre: true },
    { hora: '15:00', inicio: '2030-01-09T18:00:00.000Z', libre: true },
  ]);
});

test('los horarios que se superponen con otra visita quedan bloqueados', async () => {
  const { horariosParaAgregar } = await modulo();
  // Visita de 11:00 a 12:00 (hora de Mendoza) el lunes.
  const ocupada = { ...ruta, visitas: [{ experienciaId: 'otra', inicio: '2030-01-07T14:00:00.000Z', duracionMin: 60 }] };
  assert.deepEqual(horariosParaAgregar(ocupada, flexible, '2030-01-07').map((h: { hora: string; libre: boolean }) => [h.hora, h.libre]),
    [['10:00', true], ['10:30', false], ['11:00', false], ['11:30', false]]);
});

test('avisa si la experiencia ya está en la ruta', async () => {
  const { visitaExistente } = await modulo();
  const conVisita = { ...ruta, visitas: [{ experienciaId: 'e1', inicio: '2030-01-07T13:00:00.000Z', duracionMin: 60 }] };
  assert.equal(visitaExistente(ruta, 'e1'), undefined);
  assert.equal(visitaExistente(conVisita, 'e1')?.inicio, '2030-01-07T13:00:00.000Z');
});
