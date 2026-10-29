import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const { outputText } = ts.transpileModule(readFileSync('src/utils/calendario.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { crearCalendario } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const ahora = new Date('2026-10-29T12:00:00Z');
const visita = {
  id: 'visita-1',
  inicio: '2026-11-05T10:00:00-03:00',
  duracionMin: 90,
  nombreExperiencia: 'Degustación',
  bodega: { nombre: 'Bodega Viñas', localidad: 'Luján de Cuyo' },
};
const ruta = {
  id: 'ruta-1', nombre: 'Mi ruta', descripcion: null, cantidadPersonas: 2,
  visitas: [visita, { ...visita, id: 'visita-2', inicio: '2026-11-06T12:30:00-03:00' }],
};
const desplegar = (ics) => ics.replace(/\r\n /g, '');

test('exporta todas las visitas con horas UTC y duración, sin depender de la zona del dispositivo', () => {
  const ics = desplegar(crearCalendario(ruta, ahora));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  assert.match(ics, /DTSTART:20261105T130000Z\r\nDTEND:20261105T143000Z/);
  assert.match(ics, /DTSTART:20261106T153000Z\r\nDTEND:20261106T170000Z/);
  assert.match(ics, /LOCATION:Bodega Viñas\\, Luján de Cuyo\\, Mendoza/);
  assert.match(ics, /No constituye una reserva\./);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal(ics.replaceAll('\r\n', '').includes('\n'), false);
});

test('escapa texto y pliega líneas UTF-8 sin permitir inyectar eventos', () => {
  const nombre = 'Viñas 🍷, ruta; \\ '.repeat(15) + '\r\nBEGIN:VEVENT';
  const ics = crearCalendario({ ...ruta, nombre }, ahora);
  for (const linea of ics.split('\r\n')) assert.ok(Buffer.byteLength(linea) <= 75);
  const texto = desplegar(ics);
  assert.equal((texto.match(/\r\nBEGIN:VEVENT/g) ?? []).length, 2);
  assert.ok(texto.includes('Viñas 🍷\\, ruta\\; \\\\ '));
  assert.ok(texto.includes('\\nBEGIN:VEVENT'));
  assert.equal(texto.includes('\ufffd'), false);
});

test('mantiene identificadores de visitas entre exportaciones', () => {
  const ids = (fecha) => crearCalendario(ruta, fecha).match(/^UID:.*$/gm);
  assert.deepEqual(ids(ahora), ids(new Date('2026-10-30T12:00:00Z')));
  assert.equal(new Set(ids(ahora)).size, 2);
});

test('rechaza rutas vacías y visitas sin fecha o duración válida', () => {
  assert.throws(() => crearCalendario({ ...ruta, visitas: [] }, ahora), /no tiene visitas/);
  for (const datos of [{ inicio: 'inválida' }, { duracionMin: 0 }, { duracionMin: -10 }]) {
    assert.throws(() => crearCalendario({ ...ruta, visitas: [{ ...visita, ...datos }] }, ahora), /inválida/);
  }
});
