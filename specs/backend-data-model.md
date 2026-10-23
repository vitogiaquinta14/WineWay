# SPEC — Modelo de datos y backend de WineWay

**Estado:** decisiones de producto acordadas; listas para implementar siguiendo [el plan](backend-implementation-plan.md). Se usarán ratings de demostración precargados, identificados como tales. Schema, migración, seed, API e integración con Expo implementados; resultados y límites de comprobación en el plan y `backend/README.md`.

## 1. Objetivo y arquitectura

Persistir el catálogo y los datos de cada usuario con responsabilidades simples, siguiendo la práctica de la materia:

```text
Expo → HTTP → Express (rutas, validación y autorización)
    → Prisma (modelo y operaciones tipadas) → SQLite (persistencia)
```

La app no consulta SQLite directamente. Esta etapa contempla cuenta con email/contraseña, catálogo precargado, reseñas, favoritos, cava, carga manual de vinos privados y persistencia de rutas. La lectura de códigos busca únicamente en el catálogo propio.

Se postergan el algoritmo de generación de rutas, Google Login, recuperación de contraseña, Calendar, subida de fotos y consultas externas de productos. Las reservas, cupos, pagos y disponibilidad en tiempo real quedan fuera del MVP. Se conserva la generación como flujo previsto: la BD debe poder guardar su resultado completo cuando se implemente el algoritmo.

## 2. Catálogo compartido

| Entidad | Datos principales | Relaciones y restricciones |
|---|---|---|
| `Bodega` | nombre, descripción, dirección, localidad, zona, coordenadas, web, tipo de bodega, características de arquitectura/paisaje, activa, referencias de fotos, rating de demostración opcional | Tiene experiencias y vinos. Se conserva aunque deje de operar. El rating precargado es propio de la demostración, sin atribuirlo a Google. |
| `TipoExperiencia` | nombre único, indicador de gastronomía | Catálogo ampliable mediante carga de datos. Ejemplos: cata, visita y cata, almuerzo, almuerzo y visita. Un tipo clasifica muchas experiencias. |
| `Experiencia` | bodega, tipo, nombre, descripción, precio por persona en ARS, duración en minutos, activa | Pertenece a una bodega y a un tipo; tiene reglas de horario. Es la fuente del precio de las visitas. |
| `HorarioExperiencia` | experiencia, día de semana, tipo `FIJO`/`FLEXIBLE`, desde, hasta | Una experiencia tiene varias reglas. No se repite una combinación idéntica de experiencia, día, tipo y horas. |
| `Vino` | bodega, nombre, descripción, precio en ARS, código de barras textual, tipo de vino, perfil/intensidad cuando corresponda, referencia de foto opcional | Es la ficha compartida del producto. Su código se asocia a ese producto, no a una botella individual ni a la añada personal. No incluye puntajes externos de 100 puntos. |
| `Cepa` | nombre único | Se relaciona con muchos vinos. |
| `VinoCepa` | vino, cepa, porcentaje opcional entero (1–100) | Relación N:M; combinación vino–cepa única. Un vino del catálogo debe tener al menos una cepa. El porcentaje se expone en la API y queda nulo si la composición no está verificada. |

La clasificación permite filtros por zona, distancia, precio, rating disponible, tipo de bodega, tipo de experiencia, gastronomía, tipo de vino y cepas. La distancia se calcula respecto del punto de consulta; no es un dato fijo de la bodega. La gastronomía surge de datos explícitos del tipo de experiencia, sin buscar palabras en la descripción.

El precio orientativo de una bodega es el promedio de los precios por persona de sus experiencias activas. Si no tiene experiencias activas con precio, se informa que no hay precio disponible.

El equipo mantiene el catálogo mediante archivos de carga/importación. En esta fase no hay edición pública del catálogo ni administración mediante usuarios de la app. Los códigos se obtienen de productos/bodegas y se verifican durante la carga; no se deducen del nombre del vino.

### Horarios

- Cada regla corresponde a un día de la semana; no se necesita una tabla de días.
- `FIJO`: `desde = hasta` representa una hora de inicio exacta. La duración se obtiene de la experiencia al planificar.
- `FLEXIBLE`: se admite un inicio dentro de la franja siempre que `inicio + duración <= hasta`.
- Las reglas son semanales, en hora local de Mendoza y dentro del mismo día. Excepciones por fecha/feriados y temporadas quedan para después.
- Los horarios permiten planificar; no confirman que haya una reserva o un cupo disponible.

## 3. Usuarios y acceso

`Usuario` guarda nombre, apellido, email único, username único, hash de contraseña, fecha de nacimiento, apodo opcional y referencia de foto opcional. Nombre, apellido, email, username, contraseña y fecha de nacimiento son obligatorios al registrarse.

