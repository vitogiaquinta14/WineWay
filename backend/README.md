# Backend WineWay

Express valida y autoriza las solicitudes HTTP. Prisma realiza el CRUD y SQLite conserva los datos en un archivo del servidor. Expo consume la API; no abre esa SQLite. La [SPEC](../specs/backend-data-model.md) define las reglas y el [plan](../specs/backend-implementation-plan.md) sus etapas.

## Ejecutar

Requiere Node 22.12 o superior compatible con Prisma 7. Desde la raíz:

```bash
npm ci --prefix backend
cp backend/.env.example backend/.env
npm run db:init --prefix backend
npm run dev --prefix backend
```

No reemplazar un `.env` existente. `GET http://localhost:3001/api/health` confirma que Express responde; no verifica la BD.

Para conectar Expo, copiar `.env.example` de la raíz a `.env.local`. En `EXPO_PUBLIC_API_URL` poner `http://IP_LAN_DE_LA_COMPUTADORA:3001/api` si se usa un teléfono, o `http://localhost:3001/api` para web en esa computadora. Teléfono y servidor deben poder comunicarse por red. Reiniciar Expo al cambiar la URL. Si web usa otro origen, añadirlo a `CORS_ORIGINS` en el `.env` del backend y reiniciar el servidor. No poner secretos en variables `EXPO_PUBLIC_`.

```bash
npm start
```

No hay usuarios precargados: crear una cuenta en la pantalla de registro. Se puede explorar el catálogo sin iniciar sesión.

## Ver tablas y registros

```bash
npm run db:studio --prefix backend
```

Abrir `http://localhost:5555` y elegir una tabla para ver sus columnas y registros. Recargar la vista después de guardar datos desde la app. `Usuario`, `VinoEnCava`, `Ruta` y `Visita` muestran los datos personales persistidos; el catálogo precargado está en `Bodega`, `Experiencia`, `HorarioExperiencia`, `Vino` y `Cepa`.

La estructura y relaciones están definidas en `prisma/schema.prisma`. Los datos reales viven en `backend/wineway.db`. La configuración convierte su ruta a URL absoluta para que Studio use ese mismo archivo.

## Base y catálogo

- `prisma/schema.prisma`: entidades y relaciones; `prisma/migrations/`: estructura e integridad.
- `prisma/data/catalogo.json`: bodegas, experiencias, horarios, vinos, cepas, tipos y ratings **de demostración**. Los precios de ANAIA, Alpamanta y Pulenta Estate son estimaciones porque sus sitios no publican tarifas actuales. Alpamanta publica los horarios de cada experiencia; los días de lunes a sábado se verificaron en las guías de Turismo de Luján de Cuyo y Caminos del Vino. Para picnic, naturaleza, arte y bienestar, la duración es una estimación de demostración y está señalada. Los códigos de barras con prefijo `200` son internos de prueba (rango GS1 reservado para uso interno): se pueden escanear con `docs/codigos-de-prueba.html`. Para reconocer botellas reales, reemplazarlos por el EAN impreso en cada botella y poner `codigoDePrueba: false`. Una coincidencia desconocida ofrece carga manual privada.
- `prisma/seed.ts`: valida ese archivo y lo importa con Prisma, dentro de una transacción. Exige al menos una cepa por vino. Repetir `db:seed` actualiza el catálogo desde el archivo; no borra datos de usuarios. Los registros que se retiran se marcan inactivos en el archivo.
- `db:init`: aplica migraciones, genera cliente y carga catálogo. No usar `db push`: omitiría las restricciones SQL personalizadas.
- Para actualizar una SQLite existente con cambios de catálogo, primero traer la versión nueva del repositorio y ejecutar `npm run db:seed --prefix backend` desde la raíz. No hace falta migración si no cambió el schema. El seed actualiza el catálogo sin borrar usuarios ni datos personales.
- `db:migrate`: crear una nueva migración tras modificar el schema. Revisar el SQL y conservar CHECK/FK personalizados cuando SQLite reconstruya tablas; ejecutar las pruebas antes de usarla sobre datos existentes.
- Los CHECK protegen rangos y el origen exclusivo del vino en cava; la FK compuesta protege su propietario. Las reglas entre filas se validan en transacciones del servidor.
- Archivo SQLite, `.env`, cliente generado, compilados y seguimiento local están ignorados. Se versionan schema, migraciones y catálogo.

