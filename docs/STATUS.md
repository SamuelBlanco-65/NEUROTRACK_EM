# Estado — Neurotrack EM

**Fecha:** 2026-11-08 · **Rama:** master · Últimos commits: b09139c (feat(T0.5): capa de datos
y autenticación con Supabase), 2c1190c (feat(T0): base de navegación, tema accesible y store
Redux Toolkit), 399a8e3 (chore: config+requisitos+diseño), 741ef4a (Initial commit).
**Repo remoto creado y pusheado.** `git status` limpio: nada sin commitear al cerrar esta sesión.
**Queda vivo un Metro de esta sesión:** `npx expo start --android` en el puerto **8081**, app
abierta en el emulador vía Expo Go, lista para que el usuario pruebe T1 manualmente (login,
registro de síntomas, calendario). **Revisa antes de levantar uno nuevo**: `netstat -ano | grep
808` y, si sigue vivo, o lo reusas o lo matas con `taskkill //PID <pid> //F` antes de abrir
otro — tener dos Metro conectados al mismo emulador causó un bug real en una sesión anterior
(ver "Ya intentado, no repetir").

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

## T0.5 — Capa de datos + auth: COMPLETO y verificado en emulador (2026-11-08)
- **Proyecto Supabase creado** por el usuario (dashboard web). Claves en `.env` (fuera de git,
  bloqueado por hook del proyecto para que Claude no lo lea/escriba) y `.env.example` con los
  nombres (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — la *publishable
  key* es pública por diseño, equivalente a la antigua `anon key`).
- **`src/lib/supabase.ts`**: cliente Supabase con sesión persistida vía patrón `LargeSecureStore`
  (AES-256 + clave corta en `expo-secure-store`, blob cifrado en `@react-native-async-storage/
  async-storage`). Necesario porque `expo-secure-store` solo permite ~2048 bytes por valor en
  Android y el JWT de sesión de Supabase lo supera; con el adaptador simple la sesión nunca
  sobrevivía a un reinicio (bug real encontrado y corregido en esta sesión, ver "Bugs" abajo).
- **`src/features/auth/`**: `api.ts` (signIn/signUp/signOut/getActiveSession contra Supabase,
  clasificación de errores sin-conexión/credenciales/validación/servidor en español) y
  `types.ts`. **`src/store/slices/auth-slice.ts`**: estado `bootstrapping|unauthenticated|
  authenticating|authenticated`, thunks de login/register/logout/bootstrap, maneja el caso
  "registro exitoso pero correo sin confirmar" (`pendingConfirmationEmail`) sin autenticar en falso.
- **Pantalla `src/app/(auth)/acceder.tsx`**: login + registro en una sola pantalla con pestañas
  (fiel al export de Stitch `acceder_iniciar_sesi_n` / `acceder_crear_cuenta`), `TextField`
  reutilizable (`src/components/text-field.tsx`) con validación de borde doble-codificada
  (ícono + texto + borde, nunca solo color — RNF-006), estado "Enviando..." con spinner, aviso
  de confirmación de correo pendiente. `ScrollView` + `KeyboardAvoidingView` para que los campos
  no queden tapados por el teclado (bug real encontrado y corregido).
- **`src/app/index.tsx`** y **`src/app/_layout.tsx`** actualizados: bootstrap de sesión al
  arrancar (antes de ocultar el splash), redirección a `/(auth)/acceder` si no hay sesión al
  elegir perfil, redirección directa a inicio si ya está autenticado.
- **Verificado end-to-end en emulador (`agent-device`/`adb`)**: registro real contra Supabase,
  inicio de sesión real, error "correo no confirmado" traducido y con ícono, aviso de cuenta
  creada pendiente de confirmar, persistencia de sesión real tras reinicio de la app (una vez
  arreglado el bug de SecureStore). Capturas en `artifacts/t05/`.
