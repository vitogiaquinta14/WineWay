/** Selección voraz: disponibilidad → prioridades → cercanía → puntuación → mejora con el presupuesto sobrante.
 * Cada candidata se inserta en una agenda válida; no hay búsqueda recursiva. */
import { crearPlanificadorHorario, distanciaKm, trasladoEstimadoMin } from './planificador-horarios.js';
import { esAlmuerzo, type Agenda, type BodegaPlan, type Exclusion, type ExperienciaPlan, type ParametrosPlan, type VisitaPlan } from './planificador-tipos.js';
export type * from './planificador-tipos.js';
export { ALMUERZO_INICIO_ANTES_DE_MIN, MARGEN_DESCANSO_MIN, esAlmuerzo, puntuacionBodega } from './planificador-tipos.js';
export { distanciaKm, trasladoEstimadoMin } from './planificador-horarios.js';

type Estado = { agendas: Agenda[]; costo: number };
type Colocacion = { estado: Estado; criterio: number[]; cercania: number };
const RADIO_CERCANIA_KM = 20;
export const CANDIDATAS_CERCANAS = 5;
const cantidadVisitas = (e: Estado) => e.agendas.reduce((n, a) => n + a.elecciones.length, 0);
const cantidadAlmuerzos = (e: Estado) => e.agendas.reduce((n, a) => n + a.elecciones.filter((v) => esAlmuerzo(v.experiencia)).length, 0);
const incluye = (e: Estado, id: string) => e.agendas.some((a) => a.elecciones.some((v) => v.bodega.id === id));
const kmDia = (a: Agenda) => a.elecciones.slice(1).reduce((km, e, i) => km + distanciaKm(a.elecciones[i].bodega, e.bodega), 0);
function compararCriterios(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 1e-8) return a[i] - b[i];
  return 0;
}

