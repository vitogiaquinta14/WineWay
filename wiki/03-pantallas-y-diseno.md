# Pantallas y diseño

Este documento enumera las pantallas necesarias para crear los mockups iniciales de Bodegueando. Las descripciones se limitan al alcance funcional definido para el MVP.

## A. Onboarding y autenticación

### 1. Splash Screen

- Logo de Bodegueando.
- Estado breve de carga inicial.
- Derivación a Onboarding, autenticación o Home según corresponda.

### 2. Onboarding

- Carrusel introductorio.
- Presentación de los tres pilares: planificar, descubrir y recordar.
- Acciones para omitir o comenzar.

### 3. Selección Login / Registro

- Acción principal para registrarse.
- Acción para iniciar sesión.
- Opción de continuar como invitado para explorar contenido público.

### 4. Registro

- Nombre.
- Email.
- Contraseña.
- Registro con Google.
- Apple Login únicamente si se confirma su implementación.

### 5. Login

- Email y contraseña.
- Acceso con Google.
- Apple Login únicamente si se confirma su implementación.
- Enlace para recuperar la contraseña.

### 6. Recuperar contraseña

- Campo de email.
- Acción para solicitar recuperación.
- Confirmación del envío de la solicitud.

### 7. Solicitud de permisos

- Explicación previa de los permisos necesarios para las funciones correspondientes.
- Solicitud de cámara para escanear etiquetas.
- Los demás permisos solo deben solicitarse si la implementación del MVP los necesita.

## B. Home

### 8. Home

Debe presentar accesos directos a:

- Crear ruta.
- Explorar bodegas.
- Mi Ruta o Mis Rutas.
- Escanear vino.
- Mi Cava.

Puede mostrar, cuando exista información disponible:

- Bodegas recomendadas.
- Próximo viaje.
- Bodegas destacadas.

El avatar permite acceder al Perfil.

## C. Exploración de bodegas

### 9. Explorar — listado

- Resultados en formato de lista.
- Información resumida de cada bodega.
- Acceso a búsqueda y filtros.
- Cambio a vista de mapa.
- Estados vacío, carga, error y sin resultados.

### 10. Explorar — mapa

- Ubicación geográfica de las bodegas disponibles.
- Selección de una bodega para ver información resumida y acceder al detalle.
- Filtros compartidos con la vista de listado.
- Cambio a vista de listado.

### 11. Filtros

- Zona.
- Distancia.
- Precio.
- Rating.
- Tipo de experiencia.
- Gastronomía.
- Tipo de vino o varietal.
- Bodega boutique, tradicional o de gran escala.
- Acciones para aplicar o limpiar la selección.

### 12. Búsqueda

- Campo de búsqueda por nombre de bodega.
- Resultados coincidentes.
- Estado sin resultados.

### 13. Detalle de bodega

- Nombre y fotografías.
- Descripción.
- Ubicación y mapa.
- Rango de precios y horarios.
- Experiencias ofrecidas.
- Vinos destacados.
- Rating promedio y cantidad de reseñas.
- Acceso a todas las reseñas.
- Acción para agregar la bodega a una ruta.
- Acción para marcar o quitar de Favoritos.
- Enlace externo para obtener más información o reservar en el sitio de la bodega.

La interfaz no debe presentar la visita como reservada dentro de Bodegueando.

### 14. Favoritos

- Bodegas guardadas por el usuario.
- Acceso al detalle de cada bodega.
- Acción para quitar una bodega de Favoritos.
- Estado de lista vacía.

### 15. Reseñas de bodega

- Rating promedio.
- Cantidad de reseñas.
- Listado de puntuaciones, comentarios y fotos disponibles.
- Acción para escribir una reseña si el usuario inició sesión.

### 16. Crear reseña de bodega

- Rating público.
- Comentario.
- Fotos opcionales.
- Acción para publicar.
- Solicitud de autenticación cuando el usuario sea invitado.

## D. Creación de rutas

### 17. Configuración inicial del viaje

- Fechas o cantidad de días.
- Cantidad de personas.
- Presupuesto aproximado.
- Zona o zonas de interés.
- Preferencias de vino.
- Preferencias de experiencia.
- Cantidad aproximada de bodegas por día.
- Acción para generar propuestas.

### 18. Rutas sugeridas

- Una o varias alternativas de itinerario.
- Resumen de días, bodegas, distancias, traslados y presupuesto aproximado.
- Acción para seleccionar una alternativa.

