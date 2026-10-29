import { sumarDias } from './formulario-ruta';

/**
 * Qué días y horarios puede elegir la usuaria al agregar una experiencia a una ruta.
 * Es una guía de interfaz: la API vuelve a validar horario, período y superposición.
 */
type RutaBase = {
  fechaInicio: string;
  cantidadDias: number;
  visitas: { experienciaId: string; inicio: string; duracionMin: number }[];
};
type ExperienciaBase = {
  id: string;
  duracionMin: number;
  horarios: { dia: number; tipo: string; desde: number; hasta: number }[];
};

/** Cada cuánto se ofrece un inicio dentro de una franja flexible. */
export const PASO_FLEXIBLE_MIN = 30;

/** 1 = lunes … 7 = domingo, igual que los horarios del catálogo. */
function diaSemana(fecha: string) {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay() || 7;
}

function hora(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function diasParaAgregar(ruta: RutaBase, experiencia: ExperienciaBase) {
  return Array.from({ length: ruta.cantidadDias }, (_, i) => {
    const fecha = sumarDias(ruta.fechaInicio, i);
    return { fecha, abierto: experiencia.horarios.some((h) => h.dia === diaSemana(fecha)) };
  });
}

export function horariosParaAgregar(ruta: RutaBase, experiencia: ExperienciaBase, fecha: string) {
  const inicios = new Set<number>();
  for (const h of experiencia.horarios.filter((h) => h.dia === diaSemana(fecha))) {
    if (h.tipo === 'FIJO') inicios.add(h.desde);
    else
      for (let m = h.desde; m + experiencia.duracionMin <= h.hasta; m += PASO_FLEXIBLE_MIN)
        inicios.add(m);
  }
  return [...inicios]
    .filter((m) => m + experiencia.duracionMin <= 1440)
    .sort((a, b) => a - b)
    .map((m) => {
      // Mendoza no tiene horario de verano: siempre UTC-3.
      const inicio = new Date(`${fecha}T${hora(m)}:00-03:00`);
      const fin = inicio.getTime() + experiencia.duracionMin * 60000;
      const libre = ruta.visitas.every((v) => {
        const desde = Date.parse(v.inicio);
        return desde + v.duracionMin * 60000 <= inicio.getTime() || fin <= desde;
      });
      return { hora: hora(m), inicio: inicio.toISOString(), libre };
    });
}

export function visitaExistente<V extends RutaBase['visitas'][number]>(
  ruta: { visitas: V[] },
  experienciaId: string,
) {
  return ruta.visitas.find((v) => v.experienciaId === experienciaId);
}
