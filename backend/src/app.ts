import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import type { DB } from './prisma.js';
import { ErrorHTTP } from './utils/http.js';
import { rutasAuth } from './routes/auth.js';
import { rutasCatalogo } from './routes/catalogo.js';
import { rutasPersonales } from './routes/personales.js';
import { rutasItinerarios } from './routes/rutas.js';
import { rutasCalendarios } from './routes/calendarios.js';
export function crearApp(db: DB) {
  const app = express();
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: (origen, cb) =>
        cb(
          null,
          !origen ||
            (process.env.CORS_ORIGINS ?? 'http://localhost:8081,http://localhost:19006')
              .split(',')
              .includes(origen),
        ),
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', rutasAuth(db), rutasCatalogo(db), rutasPersonales(db));
  app.use('/api/rutas', rutasItinerarios(db));
  app.use('/api', rutasCalendarios(db));
  app.use((_req, res) =>
    res.status(404).json({ error: { codigo: 'NO_ENCONTRADO', mensaje: 'Endpoint inexistente.' } }),
  );
  const errores: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const campos: Record<string, string> = {};
      for (const issue of err.issues) {
        const campo = issue.path.join('.');
        if (campo && !campos[campo]) campos[campo] = issue.message;
      }
      res.status(400).json({
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          campos,
        },
      });
      return;
    }
    if (err instanceof ErrorHTTP) {
      res
        .status(err.status)
        .json({ error: { codigo: err.codigo, mensaje: err.message, campos: err.campos } });
      return;
    }
    const codigo = err?.code;
    if (codigo === 'P2002') {
      res.status(409).json({ error: { codigo: 'DUPLICADO', mensaje: 'El registro ya existe.' } });
      return;
    }
    if (codigo === 'P2025') {
      res
        .status(404)
        .json({ error: { codigo: 'NO_ENCONTRADO', mensaje: 'No se encontró el registro.' } });
      return;
    }
    if (codigo === 'P2003' || codigo === 'P2004') {
      res.status(400).json({
        error: {
          codigo: 'INTEGRIDAD',
          mensaje: 'La operación no respeta las relaciones o restricciones.',
        },
      });
      return;
    }
    if (codigo === 'P2034' || codigo === 'P1008') {
      res.status(409).json({
        error: {
          codigo: 'CONFLICTO_CONCURRENTE',
          mensaje: 'Los datos cambiaron. Volvé a intentar.',
        },
      });
      return;
    }
    if (err instanceof SyntaxError && 'body' in err) {
      res
        .status(400)
        .json({ error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo no es JSON válido.' } });
      return;
    }
    console.error('Error de API:', err);
    res
      .status(500)
      .json({ error: { codigo: 'ERROR_INTERNO', mensaje: 'No se pudo completar la operación.' } });
  };
  app.use(errores);
  return app;
}
