/** Datos de ejemplo mientras no hay backend. */

export type EstadoViaje = 'planificado';

export type Viaje = {
  id: string;
  titulo: string;
  fechas: string;
  estado: EstadoViaje;
  cantidadBodegas: number;
  cantidadAlmuerzos: number;
};

export const proximoViaje: Viaje | null = {
  id: 'valle-de-uco-nov',
  titulo: 'Fin de semana en Valle de Uco',
  fechas: '14 - 16 Noviembre (3 días)',
  estado: 'planificado',
  cantidadBodegas: 4,
  cantidadAlmuerzos: 2,
};
