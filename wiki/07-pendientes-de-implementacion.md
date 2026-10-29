# Pendientes de implementación

Este documento resume el trabajo que falta después de implementar la base de datos, la API principal y su conexión con la app. Las dudas de producto que todavía necesitan respuesta siguen en [Dudas y decisiones pendientes](05-dudas-pendientes.md).

## Trabajo principal

### 1. Generación automática de rutas — implementada para esta etapa

- Selección voraz en el backend: filtro por fechas, imprescindibles, favoritas y puntuación, presupuesto por persona, cuota de almuerzos, horarios, descanso y cercanía dentro de cada día. Reglas y casos de aceptación en [Especificación SDD](09-seleccion-voraz-de-rutas.md).
- La app permite marcar imprescindibles, ajustar la franja diaria y la cantidad de almuerzos, y consultar las explicaciones de resultados parciales.
- Quedan para otra etapa las rutas viales y tráfico, los cupos y excepciones por fechas. La ruta generada sigue siendo una planificación: no confirma reservas.

### 2. Cargar el catálogo real de bodegas y vinos

- Reemplazar o ampliar los datos ilustrativos de `backend/prisma/data/catalogo.json` y volver a cargarlos en SQLite con el seed.
- Verificar bodegas, ubicación, experiencias, horarios, duración, precios por persona, vinos, cepas y fotos disponibles.
- Verificar los códigos de barras contra productos reales antes de incorporarlos, para que el escáner pueda encontrarlos.
- Mantener ratings de demostración identificados como tales; no copiarlos ni mezclarlos con ratings de Google o reseñas de WineWay.
- La carga actual se mantiene por archivo de catálogo. La wiki no define un panel administrativo para editarlo desde la app.

### 3. Integrar Google Calendar

- Conectar y autorizar la cuenta de Google Calendar del usuario.
- Crear un evento por visita, con horario local correcto, duración, bodega, dirección y experiencia.
- Definir el calendario de destino, los reintentos y cómo mostrar errores parciales (D-30 y D-33).
- Decidir qué ocurre al editar o eliminar una visita o ruta y al desconectar Calendar (D-31 y D-32).
- La tabla `Visita` aún no guarda el identificador externo del evento. Si la app debe actualizar o borrar eventos ya creados, agregar esa referencia y migrar la base antes de implementar la sincronización.
- Agendar una visita no equivale a reservarla en la bodega.

## Pendientes complementarios

- **Fotos de perfil y reseñas:** definir dónde se almacenan y cómo se suben. La base guarda referencias; no implementa almacenamiento de imágenes.
- **Prueba con datos y dispositivos reales:** escanear códigos de barras verificados con un teléfono y probar autorización, creación y sincronización de Calendar en dispositivo.
- **Acceso:** recuperación de contraseña e inicio de sesión con Google quedaron postergados en la etapa de backend; confirmar si se requieren para la entrega.

## Fuera del alcance acordado por ahora

- Reservas confirmadas, cupos reales, pagos y disponibilidad en tiempo real.
- Consultar o actualizar ratings de Google; los ratings precargados son únicamente de demostración.
- Identificación de vinos mediante IA o búsqueda externa de productos; el flujo actual busca el código en el catálogo y permite carga manual privada si no hay coincidencia.

## Referencias

- [SPEC del modelo de datos y backend](../specs/backend-data-model.md).
- [Plan de implementación del backend](../specs/backend-implementation-plan.md).
- [APIs e integraciones](04-apis-e-integraciones.md).
