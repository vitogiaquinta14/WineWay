# Funcionalidades del MVP

## 1. Autenticación

### Registro

- **Qué puede hacer el usuario:** crear una cuenta con nombre, email y contraseña. El acceso con Google está contemplado; Apple permanece sujeto a decisión.
- **Información que interviene:** nombre, email, contraseña y proveedor de acceso cuando corresponda.
- **Resultado esperado:** cuenta creada y acceso a las funciones persistentes de la aplicación.

### Login

- **Qué puede hacer el usuario:** iniciar sesión con email y contraseña o con Google. También puede acceder a la recuperación de contraseña.
- **Información que interviene:** credenciales o identidad provista por el acceso social.
- **Resultado esperado:** sesión iniciada y acceso a rutas guardadas, Calendar, reseñas, favoritos y Mi Cava.

### Recuperación de contraseña

- **Qué puede hacer el usuario:** solicitar la recuperación mediante su email.
- **Información que interviene:** email de la cuenta.
- **Resultado esperado:** confirmación de que se inició el proceso de recuperación.

### Navegación como invitado

- **Qué puede hacer el usuario:** explorar bodegas, abrir sus detalles y leer ratings y reseñas públicas.
- **Información que interviene:** contenido público de bodegas.
- **Resultado esperado:** acceso a la exploración sin crear una cuenta.

Cuando el invitado intente guardar información, sincronizar Calendar o publicar contenido, la aplicación debe solicitar autenticación.

## 2. Home

### Accesos principales

- **Qué puede hacer el usuario:** iniciar la creación de una ruta, explorar bodegas, abrir sus rutas, escanear un vino o entrar a Mi Cava.
- **Información que interviene:** accesos principales y, cuando exista, información del próximo viaje.
- **Resultado esperado:** punto de entrada claro a los cinco ejes de navegación.

### Contenido destacado

- **Qué puede hacer el usuario:** consultar bodegas recomendadas o destacadas y retomar un próximo viaje, cuando haya información disponible.
- **Información que interviene:** bodegas y rutas existentes.
- **Resultado esperado:** acceso rápido a contenido relevante sin alterar los flujos principales.

## 3. Exploración de bodegas

### Buscar bodegas

- **Qué puede hacer el usuario:** buscar una bodega por nombre.
- **Información que interviene:** texto ingresado y catálogo de bodegas.
- **Resultado esperado:** resultados coincidentes o un estado sin resultados.

### Explorar en listado y mapa

- **Qué puede hacer el usuario:** alternar entre una lista de bodegas y su distribución geográfica.
- **Información que interviene:** nombre, ubicación y datos resumidos disponibles de cada bodega.
- **Resultado esperado:** descubrimiento de opciones tanto por contenido como por proximidad geográfica.

### Aplicar filtros

- **Qué puede hacer el usuario:** acotar resultados por zona, distancia, precio, rating, tipo de experiencia, gastronomía, tipo de vino o varietal y tipo de bodega.
- **Información que interviene:** criterios seleccionados y datos disponibles de las bodegas.
- **Resultado esperado:** listado y mapa actualizados según los filtros.

**Integraciones relacionadas:** Google Maps para la representación visual y Google Places como posible fuente de búsqueda e información geográfica.

## 4. Detalle de bodega

### Consultar información

- **Qué puede hacer el usuario:** ver nombre, fotografías, descripción, ubicación, mapa, rango de precios, horarios, experiencias, vinos destacados, rating promedio y reseñas.
- **Información que interviene:** ficha pública de la bodega.
- **Resultado esperado:** información suficiente para evaluar la visita.

### Agregar a una ruta

- **Qué puede hacer el usuario:** incorporar la bodega a una ruta manual nueva o existente.
- **Información que interviene:** bodega seleccionada y ruta de destino.
- **Resultado esperado:** bodega incorporada al itinerario para su posterior organización.

### Ir al sitio externo

- **Qué puede hacer el usuario:** abrir el enlace de la bodega para obtener más información o realizar una reserva fuera de Bodegueando.
- **Información que interviene:** enlace externo disponible.
- **Resultado esperado:** salida explícita al canal de la bodega, sin afirmar que Bodegueando realizó una reserva.

## 5. Ratings y reseñas de bodegas

### Consultar reseñas

