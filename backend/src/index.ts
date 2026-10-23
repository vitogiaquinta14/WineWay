import 'dotenv/config';
import { crearPrisma } from './prisma.js';
import { crearApp } from './app.js';
const db = crearPrisma();
const puerto = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) throw new Error('PORT inválido.');
const server = crearApp(db).listen(puerto, '0.0.0.0', () =>
  console.log(`WineWay API escuchando en puerto ${puerto}`),
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () =>
    server.close(() => {
      void db.$disconnect().finally(() => process.exit(0));
    }),
  );
