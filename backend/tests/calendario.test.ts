import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { crearApp } from '../src/app.js';
import type { DB } from '../src/prisma.js';
import { crearAlmacenCalendarios } from '../src/utils/calendarios-temporales.js';

const token = 'a'.repeat(64);
const db = {
  sesion: { findUnique: async () => ({ usuarioId: 'usuario-1', venceEn: new Date('2099-01-01') }) },
} as unknown as DB;
const contenido = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:visita@wineway\r\nDTSTAMP:20261029T120000Z\r\nDTSTART:20300107T123000Z\r\nDTEND:20300107T133000Z\r\nSUMMARY:Visita\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';

test('crea un enlace sin exponer el token de sesión y sirve ICS inline sin autenticación del navegador', async () => {
  const app = crearApp(db);
  await request(app).post('/api/calendarios').send({ contenido }).expect(401);
  const creado = await request(app).post('/api/calendarios')
    .set('Authorization', `Bearer ${token}`).send({ contenido }).expect(201);
  assert.match(creado.body.path, /^\/calendarios\/[a-f0-9]{64}\.ics$/);
  assert.ok(!creado.body.path.includes(token));
  const res = await request(app).get(`/api${creado.body.path}`).expect(200);
  assert.match(res.headers['content-type'], /^text\/calendar; charset=utf-8/);
  assert.match(res.headers['content-disposition'], /^inline;/);
  assert.match(res.headers['cache-control'], /no-store/);
  assert.equal(res.text, contenido);
  await request(app).get(`/api${creado.body.path}`).expect(200); // iOS puede leerlo varias veces.
  await request(crearApp(db)).get(`/api${creado.body.path}`).expect(404); // No se persiste.
  await request(app).get(`/api/calendarios/${'b'.repeat(64)}.ics`).expect(404);
});

test('rechaza contenido inválido o excesivo antes de crear un enlace', async () => {
  const app = crearApp(db);
  const excesivo = contenido.replace('SUMMARY:Visita', `SUMMARY:${'x'.repeat(90_001)}`);
  for (const datos of [{ contenido: 'texto' }, { contenido: '' }, {}, { contenido: contenido + 'x' }, { contenido: excesivo }, { contenido, extra: true }]) {
    await request(app).post('/api/calendarios').set('Authorization', `Bearer ${token}`).send(datos).expect(400);
  }
});

test('los enlaces vencen a los diez minutos y el almacenamiento tiene un límite por usuario', () => {
  let ahora = 0;
  const almacen = crearAlmacenCalendarios(() => ahora);
  const primero = almacen.guardar('u1', contenido);
  assert.equal(almacen.obtener(primero), contenido);
  ahora = 10 * 60_000;
  assert.equal(almacen.obtener(primero), null);
  const anterior = almacen.guardar('u1', contenido);
  for (let i = 0; i < 3; i++) almacen.guardar('u1', contenido);
  assert.equal(almacen.obtener(anterior), null);
});
