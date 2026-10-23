import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { crearPrisma } from '../src/prisma.js';
import { crearApp } from '../src/app.js';
import { seed } from '../prisma/seed.js';

let directorio: string;
let db: ReturnType<typeof crearPrisma>;
let app: ReturnType<typeof crearApp>;
let token: string;
let otroToken: string;
let usuarioId: string;
const registro = {
  nombre: 'Valentina',
  apellido: 'Prueba',
  email: 'VAL@EXAMPLE.COM',
  username: 'VinoFan',
  password: 'VinoSeguro1!',
  fechaNacimiento: '2000-01-01',
};
const visita = { experienciaId: 'catena-clasica', inicio: '2030-01-07T12:00:00Z' };
const rutaBody = {
  nombre: 'Mi ruta',
  fechaInicio: '2030-01-07',
  cantidadDias: 1,
  cantidadPersonas: 3,
  presupuestoPersonaCentavos: 20000000,
  parametros: { preferencias: ['Paisajes'] },
  visitas: [visita],
};
const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
  directorio = await mkdtemp(join(tmpdir(), 'wineway-test-'));
  const url = `file:${join(directorio, 'test.db')}`;
  execFileSync('node', ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
  db = crearPrisma(url);
  await seed(db);
  app = crearApp(db);
});
after(async () => {
  await db?.$disconnect();
  if (directorio) await rm(directorio, { recursive: true, force: true });
});

