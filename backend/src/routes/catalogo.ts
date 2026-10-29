import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { encontrado, id } from '../utils/http.js';
export const incluirBodega = {
  experiencias: { include: { tipo: true, horarios: true } },
  vinos: { include: { cepas: { include: { cepa: true } } } },
  resenas: { select: { valoracion: true } },
} satisfies Prisma.BodegaInclude;
type BodegaCompleta = Prisma.BodegaGetPayload<{ include: typeof incluirBodega }>;
export function presentarBodega(b: BodegaCompleta) {
  const experiencias = b.experiencias.filter((e) => e.activa);
  const promedio = experiencias.length
    ? Math.round(experiencias.reduce((s, e) => s + e.precioCentavos, 0) / experiencias.length)
    : null;
  const fotos = b.fotos as string[];
  const { resenas, ...datos } = b;
  return {
    ...datos,
    experiencias,
    coordenadas: { latitude: b.latitud, longitude: b.longitud },
    imagen: fotos[0] ? { uri: fotos[0] } : undefined,
    precioPromedioCentavos: promedio,
    precio: promedio === null ? null : promedio / 100,
    rating: b.ratingDemostracion,
    ratingFuente: b.ratingDemostracion === null ? null : 'DEMOSTRACION',
    ratingWineWay: resenas.length
      ? resenas.reduce((s, v) => s + v.valoracion, 0) / resenas.length
      : null,
    cantidadResenas: resenas.length,
    experienciaDestacada: experiencias[0]?.nombre ?? 'Sin experiencias activas',
  };
}
export const incluirVino = {
  bodega: true,
  cepas: { include: { cepa: true } },
} satisfies Prisma.VinoInclude;
export function rutasCatalogo(db: DB) {
  const r = Router();
  r.get('/catalogo/filtros', async (_req, res) => {
    const bodegas = await db.bodega.findMany({
      where: { activa: true },
      select: { zona: true, tipo: true, caracteristicas: true },
    });
    const vinos = await db.vino.findMany({ select: { tipo: true, perfil: true } });
    res.json({
      zonas: [...new Set(bodegas.map((b) => b.zona))].sort(),
      tiposBodega: [...new Set(bodegas.map((b) => b.tipo))],
      caracteristicas: [...new Set(bodegas.flatMap((b) => b.caracteristicas as string[]))],
      tiposVino: [...new Set(vinos.map((v) => v.tipo))],
      perfilesVino: [...new Set(vinos.map((v) => v.perfil).filter(Boolean))],
      cepas: await db.cepa.findMany({ orderBy: { nombre: 'asc' } }),
      tiposExperiencia: await db.tipoExperiencia.findMany({ orderBy: { nombre: 'asc' } }),
    });
  });
  r.get('/bodegas', async (req, res) => {
    const q = z
      .object({
        pagina: z.coerce.number().int().min(1).default(1),
        limite: z.coerce.number().int().min(1).max(100).default(50),
        zona: z.string().optional(),
        busqueda: z.string().optional(),
        tipo: z.string().optional(),
        tipoExperiencia: z.string().optional(),
        gastronomia: z.enum(['true', 'false']).optional(),
        tipoVino: z.string().optional(),
        cepa: z.string().optional(),
        perfil: z.string().optional(),
        caracteristica: z.string().optional(),
        precioMin: z.coerce.number().nonnegative().optional(),
        precioMax: z.coerce.number().nonnegative().optional(),
        ratingMin: z.coerce.number().min(0).max(5).optional(),
        lat: z.coerce.number().min(-90).max(90).optional(),
        lng: z.coerce.number().min(-180).max(180).optional(),
        distanciaMaxKm: z.coerce.number().nonnegative().optional(),
      })
      .strict()
      .refine(
        (v) => (v.lat === undefined) === (v.lng === undefined),
        'Se requieren lat y lng juntos.',
      )
      .refine(
        (v) => v.precioMin === undefined || v.precioMax === undefined || v.precioMin <= v.precioMax,
        'El precio mínimo no puede superar al máximo.',
      )
      .refine(
        (v) => v.distanciaMaxKm === undefined || v.lat !== undefined,
        'La distancia requiere un punto de referencia.',
      )
      .parse(req.query);
    const where: Prisma.BodegaWhereInput = { activa: true, zona: q.zona, tipo: q.tipo };
    if (q.busqueda)
      where.OR = [{ nombre: { contains: q.busqueda } }, { localidad: { contains: q.busqueda } }];
    if (q.tipoExperiencia || q.gastronomia)
      where.experiencias = {
        some: {
          activa: true,
          ...(q.tipoExperiencia ? { tipoId: q.tipoExperiencia } : {}),
          ...(q.gastronomia ? { tipo: { gastronomia: q.gastronomia === 'true' } } : {}),
        },
      };
    if (q.tipoVino || q.cepa || q.perfil)
      where.vinos = {
        some: {
          tipo: q.tipoVino,
          perfil: q.perfil,
          ...(q.cepa ? { cepas: { some: { cepaId: q.cepa } } } : {}),
        },
      };
    const todos = (
      await db.bodega.findMany({ where, include: incluirBodega, orderBy: { nombre: 'asc' } })
    )
      .map((b) => ({
        ...presentarBodega(b),
        distanciaKm: q.lat === undefined ? null : distancia(q.lat, q.lng!, b.latitud, b.longitud),
      }))
      .filter(
        (b) =>
          (q.caracteristica === undefined ||
            (b.caracteristicas as string[]).includes(q.caracteristica)) &&
          (q.precioMin === undefined ||
            (b.precioPromedioCentavos !== null && b.precioPromedioCentavos >= q.precioMin)) &&
          (q.precioMax === undefined ||
            (b.precioPromedioCentavos !== null && b.precioPromedioCentavos <= q.precioMax)) &&
          (q.ratingMin === undefined || (b.rating !== null && b.rating >= q.ratingMin)) &&
          (q.distanciaMaxKm === undefined ||
            (b.distanciaKm !== null && b.distanciaKm <= q.distanciaMaxKm)),
      );
    res.json({
      items: todos.slice((q.pagina - 1) * q.limite, q.pagina * q.limite),
      total: todos.length,
      pagina: q.pagina,
      limite: q.limite,
    });
  });
  r.get('/bodegas/:id', async (req, res) =>
    res.json(
      presentarBodega(
        encontrado(
          await db.bodega.findUnique({
            where: { id: id.parse(req.params.id) },
            include: incluirBodega,
          }),
        ),
      ),
    ),
  );
  r.get('/vinos/codigo/:codigo', async (req, res) => {
    const codigo = id.parse(req.params.codigo);
    // iOS informa los UPC-A (12 dígitos) como EAN-13 con un 0 adelante.
    const variantes = /^0\d{12}$/.test(codigo) ? [codigo, codigo.slice(1)] : [codigo];
    res.json(
      encontrado(
        await db.vino.findFirst({
          where: { codigoBarras: { in: variantes } },
          include: incluirVino,
        }),
      ),
    );
  });
  r.get('/vinos/:id', async (req, res) =>
    res.json(
      encontrado(
        await db.vino.findUnique({ where: { id: id.parse(req.params.id) }, include: incluirVino }),
      ),
    ),
  );
  r.get('/cepas', async (_req, res) =>
    res.json(await db.cepa.findMany({ orderBy: { nombre: 'asc' } })),
  );
  r.get('/tipos-experiencia', async (_req, res) =>
    res.json(await db.tipoExperiencia.findMany({ orderBy: { nombre: 'asc' } })),
  );
  return r;
}
function distancia(lat: number, lng: number, a: number, b: number) {
  const rad = (v: number) => (v * Math.PI) / 180;
  const h =
    Math.sin(rad(a - lat) / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(a)) * Math.sin(rad(b - lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
