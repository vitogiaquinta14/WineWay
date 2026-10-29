# Plan de implementación — Backend WineWay

**Estado:** implementación de BD, API e integración de Expo realizada con TDD. 24 pruebas automatizadas en verde; lint, tipos y compilación del backend correctos. Exportaciones web y Android correctas. Rama: `feature/backend-api`, creada desde `develop` actualizado.

**Fuente de requisitos:** [SPEC del modelo de datos](backend-data-model.md). Este plan organiza cómo implementar las decisiones acordadas; la SPEC define el comportamiento esperado.

## 1. Alcance y orden

El primer entregable es la BD: schema, restricciones, migración y catálogo inicial. Después se implementan las operaciones HTTP y, en una etapa posterior, se conecta Expo. Cada hito se cierra con su documentación breve en `Seguimiento de desarrollo.md`, indicando qué cambió, dónde, por qué y su relación con la materia.

```text
1. Estructura → 2. BD y seed → 3. API de catálogo
    → 4. Cuenta y sesión → 5. Datos personales → 6. Rutas y visitas
    → 7. Integración con Expo
```

Se postergan: algoritmo de generación de rutas, reservas/cupos/pagos, Google Login, recuperación de contraseña, ratings de Google, reconocimiento por IA, búsqueda externa de vinos, Calendar y subida de fotos. La carga manual de vinos privados sí pertenece al alcance inicial.

## 2. Estructura sencilla

```text
backend/
  package.json                 # Dependencias y comandos del servidor
  package-lock.json
  tsconfig.json
  .env.example                 # Configuración de ejemplo sin secretos
  prisma7.config.ts            # Configuración de Prisma 7
  prisma/
    schema.prisma              # Entidades y relaciones
    migrations/                # Historial reproducible de estructura
    seed.ts                    # Carga inicial mediante Prisma
    data/                      # Catálogo mantenido por el equipo
  src/
    index.ts                   # Arranque y puerto
    app.ts                     # Express, JSON, CORS y rutas
    prisma.ts                  # Cliente compartido y adaptador SQLite
    routes/                    # Catálogo, auth, cuenta, cava, reseñas, rutas
    utils/                     # Validaciones y cálculos realmente compartidos
  README.md                    # Cómo instalar, inicializar y ejecutar
```

Los handlers validan, autorizan y usan Prisma. El middleware de sesión está en `routes/auth.ts`; JSON, CORS y errores están en `app.ts`. Las operaciones que requieran transacciones o cálculos compartidos se extraen en funciones pequeñas. Se crean archivos cuando los necesite un hito.

El servidor tendrá sus propias dependencias y configuración de TypeScript/lint. Se excluirá `backend/` del chequeo de Expo para que los tipos de Node y el cliente generado no se compilen como código del teléfono. No se agregan librerías del servidor al paquete móvil.

