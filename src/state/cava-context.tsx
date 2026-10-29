import { createContext, use, useCallback, type ReactNode } from 'react';
import {
  identificarVino,
  type VinoAPI,
  type VinoGuardado,
  type VinoIdentificado,
} from '@/data/vinos';
import { api } from '@/services/api';
import { useRecurso } from './use-recurso';
import { useSesion } from './sesion-context';
type Entrada = {
  id: string;
  vino: VinoAPI | null;
  vinoManualId: string | null;
  vinoManual: { nombre: string; bodegaNombre: string | null; cepasTexto: string | null } | null;
  anada: number | null;
  valoracion: number | null;
  nota: string | null;
};
type Cava = {
  vinos: VinoGuardado[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  guardarVino: (
    vino: VinoIdentificado,
    rating: number | null,
    nota: string,
    anada?: number,
  ) => Promise<void>;
  guardarManual: (datos: Record<string, unknown>) => Promise<void>;
  quitarVino: (id: string) => Promise<void>;
  editarEntrada: (id: string, datos: Record<string, unknown>) => Promise<void>;
};
const Contexto = createContext<Cava | null>(null);
export function CavaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const cargar = useCallback(async (): Promise<VinoGuardado[]> => {
    if (!usuario) return [];
    const entradas = await api<Entrada[]>('/cava');
    return entradas.map((e) => ({
      ...(e.vino
        ? identificarVino(e.vino)
        : {
            vinoManualId: e.vinoManualId ?? undefined,
            nombre: e.vinoManual!.nombre,
            bodega: e.vinoManual!.bodegaNombre ?? '',
            varietal: e.vinoManual!.cepasTexto ?? '',
            region: '',
          }),
      id: e.id,
      anio: e.anada,
      rating: e.valoracion,
      nota: e.nota ?? '',
    }));
  }, [usuario]);
  const { datos: vinos, error, cargando, recargar } = useRecurso<VinoGuardado[]>(cargar, []);
  const mutar = async (ruta: string, method: string, body?: unknown) => {
    await api(ruta, { method, body });
    await recargar();
  };
  return (
    <Contexto
      value={{
        vinos,
        error,
        cargando,
        recargar,
        guardarVino: (vino, rating, nota, anada) =>
          mutar('/cava', 'POST', {
            vinoId: vino.vinoId,
            vinoManualId: vino.vinoManualId,
            valoracion: rating,
            nota: nota || null,
            anada,
          }),
        guardarManual: (datos) => mutar('/cava/manual', 'POST', datos),
        quitarVino: (id) => mutar(`/cava/${id}`, 'DELETE'),
        editarEntrada: (id, datos) => mutar(`/cava/${id}`, 'PATCH', datos),
      }}
    >
      {children}
    </Contexto>
  );
}
export function useCava() {
  const valor = use(Contexto);
  if (!valor) throw new Error('Falta CavaProvider');
  return valor;
}