El SQL escrito a mano se limita a estructura/restricciones. Las consultas y mutaciones de la aplicación usan Prisma.

## API

Base `/api`. Recursos privados: header `Authorization: Bearer TOKEN`. Cada usuario accede solo a sus datos; no se acepta propietario enviado por el cliente.

| Métodos y recurso | Uso |
|---|---|
| `GET /health` | Salud del servidor |
| `GET /bodegas`, `/bodegas/:id` | Catálogo/detalle; lista paginada `{items,total,pagina,limite}` |
| `GET /catalogo/filtros`, `/cepas`, `/tipos-experiencia` | Opciones derivadas del catálogo |
| `GET /vinos/:id`, `/vinos/codigo/:codigo` | Ficha/escaneo por código exacto textual |
| `POST /auth/registro`, `/auth/login`, `/auth/logout` | Registro, sesión y revocación |
| `GET /auth/disponibilidad?username=...&email=...` | Comprueba disponibilidad antes de registrar o editar; acepta uno o ambos datos |
| `GET/PATCH/DELETE /yo` | Cuenta propia y baja con datos privados |
| `GET/POST /cava`, `PATCH/DELETE /cava/:id` | Degustaciones personales, repetibles |
| `POST /cava/manual`, `PATCH /vinos-manuales/:id` | Vino privado con primera entrada atómica y edición |
| `GET /favoritos`, `PUT/DELETE /favoritos/:bodegaId` | Favoritos propios |
| `GET /bodegas/:id/resenas`, `PUT/DELETE /bodegas/:id/mi-resena` | Reseñas públicas y edición de la propia |
| `GET/POST /rutas`, `GET/PATCH/DELETE /rutas/:id` | Múltiples rutas personales |
| `POST /rutas/generar` | Genera y guarda un itinerario con favoritas e imprescindibles |
| `POST /rutas/:id/visitas`, `PATCH/DELETE /rutas/:id/visitas/:visitaId` | Agregar, reprogramar y quitar visitas |

Para iniciar sesión, `POST /auth/login` recibe `{ "identificador": "email o username", "password": "..." }`. Ambos identificadores ignoran mayúsculas; las respuestas de credenciales incorrectas son iguales.

Los errores de validación devuelven `error.campos` con el mensaje por cada entrada, además del mensaje general. El cliente consulta disponibilidad al salir del campo y la API vuelve a comprobar unicidad al guardar para cubrir solicitudes concurrentes.

Filtros de bodegas: `pagina`, `limite` (máximo 100), `busqueda`, `zona`, `tipo`, `tipoExperiencia` (ID), `gastronomia` (`true/false`), `tipoVino`, `cepa` (ID), `perfil`, `caracteristica`, `precioMin`, `precioMax` (centavos), `ratingMin`, `lat`, `lng` y `distanciaMaxKm`. Coordenadas se envían juntas. Precio orientativo: promedio redondeado al centavo de experiencias activas. Rating demo y promedio/cantidad WineWay son campos separados.

Ejemplo de creación de ruta:

```json
{
  "nombre": "Mi recorrido",
  "fechaInicio": "2030-01-08",
  "cantidadDias": 1,
  "cantidadPersonas": 3,
  "presupuestoPersonaCentavos": 20000000,
  "visitas": [{"experienciaId": "catena-clasica", "inicio": "2030-01-08T10:00:00-03:00"}]
}
```

Importes: centavos enteros ARS. Fecha/hora de visita: ISO con zona, precisión de minutos; persistida como UTC. Disponibilidad semanal: hora local de Mendoza. Nombre/duración planificados se conservan; costos usan el precio actual de Experiencia, incluso en rutas históricas. La disponibilidad no equivale a una reserva ni a cupos reales.

