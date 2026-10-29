import type { Bodega } from './bodegas';
export type Visita = {
  id: string;
  bodegaId: string;
  experienciaId: string;
  inicio: string;
  nombreExperiencia: string;
  duracionMin: number;
  trasladoMin?: number | null;
  advertenciaInactiva: boolean;
  bodega: Bodega;
  experiencia: { precioCentavos: number; tipoId: string };
};
export type DiaRuta = { id: string; titulo: string; visitas: Visita[] };
export type ResultadoGeneracion = {
  cantidadSolicitada: number;
  cantidadIncluida: number;
  cumpleImprescindibles: boolean;
  metodo?: 'VORAZ';
  /** Sólo en resúmenes históricos del planificador anterior. */
  busquedaCompleta?: boolean;
  cantidadAlmuerzosSolicitada?: number;
  cantidadAlmuerzosIncluida?: number;
  cumpleAlmuerzos?: boolean;
  advertencias: string[];
  noIncluidas: { bodegaId: string; nombre: string; imprescindible: boolean; motivos: string[]; mensaje: string }[];
};
export type Ruta = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  cantidadDias: number;
  cantidadPersonas: number;
  presupuestoPersonaCentavos: number;
  costoPersonaCentavos: number;
  costoGrupoCentavos: number;
  presupuestoGrupoCentavos: number;
  estado: 'HISTORICA' | 'VIGENTE';
  visitas: Visita[];
  parametros: Record<string, unknown> & { generacion?: ResultadoGeneracion };
};
export type VisitaNueva = { experienciaId: string; inicio: string };
export type RutaNueva = {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  cantidadDias: number;
  cantidadPersonas: number;
  presupuestoPersonaCentavos: number;
  parametros?: Record<string, unknown>;
  visitas: VisitaNueva[];
};
export type RutaGeneradaNueva = Omit<RutaNueva, 'visitas' | 'parametros'> & {
  cantidadVisitas: number;
  cantidadAlmuerzos: number;
  imprescindibles: string[];
  desdeMin: number;
  hastaMin: number;
};
export function agruparDias(ruta: Ruta): DiaRuta[] {
  const dias = new Map<string, Visita[]>();
  for (let i = 0; i < ruta.cantidadDias; i++) {
    const fecha = new Date(`${ruta.fechaInicio}T12:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() + i);
    dias.set(fecha.toISOString().slice(0, 10), []);
  }
  for (const visita of ruta.visitas) {
    const fecha = fechaMendoza(visita.inicio);
    dias.set(fecha, [...(dias.get(fecha) ?? []), visita]);
  }
  return [...dias].map(([fecha, visitas], i) => ({
    id: fecha,
    titulo: `Día ${i + 1} · ${diaCorto(fecha)}`,
    visitas,
  }));
}
export function fechaMendoza(inicio: string) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Mendoza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(inicio));
  const v = (tipo: string) => p.find((x) => x.type === tipo)!.value;
  return `${v('year')}-${v('month')}-${v('day')}`;
}
export function horaMendoza(inicio: string) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Mendoza',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(inicio));
}
const formatoDia = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
/** "lun, 7 ene" para una fecha YYYY-MM-DD. */
export function diaCorto(fecha: string) {
  return formatoDia.format(new Date(`${fecha}T12:00:00Z`));
}
/** "7 ene – 9 ene" con el primer y el último día de la ruta. */
export function rangoFechas(ruta: Pick<Ruta, 'fechaInicio' | 'cantidadDias'>) {
  const fecha = (dias: number) => {
    const d = new Date(`${ruta.fechaInicio}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d;
  };
  const corto = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', day: 'numeric', month: 'short' });
  const inicio = corto.format(fecha(0));
  return ruta.cantidadDias === 1 ? inicio : `${inicio} – ${corto.format(fecha(ruta.cantidadDias - 1))}`;
}
