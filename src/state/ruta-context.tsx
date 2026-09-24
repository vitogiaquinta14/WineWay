import { createContext, use, useState, type ReactNode } from 'react';

import type { Bodega } from '@/data/bodegas';
import { rutaInicial, type Ruta, type Visita } from '@/data/rutas';

type RutaContextValue = {
  ruta: Ruta;
  tieneBodega: (bodegaId: string) => boolean;
  /** Agrega la bodega al último día, sin horario definido. */
  agregarBodega: (bodega: Bodega) => void;
  quitarBodega: (bodegaId: string) => void;
  quitarVisita: (visitaId: string) => void;
};

const RutaContext = createContext<RutaContextValue | null>(null);

/**
 * Estado compartido de la ruta en memoria: se pierde al cerrar la app.
 * Cuando exista backend, estas funciones pasan a llamar a la API.
 */
export function RutaProvider({ children }: { children: ReactNode }) {
  const [ruta, setRuta] = useState<Ruta>(rutaInicial);

  const tieneBodega = (bodegaId: string) =>
    ruta.dias.some((dia) => dia.visitas.some((visita) => visita.bodegaId === bodegaId));

  const agregarBodega = (bodega: Bodega) => {
    setRuta((actual) => {
      const ultimo = actual.dias.length - 1;
      const experiencia = bodega.experiencias[0];
      return {
        ...actual,
        dias: actual.dias.map((dia, index) =>
          index === ultimo
            ? {
                ...dia,
                visitas: [
                  ...dia.visitas,
                  {
                    id: `${bodega.id}-${Date.now()}`,
                    bodegaId: bodega.id,
                    actividad: experiencia?.nombre ?? bodega.experienciaDestacada,
                    duracionMin: experiencia ? experiencia.duracionHoras * 60 : 90,
                  },
                ],
              }
            : dia,
        ),
      };
    });
  };

  const filtrarVisitas = (conservar: (visita: Visita) => boolean) =>
    setRuta((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) => ({ ...dia, visitas: dia.visitas.filter(conservar) })),
    }));

  const quitarBodega = (bodegaId: string) =>
    filtrarVisitas((visita) => visita.bodegaId !== bodegaId);

  const quitarVisita = (visitaId: string) => filtrarVisitas((visita) => visita.id !== visitaId);

  return (
    <RutaContext value={{ ruta, tieneBodega, agregarBodega, quitarBodega, quitarVisita }}>
      {children}
    </RutaContext>
  );
}

export function useRuta() {
  const context = use(RutaContext);
  if (!context) {
    throw new Error('useRuta debe usarse dentro de <RutaProvider>');
  }
  return context;
}