**Base técnica:** Node compatible con Prisma 7, Express 5 y TypeScript. Prisma CLI, cliente y adaptador SQLite se fijarán en versiones compatibles de la misma línea 7 en el lockfile, usando ESM y generación explícita del cliente. La configuración sigue la [guía oficial de SQLite para Prisma 7](https://www.prisma.io/docs/v7/prisma-orm/quickstart/sqlite); se revisarán sus requisitos al instalar. El entorno actual dispone de Node 22.23.1.

## 3. Hito 1 — Preparar el servidor

- [x] Crear el paquete independiente de `backend/`, su configuración y comandos `dev`, `build`, `lint` y `typecheck`.
- [x] Preparar `DATABASE_URL`, `PORT` y configuración de sesión en `.env.example`; ignorar `.env`, bases SQLite y archivos auxiliares, cliente generado y compilados.
- [x] Configurar Express con JSON, CORS para los clientes previstos y un manejador final de errores.
- [x] Exponer `GET /api/health`: confirma que el servidor responde, sin consultar la BD.
- [x] Documentar que SQLite vive en la máquina del backend y que un teléfono accede a la API mediante la IP de red de esa máquina.

**Cierre:** servidor ejecutable, configuración reproducible y respuesta HTTP de salud. **Materia:** proceso servidor, middleware, request/response y separación de responsabilidades.

## 4. Hito 2 — Construir la base de datos

### Entidades y relaciones

- [x] Catálogo: `Bodega`, `TipoExperiencia`, `Experiencia`, `HorarioExperiencia`, `Vino`, `Cepa`, `VinoCepa` y referencias de fotos precargadas.
- [x] Cuenta: `Usuario` y `Sesion`.
- [x] Datos personales: `ReseñaBodega`, `BodegaFavorita`, `VinoFueraDeCatalogo` y `VinoEnCava`.
- [x] Itinerario: `Ruta` y `Visita`; Visita referencia Experiencia y obtiene Bodega a través de ella.

### Representación y restricciones

| Tema | Implementación prevista |
|---|---|
| Identificadores | IDs internos; claves foráneas explícitas. No usar nombres ni códigos de barras como identidad de todas las relaciones. |
| Dinero | Enteros en centavos ARS, no negativos. Precio por persona en Experiencia; presupuesto por persona para todo el viaje en Ruta. Promedios con redondeo explícito al centavo. |
| Fechas | Nacimiento e inicio de ruta como fechas de calendario `YYYY-MM-DD`, validadas. Inicio de visita y vencimiento de sesión como instantes UTC; interpretar los horarios semanales en `America/Argentina/Mendoza`. |
| Horarios | Día 1–7 y minutos desde medianoche, dentro del mismo día. Fijo: desde = hasta. Flexible: desde < hasta y debe caber la duración. |
| Unicidad | Email/username normalizados, código de barras de catálogo, nombre de cepa/tipo, pares vino–cepa, usuario–bodega en favorito/reseña y reglas de horario idénticas. |
| Cava | Dos FK opcionales con restricción CHECK: exactamente una informada. La referencia al vino manual debe respetar también su propietario. No imponer unicidad por vino/añada. |
| Integridad | Rating de reseña/cava entero 1–5; rating de demostración opcional 0–5; duración, días y personas positivos. Añada opcional validada como año. |
| Historial | Bodega/Experiencia activas; borrado restringido cuando existan referencias. Visita conserva nombre y duración planificados; no almacena precio. |
| Borrado privado | Cascadas explícitas de cuenta a sus datos y de ruta a visitas; nunca al catálogo. Ordenar el borrado de entradas y vinos manuales dentro de una transacción si las FK lo requieren. |
| Consultas | Índices sobre FK y accesos frecuentes: cava por usuario, rutas por usuario y visitas por ruta/fecha. Evitar índices sin una consulta que los justifique. |

Prisma expresa relaciones, unicidad e índices. Las restricciones que no represente su schema, como el CHECK de la cava, se agregan a la migración inicial. La propiedad del vino manual se protege con una FK compuesta si la representación elegida lo permite, además de la autorización del servidor. Se documentará el mecanismo concreto al implementar.

Reglas entre filas —al menos una cepa por vino, una visita por ruta, ausencia de superposiciones— se validan junto con la escritura en una transacción. Las comprobaciones de disponibilidad se aplican a visitas nuevas o reprogramadas; consultar una ruta guardada no revalida ni modifica su historial.

### Inicialización y datos

- [x] Crear la migración inicial y revisar sus restricciones antes de aplicarla.
- [x] Mantener `npm run db:init` como entrada sencilla: aplicar migraciones existentes, generar el cliente y ejecutar el seed explícitamente. Separar el comando de desarrollo que crea nuevas migraciones.
- [x] Evitar alternar `db push` con migraciones: la estructura versionada debe incluir las restricciones manuales. La práctica sincroniza el schema; aquí se amplía con migraciones para conservar esas reglas. Prisma permite [editar una migración antes de aplicarla](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/customizing-migrations). El SQL queda limitado a estructura e integridad; el CRUD usa Prisma.
- [x] Crear un seed idempotente: actualizar/insertar el catálogo sin duplicarlo ni borrar datos personales. Un reinicio destructivo será un comando separado y explícito.
- [x] Incluir casos representativos: horarios fijos 09:00/12:00/16:00 y adicional de fin de semana; otra experiencia flexible 10:00–22:00; vinos con varias cepas; gastronomía; datos inactivos para comprobar referencias.
- [x] Precargar ratings identificados como demostración, sin importar datos de Google ni fabricar reseñas de usuarios.
- [x] Cargar datos necesarios para filtros existentes. Los códigos reales se verifican con botellas o información de las bodegas; cualquier código sintético se identifica como prueba y no se presenta como reconocimiento de un producto real.

**Cierre:** BD inicializable desde cero, catálogo sin duplicados al repetir seed y reglas de integridad documentadas. Este es el primer punto de revisión del modelo antes de avanzar a la API funcional. **Materia:** modelo relacional, cardinalidades, claves, integridad referencial, persistencia y transacciones.

## 5. Hito 3 — API pública de catálogo

- [x] `GET /api/bodegas` y `GET /api/bodegas/:id`: catálogo, experiencias, horarios, fotos y vinos relacionados.
- [x] `GET /api/vinos/:id` y `GET /api/vinos/codigo/:codigo`: ficha y coincidencia exacta por código textual, conservando ceros iniciales. Registrar la ruta por código antes de la ruta genérica por ID.
- [x] Exponer cepas/tipos y filtros documentados, con paginación y orden estable. Distancia se calcula desde coordenadas aportadas, sin persistirla como atributo de Bodega.
- [x] Calcular precio orientativo de bodega desde experiencias activas. Devolver rating de demostración y promedio/cantidad WineWay en campos separados, con fuente explícita.
- [x] Excluir inactivos de nuevos candidatos; permitir resolver referencias guardadas con su estado. Sin endpoints públicos de edición del catálogo.

**Cierre:** datos leídos desde SQLite a través de Prisma; código desconocido devuelve un resultado inequívoco para ofrecer carga manual. **Materia:** GET, parámetros, consultas, relaciones y respuesta JSON.

## 6. Hito 4 — Cuenta, autenticación y autorización

- [x] `POST /api/auth/registro`: validar campos, mayoría de edad y contraseña; normalizar email/username y guardar hash específico para contraseñas con salt.
- [x] `POST /api/auth/login`: verificar hash con email o username y entregar un token opaco aleatorio; almacenar solo su hash y vencimiento en Sesion.
- [x] Middleware de sesión para recursos privados; usuario propietario obtenido de la sesión, nunca confiado al body.
- [x] `POST /api/auth/logout`: revocar la sesión. `GET /api/yo`, `PATCH /api/yo` y `DELETE /api/yo`: consultar/editar campos permitidos y eliminar cuenta con sus datos privados.
- [x] No devolver hashes, tokens persistidos ni datos privados en respuestas públicas. Una sesión vencida o revocada no permite operar.

**Cierre:** autenticación persistente y autorización por propietario en todas las operaciones privadas. **Materia:** validación en servidor, middleware, autenticación, autorización y tratamiento de datos sensibles.

## 7. Hito 5 — Cava, favoritos y reseñas

- [x] `GET/POST /api/cava`, `PATCH/DELETE /api/cava/:id`: entradas del usuario con añada, valoración y nota opcionales; degustaciones repetidas permitidas.
- [x] `POST /api/cava/manual`: crear vino privado y primera entrada en una transacción; posteriores entradas pueden reutilizar ese vino propio. Permitir editar la ficha privada mediante un endpoint autenticado de vinos manuales.
- [x] `GET /api/favoritos`, `PUT/DELETE /api/favoritos/:bodegaId`: agregado idempotente y eliminación del favorito propio.
- [x] `GET /api/bodegas/:id/resenas` público y `PUT/DELETE /api/bodegas/:id/mi-resena` autenticados: crear la reseña única propia y eliminarla. La app no ofrece edición.
- [x] Calcular promedio WineWay desde reseñas existentes; vacío significa sin valoraciones. No alterar el rating de demostración.

**Cierre:** datos privados aislados por usuario y ninguna creación manual a medias. **Materia:** CRUD, relaciones N:M con atributos, autorización, agregaciones y atomicidad.

## 8. Hito 6 — Rutas y visitas persistentes

- [x] `GET/POST /api/rutas`, `GET/PATCH/DELETE /api/rutas/:id`: rutas propias; creación con al menos una visita completa en la misma transacción.
- [x] `POST /api/rutas/:id/visitas`, `PATCH/DELETE /api/rutas/:id/visitas/:visitaId`: validar pertenencia a la ruta y propiedad de esta.
- [x] Comprobar que cada visita cae dentro del período de la ruta, respeta la disponibilidad de la experiencia y no se superpone con otra. Validar el conjunto resultante también al cambiar fechas o duración de la ruta, sin desplazar visitas silenciosamente.
- [x] Validar y escribir en una misma transacción para evitar que dos cambios concurrentes dejen visitas incompatibles. La disponibilidad semanal no representa cupos ni reservas reales.
- [x] Si se intenta borrar la última visita, responder `409 ULTIMA_VISITA`: el frontend ofrece confirmar `DELETE /api/rutas/:id`. Sin confirmación, no cambia nada.
- [x] Orden cronológico, agrupación por día y estado histórico/vigente calculado usando la duración conservada. Mantener visitas afectadas por inactividad con una advertencia.
- [x] Calcular costos con precios actuales de Experiencia, incluso para rutas históricas. Devolver importes por persona y grupo; presupuesto conservado por persona para todo el viaje.
- [x] Guardar los parámetros de generación con la ruta, sin implementar aún el algoritmo ni cambiar preferencias del perfil.

**Cierre:** se puede guardar el itinerario completo, consultarlo tras reiniciar el servidor, editarlo y eliminarlo preservando las invariantes. **Materia:** transacciones, consultas relacionadas, datos derivados e integridad del historial.

## 9. Contrato HTTP común

- JSON; identificadores válidos y campos editables explícitos, sin copiar indiscriminadamente el body a Prisma.
- `200` consulta/edición, `201` creación, `204` borrado sin body; `400` datos inválidos, `401` sesión ausente/inválida, `404` recurso inexistente o ajeno y `409` conflicto de unicidad o estado.
- Error uniforme: `{ error: { codigo, mensaje, campos? } }`. Un error inesperado responde `500` sin exponer detalles internos; se registra en el servidor.
- Traducir errores de Prisma: unicidad a conflicto y registro inexistente a 404. No responder éxito si la operación falló.
- En Express 5, los rechazos de handlers `async` llegan al middleware de errores: seguir su [guía oficial](https://expressjs.com/en/guide/error-handling/).
- Fechas/horas sin ambigüedad y unidades explícitas: centavos ARS, minutos, precio por persona y totales calculados por servidor.

## 10. Integración posterior con Expo

| Ubicación actual | Trabajo previsto |
|---|---|
| `src/data/bodegas.ts`, `vinos.ts` y pantallas de catálogo | Sustituir datos locales por lecturas HTTP; conservar una demostración explícita solo cuando corresponda. |
| `src/state/sesion-context.tsx`, pantallas de auth | Registro completo, sesión real y eliminación de botones Google en esta fase. |
| `src/state/cava-context.tsx`, `src/app/(tabs)/mi-cava.tsx` | Persistencia, carga manual privada y añada/valoración/nota opcionales. |
| `src/state/ruta-context.tsx`, `crear-ruta.tsx`, `mi-ruta.tsx` | Múltiples rutas, fecha de inicio, visitas completas, ARS, totales por grupo y confirmación al borrar la última visita. |
| `src/app/(tabs)/escanear.tsx` | Lectura de código con cámara, búsqueda en catálogo y formulario manual si no hay coincidencia. |
| Cliente HTTP fuera de `src/app/` | URL configurable, sesión, estados de carga/error y recarga de datos después de mutaciones. |

Antes de tocar APIs móviles se consultará la documentación de Expo SDK 57 y sus módulos, según `AGENTS.md`. La interfaz identificará ratings de demostración y retirará puntajes de vinos sin fuente. El generador actual seguirá siendo una referencia de UI; el algoritmo definitivo se trabajará aparte.

## 11. Cierre de cada hito

- [x] Actualizar la checklist y el seguimiento local mientras se trabaja; registrar limitaciones reales.
- [x] Ejecutar lint y typecheck de los paquetes afectados, conforme a `AGENTS.md`.
- [x] Contrastar el resultado con los ejemplos de aceptación de la SPEC; registrar qué se comprobó y qué queda pendiente. La usuaria indicó TDD: las pruebas de reglas/API y cliente HTTP se escribieron antes de sus implementaciones y se ejecutan con cada cambio. No confundir chequeos estáticos con validación de reglas de negocio.
- [x] Documentar los comandos y el recorrido de datos para poder explicarlos en la materia.

Para probar el escaneo con una botella física hará falta al menos un código real verificado en el catálogo. Esto no impide construir la BD ni los endpoints. No quedan preguntas de producto que bloqueen este plan.

## Resultado de ejecución

- Backend en `backend/`, con instalación y contratos documentados en su `README.md`.
- Datos de catálogo y ratings precargados únicamente en `backend/prisma/data/catalogo.json`, importados a SQLite mediante Prisma; no hay fallback de catálogo dentro de Expo.
- Integración: cliente HTTP en `src/services/`, estado en `src/state/`, formularios y pantallas existentes actualizados. Catálogo público y operaciones personales autenticadas.
- Generación automática, Calendar, Google Login/ratings y subida de fotos continúan diferidos según la SPEC. Se puede guardar un itinerario manual completo y luego integrar el resultado del algoritmo en la misma API.
- [ ] Comprobación visual con navegador y escaneo físico en teléfono: no hay navegador ni dispositivo disponibles en esta sesión. La compilación web se comprueba por separado.