- Se exige tener 18 años cumplidos al registrarse; se calcula desde la fecha de nacimiento, no con una edad guardada.
- El username se guarda siempre en minúsculas y se compara normalizado para evitar duplicados por mayúsculas. Email y username se limpian de espacios exteriores; el email se normaliza para su comparación.
- Contraseña: al menos ocho caracteres, una mayúscula, un número y un símbolo. Se guarda únicamente un hash con un mecanismo específico para contraseñas y su salt; el servidor verifica la contraseña recibida al iniciar sesión.
- Confirmar contraseña es una validación del registro; no es un campo de la BD.
- El acceso inicial es con email y contraseña. Google Login y recuperación se postergan.
- La sesión debe poder caducar y revocarse al cerrar sesión o borrar la cuenta. Detalle técnico propuesto: `Sesion` ligada al usuario, con hash del token y vencimiento; no almacenar el token de acceso en texto plano en la BD.
- Cada usuario solo consulta o modifica sus rutas, entradas de cava y vinos manuales. Solo modifica sus propios favoritos y reseñas.

La exploración del catálogo y la lectura de reseñas son públicas. Guardar datos personales y publicar reseñas requieren autenticación.

## 4. Reseñas, favoritos y ratings

| Entidad | Datos principales | Reglas |
|---|---|---|
| `ReseñaBodega` | usuario, bodega, valoración de 1 a 5, comentario opcional, fechas de creación/edición | Una reseña por usuario y bodega, editable y eliminable. Cualquier usuario registrado puede reseñar; no se exige una visita previa guardada. |
| `BodegaFavorita` | usuario, bodega, fecha de agregado | Una combinación usuario–bodega única. |

La subida de fotos de reseñas se posterga. Cuando se incorpore, podrá añadirse una relación de fotos con referencias a archivos; no hace falta crear todavía una tabla sin uso en esta fase.

**Decisión final sobre ratings:** el catálogo tendrá un `ratingDemostracion` opcional entre 0 y 5, precargado por el equipo y fijo en esta etapa. Es un dato de ejemplo, no una copia de Google Maps. La API identifica su fuente como `DEMOSTRACION` y la interfaz debe aclararlo. Si falta, se informa que no hay valoración disponible; no se interpreta como cero.

Las reseñas reales de WineWay permiten calcular por separado su promedio y cantidad de valoraciones. Crear, editar o borrar una reseña no modifica el rating de demostración. La política futura para destacar o reemplazar ese rating queda para después; no se mezclan ambos promedios.

Esta fase no realiza consultas de ratings a Google, no requiere facturación ni credenciales de Places y no necesita almacenar un identificador Google Place. Una futura integración requerirá revisar sus condiciones y costos antes de incorporarla.

## 5. Mi Cava y vinos fuera del catálogo

| Entidad | Datos principales | Relaciones |
|---|---|---|
| `VinoFueraDeCatalogo` | usuario propietario, nombre, nombre de bodega como texto opcional, descripción opcional, precio opcional en ARS, cepas/tipo como datos personales opcionales, código escaneado opcional | Ficha privada creada manualmente. No pertenece a una Bodega del catálogo ni crea relaciones públicas con bodegas. Puede usarse en varias entradas de cava de su dueño. |
| `VinoEnCava` | usuario, vino del catálogo opcional, vino fuera del catálogo opcional, añada opcional, valoración privada opcional, nota privada opcional, fecha de agregado | Cada entrada apunta exactamente a uno de los dos tipos de vino. Se permiten entradas repetidas del mismo producto y añada. |

Relaciones:

```text
Usuario 1:N VinoEnCava N:1 Vino
Usuario 1:N VinoFueraDeCatalogo 1:N VinoEnCava
```

Las dos referencias alternativas de `VinoEnCava` son excluyentes: una entrada no puede apuntar a ambos vinos ni quedar sin ninguno. Si apunta a un vino manual, ese vino debe pertenecer al mismo usuario que la entrada. Esta regla se valida junto con la autorización y se protege con restricciones de la BD donde corresponda.

- Se pueden guardar varias degustaciones del mismo vino y añada, cada una con su valoración y nota independientes; no hay unicidad por usuario–vino–añada.
- Añada, valoración y nota son opcionales. Si hay valoración, es un entero de 1 a 5; omitirla no significa puntuar con cero.
- La añada se ingresa manualmente y vive en la entrada de cava. El escáner no la determina y la ficha pública no se duplica por año.
- Para crear un vino manual se exige como mínimo su nombre; los demás datos descriptivos pueden completarse después. No es necesario conocer una bodega o cepa existente en el catálogo.
- El código de un vino manual es un dato privado opcional, no un identificador único del catálogo global. No puede usarse para exponer entradas de otros usuarios.
- Crear el vino manual y su primera entrada en cava es una operación atómica: se guardan ambos o ninguno.
- La carga manual no incorpora el producto al catálogo ni lo agrega a la ficha pública de una bodega.