- **Bugs reales encontrados y corregidos en esta sesión** (ninguno se habría visto solo
  leyendo código):
  1. `signIn`/`signUp` armaban la "sesión" a partir de `data.user` en vez de `data.session` →
     con confirmación de correo obligatoria (activada en este proyecto Supabase), un registro
     sin confirmar *parecía* autenticar y redirigía a Inicio, pero no había sesión real: al
     reiniciar la app, se perdía. Corregido en `features/auth/api.ts` para usar `data.session`.
  2. Mensaje de error de Supabase ("Email not confirmed") llegaba crudo en inglés a la UI.
     Corregido con clasificación explícita en `toAuthError`.
  3. `expo-secure-store` limita cada valor a ~2048 bytes en Android; el JWT de Supabase lo
     excede y el `setItemAsync` fallaba silenciosamente. Corregido con el patrón
     `LargeSecureStore` (ver arriba).
  4. Quedó un proceso de Metro viejo corriendo en el puerto 8081 de una sesión anterior
     (lo advertía este mismo STATUS). El emulador quedó conectado a los dos bundles a la vez,
     causando un error real (`Cannot read property 'status' of undefined`) por inconsistencia
     de módulos entre Fast Refresh de dos instancias. Cerrado (`taskkill`), confirmado con el
     usuario antes de matarlo.
  5. Falla de automatización (no bug de la app): `adb shell input text` con espacios literales
     corta la cadena; usar `%s`. Y los taps con coordenadas fijas se desalinean en cuanto el
     teclado abre o hay un banner de error que desplaza el layout — hay que recapturar antes de
     cada tap en vez de encadenar coordenadas a ciegas.
- Pendiente para T1: RLS en las tablas de dominio (aún no hay tablas más allá de auth).
- Requisitos actualizados: **RF-011 → Verificado**. RNF-012 → Implementado sin probar (falta RLS).

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

## T1 — Síntomas: COMPLETO y verificado en emulador (2026-11-08)
- **RF-001 (registro) + RF-002 (calendario) Verificados.** Código:
  - `supabase/migrations/20261108000000_symptom_logs.sql`: tabla `symptom_logs` + RLS
    (`auth.uid() = patient_id`). **Ya ejecutada por el usuario en el SQL Editor de Supabase.**
  - `src/features/symptoms/` (types, constants, api, calendar, wizard-header, wizard-actions).
  - `src/store/slices/symptoms-slice.ts` (draft del wizard + caché de registros por mes),
    registrado en `src/store/store.ts`.
  - `src/app/registrar-sintoma/` (paso-1 tipo de síntoma, paso-2 severidad, paso-3 nota+guardar;
    modal de 3 pasos siguiendo `docs/diseno/stitch-export/paciente_registrar_c_mo_me_siento_paso_2
    /3`; el paso 1 no está en el export, se diseñó igual a los otros 2 — aprobado por el usuario).
  - `src/app/(paciente)/calendario.tsx` reescrito (antes era `TabScreenStub`): grid del mes,
    detalle del día, FAB "Registrar", estados carga/error/vacío.
  - Ficha completa aprobada por el usuario antes de maquetar (lista de tipos de síntoma fija:
    Fatiga/Visión borrosa/Dolor/Debilidad/Equilibrio/Otro; dictado por voz del export queda
    fuera, es REC-001).
- `typecheck` y `lint` pasan limpio.
- **Verificado en emulador (`agent-device`/`adb`) con cuenta real de Supabase:**
  flujo completo paso 1→2→3 dos veces (con nota y sin nota), vuelta automática al calendario,
  indicador de día y detalle con 1 y luego 2 registros, badge de severidad con ícono+texto.
  Capturas en `artifacts/t1/`: `wizard-paso1.png`, `wizard-paso2.png`, `wizard-paso3.png`,
  `calendario-vacio-hoy.png`, `calendario-dia-con-registros.png`.
- **Bugs reales encontrados y corregidos durante la verificación:**
  1. `src/app/(auth)/acceder.tsx`: el error de `register` solo se mostraba en `mode === 'login'`;
     en modo "Crear cuenta" un fallo (correo duplicado, rate limit, etc.) no mostraba nada —
     parecía que el botón no hacía nada. Arreglado: el error se muestra en ambos modos.
  2. `src/features/symptoms/api.ts`: `toSymptomsError` usaba `error instanceof PostgrestError`,
     que en este runtime nunca era `true` (cualquier error de Supabase caía al mensaje genérico
     "Algo salió mal"). Cambiado a detección por duck-typing (`code`/`message`) + caso explícito
     para tabla inexistente (`PGRST205`) + `console.warn` para errores verdaderamente inesperados.
  3. `createSymptomLog` dejaba `occurred_at` al default `now()` del servidor; se cambió a mandar
     el reloj del dispositivo (`new Date().toISOString()`) para que coincida siempre con el "hoy"
     que calcula el calendario del lado del cliente.
- **No verificado con captura dedicada:** estado de error de red del calendario (código revisado,
  lógicamente correcto) y navegación entre meses con datos.
- Durante la sesión se encontró un `TurboModuleRegistry: 'RNGetRandomValues' could not be found`
  causado por el estado nativo/JS desincronizado tras varios *reloads* con `adb am start` sobre
  un proceso backgrounded — **se resolvió con `adb shell am force-stop host.exp.exponent` +
  reabrir** (reinicio completo, no solo recarga de JS). Si vuelve a pasar, ese es el arreglo.

