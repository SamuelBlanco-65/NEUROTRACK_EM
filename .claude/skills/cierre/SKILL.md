---
name: cierre
description: Actualiza docs/STATUS.md al terminar una sesión de trabajo para que la siguiente sesión continúe sin contexto previo. Úsalo antes de cerrar la terminal o de hacer /clear.
---

# Cierre de sesión

Escribe para alguien que no vio nada de esta sesión: eso es exactamente lo que será
la próxima sesión después de un `/clear`.

## Actualiza docs/STATUS.md
Mantén estas secciones (la plantilla ya las trae):
- **Fecha y rama**, últimos commits y qué quedó sin commitear.
- **Objetivo en curso** — una frase.
- **Hecho en esta sesión** — cada punto con su estado: Verificado (y con qué evidencia:
  nombre de la captura o de la prueba) o Sin probar (y qué falta para verificarlo).
  No escribas "Verificado" por algo que no ejecutaste.
- **Siguiente acción concreta** — un solo paso ejecutable, no un objetivo general.
- **Ya intentado, no repetir** — los caminos que no funcionaron y por qué.
  Esta sección es la que más tiempo ahorra; no la dejes vacía si hubo intentos fallidos.
- **Errores conocidos** — lo que sigue roto, con su arreglo si se conoce.

Marca en el plan de implementación las tareas terminadas.

## Lleva cada cosa a su archivo
- Decisiones técnicas que alguien podría cuestionar después → `docs/DECISIONES.md`.
- Arreglos de entorno, PATH, versiones o emulador → `docs/ENTORNO.md` (sirven para
  todos los proyectos, no solo para este).
- Requisitos que cambiaron de estado → `docs/REQUISITOS.md`.
- Respuestas nuevas del profesor → `docs/enunciado/aclaraciones.md`.

## Antes de terminar
- Si una fila de `docs/REQUISITOS.md` dice "Verificado" y no encuentras la evidencia,
  bájala y dímelo.
- No hagas commit. Muéstrame el diff de los archivos que cambiaste.
- Dime en una línea con qué debería arrancar la próxima sesión.