### 19. Detalle de ruta sugerida

- Itinerario separado por Día 1, Día 2, Día 3 y los días que correspondan.
- Horarios sugeridos.
- Bodegas de cada jornada.
- Distancias y tiempos estimados de traslado.
- Ubicaciones.
- Presupuesto estimado.
- Rating de las bodegas.
- Acciones para editar, ver el mapa y guardar.

### 20. Edición de ruta

- Mover una bodega dentro del itinerario.
- Eliminar una bodega.
- Agregar otra bodega.
- Reemplazar una bodega.
- Modificar horarios.
- Revisar la organización actualizada.
- Guardar cambios.

### 21. Mapa de ruta

- Paradas identificadas y ordenadas.
- Recorrido distribuido por día cuando corresponda.
- Distancias y tiempos estimados de traslado.
- Acceso al detalle de cada parada.

### 22. Mis Rutas

- Listado de itinerarios guardados.
- Información resumida de cada ruta.
- Acceso al detalle.
- Estado de lista vacía.

### 23. Detalle de Ruta guardada

- Distribución de visitas por día.
- Horarios, bodegas, traslados y presupuesto estimado.
- Acciones para editar y consultar el mapa.
- Acción para agregar el itinerario a Google Calendar.
- Estado de planificación, sin presentarlo como reserva.

### 24. Confirmación de agregar a Google Calendar

- Explicación de que se creará un evento independiente por visita.
- Resumen de los eventos que se agregarán.
- Aclaración visible de que agregar una visita al calendario no equivale a reservarla.
- Acción para confirmar o cancelar.
- Derivación a conexión/autorización si Calendar no está conectado.

### 25. Resultado de sincronización con Calendar

- Resultado de la operación.
- Cantidad de eventos agregados cuando la sincronización sea exitosa.
- Estado de error y acción para reintentar cuando corresponda.

Cada evento puede incluir:

- Nombre de la bodega.
- Fecha y horario.
- Dirección.
- Enlace a la bodega.
- Información básica de la experiencia.

## E. Vinos y cámara

### 26. Cámara / escanear etiqueta

- Vista de cámara.
- Guía para encuadrar la etiqueta.
- Acción de captura.
- Explicación o recuperación ante permiso denegado.

### 27. Estado procesando

- Indicador de carga posterior a la captura.
- Mensaje que comunique que se está identificando el vino.

### 28. Resultado del vino identificado

Mostrar la información disponible:

- Nombre del vino.
- Bodega.
- Varietal.
- Añada.
- Región.
- Descripción.
- Notas de cata.
- Maridaje sugerido.
- Información adicional disponible.
- Acción para agregar el vino a Mi Cava.

### 29. Vino no identificado

- Mensaje de resultado no encontrado.
- Acción para reintentar la captura.
- Acción para buscar manualmente.

### 30. Agregar a Mi Cava

- Resumen del vino identificado.
- Rating personal de una a cinco estrellas.
- Campo libre “Nota personal”.
- Acción para guardar.

No se deben crear campos estructurados para persona, fecha, lugar, evento, maridaje personal u ocasión.

### 31. Mi Cava

- Colección de vinos guardados.
- Información resumida de cada vino.
- Rating personal.
- Búsqueda o filtros de la colección.
- Acceso al detalle.
- Estado de colección vacía.

### 32. Detalle de vino guardado

- Información disponible del vino.
- Rating personal y privado.
- Nota personal y privada.
- Acciones para editar rating y nota.

Mi Cava es una colección personal, no un historial técnico de escaneos.

## F. Perfil

### 33. Perfil

- Datos del usuario.
- Preferencias.
- Acceso a edición, configuración e integraciones.

### 34. Editar perfil

- Edición de datos personales.
- Edición de preferencias.
- Acción para guardar cambios.

### 35. Configuración

- Acceso a los ajustes de cuenta definidos para el producto.
- Acceso a Notificaciones e Integraciones.

No se incluyen tarjetas ni métodos de pago en el MVP.

### 36. Notificaciones

- Pantalla contemplada en el inventario de diseño.
- Sus controles y tipos de notificación quedan pendientes de definición de producto.

### 37. Integraciones

- Estado de Google Calendar: conectado o desconectado.
- Acción para conectar.
- Acción para desconectar.
- Información necesaria para comprender el uso de la integración.

## G. Estados transversales

Estos estados deben diseñarse como variantes aplicables a las pantallas correspondientes:

