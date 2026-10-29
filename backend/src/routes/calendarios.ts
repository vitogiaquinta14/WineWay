import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../prisma.js';
import { exigirSesion } from './auth.js';
import { ErrorHTTP } from '../utils/http.js';
import { crearAlmacenCalendarios } from '../utils/calendarios-temporales.js';

const datosCalendario = z.object({
  contenido: z.string().max(90_000).refine((contenido) =>
    Buffer.byteLength(contenido, 'utf8') <= 90_000 &&
    contenido.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n') &&
    contenido.endsWith('\r\nEND:VCALENDAR\r\n') &&
    contenido.includes('\r\nBEGIN:VEVENT\r\n') &&
    contenido.includes('\r\nEND:VEVENT\r\n') &&
    !contenido.includes('\0'),
  'El archivo de calendario no es válido o es demasiado grande.'),
}).strict();

export function rutasCalendarios(db: DB) {
  const r = Router();
  const almacen = crearAlmacenCalendarios();
  r.post('/calendarios', exigirSesion(db), (req, res) => {
    const { contenido } = datosCalendario.parse(req.body);
    const clave = almacen.guardar(req.usuarioId, contenido);
    res.set('Cache-Control', 'no-store').status(201).json({ path: `/calendarios/${clave}.ics` });
  });
  // Safari/Calendario no envían la cabecera de sesión de Expo. La clave aleatoria
  // permite leer sólo esta copia durante diez minutos, nunca la cuenta del usuario.
  r.get('/calendarios/:archivo', (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
    const clave = /^([a-f0-9]{64})\.ics$/.exec(req.params.archivo)?.[1];
    const contenido = clave ? almacen.obtener(clave) : null;
    if (!contenido) throw new ErrorHTTP(404, 'CALENDARIO_VENCIDO', 'El enlace venció. Volvé a agendar desde WineWay.');
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="wineway.ics"',
      'X-Content-Type-Options': 'nosniff',
    }).send(contenido);
  });
  return r;
}
