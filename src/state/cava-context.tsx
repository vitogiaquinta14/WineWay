import { createContext, use, useState, type ReactNode } from 'react';

import { cavaInicial, type VinoGuardado, type VinoIdentificado } from '@/data/vinos';

type CavaContextValue = {
  vinos: VinoGuardado[];
  /** Agrega el vino al principio de la colección. */
  guardarVino: (vino: VinoIdentificado, rating: number, nota: string) => void;
};

const CavaContext = createContext<CavaContextValue | null>(null);

/**
 * Colección de Mi Cava en memoria: se pierde al cerrar la app.
 * Cuando exista backend, guardarVino pasa a llamar a la API.
 */
export function CavaProvider({ children }: { children: ReactNode }) {
  const [vinos, setVinos] = useState<VinoGuardado[]>(cavaInicial);

  const guardarVino = (vino: VinoIdentificado, rating: number, nota: string) =>
    setVinos((actual) => [
      { ...vino, id: `${vino.nombre}-${Date.now()}`, rating, nota: nota.trim() },
      ...actual,
    ]);

  return <CavaContext value={{ vinos, guardarVino }}>{children}</CavaContext>;
}

export function useCava() {
  const context = use(CavaContext);
  if (!context) {
    throw new Error('useCava debe usarse dentro de <CavaProvider>');
  }
  return context;
}
