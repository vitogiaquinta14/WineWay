import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { exigirSesion } from './auth.js';
import { incluirBodega, presentarBodega } from './catalogo.js';
import { ErrorHTTP, encontrado, exigir, texto, fecha, dinero, id } from '../utils/http.js';
import {
  fechaLocal,
  minutosLocales,
  horarioAdmite,
  validarVisitas,
  totalesRuta,
} from '../utils/reglas.js';
type Tx = Prisma.TransactionClient;
const datosRuta = z
  .object({
    nombre: texto,
    descripcion: z.string().trim().max(5000).nullable().optional(),
    fechaInicio: fecha,
    cantidadDias: z.number().int().min(1).max(365),
    cantidadPersonas: z.number().int().min(1).max(1000),
    presupuestoPersonaCentavos: dinero,
    parametros: z.record(z.string(), z.json()).optional(),
  })
  .strict();
const datosVisita = z
  .object({
    experienciaId: id,
    inicio: z.iso
      .datetime({ offset: true })
      .refine(
        (v) => new Date(v).getUTCSeconds() === 0 && new Date(v).getUTCMilliseconds() === 0,
        'El horario debe tener precisión de minutos.',
      ),
    trasladoMin: z.number().int().min(0).max(1440).nullable().optional(),
  })
  .strict();