export function generarItinerario(bodegas: BodegaPlan[], p: ParametrosPlan) {
  const horario = crearPlanificadorHorario(p);
  const favoritas = new Set(p.favoritas ?? []);
  const imprescindibles = new Set(p.imprescindibles ?? []);
  const almuerzosDeseados = p.cantidadAlmuerzos ?? 0;
  const cargaDeseada = Math.ceil(p.cantidadVisitas / p.cantidadDias);
  const prioridad = (b: BodegaPlan) => imprescindibles.has(b.id) ? 0 : favoritas.has(b.id) ? 1 : 2;
  const candidatas = bodegas.map((bodega) => {
    // Filtrado previo: una ventana de la experiencia completa debe caber en algún día.
    const experiencias = bodega.activa === false ? [] : bodega.experiencias.filter((e) => e.activa !== false &&
      horario.diasSemana.some((_, dia) => horario.ventanas(e, dia).length))
      .sort((a, b) => a.precioCentavos - b.precioCentavos || a.duracionMin - b.duracionMin || a.id.localeCompare(b.id));
    // Minutos de inicio posibles en todo el viaje: un turno fijo suma uno; una franja flexible, muchos.
    const flexibilidad = experiencias.reduce((n, e) => n + horario.diasSemana.reduce((m, _, dia) =>
      m + horario.ventanas(e, dia).reduce((k, v) => k + v.hasta - v.desde + 1, 0), 0), 0);
    return { bodega, experiencias, flexibilidad, minimo: Math.min(...experiencias.map((e) => e.precioCentavos)) };
  }).sort((a, b) => prioridad(a.bodega) - prioridad(b.bodega) || (b.bodega.rating ?? -1) - (a.bodega.rating ?? -1) ||
    a.minimo - b.minimo || a.bodega.id.localeCompare(b.bodega.id));
  let estado: Estado = { agendas: Array.from({ length: p.cantidadDias }, () => ({ elecciones: [], minutos: [] })), costo: 0 };

  function ubicar(b: BodegaPlan, experiencias: ExperienciaPlan[], base: Estado): Colocacion | null {
    if (cantidadVisitas(base) >= p.cantidadVisitas) return null;
    // La primera experiencia con inserción factible es la más económica disponible.
    for (const experiencia of experiencias) {
      if (base.costo + experiencia.precioCentavos > p.presupuestoPersonaCentavos) continue;
      if (esAlmuerzo(experiencia) && cantidadAlmuerzos(base) >= almuerzosDeseados) continue;
      let mejor: Colocacion | null = null;
      for (let dia = 0; dia < p.cantidadDias; dia++) {
        const anterior = base.agendas[dia];
        if (esAlmuerzo(experiencia) && anterior.elecciones.some((e) => esAlmuerzo(e.experiencia))) continue;
        for (let posicion = 0; posicion <= anterior.elecciones.length; posicion++) {
          const elecciones = [...anterior.elecciones];
          elecciones.splice(posicion, 0, { bodega: b, experiencia });
          const minutos = horario.horario(elecciones, dia);
          if (!minutos) continue;
          const agenda = { elecciones, minutos };
          const cercania = anterior.elecciones.length ? Math.min(...anterior.elecciones.map((e) => distanciaKm(e.bodega, b))) : 0;
          const grupo = !anterior.elecciones.length ? 1 : cercania <= RADIO_CERCANIA_KM
            ? anterior.elecciones.length < cargaDeseada ? 0 : 2 : 3;
          const criterio = [grupo, Math.max(0, kmDia(agenda) - kmDia(anterior)),
            elecciones.reduce((m, e) => m + e.experiencia.duracionMin, 0), dia, posicion];
          if (!mejor || compararCriterios(criterio, mejor.criterio) < 0) {
            const agendas = [...base.agendas];
            agendas[dia] = agenda;
            mejor = { estado: { agendas, costo: base.costo + experiencia.precioCentavos }, criterio, cercania };
          }
        }
      }
      if (mejor) return mejor;
    }
    return null;
  }

  type Candidata = (typeof candidatas)[number];
  function siguiente(aceptar: (c: Candidata) => boolean, experiencias: (c: Candidata) => ExperienciaPlan[]): Estado | null {
    for (const nivel of [0, 1, 2]) {
      let opciones: { candidata: Candidata; colocacion: Colocacion }[] = [];
      for (const c of candidatas) {
        if (prioridad(c.bodega) !== nivel || !aceptar(c) || incluye(estado, c.bodega.id)) continue;
        const colocacion = ubicar(c.bodega, experiencias(c), estado);
        if (colocacion) opciones.push({ candidata: c, colocacion });
      }
      if (!opciones.length) continue;
      // Las imprescindibles entran todas: primero la que tiene menos horarios posibles.
      if (nivel === 0) {
        const minima = Math.min(...opciones.map((o) => o.candidata.flexibilidad));
        opciones = opciones.filter((o) => o.candidata.flexibilidad === minima);
      }
      // Grupos (criterio[0]): 0 cerca de un día con lugar, 1 día vacío, 2 cerca de
      // un día completo, 3 a más de 20 km. Cada distancia se mide contra las
      // visitas del día de su inserción factible.
      const grupo = (g: number) => opciones.filter((o) => o.colocacion.criterio[0] === g);
      const disponibles = [0, 1, 2].map(grupo).find((g) => g.length) ?? opciones;
      const porPuntuacion = (a: (typeof opciones)[number], b: (typeof opciones)[number]) =>
        (b.candidata.bodega.rating ?? -1) - (a.candidata.bodega.rating ?? -1) ||
        a.colocacion.cercania - b.colocacion.cercania ||
        compararCriterios(a.colocacion.criterio, b.colocacion.criterio) ||
        a.colocacion.estado.costo - b.colocacion.estado.costo || a.candidata.bodega.id.localeCompare(b.candidata.bodega.id);
      const porCercania = (a: (typeof opciones)[number], b: (typeof opciones)[number]) =>
        a.colocacion.cercania - b.colocacion.cercania || porPuntuacion(a, b);
      const tipo = disponibles[0].colocacion.criterio[0];
      // Un día vacío no tiene origen: su primera visita se elige por rating.
      if (tipo === 1) return disponibles.sort(porPuntuacion)[0].colocacion.estado;
      // Más allá de 20 km gana la más cercana.
      if (tipo === 3) return disponibles.sort(porCercania)[0].colocacion.estado;
      // Dentro de 20 km, la mejor puntuada entre las cinco más cercanas.
      return disponibles.sort(porCercania).slice(0, CANDIDATAS_CERCANAS).sort(porPuntuacion)[0].colocacion.estado;
    }
    return null;
  }

  function incluirPrioridades() {
    while (cantidadVisitas(estado) < p.cantidadVisitas) {
      const opcion = siguiente((c) => prioridad(c.bodega) < 2, (c) => c.experiencias);
      if (!opcion) break;
      estado = opcion;
    }
  }
  incluirPrioridades();

  // Cumplir almuerzos manteniendo las bodegas prioritarias ya seleccionadas.
  for (const c of candidatas) {
    if (cantidadAlmuerzos(estado) >= almuerzosDeseados) break;
    const dia = estado.agendas.findIndex((a) => a.elecciones.some((e) => e.bodega.id === c.bodega.id));
    if (dia < 0) continue;
    const anterior = estado.agendas[dia].elecciones.find((e) => e.bodega.id === c.bodega.id)!;
    if (esAlmuerzo(anterior.experiencia)) continue;
    const elecciones = estado.agendas[dia].elecciones.filter((e) => e.bodega.id !== c.bodega.id);
    const agendas = [...estado.agendas];
    agendas[dia] = { elecciones, minutos: horario.horario(elecciones, dia)! };
    const base = { agendas, costo: estado.costo - anterior.experiencia.precioCentavos };
    const opcion = ubicar(c.bodega, c.experiencias.filter(esAlmuerzo), base);
    if (opcion) estado = opcion.estado;
  }
  while (cantidadAlmuerzos(estado) < almuerzosDeseados && cantidadVisitas(estado) < p.cantidadVisitas) {
    const opcion = siguiente(() => true, (c) => c.experiencias.filter(esAlmuerzo));
    if (!opcion) break;
    estado = opcion;
  }
  // Un almuerzo colocado puede liberar un turno que antes cruzaba la pausa libre.
  incluirPrioridades();
  while (cantidadVisitas(estado) < p.cantidadVisitas) {
    const opcion = siguiente(() => true, (c) => c.experiencias.filter((e) => !esAlmuerzo(e)));
    if (!opcion) break;
    estado = opcion;
  }
  // Los motivos de exclusión se explican con el presupuesto anterior a las mejoras.
  const costoSeleccion = estado.costo;

  // Con el presupuesto que sobra, cada bodega sube un escalón a la siguiente
  // experiencia más cara (sin cambiar si es almuerzo), por orden de prioridad,
  // mientras quepa en horario y presupuesto. Se repite hasta que nada mejora.
  for (let mejoro = true; mejoro;) {
    mejoro = false;
    for (const c of candidatas) {
      const dia = estado.agendas.findIndex((a) => a.elecciones.some((e) => e.bodega.id === c.bodega.id));
      if (dia < 0) continue;
      const posicion = estado.agendas[dia].elecciones.findIndex((e) => e.bodega.id === c.bodega.id);
      const actual = estado.agendas[dia].elecciones[posicion].experiencia;
      for (const experiencia of c.experiencias) {
        const costo = estado.costo - actual.precioCentavos + experiencia.precioCentavos;
        if (experiencia.precioCentavos <= actual.precioCentavos || esAlmuerzo(experiencia) !== esAlmuerzo(actual) ||
          costo > p.presupuestoPersonaCentavos) continue;
        const elecciones = estado.agendas[dia].elecciones.map((e, i) => i === posicion ? { bodega: c.bodega, experiencia } : e);
        const minutos = horario.horario(elecciones, dia);
        if (!minutos) continue;
        const agendas = [...estado.agendas];
        agendas[dia] = { elecciones, minutos };
        estado = { agendas, costo };
        mejoro = true;
        break;
      }
    }
  }

  const agendas = estado.agendas.map(horario.distribuir);
  const visitas: VisitaPlan[] = agendas.flatMap((a, dia) => a.elecciones.map((e, i) => ({
    experienciaId: e.experiencia.id,
    inicio: new Date(horario.inicio + dia * 86400000 + a.minutos[i] * 60000).toISOString(),
    trasladoMin: i ? trasladoEstimadoMin(a.elecciones[i - 1].bodega, e.bodega) : null,
  })));
  const noIncluidas: Exclusion[] = candidatas.filter((c) => !incluye(estado, c.bodega.id) && prioridad(c.bodega) < 2).map((c) => {
    let motivo: Exclusion['motivos'][number];
    let mensaje: string;
    const permitidas = c.experiencias.filter((e) => !esAlmuerzo(e) || cantidadAlmuerzos(estado) < almuerzosDeseados);
    if (c.bodega.activa === false || !c.bodega.experiencias.some((e) => e.activa !== false)) {
      motivo = 'INACTIVA'; mensaje = 'La bodega o sus experiencias están inactivas.';
    } else if (!c.bodega.experiencias.some((e) => e.activa !== false && e.horarios.some((h) => horario.diasSemana.includes(h.dia)))) {
      motivo = 'FECHAS'; mensaje = 'No tiene experiencias con horarios en las fechas del viaje.';
    } else if (!c.experiencias.length) {
      motivo = 'FRANJA'; mensaje = 'Ninguna experiencia completa cabe en la franja diaria elegida.';
    } else if (!permitidas.length) {
      motivo = 'ALMUERZOS'; mensaje = 'Sólo ofrece almuerzos disponibles y ya se alcanzó la cantidad de almuerzos elegida.';
    } else if (Math.min(...permitidas.map((e) => e.precioCentavos)) + costoSeleccion > p.presupuestoPersonaCentavos) {
      motivo = 'PRESUPUESTO'; mensaje = c.minimo > p.presupuestoPersonaCentavos
        ? 'Su experiencia más económica supera el presupuesto por persona.'
        : 'El presupuesto restante no alcanza para agregarla a esta propuesta.';
    } else if (visitas.length >= p.cantidadVisitas) {
      motivo = 'CANTIDAD'; mensaje = 'Se alcanzó la cantidad de visitas deseada con las prioridades seleccionadas.';
    } else {
      motivo = 'AGENDA'; mensaje = 'No se pudo insertar en esta propuesta respetando turnos, traslados y descansos.';
    }
    return { bodegaId: c.bodega.id, nombre: c.bodega.nombre, imprescindible: imprescindibles.has(c.bodega.id), motivos: [motivo], mensaje };
  });
  const advertencias: string[] = [];
  if (visitas.length < p.cantidadVisitas) {
    advertencias.push(`Se incluyeron ${visitas.length} de ${p.cantidadVisitas} bodegas deseadas.`);
    const precios = candidatas.map((c) => Math.min(...c.experiencias.filter((e) => almuerzosDeseados > 0 || !esAlmuerzo(e)).map((e) => e.precioCentavos)))
      .filter(Number.isFinite).sort((a, b) => a - b);
    if (precios.length >= p.cantidadVisitas && precios.slice(0, p.cantidadVisitas).reduce((a, b) => a + b, 0) > p.presupuestoPersonaCentavos)
      advertencias.push('El presupuesto por persona no alcanza para la cantidad solicitada, incluso tomando las experiencias más económicas.');
    else advertencias.push('Para sumar más visitas a esta propuesta, revisá el presupuesto restante, las fechas, la franja o la cantidad de almuerzos.');
  }
  const cumpleImprescindibles = [...imprescindibles].every((id) => incluye(estado, id));
  if (!cumpleImprescindibles) advertencias.push('Propuesta parcial: faltan bodegas marcadas como imprescindibles. Revisá los motivos.');
  const almuerzosIncluidos = cantidadAlmuerzos(estado);
  if (almuerzosIncluidos < almuerzosDeseados) advertencias.push(`Se incluyeron ${almuerzosIncluidos} de ${almuerzosDeseados} almuerzos deseados. No se pudo completar la cantidad en esta propuesta con el presupuesto, los horarios y las visitas disponibles.`);
  return { metodo: 'VORAZ' as const, visitas, costoPersonaCentavos: estado.costo,
    distanciaEstimadaKm: Math.round(agendas.reduce((km, a) => km + kmDia(a), 0) * 10) / 10,
    cumpleImprescindibles, cantidadAlmuerzosIncluida: almuerzosIncluidos,
    cumpleAlmuerzos: almuerzosIncluidos === almuerzosDeseados, advertencias, noIncluidas };
}
