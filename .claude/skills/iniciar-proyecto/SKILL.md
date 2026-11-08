---
name: iniciar-proyecto
description: Analiza el enunciado del profesor en docs/enunciado/ y lo convierte en requisitos verificables, trazabilidad y un plan. Úsalo al comenzar un proyecto académico nuevo, antes de programar.
---

# Iniciar proyecto académico

Objetivo: entender exactamente qué pide el profesor y convertirlo en requisitos
verificables y un plan. NO escribas código de la aplicación en esta etapa.

## 1. Lee todo el material
- Lee cada archivo de docs/enunciado/, incluidas imágenes, diagramas, tablas y anexos.
- Si hay un archivo que no puedes leer, dímelo y pídeme que lo exporte a PDF.
- No inventes datos. Si algo no está en el material, escríbelo como "No definido".
- `docs/enunciado/` no se edita nunca: es la fuente de verdad. Lo único que se escribe ahí
  es `aclaraciones.md`, con las respuestas del profesor.

## 2. Orden de prioridad de las fuentes
1. Instrucciones explícitas del profesor
2. Rúbrica
3. Documentos complementarios
4. Aclaraciones posteriores (docs/enunciado/aclaraciones.md)
5. Decisiones técnicas tuyas, justificadas
6. Mejoras opcionales
Si dos fuentes se contradicen, no elijas: cita ambas (archivo y sección) y ponlo en Dudas.

## 3. Uso de IA e integridad académica
- Busca en el material cualquier regla sobre uso de IA, autoría o declaración de herramientas.
- Si existe, cítala textualmente al inicio de tu análisis.
- Si no hay ninguna, indícalo y agrégalo a Dudas para que yo lo confirme con el profesor.

## 4. Completa docs/REQUISITOS.md
El archivo ya existe como plantilla. Llena la tabla:

| ID | Requisito | Tipo | Fuente | Implementación | Prueba | Estado |

- ID: RF-001 (funcional), RNF-001 (no funcional), RT-001 (restricción técnica),
  ENT-001 (entregable), EVA-001 (criterio de rúbrica).
- Tipo: Obligatorio / Inferido / Recomendado / Aclarar.
  Los Inferidos llevan una frase de por qué son necesarios.
- Fuente: archivo y sección o página exacta.
- Prueba: cómo se demostrará (test, captura en artifacts/, documento).
- Estado inicial: Pendiente.
Todo requisito Obligatorio debe tener una Prueba definida.

Llena también la sección "Rúbrica" con cada criterio, su peso si lo tiene
(nunca inventes porcentajes), qué evidencia lo demuestra y qué IDs lo cubren.

Cierra con las secciones "Dudas para el profesor" y "Decisiones provisionales":
cada duda numerada, y por cada una, la decisión que permite avanzar mientras responde.

## 5. Revisa la viabilidad en mi entorno
Trabajo en Windows con plan Pro de Claude. Revisa `docs/ENTORNO.md` y avísame de inmediato
si el enunciado:
- exige iOS, simulador de iOS o compilar para iPhone;
- exige una tecnología distinta de Expo/React Native (las herramientas cambian);
- requiere servicios de pago, cuentas de desarrollador o backend que no tengo;
- tiene un alcance que no cabe en el tiempo indicado.

## 5b. Revisa los scripts de verificación
Abre `package.json` y comprueba que existan `typecheck`, `lint` y `test`. La regla de
"terminado" de `CLAUDE.md` y el hook `verify.mjs` dependen de ellos; si faltan, no se
verifica nada sin avisar.
- `typecheck` lo añade el instalador (`tsc --noEmit`).
- Si falta `lint` o `test`, no los inventes: consulta la guía actual de Expo para
  configurar ESLint y pruebas unitarias con jest-expo, y propónme los comandos exactos
  en el plan. No instales nada hasta que yo apruebe el plan.

## 6. Completa el resto de la documentación
- `docs/BRIEF.md` (máximo 1 página): problema, objetivo, usuarios, alcance,
  entregables, fechas, restricciones.
- `docs/STATUS.md`: llena el plan de implementación con los IDs que cubre cada tarea.
- `docs/DECISIONES.md`: registra las decisiones técnicas que ya tomaste en esta etapa
  (stack elegido, estructura, qué queda fuera del alcance).
- En `CLAUDE.md`, actualiza solo las secciones Producto y Stack. Si el proyecto no tiene
  backend, no dejes reglas de datos que no aplican: dímelo y las quitamos.
No crees otros documentos sin preguntarme.

## 7. Propuesta técnica
- Respeta las tecnologías obligatorias. Si hay libertad, compara como máximo 2 opciones
  y recomienda la más simple que cumpla.
- Lista pantallas, navegación y flujos principales. Separa lo que pide el profesor de
  lo que tú propones.
- Plan por funcionalidades completas, primero todo lo Obligatorio. Las mejoras
  Recomendadas van al final y solo si sobra tiempo.
- El diseño va en `docs/DESIGN.md` como propuesta aparte, y no se implementa hasta que
  yo lo apruebe.

## 8. Entrégame este resumen y detente
1. Regla de uso de IA encontrada (o "no especificada")
2. Resumen del proyecto en 5 líneas
3. Conteo de requisitos por tipo y los criterios de rúbrica con más peso
4. Riesgos de viabilidad (sección 5)
5. Dudas para el profesor, numeradas
6. Propuesta técnica y plan de implementación
7. Archivos que creaste o modificaste
No empieces a implementar hasta que yo apruebe el plan.
