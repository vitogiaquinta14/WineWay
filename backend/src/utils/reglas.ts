/** Reglas puras compartidas por validación HTTP y planificación. */
export const ZONA_HORARIA = 'America/Argentina/Mendoza';
export function fechaCalendario(valor: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    !Number.isNaN(Date.parse(valor)) &&
    new Date(valor).toISOString().slice(0, 10) === valor
  );
}
export function esMayorDeEdad(nacimiento: string, hoy: string): boolean {
  if (!fechaCalendario(nacimiento) || !fechaCalendario(hoy)) return false;
  const limite = `${Number(hoy.slice(0, 4)) - 18}${hoy.slice(4)}`;
  return nacimiento <= limite;
}
export function fechaLocal(fecha: Date): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha);
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
}
export function minutosLocales(fecha: Date): number {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  return (
    Number(partes.find((p) => p.type === 'hour')!.value) * 60 +
    Number(partes.find((p) => p.type === 'minute')!.value)
  );
}
export function horarioAdmite(
  regla: { tipo: string; desde: number; hasta: number },
  inicio: number,
  duracion: number,
): boolean {
  if (inicio < 0 || inicio + duracion > 1440) return false;
  return regla.tipo === 'FIJO'
    ? inicio === regla.desde
    : regla.tipo === 'FLEXIBLE' && inicio >= regla.desde && inicio + duracion <= regla.hasta;
}
export function validarVisitas(
  visitas: { inicio: Date; duracionMin: number }[],
  fechaInicio: string,
  dias: number,
): void {
  if (!visitas.length) throw new Error('La ruta necesita al menos una visita.');
  const fin = new Date(`${fechaInicio}T00:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() + dias);
  const ultimaFecha = fin.toISOString().slice(0, 10);
  const ordenadas = [...visitas].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  for (let i = 0; i < ordenadas.length; i++) {
    const v = ordenadas[i];
    const fecha = fechaLocal(v.inicio);
    if (fecha < fechaInicio || fecha >= ultimaFecha)
      throw new Error('La visita queda fuera del período de la ruta.');
    if (
      i &&
      ordenadas[i - 1].inicio.getTime() + ordenadas[i - 1].duracionMin * 60000 > v.inicio.getTime()
    )
      throw new Error('Hay visitas superpuestas.');
  }
}
export function totalesRuta(precios: number[], personas: number, presupuesto: number) {
  const costoPersonaCentavos = precios.reduce((a, b) => a + b, 0);
  return {
    costoPersonaCentavos,
    costoGrupoCentavos: costoPersonaCentavos * personas,
    presupuestoGrupoCentavos: presupuesto * personas,
  };
}
