import { useCallback, useEffect, useState } from 'react';
/** Lectura inicial cancelable y recarga después de mutaciones. Nunca inventa datos. */
export function useRecurso<T>(cargar: () => Promise<T>, inicial: T) {
  const [datos, setDatos] = useState<T>(inicial);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let vigente = true;
    void cargar()
      .then((datos) => {
        if (vigente) {
          setDatos(datos);
          setError(null);
        }
      })
      .catch((e) => {
        if (vigente) setError((e as Error).message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [cargar]);
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await cargar());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [cargar]);
  return { datos, error, cargando, recargar };
}
