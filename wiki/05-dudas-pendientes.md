# Dudas y decisiones pendientes

Este documento reúne preguntas surgidas al revisar en conjunto:

- `01-idea-y-alcance.md`.
- `02-funcionalidades-mvp.md`.
- `03-pantallas-y-diseno.md`.
- `04-apis-e-integraciones.md`.

Las preguntas no modifican el alcance actual. Su objetivo es hacer visibles las decisiones que todavía deben tomarse antes de cerrar los mockups, la especificación funcional o la implementación.

## Prioridades

- **Alta:** afecta el inventario de pantallas, la navegación o un userflow del MVP.
- **Media:** no impide comenzar los mockups, pero es necesaria para definir comportamientos y estados completos.
- **Técnica:** puede resolverse después del diseño inicial, antes de implementar la función relacionada.

## 1. Alcance y plataformas

### D-01 — Plataformas móviles

- **Prioridad:** Alta.
- **Pregunta:** ¿el MVP se diseñará y desarrollará para Android, iOS o ambas plataformas?
- **Por qué importa:** condiciona variantes de permisos, inicio de sesión, componentes nativos y el SDK de mapas.

### D-02 — Alcance geográfico

- **Prioridad:** Media.
- **Pregunta:** ¿el catálogo del MVP incluirá toda la provincia de Mendoza o solamente determinadas zonas bodegueras?
- **Por qué importa:** define filtros, contenido inicial, cobertura de datos y comunicación del producto.

### D-03 — Idioma

- **Prioridad:** Media.
- **Pregunta:** ¿el MVP estará únicamente en español o debe contemplar otros idiomas desde el diseño inicial?
- **Por qué importa:** afecta textos, espacio de los componentes y configuración.

## 2. Autenticación e invitados

### D-04 — Apple Login

- **Prioridad:** Alta.
- **Pregunta:** ¿Apple Login se incluye en el MVP?
- **Por qué importa:** modifica las pantallas de Registro y Login.

### D-05 — Uso de cámara como invitado

- **Prioridad:** Alta.
- **Pregunta:** ¿un invitado puede escanear e identificar un vino y autenticarse solamente al intentar guardarlo, o debe iniciar sesión antes de abrir la cámara?
- **Por qué importa:** define el userflow de Escanear y el momento de la barrera de autenticación.

### D-06 — Creación de rutas como invitado

- **Prioridad:** Alta.
- **Pregunta:** ¿un invitado puede configurar y generar una ruta antes de autenticarse, requiriendo login únicamente para guardarla, o toda la creación de rutas exige una cuenta?
- **Por qué importa:** afecta la conversión desde Home y el manejo de una ruta temporal.

### D-07 — Recuperación de una acción después del login

- **Prioridad:** Media.
- **Pregunta:** cuando un invitado inicia sesión desde una acción restringida, ¿debe regresar al punto exacto del flujo con sus datos temporales preservados?
- **Por qué importa:** afecta rutas, favoritos, reseñas, Calendar y Mi Cava.

## 3. Home y navegación

### D-08 — “Mi Ruta” o “Mis Rutas”

- **Prioridad:** Alta.
- **Pregunta:** ¿cuál será el nombre definitivo del tercer acceso de la barra inferior: “Mi Ruta” o “Mis Rutas”?
- **Por qué importa:** ambos nombres aparecen en la documentación y pueden implicar destinos diferentes.

### D-09 — Destino del acceso de rutas

- **Prioridad:** Alta.
- **Pregunta:** ¿el acceso de la barra abre la ruta próxima o activa, o abre siempre el listado de rutas guardadas?
- **Por qué importa:** define la navegación principal y el estado cuando existen varias rutas.

### D-10 — Contenido opcional de Home

- **Prioridad:** Alta.
- **Pregunta:** ¿qué bloques se incluirán efectivamente en el MVP: bodegas recomendadas, bodegas destacadas y próximo viaje?
- **Por qué importa:** actualmente están descriptos como opcionales y cambian de forma importante el mockup de Home.

### D-11 — Significado de “recomendadas” y “destacadas”

- **Prioridad:** Media.
- **Pregunta:** ¿qué diferencia existe entre una bodega recomendada y una destacada, y de dónde proviene cada selección?
- **Por qué importa:** evita presentar como personalizada una selección que podría ser editorial.

## 4. Exploración, bodegas y favoritos

### D-12 — Fuente canónica de bodegas

- **Prioridad:** Técnica.
- **Pregunta:** ¿la fuente principal será un catálogo propio, Google Places o una combinación de ambos?
- **Por qué importa:** define cobertura, edición, actualización y vinculación de cada ficha.