- Carga.
- Error y reintento.
- Sin conexión.
- Lista vacía.
- Sin resultados.
- Permiso de cámara denegado.
- Permiso de ubicación denegado, cuando se utilice geolocalización.
- Google Calendar no conectado.
- Google Calendar conectado.
- Error al sincronizar Google Calendar.
- Error al cargar el mapa.
- Vino procesándose.
- Vino no identificado.

## Navegación principal

Se propone una barra inferior con cinco accesos:

1. **Inicio:** concentra accesos y contenido relevante.
2. **Explorar:** reúne el descubrimiento de bodegas mediante lista, mapa, búsqueda y filtros.
3. **Mi Ruta:** facilita consultar el itinerario durante la planificación y el viaje, además de acceder a las rutas guardadas.
4. **Escanear:** ofrece acceso directo a una acción frecuente durante la experiencia en bodegas.
5. **Mi Cava:** mantiene visible la colección personal de vinos.

Esta navegación representa los momentos centrales del producto: comenzar, descubrir, planificar o consultar, capturar y recordar. El Perfil queda fuera de la barra porque funciona como área secundaria de cuenta y se abre mediante el avatar desde Home.

## Userflows

### Primer uso

**Splash → Onboarding → Registro/Login → Permisos → Home**

La opción de invitado deriva desde la selección de acceso hacia la exploración pública. Las acciones persistentes solicitan autenticación.

### Crear ruta automática

**Home → Crear Ruta → Configuración → Rutas sugeridas → Elegir alternativa → Editar → Guardar → Agregar a Google Calendar**

### Crear ruta manual

**Home → Explorar bodegas → Detalle → Agregar a ruta → Continuar explorando → Ver ruta → Organizar itinerario → Guardar → Calendar**

### Reseñar bodega

**Detalle de bodega → Ver reseñas → Escribir reseña → Rating → Comentario → Publicar**

La publicación requiere autenticación. Las fotos son opcionales.

### Escanear vino

**Home/Escanear → Cámara → Procesando → Resultado → Rating + nota → Guardar en Mi Cava**

Si el vino no se identifica, el usuario puede reintentar o buscar manualmente.

### Consultar Mi Cava

**Mi Cava → Seleccionar vino → Ver información → Ver/editar rating → Ver/editar nota**

# Propuesta visual inicial

## Naming y slogan

- **Nombre de la aplicación:** Bodegueando.
- **Slogan:** *Planeá. Recorré. Brindá. Recordá.*

“Bodegueando” presenta la experiencia como una acción en curso: explorar bodegas, recorrer Mendoza y construir recuerdos alrededor del vino. El slogan acompaña los momentos principales del producto:

- **Planeá:** creación y organización de rutas.
- **Recorré:** visitas y exploración de bodegas.
- **Brindá:** experiencia vinculada con el vino.
- **Recordá:** Mi Cava, ratings y notas personales.


## Dirección visual

La identidad debe sentirse:

- Premium.
- Moderna.
- Relacionada con Mendoza, el vino y la naturaleza.
- Elegante sin ser excesivamente formal.
- Minimalista y muy visual.

Se priorizan fotografías grandes de viñedos, bodegas y vinos. Debe evitarse una estética clásica o pesada similar a la de un restaurante antiguo, así como el uso excesivo de bordó y dorado.

## Paleta principal propuesta

| Color | Valor | Uso sugerido |
|---|---|---|
| Malbec | `#722F37` | CTA principal, botones, elementos seleccionados y branding |
| Wine Dark | `#321E20` | Títulos, fondos oscuros puntuales y encabezados |
| Crema | `#F7F2EA` | Fondo principal, tarjetas y superficies |
| Verde Oliva | `#6F7255` | Naturaleza, etiquetas, estados secundarios y referencias a viñedos |
| Terracota | `#C4775A` | Acentos, detalles, ilustraciones y elementos complementarios |
| Carbón | `#252525` | Texto principal |

## Proporción de uso

La interfaz debe utilizar principalmente crema, blanco y carbón. Malbec, verde oliva y terracota funcionan como colores de identidad y acento.

Las grandes superficies completamente bordó deben reservarse para casos puntuales o elementos hero.

## Tipografía

- Sans-serif limpia y moderna para la interfaz.
- Serif elegante, de uso muy limitado, para títulos destacados o branding si el sistema visual lo requiere.
- Legibilidad móvil como criterio prioritario.

La selección de familias tipográficas definitivas queda para una instancia posterior de diseño.
