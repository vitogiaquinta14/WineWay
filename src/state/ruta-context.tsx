import { createContext, use, useCallback, type ReactNode } from 'react';
import type { Ruta, RutaNueva, RutaGeneradaNueva, VisitaNueva } from '@/data/rutas';
import { api } from '@/services/api';
import { useRecurso } from './use-recurso';
import { useSesion } from './sesion-context';
type Rutas = {
  rutas: Ruta[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  crear: (datos: RutaNueva) => Promise<Ruta>;
  generar: (datos: RutaGeneradaNueva) => Promise<Ruta>;
  editar: (id: string, datos: Record<string, unknown>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  agregarVisita: (rutaId: string, visita: VisitaNueva) => Promise<void>;
  quitarVisita: (rutaId: string, id: string) => Promise<void>;
};
const Contexto = createContext<Rutas | null>(null);
export function RutaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const cargar = useCallback(async () => (usuario ? api<Ruta[]>('/rutas') : []), [usuario]);
  const { datos: rutas, error, cargando, recargar } = useRecurso<Ruta[]>(cargar, []);
  const mutar = async (path: string, method: string, body?: unknown) => {
    await api(path, { method, body });
    await recargar();
  };
  const crear = async (datos: RutaNueva) => {
    const nueva = await api<Ruta>('/rutas', { method: 'POST', body: datos });
    await recargar();
    return nueva;
  };
  const generar = async (datos: RutaGeneradaNueva) => {
    const nueva = await api<Ruta>('/rutas/generar', { method: 'POST', body: datos });
    await recargar();
    return nueva;
  };
  return (
    <Contexto
      value={{
        rutas,
        cargando,
        error,
        recargar,
        crear,
        generar,
        editar: (id, datos) => mutar(`/rutas/${id}`, 'PATCH', datos),
        eliminar: (id) => mutar(`/rutas/${id}`, 'DELETE'),
        agregarVisita: (id, v) => mutar(`/rutas/${id}/visitas`, 'POST', v),
        quitarVisita: (ruta, id) => mutar(`/rutas/${ruta}/visitas/${id}`, 'DELETE'),
      }}
    >
      {children}
    </Contexto>
  );
}
export function useRuta() {
  const valor = use(Contexto);
  if (!valor) throw new Error('Falta RutaProvider');
  return valor;
}
