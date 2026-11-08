# Estado — Neurotrack EM

**Fecha:** 2026-11-08 · **Rama:** master · Últimos commits: 399a8e3 (chore: config+requisitos+diseño),
741ef4a (Initial commit). **Repo remoto creado y pusheado.** Sin commitear: nada (working tree
limpio tras el commit de esta sesión, salvo lo que cambie esta sesión de cierre: STATUS/REQUISITOS).

## ⚠️ Equipo y co-autoría Git (LEER ANTES DE CUALQUIER COMMIT)
Proyecto en equipo de 3. **TODO commit debe atribuir a los tres.** El autor es Samuel
(Git local del repo ya configurado como `SamuelBlanco-65`); los otros dos van como `Co-Authored-By`:
```
Co-Authored-By: Amelynhs <258035243+Amelynhs@users.noreply.github.com>
Co-Authored-By: MarianaTB-03 <257896164+MarianaTB-03@users.noreply.github.com>
```
- Samuel Blanco → `SamuelBlanco-65` (id 242230005) · correo Git local: `242230005+SamuelBlanco-65@users.noreply.github.com`
- Amelyn Hofmann → `Amelynhs` (id 258035243)
- Mariana Tirado → `MarianaTB-03` (id 257896164)
Repo: https://github.com/SamuelBlanco-65/NEUROTRACK_EM (público, `origin` configurado).
Verificado en esta sesión con un commit de prueba: los 3 avatares enlazaron en GitHub.

## Objetivo en curso
**Construir la app E2E contra la rúbrica REAL de Fase 3.** Ya NO hay bloqueadores:
- Llegó el **enunciado oficial de Fase 3** (`docs/enunciado/Course Project Phase 3...pdf`):
  trae rúbrica, entregables y formato. Dudas 1,2,4,5,6 RESUELTAS; abiertas solo la 3 (fecha) y 7.
- Llegó el **export de Stitch** (`docs/diseno/stitch-export/`, 56 pantallas con code.html + PNG).
- Decisiones nuevas: **Redux Toolkit** (D-005), documento final en **Markdown** (D-006),
  autoría Git con **Co-Authored-By + reparto de módulos** (D-007), **IA libre** sin declaración (D-008).
- `REQUISITOS.md` actualizado con la rúbrica real (EVA-001..004) y requisitos nuevos
  (ENT-001..005, RT-006, RT-007, accesibilidad ampliada en RNF-002/004/005).

Rúbrica: Documento 20% · Funcionalidad+Repo 30% · Presentación 10% · **Defensa individual 40%**.
Implicación clave: cada integrante debe escribir y ENTENDER su parte (30% + 40% lo exigen).

## T0 — Base: COMPLETO y verificado en emulador (2026-11-08)
- **Store Redux Toolkit** (`src/store/`: `profile-slice`, `settings-slice`), **tema accesible**
  (`src/theme/`: colores M3 del export de Stitch + oscuro derivado, tipografía Atkinson
  Hyperlegible Next, espaciado/radios/touch mínimo) y **navegación por perfil** con Expo Router
  (selección → `(paciente)`/`(cuidador)` con `NativeTabs`, pantallas stub con estado vacío) —
  Verificado: `expo-doctor` 20/20, `tsc`/`eslint` limpios, corrido en emulador Android con
  `agent-device`, capturas en `artifacts/t0/`.
- **Auditoría `accessibility-reviewer`**: sin hallazgos altos; 5 menores corregidos (ícono de
  check visible al seleccionar, `accessibilityRole="header"`, `accessibilityState busy`, nota de
  uso de `outline`, margen de contraste documentado). `docs/DESIGN.md` actualizado con los tokens
  reales y aprobado para T0.
