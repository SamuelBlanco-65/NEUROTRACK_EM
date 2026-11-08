# Decisiones técnicas — Neurotrack EM

Una entrada por decisión que alguien podría cuestionar después ("¿por qué está hecho así?").
Sirve para el README, para el video y para no re-discutir lo mismo en otra sesión.

No se borran entradas: si una decisión se revierte, se añade una nueva que la reemplaza
y se marca la anterior como **Reemplazada por D-00X**.

---

## D-001 · Stack Expo / React Native con Expo Router

- **Fecha:** 2026-11-03
- **Estado:** Vigente
- **Contexto:** El entorno del equipo es Windows con verificación solo en Android; el repo
  ya viene andamiado con la plantilla por defecto de `create-expo` (SDK 58, Expo Router).
- **Decisión:** Mantener Expo + React Native + Expo Router. Las rutas viven en `src/app/`;
  el resto (componentes, hooks, utils, tema) fuera de `src/app/`.
- **Alternativas consideradas:** Ninguna; es el stack del entorno y del andamiaje existente.
- **Consecuencias:** Buena compatibilidad con el entorno y las skills del proyecto. SDK 58 es
  muy reciente: hay que consultar docs versionadas antes de cada API (la memoria no es fiable).
- **Requisitos relacionados:** RT-001, RT-005

---

## D-002 · Backend real con Supabase (cuentas + sincronización)

- **Fecha:** 2026-11-03
- **Estado:** Vigente
- **Contexto:** La propuesta exige que el cuidador acceda a registros del paciente "con
  autorización" (§II-C, §IV-B). El usuario decidió sincronización real entre dispositivos,
  no una simulación local.
- **Decisión:** Usar **Supabase** (Auth + Postgres + Row Level Security) en su capa gratuita.
  Las reglas RLS garantizan que el cuidador solo vea lo autorizado por el paciente.
- **Alternativas consideradas:** (a) Local-only sin backend — descartada porque no da sync
  entre dispositivos; (b) Firebase — alternativa válida, pero Supabase da Postgres + RLS con
  un modelo de permisos más directo para el caso "acceso con autorización".
- **Consecuencias:** Requiere crear una cuenta/proyecto en Supabase (la crea el usuario) y
  manejar auth, sesión segura, errores de red y estado offline. Añade superficie de seguridad
  (datos de salud sensibles → RNF-012). No es un backend clínico ni de diagnóstico (RT-004).
- **Requisitos relacionados:** RF-011, RF-012, RNF-012, RT-004

---

## D-003 · Alcance del MVP = §IV-C del artículo; médico y sensores fuera

- **Fecha:** 2026-11-03
- **Estado:** Vigente
- **Contexto:** No hay enunciado ni rúbrica del profesor; la fuente de verdad es la propuesta
  del propio equipo. El §IV-C fija explícitamente qué es viable en el semestre.
- **Decisión:** Construir síntomas + calendario, set reducido de actividades y módulo básico
  del cuidador. Dejar fuera biomarcadores, sensores/wearables, validación clínica y el perfil
  del médico (trabajo futuro).
- **Alternativas consideradas:** Intentar todo el producto descrito — descartado por tiempo y
  porque el propio artículo lo marca fuera de alcance.
- **Consecuencias:** Alcance acotado y defendible. Lo que queda fuera se documenta aquí y en
  REQUISITOS para no parecer un olvido.
- **Requisitos relacionados:** RF-001..RF-010, RT-003, REC-003

---

## D-004 · Pruebas con jest-expo

- **Fecha:** 2026-11-03
- **Estado:** Vigente (pendiente de instalación tras aprobación)
- **Contexto:** `package.json` no tiene script `test`; la regla de "terminado" y el hook
  `verify.mjs` lo usan. Sin él, la lógica queda sin pruebas automáticas.
- **Decisión:** Añadir **jest-expo** y un script `test`, enfocado en lógica (reducers,
  selectores, validaciones, mapeo de datos). Los comandos exactos se confirman contra la guía
  de Expo SDK 58 antes de instalar.
- **Alternativas consideradas:** No tener pruebas — descartado porque incumple la regla de
  "terminado" del proyecto.
