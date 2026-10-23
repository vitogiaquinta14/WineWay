import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { crearPrisma, type DB } from '../src/prisma.js';
import { z } from 'zod';
import { dinero, texto, id } from '../src/utils/http.js';
const horario = z.object({
  dia: z.number().int().min(1).max(7),
  tipo: z.enum(['FIJO', 'FLEXIBLE']),
  desde: z.number().int(),
  hasta: z.number().int(),
});
const experiencia = z.object({
  id,
  nombre: texto,
  descripcion: z.string(),
  tipoId: id,
  precioCentavos: dinero,
  duracionMin: z.number().int().positive(),
  horarios: z.array(horario),
});
const vino = z.object({
  id,
  nombre: texto,
  descripcion: z.string(),
  precioCentavos: dinero,
  codigoBarras: id,
  codigoDePrueba: z.boolean(),
  tipo: texto,
  perfil: texto,
  cepaIds: z.array(id).min(1),
});
const catalogo = z.object({
  nota: z.string(),
  tiposExperiencia: z.array(z.object({ id, nombre: texto, gastronomia: z.boolean() })),
  cepas: z.array(z.object({ id, nombre: texto })),
  bodegas: z.array(
    z.object({
      id,
      nombre: texto,
      descripcion: z.string(),
      direccion: texto,
      localidad: texto,
      zona: texto,
      latitud: z.number().min(-90).max(90),
      longitud: z.number().min(-180).max(180),
      sitioWeb: z.string(),
      tipo: texto,
      caracteristicas: z.array(texto),
      fotos: z.array(z.url()),
      ratingDemostracion: z.number().min(0).max(5).nullable(),
      recomendada: z.boolean(),
      activa: z.boolean(),
      experiencias: z.array(experiencia),
      vinos: z.array(vino),
    }),
  ),
});
/** El archivo de datos es la única fuente del catálogo precargado. No crea usuarios ficticios. */
export async function seed(db: DB) {
  const datos = catalogo.parse(
    JSON.parse(readFileSync(new URL('./data/catalogo.json', import.meta.url), 'utf8')),
  );
  await db.$transaction(
    async (tx) => {
      for (const tipo of datos.tiposExperiencia)
        await tx.tipoExperiencia.upsert({ where: { id: tipo.id }, create: tipo, update: tipo });
      for (const cepa of datos.cepas)
        await tx.cepa.upsert({ where: { id: cepa.id }, create: cepa, update: cepa });
      for (const { experiencias, vinos, ...bodega } of datos.bodegas) {
        await tx.bodega.upsert({ where: { id: bodega.id }, create: bodega, update: bodega });
        for (const { horarios, ...exp } of experiencias) {
          const data = { ...exp, bodegaId: bodega.id };
          await tx.experiencia.upsert({ where: { id: exp.id }, create: data, update: data });
          await tx.horarioExperiencia.deleteMany({ where: { experienciaId: exp.id } });
          await tx.horarioExperiencia.createMany({
            data: horarios.map((h) => ({ ...h, experienciaId: exp.id })),
          });
        }
        for (const { cepaIds, ...vino } of vinos) {
          const data = { ...vino, bodegaId: bodega.id };
          await tx.vino.upsert({ where: { id: vino.id }, create: data, update: data });
          await tx.vinoCepa.deleteMany({ where: { vinoId: vino.id } });
          await tx.vinoCepa.createMany({
            data: cepaIds.map((cepaId) => ({ vinoId: vino.id, cepaId })),
          });
        }
      }
    },
    { timeout: 30000 },
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = crearPrisma();
  try {
    await seed(db);
    console.log('Catálogo de demostración cargado. No se modificaron datos personales.');
  } finally {
    await db.$disconnect();
  }
}