- **Bug real encontrado y corregido en emulador**: la barra de `NativeTabs` no heredaba los
  colores del tema (se veía con el gris/lavanda por defecto de Android "Material You" en vez del
  crema/teal de Stitch) porque faltaban los props `backgroundColor`/`iconColor`/`labelStyle`/
  `indicatorColor` en `NativeTabs`. Corregido en `src/app/(paciente)/_layout.tsx` y
  `src/app/(cuidador)/_layout.tsx`. Esto confirma por qué verificar en emulador importa: no se
  habría detectado solo con lectura de código.
- **Diferencias pendientes contra el diseño de Stitch** (pantalla de selección de perfil):
  falta encabezado "NEUROTRACK EM · Paso 1 de 2", ilustración hero, íconos de persona/grupo en
  las tarjetas, y el enlace/modal "¿Qué es Neurotrack EM?". Son contenido/pulido de pantalla, no
  bugs — quedan para cuando se trabaje esa pantalla a fondo (fuera del alcance de T0).
- **`expo install --fix`**: 7 paquetes desactualizados (parche/menor) alineados a SDK 58.
- Capturas guardadas: `artifacts/t0/seleccion-perfil-2.png`, `paciente-inicio-fix.png`,
  `cuidador-inicio.png`.
- Requisitos actualizados: RT-001, RT-002 → Verificado. RT-006, RNF-003/004/005/007/009 →
  Implementado sin probar (ver detalle en `REQUISITOS.md`).

## Hecho en esta sesión (2026-11-08)
- **Llegó el enunciado oficial de Fase 3** (`docs/enunciado/Course Project Phase 3...pdf`).
  Verificado: leído con `pdftotext`. Trae rúbrica, entregables y formato. Se actualizaron
  `REQUISITOS.md` (rúbrica real EVA-001..004; nuevos ENT-001..005, RT-006, RT-007; accesibilidad
  ampliada en RNF-002/004/005; Dudas 1,2,4,5,6 resueltas), `DECISIONES.md` (D-005 Redux Toolkit,
  D-006 doc Markdown, D-007 autoría Git, D-008 IA libre) y `BRIEF.md`.
- **Repositorio GitHub creado y pusheado** — Verificado (push ok, `git remote -v` muestra origin):
  https://github.com/SamuelBlanco-65/NEUROTRACK_EM (público). Commit inicial del contenido:
  `399a8e3`, firmado por SamuelBlanco-65 con Co-Authored-By de Amelyn y Mariana (151 archivos).
- **Co-autoría de los 3 verificada** — Verificado: commit de prueba en repo temporal privado;
  el usuario confirmó que los 3 avatares enlazaban en GitHub. Correos noreply en la sección de
  arriba. Git local del repo reconfigurado a la cuenta correcta (SamuelBlanco-65, no Samuelsss-oss).
- **Colaboradoras invitadas** — Sin probar: invitaciones con permiso `write` enviadas a
  `Amelynhs` y `MarianaTB-03`; falta que ellas las **acepten** para commitear desde sus equipos.
- **Decisiones del usuario** — Redux Toolkit (estado global), documento final en Markdown,
  IA de uso libre (sin declaración), reparto de módulos confirmado (ver sección de equipo).

## Hecho en la última sesión (2026-11-03, 2ª)
- **Scaffold roto arreglado** — Verificado: `typecheck` y `lint` pasan (exit 0). Cambios:
  - `src/global.d.ts` (nuevo): declara módulos `*.module.css` y `*.css`.
  - `src/components/app-tabs.web.tsx`: cast del spread a `PressableProps` (fix del `ref`).
  - `src/hooks/use-color-scheme.web.ts`: `eslint-disable` justificado (setState de hidratación).
  - Ya NO hay conflicto de versión de ESLint: existe `eslint.config.js` (flat, `eslint-config-expo`)
    y `expo lint` corre bien.
- **MCP de Stitch DESCARTADO** — No se puede autenticar: el servidor OAuth de Google
  (`stitch.googleapis.com`) **no soporta dynamic client registration (DCR)**, así que ni el
  SDK ni la herramienta `mcp__stitch__authenticate` ni `/mcp` → Authenticate pueden registrar
  el cliente. Es limitación del lado de Google. Se usa la **web de Stitch** en su lugar.
  Acción pendiente del usuario: en `/mcp` elegir **Disable** para dejar de ver el aviso.

