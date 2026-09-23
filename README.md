# WineWay - App móvil de turismo

> Planeá. Recorré. Brindá. Recordá.

Aplicación móvil de turismo bodeguero para personas que viajan a Mendoza. Acompaña al usuario antes, durante y después del viaje: ayuda a descubrir bodegas, armar itinerarios de visita y guardar un registro personal de los vinos que probó.

## El problema

Organizar una recorrida por bodegas hoy implica cruzar información dispersa entre webs, redes y recomendaciones sueltas, sin una forma simple de planificar días, presupuesto y traslados, ni de recordar después qué vinos probaste y qué te parecieron.

## Público objetivo

Personas que viajan a Mendoza y quieren organizar visitas a bodegas según su tiempo, presupuesto, ubicación e intereses — y también quienes solo quieren explorar la oferta bodeguera y guardar un recuerdo personal de los vinos que probaron.

## Estado del proyecto

🚧 En desarrollo — **Sprint 1 (FrontEnd)**. Todavía no hay backend: las pantallas se construyen con datos estáticos, y el foco de esta etapa es la navegación y el frontend con Expo.

## Stack técnico

- **React Native** + **Expo**
- **Expo Router** (navegación basada en archivos)
- _(completar acá a medida que se sumen: gestor de estado, librería de UI, etc.)_

## Alcance del MVP

WineWay permite **planificar** una visita, no reservarla dentro de la app:

- Registro, login y exploración como invitado.
- Exploración de bodegas en lista y mapa, con búsqueda y filtros.
- Detalle de bodega: info, experiencias, vinos destacados, rating y reseñas.
- Armado de rutas (automático o manual), edición y guardado.
- Exportar el itinerario a Google Calendar (visita planificada, no reserva).
- Escaneo de etiquetas con la cámara e identificación del vino.
- **Mi Cava**: colección personal de vinos con rating y nota privados.
- Perfil de usuario y favoritos.

**Fuera del MVP:** reservas y confirmaciones dentro de la app, pagos/checkout, cancelaciones y disponibilidad en tiempo real. Para reservar, la app deriva al sitio externo de la bodega.

📄 Documentación funcional completa en [`/wiki`](./wiki):

| Documento | Contenido |
|---|---|
| [01 · Idea y alcance](./wiki/01-idea-y-alcance.md) | Problema, propuesta de valor, alcance del MVP |
| [02 · Funcionalidades](./wiki/02-funcionalidades-mvp.md) | Detalle funcional de cada módulo |
| [03 · Pantallas y diseño](./wiki/03-pantallas-y-diseno.md) | Inventario de pantallas, userflows, branding |
| [04 · APIs e integraciones](./wiki/04-apis-e-integraciones.md) | Google Maps/Routes/Places/Calendar, Gemini, cámara |
| [05 · Dudas pendientes](./wiki/05-dudas-pendientes.md) | Decisiones de producto todavía abiertas |

## Componentes nativos

| Componente | Uso en WineWay |
|---|---|
| 📷 **Cámara** | Fotografiar la etiqueta de un vino para identificarlo. |
| 📍 **GPS / Geolocalización** | Centrar el mapa en el usuario y mostrar bodegas cercanas. |

## Branding

| Color | HEX | Uso |
|---|---|---|
| Malbec | `#722F37` | CTA principal, branding |
| Wine Dark | `#321E20` | Títulos, headers |
| Crema | `#F7F2EA` | Fondo principal |
| Verde Oliva | `#6F7255` | Estados secundarios, referencias a viñedos |
| Terracota | `#C4775A` | Acentos y detalles |
| Carbón | `#252525` | Texto principal |

Tipografía: sans-serif limpia para la interfaz + serif elegante de uso puntual en títulos/branding (familias definitivas a confirmar).

## Cómo correr el proyecto

```bash
npm install
npx expo start
```

Escaneá el QR con **Expo Go** (Android/iOS) o iniciá un emulador desde la terminal.

## Enlaces

- 🎨 Mockup / prototipo interactivo en Figma

## Autores

[@vitogiaquinta14](https://github.com/vitogiaquinta14)
[@valencalzetta](https://github.com/valencalzetta)
— Proyecto académico, PUCA (Facultad de Ingeniería y Ciencias Agrarias).
