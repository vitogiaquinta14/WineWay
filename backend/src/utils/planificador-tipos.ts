export type HorarioPlan = { dia: number; tipo: string; desde: number; hasta: number };
export type ExperienciaPlan = {
  id: string; nombre: string; precioCentavos: number; duracionMin: number;
  tipo: string; gastronomia?: boolean; almuerzo?: boolean; activa?: boolean; horarios: HorarioPlan[];
};
export type BodegaPlan = {
  id: string; nombre: string; zona: string; tipo: string; caracteristicas: string[];
  latitud: number; longitud: number; rating: number | null;
  experiencias: ExperienciaPlan[]; activa?: boolean;
};
export type ParametrosPlan = {
  fechaInicio: string; cantidadDias: number; cantidadPersonas: number;
  presupuestoPersonaCentavos: number; cantidadVisitas: number; cantidadAlmuerzos?: number;
  favoritas?: string[]; imprescindibles?: string[]; desdeMin?: number; hastaMin?: number;
};
export type MotivoExclusion = 'INACTIVA' | 'FECHAS' | 'FRANJA' | 'PRESUPUESTO' | 'CANTIDAD' | 'AGENDA' | 'ALMUERZOS';
export type Exclusion = {
  bodegaId: string; nombre: string; imprescindible: boolean;
  motivos: MotivoExclusion[]; mensaje: string;
};
export type VisitaPlan = { experienciaId: string; inicio: string; trasladoMin: number | null };
export type Eleccion = { bodega: BodegaPlan; experiencia: ExperienciaPlan };
export type Agenda = { elecciones: Eleccion[]; minutos: number[] };
export const MARGEN_DESCANSO_MIN = 30;
export function esAlmuerzo(e: ExperienciaPlan) {
  return e.almuerzo ?? /\balmuerzo\b/iu.test(e.tipo);
}
/** Los almuerzos tienen que empezar antes de las 15:00. */
export const ALMUERZO_INICIO_ANTES_DE_MIN = 900;
/** Peso del rating de demostración, medido en reseñas: vale como cinco reseñas previas. */
export const PESO_DEMOSTRACION = 5;
/** Promedio bayesiano: pocas reseñas WineWay mueven poco el rating de demostración; muchas lo reemplazan. */
export function puntuacionBodega(demostracion: number | null, valoraciones: number[]): number | null {
  const suma = valoraciones.reduce((s, v) => s + v, 0);
  if (demostracion === null) return valoraciones.length ? suma / valoraciones.length : null;
  return (PESO_DEMOSTRACION * demostracion + suma) / (PESO_DEMOSTRACION + valoraciones.length);
}
