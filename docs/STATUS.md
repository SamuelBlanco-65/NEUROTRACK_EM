# Estado — Neurotrack EM

**Fecha:** 2026-11-07 · **Rama:** master · Últimos commits: 741ef4a (Initial commit).
Sin commitear: documentación de `/iniciar-proyecto` (docs/, .claude/) + arreglos del scaffold.
Nada committeado aún.

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
El scaffold compila (typecheck + lint pasan). Export de Stitch y rúbrica disponibles.
1) **T0 — Base**: tokens de tema accesibles en `src/theme/` a partir del export de Stitch,
   navegación por perfil (paciente/cuidador), estados carga/error/vacío, y props de
   accesibilidad (`accessibilityLabel/Hint/Role/State`, `hitSlop`, `lineHeight`, `testID`).
   Montar el store de **Redux Toolkit** (D-005) en `src/store/`.
2) Validar paleta con `accessibility-reviewer` (RNF-003) y dejar `docs/DESIGN.md` aprobado.
Pendientes en paralelo:
- Conseguir **correos de GitHub de Amelin y Mariana** para configurar Co-Authored-By (D-007).
- Confirmar la **fecha de entrega** con el profesor (Duda 3).
- Primer **commit** (docs/ + .claude/ + arreglos del scaffold); aún no se ha hecho.
- Más adelante: crear `docs/ENTREGA-FINAL.md` (documento final, ENT-002) y `README.md` (ENT-003).

## Ya intentado, no repetir
- Leer el PDF con el visor integrado (`Read` con `pages`): falla, falta `pdftoppm`.
  Usar `pdftotext -layout` (disponible en `/mingw64/bin`).
- **Autenticar el MCP de Stitch: NO reintentar.** Falla siempre con
  `Incompatible auth server: does not support dynamic client registration`. El servidor OAuth
  de Google no soporta DCR; ni SDK, ni la tool `mcp__stitch__authenticate`, ni `/mcp` →
  Authenticate lo resuelven. Diseño por la **web de Stitch** + export, no por MCP.

## Errores conocidos
- `package.json` no tiene script `test`: la regla de "terminado" no corre pruebas. Pendiente
  de añadir jest-expo (ver Decisión D-004) una vez aprobado; no instalar antes.
- ~~El scaffold por defecto NO compila ni pasa lint~~ **RESUELTO (2026-11-03, 2ª sesión).**
  `typecheck` y `lint` pasan (exit 0). Ver "Hecho en la última sesión" para los 3 cambios.
  El conflicto de versión de ESLint ya no existe (`eslint.config.js` flat presente).

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