### D-13 — Datos mínimos garantizados

- **Prioridad:** Media.
- **Pregunta:** ¿qué información debe estar obligatoriamente disponible para publicar una bodega y qué campos pueden faltar?
- **Por qué importa:** fotografías, horarios, precios, experiencias y vinos destacados pueden no existir para todas las bodegas.

### D-14 — Ratings externos

- **Prioridad:** Alta.
- **Pregunta:** ¿los ratings de Google se mostrarán junto al rating de Bodegueando, identificados por separado, o no se mostrarán en el MVP?
- **Por qué importa:** el producto exige no mezclar ambos promedios, pero no define si se visualizan los dos.

### D-15 — Filtros y unidades

- **Prioridad:** Media.
- **Pregunta:** ¿cómo se expresarán precio y distancia, qué rangos existirán y desde qué punto se calculará la distancia cuando la geolocalización no esté activa?
- **Por qué importa:** permite diseñar controles y resultados consistentes.

### D-16 — Favoritos de vinos y Mi Cava

- **Prioridad:** Alta.
- **Pregunta:** ¿un vino favorito es un concepto distinto de un vino guardado en Mi Cava?
- **Por qué importa:** `04-apis-e-integraciones.md` contempla esta posibilidad, mientras que las pantallas actuales de Favoritos contienen solo bodegas.

## 5. Ratings y reseñas de bodegas

### D-17 — Requisito para publicar

- **Prioridad:** Alta.
- **Pregunta:** ¿cualquier usuario registrado puede reseñar una bodega o debe existir alguna forma de comprobar que la visitó?
- **Por qué importa:** no hay reservas internas en el MVP que puedan verificar la visita.

### D-18 — Cantidad y edición de reseñas

- **Prioridad:** Media.
- **Pregunta:** ¿cada usuario puede publicar una sola reseña por bodega y puede editarla o eliminarla posteriormente?
- **Por qué importa:** define estados de la pantalla y reglas del rating promedio.

### D-19 — Moderación

- **Prioridad:** Media.
- **Pregunta:** ¿cómo se gestionarán comentarios o fotografías inapropiados, falsos o denunciados?
- **Por qué importa:** las reseñas y fotos son contenido público creado por usuarios.

### D-20 — Contenido mínimo de una reseña

- **Prioridad:** Media.
- **Pregunta:** ¿el rating es obligatorio y el comentario opcional, o ambos son obligatorios?
- **Por qué importa:** define validaciones y estados del formulario.

## 6. Creación y gestión de rutas

### D-21 — Fecha o cantidad de días

- **Prioridad:** Alta.
- **Pregunta:** ¿el usuario debe ingresar fechas concretas, una cantidad de días sin fecha, o puede utilizar cualquiera de las dos opciones?
- **Por qué importa:** Calendar necesita fechas y horarios concretos, mientras que una ruta todavía exploratoria podría no tenerlos.

### D-22 — Duración de cada visita

- **Prioridad:** Alta.
- **Pregunta:** ¿de dónde surge la duración estimada de una visita o experiencia?
- **Por qué importa:** se necesita para evitar superposiciones y calcular la hora final de los eventos de Calendar.

### D-23 — Horarios de apertura

- **Prioridad:** Alta.
- **Pregunta:** ¿qué fuente determina los horarios de las bodegas y cómo debe actuar la ruta ante horarios faltantes o posiblemente desactualizados?
- **Por qué importa:** una sugerencia puede resultar inviable aunque el recorrido geográfico sea correcto.

### D-24 — Cálculo del presupuesto

- **Prioridad:** Alta.
- **Pregunta:** ¿qué conceptos incluye el presupuesto estimado: experiencias, gastronomía, transporte u otros? ¿Se calcula por persona o por grupo?
- **Por qué importa:** presupuesto es un criterio central de generación y una cifra visible en las rutas.

### D-25 — Medio de transporte

- **Prioridad:** Alta.
- **Pregunta:** ¿qué modo de traslado debe utilizar Google Routes para calcular distancias y tiempos?
- **Por qué importa:** el itinerario cambia según el medio de transporte y todavía no se define transporte propio, contratado u otra alternativa.

### D-26 — Cantidad de propuestas automáticas

- **Prioridad:** Media.
- **Pregunta:** ¿cuántas alternativas debe intentar generar la aplicación y qué diferencia significativa debe existir entre ellas?
- **Por qué importa:** define el contenido de “Rutas sugeridas” y evita variantes repetidas.

### D-27 — Conflictos del itinerario

- **Prioridad:** Alta.
- **Pregunta:** ¿qué debe hacer la aplicación cuando el usuario cambia un horario u orden y crea una superposición o un traslado imposible?
- **Por qué importa:** afecta la edición, validación y comunicación de errores.

