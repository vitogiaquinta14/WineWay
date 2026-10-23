import type { ImageSource } from 'expo-image';
/** Contratos de lectura de la API. El catálogo vive en SQLite. */
export type Zona = string;
export type Coordenadas = { latitude: number; longitude: number };
export type Horario = { dia: number; tipo: 'FIJO' | 'FLEXIBLE'; desde: number; hasta: number };
export type Experiencia = {
  id: string;
  nombre: string;
  descripcion: string;
  precioCentavos: number;
  duracionMin: number;
  activa: boolean;
  horarios: Horario[];
  tipo: { id: string; nombre: string; gastronomia: boolean };
};
export type VinoDestacado = {
  id: string;
  nombre: string;
  precioCentavos: number;
  imagenUrl?: string | null;
};
export type Bodega = {
  id: string;
  nombre: string;
  zona: Zona;
  localidad: string;
  coordenadas: Coordenadas;
  rating: number | null;
  ratingFuente: 'DEMOSTRACION' | null;
  ratingWineWay: number | null;
  cantidadResenas: number;
  precio: number | null;
  precioPromedioCentavos: number | null;
  experienciaDestacada: string;
  descripcion: string;
  sitioWeb: string;
  experiencias: Experiencia[];
  vinos: VinoDestacado[];
  recomendada: boolean;
  activa: boolean;
  imagen?: ImageSource | number;
};
export function formatPrecio(pesos: number | null) {
  return pesos === null
    ? 'Sin precio'
    : new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2,
      }).format(pesos);
}
