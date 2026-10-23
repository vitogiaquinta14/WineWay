import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../prisma.js';
import { exigirSesion } from './auth.js';
import { incluirVino, incluirBodega, presentarBodega } from './catalogo.js';
import { id, texto, dinero, encontrado, exigir } from '../utils/http.js';
const atributosCava = z
  .object({
    anada: z
      .number()
      .int()
      .min(1)
      .max(new Date().getFullYear() + 1)
      .nullable()
      .optional(),
    valoracion: z.number().int().min(1).max(5).nullable().optional(),
    nota: z.string().trim().max(5000).nullable().optional(),
  })
  .strict();
const vinoManual = z
  .object({
    nombre: texto,
    bodegaNombre: texto.nullable().optional(),
    descripcion: z.string().trim().max(5000).nullable().optional(),
    precioCentavos: dinero.nullable().optional(),
    cepasTexto: texto.nullable().optional(),
    tipo: texto.nullable().optional(),
    codigoBarras: id.nullable().optional(),
  })
  .strict();
const incluirCava = { vino: { include: incluirVino }, vinoManual: true } as const;
export function rutasPersonales(db: DB) {
  const r = Router();
  r.get('/bodegas/:id/resenas', async (req, res) =>
    res.json(
      await db.resenaBodega.findMany({
        where: { bodegaId: id.parse(req.params.id) },
        include: { usuario: { select: { username: true, apodo: true } } },
        orderBy: { creadoEn: 'desc' },
      }),
    ),
  );
  r.use(['/cava', '/favoritos', '/vinos-manuales', '/bodegas/:id/mi-resena'], exigirSesion(db));
  r.get('/cava', async (req, res) =>
    res.json(
      await db.vinoEnCava.findMany({
        where: { usuarioId: req.usuarioId },
        include: incluirCava,
        orderBy: { creadoEn: 'desc' },
      }),
    ),
  );
  r.post('/cava', async (req, res) => {
    const datos = atributosCava
      .extend({ vinoId: id.nullable().optional(), vinoManualId: id.nullable().optional() })
      .refine(
        (v) => Boolean(v.vinoId) !== Boolean(v.vinoManualId),
        'Seleccioná exactamente un origen de vino.',
      )
      .parse(req.body);
    if (datos.vinoId) encontrado(await db.vino.findUnique({ where: { id: datos.vinoId } }));
    if (datos.vinoManualId)
      encontrado(
        await db.vinoFueraDeCatalogo.findFirst({
          where: { id: datos.vinoManualId, usuarioId: req.usuarioId },
        }),
      );
    res
      .status(201)
      .json(
        await db.vinoEnCava.create({
          data: { ...datos, usuarioId: req.usuarioId },
          include: incluirCava,
        }),
      );
  });
  r.post('/cava/manual', async (req, res) => {
    const { anada, valoracion, nota, ...vino } = vinoManual
      .extend(atributosCava.shape)
      .parse(req.body);
    const entrada = await db.$transaction(async (tx) => {
      const manual = await tx.vinoFueraDeCatalogo.create({
        data: { ...vino, usuarioId: req.usuarioId },
      });
      return tx.vinoEnCava.create({
        data: { usuarioId: req.usuarioId, vinoManualId: manual.id, anada, valoracion, nota },
        include: incluirCava,
      });
    });
    res.status(201).json(entrada);
  });
  r.patch('/cava/:id', async (req, res) => {
    const clave = id.parse(req.params.id);
    encontrado(await db.vinoEnCava.findFirst({ where: { id: clave, usuarioId: req.usuarioId } }));
    const datos = atributosCava.parse(req.body);
    exigir(Object.keys(datos).length, 'No hay cambios.');
    res.json(
      await db.vinoEnCava.update({ where: { id: clave }, data: datos, include: incluirCava }),
    );
  });
  r.delete('/cava/:id', async (req, res) => {
    const cambio = await db.vinoEnCava.deleteMany({
      where: { id: id.parse(req.params.id), usuarioId: req.usuarioId },
    });
    encontrado(cambio.count || null);
    res.status(204).end();
  });
  r.patch('/vinos-manuales/:id', async (req, res) => {
    const clave = id.parse(req.params.id);
    encontrado(
      await db.vinoFueraDeCatalogo.findFirst({ where: { id: clave, usuarioId: req.usuarioId } }),
    );
    const datos = vinoManual.partial().parse(req.body);
    exigir(Object.keys(datos).length, 'No hay cambios.');
    res.json(await db.vinoFueraDeCatalogo.update({ where: { id: clave }, data: datos }));
  });
  r.get('/favoritos', async (req, res) =>
    res.json(
      (
        await db.bodegaFavorita.findMany({
          where: { usuarioId: req.usuarioId },
          include: { bodega: { include: incluirBodega } },
          orderBy: { creadoEn: 'desc' },
        })
      ).map((f) => presentarBodega(f.bodega)),
    ),
  );
  r.put('/favoritos/:bodegaId', async (req, res) => {
    const bodegaId = id.parse(req.params.bodegaId);
    encontrado(await db.bodega.findUnique({ where: { id: bodegaId } }));
    res.json(
      await db.bodegaFavorita.upsert({
        where: { usuarioId_bodegaId: { usuarioId: req.usuarioId, bodegaId } },
        create: { usuarioId: req.usuarioId, bodegaId },
        update: {},
      }),
    );
  });
  r.delete('/favoritos/:bodegaId', async (req, res) => {
    await db.bodegaFavorita.deleteMany({
      where: { usuarioId: req.usuarioId, bodegaId: id.parse(req.params.bodegaId) },
    });
    res.status(204).end();
  });
  r.put('/bodegas/:id/mi-resena', async (req, res) => {
    const bodegaId = id.parse(req.params.id);
    encontrado(await db.bodega.findUnique({ where: { id: bodegaId } }));
    const datos = z
      .object({
        valoracion: z.number().int().min(1).max(5),
        comentario: z.string().trim().max(5000).nullable().optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      await db.resenaBodega.upsert({
        where: { usuarioId_bodegaId: { usuarioId: req.usuarioId, bodegaId } },
        create: { usuarioId: req.usuarioId, bodegaId, ...datos },
        update: datos,
      }),
    );
  });
  r.delete('/bodegas/:id/mi-resena', async (req, res) => {
    await db.resenaBodega.deleteMany({
      where: { usuarioId: req.usuarioId, bodegaId: id.parse(req.params.id) },
    });
    res.status(204).end();
  });
  return r;
}
