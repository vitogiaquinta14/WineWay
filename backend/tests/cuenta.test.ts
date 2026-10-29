import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { crearPrisma } from '../src/prisma.js';
import { crearApp } from '../src/app.js';

let directorio: string;
let db: ReturnType<typeof crearPrisma>;
let app: ReturnType<typeof crearApp>;
const registro = {
  nombre: 'María José',
  apellido: 'O Connor',
  email: 'cuenta@example.com',
  username: 'cuenta',
  password: 'VinoSeguro1!',
  fechaNacimiento: '2000-01-01',
};
before(async () => {
  directorio = await mkdtemp(join(tmpdir(), 'wineway-cuenta-'));
  const url = `file:${join(directorio, 'test.db')}`;
  execFileSync('node', ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
  db = crearPrisma(url);
  app = crearApp(db);
});
after(async () => {
  await db?.$disconnect();
  if (directorio) await rm(directorio, { recursive: true, force: true });
});

test('registro devuelve todos los errores por campo y rechaza nombres con números', async () => {
  const r = await request(app)
    .post('/api/auth/registro')
    .send({
      ...registro,
      nombre: 'Ana2',
      apellido: 'Perez4-Smith',
      email: 'mal',
      username: 'con espacio',
      password: 'abc',
      fechaNacimiento: '2000-02-30',
    })
    .expect(400);
  for (const campo of ['nombre', 'apellido', 'email', 'username', 'password', 'fechaNacimiento']) {
    assert.ok(r.body.error.campos?.[campo], `Falta el error de ${campo}`);
  }
  assert.equal(await db.usuario.count(), 0);
  const vacio = await request(app).post('/api/auth/registro').send({}).expect(400);
  for (const campo of ['nombre', 'apellido', 'email', 'username', 'password', 'fechaNacimiento']) {
    assert.ok(vacio.body.error.campos?.[campo], `Falta el campo obligatorio ${campo}`);
  }
});

test('duplicados se asignan a email y username; disponibilidad normalizada y perfil propio', async () => {
  const cuenta = await request(app).post('/api/auth/registro').send(registro).expect(201);
  const auth = { Authorization: `Bearer ${cuenta.body.token}` };
  const repetido = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: ' CUENTA@EXAMPLE.COM ', username: 'CUENTA' })
    .expect(409);
  assert.ok(repetido.body.error.campos.email);
  assert.ok(repetido.body.error.campos.username);
  const disponibilidad = await request(app)
    .get('/api/auth/disponibilidad')
    .query({ email: 'CUENTA@EXAMPLE.COM', username: 'CUENTA' })
    .expect(200);
  assert.ok(disponibilidad.body.campos.email);
  assert.ok(disponibilidad.body.campos.username);
  const libre = await request(app)
    .get('/api/auth/disponibilidad')
    .query({ username: 'disponible' })
    .expect(200);
  assert.deepEqual(libre.body.campos, {});
  await request(app)
    .patch('/api/yo')
    .set(auth)
    .send({ email: registro.email, username: registro.username })
    .expect(200);
  const invalido = await request(app)
    .patch('/api/yo')
    .set(auth)
    .send({ nombre: 'Cambiado', apellido: 'Apellido7' })
    .expect(400);
  assert.ok(invalido.body.error.campos.apellido);
  assert.equal(
    (await db.usuario.findUniqueOrThrow({ where: { id: cuenta.body.usuario.id } })).nombre,
    registro.nombre,
  );
  const otra = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'otra@example.com', username: 'otra' })
    .expect(201);
  const conflicto = await request(app)
    .patch('/api/yo')
    .set(auth)
    .send({ email: otra.body.usuario.email, username: otra.body.usuario.username })
    .expect(409);
  assert.ok(conflicto.body.error.campos.email);
  assert.ok(conflicto.body.error.campos.username);
});
