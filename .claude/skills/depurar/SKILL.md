---
name: depurar
description: Diagnostica fallos de ejecución en Expo/React Native (pantalla roja, Metro, módulos nativos, emulador) de forma ordenada. Úsalo cuando algo falle en tiempo de ejecución, antes de cambiar código a ciegas.
---

# Depurar

Principio: primero entender el fallo, después tocar el código. Cambiar cosas al azar
quema tiempo y rompe lo que ya funcionaba.

## 1. Lee el error de verdad
- Copia el mensaje completo, no el resumen. El stack trace suele señalar el archivo exacto.
- Si es pantalla roja en el emulador, lee también la terminal de Metro: muchas veces
  el error real está ahí y en pantalla solo se ve la consecuencia.
- Revisa `docs/STATUS.md` → "Ya intentado, no repetir" y "Errores conocidos" antes de proponer algo.

## 2. Clasifica antes de arreglar
| Síntoma | Causa típica a revisar primero |
|---|---|
| "Unable to resolve module X" | paquete no instalado, o instalado con `npm install` en vez de `npx expo install` |
| "Must use import to load ES Module" en pruebas | el paquete se resuelve como ESM: revisar `transformIgnorePatterns` de jest |
| Error de módulo nativo / "doesn't exist in the Expo Go" | el paquete necesita build nativo; no funciona en Expo Go |
| Cambios que no se reflejan | caché de Metro: reiniciar con `npx expo start --clear` |
| Pantalla en blanco sin error | fallo dentro de un componente que no propaga; revisar el render de la raíz |
| App no abre en el emulador | emulador o adb (ver `/revisar-ui` paso 1), no el código |
| Falla solo después de instalar algo | versión incompatible con el SDK: `npx expo-doctor` |
| Tipos fallan pero la app corre | TypeScript, no ejecución: `npm run typecheck` y leer el error tal cual |

## 3. Herramientas, en este orden
1. `npm run typecheck` — descarta errores de tipos.
2. `npx expo-doctor` — descarta incompatibilidades de versiones del SDK.
3. `npx expo start --clear` — descarta caché.
4. `adb logcat` filtrado — para errores nativos que no llegan a Metro.
5. Logs propios en el punto exacto de la sospecha, no logs regados por todo el archivo.

## 4. Aísla
- Reduce al caso mínimo: comenta o sustituye por un placeholder la parte sospechosa
  hasta que el fallo desaparezca. Eso identifica al culpable sin adivinar.
- Si el fallo apareció después de un cambio concreto, compara contra el commit anterior
  (`git diff`) en lugar de revisar todo el proyecto.

## 5. Antes de dar por resuelto
- Explica **por qué** fallaba, no solo qué cambiaste. Si no puedes explicarlo,
  probablemente lo tapaste en vez de arreglarlo, y dímelo así.
- Verifica en el emulador con `/revisar-ui` si tocaba UI.
- Anota en `docs/STATUS.md`:
  - en "Errores conocidos", el fallo y su arreglo, si puede repetirse;
  - en "Ya intentado, no repetir", los caminos que no funcionaron.
- Si el arreglo fue de entorno (PATH, versiones, SDK), llévalo también a `docs/ENTORNO.md`.

## 6. Cuándo parar y preguntarme
Después de 2 o 3 intentos fallidos con enfoques distintos, detente y dime:
qué falla, qué probaste, qué descartaste y cuáles son las dos opciones que ves.
No sigas iterando en silencio.