### Flujo del escáner

1. La cámara lee un código de barras y devuelve su valor textual.
2. Expo lo envía a Express, que valida y consulta el catálogo mediante Prisma.
3. Si existe el producto, se muestra su ficha y se puede guardar una entrada de cava.
4. Si no existe, se informa el resultado y se ofrece cargar datos manualmente para crear un vino privado y guardarlo en cava.
5. No se consulta un proveedor externo ni se necesita IA en este flujo.

## 6. Rutas y visitas

| Entidad | Datos principales | Reglas |
|---|---|---|
| `Ruta` | usuario, nombre, descripción opcional, fecha de inicio, cantidad de días, cantidad de personas, presupuesto por persona para todo el viaje, parámetros/preferencias de generación | Un usuario tiene muchas rutas; una ruta guardada tiene al menos una visita. Personas es un dato de Ruta y se aplica a todas sus visitas. |
| `Visita` | ruta, experiencia, fecha/hora de inicio obligatorias, nombre de experiencia y duración conservados al planificar, datos de traslado estimados si existen | Pertenece a una experiencia; la bodega se obtiene desde ella. No guarda precio propio. |

- Se ingresa fecha de inicio más cantidad de días. El generador asigna las fechas y horas concretas de las visitas; su algoritmo se implementará después.
- También al agregar o modificar visitas manualmente debe completarse una experiencia, fecha y hora antes de persistirlas. No se guardan visitas sin programar.
- Se consulta el itinerario en orden cronológico; no hace falta un orden independiente que pueda contradecir la fecha/hora. Las vistas agrupan por fecha sin una tabla Día.
- El servidor rechaza fechas/horas incompletas, superposiciones dentro de la misma ruta e inicios nuevos o reprogramados que no respeten los horarios de la experiencia. La viabilidad de los traslados se resolverá con el algoritmo.
- Si se elimina la última visita, se ofrece eliminar la ruta con confirmación. Si se cancela esa confirmación, se conserva la ruta y su última visita. No se persisten rutas vacías.
- Una ruta es histórica cuando todas sus visitas finalizaron; mientras alguna esté en curso o en el futuro es vigente. El estado se deriva de fechas y duraciones conservadas, sin un campo que deba actualizarse diariamente.
- Los parámetros de generación y preferencias se conservan con esa ruta. No actualizan automáticamente las preferencias generales del perfil.
- Se preservan nombre y duración con los que se planificó una visita; una replanificación explícita puede actualizarlos. Las correcciones de disponibilidad del catálogo no reescriben visitas históricas silenciosamente.

### Precios y presupuesto

- La moneda inicial es ARS. Los importes se representan con precisión exacta, por ejemplo centavos enteros; no se calculan dinero ni promedios monetarios mediante acumulaciones imprecisas.
- `Experiencia` guarda el precio base por persona. `Visita` no tiene un precio independiente ni recibe uno confiable desde el frontend.
- El costo estimado de una ruta por persona es la suma de los precios de sus experiencias. Para el grupo se multiplica por `Ruta.cantidadPersonas`.
- El presupuesto ingresado es por persona para todo el viaje. El presupuesto del grupo se obtiene multiplicándolo por la cantidad de personas.
- Incluye experiencias y gastronomía cuando forma parte de ellas. No incluye transporte ni compra de botellas.
- **Aclaración confirmada:** los costos se calculan siempre con el precio vigente de Experiencia, también cuando se consulta una ruta histórica. Una actualización de ese precio modifica los totales estimados mostrados. No se conserva un importe histórico en Visita ni se agregan versiones de Experiencia por precio. Nombre y duración planificados mantienen la regla histórica indicada arriba.

## 7. Baja lógica y borrado

- Bodegas y experiencias pasan a inactivas en lugar de borrarse si tienen referencias. Se excluyen de nuevas planificaciones.
- Una visita futura ya guardada cuya bodega/experiencia queda inactiva se conserva con advertencia; el usuario puede reemplazarla o quitarla. Nunca se elimina o reprograma silenciosamente.
- El catálogo inactivo sigue resolviendo referencias de rutas históricas y vinos guardados. El cierre de una bodega no borra sus vinos de la cava.
- Eliminar una ruta elimina sus visitas. Eliminar una entrada de cava no elimina un vino del catálogo compartido.
- Eliminar la cuenta elimina sus sesiones, rutas/visitas, entradas de cava, vinos manuales privados, favoritos y reseñas. El promedio propio WineWay se recalcula; no se conserva un autor anónimo para esas reseñas.

