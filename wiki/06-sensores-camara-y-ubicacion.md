# Sensores: cámara, ubicación y mapa

Esta guía traduce el material de clase de sensores a las necesidades de WineWay. Define cómo integrar cámara y ubicación de forma segura, eficiente y compatible con Expo SDK 57. No implementa todavía un proveedor de mapas ni la identificación real de vinos.

## Alcance y distinción clave

- `expo-camera` muestra la vista previa, pide permiso, toma una foto y puede escanear códigos.
- `expo-location` obtiene coordenadas, precisión, rumbo y cambios de ubicación.
- Un mapa interactivo es otra responsabilidad: necesita un componente o SDK de mapas además de las coordenadas.

Para WineWay, la cámara sirve para capturar la etiqueta del vino. La ubicación sirve para centrar o contextualizar el mapa y calcular distancias; no hace falta rastrear al usuario en segundo plano para el MVP.

## Estado actual de WineWay

### Cámara

- `expo-camera` ya está instalado y configurado en `app.json` con un mensaje de permiso específico para escanear etiquetas.
- La pantalla `src/app/(tabs)/escanear.tsx` usa `CameraView`, `useCameraPermissions`, una referencia para `takePictureAsync` y desactiva la vista cuando la pestaña pierde foco.
- La identificación posterior sigue siendo simulada: la imagen se conserva como URI local y todavía no se envía a Gemini ni a otro servicio.

### Ubicación y mapa

- `expo-location` todavía no está instalado ni declarado en `app.json`.
- Tampoco hay un proveedor de mapa interactivo configurado. Las bodegas pueden mostrar datos estáticos mientras se decide el proveedor.

## Cámara: patrón acordado

1. Instalar siempre con `npx expo install expo-camera` y configurar el plugin con un mensaje claro en `app.json`.
2. Consultar el permiso con `useCameraPermissions()`: el estado inicial puede ser `null` mientras se carga.
3. Si el permiso fue denegado y `canAskAgain` es verdadero, ofrecer el botón para solicitarlo. Si es falso, explicar el caso y abrir Ajustes con `Linking.openSettings()`.
4. Con permiso concedido, montar una sola `CameraView` activa, orientada hacia atrás, y esperar `onCameraReady` antes de habilitar la captura.
5. Usar una `ref` para llamar a `takePictureAsync`; almacenar la URI, no una imagen base64, para el siguiente paso de identificación.
6. Desmontar la cámara o definir `active={false}` cuando la pantalla no esté enfocada, mientras se procesa la foto y al mostrar el resultado. Solo puede haber una vista previa activa.

Estados de interfaz mínimos:

- Consultando el permiso.
- Permiso pendiente o denegado, con una explicación de por qué se necesita.
- Denegado permanentemente, con acceso a Ajustes.
- Cámara lista, con guía de encuadre y acción de captura.
- Error al montar o capturar, con reintento.
- Foto capturada, procesando y resultado identificable o no identificado.

La cámara se prueba en un teléfono físico. Expo Go permite validar el permiso y la captura, pero los textos personalizados del plugin se reflejan en un development build o build publicada después de recompilar.

## Ubicación: patrón acordado

1. Agregar `expo-location` con `npx expo install expo-location` y configurar el plugin `expo-location` en `app.json` con un mensaje que explique el uso: mostrar bodegas cercanas o centrar el mapa.
2. Pedir únicamente permiso de primer plano. WineWay no necesita ubicación en segundo plano para explorar bodegas, planificar una ruta ni escanear una etiqueta.
3. Diferenciar permiso de servicio: `Location.hasServicesEnabledAsync()` indica si el usuario activó los servicios de ubicación; aceptarlo no equivale a haber concedido permiso a la app.
4. Para centrar el mapa, obtener una lectura puntual con `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`. Es suficiente para explorar y consume menos batería que precisión máxima.
5. Usar `watchPositionAsync()` solo si una función futura necesita actualización continua mientras la pantalla está en primer plano. Guardar la suscripción y ejecutar `remove()` al desmontar.
6. Cuando no haya permiso, servicio activo o señal, conservar el mapa navegable en una posición predeterminada de Mendoza y ofrecer reintentar; nunca dejar una pantalla vacía.

## Mapa: responsabilidad separada

El módulo de ubicación no resuelve la visualización del mapa, los marcadores ni las rutas dibujadas. Para esta capa se debe elegir el SDK/componente de mapas compatible con el producto y configurar sus credenciales, atribución y proveedor. Google Places y Routes siguen siendo fuentes separadas: Places aporta lugares y coordenadas; Routes, distancias y tiempos; el mapa solo los representa.

Antes de elegir el componente de mapa se debe confirmar si el MVP usa Google Maps, otro proveedor o una vista externa. La decisión debe documentarse junto con las claves, la política de atribución y las plataformas objetivo.

## Orden de implementación recomendado

1. Terminar la cámara real: estados de permiso, captura, error y reintento en la pantalla existente.
2. Definir el contrato del servicio de identificación de la etiqueta y conectar la URI de la foto.
3. Instalar y configurar `expo-location`; incorporar el estado de ubicación puntual y sus mensajes de error.
4. Elegir e integrar el componente de mapa; usar la ubicación solo para centrarlo y mantener una alternativa manual.
5. Recién entonces añadir marcadores, Google Places/Routes y, si hay una necesidad real, seguimiento continuo o rumbo.

## Pruebas mínimas

- Teléfono físico Android e iOS: permiso concedido, denegado, denegado permanentemente y captura fallida.
- Cámara: volver de otra pestaña, repetir escaneo y verificar que no queden dos vistas activas.
- Ubicación: servicio apagado, permiso denegado, sin señal, lectura puntual correcta y fallback de Mendoza.
- Emulador Android: simular ubicación. Simulador iOS: simular ubicación desde el menú correspondiente.
- Development build: verificar los textos de permisos configurados en `app.json`.
