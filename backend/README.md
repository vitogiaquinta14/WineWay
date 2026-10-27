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
- `prisma/data/catalogo.json`: bodegas, experiencias, horarios, vinos, cepas, tipos y ratings **de demostración**. Precios ARS y horarios son ilustrativos, no tarifas verificadas. Los códigos `DEMO-...` son de prueba; reemplazarlos por códigos verificados para reconocer botellas reales. Una coincidencia desconocida ofrece carga manual privada.
- `prisma/seed.ts`: valida ese archivo y lo importa con Prisma, dentro de una transacción. Exige al menos una cepa por vino. Repetir `db:seed` actualiza el catálogo desde el archivo; no borra datos de usuarios. Los registros que se retiran se marcan inactivos en el archivo.
- `db:init`: aplica migraciones, genera cliente y carga catálogo. No usar `db push`: omitiría las restricciones SQL personalizadas.
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
  "parametros": {"preferencias": ["Paisajes"]},
  "visitas": [{"experienciaId": "catena-clasica", "inicio": "2030-01-08T10:00:00-03:00"}]
}
```

Importes: centavos enteros ARS. Fecha/hora de visita: ISO con zona, precisión de minutos; persistida como UTC. Disponibilidad semanal: hora local de Mendoza. Nombre/duración planificados se conservan; costos usan el precio actual de Experiencia, incluso en rutas históricas. La disponibilidad no equivale a una reserva ni a cupos reales. La viabilidad de traslados y generación automática quedan pendientes del algoritmo.

Éxito `200/201/204`; validación `400`, sesión `401`, recurso ausente/ajeno `404`, conflicto `409`, inesperado `500`. Error: `{error:{codigo,mensaje}}`. Quitar la última visita responde `409 ULTIMA_VISITA` sin borrar nada; confirmar en la interfaz elimina la ruta completa.

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

`build` compila el servidor; `npm start --prefix backend` ejecuta los compilados. Inicializar la base antes de arrancar. No hay integración de ratings con Google, IA, reservas, subida de fotos ni algoritmo automático implementados en esta fase.
