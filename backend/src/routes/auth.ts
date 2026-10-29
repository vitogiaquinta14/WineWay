import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import type { DB } from '../prisma.js';
import { ErrorHTTP, encontrado, exigir } from '../utils/http.js';
import { esMayorDeEdad, fechaCalendario, fechaLocal } from '../utils/reglas.js';
import { hashPassword, verificarPassword, nuevoToken, hashToken } from '../utils/seguridad.js';
declare module 'express-serve-static-core' {
  interface Request {
    usuarioId: string;
  }
}
export const usuarioPublico = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  username: true,
  fechaNacimiento: true,
  apodo: true,
  fotoUrl: true,
} as const;
const obligatorio = (etiqueta: string) =>
  z
    .string({ error: `${etiqueta} es obligatorio.` })
    .trim()
    .min(1, `${etiqueta} es obligatorio.`)
    .max(200, 'Usá hasta 200 caracteres.');
const nombrePersona = (etiqueta: string) =>
  obligatorio(etiqueta).regex(/^[\p{L}][\p{L}\p{M} ]*$/u, 'Usá solo letras y espacios.');
const email = z
  .string({ error: 'El email es obligatorio.' })
  .trim()
  .toLowerCase()
  .min(1, 'El email es obligatorio.')
  .max(254, 'El email es demasiado largo.')
  .pipe(z.email({ error: 'Ingresá un email válido, por ejemplo nombre@correo.com.' }));
const username = obligatorio('El usuario')
  .toLowerCase()
  .regex(
    /^[a-z0-9_.-]+$/,
    'Usá letras sin acentos, números, punto, guion o guion bajo; sin espacios.',
  );
