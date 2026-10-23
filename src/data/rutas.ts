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
  parametros: Record<string, unknown>;
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
export function agruparDias(ruta: Ruta): DiaRuta[] {
  const dias = new Map<string, Visita[]>();
  for (const visita of ruta.visitas) {
    const fecha = fechaMendoza(visita.inicio);
    dias.set(fecha, [...(dias.get(fecha) ?? []), visita]);
  }
  return [...dias].map(([fecha, visitas]) => ({ id: fecha, titulo: fecha, visitas }));
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