const incluirRuta = {
  visitas: {
    include: { experiencia: { include: { bodega: { include: incluirBodega } } } },
    orderBy: { inicio: 'asc' },
  },
} satisfies Prisma.RutaInclude;
type RutaCompleta = Prisma.RutaGetPayload<{ include: typeof incluirRuta }>;
export function presentarRuta(r: RutaCompleta) {
  const visitas = r.visitas.map((v) => ({
    ...v,
    bodegaId: v.experiencia.bodegaId,
    bodega: presentarBodega(v.experiencia.bodega),
    advertenciaInactiva: !v.experiencia.activa || !v.experiencia.bodega.activa,
  }));
  return {
    ...r,
    visitas,
    estado: visitas.every((v) => v.inicio.getTime() + v.duracionMin * 60000 <= Date.now())
      ? 'HISTORICA'
      : 'VIGENTE',
    ...totalesRuta(
      visitas.map((v) => v.experiencia.precioCentavos),
      r.cantidadPersonas,
      r.presupuestoPersonaCentavos,
    ),
  };
}
async function propia(tx: Tx, rutaId: string, usuarioId: string) {
  return encontrado(
    await tx.ruta.findFirst({ where: { id: rutaId, usuarioId }, include: incluirRuta }),
  );
}
function validarConjunto(
  visitas: { inicio: Date; duracionMin: number }[],
  fechaInicio: string,
  dias: number,
) {
  try {
    validarVisitas(visitas, fechaInicio, dias);
  } catch (e) {
    throw new ErrorHTTP(400, 'ITINERARIO_INVALIDO', (e as Error).message);
  }
}
async function prepararVisita(tx: Tx, datos: z.infer<typeof datosVisita>) {
  const experiencia = encontrado(
    await tx.experiencia.findUnique({
      where: { id: datos.experienciaId },
      include: { bodega: true, horarios: true },
    }),
  );
  exigir(experiencia.activa && experiencia.bodega.activa, 'La experiencia o bodega está inactiva.');
  const inicio = new Date(datos.inicio);
  const local = fechaLocal(inicio);
  const dia = new Date(`${local}T12:00:00Z`).getUTCDay() || 7;
  exigir(
    experiencia.horarios.some(
      (h) => h.dia === dia && horarioAdmite(h, minutosLocales(inicio), experiencia.duracionMin),
    ),
    'La visita no respeta el horario de la experiencia.',
  );
  return {
    experienciaId: experiencia.id,
    inicio,
    duracionMin: experiencia.duracionMin,
    nombreExperiencia: experiencia.nombre,
    trasladoMin: datos.trasladoMin,
  };
}
export function rutasItinerarios(db: DB) {
  const r = Router();
  r.use(exigirSesion(db));
  r.get('/', async (req, res) =>
    res.json(
      (
        await db.ruta.findMany({
          where: { usuarioId: req.usuarioId },
          include: incluirRuta,
          orderBy: { creadoEn: 'desc' },
        })
      ).map(presentarRuta),
    ),
  );
  r.get('/:id', async (req, res) =>
    res.json(presentarRuta(await propia(db, id.parse(req.params.id), req.usuarioId))),
  );
  r.post('/', async (req, res) => {
    const { visitas, ...datos } = datosRuta
      .extend({ visitas: z.array(datosVisita).min(1).max(500) })
      .parse(req.body);
    const ruta = await db.$transaction(async (tx) => {
      const preparadas = [];
      for (const visita of visitas) preparadas.push(await prepararVisita(tx, visita));
      validarConjunto(preparadas, datos.fechaInicio, datos.cantidadDias);
      return tx.ruta.create({
        data: {
          ...datos,
          parametros: datos.parametros as Prisma.InputJsonValue | undefined,
          usuarioId: req.usuarioId,
          visitas: { create: preparadas },
        },
        include: incluirRuta,
      });
    });
    res.status(201).json(presentarRuta(ruta));
  });
  r.patch('/:id', async (req, res) => {
    const datos = datosRuta.partial().parse(req.body);
    exigir(Object.keys(datos).length, 'No hay cambios.');
    const ruta = await db.$transaction(async (tx) => {
      const anterior = await propia(tx, id.parse(req.params.id), req.usuarioId);
      validarConjunto(
        anterior.visitas,
        datos.fechaInicio ?? anterior.fechaInicio,
        datos.cantidadDias ?? anterior.cantidadDias,
      );
      return tx.ruta.update({
        where: { id: anterior.id },
        data: { ...datos, parametros: datos.parametros as Prisma.InputJsonValue | undefined },
        include: incluirRuta,
      });
    });
    res.json(presentarRuta(ruta));
  });
  r.delete('/:id', async (req, res) => {
    const resultado = await db.ruta.deleteMany({
      where: { id: id.parse(req.params.id), usuarioId: req.usuarioId },
    });
    encontrado(resultado.count || null);
    res.status(204).end();
  });
  r.post('/:id/visitas', async (req, res) => {
    const datos = datosVisita.parse(req.body);
    const ruta = await db.$transaction(async (tx) => {
      const actual = await propia(tx, id.parse(req.params.id), req.usuarioId);
      const nueva = await prepararVisita(tx, datos);
      validarConjunto([...actual.visitas, nueva], actual.fechaInicio, actual.cantidadDias);
      await tx.visita.create({ data: { ...nueva, rutaId: actual.id } });
      return propia(tx, actual.id, req.usuarioId);
    });
    res.status(201).json(presentarRuta(ruta));
  });
  r.patch('/:id/visitas/:visitaId', async (req, res) => {
    const cambios = datosVisita.partial().parse(req.body);
    exigir(Object.keys(cambios).length, 'No hay cambios.');
    const ruta = await db.$transaction(async (tx) => {
      const actual = await propia(tx, id.parse(req.params.id), req.usuarioId);
      const anterior = encontrado(
        actual.visitas.find((v) => v.id === id.parse(req.params.visitaId)),
      );
      const datos =
        cambios.inicio || cambios.experienciaId
          ? await prepararVisita(tx, {
              experienciaId: cambios.experienciaId ?? anterior.experienciaId,
              inicio: cambios.inicio ?? anterior.inicio.toISOString(),
              trasladoMin:
                cambios.trasladoMin === undefined ? anterior.trasladoMin : cambios.trasladoMin,
            })
          : { ...anterior, trasladoMin: cambios.trasladoMin };
      validarConjunto(
        actual.visitas.map((v) => (v.id === anterior.id ? { ...v, ...datos } : v)),
        actual.fechaInicio,
        actual.cantidadDias,
      );
      await tx.visita.update({
        where: { id: anterior.id },
        data: {
          experienciaId: datos.experienciaId,
          inicio: datos.inicio,
          duracionMin: datos.duracionMin,
          nombreExperiencia: datos.nombreExperiencia,
          trasladoMin: datos.trasladoMin,
        },
      });
      return propia(tx, actual.id, req.usuarioId);
    });
    res.json(presentarRuta(ruta));
  });
  r.delete('/:id/visitas/:visitaId', async (req, res) => {
    await db.$transaction(async (tx) => {
      const actual = await propia(tx, id.parse(req.params.id), req.usuarioId);
      const visita = encontrado(actual.visitas.find((v) => v.id === id.parse(req.params.visitaId)));
      if (actual.visitas.length === 1)
        throw new ErrorHTTP(
          409,
          'ULTIMA_VISITA',
          'Eliminar la última visita requiere confirmar la eliminación de la ruta.',
        );
      await tx.visita.delete({ where: { id: visita.id } });
    });
    res.status(204).end();
  });
  return r;
}