- **Qué puede hacer el usuario:** leer puntuaciones, comentarios y fotos publicadas por otros usuarios.
- **Información que interviene:** rating promedio y reseñas públicas.
- **Resultado esperado:** valoración comunitaria visible en la bodega y disponible para la generación de rutas.

### Crear una reseña

- **Qué puede hacer el usuario registrado:** puntuar una bodega, escribir un comentario y adjuntar fotos opcionalmente.
- **Información que interviene:** bodega, puntuación, comentario y fotos opcionales.
- **Resultado esperado:** reseña publicada y promedio público actualizado.

## 6. Creación automática de rutas

### Configurar el viaje

- **Qué puede hacer el usuario:** indicar fechas o cantidad de días, personas, presupuesto, zonas, cantidad aproximada de bodegas por día y preferencias de vino o experiencia.
- **Información que interviene:** datos del viaje y preferencias tales como gastronomía, bodegas boutique o grandes, arquitectura, paisajes, degustaciones y variedades de vino.
- **Resultado esperado:** criterios suficientes para solicitar propuestas de itinerario.

### Generar propuestas

- **Qué puede hacer el usuario:** recibir una o varias alternativas y elegir una para revisarla.
- **Información que interviene:** preferencias, ubicación, distancias, traslados estimados, horarios sugeridos, presupuesto aproximado y rating de las bodegas.
- **Resultado esperado:** itinerario distribuido por días y ordenado en visitas sugeridas.

## 7. Creación manual de rutas

### Agregar bodegas durante la exploración

- **Qué puede hacer el usuario:** seleccionar bodegas individualmente y agregarlas a una ruta.
- **Información que interviene:** bodegas elegidas, días disponibles, ubicaciones y tiempos.
- **Resultado esperado:** conjunto inicial de visitas para organizar.

### Solicitar una organización lógica

- **Qué puede hacer el usuario:** obtener una sugerencia de orden según ubicación, tiempos y días disponibles.
- **Información que interviene:** paradas seleccionadas y configuración del viaje.
- **Resultado esperado:** propuesta de distribución que el usuario puede editar.

## 8. Edición de rutas

### Ajustar el itinerario

- **Qué puede hacer el usuario:** mover, eliminar, agregar o reemplazar bodegas y modificar horarios.
- **Información que interviene:** días, paradas, horarios, distancias, traslados y presupuesto estimado.
- **Resultado esperado:** itinerario personalizado antes de guardarlo.

### Consultar el mapa

- **Qué puede hacer el usuario:** visualizar todas las paradas y su orden geográfico.
- **Información que interviene:** ubicación de las bodegas y secuencia de visitas.
- **Resultado esperado:** comprensión espacial de la ruta.

**Integraciones relacionadas:** Google Maps para visualizar el recorrido y Google Routes para aportar distancias, trayectos y tiempos estimados. La selección y recomendación de bodegas pertenece a la lógica de Bodegueando.

## 9. Mis Rutas

### Guardar y consultar rutas

- **Qué puede hacer el usuario registrado:** guardar itinerarios y volver a abrirlos.
- **Información que interviene:** nombre o identificación de la ruta, días, horarios, bodegas, traslados y presupuesto estimado.
- **Resultado esperado:** ruta persistente en la cuenta del usuario.

### Consultar el detalle

- **Qué puede hacer el usuario:** revisar la distribución diaria y acceder a las acciones de edición, mapa y Google Calendar.
- **Información que interviene:** itinerario guardado.
- **Resultado esperado:** vista consolidada del viaje planificado.

## 10. Integración con Google Calendar

### Conectar Calendar

- **Qué puede hacer el usuario registrado:** conectar o desconectar su cuenta de Google Calendar desde Integraciones.
- **Información que interviene:** estado de conexión y autorización del usuario.
- **Resultado esperado:** integración disponible para exportar itinerarios.

### Agregar el itinerario

- **Qué puede hacer el usuario:** confirmar la incorporación de una ruta a Calendar.
- **Información que interviene:** nombre de la bodega, fecha, horario, dirección, enlace e información básica de la experiencia.
- **Resultado esperado:** un evento independiente por cada visita y un resultado de sincronización visible.

Los eventos representan visitas planificadas; no son comprobantes de reserva.

**Integración relacionada:** Google Calendar, con la autorización correspondiente del usuario.