## Hecho en sesiones anteriores
- Lectura completa de la fuente de verdad (PDF) — Verificado: extraída con `pdftotext`.
- `docs/REQUISITOS.md`, `docs/BRIEF.md`, `docs/DECISIONES.md`, `docs/DESIGN.md` (propuesta),
  secciones Producto/Stack de `CLAUDE.md` y Dudas en `aclaraciones.md` — Sin probar:
  falta que el profesor responda las Dudas y que el usuario apruebe el diseño.
- `docs/diseno/prompts-stitch.md` — Verificado: 14 prompts (12 pantallas del plan + 2 de
  vinculación/consentimiento RF-012), con bloque de estilo base y estados.
- Averiguado que existe un **MCP oficial de Stitch** (`claude mcp add stitch --transport http
  https://stitch.googleapis.com/mcp`) para leer paleta/tipografía/estructura desde Stitch.
- Proyecto Expo andamiado con la plantilla por defecto de `create-expo`.

## Siguiente acción concreta
T0 completo y verificado (ver sección de arriba). Dos caminos posibles, a elegir con el usuario:
1) **Commitear T0** (con los 3 Co-Authored-By) antes de seguir, o
2) Arrancar **T0.5 — Capa de datos + auth**: proyecto Supabase, cliente, registro/login, sesión
   en almacenamiento seguro (`expo-secure-store`), manejo de errores de red y offline.
   (RF-011, RNF-012, RT-004).
**Recordatorio: cada commit con los 3 Co-Authored-By (ver sección de equipo arriba).**
**El servidor de Expo (`npx expo start --android`) puede seguir corriendo en background de la
sesión anterior — revisar antes de levantar otro.**
Pendientes en paralelo (no bloquean T0):
- Confirmar la **fecha de entrega** con el profesor (Duda 3, única duda crítica abierta).
- Que Amelyn y Mariana **acepten** la invitación de colaboración del repo.
- Borrar el repo de prueba temporal `coauthor-test` (requiere scope `delete_repo` o hacerlo por web).
- Más adelante: `docs/ENTREGA-FINAL.md` (ENT-002) y `README.md` (ENT-003).

## Ya intentado, no repetir
- Leer el PDF con el visor integrado (`Read` con `pages`): falla, falta `pdftoppm`.
  Usar `pdftotext -layout` (disponible en `/mingw64/bin`).
- **Autenticar el MCP de Stitch: NO reintentar.** Falla siempre con
  `Incompatible auth server: does not support dynamic client registration`. El servidor OAuth
  de Google no soporta DCR; ni SDK, ni la tool `mcp__stitch__authenticate`, ni `/mcp` →
  Authenticate lo resuelven. Diseño por la **web de Stitch** + export, no por MCP.
- **Borrar repos con `gh repo delete`: falla** con HTTP 403 "needs delete_repo scope". El token
  de `gh` tiene scopes `gist, read:org, repo` (sin `delete_repo`). Para borrar: `gh auth refresh
  -h github.com -s delete_repo` (interactivo, lo corre el usuario) o borrar por la web.
- **No usar la cuenta `Samuelsss-oss`** (correo `samuelsblancog@gmail.com`) para commits del
  proyecto: es una cuenta vieja de Samuel. La de la materia es `SamuelBlanco-65`. El Git local
  del repo ya está configurado correcto; no revertir.

## Errores conocidos
- `package.json` no tiene script `test`: la regla de "terminado" no corre pruebas. Pendiente
  de añadir jest-expo (ver Decisión D-004) una vez aprobado; no instalar antes.
- ~~El scaffold por defecto NO compila ni pasa lint~~ **RESUELTO (2026-11-03, 2ª sesión).**
  `typecheck` y `lint` pasan (exit 0). Ver "Hecho en la última sesión" para los 3 cambios.
  El conflicto de versión de ESLint ya no existe (`eslint.config.js` flat presente).