const password = z
  .string({ error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña debe tener hasta 128 caracteres.')
  .regex(/\p{Lu}/u, 'Agregá al menos una mayúscula.')
  .regex(/[0-9]/, 'Agregá al menos un número.')
  .regex(/[^\p{L}\p{N}\s]/u, 'Agregá al menos un símbolo, por ejemplo ! o @.');
const datosUsuario = z
  .object({
    nombre: nombrePersona('El nombre'),
    apellido: nombrePersona('El apellido'),
    email,
    username,
    fechaNacimiento: z
      .string({ error: 'La fecha de nacimiento es obligatoria.' })
      .refine(fechaCalendario, 'Elegí una fecha de nacimiento válida.')
      .refine((v) => esMayorDeEdad(v, fechaLocal(new Date())), 'Debés tener 18 años cumplidos.'),
    apodo: obligatorio('El apodo').nullable().optional(),
    fotoUrl: z
      .url({ error: 'Ingresá una URL válida para la foto.' })
      .refine((v) => /^https?:\/\//i.test(v), 'La URL debe empezar con http:// o https://.')
      .nullable()
      .optional(),
  })
  .strict();

type Identificadores = { email?: string; username?: string };
async function camposOcupados(db: DB, datos: Identificadores, excluirId?: string) {
  const opciones = [
    ...(datos.email ? [{ email: datos.email }] : []),
    ...(datos.username ? [{ username: datos.username }] : []),
  ];
  const campos: Record<string, string> = {};
  if (!opciones.length) return campos;
  const existentes = await db.usuario.findMany({
    where: { OR: opciones, ...(excluirId ? { id: { not: excluirId } } : {}) },
    select: { email: true, username: true },
  });
  if (existentes.some((u) => u.email === datos.email))
    campos.email = 'Este email ya está registrado.';
  if (existentes.some((u) => u.username === datos.username))
    campos.username = 'Este usuario ya existe. Elegí otro.';
  return campos;
}
async function guardarConUnicidad<T>(
  db: DB,
  datos: Identificadores,
  guardar: () => Promise<T>,
  excluirId?: string,
) {
  const comprobar = async () => {
    const campos = await camposOcupados(db, datos, excluirId);
    if (Object.keys(campos).length)
      throw new ErrorHTTP(409, 'DUPLICADO', 'Revisá los campos ocupados.', campos);
  };
  await comprobar();
  try {
    return await guardar();
  } catch (error) {
    // La restricción única de SQLite también cubre registros simultáneos.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
      await comprobar();
    throw error;
  }
}
export function exigirSesion(db: DB): RequestHandler {
  return async (req, _res, next) => {
    const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token) throw new ErrorHTTP(401, 'SESION_INVALIDA', 'Iniciá sesión para continuar.');
    const sesion = await db.sesion.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!sesion || sesion.venceEn <= new Date())
      throw new ErrorHTTP(401, 'SESION_INVALIDA', 'La sesión venció o fue revocada.');
    req.usuarioId = sesion.usuarioId;
    next();
  };
}
async function crearSesion(db: Pick<DB, 'sesion'>, usuarioId: string) {
  const token = nuevoToken();
  const dias = Number(process.env.SESSION_DAYS ?? 7);
  if (!Number.isInteger(dias) || dias < 1 || dias > 365)
    throw new Error('SESSION_DAYS debe ser un entero entre 1 y 365.');
  await db.sesion.create({
    data: {
      usuarioId,
      tokenHash: hashToken(token),
      venceEn: new Date(Date.now() + dias * 86400000),
    },
  });
  return token;
}
export function rutasAuth(db: DB) {
  const r = Router();
  r.get('/auth/disponibilidad', async (req, res) => {
    const datos = z
      .object({ email: email.optional(), username: username.optional() })
      .strict()
      .parse(req.query);
    exigir(datos.email || datos.username, 'Indicá el email o usuario a comprobar.');
    res.json({ campos: await camposOcupados(db, datos) });
  });
  r.post('/auth/registro', async (req, res) => {
    const { password: clave, ...datos } = datosUsuario.extend({ password }).parse(req.body);
    const hash = await hashPassword(clave);
    const resultado = await guardarConUnicidad(db, datos, () =>
      db.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: { ...datos, passwordHash: hash },
          select: usuarioPublico,
        });
        const token = await crearSesion(tx, usuario.id);
        return { usuario, token };
      }),
    );
    res.status(201).json(resultado);
  });
  r.post('/auth/login', async (req, res) => {
    const datos = z
      .object({
        identificador: z.string().trim().min(1).max(254),
        password: z.string().min(1).max(128),
      })
      .strict()
      .parse(req.body);
    const identificador = datos.identificador.toLowerCase();
    const usuario = await db.usuario.findUnique({
      where: identificador.includes('@') ? { email: identificador } : { username: identificador },
    });
    const valido = usuario
      ? await verificarPassword(datos.password, usuario.passwordHash)
      : (await hashPassword(datos.password), false);
    if (!usuario || !valido)
      throw new ErrorHTTP(
        401,
        'CREDENCIALES_INVALIDAS',
        'Email, usuario o contraseña incorrectos.',
      );
    const token = await crearSesion(db, usuario.id);
    res.json({
      token,
      usuario: await db.usuario.findUnique({ where: { id: usuario.id }, select: usuarioPublico }),
    });
  });
  r.post('/auth/logout', exigirSesion(db), async (req, res) => {
    await db.sesion.deleteMany({
      where: { tokenHash: hashToken(req.headers.authorization!.slice(7)) },
    });
    res.status(204).end();
  });
  r.get('/yo', exigirSesion(db), async (req, res) =>
    res.json(
      encontrado(
        await db.usuario.findUnique({ where: { id: req.usuarioId }, select: usuarioPublico }),
      ),
    ),
  );
  r.patch('/yo', exigirSesion(db), async (req, res) => {
    const datos = datosUsuario.omit({ fechaNacimiento: true }).partial().parse(req.body);
    exigir(Object.keys(datos).length, 'No hay campos para actualizar.');
    res.json(
      await guardarConUnicidad(
        db,
        datos,
        () =>
          db.usuario.update({
            where: { id: req.usuarioId },
            data: datos,
            select: usuarioPublico,
          }),
        req.usuarioId,
      ),
    );
  });
  r.delete('/yo', exigirSesion(db), async (req, res) => {
    await db.$transaction(async (tx) => {
      await tx.vinoEnCava.deleteMany({ where: { usuarioId: req.usuarioId } });
      await tx.usuario.delete({ where: { id: req.usuarioId } });
    });
    res.status(204).end();
  });
  return r;
}
