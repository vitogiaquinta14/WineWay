import { bodegas, zonas, type Bodega, type Experiencia, type Zona } from '@/data/bodegas';
import type { Ruta, Visita } from '@/data/rutas';

export type ConfiguracionViaje = {
  dias: number;
  personas: number;
  presupuestoUsd: number;
  /** Cantidad de bodegas para cada día (mismo largo que `dias`). */
  bodegasPorDia: number[];
  preferencias: string[];
};

const HORA_INICIO_MIN = 10 * 60;
const TRASLADO_MISMA_ZONA_MIN = 20;
const TRASLADO_OTRA_ZONA_MIN = 40;

const esGastronomica = (experiencia: Experiencia) =>
  /almuerzo|lunch|men[uú]|cocina/i.test(`${experiencia.nombre} ${experiencia.descripcion}`);

/** "HH:MM" redondeado hacia arriba a la media hora. */
function formatHora(minutos: number) {
  const redondeado = Math.ceil(minutos / 30) * 30;
  const horas = Math.floor(redondeado / 60);
  const resto = redondeado % 60;
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/**
 * Propuesta de itinerario simulada en el frontend, a partir de los datos de ejemplo.
 * Cuando exista backend, la generación de rutas pasa a la API (ver wiki).
 */
export function generarRuta(config: ConfiguracionViaje): Ruta {
  const zonasElegidas = config.preferencias.filter((p): p is Zona =>
    (zonas as readonly string[]).includes(p),
  );
  const priorizarGastronomia = config.preferencias.includes('Gastronomía');

  // Cada bodega candidata con la experiencia que mejor encaja en el presupuesto.
  const candidatas = bodegas
    .filter((bodega) => zonasElegidas.length === 0 || zonasElegidas.includes(bodega.zona))
    .flatMap((bodega) => {
      const posibles = bodega.experiencias.filter((e) => e.precioUsd <= config.presupuestoUsd);
      const experiencia =
        (priorizarGastronomia && posibles.find(esGastronomica)) || posibles[0];
      return experiencia ? [{ bodega, experiencia }] : [];
    })
    .sort((a, b) => {
      if (priorizarGastronomia) {
        const diferencia = Number(esGastronomica(b.experiencia)) - Number(esGastronomica(a.experiencia));
        if (diferencia !== 0) return diferencia;
      }
      return b.bodega.rating - a.bodega.rating;
    });

  let siguiente = 0;
  const dias = Array.from({ length: config.dias }, (_, indiceDia) => {
    const elegidas = candidatas.slice(siguiente, siguiente + config.bodegasPorDia[indiceDia]);
    siguiente += elegidas.length;

    let reloj = HORA_INICIO_MIN;
    let anterior: Bodega | undefined;
    const visitas: Visita[] = elegidas.map(({ bodega, experiencia }) => {
      const trasladoMin = anterior
        ? anterior.zona === bodega.zona
          ? TRASLADO_MISMA_ZONA_MIN
          : TRASLADO_OTRA_ZONA_MIN
        : undefined;
      reloj += trasladoMin ?? 0;
      const hora = formatHora(reloj);
      const duracionMin = experiencia.duracionHoras * 60;
      reloj = Math.ceil(reloj / 30) * 30 + duracionMin;
      anterior = bodega;

      return {
        id: `propuesta-${indiceDia}-${bodega.id}`,
        bodegaId: bodega.id,
        hora,
        actividad: experiencia.nombre,
        duracionMin,
        trasladoMin,
      };
    });

    const zonaDelDia = elegidas[0]?.bodega.zona;
    return {
      id: `dia-${indiceDia + 1}`,
      titulo: zonaDelDia ? `Día ${indiceDia + 1} - ${zonaDelDia}` : `Día ${indiceDia + 1}`,
      visitas,
    };
  });

  return {
    id: `ruta-${Date.now()}`,
    nombre: `Mi ruta de ${config.dias} días`,
    descripcion: `${config.dias} días · ${config.personas} personas · hasta USD ${config.presupuestoUsd} por persona`,
    dias,
  };
}