## Siguiente acción concreta
**Arrancar T2** (siguiente del plan: actividades de estimulación cognitiva/motriz — RF-003/RF-004)
o el ítem que el usuario priorice. T1 queda cerrado: RF-001 y RF-002 Verificados en
`docs/REQUISITOS.md`.

Pendientes en paralelo (no bloquean lo anterior):
- Confirmar la **fecha de entrega** con el profesor (Duda 3, única duda crítica abierta).
- Que Amelyn y Mariana **acepten** la invitación de colaboración del repo.
- Borrar el repo de prueba temporal `coauthor-test` (requiere scope `delete_repo` o hacerlo por web).
- Más adelante: `docs/ENTREGA-FINAL.md` (ENT-002), `README.md` (ENT-003), RLS cuando existan
  tablas de dominio.

## Ya intentado, no repetir
- **No usar coordenadas "a ojo" leídas de una captura para `adb shell input tap`: fallan
  silenciosamente.** Varias veces un tap que se veía centrado en el botón (según el PNG) no
  disparaba nada — probablemente porque el PNG se escala (0.3x o el factor que use la captura)
  y las coordenadas reales del dispositivo no coinciden 1:1 con los píxeles del PNG. **Técnica
  que sí funciona siempre:** `adb shell uiautomator dump //sdcard/window_dump.xml` +
  `adb pull //sdcard/window_dump.xml` y leer el `bounds="[x1,y1][x2,y2]"` del elemento por su
  `resource-id` (el `testID` de RN se expone ahí tal cual) o `content-desc` (el
  `accessibilityLabel`), y tapear el centro exacto de esos bounds. En Git Bash, usar `//sdcard/…`
  (doble slash) para que no traduzca la ruta como si fuera de Windows.
  El `mcp__plugin_expo_expo__automation_*` no sirvió: pide `simulatorSessionId` (EAS Simulator,
  de pago) o un túnel `expo-mcp` que no estaba conectado con solo pasar `projectRoot`.
- El autocompletado de Android (Gboard) puede **pisar el contenido de un `TextInput`** con un
  valor guardado de un intento anterior en el mismo campo, sobre todo justo después de que
  aparece el teclado. Si un campo muestra texto raro tras escribir, no asumas que tu `input text`
  falló: limpia con `KEYCODE_MOVE_END` + varios `KEYCODE_DEL` y vuelve a escribir, y verifica con
  una captura antes de seguir al siguiente campo.
- **No asumir que basta un proceso de Metro corriendo.** Si una sesión anterior dejó
  `npx expo start` vivo en otro puerto, el emulador se conecta a ambos bundles a la vez y
  produce errores de runtime que parecen bugs de código (p. ej. `Cannot read property 'status'
  of undefined`) pero son solo inconsistencia entre dos instancias de Fast Refresh. Revisar
  `netstat -ano | grep 808` (Windows) antes de levantar uno nuevo; matar el viejo con
  `taskkill //PID <pid> //F` tras confirmar con el usuario.
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
- **Esquema de color oscuro sin verificar visualmente.** `DarkColors` (`src/theme/colors.ts`) es
  derivado y fue auditado por cálculo de contraste, pero no se capturó en el emulador con el
  tema oscuro activo (RNF-003/007 quedaron en "Implementado sin probar" por esto). Para
  verificar: forzar dark mode en el emulador (`adb shell "cmd uimode night yes"`) y repetir el
  pase de capturas de `artifacts/t0/`.

## Plan de implementación
_(Cada tarea indica los IDs de requisito que cubre. Orden pensado para que siempre
haya algo funcionando. Obligatorio primero; recomendados al final.)_
- [x] **T0. Base** — tokens de tema accesibles (`src/theme/`), navegación por perfil,
  estados carga/error/vacío, accesibilidad ampliada (`Label/Hint/Role/State`, `hitSlop`,
  `lineHeight`, `testID`) y store de **Redux Toolkit** (`src/store/`). (RT-001, RT-006, RNF-001..009)
  Comiteado en `2c1190c`, verificado en emulador — ver sección "T0 — Base" arriba.
- [x] **T0.5. Capa de datos + auth** — proyecto Supabase, cliente, registro/login, sesión
  en almacenamiento seguro, manejo de errores y offline. (RF-011, RNF-012, RT-004)
  Verificado en emulador — ver sección "T0.5 — Capa de datos + auth" arriba.
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