- El commit "Initial commit" (741ef4a) quedó atribuido a la cuenta vieja `Samuelsss-oss`. Es
  solo uno; se deja así salvo que se decida reescribir historial. Los commits nuevos ya van a
  `SamuelBlanco-65` + co-autores.
- **Fecha de entrega: DESCONOCIDA** (Duda 3). El enunciado de Fase 3 es tajante ("un minuto
  tarde = no se acepta") pero no da fecha/hora. Confirmar con el profesor cuanto antes.
- **Node v20.20.2 está por debajo del mínimo de Expo SDK 58 (≥22.13).** `npx expo install` y
  `npx expo lint` avisan/bloquean por esto; `npx eslint` directo y `npx tsc` sí funcionan. No
  bloqueante todavía, pero conviene actualizar Node pronto (`winget install OpenJS.NodeJS.LTS`,
  ver `docs/ENTORNO.md`). `agent-device` ya requiere Node ≥22.12 y está instalado aparte.
- **`NativeTabs` no hereda el tema solo:** si no se le pasan `backgroundColor`/`iconColor`/
  `labelStyle`/`indicatorColor` explícitamente, Android le aplica su estilo "Material You" por
  defecto (gris/lavanda), no el tema de la app. Siempre pasar esos props con los tokens de
  `src/theme/` en cualquier `_layout.tsx` nuevo que use `NativeTabs`.

## Plan de implementación
_(Cada tarea indica los IDs de requisito que cubre. Orden pensado para que siempre
haya algo funcionando. Obligatorio primero; recomendados al final.)_
- [ ] **T0. Base** — tokens de tema accesibles (`src/theme/`), navegación por perfil,
  estados carga/error/vacío, accesibilidad ampliada (`Label/Hint/Role/State`, `hitSlop`,
  `lineHeight`, `testID`) y store de **Redux Toolkit** (`src/store/`). (RT-001, RT-006, RNF-001..009)
- [ ] **T0.5. Capa de datos + auth** — proyecto Supabase, cliente, registro/login, sesión
  en almacenamiento seguro, manejo de errores y offline. (RF-011, RNF-012, RT-004)
- [ ] **T1. Síntomas** — registro + calendario, persistidos con sync. (RF-001, RF-002)
- [ ] **T2. Actividades** — set reducido (1–2 cognitivas + 1 motriz), dificultad progresiva. (RF-003, RF-004)
- [ ] **T3. Progreso** — historial y comparación actual vs pasado. (RF-005)
- [ ] **T4. Cuidador** — vinculación con consentimiento, observaciones, recordatorios
  (visual+háptica), acceso sincronizado a lo autorizado. (RF-006, RF-008, RF-012)
- [ ] **T5. Apoyo/Info** — contenidos de apoyo; subtítulos si hay audiovisual. (RF-009, RF-010)
- [ ] **T6. Accesibilidad + pruebas** — pase de accesibilidad y pruebas jest-expo de la lógica. (RNF-*, pruebas)
- [ ] **T7. Extensiones (si sobra tiempo)** — voz/dictado, versión auditiva, perfil médico. (REC-001..003)
- [ ] **T8. Documento Final** — `docs/ENTREGA-FINAL.md`: 5 secciones, matriz competitiva (Fase 1),
  diagrama de arquitectura E2E, **matriz trazable de accesibilidad** (mejora → archivo → prueba),
  pruebas y conclusiones; refs IEEE/APA. (ENT-002, EVA-001)
- [ ] **T9. README + entrega** — `README.md` (instalación, env vars, arquitectura, ejecución,
  accesibilidad); guion de demo en vivo; verificar commits equitativos de los 3. (ENT-003, ENT-004, RT-007)
- [ ] **Transversal. Defensa individual** — repartir módulos por integrante y que cada quien
  entienda su código (estado, navegación, datos, accesibilidad). (ENT-005, EVA-004, 40%)
