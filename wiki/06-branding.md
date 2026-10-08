# Branding

Este documento define la identidad visual de **WineWay**: nombre, paleta de colores, tipografía e isologo. Es la referencia para aplicar branding de forma consistente entre el mockup de Figma y el código (`src/constants/theme.ts`).

## 1. Nombre de la aplicación

**WineWay**

Combina "wine" con "way" (camino/ruta), comunicando en una sola palabra la propuesta central del producto: planificar y recorrer un camino entre bodegas.

**Slogan:** *Planeá. Recorré. Brindá. Recordá.*

## 2. Paleta de colores

| Color | HEX | Uso sugerido |
|---|---|---|
| Malbec | `#722F37` | CTA principal, botones, elementos seleccionados |
| Wine Dark | `#321E20` | Títulos, headers, sombras de tarjetas |
| Crema | `#F7F2EA` | Fondo principal |
| Verde Oliva | `#6F7255` | Estados secundarios, referencias a viñedos |
| Terracota | `#C4775A` | Acentos, botón secundario, rating |
| Carbón | `#252525` | Texto principal |

Implementada en `src/constants/theme.ts`, con una capa adicional de tokens funcionales derivados de estos 6 colores (`surface`, `border`, `textMuted`, variantes `Soft` para estados, `error`).

## 3. Tipografía

**Inter**, en cuatro pesos, cargada vía `@expo-google-fonts/inter`.

| Variante | Peso | Tamaño | Uso |
|---|---|---|---|
| `display` | Bold | 30 | Títulos grandes (ej. "Bienvenido de nuevo") |
| `title` | SemiBold | 24 | Título de pantalla (ej. "Explorar Bodegas") |
| `heading` | SemiBold | 19 | Título de sección (ej. "Próximo viaje") |
| `subtitle` | SemiBold | 15 | Nombre de tarjeta |
| `body` | Regular | 14 | Texto de cuerpo |
| `bodyBold` | SemiBold | 14 | Texto de cuerpo con énfasis |
| `caption` | Regular | 12 | Texto secundario |
| `label` | Bold | 11 | Etiquetas en mayúsculas (ej. "EMAIL") |

- Specimen: [Inter en Google Fonts](https://fonts.google.com/specimen/Inter)
- Por qué: una sola familia con una escala de pesos clara es más simple de mantener en un equipo de dos personas que una combinación sans + serif, sin perder jerarquía visual.

## 4. Isotipo / logotipo

**Pendiente.** Los assets de ícono (`assets/images/icon.png`, splash, favicon) siguen siendo los default de la plantilla de Expo. Falta definir y aplicar un isotipo propio antes de la entrega.

## 5. Dirección visual

Premium, moderna, minimalista, vinculada a Mendoza, el vino y la naturaleza — elegante sin caer en lo excesivamente formal. Se priorizan fotografías grandes de viñedos, bodegas y vinos, evitando la estética clásica/pesada de un restaurante antiguo y el uso excesivo de bordó y dorado.
