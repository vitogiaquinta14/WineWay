import type { ImageSource } from 'expo-image';

/** Datos de ejemplo mientras no hay backend. */

export type Zona = 'Valle de Uco' | 'Luján de Cuyo' | 'Maipú';

export type Bodega = {
  id: string;
  nombre: string;
  zona: Zona;
  /** Departamento o localidad (ej. "Tupungato"). */
  localidad: string;
  rating: number;
  /** Rango de precio de 1 a 5 ($ a $$$$$). */
  precio: 1 | 2 | 3 | 4 | 5;
  experienciaDestacada: string;
  recomendada?: boolean;
  /** Foto principal. Mientras falte, se muestra un placeholder. */
  imagen?: ImageSource | number;
};

export const bodegas: Bodega[] = [
  {
    id: 'catena-zapata',
    nombre: 'Catena Zapata',
    zona: 'Luján de Cuyo',
    localidad: 'Luján de Cuyo',
    rating: 4.9,
    precio: 5,
    experienciaDestacada: 'Visita a la pirámide y degustación',
    recomendada: true,
  },
  {
    id: 'zuccardi',
    nombre: 'Familia Zuccardi',
    zona: 'Valle de Uco',
    localidad: 'San Carlos',
    rating: 4.9,
    precio: 5,
    experienciaDestacada: 'Premium Tasting & Lunch',
    recomendada: true,
  },
  {
    id: 'salentein',
    nombre: 'Bodega Salentein',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.8,
    precio: 4,
    experienciaDestacada: 'Tasting & Art Gallery',
    recomendada: true,
  },
  {
    id: 'chandon',
    nombre: 'Chandon Argentina',
    zona: 'Luján de Cuyo',
    localidad: 'Agrelo',
    rating: 4.6,
    precio: 3,
    experienciaDestacada: 'Sparkling Tour & Garden',
  },
  {
    id: 'andeluna',
    nombre: 'Andeluna Cellars',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.7,
    precio: 4,
    experienciaDestacada: 'Almuerzo de 5 pasos',
  },
  {
    id: 'alfa-crux',
    nombre: 'Bodega Alfa Crux',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.7,
    precio: 4,
    experienciaDestacada: 'Cata arquitectónica',
  },
];

export const bodegasRecomendadas = bodegas.filter((bodega) => bodega.recomendada);

export function getBodega(id: string) {
  return bodegas.find((bodega) => bodega.id === id);
}