test('health no depende de tener conexión a la BD', async () => {
  const sinBD = crearApp({} as typeof db);
  await request(sinBD).get('/api/health').expect(200);
});
test('seed idempotente y catálogo/rating vienen de SQLite', async () => {
  const antes = await db.bodega.count();
  await seed(db);
  assert.equal(await db.bodega.count(), antes);
  const res = await request(app).get('/api/bodegas').expect(200);
  assert.ok(res.body.items.length >= 6);
  const b = res.body.items.find((b: { id: string }) => b.id === 'catena-zapata');
  assert.equal(b.ratingFuente, 'DEMOSTRACION');
  assert.equal(b.ratingWineWay, null);
  await db.bodega.update({ where: { id: b.id }, data: { ratingDemostracion: 3.7 } });
  assert.equal((await request(app).get(`/api/bodegas/${b.id}`)).body.rating, 3.7);
});
test('catálogo filtra y pagina; datos inválidos devuelven 400', async () => {
  const r = await request(app).get('/api/bodegas?zona=Valle%20de%20Uco&limite=1').expect(200);
  assert.equal(r.body.items.length, 1);
  assert.ok(r.body.total > 1);
  await request(app).get('/api/bodegas?limite=-1').expect(400);
  await request(app).get('/api/bodegas?lat=hola&lng=0').expect(400);
});
test('filtros incompatibles y distancia sin coordenadas se rechazan', async () => {
  await request(app).get('/api/bodegas?precioMin=100&precioMax=50').expect(400);
  await request(app).get('/api/bodegas?distanciaMaxKm=10').expect(400);
});
test('código textual exacto y desconocido inequívoco', async () => {
  const vino = await db.vino.findFirstOrThrow();
  assert.equal(
    (await request(app).get(`/api/vinos/codigo/${vino.codigoBarras}`).expect(200)).body.id,
    vino.id,
  );
  await request(app).get('/api/vinos/codigo/0000000000000').expect(404);
});
test('registro exige mayoría, contraseña segura y fechas reales', async () => {
  for (const cambio of [
    { fechaNacimiento: '2020-01-01' },
    { fechaNacimiento: '2000-02-30' },
    { password: 'insegura' },
    { username: ' ' },
    { nombre: '' },
  ]) {
    await request(app)
      .post('/api/auth/registro')
      .send({ ...registro, ...cambio })
      .expect(400);
  }
});
test('registro normaliza, guarda hash y no devuelve secretos', async () => {
  const r = await request(app).post('/api/auth/registro').send(registro).expect(201);
  token = r.body.token;
  usuarioId = r.body.usuario.id;
  assert.equal(r.body.usuario.username, 'vinofan');
  assert.equal(r.body.usuario.passwordHash, undefined);
  const u = await db.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  assert.notEqual(u.passwordHash, registro.password);
  assert.notEqual((await db.sesion.findFirstOrThrow()).tokenHash, token);
  await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'otra@example.com', username: 'vinofan' })
    .expect(409);
});
test('perfil solo actualiza campos válidos y conserva unicidad/normalización', async () => {
  const perfil = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'perfil@example.com', username: 'perfil' })
    .expect(201);
  const autorizado = () => ({ Authorization: `Bearer ${perfil.body.token}` });
  const inicial = await request(app).get('/api/yo').set(autorizado()).expect(200);
  assert.equal(inicial.body.email, 'perfil@example.com');
  await request(app).patch('/api/yo').set(autorizado()).send({ email: 'no-es-mail' }).expect(400);
  await request(app)
    .patch('/api/yo')
    .set(autorizado())
    .send({ fechaNacimiento: '1990-01-01' })
    .expect(400);
  const otro = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'perfil-otro@example.com', username: 'perfil-otro' })
    .expect(201);
  await request(app).patch('/api/yo').set(autorizado()).send({ username: 'perfil-otro' }).expect(409);
  await request(app)
    .patch('/api/yo')
    .set(autorizado())
    .send({ email: ' NUEVO@EXAMPLE.COM ', username: 'NuevoUser', apodo: 'Vino' })
    .expect(200)
    .expect(({ body }) => {
      assert.equal(body.email, 'nuevo@example.com');
      assert.equal(body.username, 'nuevouser');
      assert.equal(body.apodo, 'Vino');
    });
  await request(app)
    .patch('/api/yo')
    .set(autorizado())
    .send({ email: 'perfil@example.com', username: 'perfil', apodo: null })
    .expect(200);
  await request(app).delete('/api/yo').set(autorizado()).expect(204);
  await request(app)
    .delete('/api/yo')
    .set({ Authorization: `Bearer ${otro.body.token}` })
    .expect(204);
});
test('login verifica contraseña; datos privados requieren sesión', async () => {
  await request(app).get('/api/cava').expect(401);
  await request(app)
    .post('/api/auth/login')
    .send({ identificador: registro.email, password: 'incorrecta' })
    .expect(401);
  await request(app)
    .post('/api/auth/login')
    .send({ identificador: registro.email, password: registro.password })
    .expect(200);
  const r = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'otro@example.com', username: 'otro' })
    .expect(201);
  otroToken = r.body.token;
});
test('login acepta email o username sin distinguir mayúsculas', async () => {
  const cuenta = await request(app)
    .post('/api/auth/registro')
    .send({ ...registro, email: 'login-doble@example.com', username: 'loginDoble' })
    .expect(201);
  for (const identificador of ['LOGIN-DOBLE@EXAMPLE.COM', 'LoginDoble']) {
    const r = await request(app)
      .post('/api/auth/login')
      .send({ identificador, password: registro.password })
      .expect(200);
    assert.equal(r.body.usuario.id, cuenta.body.usuario.id);
  }
  await request(app)
    .post('/api/auth/logout')
    .set({ Authorization: `Bearer ${cuenta.body.token}` })
    .expect(204);
  await db.usuario.delete({ where: { id: cuenta.body.usuario.id } });
});
test('cava permite repetidos y atributos vacíos; XOR y propiedad también en SQLite', async () => {
  const vino = await db.vino.findFirstOrThrow();
  for (let i = 0; i < 2; i++)
    await request(app)
      .post('/api/cava')
      .set(auth())
      .send({ vinoId: vino.id, anada: 2021 })
      .expect(201);
  const cava = (await request(app).get('/api/cava').set(auth()).expect(200)).body;
  assert.equal(cava.length, 2);
  assert.equal(cava[0].valoracion, null);
  await request(app).post('/api/cava').set(auth()).send({}).expect(400);
  await assert.rejects(db.vinoEnCava.create({ data: { usuarioId } }));
  const manual = await db.vinoFueraDeCatalogo.create({ data: { usuarioId, nombre: 'Privado' } });
  await assert.rejects(
    db.vinoEnCava.create({ data: { usuarioId, vinoId: vino.id, vinoManualId: manual.id } }),
  );
  const otro = await db.usuario.findUniqueOrThrow({ where: { username: 'otro' } });
  await assert.rejects(
    db.vinoEnCava.create({ data: { usuarioId: otro.id, vinoManualId: manual.id } }),
  );
});
test('carga manual atómica y privada; editar/deletar cava respeta propietario', async () => {
  const antes = await db.vinoFueraDeCatalogo.count();
  await request(app)
    .post('/api/cava/manual')
    .set(auth())
    .send({ nombre: 'Privado', valoracion: 7 })
    .expect(400);
  assert.equal(await db.vinoFueraDeCatalogo.count(), antes);
  const r = await request(app)
    .post('/api/cava/manual')
    .set(auth())
    .send({ nombre: 'Mi vino', bodegaNombre: 'Sin catálogo', nota: 'Personal' })
    .expect(201);
  await request(app)
    .patch(`/api/cava/${r.body.id}`)
    .set({ Authorization: `Bearer ${otroToken}` })
    .send({ nota: 'ajena' })
    .expect(404);
  await request(app)
    .post('/api/cava')
    .set({ Authorization: `Bearer ${otroToken}` })
    .send({ vinoManualId: r.body.vinoManualId })
    .expect(404);
  await request(app)
    .patch(`/api/vinos-manuales/${r.body.vinoManualId}`)
    .set(auth())
    .send({ nombre: 'Corregido' })
    .expect(200);
  await request(app).delete(`/api/cava/${r.body.id}`).set(auth()).expect(204);
});
test('favorito idempotente y reseña única editable, promedio propio separado', async () => {
  for (let i = 0; i < 2; i++)
    await request(app).put('/api/favoritos/catena-zapata').set(auth()).expect(200);
  assert.equal((await request(app).get('/api/favoritos').set(auth())).body.length, 1);
  await request(app)
    .put('/api/bodegas/catena-zapata/mi-resena')
    .set(auth())
    .send({ valoracion: 5 })
    .expect(200);
  await request(app)
    .put('/api/bodegas/catena-zapata/mi-resena')
    .set(auth())
    .send({ valoracion: 4, comentario: 'Cambio' })
    .expect(200);
  const b = (await request(app).get('/api/bodegas/catena-zapata')).body;
  assert.equal(b.rating, 3.7);
  assert.equal(b.ratingWineWay, 4);
  assert.equal(b.cantidadResenas, 1);
});
test('rutas se crean completas, rechazan horarios, solapamientos y quedan atómicas', async () => {
  for (const visitas of [
    [],
    [{ ...visita, inicio: '2030-01-07T12:01:00Z' }],
    [visita, visita],
    [{ ...visita, inicio: '2030-01-08T12:00:00Z' }],
  ]) {
    await request(app)
      .post('/api/rutas')
      .set(auth())
      .send({ ...rutaBody, visitas })
      .expect(400);
  }
  assert.equal(await db.ruta.count(), 0);
  const r = await request(app).post('/api/rutas').set(auth()).send(rutaBody).expect(201);
  assert.equal(r.body.cantidadPersonas, 3);
  assert.equal(r.body.visitas.length, 1);
  await request(app)
    .get(`/api/rutas/${r.body.id}`)
    .set({ Authorization: `Bearer ${otroToken}` })
    .expect(404);
  await request(app)
    .patch(`/api/rutas/${r.body.id}`)
    .set(auth())
    .send({ fechaInicio: '2030-01-08' })
    .expect(400);
  await request(app)
    .delete(`/api/rutas/${r.body.id}/visitas/${r.body.visitas[0].id}`)
    .set(auth())
    .expect(409);
  assert.equal(await db.visita.count(), 1);
});
test('visitas se agregan, reprograman y eliminan sin dejar rutas vacías', async () => {
  const ruta = await db.ruta.findFirstOrThrow();
  let r = await request(app)
    .post(`/api/rutas/${ruta.id}/visitas`)
    .set(auth())
    .send({ ...visita, inicio: '2030-01-07T15:00:00Z' })
    .expect(201);
  assert.equal(r.body.visitas.length, 2);
  const nueva = r.body.visitas.find(
    (v: { inicio: string }) => v.inicio === '2030-01-07T15:00:00.000Z',
  );
  await request(app)
    .patch(`/api/rutas/${ruta.id}/visitas/${nueva.id}`)
    .set(auth())
    .send({ inicio: visita.inicio })
    .expect(400);
  r = await request(app)
    .patch(`/api/rutas/${ruta.id}/visitas/${nueva.id}`)
    .set(auth())
    .send({ inicio: '2030-01-07T19:00:00Z' })
    .expect(200);
  assert.equal(r.body.visitas[1].inicio, '2030-01-07T19:00:00.000Z');
  await request(app).delete(`/api/rutas/${ruta.id}/visitas/${nueva.id}`).set(auth()).expect(204);
});
test('flexible solo fines de semana y con duración completa; histórico derivado', async () => {
  const base = {
    ...rutaBody,
    fechaInicio: '2030-01-12',
    visitas: [{ experienciaId: 'andeluna-almuerzo', inicio: '2030-01-12T22:00:00Z' }],
  };
  const r = await request(app).post('/api/rutas').set(auth()).send(base).expect(201);
  await request(app)
    .post('/api/rutas')
    .set(auth())
    .send({ ...base, visitas: [{ ...base.visitas[0], inicio: '2030-01-12T22:01:00Z' }] })
    .expect(400);
  await request(app).delete(`/api/rutas/${r.body.id}`).set(auth()).expect(204);
  const historica = await request(app)
    .post('/api/rutas')
    .set(auth())
    .send({
      ...rutaBody,
      fechaInicio: '2020-01-06',
      visitas: [{ ...visita, inicio: '2020-01-06T12:00:00Z' }],
    })
    .expect(201);
  assert.equal(historica.body.estado, 'HISTORICA');
  await request(app).delete(`/api/rutas/${historica.body.id}`).set(auth()).expect(204);
});
test('precios actuales, duración conservada e inactividad no destruyen rutas', async () => {
  const ruta = await db.ruta.findFirstOrThrow({ include: { visitas: true } });
  const duracion = ruta.visitas[0].duracionMin;
  await db.experiencia.update({
    where: { id: visita.experienciaId },
    data: { precioCentavos: 1200000, duracionMin: 180, activa: false },
  });
  const r = await request(app).get(`/api/rutas/${ruta.id}`).set(auth()).expect(200);
  assert.equal(r.body.costoGrupoCentavos, 3600000);
  assert.equal(r.body.visitas[0].duracionMin, duracion);
  assert.equal(r.body.visitas[0].advertenciaInactiva, true);
  await request(app)
    .patch(`/api/rutas/${ruta.id}`)
    .set(auth())
    .send({ nombre: 'Renombrada' })
    .expect(200);
  await request(app).post('/api/rutas').set(auth()).send(rutaBody).expect(400);
  await request(app).delete(`/api/rutas/${ruta.id}`).set(auth()).expect(204);
});
test('sesiones vencidas o revocadas no autorizan', async () => {
  const r = await request(app)
    .post('/api/auth/login')
    .send({ identificador: registro.email, password: registro.password })
    .expect(200);
  await request(app)
    .post('/api/auth/logout')
    .set({ Authorization: `Bearer ${r.body.token}` })
    .expect(204);
  await request(app)
    .get('/api/yo')
    .set({ Authorization: `Bearer ${r.body.token}` })
    .expect(401);
  await db.sesion.updateMany({ where: { usuarioId }, data: { venceEn: new Date(0) } });
  await request(app).get('/api/yo').set(auth()).expect(401);
  token = (
    await request(app)
      .post('/api/auth/login')
      .send({ identificador: registro.email, password: registro.password })
  ).body.token;
});
test('borrar cuenta elimina datos privados/reseñas, conserva catálogo', async () => {
  const catalogo = await db.bodega.count();
  await request(app).delete('/api/yo').set(auth()).expect(204);
  const where = { usuarioId };
  const cantidades = await Promise.all([
    db.sesion.count({ where }),
    db.vinoEnCava.count({ where }),
    db.vinoFueraDeCatalogo.count({ where }),
    db.bodegaFavorita.count({ where }),
    db.resenaBodega.count({ where }),
    db.ruta.count({ where }),
  ]);
  assert.ok(cantidades.every((cantidad) => cantidad === 0));
  assert.equal(await db.bodega.count(), catalogo);
  assert.equal((await request(app).get('/api/bodegas/catena-zapata')).body.ratingWineWay, null);
});