## 11. Cámara

### Escanear una etiqueta

- **Qué puede hacer el usuario:** abrir la cámara, encuadrar la etiqueta y tomar una fotografía.
- **Información que interviene:** imagen capturada y permiso de cámara.
- **Resultado esperado:** imagen enviada al proceso de identificación o estado de permiso denegado.

**Capacidad relacionada:** cámara nativa del dispositivo.

## 12. Identificación de vinos

### Procesar e identificar

- **Qué puede hacer el usuario:** esperar el procesamiento y consultar el resultado.
- **Información que interviene:** etiqueta fotografiada e información disponible del vino.
- **Resultado esperado:** nombre, bodega, varietal, añada, región, descripción, notas de cata, maridaje e información adicional disponible.

### Resolver un vino no identificado

- **Qué puede hacer el usuario:** reintentar la captura o buscar el vino manualmente.
- **Información que interviene:** nueva imagen o criterio de búsqueda.
- **Resultado esperado:** nuevo intento de identificación o acceso a resultados manuales.

**Integraciones relacionadas:** cámara del dispositivo y servicio de análisis de imágenes. La información detectada puede requerir validación o complemento mediante datos propios u otra fuente de vinos.

## 13. Mi Cava

### Guardar un vino

- **Qué puede hacer el usuario registrado:** agregar el vino identificado, asignarle entre una y cinco estrellas y escribir una nota personal libre.
- **Información que interviene:** información del vino, rating privado y nota privada.
- **Resultado esperado:** vino incorporado a la colección personal.

### Consultar y filtrar la colección

- **Qué puede hacer el usuario:** buscar o filtrar los vinos guardados y abrir su detalle.
- **Información que interviene:** vinos de la colección, ratings y notas.
- **Resultado esperado:** acceso organizado a los recuerdos personales.

### Editar la valoración personal

- **Qué puede hacer el usuario:** cambiar el rating o la nota libre de un vino guardado.
- **Información que interviene:** rating de una a cinco estrellas y texto libre.
- **Resultado esperado:** información personal actualizada sin publicarla como reseña.

Mi Cava no incluye campos estructurados para persona, fecha, lugar, evento, maridaje personal u ocasión. El usuario puede mencionar libremente esos datos en su nota.

## 14. Perfil

### Consultar y editar el perfil

- **Qué puede hacer el usuario:** ver y modificar sus datos personales y preferencias.
- **Información que interviene:** datos de cuenta y preferencias declaradas.
- **Resultado esperado:** perfil actualizado.

### Configuración e integraciones

- **Qué puede hacer el usuario:** consultar la configuración general y el estado conectado o desconectado de Google Calendar.
- **Información que interviene:** ajustes de cuenta y estado de la integración.
- **Resultado esperado:** control de la cuenta y de la conexión con Calendar.

## 15. Favoritos

### Guardar bodegas favoritas

- **Qué puede hacer el usuario registrado:** marcar bodegas y consultar posteriormente la colección de favoritas.
- **Información que interviene:** bodegas seleccionadas.
- **Resultado esperado:** lista personal persistente de bodegas de interés.

## 16. Notificaciones

La especificación contempla una pantalla de Notificaciones, pero no define eventos, canales ni preferencias concretas para el MVP. Su comportamiento funcional queda pendiente de decisión de producto y no se amplía en este documento.

## Reglas importantes de producto

- Una visita agregada a una ruta o a Google Calendar está **planificada**; no significa que esté reservada.
- Las reservas reales no forman parte del MVP.
- Bodegueando no incluye checkout, pagos, cancelaciones ni reembolsos en el MVP.
- El rating de una bodega es público y colaborativo.
- El rating de un vino es personal y privado.
- La nota de un vino es un campo libre y privado.
- Mi Cava pertenece al usuario y no es un simple historial técnico de escaneos.
- Las rutas pueden construirse automática o manualmente.
- Las acciones persistentes requieren autenticación.
- La reserva externa, cuando exista un enlace, se realiza en el sitio de la bodega.

## Funcionalidades futuras

- Consulta de disponibilidad en tiempo real.
- Reserva automática desde Bodegueando.
- Pagos y gestión de cancelaciones.
- Recomendaciones más avanzadas.
- Integraciones con sistemas externos de las bodegas.