- **Consecuencias:** Verificación más fuerte; algo más de setup (posible ajuste de
  `transformIgnorePatterns` y tipos de jest en `tsconfig.json`, ver `docs/ENTORNO.md`).
- **Requisitos relacionados:** Pruebas de RF-001..RF-012 y RNF-012

---

## D-005 · Estado global con Redux Toolkit

- **Fecha:** 2026-11-07
- **Estado:** Vigente
- **Contexto:** El enunciado de Fase 3 (§2) pide explícitamente gestión de estado global "con
  Redux Toolkit o Context" y la defensa individual (40%) interroga sobre el manejo de estado.
  La app tiene auth, sesión, sync, offline y permisos del cuidador: varios estados asíncronos.
- **Decisión:** Usar **Redux Toolkit** (store + slices tipados; async con createAsyncThunk o
  RTK Query). Elegido por el usuario.
- **Alternativas consideradas:** Context API + hooks — más simple de explicar, pero se queda
  corto para async/caché/offline y para una defensa técnica sólida del flujo de datos.
- **Consecuencias:** Más estructura y trazabilidad del estado (bueno para la defensa), a cambio
  de algo de boilerplate que todos deben entender. Store en `src/store/` (fuera de `src/app/`).
- **Requisitos relacionados:** RT-006, ENT-005

---

## D-006 · Documento Técnico Final en Markdown dentro del repo

- **Fecha:** 2026-11-07
- **Estado:** Vigente
- **Contexto:** Fase 3 §2/§7 exige un documento final de 5 secciones (5–8 págs, refs IEEE/APA)
  en `/docs` o la raíz. El formato puede ser PDF o Markdown con diagramas renderizados.
- **Decisión:** Escribirlo como **`docs/ENTREGA-FINAL.md`** (Markdown versionado) y exportar a
  PDF al final. Elegido por el usuario.
- **Alternativas consideradas:** PDF directo — mejor control visual pero no versiona junto al
  código ni evoluciona con el repo.
- **Consecuencias:** El documento vive y cambia con el código; diagramas como imágenes o Mermaid.
- **Requisitos relacionados:** ENT-002, EVA-001

---

## D-007 · Autoría equitativa en Git (Co-Authored-By + reparto de módulos)

- **Fecha:** 2026-11-07
- **Estado:** Vigente (pendiente de los correos de GitHub de Amelin y Mariana)
- **Contexto:** Fase 3 §3 (30%) puntúa un historial de commits con participación equitativa de
  los 3 integrantes, y el 40% es defensa individual del propio código.
- **Decisión:** Commits con `Co-Authored-By:` para el trabajo preparado en conjunto **y** reparto
  de módulos por integrante (p. ej. cuidador / actividades-progreso / síntomas-datos) para que
  cada quien pueda defender su parte. No se falsea autoría con `--author`.
- **Alternativas consideradas:** Sobrescribir `--author` por commit — descartado: afirma autoría
  que no se puede defender en el 40%.
- **Consecuencias:** Participación visible y contable en GitHub (si los correos están vinculados)
  sin riesgo en la defensa. Falta: correos de GitHub de Amelin y Mariana.
- **Requisitos relacionados:** RT-007, ENT-005, EVA-002

---

## D-008 · Uso libre de IA, sin declaración obligatoria

- **Fecha:** 2026-11-07
- **Estado:** Vigente
- **Contexto:** Duda 4 resuelta por el profesor: el uso de IA es libre.
- **Decisión:** No se incluye declaración de uso de IA en el documento final. Se mantiene el
  foco en que cada integrante entienda y pueda defender su código (requisito de la defensa).
- **Consecuencias:** Ninguna sección extra en el documento. (Reemplaza la decisión provisional
  previa de "trabajar como si hubiera que declarar el uso de IA".)
- **Requisitos relacionados:** ENT-002

---

## Cosas que el material pedía y quedan fuera (con su razón)
- **Perfil del médico** — marcado como opcional/futuro en §I-C y §IV-C. (REC-003)
- **Biomarcadores / sensores / wearables** — requieren validación clínica y años de estudio
  fuera del alcance del semestre (§IV-C). (RT-003)
- **Versión auditiva completa de las actividades y voz/dictado** — el propio artículo los deja
  como extensión si el tiempo lo permite (§V-D6). (REC-001, REC-002)
