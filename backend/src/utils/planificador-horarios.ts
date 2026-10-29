import { ALMUERZO_INICIO_ANTES_DE_MIN, MARGEN_DESCANSO_MIN, esAlmuerzo, type Agenda, type BodegaPlan, type Eleccion, type ExperienciaPlan, type ParametrosPlan } from './planificador-tipos.js';

export function distanciaKm(a: Pick<BodegaPlan, 'latitud' | 'longitud'>, b: Pick<BodegaPlan, 'latitud' | 'longitud'>): number {
  const rad = Math.PI / 180;
  const seno = Math.sin((b.latitud - a.latitud) * rad / 2) ** 2 +
    Math.cos(a.latitud * rad) * Math.cos(b.latitud * rad) * Math.sin((b.longitud - a.longitud) * rad / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(seno)));
}
export function trasladoEstimadoMin(a: Pick<BodegaPlan, 'latitud' | 'longitud'>, b: Pick<BodegaPlan, 'latitud' | 'longitud'>) {
  return Math.ceil(distanciaKm(a, b) * 1.3 / 40 * 60) + 10;
}

/** Agenda un orden concreto. No enumera permutaciones ni combinaciones. */
export function crearPlanificadorHorario(p: ParametrosPlan) {
  const desde = p.desdeMin ?? 600;
  const hasta = p.hastaMin ?? 1080;
  const inicio = Date.parse(`${p.fechaInicio}T00:00:00-03:00`);
  const diasSemana = Array.from({ length: p.cantidadDias }, (_, d) => new Date(inicio + d * 86400000).getUTCDay() || 7);
  const cache = new Map<string, { desde: number; hasta: number }[]>();

  function ventanas(e: ExperienciaPlan, dia: number, pausa = false) {
    const clave = `${e.id}/${diasSemana[dia]}/${pausa}`;
    const existente = cache.get(clave);
    if (existente) return existente;
    const resultado: { desde: number; hasta: number }[] = [];
    for (const h of e.horarios) {
      if (h.dia !== diasSemana[dia] || !['FIJO', 'FLEXIBLE'].includes(h.tipo)) continue;
      const minimo = Math.max(desde, h.desde);
      const maximo = Math.min(hasta - e.duracionMin, h.tipo === 'FIJO' ? h.desde : h.hasta - e.duracionMin,
        esAlmuerzo(e) ? ALMUERZO_INICIO_ANTES_DE_MIN - 1 : Infinity);
      if (minimo > maximo) continue;
      if (pausa) {
        const antes = Math.min(maximo, 780 - e.duracionMin);
        if (minimo <= antes) resultado.push({ desde: minimo, hasta: antes });
        const despues = Math.max(minimo, 840);
        if (despues <= maximo) resultado.push({ desde: despues, hasta: maximo });
      } else resultado.push({ desde: minimo, hasta: maximo });
    }
    resultado.sort((a, b) => a.desde - b.desde);
    cache.set(clave, resultado);
    return resultado;
  }

  function horario(elecciones: Eleccion[], dia: number, extra = 0): number[] | null {
    const pausa = !elecciones.some((e) => esAlmuerzo(e.experiencia));
    const minutos: number[] = [];
    for (let i = 0; i < elecciones.length; i++) {
      const e = elecciones[i].experiencia;
      let llegada = desde;
      if (i) {
        const anterior = elecciones[i - 1];
        const fin = minutos[i - 1] + anterior.experiencia.duracionMin;
        const viaje = trasladoEstimadoMin(anterior.bodega, elecciones[i].bodega);
        const partida = pausa && fin < 840 && fin + viaje > 780 ? 840 : fin;
        llegada = partida + viaje + MARGEN_DESCANSO_MIN + extra;
      }
      const ventana = ventanas(e, dia, pausa).find((v) => v.hasta >= llegada);
      if (!ventana) return null;
      minutos.push(Math.max(llegada, ventana.desde));
    }
    return minutos;
  }

  function distribuir(a: Agenda, dia: number): Agenda {
    if (a.elecciones.length < 2) return a;
    let menor = 0;
    let mayor = hasta - desde;
    while (menor < mayor) {
      const medio = Math.ceil((menor + mayor) / 2);
      if (horario(a.elecciones, dia, medio)) menor = medio;
      else mayor = medio - 1;
    }
    return { elecciones: a.elecciones, minutos: horario(a.elecciones, dia, menor)! };
  }
  return { inicio, diasSemana, ventanas, horario, distribuir };
}