### D-28 — Agregar una bodega manualmente

- **Prioridad:** Alta.
- **Pregunta:** al agregar una bodega desde su detalle, ¿el usuario elige inmediatamente ruta, día y horario, o primero la agrega a una lista sin organizar?
- **Por qué importa:** define el flujo y la interfaz posterior al CTA “Agregar a una ruta”.

### D-29 — Acciones sobre rutas guardadas

- **Prioridad:** Media.
- **Pregunta:** además de consultar y editar, ¿el usuario puede renombrar, eliminar, duplicar o compartir una ruta en el MVP?
- **Por qué importa:** estas acciones no están confirmadas en el alcance actual.

## 7. Google Calendar

### D-30 — Calendario de destino

- **Prioridad:** Media.
- **Pregunta:** ¿los eventos se crean siempre en el calendario principal o el usuario puede elegir otro calendario?
- **Por qué importa:** define el paso de confirmación y el alcance de la autorización.

### D-31 — Sincronización posterior

- **Prioridad:** Alta.
- **Pregunta:** si una ruta cambia después de exportarla, ¿Bodegueando debe actualizar los eventos existentes o crear nuevos?
- **Por qué importa:** sin una regla pueden aparecer eventos duplicados o desactualizados.

### D-32 — Eliminación de eventos

- **Prioridad:** Media.
- **Pregunta:** si el usuario elimina una ruta o desconecta Calendar, ¿qué ocurre con los eventos ya creados?
- **Por qué importa:** determina las expectativas y advertencias de la interfaz.

### D-33 — Sincronización parcial

- **Prioridad:** Media.
- **Pregunta:** ¿cómo se comunica y recupera un resultado en el que solo algunas visitas se agregaron correctamente?
- **Por qué importa:** la pantalla actual contempla éxito y error, pero no éxito parcial.

## 8. Cámara, identificación y Mi Cava

### D-34 — Fuente detallada de vinos

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué fuente validará y completará los datos detectados por Gemini?
- **Por qué importa:** la IA se define como herramienta de identificación, no como fuente definitiva.

### D-35 — Confianza de la identificación

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué criterio determina si se muestra un resultado, varias coincidencias posibles o “Vino no identificado”?
- **Por qué importa:** afecta la confiabilidad del resultado y los estados de interfaz.

### D-36 — Corrección del resultado

- **Prioridad:** Alta.
- **Pregunta:** ¿el usuario puede corregir los datos identificados antes de guardar el vino?
- **Por qué importa:** el análisis visual puede devolver información incompleta o incorrecta.

### D-37 — Búsqueda manual

- **Prioridad:** Alta.
- **Pregunta:** ¿qué campos admite la búsqueda manual y cuál es su fuente de resultados?
- **Por qué importa:** existe como salida del error de identificación, pero su experiencia todavía no está definida.

### D-38 — Rating y nota al guardar

- **Prioridad:** Alta.
- **Pregunta:** ¿el rating y la nota personal son opcionales al agregar un vino a Mi Cava?
- **Por qué importa:** el texto dice que el usuario “puede” agregarlos, pero la pantalla debe definir validaciones concretas.

### D-39 — Vinos duplicados

- **Prioridad:** Media.
- **Pregunta:** ¿Mi Cava permite guardar más de una vez el mismo vino y añada, o actualiza el registro existente?
- **Por qué importa:** define el significado de colección y el resultado de escaneos repetidos.

### D-40 — Administración de Mi Cava

- **Prioridad:** Media.
- **Pregunta:** ¿el usuario puede eliminar un vino guardado y qué criterios de búsqueda o filtros estarán disponibles en el MVP?
- **Por qué importa:** la documentación confirma búsqueda y filtros, pero no especifica cuáles ni la eliminación.

### D-41 — Privacidad y conservación de imágenes

- **Prioridad:** Técnica.
- **Pregunta:** ¿las fotografías de etiquetas se conservan, durante cuánto tiempo y qué información se dará al usuario sobre su envío al servicio de IA?
- **Por qué importa:** afecta privacidad, almacenamiento y consentimiento.

## 9. Perfil, preferencias y notificaciones

### D-42 — Datos editables del perfil

- **Prioridad:** Alta.
- **Pregunta:** ¿qué datos personales y preferencias exactas puede consultar y editar el usuario?
- **Por qué importa:** las pantallas Perfil y Editar perfil todavía no tienen campos definidos.

### D-43 — Persistencia de preferencias

