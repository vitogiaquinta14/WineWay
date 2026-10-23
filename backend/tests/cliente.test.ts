import assert from 'node:assert/strict';
import { test } from 'node:test';
test('cliente HTTP agrega sesión y JSON, devuelve datos reales y respeta 204', async () => {
  const { crearCliente } = await import(
    new URL('../../src/services/api-core.ts', import.meta.url).href
  );
  const llamadas: { url: string; options: RequestInit }[] = [];
  const cliente = crearCliente({
    baseUrl: 'http://api.test/api',
    getToken: () => 'sesion',
    fetcher: async (url: string, options: RequestInit) => {
      llamadas.push({ url, options });
      return new Response(JSON.stringify({ nombre: 'Desde BD' }), { status: 200 });
    },
  });
  assert.deepEqual(await cliente('/bodegas'), { nombre: 'Desde BD' });
  assert.equal(
    llamadas[0].options.headers && new Headers(llamadas[0].options.headers).get('Authorization'),
    'Bearer sesion',
  );
  await cliente('/cava', { method: 'POST', body: { vinoId: 'vino' } });
  assert.equal(llamadas[1].options.body, JSON.stringify({ vinoId: 'vino' }));
  const vacio = crearCliente({
    baseUrl: 'http://api.test/api',
    getToken: () => null,
    fetcher: async () => new Response(null, { status: 204 }),
  });
  assert.equal(await vacio('/cava/id', { method: 'DELETE' }), undefined);
});
test('cliente propaga error e invalida sesión ante 401 protegido', async () => {
  const { crearCliente } = await import(
    new URL('../../src/services/api-core.ts', import.meta.url).href
  );
  let invalidaciones = 0;
  const cliente = crearCliente({
    baseUrl: 'http://api.test/api',
    getToken: () => 'sesion',
    onUnauthorized: () => invalidaciones++,
    fetcher: async () =>
      new Response(
        JSON.stringify({ error: { codigo: 'SESION_INVALIDA', mensaje: 'Sesión vencida' } }),
        { status: 401 },
      ),
  });
  await assert.rejects(cliente('/cava'), { message: 'Sesión vencida', codigo: 'SESION_INVALIDA' });
  assert.equal(invalidaciones, 1);
  await assert.rejects(cliente('/auth/login', { sinSesion: true }), { message: 'Sesión vencida' });
  assert.equal(invalidaciones, 1);
});
test('cliente conserva errores de campo para mostrarlos en la entrada correspondiente', async () => {
  const { crearCliente } = await import(
    new URL('../../src/services/api-core.ts', import.meta.url).href
  );
  const campos = { username: 'Este usuario ya existe.', email: 'Este email ya está registrado.' };
  const cliente = crearCliente({
    baseUrl: 'http://api.test/api',
    getToken: () => null,
    fetcher: async () =>
      new Response(
        JSON.stringify({ error: { codigo: 'DUPLICADO', mensaje: 'Revisá los campos.', campos } }),
        { status: 409 },
      ),
  });
  await assert.rejects(cliente('/auth/registro', { method: 'POST' }), {
    codigo: 'DUPLICADO',
    campos,
  });
});
