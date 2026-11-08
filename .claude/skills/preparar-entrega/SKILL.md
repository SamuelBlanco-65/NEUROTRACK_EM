---
name: preparar-entrega
description: Cierra un proyecto académico: auditoría contra la rúbrica, README, guía para el video y checklist final. Úsalo cuando la funcionalidad esté completa, antes de grabar o entregar.
---

# Preparar la entrega

## 1. Auditoría
Ejecuta los subagentes y tráeme sus hallazgos sin filtrarlos:
- `rubric-auditor` — cumplimiento de cada criterio de la rúbrica.
- `security-reviewer` — secretos, validación, permisos.
- `accessibility-reviewer` — `testID`, etiquetas, área táctil, contraste.
- `perf-reviewer` — solo si la app tiene listas largas, imágenes o animaciones.

## 2. Verifica la evidencia, no la confíes
Recorre `docs/REQUISITOS.md` fila por fila:
- Todo Obligatorio debe estar Verificado **con evidencia real** (captura en `artifacts/`,
  prueba que pasa, o documento).
- Si una fila dice Verificado y no encuentras la evidencia, bájala a
  "Implementado sin probar" y dímelo. Esto es lo que más puntos cuesta en una revisión.
- Lista aparte lo que quedó Pendiente, para que yo decida si se entrega así.

## 3. README del repositorio
Escribe `README.md` pensando en quien lo va a calificar:
- Qué es la app, en 3 líneas.
- Cómo levantarla desde cero: requisitos previos, instalación, comando de arranque.
- Estructura de carpetas, con una frase por carpeta.
- Decisiones técnicas principales y por qué (resumen de `docs/DECISIONES.md`).
- Créditos y licencias de recursos externos (iconos, fuentes, imágenes). Si una licencia
  exige atribución, va aquí, con el nombre del autor.
- Declaración de uso de IA, si el enunciado o el reglamento la exige. Si no lo exige,
  recuérdame preguntarle al profesor.

## 4. Guía para el video
Escribe `docs/GUIA-VIDEO.md` **a partir del código real**, no de lo que debería existir:
- Un bloque por momento del guion que pida el enunciado, con el rango de tiempo.
- Para cada momento: qué decir en mis palabras (lenguaje sencillo, nivel de alguien que
  acaba de aprender esto), y debajo, qué mostrar en pantalla.
- Cada referencia al código con **archivo y número de línea**, verificados abriendo el archivo.
- Marca los puntos donde yo tengo que interactuar con la app en vivo y qué debe verse al hacerlo.
- Si un efecto depende de un estado previo (haber subido un valor antes, haber equipado algo),
  dilo explícitamente: es el error más fácil de cometer grabando.

Al final, una lista de **preguntas de autoevaluación**: lo que el profesor podría preguntarme
sobre mi propio código. No un guion para leer, sino preguntas para comprobar si lo entiendo.
Si al responderlas detecto que no entiendo una parte, esa parte se explica de nuevo antes de grabar.

## 5. Checklist final
Entrégame una lista marcable con:
- Entregables del enunciado (`ENT-*` de `docs/REQUISITOS.md`), uno por línea.
- Repositorio: sin archivos basura, sin `node_modules`, `.env` ignorado, commits con mensajes legibles.
- La app arranca desde cero siguiendo el README (dime si lo comprobaste o si no pudiste).
- Duración del video dentro del rango exigido.
- Fecha y formato de entrega.

## 6. Reglas
- No marques nada como listo que no hayas comprobado.
- No inventes porcentajes de rúbrica ni requisitos que el enunciado no diga.
- Si algo no se puede cumplir, dilo con su razón y propón la alternativa más cercana,
  en lugar de dejar la casilla vacía.