## 8. Imágenes y trabajo posterior del frontend

SQLite guarda referencias a archivos, no imágenes binarias. Se usan fotos precargadas del catálogo; los campos opcionales de foto de perfil quedan preparados. La subida de fotos de perfil/reseñas y la elección del almacenamiento externo se postergan sin bloquear este modelo.

Pendientes del frontend al implementar estos flujos:

- Agregar fecha de inicio al formulario de rutas y conservar cantidad de días.
- Cambiar USD por ARS en formularios, fichas y totales.
- Mostrar expresamente «Presupuesto por persona para todo el viaje», junto con los totales del grupo cuando corresponda.
- Mostrar el precio de experiencia como «por persona»; los totales se calculan con la cantidad de personas de la ruta.
- Quitar los botones de inicio/registro con Google en esta fase.
- Quitar los puntajes de vinos tipo 94/100 que no tienen fuente definida.
- Identificar los ratings precargados de bodegas como datos de demostración, separados del promedio de reseñas WineWay.
- Incorporar la carga manual de vino privado si el código no está en el catálogo.
- Mostrar la añada opcional por entrada, permitir degustaciones repetidas y permitir omitir valoración/nota.
- Elegir experiencia y ruta de destino al agregar una visita; conservar siempre fecha y hora completas.

## 9. Ejemplos de aceptación

1. No se registra una cuenta menor de 18 años ni una contraseña que incumpla la política acordada.
2. Registrar `VinoFan` guarda `vinofan`; intentar registrar luego `vinofan` se rechaza por duplicado.
3. Un horario fijo a las 09:00 admite ese inicio; una franja flexible 10:00–22:00 para una visita de 90 minutos admite como máximo las 20:30.
4. Guardar una visita sin fecha/hora, fuera del horario de su experiencia o superpuesta a otra de la ruta se rechaza.
5. Una experiencia de ARS 10.000 por persona para tres personas representa ARS 30.000 de costo estimado de grupo; el precio base está en Experiencia.
6. El promedio orientativo de una bodega considera únicamente sus experiencias activas.
7. El mismo vino y añada pueden guardarse dos veces en la cava del mismo usuario, con notas y valoraciones distintas o vacías.
8. Un código desconocido permite crear un vino manual privado y su entrada de cava; ese vino no aparece en el catálogo ni en la ficha pública de una bodega.
9. Una entrada de cava con ambas referencias de vino completas o ambas vacías se rechaza. Tampoco puede apuntar al vino manual de otro usuario.
10. Un usuario sin visitas anteriores puede publicar una valoración de bodega sin comentario. No puede publicar una segunda reseña de esa bodega; sí editar o eliminar la existente.
11. Desactivar una bodega conserva sus referencias y muestra advertencia en visitas futuras ya guardadas.
12. Eliminar la última visita requiere confirmar la eliminación de la ruta; cancelar conserva ambas.
13. Eliminar una cuenta elimina sus reseñas y datos privados, sin borrar el catálogo compartido.
14. Si el precio de una experiencia pasa de ARS 10.000 a ARS 12.000, una visita guardada para tres personas muestra ARS 36.000 de costo estimado al volver a consultarse.
15. El catálogo muestra el rating precargado con fuente de demostración, sin consultar Google. Publicar una reseña modifica únicamente el promedio y la cantidad de reseñas WineWay; no altera ese rating fijo.

## 10. Estado para la siguiente etapa

Las decisiones de producto se implementaron por los hitos de [backend-implementation-plan.md](backend-implementation-plan.md): schema, restricciones y carga de SQLite, seguidos por API e integración. Las etapas de BD, API e integración con Expo ya fueron implementadas; el plan registra las comprobaciones y los pendientes diferidos.

Los detalles de librerías, representación física de campos e índices se resolverán al implementar conforme a estas reglas; no requieren nuevas decisiones de producto salvo que aparezca una incompatibilidad real.

## Relación con la materia

El modelo usa claves foráneas para relaciones 1:N y tablas intermedias para N:M. La cava guarda los atributos de la relación con un vino y admite dos orígenes excluyentes. La autorización protege la propiedad de los vinos privados; las transacciones evitan cargas manuales incompletas. La baja lógica preserva integridad referencial e historial. Los datos conservados de una visita tienen un propósito histórico explícito; los totales y promedios se calculan desde sus fuentes acordadas.
