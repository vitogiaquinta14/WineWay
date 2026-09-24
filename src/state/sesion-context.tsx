import { createContext, use, useState, type ReactNode } from 'react';

type SesionContextValue = {
  sesionIniciada: boolean;
  iniciarSesion: () => void;
  cerrarSesion: () => void;
};

const SesionContext = createContext<SesionContextValue | null>(null);

/**
 * Sesión simulada en memoria: al recargar la app se vuelve al login.
 * Cuando exista backend, iniciarSesion/cerrarSesion pasan a usar la API de autenticación.
 */
export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesionIniciada, setSesionIniciada] = useState(false);

  return (
    <SesionContext
      value={{
        sesionIniciada,
        iniciarSesion: () => setSesionIniciada(true),
        cerrarSesion: () => setSesionIniciada(false),
      }}>
      {children}
    </SesionContext>
  );
}

export function useSesion() {
  const context = use(SesionContext);
  if (!context) {
    throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  }
  return context;
}
