import type { ImageSource } from 'expo-image';

/** Datos de ejemplo mientras no hay backend. */

export const zonas = ['Valle de Uco', 'Luján de Cuyo', 'Maipú'] as const;

export type Zona = (typeof zonas)[number];

export type Experiencia = {
  id: string;
  nombre: string;
  descripcion: string;
  precioUsd: number;
  duracionHoras: number;
};

export type VinoDestacado = {
  id: string;
  nombre: string;
  anio: number;
  puntaje: number;
  imagen?: ImageSource | number;
};

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
  descripcion: string;
  /** Sitio externo para más información o reservas (la app no reserva). */
  sitioWeb: string;
  experiencias: Experiencia[];
  vinos: VinoDestacado[];
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
    descripcion:
      'Inspirada en las pirámides mayas, la bodega de Agrelo es un ícono de la arquitectura del vino. Pionera en el estudio de viñedos de altura, sus Malbec son referencia mundial.',
    sitioWeb: 'https://www.catenawines.com',
    imagen: {
      uri: 'https://winebow-files.s3.amazonaws.com/public/styles/slideshow_new/public/2019-09/P0010270_BodegaCatenaZapata.jpg?VersionId=aorLRVsYysInOXgxgoOacKX2Pmr6IOXu&itok=OruSo1io',
    },
    recomendada: true,
    experiencias: [
      {
        id: 'catena-clasica',
        nombre: 'Visita clásica',
        descripcion: 'Recorrido por la pirámide y la cava, con degustación de 3 vinos.',
        precioUsd: 60,
        duracionHoras: 1.5,
      },
    ],
    vinos: [
      { id: 'catena-malbec-argentino', nombre: 'Catena Zapata Malbec Argentino', anio: 2019, puntaje: 96 },
    ],
  },
  {
    id: 'zuccardi',
    nombre: 'Familia Zuccardi',
    zona: 'Valle de Uco',
    localidad: 'San Carlos',
    rating: 4.9,
    precio: 5,
    experienciaDestacada: 'Premium Tasting & Lunch',
    descripcion:
      'Construida con piedras del propio viñedo en Paraje Altamira, Piedra Infinita integra arquitectura y paisaje. Su filosofía busca expresar el lugar en cada vino.',
    sitioWeb: 'https://www.zuccardiwines.com',
    imagen: {
      uri: 'https://cloudfront-us-east-1.images.arcpublishing.com/elcronista/EJML4CZORZECXIZC3II57FBF3M.jpg',
    },
    recomendada: true,
    experiencias: [
      {
        id: 'zuccardi-piedra-infinita',
        nombre: 'Experiencia Piedra Infinita',
        descripcion: 'Recorrido por la bodega y degustación de vinos de parcela.',
        precioUsd: 55,
        duracionHoras: 2,
      },
      {
        id: 'zuccardi-almuerzo',
        nombre: 'Almuerzo en Piedra Infinita Cocina',
        descripcion: 'Menú de estación con productos locales, maridado con vinos de la bodega.',
        precioUsd: 110,
        duracionHoras: 3,
      },
    ],
    vinos: [{ id: 'zuccardi-concreto', nombre: 'Concreto Malbec', anio: 2021, puntaje: 95 }],
  },
  {
    id: 'salentein',
    nombre: 'Bodega Salentein',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.8,
    precio: 4,
    experienciaDestacada: 'Tasting & Art Gallery',
    descripcion:
      'Ubicada a 1200 metros sobre el nivel del mar, Salentein es pionera en el Valle de Uco. Su arquitectura en forma de cruz alberga una cava subterránea diseñada como templo del vino, donde las barricas descansan bajo acústica clásica.',
    sitioWeb: 'https://www.bodegasalentein.com',
    imagen: {
      uri: 'https://www.tangol.com/Fotos/Tours/cata-de-vinos-en-bodega-salentein_12038_202306051147170.JPG',
    },
    recomendada: true,
    experiencias: [
      {
        id: 'salentein-iconos',
        nombre: 'Cata Íconos de la Consulta',
        descripcion: 'Degustación guiada de 4 vinos Single Vineyard de alta gama con sommelier.',
        precioUsd: 45,
        duracionHoras: 1.5,
      },
      {
        id: 'salentein-almuerzo',
        nombre: 'Almuerzo de Pasos maridado',
        descripcion:
          'Menú degustación de 5 pasos por el chef ejecutivo, maridado con sus mejores cosechas.',
        precioUsd: 95,
        duracionHoras: 3,
      },
    ],
    vinos: [
      { id: 'salentein-single-vineyard', nombre: 'Salentein Single Vineyard', anio: 2020, puntaje: 94 },
      { id: 'salentein-numina', nombre: 'Salentein Numina Gran Corte', anio: 2019, puntaje: 95 },
    ],
  },
  {
    id: 'chandon',
    nombre: 'Chandon Argentina',
    zona: 'Luján de Cuyo',
    localidad: 'Agrelo',
    rating: 4.6,
    precio: 3,
    experienciaDestacada: 'Sparkling Tour & Garden',
    descripcion:
      'Primera bodega de Moët & Chandon fuera de Francia, referente de los espumantes argentinos. Sus jardines invitan a degustar al aire libre frente a la cordillera.',
    sitioWeb: 'https://www.chandon.com.ar',
    imagen: {
      uri: 'https://midias.agazeta.com.br/2023/09/21/816x461/vinicola-chandon-argentina-em-mendoza-1871031.jpg',
    },
    experiencias: [
      {
        id: 'chandon-tour',
        nombre: 'Sparkling Tour',
        descripcion: 'Recorrido por el método de elaboración y degustación de 3 espumantes.',
        precioUsd: 35,
        duracionHoras: 1,
      },
    ],
    vinos: [],
  },
  {
    id: 'andeluna',
    nombre: 'Andeluna Cellars',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.7,
    precio: 4,
    experienciaDestacada: 'Almuerzo de 5 pasos',
    descripcion:
      'Bodega boutique al pie de la cordillera, con vistas abiertas a los viñedos de Gualtallary y una propuesta gastronómica de autor.',
    sitioWeb: 'https://www.andeluna.com.ar',
    imagen: {
      uri: 'https://files-p.pxsol.com/6107/company/library/user/2304672929087049b8bd21236e916f1547936011283.jpg',
    },
    experiencias: [
      {
        id: 'andeluna-almuerzo',
        nombre: 'Almuerzo de 5 pasos',
        descripcion: 'Menú de estación maridado con la línea Pasionado.',
        precioUsd: 90,
        duracionHoras: 3,
      },
    ],
    vinos: [],
  },
  {
    id: 'alfa-crux',
    nombre: 'Bodega Alfa Crux',
    zona: 'Valle de Uco',
    localidad: 'Tupungato',
    rating: 4.7,
    precio: 4,
    experienciaDestacada: 'Cata arquitectónica',
    descripcion:
      'Una bodega que combina diseño contemporáneo y paisaje andino, con recorridos que muestran cómo la arquitectura acompaña la elaboración.',
    sitioWeb: 'https://www.alfacrux.com.ar',
    imagen: {
      uri: 'https://cdn.sanity.io/images/cpvxwd28/production/e3abfdc9364934ee7d54c5c66b25e80af63d8b9a-1600x1035.jpg',
    },
    experiencias: [
      {
        id: 'alfa-crux-cata',
        nombre: 'Cata arquitectónica',
        descripcion: 'Recorrido por los espacios de la bodega y degustación de 4 vinos.',
        precioUsd: 40,
        duracionHoras: 2,
      },
    ],
    vinos: [],
  },
];

export const bodegasRecomendadas = bodegas.filter((bodega) => bodega.recomendada);

export function getBodega(id: string) {
  return bodegas.find((bodega) => bodega.id === id);
}

/** Convierte el rango 1-5 en "$", "$$", ... */
export function formatPrecio(precio: Bodega['precio']) {
  return '$'.repeat(precio);
}
