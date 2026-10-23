import { createContext, use, useCallback, useState, type ReactNode } from 'react';
import type { Ruta, RutaNueva, VisitaNueva } from '@/data/rutas';
import { api } from '@/services/api';
import { useRecurso } from './use-recurso';
import { useSesion } from './sesion-context';
type Rutas = {
  rutas: Ruta[];
  ruta: Ruta | null;
  seleccionar: (id: string) => void;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  crear: (datos: RutaNueva) => Promise<Ruta>;
  editar: (id: string, datos: Record<string, unknown>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  agregarVisita: (rutaId: string, visita: VisitaNueva) => Promise<void>;
  editarVisita: (rutaId: string, id: string, datos: VisitaNueva) => Promise<void>;
  quitarVisita: (rutaId: string, id: string) => Promise<void>;
};
const Contexto = createContext<Rutas | null>(null);
export function RutaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const [id, setId] = useState<string | null>(null);
  const cargar = useCallback(async () => (usuario ? api<Ruta[]>('/rutas') : []), [usuario]);
  const { datos: rutas, error, cargando, recargar } = useRecurso<Ruta[]>(cargar, []);
  const mutar = async (path: string, method: string, body?: unknown) => {
    await api(path, { method, body });
    await recargar();
  };
  const crear = async (datos: RutaNueva) => {
    const nueva = await api<Ruta>('/rutas', { method: 'POST', body: datos });
    await recargar();
    setId(nueva.id);
    return nueva;
  };
  return (
    <Contexto
      value={{
        rutas,
        ruta: rutas.find((r) => r.id === id) ?? rutas[0] ?? null,
        seleccionar: setId,
        cargando,
        error,
        recargar,
        crear,
        editar: (id, datos) => mutar(`/rutas/${id}`, 'PATCH', datos),
        eliminar: (id) => mutar(`/rutas/${id}`, 'DELETE'),
        agregarVisita: (id, v) => mutar(`/rutas/${id}/visitas`, 'POST', v),
        editarVisita: (ruta, id, v) => mutar(`/rutas/${ruta}/visitas/${id}`, 'PATCH', v),
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
