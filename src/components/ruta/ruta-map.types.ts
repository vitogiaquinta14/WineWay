import type { Bodega, Coordenadas } from '@/data/bodegas';

/** Una visita ubicada en el mapa: número dentro de su día y color del día. */
export type Parada = {
  id: string;
  diaId: string;
  numero: number;
  color: string;
  coordenadas: Coordenadas;
  bodega: Bodega;
  /** "10:30 · Degustación clásica" */
  detalle: string;
};

export type RutaMapProps = {
  paradas: Parada[];
  onBodegaPress: (bodega: Bodega) => void;
};