`POST /api/rutas/generar` recibe `nombre`, `fechaInicio`, `cantidadDias` (1–14), `cantidadPersonas`, `presupuestoPersonaCentavos`, `cantidadVisitas` (1–12), `cantidadAlmuerzos` (entero, por defecto 0, no mayor que días ni visitas), `imprescindibles` (IDs de bodegas activas del catálogo, opcional), `desdeMin` y `hastaMin` (minutos locales, valores iniciales 600 y 1080). La franja debe ser creciente y la cantidad deseada debe alcanzar para todas las imprescindibles. Las favoritas se consultan desde la sesión en SQLite. Marcar una imprescindible no modifica favoritos.

Requiere sesión y crea una ruta con al menos una visita. Sin visitas responde `422 SIN_VISITAS` sin guardar; una cantidad menor, almuerzos faltantes o imprescindibles faltantes producen una propuesta parcial con explicaciones. `parametros.generacion` conserva `metodo: VORAZ`, cantidades de visitas/almuerzos, `cumpleImprescindibles`, `cumpleAlmuerzos`, advertencias y motivos individuales de favoritas e imprescindibles no incluidas. Es el resumen de la generación original, no se recalcula al editar manualmente. `busquedaCompleta` sólo pertenece a resúmenes históricos del método anterior.

El planificador aplica selección voraz: filtra experiencias disponibles y respeta los grupos imprescindibles, favoritas y demás. Para completar un día toma las cinco candidatas más cercanas a menos de 20 km con inserción factible y elige la mejor puntuada entre ellas, también para almuerzos; si ninguna está a menos de 20 km, gana la más cercana. Primero se completa la carga `ceil(visitas/días)` de los días con lugar, después se abren días vacíos y recién entonces se suma una visita a un día completo. La primera visita del día se elige por puntuación porque no hay origen definido. Las imprescindibles se ubican de la más restringida (menos minutos de inicio posibles) a la más flexible. La puntuación es un promedio bayesiano: el rating de demostración pesa como cinco reseñas y se combina con las reseñas WineWay. Se prueban experiencias económicas y se excluyen las que no caben por precio u horario; al final, con el presupuesto sobrante, cada bodega sube de a un escalón a una experiencia más cara del mismo tipo (almuerzo o no) si sigue cabiendo en horario y presupuesto. Un segundo cálculo distribuye el tiempo libre sin mover turnos fijos. No hay exploración recursiva ni garantía de óptimo global.

Los almuerzos están incluidos en las visitas y el presupuesto, máximo uno por día. Se puede cambiar la experiencia de una bodega prioritaria por un almuerzo si cabe. Los tipos «Almuerzo» y «Visita y almuerzo» cuentan; tapeo no. Se contemplan 30 minutos de margen además del traslado y pausa 13:00–14:00 cuando no hay almuerzo contratado. Los almuerzos empiezan antes de las 15:00, también después de distribuir el tiempo libre. Cada arista usa Haversine; el traslado supone 40 km/h, factor de desvío 1,3 y 10 minutos de acceso. Son estimaciones geográficas, no rutas viales. La selección directa no genera avisos de límite de exploración. Detalles y casos de aceptación: [especificación SDD](../wiki/09-seleccion-voraz-de-rutas.md).

Éxito `200/201/204`; validación `400`, sesión `401`, recurso ausente/ajeno `404`, conflicto `409`, generación sin visitas `422`, inesperado `500`. Error: `{error:{codigo,mensaje}}`. Quitar la última visita responde `409 ULTIMA_VISITA` sin borrar nada; confirmar en la interfaz elimina la ruta completa.

## TDD y comprobaciones

```bash
npm test --prefix backend
npm run lint --prefix backend
npm run typecheck --prefix backend
npm run build --prefix backend
npm run lint
npx --no-install tsc --noEmit
```

Las pruebas usan una SQLite temporal, aplican la migración real y ejercitan la API con Supertest; no modifican la base de desarrollo. Incluyen restricciones de BD, autenticación/propiedad, transacciones, horarios, dinero e historial. Las pruebas del cliente HTTP usan fetch controlado; no sustituyen una prueba visual ni el escaneo en teléfono.

`build` compila el servidor; `npm start --prefix backend` ejecuta los compilados. Inicializar la base antes de arrancar. No hay integración de ratings con Google, IA, reservas ni subida de fotos.
