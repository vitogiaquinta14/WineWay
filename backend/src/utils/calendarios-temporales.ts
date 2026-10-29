import { nuevoToken } from './seguridad.js';

const DURACION_MS = 10 * 60_000;
const MAX_TOTAL = 200;
const MAX_POR_USUARIO = 3;

/** Copias efímeras para abrir en el navegador; no son calendarios por suscripción. */
export function crearAlmacenCalendarios(reloj = Date.now) {
  const archivos = new Map<string, { usuarioId: string; contenido: string; venceEn: number }>();
  const limpiar = () => {
    for (const [clave, archivo] of archivos) {
      if (archivo.venceEn <= reloj()) archivos.delete(clave);
    }
  };
  return {
    guardar(usuarioId: string, contenido: string) {
      limpiar();
      const anteriores = [...archivos].filter(([, archivo]) => archivo.usuarioId === usuarioId);
      while (anteriores.length >= MAX_POR_USUARIO) archivos.delete(anteriores.shift()![0]);
      if (archivos.size >= MAX_TOTAL) archivos.delete(archivos.keys().next().value!);
      const clave = nuevoToken();
      archivos.set(clave, { usuarioId, contenido, venceEn: reloj() + DURACION_MS });
      return clave;
    },
    obtener(clave: string) {
      limpiar();
      return archivos.get(clave)?.contenido ?? null;
    },
  };
}