- **Prioridad:** Media.
- **Pregunta:** ¿las preferencias indicadas al crear una ruta actualizan el perfil, se aplican solo a esa ruta o el usuario elige qué hacer?
- **Por qué importa:** evita resultados inesperados en viajes posteriores.

### D-44 — Notificaciones en el MVP

- **Prioridad:** Alta.
- **Pregunta:** ¿las notificaciones forman parte funcional del MVP o debe eliminarse su pantalla del inventario inicial?
- **Por qué importa:** actualmente existe una pantalla, pero no hay eventos, canales ni preferencias definidos.

### D-45 — Tipos de notificación

- **Prioridad:** Media.
- **Pregunta:** si se incluyen, ¿qué notificaciones enviará la aplicación y qué opciones podrá configurar el usuario?
- **Por qué importa:** define permisos, estados, textos y posibles servicios externos.

## 10. Permisos, conectividad y estados

### D-46 — Momento de solicitar permisos

- **Prioridad:** Alta.
- **Pregunta:** ¿los permisos se solicitan durante el primer uso o de forma contextual al abrir Cámara, Mapa o una función basada en ubicación?
- **Por qué importa:** la pantalla 7 propone permisos iniciales, mientras que los flujos también contemplan solicitudes al usar cada función.

### D-47 — Geolocalización en el MVP

- **Prioridad:** Alta.
- **Pregunta:** ¿se confirma la geolocalización o se excluye del MVP inicial?
- **Por qué importa:** actualmente figura como opcional, pero afecta permisos, distancia, mapa y bodegas cercanas.

### D-48 — Comportamiento sin conexión

- **Prioridad:** Media.
- **Pregunta:** ¿“Sin conexión” será solamente un mensaje de error o se espera que rutas guardadas y Mi Cava puedan consultarse sin internet?
- **Por qué importa:** un estado visual no implica por sí mismo soporte offline.

## 11. Diseño y contenido

### D-49 — Identidad disponible

- **Prioridad:** Alta.
- **Pregunta:** ¿ya existen logo, variantes, fotografías, íconos o lineamientos de marca que deban utilizarse en Figma?
- **Por qué importa:** la paleta está propuesta, pero los activos visuales todavía no están documentados.

### D-50 — Tipografías

- **Prioridad:** Media.
- **Pregunta:** ¿hay restricciones de licencia o preferencias para seleccionar las familias tipográficas definitivas?
- **Por qué importa:** la documentación solo define categorías tipográficas.

### D-51 — Accesibilidad

- **Prioridad:** Media.
- **Pregunta:** ¿qué nivel o estándar de accesibilidad debe tomarse como objetivo para contraste, tamaño de texto, foco y contenido alternativo?
- **Por qué importa:** condiciona el sistema visual y los componentes desde el comienzo.

## 12. Decisiones técnicas generales

### D-52 — Framework y arquitectura móvil

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué framework y enfoque de arquitectura se utilizarán para la aplicación móvil?

### D-53 — Backend y persistencia

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué backend, base de datos y almacenamiento de imágenes se utilizarán?

### D-54 — Autenticación

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué proveedor implementará cuentas, sesiones, recuperación y login social?

### D-55 — Recomendaciones

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué estrategia exacta combinará preferencias, rating, presupuesto, horarios, ubicación y tiempos para generar rutas?

### D-56 — Datos de Google Places

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué campos externos se consultarán bajo demanda, cuáles podrán conservarse y cómo se cumplirán las reglas de actualización y atribución?

### D-57 — Costos y límites de servicios

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué presupuesto operativo y límites de uso se aceptarán para Maps, Routes, Places, Calendar y Gemini?

### D-58 — Privacidad y documentos legales

- **Prioridad:** Técnica.
- **Pregunta:** ¿qué requisitos de privacidad, consentimiento, términos de uso y eliminación de cuenta deben contemplarse para datos personales, ubicación, fotografías y servicios externos?

## Orden sugerido de resolución

Para avanzar con los mockups sin definir todavía la arquitectura, conviene resolver primero:

1. Plataformas e inicio de sesión: D-01 y D-04 a D-07.
2. Home y navegación: D-08 a D-11.
3. Favoritos, ratings y reseñas: D-14 y D-16 a D-20.
4. Reglas de rutas: D-21 a D-29.
5. Calendar: D-30 a D-33.
6. Identificación y Mi Cava: D-36 a D-40.
7. Perfil, permisos y notificaciones: D-42 a D-48.
8. Identidad visual: D-49 a D-51.

Las decisiones técnicas D-12, D-34, D-35 y D-41, junto con D-52 a D-58, pueden resolverse durante la definición de arquitectura, siempre que no bloqueen los estados visuales del MVP.
