---
name: pantalla-nueva
description: Crea una pantalla o ruta nueva siguiendo las reglas del proyecto (tokens de tema, estados de carga/error/vacío, accesibilidad y pruebas). Úsalo al añadir cualquier pantalla con Expo Router.
---

# Pantalla nueva

## 1. Antes de escribir nada
- Confirma a qué requisito de `docs/REQUISITOS.md` corresponde esta pantalla.
  Si no corresponde a ninguno, pregúntame antes de crearla: no inventes alcance.
- Lee `docs/DESIGN.md`. Si el diseño no cubre esta pantalla, propón la ficha visual
  (secciones, jerarquía, estados) y espera aprobación antes de maquetar.
- Mira cómo está organizado el proyecto en vez de asumirlo: algunas versiones de Expo
  usan `app/` en la raíz y otras `src/app/`. Usa la que exista.

## 2. Estructura
- El archivo de ruta queda delgado: resuelve navegación y parámetros, y delega la UI.
- La UI va en `src/components/` (si es reutilizable) o `src/features/<feature>/`
  (si es propia de esa funcionalidad).
- Nada de lógica de negocio en el archivo de ruta ni en el componente de presentación.

## 3. Estados obligatorios
Toda pantalla que dependa de datos asíncronos implementa los tres:
- **Carga:** indicador visible, sin dejar la pantalla en blanco.
- **Error:** mensaje entendible (no el error técnico crudo) y una forma de reintentar.
- **Vacío:** explica qué falta y qué puede hacer el usuario, no solo "Sin datos".

Si la pantalla no depende de datos asíncronos, dilo en el reporte en lugar de
añadir estados falsos.

## 4. Reglas de la UI
- Colores, tipografía, espaciado y radios solo desde `src/theme/`. Ningún literal.
- Todo control interactivo: `testID` y `accessibilityLabel` descriptivo (lo que hace,
  no "botón"). Añade `accessibilityRole` y `accessibilityState` cuando aplique.
- Área táctil mínima 48×48 dp.
- Respeta los márgenes seguros (barra de estado, gestos, notch).
- Textos que puedan crecer: `numberOfLines` y comportamiento definido, no desbordes.

## 5. Navegación
- Rutas tipadas. Por parámetros viajan solo valores serializables: ids y strings,
  nunca objetos grandes ni funciones.
- Si la pantalla necesita datos que ya están en el estado global, que los lea ella misma
  en vez de recibirlos por parámetros.

## 6. Pruebas
- Prueba la lógica (mapeo de datos, validaciones, condiciones de los estados), no los píxeles.
- Lo visual se verifica con `/revisar-ui`, no con pruebas unitarias.

## 7. Al terminar
1. `npm run typecheck`, `npm run lint`, `npm test`.
2. Ejecuta `/revisar-ui` para capturar la pantalla en el emulador.
3. Actualiza la fila del requisito en `docs/REQUISITOS.md` (solo "Verificado" si hay captura).
4. Explícame en 3–5 líneas qué hace la pantalla y por qué está estructurada así.

Reporta: archivos creados o modificados, requisitos que cubre, qué quedó pendiente.
