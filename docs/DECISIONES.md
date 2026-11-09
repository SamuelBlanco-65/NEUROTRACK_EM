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

## D-009 · Actividades (T2): "Lógica" queda bloqueada sin juego real; Memoria falla rápido

- **Fecha:** 2026-11-08
- **Estado:** Vigente
- **Contexto:** RF-003 exige 1-2 actividades cognitivas, no las 4 que insinúa el export de
  Stitch (Memoria, Atención, Movimiento, Lógica). El export muestra "Lógica" bloqueada hasta
  nivel 3 de Memoria, pero no hay un diseño de ese juego. Además, el juego de Memoria
  (repetir una secuencia de figuras) inicialmente esperaba a que se agotaran todos los toques
  para evaluar, lo que permitía seguir tocando después de ya haberse equivocado.
- **Decisión:**
  1. Implementar solo Memoria + Atención (cognitivas) y Movimiento (motriz) — cumple RF-003/
     RF-004 sin inventar contenido de Lógica que no está diseñado. El tile "Lógica" se deja
     siempre bloqueado con el mismo texto del export ("se abre al llegar a nivel 3 de
     Memoria"), para no prometer una pantalla que no existe.
  2. El juego de Memoria **falla rápido**: un toque fuera de orden termina la ronda de
     inmediato (no se espera a agotar los toques). Se decidió así tras una observación directa
     del usuario de que el resaltado de "correcto" en una figura podía convivir con un
     resultado final de "incorrecto" si solo se evaluaba al final — confuso y, para un público
     con fatiga cognitiva, contraproducente.
  3. Se agregó **`expo-haptics`** (no estaba instalado) para dar vibración de éxito/error en
     cada toque de Memoria — cierra un hueco real de RNF-009 ("háptica complementaria") que
     antes decía "aún no aplica".
- **Alternativas consideradas:** Implementar Lógica con un mini-juego inventado — descartado,
  habría sido contenido no pedido por el enunciado y sin diseño de Stitch que lo respalde.
- **Consecuencias:** RF-003/RF-004 cubiertos con alcance defendible. Si más adelante se agrega
  Lógica, hay que decidir su propio diseño desde cero (no hay export de Stitch de esa pantalla).
- **Requisitos relacionados:** RF-003, RF-004, RNF-009

---

## D-010 · Vinculación paciente-cuidador (T4): código de 6 caracteres, sin tabla de perfiles, sin "notas" del paciente

- **Fecha:** 2026-11-08
- **Estado:** Vigente (RF-012 implementado sin probar, ver `docs/STATUS.md`)
- **Contexto:** RF-012 exige vínculo con consentimiento explícito y acceso del cuidador
  restringido por RLS a lo que el paciente autorice (D-002). El export de Stitch sugiere un
  código de invitación de 6 caracteres y una pantalla de permisos granulares por categoría.
- **Decisión:**
  1. **Código corto reclamable, no QR ni enlace profundo**: más simple de implementar sin
     `expo-camera`/deep linking, y suficiente para el caso de uso (cuidador y paciente están
     juntos o se llaman por teléfono al vincularse).
  2. **`caregiver_email`/`caregiver_name` se guardan directo en la fila de `caregiver_links`**
     en el momento en que el cuidador reclama el código, en vez de hacer join contra
     `auth.users` desde el cliente — Supabase no expone `auth.users` a `authenticated` por
     RLS, y crear una tabla de perfiles espejo es más alcance del que da tiempo en esta ronda.
  3. **El toggle "Mis notas" del export de Stitch se dejó fuera** de los permisos
     (`share_sintomas`/`share_progreso`/`share_recordatorios` sí se implementaron): no existe
     ninguna funcionalidad de "notas personales del paciente" en el MVP, así que el permiso no
     tendría nada que controlar. Si se agrega esa funcionalidad más adelante, se añade el flag.
- **Alternativas consideradas:** Tabla `profiles` espejo de `auth.users` con trigger de
  sincronización — da nombres/correos siempre actualizados, pero es infraestructura adicional
  no pedida por ningún RF; se deja como mejora futura si hace falta en otro módulo.
- **Consecuencias:** El nombre/correo del cuidador que ve el paciente queda "congelado" al
  momento de la solicitud (no se actualiza si el cuidador cambia su nombre después). Aceptable
  para el alcance del semestre.
- **Requisitos relacionados:** RF-012, RNF-012

---

## Cosas que el material pedía y quedan fuera (con su razón)
- **Perfil del médico** — marcado como opcional/futuro en §I-C y §IV-C. (REC-003)
- **Biomarcadores / sensores / wearables** — requieren validación clínica y años de estudio
  fuera del alcance del semestre (§IV-C). (RT-003)
- **Versión auditiva completa de las actividades y voz/dictado** — el propio artículo los deja
  como extensión si el tiempo lo permite (§V-D6). (REC-001, REC-002)
