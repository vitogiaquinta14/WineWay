import { useRef, useState } from 'react';
import { api } from '@/services/api';
import { ErrorAPI } from '@/services/api-core';
import {
  validarCuenta,
  type ValoresCuenta,
  type CampoCuenta,
  type ErroresCuenta,
  type ModoCuenta,
} from '@/utils/validar-cuenta';

export function useFormularioCuenta(
  inicial: ValoresCuenta,
  modo: ModoCuenta,
  originales?: { email: string; username: string },
) {
  const [valores, setValores] = useState(inicial);
  const actual = useRef(inicial);
  const [tocados, setTocados] = useState<Partial<Record<CampoCuenta, boolean>>>({});
  const [intentado, setIntentado] = useState(false);
  const [remotos, setRemotos] = useState<ErroresCuenta>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const secuencia = useRef({ email: 0, username: 0 });
  const locales = validarCuenta(valores, modo);
  const errores: ErroresCuenta = { ...remotos };
  for (const campo of Object.keys(locales) as CampoCuenta[]) {
    if (intentado || tocados[campo]) errores[campo] = locales[campo];
  }
  const cambiar = (campo: CampoCuenta, valor: string) => {
    actual.current = { ...actual.current, [campo]: valor };
    setValores(actual.current);
    setRemotos((prev) => ({ ...prev, [campo]: undefined }));
    setErrorGeneral(null);
  };
  const tocar = async (campo: CampoCuenta) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    if (campo !== 'email' && campo !== 'username') return;
    const valor = actual.current[campo].trim().toLowerCase();
    const numero = ++secuencia.current[campo];
    if (validarCuenta(actual.current, modo)[campo] || valor === originales?.[campo]) return;
    try {
      const resultado = await api<{ campos: ErroresCuenta }>(
        `/auth/disponibilidad?${campo}=${encodeURIComponent(valor)}`,
        { sinSesion: true },
      );
      if (
        numero === secuencia.current[campo] &&
        actual.current[campo].trim().toLowerCase() === valor
      )
        setRemotos((prev) => ({ ...prev, [campo]: resultado.campos[campo] }));
    } catch {
      // El envío sigue validando unicidad en Express aunque falle esta comprobación anticipada.
    }
  };
  const validar = () => {
    setIntentado(true);
    setErrorGeneral(null);
    const valido = Object.keys(validarCuenta(actual.current, modo)).length === 0;
    if (valido) {
      secuencia.current.email++;
      secuencia.current.username++;
    }
    return valido;
  };
  const reportar = (error: unknown) => {
    secuencia.current.email++;
    secuencia.current.username++;
    setIntentado(true);
    if (error instanceof ErrorAPI && Object.keys(error.campos).length) {
      setRemotos(error.campos);
    } else
      setErrorGeneral(
        error instanceof Error ? error.message : 'No se pudo guardar. Volvé a intentar.',
      );
  };
  const reiniciar = (datos: ValoresCuenta) => {
    actual.current = datos;
    setValores(datos);
    setTocados({});
    setIntentado(false);
    setRemotos({});
    setErrorGeneral(null);
    secuencia.current.email++;
    secuencia.current.username++;
  };
  return { valores, errores, errorGeneral, cambiar, tocar, validar, reportar, reiniciar };
}
export type FormularioCuenta = ReturnType<typeof useFormularioCuenta>;
