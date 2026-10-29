This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Backend de WineWay

- Seguí como referencia de trabajo la práctica `Práctica Prisma — Express + Prisma + SQLite + Expo`: explicá el recorrido de los datos entre la app, la API, la capa de persistencia y la base.
- Mantené una arquitectura sencilla por responsabilidades: Expo solicita y presenta datos; Express expone HTTP, procesa middleware y valida; Prisma define y consulta el modelo; la base persiste.
- No conectes Expo directamente a la base ni mezcles reglas de validación con la interfaz o con el schema de persistencia.
- Elegí implementaciones simples y justificá las decisiones relacionándolas con conceptos de la materia (capas, API REST, validación, persistencia y flujo request/response).
- Mientras implementás el backend, actualizá `Seguimiento de desarrollo.md` con resúmenes breves: qué se hizo, dónde está, por qué se resolvió así y qué concepto de la materia aplica. El archivo es local y está excluido de Git.
- Antes de elegir o crear el schema y las migraciones, acordá con la usuaria qué base de datos y qué datos requiere la app.

- Aplicá TDD al backend: escribí y ejecutá primero la prueba que falla, implementá la regla y refactorizá con las pruebas verdes. Registrá los ciclos y resultados en el seguimiento local.
- Los datos del catálogo y ratings de demostración se precargan únicamente en SQLite mediante el seed. El frontend los obtiene de la API, sin catálogos ni ratings alternativos hardcodeados.
