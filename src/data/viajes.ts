/** Contrato de presentación del resumen de una ruta persistida. */

export type EstadoViaje = 'planificado';

export type Viaje = {
  id: string;
  titulo: string;
  fechas: string;
  estado: EstadoViaje;
  cantidadBodegas: number;
  cantidadAlmuerzos: number;
};
