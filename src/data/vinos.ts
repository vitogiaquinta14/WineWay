import type { ImageSource } from 'expo-image';
export type VinoIdentificado = {
  vinoId?: string;
  vinoManualId?: string;
  nombre: string;
  bodega: string;
  varietal: string;
  anio?: number | null;
  region: string;
  descripcion?: string;
  tipo?: string;
  perfil?: string | null;
  imagen?: ImageSource | number;
};
export type VinoGuardado = VinoIdentificado & { id: string; rating: number | null; nota: string };
export type VinoAPI = {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  perfil: string | null;
  imagenUrl?: string | null;
  bodega: { nombre: string; zona: string; localidad: string };
  cepas: { cepa: { nombre: string }; porcentaje: number | null }[];
};
/** El precio llega en la API pero no se muestra al escanear. */
export function identificarVino(v: VinoAPI): VinoIdentificado {
  return {
    vinoId: v.id,
    nombre: v.nombre,
    bodega: v.bodega.nombre,
    varietal: v.cepas
      .map((c) => (c.porcentaje === null ? c.cepa.nombre : `${c.cepa.nombre} ${c.porcentaje}%`))
      .join(', '),
    region: [v.bodega.localidad, v.bodega.zona].filter(Boolean).join(', '),
    descripcion: v.descripcion,
    tipo: v.tipo,
    perfil: v.perfil,
    imagen: v.imagenUrl ? { uri: v.imagenUrl } : undefined,
  };
}
