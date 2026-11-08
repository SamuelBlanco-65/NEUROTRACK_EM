---
name: revisar-ui
description: Verifica una pantalla en el emulador Android y guarda la evidencia en artifacts/. Úsalo siempre antes de marcar un requisito de UI como Verificado.
---

# Verificación visual en el emulador

Regla que no se rompe: **nunca afirmes haber visto una pantalla que no capturaste.**
Si no hay captura, el estado del requisito es "Implementado sin probar".

## 1. Prepara el entorno
- Revisa `docs/ENTORNO.md`: ahí están los arreglos de PATH y emulador de este equipo.
- Si `adb` no se encuentra, exporta la ruta absoluta del SDK en esta sesión de terminal
  antes de cualquier otro comando. En Git Bash, las variables tipo `%LOCALAPPDATA%`
  se expanden mal: usa la ruta completa.
- Comprueba que el emulador responde: `adb devices` debe listar un `emulator-*`.
- Si no hay emulador corriendo, dímelo en lugar de intentar arrancarlo a ciegas.

## 2. Levanta la app
- `npx expo start --android` (o la tecla `a` si Metro ya está corriendo).
- Espera a que el empaquetado termine sin errores antes de capturar.
- Si Metro falla, pasa a `/depurar` en vez de seguir.

## 3. Captura
- Con agent-device hay que **abrir una sesión antes de capturar**; un `screenshot`
  sin sesión abierta falla. Abre la app primero y captura después.
- Alternativa que funciona sin agent-device:
  `adb exec-out screencap -p > artifacts/<nombre>.png`
- Nombra los archivos `artifacts/<tarea>-<estado>.png`
  (por ejemplo `t4-panel-vacio.png`, `t4-panel-error.png`).

## 4. Captura los estados, no solo el bonito
Para cada pantalla, captura los que apliquen:
- estado inicial / por defecto
- carga, error y vacío
- estados límite del dominio (valores en 0, valores al máximo, listas largas, textos largos)
- estados deshabilitados de los controles

Un requisito que describe un estado (una alerta, un color de aviso, un badge) no está
verificado hasta que exista la captura de **ese** estado.

## 5. Compara con el diseño
- Abre la referencia de `docs/DESIGN.md` (y la captura de diseño si existe en `docs/diseno/`).
- Enumérame las diferencias que encuentres. No "arregles" el diseño por tu cuenta
  ni cambies decisiones de `DESIGN.md` sin proponerlo primero.
- Si el diseño contradice el enunciado, manda el enunciado y anótalo.

## 6. Cierra
1. Actualiza en `docs/REQUISITOS.md` las filas verificadas, citando el nombre del archivo
   de captura como evidencia.
2. Deja en `docs/STATUS.md` qué se verificó y qué quedó sin verificar, y por qué.
3. Si algo no se pudo probar (falta el emulador, el estado no se puede provocar todavía),
   dilo explícitamente en lugar de dejarlo implícito.

Reporta: capturas creadas, requisitos que pasan a Verificado, diferencias contra el diseño,
y lo que quedó sin verificar.
