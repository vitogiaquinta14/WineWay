import { createContext, use, useCallback, type ReactNode } from 'react';
import type { Bodega } from '@/data/bodegas';
import { api } from '@/services/api';
import { useRecurso } from './use-recurso';
type Filtros = {
  zonas: string[];
  tiposBodega: string[];
  caracteristicas: string[];
  tiposVino: string[];
  perfilesVino: string[];
  cepas: { id: string; nombre: string }[];
  tiposExperiencia: { id: string; nombre: string; gastronomia: boolean }[];
};
type Catalogo = {
  bodegas: Bodega[];
  zonas: string[];
  filtros: Filtros | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  getBodega: (id: string) => Bodega | undefined;
};
const Contexto = createContext<Catalogo | null>(null);
export function CatalogoProvider({ children }: { children: ReactNode }) {
  const cargar = useCallback(async () => {
    const [primero, filtros] = await Promise.all([
      api<{ items: Bodega[]; total: number }>('/bodegas?limite=100'),
      api<Filtros>('/catalogo/filtros'),
    ]);
    let items = primero.items;
    for (let pagina = 2; items.length < primero.total; pagina++) {
      const siguiente = await api<{ items: Bodega[] }>(`/bodegas?limite=100&pagina=${pagina}`);
      if (!siguiente.items.length) break;
      items = items.concat(siguiente.items);
    }
    return { bodegas: items, filtros };
  }, []);
  const { datos, error, cargando, recargar } = useRecurso<{
    bodegas: Bodega[];
    filtros: Filtros | null;
  }>(cargar, { bodegas: [], filtros: null });
  const { bodegas, filtros } = datos;
  return (
    <Contexto
      value={{
        bodegas,
        filtros,
        zonas: filtros?.zonas ?? [],
        cargando,
        error,
        recargar,
        getBodega: (id) => bodegas.find((b) => b.id === id),
      }}
    >
      {children}
    </Contexto>
  );
}
export function useCatalogo() {
  const valor = use(Contexto);
  if (!valor) throw new Error('Falta CatalogoProvider');
  return valor;
}
