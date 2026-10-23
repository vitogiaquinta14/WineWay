import assert from 'node:assert/strict';
import { test } from 'node:test';

test('formulario acepta nombres compuestos y detecta todos los obligatorios/confirmación', async () => {
  const { validarCuenta, cuentaVacia } = await import(
    new URL('../../src/utils/validar-cuenta.ts', import.meta.url).href
  );
  const vacio = validarCuenta(cuentaVacia, 'registro', '2026-10-22');
  assert.deepEqual(Object.keys(vacio).sort(), [
    'apellido',
    'confirmPassword',
    'email',
    'fechaNacimiento',
    'nombre',
    'password',
    'username',
  ]);
  const valido = {
    ...cuentaVacia,
    nombre: 'María José',
    apellido: 'O Connor',
    username: 'vino_1',
    email: 'vino@example.com',
    fechaNacimiento: '2008-10-22',
    password: 'Seguro1!',
    confirmPassword: 'Seguro1!',
  };
  assert.deepEqual(validarCuenta(valido, 'registro', '2026-10-22'), {});
  assert.ok(validarCuenta({ ...valido, apellido: "O'Connor" }, 'perfil').apellido);
  assert.ok(
    validarCuenta({ ...valido, confirmPassword: 'Otra1!' }, 'registro', '2026-10-22')
      .confirmPassword,
  );
  const errores = validarCuenta(
    { ...valido, nombre: 'Ana2', apellido: 'Apellido7', email: 'mal', username: 'con espacios' },
    'perfil',
    '2026-10-22',
  );
  assert.deepEqual(Object.keys(errores).sort(), ['apellido', 'email', 'nombre', 'username']);
});

test('calendario y mayoría de edad coinciden en el límite exacto y los días bisiestos', async () => {
  const { validarCuenta, cuentaVacia, limiteNacimiento } = await import(
    new URL('../../src/utils/validar-cuenta.ts', import.meta.url).href
  );
  assert.equal(limiteNacimiento('2028-02-29'), '2010-02-28');
  assert.ok(
    validarCuenta({ ...cuentaVacia, fechaNacimiento: '2008-10-23' }, 'registro', '2026-10-22')
      .fechaNacimiento,
  );
  assert.ok(
    validarCuenta({ ...cuentaVacia, fechaNacimiento: '2000-02-30' }, 'registro', '2026-10-22')
      .fechaNacimiento,
  );
  assert.equal(
    validarCuenta({ ...cuentaVacia, fechaNacimiento: '2008-10-22' }, 'registro', '2026-10-22')
      .fechaNacimiento,
    undefined,
  );
});
