export const cuentaVacia = {
  nombre: '',
  apellido: '',
  email: '',
  username: '',
  fechaNacimiento: '',
  apodo: '',
  fotoUrl: '',
  password: '',
  confirmPassword: '',
};
export type ValoresCuenta = typeof cuentaVacia;
export type CampoCuenta = keyof ValoresCuenta;
export type ErroresCuenta = Partial<Record<CampoCuenta, string>>;
export type ModoCuenta = 'registro' | 'perfil';

export function hoyMendoza(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Mendoza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const p = (tipo: string) => partes.find((v) => v.type === tipo)!.value;
  return `${p('year')}-${p('month')}-${p('day')}`;
}
export function limiteNacimiento(hoy = hoyMendoza()): string {
  const [anio, mes, dia] = hoy.split('-').map(Number);
  const limiteDia = Math.min(dia, new Date(Date.UTC(anio - 18, mes, 0)).getUTCDate());
  return `${anio - 18}-${String(mes).padStart(2, '0')}-${String(limiteDia).padStart(2, '0')}`;
}
export function fechaVisible(fecha: string): string {
  return fecha ? fecha.split('-').reverse().join('/') : '';
}
export function validarCuenta(
  v: ValoresCuenta,
  modo: ModoCuenta,
  hoy = hoyMendoza(),
): ErroresCuenta {
  const errores: ErroresCuenta = {};
  for (const campo of ['nombre', 'apellido'] as const) {
    const valor = v[campo].trim();
    if (!valor) errores[campo] = `El ${campo} es obligatorio.`;
    else if (valor.length > 200) errores[campo] = 'Usá hasta 200 caracteres.';
    else if (!/^[\p{L}][\p{L}\p{M} ]*$/u.test(valor))
      errores[campo] = 'Usá solo letras y espacios.';
  }
  const email = v.email.trim();
  if (!email) errores.email = 'El email es obligatorio.';
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errores.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
  const username = v.username.trim().toLowerCase();
  if (!username) errores.username = 'El usuario es obligatorio.';
  else if (username.length > 200) errores.username = 'Usá hasta 200 caracteres.';
  else if (!/^[a-z0-9_.-]+$/.test(username))
    errores.username = 'Usá letras sin acentos, números, punto, guion o guion bajo; sin espacios.';
  if (v.apodo.trim().length > 200) errores.apodo = 'Usá hasta 200 caracteres.';
  if (v.fotoUrl.trim()) {
    try {
      const url = new URL(v.fotoUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      errores.fotoUrl = 'Ingresá una URL válida que empiece con http:// o https://.';
    }
  }
  if (modo === 'registro') {
    const fecha = v.fechaNacimiento;
    if (!fecha) errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      Number.isNaN(Date.parse(fecha)) ||
      new Date(fecha).toISOString().slice(0, 10) !== fecha
    )
      errores.fechaNacimiento = 'Elegí una fecha de nacimiento válida.';
    else if (fecha > limiteNacimiento(hoy))
      errores.fechaNacimiento = 'Debés tener 18 años cumplidos.';
    if (!v.password) errores.password = 'La contraseña es obligatoria.';
    else if (v.password.length < 8)
      errores.password = 'La contraseña debe tener al menos 8 caracteres.';
    else if (v.password.length > 128)
      errores.password = 'La contraseña debe tener hasta 128 caracteres.';
    else if (!/\p{Lu}/u.test(v.password)) errores.password = 'Agregá al menos una mayúscula.';
    else if (!/[0-9]/.test(v.password)) errores.password = 'Agregá al menos un número.';
    else if (!/[^\p{L}\p{N}\s]/u.test(v.password))
      errores.password = 'Agregá al menos un símbolo, por ejemplo ! o @.';
    if (!v.confirmPassword) errores.confirmPassword = 'Repetí tu contraseña.';
    else if (v.password !== v.confirmPassword)
      errores.confirmPassword = 'Las contraseñas no coinciden.';
  }
  return errores;
}
