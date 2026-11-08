---
name: revisar-ui
description: Verifica una pantalla en el emulador Android y guarda la evidencia en artifacts/. Úsalo siempre antes de marcar un requisito de UI como Verificado.
---

# Verificación visual en el emulador

Regla que no se rompe: **nunca afirmes haber visto una pantalla que no capturaste.**
Si no hay captura, el estado del requisito es "Implementado sin probar".

> **Desde la sesión de T2 (2026-11-08): el usuario es quien levanta el emulador, navega
> y toma las capturas — no el agente.** Decisión explícita para ahorrar tokens: el loop de
> `adb`/`uiautomator dump`/agent-device para tocar a ciegas y encontrar bounds es caro y
> propenso a fallos silenciosos (ver "Ya intentado, no repetir" en `docs/STATUS.md`). En vez
> de eso, al terminar la implementación de una tarea, entrega al usuario:
> 1. La lista exacta de pantallas/estados a capturar, con nombre de archivo sugerido
>    (`artifacts/<tarea>-<estado>.png`) emparejado con el `screen.png` de Stitch equivalente.
> 2. El paso a paso de navegación para llegar a cada una (qué tocar, en qué orden).
> 3. Qué probar en cada una (valores límite, estados de error, accesibilidad a simple vista).
> Luego espera a que el usuario deje las capturas en `artifacts/` y retómalo desde el paso 5
> (comparar contra el diseño). Pasos 1-4 de abajo solo aplican si en algún momento se vuelve
> a automatizar la captura (por ejemplo, para una verificación puntual que el usuario pida
> que hagas tú).

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
- Preferido: agent-device (herramientas `automation_*`). Hay que **abrir una sesión antes
  de capturar**; un `screenshot` sin sesión abierta falla. Abre la app primero y captura
  después. Con sesión abierta puedes también tocar (`automation_tap`), hacer scroll
  (`automation_scroll`) y buscar vistas por `testID` (`automation_find_view`) para navegar
  a cada pantalla y provocar sus estados sin pedirle al usuario que lo haga a mano.
- Alternativa si agent-device no está disponible:
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

## 5. Compara con el diseño y ajusta hasta la fidelidad exacta
- Referencia por defecto: el `screen.png` (y `code.html` si hace falta detalle de
  layout/valores) de `docs/diseno/stitch-export/` para esa misma pantalla. Si no existe
  export de Stitch para esa pantalla, usa `docs/DESIGN.md`.
- Loop autónomo: captura → compara visualmente contra la referencia → ajusta estilos
  (colores, spacing, tipografía, radios, alineación — siempre vía tokens de `src/theme/`,
  nunca literales) → recaptura → repite hasta que coincida. No necesitas pedir aprobación
  para este tipo de ajuste visual; el usuario puede seguir el emulador en vivo.
- **Excepción que sí requiere detenerte y preguntar primero:** cualquier ajuste que toque
  un token o regla de accesibilidad (contraste, área táctil ≥48dp, un estado comunicado
  solo por color, escalado de texto). Esos son requisitos de dominio (RNF-002/004/005),
  no decisiones estéticas — si el PNG de Stitch choca con ellos, repórtalo y espera
  decisión antes de "corregir" hacia el PNG.
- Si el diseño (Stitch o DESIGN.md) contradice el enunciado, manda el enunciado y anótalo
  en vez de seguir el diseño a ciegas.

## 6. Cierra
1. Actualiza en `docs/REQUISITOS.md` las filas verificadas, citando el nombre del archivo
   de captura como evidencia.
2. Deja en `docs/STATUS.md` qué se verificó y qué quedó sin verificar, y por qué.
3. Si algo no se pudo probar (falta el emulador, el estado no se puede provocar todavía),
   dilo explícitamente en lugar de dejarlo implícito.

Reporta: capturas creadas, requisitos que pasan a Verificado, diferencias contra el diseño,
y lo que quedó sin verificar.
