import type { ImageSource } from 'expo-image';

/** Datos de ejemplo mientras no hay backend. */

/** Información de un vino identificado por el escaneo. */
export type VinoIdentificado = {
  nombre: string;
  bodega: string;
  varietal: string;
  anio: number;
  region: string;
  imagen?: ImageSource | number;
};

/** Vino guardado en Mi Cava: rating y nota son personales y privados. */
export type VinoGuardado = VinoIdentificado & {
  id: string;
  /** De 1 a 5 estrellas. */
  rating: number;
  nota: string;
};

export const cavaInicial: VinoGuardado[] = [
  {
    id: 'malbec-argentino-2019',
    nombre: 'Malbec Argentino',
    bodega: 'Catena Zapata',
    varietal: 'Malbec',
    anio: 2019,
    region: 'Luján de Cuyo',
    rating: 5,
    nota: 'Espectacular balance de frutos negros y violetas. Madera perfectamente integrada.',
  },
  {
    id: 'concreto-malbec-2021',
    nombre: 'Concreto Malbec',
    bodega: 'Familia Zuccardi',
    varietal: 'Malbec',
    anio: 2021,
    region: 'Valle de Uco',
    rating: 4,
    nota: 'Muy fresco, mineral con notas florales. Expresión pura de la tiza y caliza.',
  },
  {
    id: 'el-enemigo-cabernet-franc-2018',
    nombre: 'El Enemigo Cabernet Franc',
    bodega: 'Aleanna',
    varietal: 'Cabernet Franc',
    anio: 2018,
    region: 'Valle de Uco',
    rating: 5,
    nota: 'Excelente Cabernet Franc de altura. Notas de pimiento asado y final persistente.',
  },
];

/**
 * Resultado simulado del escaneo. Cuando exista el servicio de identificación
 * (ver wiki/04-apis-e-integraciones.md), se reemplaza por su respuesta.
 */
export const vinoEscaneadoDemo: VinoIdentificado = {
  nombre: 'Catena Zapata Malbec',
  bodega: 'Bodega Catena Zapata',
  varietal: 'Malbec',
  anio: 2021,
  region: 'Luján de Cuyo',
};
