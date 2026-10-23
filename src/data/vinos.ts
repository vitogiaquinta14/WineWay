import type { ImageSource } from 'expo-image';
export type VinoIdentificado = {
  vinoId?: string;
  vinoManualId?: string;
  nombre: string;
  bodega: string;
  varietal: string;
  anio?: number | null;
  region: string;
  imagen?: ImageSource | number;
};
export type VinoGuardado = VinoIdentificado & { id: string; rating: number | null; nota: string };
export type VinoAPI = {
  id: string;
  nombre: string;
  imagenUrl?: string | null;
  bodega: { nombre: string; zona: string };
  cepas: { cepa: { nombre: string }; porcentaje: number | null }[];
};
export function identificarVino(v: VinoAPI): VinoIdentificado {
  return {
    vinoId: v.id,
    nombre: v.nombre,
    bodega: v.bodega.nombre,
    varietal: v.cepas.map((c) => c.cepa.nombre).join(', '),
    region: v.bodega.zona,
    imagen: v.imagenUrl ? { uri: v.imagenUrl } : undefined,
  };
}
