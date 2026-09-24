/** Datos de ejemplo mientras no hay backend. */

export type Visita = {
  id: string;
  bodegaId: string;
  /** Formato "HH:MM". Sin definir cuando se agrega desde el detalle de bodega. */
  hora?: string;
  actividad: string;
  duracionMin: number;
  /** Minutos en auto desde la visita anterior del mismo día. */
  trasladoMin?: number;
};

export type DiaRuta = {
  id: string;
  titulo: string;
  visitas: Visita[];
};

export type Ruta = {
  id: string;
  nombre: string;
  descripcion: string;
  dias: DiaRuta[];
};

export const rutaInicial: Ruta = {
  id: 'valle-de-uco-nov',
  nombre: 'Fin de semana en Valle de Uco',
  descripcion: 'Organización diaria de visitas en Valle de Uco',
  dias: [
    {
      id: 'dia-1',
      titulo: 'Día 1 - Viernes 14 Nov',
      visitas: [
        {
          id: 'v1',
          bodegaId: 'salentein',
          hora: '10:00',
          actividad: 'Cata guiada clásica',
          duracionMin: 90,
        },
        {
          id: 'v2',
          bodegaId: 'andeluna',
          hora: '13:00',
          actividad: 'Almuerzo de 5 pasos',
          duracionMin: 180,
          trasladoMin: 25,
        },
      ],
    },
    {
      id: 'dia-2',
      titulo: 'Día 2 - Sábado 15 Nov',
      visitas: [
        {
          id: 'v3',
          bodegaId: 'zuccardi',
          hora: '11:00',
          actividad: 'Experiencia Piedra Infinita',
          duracionMin: 120,
        },
        {
          id: 'v4',
          bodegaId: 'alfa-crux',
          hora: '15:30',
          actividad: 'Cata arquitectónica',
          duracionMin: 90,
          trasladoMin: 40,
        },
      ],
    },
  ],
};
