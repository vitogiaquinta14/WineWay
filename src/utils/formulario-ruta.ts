import { hoyMendoza } from './validar-cuenta';

export function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00Z`);
  if (!Number.isFinite(d.getTime()) || !Number.isInteger(dias)) return '';
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
export function limiteRuta(hoy = hoyMendoza()) {
  const d = new Date(`${hoy}T12:00:00Z`);
  const mes = d.getUTCMonth();
  d.setUTCFullYear(d.getUTCFullYear() + 3);
  if (d.getUTCMonth() !== mes) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
}
export function diasEntre(inicio: string, fin: string) {
  return Math.round((Date.parse(`${fin}T12:00:00Z`) - Date.parse(`${inicio}T12:00:00Z`)) / 86400000) + 1;
}
export function validarFormularioRuta(v: { fechaInicio: string; fechaFin: string; personas: string; presupuesto: string; cantidadVisitas: string; cantidadAlmuerzos?: string; automatico: boolean }, hoy = hoyMendoza()) {
  const errores: Record<string, string> = {};
  const maximo = limiteRuta(hoy);
  const fechaValida = (f: string) => /^\d{4}-\d{2}-\d{2}$/.test(f) && sumarDias(f, 0) === f;
  for (const campo of ['fechaInicio', 'fechaFin'] as const) {
    if (!fechaValida(v[campo])) errores[campo] = 'Elegí una fecha válida.';
    else if (v[campo] < hoy) errores[campo] = 'La fecha no puede estar en el pasado.';
    else if (v[campo] > maximo) errores[campo] = 'Podés planificar hasta tres años hacia adelante.';
  }
  if (!errores.fechaInicio && !errores.fechaFin && v.fechaFin < v.fechaInicio) errores.fechaFin = 'El fin debe ser igual o posterior al inicio.';
  const entero = (campo: 'personas' | 'presupuesto' | 'cantidadVisitas', max: number) => {
    const n = Number(v[campo]);
    if (!/^\d+$/.test(v[campo]) || !Number.isSafeInteger(n) || n < 1 || n > max) errores[campo] = `Ingresá un entero entre 1 y ${max}.`;
  };
  if (!errores.fechaInicio && !errores.fechaFin) {
    const duracion = diasEntre(v.fechaInicio, v.fechaFin);
    const limite = v.automatico ? 14 : 365;
    if (duracion > limite) errores.fechaFin = `El viaje puede durar hasta ${limite} días. Elegí una fecha de fin más cercana.`;
  }
  entero('personas', 1000);
  entero('presupuesto', Math.floor(Number.MAX_SAFE_INTEGER / 100));
  if (v.automatico) {
    entero('cantidadVisitas', 12);
    const valor = v.cantidadAlmuerzos ?? '0';
    const almuerzos = Number(valor);
    if (!/^\d+$/.test(valor) || !Number.isSafeInteger(almuerzos) || almuerzos < 0 || almuerzos > 14)
      errores.cantidadAlmuerzos = 'Ingresá un entero entre 0 y 14.';
    else if (!errores.fechaInicio && !errores.fechaFin && almuerzos > diasEntre(v.fechaInicio, v.fechaFin))
      errores.cantidadAlmuerzos = 'Los almuerzos no pueden superar la cantidad de días.';
    else if (!errores.cantidadVisitas && almuerzos > Number(v.cantidadVisitas))
      errores.cantidadAlmuerzos = 'Los almuerzos están incluidos en la cantidad de visitas.';
  }
  return errores;
}
/** Si el fin del día ya no es posterior al nuevo comienzo, lo corre una hora después (tope 23:59). */
export function ajustarFin(desde: string, hasta: string) {
  if (hasta > desde) return hasta;
  const [h, m] = desde.split(':').map(Number);
  const fin = Math.min(h * 60 + m + 60, 23 * 60 + 59);
  return `${String(Math.floor(fin / 60)).padStart(2, '0')}:${String(fin % 60).padStart(2, '0')}`;
}
