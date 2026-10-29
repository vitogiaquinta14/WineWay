import type { Ruta } from '../data/rutas';

function texto(valor: string) {
  return valor.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function fecha(valor: Date) {
  return valor.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/** RFC 5545: líneas de hasta 75 octetos, sin cortar caracteres UTF-8. */
function plegar(linea: string) {
  const partes: string[] = [];
  let parte = '';
  let bytes = 0;
  for (const caracter of linea) {
    const codigo = caracter.codePointAt(0)!;
    const longitud = codigo <= 0x7f ? 1 : codigo <= 0x7ff ? 2 : codigo <= 0xffff ? 3 : 4;
    if (bytes + longitud > 75) {
      partes.push(parte);
      parte = ' ';
      bytes = 1;
    }
    parte += caracter;
    bytes += longitud;
  }
  partes.push(parte);
  return partes.join('\r\n');
}

/** Una copia del itinerario: un evento por visita, con horas absolutas en UTC. */
export function crearCalendario(ruta: Ruta, ahora = new Date()): string {
  if (!ruta.visitas.length) throw new Error('La ruta no tiene visitas para agendar.');
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WineWay//Itinerarios//ES',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${texto(ruta.nombre)}`,
  ];
  for (const visita of ruta.visitas) {
    const inicio = new Date(visita.inicio);
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(visita.duracionMin) || visita.duracionMin <= 0) {
      throw new Error('Una visita tiene una fecha o duración inválida.');
    }
    const fin = new Date(inicio.getTime() + visita.duracionMin * 60_000);
    const descripcion = [
      `Ruta: ${ruta.nombre}`,
      ruta.descripcion,
      `${ruta.cantidadPersonas} personas`,
      'Visita planificada en WineWay. No constituye una reserva.',
    ].filter(Boolean).join('\n');
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(ruta.id)}-${encodeURIComponent(visita.id)}@wineway`,
      `DTSTAMP:${fecha(ahora)}`,
      `DTSTART:${fecha(inicio)}`,
      `DTEND:${fecha(fin)}`,
      `SUMMARY:${texto(`${visita.bodega.nombre} · ${visita.nombreExperiencia}`)}`,
      `LOCATION:${texto([visita.bodega.nombre, visita.bodega.localidad, 'Mendoza'].join(', '))}`,
      `DESCRIPTION:${texto(descripcion)}`,
      'END:VEVENT',
    );
  }
  lineas.push('END:VCALENDAR');
  return `${lineas.map(plegar).join('\r\n')}\r\n`;
}

