# Estado — Neurotrack EM

**Fecha:** 2026-11-11 · **Rama:** master · Ver «Hecho el 2026-11-11» y «T10 — Perfil del médico» más abajo.
Commits del día (todos con Co-Authored-By de Amelyn, Mariana y Claude): `f5fd565`, `eeadd52`, `4266cd8`,
`345e723`, `f06d957` y los del perfil médico (T10). Consultar `git log` para los hashes.
Nota: el seed `supabase/seed/demo_data_completo.sql` ya se revisó y se subió (solo placeholders
`PACIENTE@EJEMPLO.COM` / `CUIDADOR@EJEMPLO.COM`, sin correos reales).

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

## T2 — Actividades: COMPLETO y verificado por el usuario en emulador (2026-11-08)
- **RF-003 (cognitivas) + RF-004 (motriz) implementados sin probar.** Código:
  - `supabase/migrations/20261109000000_activity_progress.sql`: tabla `activity_progress`
    (`patient_id`, `area`, `level`) + RLS. **Falta que el usuario la ejecute en el SQL Editor
    de Supabase**, igual que se hizo con `symptom_logs` en T1.
  - `src/features/activities/` (types, constants, `logic.ts` puro —generación de rondas y
    subida de nivel, testeable sin UI—, api, componentes `area-tile`, `shape-button`,
    `feedback-badge`, `session-header`).
  - `src/store/slices/activities-slice.ts`: progreso por área + máquina de estados de la
    sesión (`memorizar` → `responder` → `resultado` → `completada`), registrado en `store.ts`.
  - `src/app/(paciente)/actividades.tsx` reescrito (antes `TabScreenStub`): hero "sesión de
    hoy" (sugiere el área con menor nivel), grilla de 3 áreas + tarjeta "Lógica" bloqueada.
  - `src/app/actividad/[area].tsx` (modal, patrón igual a `registrar-sintoma/`): implementa
    las 3 áreas en una sola pantalla con estados según la fase de la sesión.
  - **Memoria**: secuencia de figuras a memorizar sin cronómetro ("Listo, continuar" a su
    ritmo), luego repetirla tocando 4 botones grandes. 5 niveles (secuencia de 3 a 7).
  - **Atención**: encontrar la figura distinta entre 5 a 9 opciones (según nivel), sin tiempo límite.
  - **Movimiento**: 3 a 6 pasos guiados (banco fijo de 6 instrucciones, p.ej. "Levanta ambos
    brazos..."), se marcan como hechos a su ritmo; 4 niveles. Sube de nivel al completar la
    sesión completa (no exige precisión, solo participación — tono de acompañamiento).
  - Subida de nivel por precisión, no velocidad (RF-003): 2 de 3 rondas correctas para
    memoria/atención; completar la sesión para movimiento.
  - **Lógica queda bloqueada a propósito** (decisión de alcance, no bug): el stitch original
    la muestra como "se abre al llegar a nivel 3 de Memoria", pero no se implementó el juego
    de lógica (no es obligatorio, RF-003 solo pide 1-2 actividades cognitivas). El tile queda
    siempre bloqueado con ese mismo texto para no prometer una pantalla que no existe.
- `typecheck` y `lint` limpios (`npx tsc --noEmit`, `npx eslint`).
- **Sin verificar en emulador todavía** — ver decisión de proceso abajo.

### Ronda 2 (mismo día): bug real + fidelidad contra Stitch corregida
El usuario tomó las primeras capturas (`artifacts/t2/`) y encontró 3 problemas reales:
1. **Bug: la pantalla de Atención aparecía completamente en blanco.** Causa:
   `sessionStarted` en `activities-slice.ts` fijaba la fase inicial en `'memorizar'` para
   cualquier área que no fuera `movimiento` — pero el bloque de render de `'memorizar'` solo
   existe para `memoria` (depende de `session.memoriaRound`, que es `null` en Atención). Con
   fase `'memorizar'` y sin `memoriaRound`, ningún bloque de la pantalla cumplía su condición
   y no se pintaba nada. Corregido: la fase inicial ahora es `'memorizar'` solo si
   `area === 'memoria'`; `'responder'` para las demás. **No se habría detectado solo leyendo
   el código superficialmente** — confirma otra vez por qué importa verificar en emulador.
2. **Las figuras de respuesta (Memoria/Atención) no eran fieles a Stitch**: en el diseño
   (`paciente_actividad_en_curso/screen.png`) cada opción es una tarjeta alta (~170dp) con el
   ícono dentro de un círculo grande (64dp) centrado; la implementación original ponía un
   ícono pequeño (30px) pegado arriba de una tarjeta corta. Corregido en
   `src/features/activities/shape-button.tsx`: tarjeta `minHeight: 170`, ícono de 32px dentro
   de un círculo de 64dp centrado, texto en `labelLg` debajo.
3. **El resumen de sesión no se parecía al de Stitch**
   (`paciente_actividad_sesi_n_completada/screen.png`): faltaban el desglose de aciertos, el
   nivel actual en una tarjeta separada, el banner de refuerzo y el botón "Repetir". Reescrito
   `SesionCompletada` en `src/app/actividad/[area].tsx`: ícono circular, dos tarjetas de
   estadística (**Aciertos X de Y** / **Nivel actual N de M**, cada una con su propio ícono y
   texto de refuerzo), banner tipo "tip" con ícono, botón primario "Volver a actividades" (con
   ícono) y botón secundario "Repetir" (reinicia la sesión en el nivel ya alcanzado — para
   esto `sessionStarted` ahora también acepta `{area, level}` explícito, porque el nivel nuevo
   puede no estar aún persistido en Supabase cuando se dispara "Repetir").
- `typecheck` y `lint` siguen limpios tras estos cambios.
- **Capturas de la ronda 1 (`t2-memoria-*`, `t2-sesion-completada.png`, `t2-movimiento-pasos.png`,
  `t2-logica-bloqueada.png`) quedaron desactualizadas** por el rediseño de las tarjetas de
  figura y del resumen — hay que volver a tomarlas. La de Atención directamente no existía
  (pantalla en blanco); ahora sí debería renderizar.

### Ronda 3 (mismo día): Memoria reconstruido 1:1 contra `paciente_actividad_en_curso` / `_respuesta_bien`
El usuario señaló que Memoria seguía sin parecerse al export de Stitch (más allá del tamaño de
ícono ya corregido en la ronda 2). Se leyó el `code.html` de ambas pantallas línea por línea y
se reconstruyó la pantalla de sesión para que coincida en estructura, no solo en estilo:
- **Encabezado genérico nuevo** (`session-header.tsx`): ícono de pausa (sale de la sesión) +
  título centrado **"Sesión de ejercicio"** (ya no el nombre del área) + avatar decorativo a la
  derecha, igual que el export. Debajo, un pill **"Paso N de M"** + barra segmentada — en
  Memoria/responder, N/M es la posición dentro de la secuencia a repetir (no la ronda), tal
  como se ve literalmente en el export ("Paso 2 de 4").
- **Tarjeta de instrucciones** (`InstructionCard`, nuevo, dentro de `[area].tsx`): ícono circular
  + titular en negrita + chip inferior con ícono y texto atenuado — antes era texto plano.
  Reutilizada en Memoria, Atención y Movimiento para que las 3 áreas compartan el mismo
  lenguaje visual.
- **Feedback por cada toque, no solo al final**: antes `memoriaShapeTapped` solo evaluaba la
  secuencia completa al final (la UI no mostraba nada hasta terminar). Ahora, sin tocar la
  lógica de la slice, la pantalla **deriva** si el último toque fue correcto comparando
  `memoriaAnswer` contra `memoriaRound.sequence` en esa posición, y usa eso para: (a) resaltar
  con borde + insignia (✓ o ✕) la tarjeta de la figura recién tocada (`ShapeButton` ahora acepta
  `feedback="correcto"|"incorrecto"`), y (b) mostrar un banner inferior en vivo ("¡Bien!
  Paso reconocido con éxito." / "Vamos, tú puedes...") — igual que `paciente_actividad_
  respuesta_bien`. El tablero de 4 figuras se queda visible todo el tiempo (ya no se reemplaza
  por una pantalla de resultado aparte).
- **Botón "Ver la secuencia otra vez"** (nuevo): reducer `memorizeReplayRequested` en
  `activities-slice.ts` — vuelve a la fase `memorizar` con la misma secuencia (sin generar una
  nueva ni penalizar), tal como el export ("sin penalización"). Visible siempre durante
  responder/resultado de Memoria.
- `sessionStarted` ahora acepta `ActivityArea | {area, level}` para que "Repetir" en el resumen
  pueda arrancar en el nivel recién alcanzado sin esperar la confirmación async de Supabase.
- `typecheck` y `lint` limpios tras la reconstrucción.
- **Pendiente de capturar de nuevo**: toda la carpeta `t2-memoria-*` (memorizar, responder con
  feedback en vivo, y el estado tras completar la secuencia) y, de paso, confirmar que Atención
  y Movimiento también se ven bien con la nueva `InstructionCard` y el encabezado genérico.

### Ronda 4 (mismo día): confusión real de UX señalada por el usuario, corregida
El usuario probó Memoria y señaló dos problemas de claridad genuinos (no de fidelidad visual):
1. **"Paso 1 de 1" no se entendía.** Causa: el pill del encabezado usaba siempre la palabra
   "Paso" tanto para "ronda de la sesión" (p. ej. en Movimiento, donde sí son pasos) como para
   "posición dentro de la secuencia que hay que repetir" en Memoria — la misma palabra con dos
   significados distintos según la pantalla. Corregido: `SessionHeader` ahora recibe un prop
   `unit` (`session-header.tsx`) y cada fase elige la palabra correcta en `getHeaderProgress`
   (`[area].tsx`): **"Figura N de M"** mientras se repite la secuencia en Memoria, **"Paso N de
   M"** en Movimiento (pasos reales), **"Ronda N de 3"** en el resto.
2. **La figura marcada no se desmarcaba y no había ninguna señal además de la visual.**
   Corregido con dos cambios:
   - **Falla rápido** (`activities-slice.ts`, `memoriaShapeTapped`): antes se esperaba a que
     se agotaran todos los toques para evaluar la secuencia completa; un toque fuera de orden
     ahora termina la ronda de inmediato. Esto además evita que el resaltado de una figura y el
     veredicto final de la ronda puedan contradecirse.
   - **Resaltado transitorio + háptica** (`[area].tsx`, `MemoriaResponderBlock`): el borde/
     insignia de la figura tocada ahora se limpia solo a los ~900ms si la ronda sigue en marcha
     (no es el último toque ni fue un error que la termine); si la ronda ya terminó, se deja
     fijo para que se vea qué pasó. Se instaló **`expo-haptics`** (no estaba, era un hueco real
     de RNF-009 "háptica complementaria") y cada toque dispara una vibración de éxito o de
     error — sustituye el sonido que pedía el usuario (RNF-006/009: nunca depender solo de un
     canal sensorial).
- `typecheck` y `lint` limpios tras estos cambios.
- **RNF-009 mejora**: ya hay háptica real en Memoria (antes decía "aún no aplica, no hay
  recordatorios en T0" — ahora sí aplica a esta pantalla). Falta extenderla a Atención/
  Movimiento si se quiere consistencia total entre las 3 áreas.
- Pendiente seguir probando en emulador: confirmar que la vibración se siente y que el
  resaltado desaparece solo tras ~1s cuando la ronda sigue viva.

**Confirmado por el usuario (2026-11-08): la ronda 4 funciona como se esperaba** (falla
rápido, resaltado transitorio, vibración). **T2 queda cerrado**: RF-003 y RF-004 pasan a
Verificado en `REQUISITOS.md`. Las capturas en `artifacts/t2/` siguen siendo de la ronda 1
(versión visual anterior) — quedan como evidencia parcial del layout general, no del
comportamiento final; si se quiere evidencia fotográfica fiel al diseño actual, hay que
retomarlas en una sesión futura, pero no bloquea cerrar la tarea.

### Decisión de proceso: desde ahora, el usuario toma las capturas (ahorro de tokens)
A partir de esta sesión, **el usuario levanta el emulador, navega y toma las capturas**;
el agente ya no usa `agent-device`/`uiautomator` para esto (ver razón en
"Ya intentado, no repetir" — el tap-a-ciegas es caro en tokens y falla silenciosamente).
El agente sigue comparando las capturas contra `docs/diseno/stitch-export/` y ajustando
estilos. Esto quedó anotado también en `.claude/skills/revisar-ui/SKILL.md`.

**Capturas de T2 — volver a tomar todas** (el rediseño de tarjetas y resumen invalidó las
de la ronda 1; déjalas en `artifacts/t2/` sobrescribiendo las viejas):
1. `t2-actividades-lista.png` — pantalla `Actividades` tal cual carga (tab "Actividades").
   Comparar contra `docs/diseno/stitch-export/paciente_actividades/screen.png`.
2. `t2-memoria-memorizar.png` — tocar la tarjeta "Memoria" (o el hero si sugiere Memoria) →
   pantalla "Memoriza esta secuencia" antes de tocar "Listo, continuar".
3. `t2-memoria-responder.png` — tras tocar "Listo, continuar": pantalla con los 4 botones
   grandes (ahora con el ícono en un círculo centrado, tarjeta más alta) para repetir la secuencia.
4. `t2-memoria-resultado.png` — tras completar la secuencia (acertada o no): tarjeta de
   feedback ("¡Bien hecho!" o "Esta vez no..."), con el botón "Continuar".
5. `t2-atencion-responder.png` — entra a "Atención": grilla de figuras con el intruso a
   encontrar. **Antes esta pantalla salía en blanco (bug ya corregido) — confirmar que ahora
   se ve el contenido.**
6. `t2-movimiento-pasos.png` — entrar a "Movimiento": lista de pasos con checkboxes y el
   botón "Terminé esta sesión" (probar que arranca deshabilitado hasta marcar todos los pasos).
7. `t2-sesion-completada.png` — completar las 3 rondas de cualquier área (o la sesión de
   Movimiento): pantalla "Sesión completada" **rediseñada** con ícono circular, las dos
   tarjetas "Aciertos X de Y" / "Nivel actual N de M", el banner de refuerzo y los botones
   "Volver a actividades" + "Repetir".
8. `t2-logica-bloqueada.png` — la tarjeta "Lógica" en la grilla, con el candado y el texto
   de desbloqueo (sin cambios, pero conviene reconfirmar).

**Qué probar en cada una** (además de comparar visualmente contra Stitch):
- Que el botón "Terminé esta sesión" de Movimiento esté **visiblemente deshabilitado**
  (opacidad reducida) hasta marcar todos los pasos — no solo por color.
- Que el badge de resultado tenga ícono + texto, no solo un color de fondo (RNF-006).
- Que los 4 botones de figuras en Memoria/Atención tengan al menos 48dp de alto (RNF-005).
- Qué pasa si se toca "Salir de la actividad" (ícono X del encabezado) a mitad de una
  ronda: debe volver a la lista de Actividades sin guardar progreso parcial.
- En "Sesión completada", tocar "Repetir": debe quedarse en la misma pantalla y arrancar
  una sesión nueva ya en el nivel alcanzado (no en el nivel con el que se empezó).
- Con el lector de pantalla activo (TalkBack), si el tiempo alcanza: que cada paso de
  Movimiento y cada figura anuncien su texto/ícono, no solo "botón".

## T3 — Progreso: COMPLETO y verificado por el usuario en emulador (2026-11-08)
**RF-005 (historial/comparación de evolución) Verificado.** Código:
- `src/features/progress/` (`types.ts`, `constants.ts`, `logic.ts` puro — rangos de período,
  límites de bucket, agregación, insights de tendencia, headline; sin UI, testeable aislado).
  `MIN_DISTINCT_DAYS_FOR_INSIGHTS = 10` como umbral para la tarjeta de "datos insuficientes".
- `src/store/slices/progress-slice.ts`: estado `period`/`referenceISO`/`view` + thunk
  `fetchProgressData` que trae `symptom_logs` y `activity_sessions` en el rango
  [inicio del período anterior, fin del período actual), registrado en `store.ts`.
- `src/app/(paciente)/progreso.tsx` reescrito (antes `TabScreenStub`): segmented control
  Semana/Mes/3 meses, navegación anterior/siguiente, gráfico de barras y vista de tabla
  intercambiables, hasta 3 insights con ícono+texto (nunca solo color, RNF-006), tarjeta de
  "datos insuficientes" con barra de progreso hacia el umbral y CTA a registrar síntoma.
- `src/features/activities/api.ts`: `logActivitySession` / `listActivitySessionsBetween`.
  `src/features/symptoms/api.ts`: `listSymptomLogsBetween` (rango arbitrario, no mes calendario).
- `src/store/slices/activities-slice.ts`: thunk `recordActivitySession`, disparado desde
  `src/app/actividad/[area].tsx` cuando una sesión llega a fase `completada` (intento único,
  si falla por offline se pierde esa entrada del historial sin bloquear nada, RNF-012).
- `supabase/migrations/20261110000000_activity_sessions.sql`: tabla `activity_sessions` + RLS
  (`auth.uid() = patient_id`). **Ya ejecutada por el usuario en el SQL Editor de Supabase.**
- Gap de accesibilidad corregido antes de verificar: la tarjeta de resumen (ícono + headline)
  ahora lleva `accessibilityLiveRegion="polite"` — al cambiar de período con el segmented
  control, TalkBack anuncia el nuevo resumen en vez de quedarse en silencio (antes solo
  `ScreenState` cubría carga inicial/error, no los refetches posteriores).
- `typecheck` y `lint` limpios.
- **Verificado por el usuario en emulador** con datos de prueba insertados directo en
  Supabase (ver `supabase/seed/`, debajo) — confirmó que el flujo funciona y se ven las
  estadísticas y los datos. Capturas en `artifacts/t3/`: `progreso-grafico.png`,
  `progreso-tabla.png`, `progreso-insights.png`, `progreso-insuficiente.png`.
- **Pendiente, dicho explícitamente por el usuario para después:** comparar visualmente la
  pantalla contra `docs/diseno/stitch-export/` y ajustar fidelidad si hace falta. También
  falta el recorrido con TalkBack (mismo pendiente transversal que T0-T2).
- Commit `df0582b`, con `Co-Authored-By` de Amelyn y Mariana, pusheado a `origin/master`.
  `docs/REQUISITOS.md` actualizado (RF-005 → Verificado).

### Scripts de datos de prueba para Progreso (`supabase/seed/`, no son migraciones)
Se crearon para poder verificar la pantalla sin registrar 10+ días a mano:
- `progreso_diagnostico.sql`: lista todas las filas de `symptom_logs`/`activity_sessions` de
  la cuenta y cuenta días distintos dentro de las ventanas exactas de "semana" y "mes", para
  diagnosticar por qué una vista sigue en "datos insuficientes".
- `progreso_test_data.sql` (v1, con bug): calculaba fechas como "N días atrás desde `now()`";
  al correrlo, el "mes pasado" (35-59 días atrás) cayó en septiembre en vez de octubre, y la
  ventana de "Semana" (~14 días) no alcanzó casi ningún dato del seed. Se deja en el repo como
  referencia de qué NO hacer, no se borró porque no rompe nada (solo agrega filas extra).
- `progreso_test_data_v2.sql` (correcto): usa fechas FIJAS ancladas a 2026-10/2026-11 en vez
  de relativas a `now()`, para que sí caigan dentro de ambas ventanas. Es el que se usó para
  verificar.
- Los 3 archivos tienen el placeholder `TU_CORREO@EJEMPLO.COM` sin reemplazar (nadie commiteó
  un correo real) — hay que sustituirlo por el correo de la cuenta de paciente antes de correr.

## T4 — Módulo del cuidador: RF-006, RF-008 y RF-012 VERIFICADOS (capturas en `artifacts/t4/`)
El usuario pidió arrancar T4 y dejar la fidelidad visual de `progreso.tsx` contra Stitch para
después (sigue pendiente, ver T3 arriba). Las 3 RF de T4, confirmadas funcionando por el
usuario en emulador con dos cuentas, **y con capturas ya tomadas** en `artifacts/t4/`
(`Inicio_cuidador.png`, `t4-observaciones.png`, `t4-nueva-observacion.png`, `t4-acompar.png`,
`t4-recordatorios.png`, `t4-nuevo-recordatorio.png`) — subidas a "Verificado" en
`REQUISITOS.md`:
- **RF-012 (vinculación con consentimiento):** `Inicio_cuidador.png` muestra "Estás
  acompañando a la persona que acompañas" con el acceso ya sincronizado.
- **RF-006 (observaciones + acompañar):** `t4-observaciones.png` (nota de movilidad
  guardada), `t4-nueva-observacion.png`, `t4-acompar.png` (resumen semanal por área +
  botón de mensaje de ánimo).
- **RF-008 (recordatorios):** `t4-recordatorios.png` + `t4-nuevo-recordatorio.png` (muestra
  un recordatorio marcado "Hecho" con check visible, no depende de audio).

Código nuevo de las 3 RF, `typecheck`/`lint` limpios, **ya commiteado y pusheado**:
- `supabase/migrations/20261111000000_caregiver_links.sql`: tabla `caregiver_links`
  (`patient_id`, `caregiver_id` nullable hasta reclamar, `invite_code` de 6 caracteres,
  `status` en `pendiente → solicitado → aceptado|rechazado|revocado`, 3 flags de permiso
  `share_sintomas`/`share_progreso`/`share_recordatorios`). RLS clave: el paciente es el único
  que puede mover un vínculo a `aceptado` (política `caregiver_links_update_as_patient`); un
  cuidador solo puede "reclamar" un código (`pendiente` + sin dueño → `solicitado` con su
  propio `auth.uid()`), nunca auto-aceptarse. **Ya ejecutada por el usuario en el SQL Editor.**
- `src/features/caregiver/{types.ts,api.ts}`: CRUD contra `caregiver_links` + mapeo de errores
  Postgrest (mismo patrón que `features/symptoms/api.ts`), con una clase de error nueva
  `codigo-invalido` para cuando el código no existe o ya fue usado (`PGRST116`).
- `src/store/slices/caregiver-slice.ts`, registrado en `store.ts`: estado separado para el
  lado paciente (`myInvite`, `incomingRequests`, `myCaregivers`) y el lado cuidador
  (`myLinksAsCaregiver`, `claimStatus`).
- `src/app/permisos.tsx` (paciente, ruta top-level, no es tab): código de invitación grande +
  "Compartir"/"Generar otro", solicitudes entrantes con 3 `Switch` de permiso (no el toggle a
  medida del export de Stitch — ver nota de fidelidad abajo) + Aceptar/Rechazar, lista de
  cuidadores con acceso + "Quitar acceso" (con confirmación).
- `src/app/vincularme.tsx` (cuidador, ruta top-level): input de código de 6 caracteres
  (reutiliza `TextField`), estado de éxito "Solicitud enviada".
- `src/app/(cuidador)/inicio.tsx` reescrito (antes `TabScreenStub`): 3 estados — sin vincular
  (CTA a Vincularme), solicitud pendiente, vinculado (muestra qué compartió el paciente).
- `src/app/(paciente)/inicio.tsx` reescrito mínimamente (seguía siendo `TabScreenStub` incluso
  después de T1-T3): se le agregó un botón "persona" en el header que lleva a `/permisos`,
  porque ese es el punto de entrada que supone el diseño de Stitch ("Perfil &gt; Invitar a
  alguien") y no existía ninguna pantalla de perfil ni navegación hacia `permisos`/`vincularme`
  antes de esta ronda. El resto de `inicio.tsx` del paciente sigue siendo un placeholder (no es
  parte de ningún RF por sí solo); construir el dashboard real queda fuera de esta ronda.
- **Nota de fidelidad (igual patrón que T2/T3):** el export de Stitch (`paciente_permisos_del_cuidador`,
  `cuidador_vincularme*`) usa toggles con pastillas "Sí"/"No" a medida y tarjetas con fotos de
  perfil; se implementó con `Switch` nativo de RNF por tiempo. Pendiente de comparar visualmente
  si se quiere fidelidad completa.
- **Decisión nueva, ver D-010 en `DECISIONES.md`:** por qué el código de invitación (no un
  QR ni un enlace), por qué se guarda `caregiver_email`/`caregiver_name` directo en la fila en
  vez de hacer join contra `auth.users`, y por qué se dejó fuera el toggle "Mis notas" que sí
  trae el export de Stitch (no existe funcionalidad de notas del paciente en el MVP).

### RF-006 / RF-008, código nuevo de esta ronda — probado por el usuario, commiteado
- `supabase/migrations/20261112000000_caregiver_observations_and_access.sql`: tabla
  `caregiver_observations` (bitácora privada del cuidador, el paciente NUNCA tiene acceso —
  política RLS deliberadamente sin `select` para el paciente), tabla `caregiver_cheers`
  (mensajes de ánimo de una vía, cuidador → paciente, con `read_at` para que el paciente los
  descarte), y dos políticas RLS NUEVAS que se SUMAN a las de `activity_progress` y
  `activity_sessions` (no las reemplazan): el cuidador puede `select` esas tablas del paciente
  solo si existe un `caregiver_links` con `status='aceptado'` y `share_progreso=true`.
- `supabase/migrations/20261113000000_reminders.sql`: tabla `reminders` (`patient_id`,
  `created_by`, categoría medicación/cita/bienestar, `scheduled_at`, estado pendiente/hecho).
  El paciente tiene control total de los suyos; el cuidador puede crear y marcar como "hecho"
  (no editar ni borrar) solo con vínculo `aceptado` + `share_recordatorios=true`.
  **Ambas migraciones ya ejecutadas por el usuario en el SQL Editor de Supabase.**
- `src/features/caregiver/api.ts` ampliado: `listMyObservations`, `createObservation`,
  `sendCheer`, `fetchLatestUnreadCheer`, `markCheerRead`.
- `src/features/reminders/{types.ts,api.ts,constants.ts}` nuevo (mismo patrón de error que
  `features/symptoms`).
- `src/store/slices/caregiver-slice.ts` ampliado con thunks para lo anterior, más
  `fetchCaregiverPatientActivity(patientId)` — trae `activity_progress` +
  `activity_sessions` de la última semana del paciente que se acompaña, para la pantalla
  Acompañar. **Nota de lint:** la primera versión de `acompanar.tsx` traía ese fetch con
  `useState` local + una función async llamada directo en un `useEffect`, y
  `react-hooks/set-state-in-effect` lo rechazó (mismo tipo de error ya visto con el
  resaltado de Memoria en T2, ver más abajo en "Ya intentado, no repetir"). Se resolvió
  moviendo el fetch a un thunk de Redux (`fetchCaregiverPatientActivity`) y dejando que el
  componente solo despache y lea del store — el patrón que ya usan todas las demás pantallas
  con datos remotos en este repo (`dispatch(fetchX())` en el efecto, nunca una función local
  que haga `setState` después de un `await` dentro del cuerpo del efecto).
- `src/store/slices/reminders-slice.ts` nuevo, registrado en `store.ts`.
- Pantallas nuevas: `src/app/(cuidador)/observaciones.tsx` (bitácora agrupada por día) +
  `src/app/nueva-observacion.tsx` (categoría + texto); `src/app/(cuidador)/acompanar.tsx`
  (resumen semanal + nivel por área + botón de mensaje de ánimo con 3 opciones);
  `src/app/(cuidador)/recordatorios.tsx` (lista + formulario inline con chips de
  categoría/hora, sin selector de fecha nativo — se evitó añadir una dependencia nueva a
  mitad de sesión; "hora" son 4 combinaciones fijas: hoy mañana/tarde/noche, mañana por la
  mañana). `src/app/(paciente)/inicio.tsx` ampliado: banner del mensaje de ánimo más
  reciente (con botón de descartar) y lista de "Hoy" con los recordatorios del día y un botón
  de marcar hecho con háptica (`expo-haptics`, ya instalado desde T2) + ícono de check — así
  se cubre la "alternativa visual + háptica" de RNF-009/RF-008 sin depender de audio.
- `typecheck` y `lint` limpios en todo `src/`. **Probado por el usuario en el emulador**: observación
  nueva guardada, resumen semanal + mensaje de ánimo visto por el paciente, recordatorio creado
  por el cuidador y marcado "hecho" por el paciente con vibración. Commits `2f6f58f` y `6034850`
  (el segundo solo corrige el hash citado en este mismo archivo), con `Co-Authored-By` de Amelyn
  y Mariana, pusheados a `origin/master`.

## T5 — Apoyo/Info: COMPLETO y verificado en emulador (2026-11-08)
- Cubre RF-009 (espacio de apoyo/red de contención) y RF-010 (subtítulos/transcripción).
- **Decisión de alcance** (consistente con T2/T3/T4: fidelidad visual exacta vs Stitch
  queda para después): el diseño de Stitch (`docs/diseno/stitch-export/paciente_apoyo/`,
  `cuidador_apoyo/`) asume guías "Escuchar"/"Ver" con audio/video remoto, estado de carga
  con skeleton, y modo "sin conexión" con candado en contenido que "requiere conexión".
  Se simplificó: **todo el contenido es estático** (bundleado en la app, sin fetch a
  Supabase ni a ningún backend), por lo que no hay skeleton de carga ni distinción
  online/offline — no hace falta, nada depende de la red. Para RF-010, no hay audio/video
  grabado real: las guías tipo "Escuchar"/"Ver" se entregan **desde el inicio como
  transcripción/subtítulos completos en texto** (no como pista aparte que se activa
  después), lo que cumple el requisito sin necesidad de media real.
- `src/features/support/`: `types.ts` (`SupportGuide`, `CrisisContact`), `constants.ts`
  (datos estáticos: `CRISIS_CONTACTS` con Línea 106 y Emergencias 123, `PATIENT_GUIDES` y
  `CAREGIVER_GUIDES` con 4 guías cada una, `findGuide(id)`), `crisis-section.tsx`
  (tarjetas de ayuda inmediata con botón "Llamar al X" vía `Linking.openURL('tel:...')`),
  `guide-list.tsx` (filtro Todo/Leer/Escuchar/Ver + lista, navega a la guía).
- Pantallas: `src/app/(paciente)/apoyo.tsx` y `src/app/(cuidador)/apoyo.tsx` reescritas
  (antes eran stubs de `TabScreenStub`, que se eliminó por quedar sin uso); cada una con
  su propio texto de cabecera y guías, compartiendo `CrisisSection`/`GuideList`. Pantalla
  de detalle compartida en `src/app/apoyo/[id].tsx` (+ `_layout.tsx`), con banner que
  explica la transcripción cuando el tipo es `escuchar`/`ver`.
- `typecheck` y `lint` limpios. **Probado en emulador para los dos perfiles** (paciente y
  cuidador): tarjetas de crisis, filtro por tipo, navegación a detalle y vuelta atrás,
  transcripción visible en la guía de audio. Capturas en `artifacts/t5/`
  (`paciente-apoyo.png`, `paciente-apoyo-detalle-audio.png`, `cuidador-apoyo.png`).
- Nota de sesión: el daemon de `agent-device` no registraba (mismo síntoma ya documentado
  en `docs/ENTORNO.md`: arrancó en una terminal sin `adb` en el PATH). Se resolvió
  matando el proceso `node.exe` del daemon (`daemon.js`) y dejándolo reiniciar solo.

## T6 (continuación, 2ª sesión 2026-11-09) — pase de fidelidad visual, pantalla de Accesibilidad, modo oscuro real

Esta sesión partió de "Siguiente acción concreta" de la sesión anterior (ver más abajo, ya
resuelta) y la amplió. Commit `da06c9e`, pusheado con `Co-Authored-By` de Amelyn y Mariana.

- **Pase de fidelidad visual completo contra `docs/diseno/stitch-export/`** en: selección de
  perfil (header "Paso 1 de 2" + ilustración hero + íconos + modal "¿Qué es Neurotrack EM?"),
  inicio paciente (reescrito: chips de síntomas, "Tu plan de hoy" con datos reales, racha
  semanal), inicio cuidador (reescrito: resumen real de actividades/recordatorios, "Anotar una
  observación", tarjeta de autocuidado), calendario (barras de severidad en vez de un punto
  genérico), wizard de síntomas (íconos + tarjetas de tranquilidad), actividades/progreso
  (contadores de sección, íconos de insight coloreados, botón real "Preparar resumen para mi
  consulta" vía `Share` nativo), módulo del cuidador (exportar notas, etiqueta "Se pasó" en
  recordatorios vencidos, toggles de permisos con ícono+descripción), apoyo (íconos en tarjetas
  de crisis). `acceder.tsx` y el detalle de contenido de Apoyo ya estaban casi idénticos a
  Stitch de sesiones previas — no se tocaron. Nada de esto se verificó en emulador todavía.
- **Pantalla nueva `src/app/accesibilidad.tsx`** (entrada desde un ícono nuevo en el header de
  `(paciente)/inicio.tsx`): apariencia (claro/oscuro/automático), tamaño de texto, alto
  contraste, reducir animaciones. Persistida en `AsyncStorage` (`src/features/settings/
  persistence.ts`) e hidratada en `_layout.tsx`. Decisión completa, con lo que se descartó del
  mock original del usuario y por qué, en **D-011** de `DECISIONES.md`.
- **Paleta de modo oscuro reemplazada** por la real que el usuario generó en Stitch
  (`artifacts/modo-oscuro-stitch/`, ~35 pantallas). Fuente, excepción a la convención M3 de
  roles "Fixed", y verificación de contraste: **D-012** en `DECISIONES.md`.
- **Bug real encontrado por el usuario tras la primera pasada de paleta oscura**: las tarjetas
  de "Tu plan de hoy" (`(paciente)/inicio.tsx`) quedaban invisibles porque `surfaceContainer`
  estaba a solo 1-2 puntos de luminosidad del fondo. Corregido ampliando la escala de elevación
  en `src/theme/colors.ts` y añadiendo un borde de 1px (`outlineVariant`) a esas tarjetas — ver
  detalle en D-012. **No confirmado todavía por el usuario en emulador.**
- `tsc --noEmit`, `eslint src` y los 31 tests de jest en verde después de cada cambio de esta
  sesión (se corrió repetidamente, no solo al final).
- **Nada de esto se verificó en emulador.** Todo el trabajo fue código + comparación contra
  capturas de Stitch; el usuario no ha abierto la app todavía con estos cambios.

## T6 (1ª sesión, 2026-11-09)
- **Pruebas jest-expo instaladas y corriendo** (ver Decisión D-004): `jest`, `jest-expo`,
  `@types/jest` en `devDependencies`; `"test": "jest"` + `"jest": {"preset": "jest-expo"}` en
  `package.json`. 3 archivos de pruebas de lógica pura, sin UI, 31 tests, todos en verde
  (`npx jest`):
  - `src/features/activities/__tests__/logic-test.ts` — generación de rondas de Memoria/
    Atención/Movimiento, verificación de respuestas, subida de nivel.
  - `src/features/progress/__tests__/logic-test.ts` — rangos de período, buckets, agregación,
    insights, headline.
  - `src/features/symptoms/__tests__/calendar-test.ts` — grid del calendario, severidad peor
    del día, columnas vacías, filtrado por fecha ISO.
  Los demás módulos (`caregiver`, `reminders`, `support`, `auth`) solo tienen `api.ts` (llamadas
  a Supabase) y `types`/`constants`, sin lógica pura que valga testear sin mocks — no necesitan
  pruebas adicionales bajo el criterio de D-004.
- **Auditoría de accesibilidad de código completa** (agente `accessibility-reviewer`, sobre
  todo `src/app/`, `src/components/`, componentes de features, `src/theme/`): grep sistemático
  de `accessibilityLabel/Role/State/Hint`, `hitSlop`, `accessibilityLiveRegion`, y **cálculo
  real de contraste WCAG** sobre ~29 pares color de texto/ícono-sobre-fondo en uso. El usuario
  ya había hecho una primera pasada manual con TalkBack en el emulador (sin detalle de qué
  cubrió); esta auditoría es el respaldo de código.
  - **2 bugs reales encontrados y corregidos en esta sesión** (no solo falta de prueba):
    1. **`lineHeight` fijo no escalaba con la fuente del sistema** (RNF-002): `fontSize` sí
       escala automáticamente en RN, pero `lineHeight` numérico fijo no — riesgo real de
       recorte/superposición de texto con fuente grande, en **toda** la app vía `ThemedText`.
       Corregido en `src/components/themed-text.tsx`: se escala `lineHeight` a mano con
       `PixelRatio.getFontScale()`.
    2. **4 sitios usaban roles `onSecondaryFixed(Variant)` como texto sobre `secondaryContainer`**
       (RNF-003/007): los roles `Fixed` de Material 3 solo están pensados para pintarse sobre su
       propio contenedor `Fixed`, no sobre `secondaryContainer` (que sí cambia de valor entre
       esquema claro/oscuro) — en oscuro el contraste caía a 1.00–1.82:1 (prácticamente
       invisible). Corregido reemplazando por `onSecondaryContainer` (el rol que sí adapta) en:
       `src/app/(paciente)/calendario.tsx` (número de día seleccionado, chip de conteo),
       `src/app/(cuidador)/acompanar.tsx` (resumen semanal), `src/features/symptoms/
       wizard-header.tsx` (botón "Cerrar"), `src/app/(paciente)/inicio.tsx` (banner de mensaje
       de ánimo). También se corrigió `src/app/(auth)/acceder.tsx` (link "¿Olvidaste tu
       contraseña?": `primaryContainer` como color de texto sobre `surface` daba 1.83:1 en
       oscuro → cambiado a `primary`).
  - **2 hallazgos menores corregidos**: botón "Cuidadores" en `(paciente)/inicio.tsx` medía
    40dp sin `hitSlop` (por debajo de `MinTouchSize`=48) → se añadió `hitSlop={8}`; el botón de
    llamada de crisis en `src/features/support/crisis-section.tsx` usaba `minHeight: 48` literal
    en vez del token `MinTouchSize` → reemplazado (consistencia de mantenimiento, no era un bug
    de accesibilidad en sí, pero ya quedó resuelto).
  - **Confirmado en código, sin cambios necesarios**: RNF-004 (semántica TalkBack), RNF-006
    (ningún estado solo por color — ya se dudaba si aplicaba, se confirmó que sí), RNF-008
    (instrucciones cortas / un elemento principal por pantalla), RNF-010 (baja fatiga),
    RNF-011 (español/Latam).
  - `docs/REQUISITOS.md` actualizado: RNF-001 a RNF-011 pasaron de "Pendiente" a "Implementado
    sin probar" con el detalle de qué confirmó/corrigió la auditoría y qué falta exactamente
    para subir a Verificado en cada uno (mayormente: capturas reales en emulador y el recorrido
    documentado con TalkBack).
- **Háptica extendida a Atención y Movimiento** (RNF-009): el `accessibility-reviewer` encontró
  que `expo-haptics` solo se usaba en Memoria y en marcar "hecho" un recordatorio, pero no en
  las otras 2 áreas de actividades. Corregido en `src/app/actividad/[area].tsx`: en Atención,
  notificación de éxito/error al tocar una opción (igual patrón que Memoria, usando el flag
  `isOdd` de la opción); en Movimiento, vibración de selección al marcar cada paso y de éxito
  al terminar la sesión (`onFinish`).
- `typecheck`, `lint` (sobre los archivos tocados) y los 31 tests de jest siguen en verde tras
  todas las correcciones de esta sesión.
- **Segundo bug real de contraste en oscuro, encontrado por el usuario probando en emulador
  (no por la auditoría de código) y corregido en esta sesión:** los banners de error/aviso con
  fondo `tertiaryFixed` (fijo, mismo valor claro `#f3dfcd` en los dos esquemas) pintaban el
  ícono/texto con roles que sí cambian por esquema (`colors.tertiary` o el `onSurface` por
  defecto de `ThemedText`) — en oscuro esos roles se vuelven claros y quedan casi invisibles
  sobre el fondo claro fijo. El error de "correo no confirmado" al iniciar sesión en oscuro era
  literalmente ilegible por esto. Corregido reemplazando por el rol fijo pareja
  (`onTertiaryFixed`/`onTertiaryFixedVariant`, que no cambia por esquema y sí contrasta) en:
  `src/components/text-field.tsx` (banner de error de cualquier campo — cubre el error de login),
  `src/app/(paciente)/calendario.tsx` (badge de severidad), `src/app/nueva-observacion.tsx`
  (ícono de candado del aviso de privacidad), `src/app/registrar-sintoma/paso-3.tsx` (banner de
  error al guardar). `src/app/actividad/[area].tsx` y `src/features/support/crisis-section.tsx`
  ya usaban el rol fijo correcto, no se tocaron.
- **El usuario ya tomó las 6 capturas de modo oscuro** (`artifacts/t6/`, sin renombrar/commitear
  todavía) y confirmó que el bug de arriba quedó resuelto — **pero no le gusta la paleta oscura
  en sí**: la tarjeta de "¿Necesitas hablar con alguien?" (`crisis-section.tsx`, fondo
  `tertiaryFixed`) se ve como un recorte claro flotando sobre un fondo casi negro, porque los
  roles `Fixed` de Material 3 no se aclaran/oscurecen por esquema (son para acentos pequeños,
  no para tarjetas grandes) — rompe el patrón de "superficie que se aclara con la elevación"
  que sí usan los temas oscuros bien hechos (ver investigación de esta sesión, fuentes:
  m2.material.io/design/color/dark-theme, smashingmagazine.com/2025/04/inclusive-dark-mode).
  **Decisión del usuario: no tocar la paleta por código.** Va a iterar el modo oscuro en Stitch
  (se le dio un prompt en inglés, mismo formato que `docs/diseno/prompts-stitch-v2.md`, para
  generar la variante oscura de cualquier pantalla a partir de su captura en claro) y traerá los
  resultados a la siguiente sesión.
- **Pendiente para cerrar T6 del todo (ya no requiere más cambios de código conocidos, solo
  verificación en emulador):**
  1. Recorrido con TalkBack documentado pantalla por pantalla (el usuario ya hizo una pasada,
     falta dejar constancia de qué cubrió — capturas o notas en `artifacts/t6/talkback-notas.md`
     — para subir RNF-004/009 a Verificado). **No hecho.**
  2. ~~Capturas en modo oscuro~~ **Hecho.** Las 6 de `artifacts/t6/` (ya trackeadas en git,
     confirmado 2026-11-10) son de la paleta ANTERIOR y quedaron obsoletas; **las capturas
     vigentes del modo oscuro están en `artifacts/modo-oscuro-stitch/`** (también trackeadas).
     No hace falta renombrar las de `t6/`.
  3. Captura con fuente del sistema ampliada para RNF-002 (confirmar visualmente el fix de
     `lineHeight`). **No hecho.**
  4. Confirmar en emulador que la háptica nueva de Atención/Movimiento se siente, igual que ya
     se confirmó en Memoria y recordatorios. **No hecho** (no confirmado por texto en esta
     sesión).

## T7 — Voz: REC-001 y REC-002 implementados y commiteados (2026-11-10)
Perfil del médico (REC-003): **ACTUALIZADO 2026-11-11: el equipo lo hará en la próxima sesión, ver
«Siguiente objetivo de la próxima sesión»**. Antes se había decidido NO hacerlo (el usuario lo
dejó en "contemplar, todavía no hacer"). Decisión y razones de la voz: **D-013**.
- **REC-001 (dictado):** botón «Dictar con voz» en `registrar-sintoma/paso-3.tsx`
  (`features/audio/dictation-button.tsx`) enfoca la nota y guía a usar el micrófono del
  teclado del sistema. No hay reconocedor propio (Expo SDK 58 no lo trae).
- **REC-002 (versión auditiva):** `expo-speech` (`features/audio/`: `speech.ts`, `voice.ts`,
  `scripts.ts`, `screen-scripts.ts`, `speak-button.tsx`, `use-activity-narration.ts`).
  Interruptor «Lectura en voz alta» en `/accesibilidad` (`audioGuidance` en `settings-slice`,
  apagado por defecto) que **manda sobre todo**: `SpeakButton` no se pinta si está apagado.
  Encendido: botón «Escuchar» en actividades, `registrar-sintoma/paso-1..3`, inicio del
  paciente, calendario (detalle del día), progreso y `apoyo/[id]`; auto-lectura solo en
  actividades. Textos largos partidos por frases (`splitForSpeech`).
- **Cambio de diseño a mitad de sesión:** la 1ª versión dejaba el botón «Escuchar» activo con
  el interruptor apagado; el usuario lo señaló como confuso y se cambió a "el interruptor manda".
- **Verificación:**
  - Código: `tsc` 0 errores, `eslint` limpio sobre los archivos tocados (no se corrió sobre todo
    el repo), **63 tests jest en verde** (antes 31; +32 en `features/audio/__tests__/`).
  - **Confirmado verbalmente por el usuario en su celular (Expo Go):** «Escuchar» funciona; con
    TalkBack encendido, al tocar «Escuchar» mientras habla, la voz de la app se detiene y manda
    TalkBack (arbitraje de audio de Android, es correcto y no hay que cambiarlo).
  - **No hay captura en `artifacts/`** para REC-001 ni REC-002, y el usuario **no ha confirmado**
    el dictado («Dictar con voz» abre el teclado y el micrófono del teclado escribe en la nota).
    Por eso siguen «Implementado sin probar» en `REQUISITOS.md` (regla: Verificado solo con
    prueba o captura).
- `supabase/seed/demo_data_completo.sql` (sin commitear): datos de demostración para simular
  actividad. Antes de commitearlo, comprobar que no tenga un correo real (el repo es público).

## Hecho el 2026-11-11 (resumen; el `/cierre` completo puede ampliarlo)
Todo commiteado y pusheado con Co-Authored-By de los 3 (`f5fd565`, `eeadd52`, `4266cd8`, `345e723`).
`tsc` 0 errores, `eslint` limpio sobre lo tocado, **80 tests jest en verde** (antes 68). Nada de esto
se vio aún en pantalla del celular salvo el flujo de correo (ver abajo).
- **Correos reales (confirmar cuenta / recuperar contraseña) — probado de punta a punta por el usuario:**
  SMTP propio (Gmail) en Supabase + **página estática en Vercel** (`web-auth/`, URL
  `https://neurotrackem-web-auth.vercel.app`, Root Directory `web-auth`, variables `SUPABASE_URL` y
  `SUPABASE_PUBLISHABLE_KEY`; `build.js` genera `config.js`, ignorado por git). Las plantillas usan
  `{{ .SiteURL }}/confirmar|restablecer?token_hash={{ .TokenHash }}&type=signup|recovery` y la página llama a
  `verifyOtp` al tocar el botón / enviar el formulario: **funciona desde cualquier dispositivo** (el flujo
  anterior con enlace a la app fallaba por PKCE y porque Expo Go no registra `neurotrackem://`). Pasos de
  configuración en `docs/SUPABASE-CORREO.md`. Plantillas y página con la paleta de la app; **la web va siempre
  en modo claro** (decisión del usuario; el modo oscuro automático del teléfono la dejaba negra).
  Las pantallas `src/app/correo/*` quedan como respaldo, ya sin uso.
- **Pantalla «Recuperar contraseña»** (`src/app/(auth)/recuperar.tsx` + `features/auth/recover-password-form.tsx`):
  correo → «Enviar correo» → «Revisa tu correo». Validación en `features/auth/validation.ts` (con prueba).
- **«¿Qué es Neurotrack EM?»** ahora es pantalla completa `src/app/acerca.tsx` (+ `features/about/`): para quién
  es, funciones, cómo empezar, privacidad, accesibilidad, preguntas frecuentes y aviso médico con una línea sobre
  123 / Línea 106 (el bloque grande de crisis se quitó: ya existe en Apoyo). Textos en `features/about/content.ts`.
- **Legal:** términos y privacidad ampliados (contacto `neurotrackem@gmail.com`, responsable = «el equipo de
  Neurotrack EM», terceros Supabase/Gmail/Vercel y transferencia internacional, retención, derechos con plazos de
  10/15 días hábiles, mayoría de edad sin excepción, créditos). **Constancia del consentimiento:** al registrarse
  se guardan `accepted_terms_at` y `accepted_terms_version` (`LEGAL_VERSION`, hoy `2026-11`) en los metadatos
  (`features/legal/consent.ts`). Si se cambia el texto legal, **subir `LEGAL_VERSION`**. No es asesoría legal.
- **Imágenes:** `assets/images/acerca-fondo.jpeg` (ilustración que pasó el usuario) en «¿Qué es?» y una versión
  recortada `perfil-hero.jpg` en la selección de perfil. Falta la variante oscura (en oscuro es un bloque claro).
- **Pendiente de verificar por el usuario (no confirmado):** ejecutar
  `supabase/migrations/20261114000000_harden_links_and_account.sql` en el SQL Editor; que `neurotrackem@gmail.com`
  exista con esa ortografía (antes se escribió «gmial»); que el texto legal diga Gmail y no Brevo; revisar en el
  celular recuperar contraseña, «¿Qué es?», la primera pantalla con la imagen nueva y la casilla de consentimiento.
- Metro quedó corriendo en segundo plano (`exp://192.168.40.71:8081`); cerrarlo si estorba.

## T10 — Perfil del médico tratante (REC-003): implementado; el usuario lo probó, sin capturas (2026-11-11)
Extra (el enunciado de Fase 3 no lo exige). Decisión y razones: **D-016**. Es una **ayuda, no un sustituto**: el médico
solo **lee** un resumen que el paciente autoriza; sin chat, sin alertas, sin diagnóstico (RT-004).
- **Migración** `supabase/migrations/20261115000000_doctor_links.sql` (el usuario confirmó que la ejecutó): tabla
  `doctor_links`, RPC `create_doctor_invite` / `claim_doctor_invite` / `mark_doctor_viewed` / `shared_symptom_logs`,
  políticas de lectura del médico en `activity_progress` y `activity_sessions`. Endurecida tras la auditoría de seguridad
  (código generado en el servidor, límite de intentos atómico, trigger que protege la identidad del vínculo).
  `shared_symptom_logs` también **arregla el permiso «Síntomas» del cuidador**, que antes no tenía efecto.
- **Código:** `src/features/doctor/` (types, constants, `logic.ts` puro con pruebas, `api.ts`, `severity-bars.tsx`),
  `src/store/slices/doctor-slice.ts`, `src/features/profile/constants.ts` (`PROFILE_HOME`/`PROFILE_LABEL` para los 3
  perfiles), `src/features/symptoms/summary.ts`. Pantallas: `src/app/(medico)/{pacientes,vincular-paciente,paciente/[id]}`,
  `src/app/mi-medico.tsx` (paciente, desde «Mi cuenta»), sección «Síntomas esta semana» en `(cuidador)/acompanar.tsx`.
- **Qué ve el médico:** constancia de registro («N de M días»), síntomas del período frente al anterior con diferencias
  neutras, intensidad (barras + palabra), por semana/mes, actividades (sesiones y nivel) y notas **solo si el paciente las
  autorizó** (permiso aparte, apagado por defecto). Mes o 3 meses. El paciente elige duración (3/6/12 meses o sin fecha) y
  ve «último acceso».
- **Legal:** términos y privacidad con sección «Médico tratante»; casilla de consentimiento actualizada;
  `LEGAL_VERSION = '2026-11.2'`.
- **Verificación:** `tsc`, `eslint src` y **111 pruebas jest** en verde (tras combinar con Stitch, ver D-016; el bundle carga en el emulador). Auditorías `security-reviewer` y
  `accessibility-reviewer` aplicadas. El usuario confirmó de palabra que probó el flujo con dos cuentas;
  **`artifacts/t10/` está vacía**, así que REC-003 sigue «Implementado sin probar» hasta tener capturas.
- **Deuda conocida (no tocada):** (1) en modo oscuro `onPrimary` sobre `primaryContainer` da ~1,1:1 y afecta ~30 archivos
  de pantallas anteriores (las del médico usan `primary`); (2) `claim_invite`/`caregiver_links` tienen el mismo oráculo de
  códigos y la misma carrera del límite que se corrigieron en `doctor_links`; (3) el placeholder de `TextField` da 4,1:1 en
  oscuro; (4) ~~comparar con Stitch~~ hecho el 2026-11-11 (D-016, «Diseño»); falta verlo en pantalla con dos cuentas.

## Siguiente acción concreta
**`README.md` (ENT-003) y `docs/ENTREGA-FINAL.md` (ENT-002) ya están escritos y pusheados.** El documento tiene las
5 secciones del enunciado §2, 4 diagramas Mermaid, la matriz trazable (16 mejoras de §V) y 12 referencias IEEE, con
marcadores `[PENDIENTE: …]` donde falta evidencia. **Siguiente acción:** tomar las capturas de T10 (lista de 21 en la
conversación del 2026-11-11, nombres `01-…` a `23-…` en `artifacts/t10/`), el recorrido TalkBack documentado y las
capturas con fuente al 130 % y modo oscuro; luego **repasar `ENTREGA-FINAL.md`** quitando los marcadores y ajustando la
Tabla 4 y la Tabla 5. Después: comparar el perfil médico con los exports de Stitch, el ensayo de la demo (ENT-004) y la
defensa individual (ENT-005). Riesgo de RT-007: `git shortlog -sne` solo cuenta a Samuel
(Amelyn y Mariana van como Co-Authored-By); ver D-007.

**Antes o junto al README, ≈10 min en el celular (lista de «Pendiente de verificar» de «Hecho el 2026-11-11»):**
ejecutar la migración `20261114…` en Supabase, probar recuperar contraseña, «¿Qué es?», la primera pantalla con
la imagen y la casilla de consentimiento. Y cerrar T7 con evidencia: en el paso 3 de registrar síntoma tocar
«Dictar con voz» y confirmar que el micrófono del teclado escribe en la nota; con «Lectura en voz alta» encendida,
capturar un botón «Escuchar» y el dictado en `artifacts/t7/`. Con eso REC-001 y REC-002 suben a Verificado.

**Después, por prioridad de rúbrica (entrega ~2026-11-12, hora sin confirmar):** ENT-002
(`docs/ENTREGA-FINAL.md`), RT-007 (`git shortlog -sne` con los 3) y
ensayo de la demo (ENT-004); la defensa individual (ENT-005, 40%) pesa más que cualquier
verificación visual pendiente. Si queda tiempo, la verificación de T6 de la sesión del 09-nov
(nada de eso se ha visto correr; solo se revisó por código):
1. `adb shell "cmd uimode night yes"` (o apariencia oscura en `/accesibilidad`) y recorrer la
   app: que las superficies se aclaren con la elevación y que **las tarjetas de "Tu plan de
   hoy" en inicio del paciente se vean**. Si no, la palanca es `surfaceContainerHigh`/
   `surfaceContainerHighest` en `src/theme/colors.ts` (D-012); no tocar las fijas.
2. `/accesibilidad`: probar los toggles, cerrar y reabrir la app para confirmar que persisten
   (`AsyncStorage`) y «Restablecer configuración».
3. Recorrido con TalkBack documentado (`artifacts/t6/talkback-notas.md`), captura con fuente
   ampliada (`adb shell settings put system font_scale 1.3`) y confirmación de la háptica de
   Atención/Movimiento; con eso subir RNF-001, 002, 003, 004, 007 y 009 a Verificado.

Pendiente menor, no bloquea lo anterior:
- ~~RF-007 sin marcar~~ **Ya está Verificado** en `REQUISITOS.md` (capturas `artifacts/t0/`). Solo la primera
  pantalla cambió después (imagen nueva `perfil-hero.jpg`): una captura nueva en `artifacts/` la dejaría al día.

Pendientes en paralelo (no bloquean lo anterior):
- Confirmar la **hora exacta** de entrega con el profesor (la fecha ya es ~2026-11-12).
- ~~Que Amelyn y Mariana acepten la invitación~~ **Resuelto** (usuario, 2026-11-10): ya están
  en el repo; aparecen como coautoras en los commits.
- ~~Una compañera no puede correr el proyecto localmente~~ **Resuelto** (usuario, 2026-11-10):
  ya puede correr la app con su propio `.env`.
- Borrar el repo de prueba temporal `coauthor-test` (requiere scope `delete_repo` o hacerlo por web).
- Más adelante: `docs/ENTREGA-FINAL.md` (ENT-002), `README.md` (ENT-003), RLS cuando existan
  tablas de dominio.

## Ya intentado, no repetir
- **Correo cuyo enlace redirige a la app (`{{ .ConfirmationURL }}` con `redirectTo = Linking.createURL(...)`) NO sirve
  en este proyecto.** El usuario veía una ventana negra al tocar el botón. Causas: (1) PKCE guarda el verificador en
  el dispositivo que pidió el correo, así que abrir el enlace en otro dispositivo o en el computador falla;
  (2) Expo Go no registra `neurotrackem://` (solo `exp://<IP>:8081`, que cambia por red), el navegador no encuentra
  qué app lo abre; (3) el visor de Gmail no abre esquemas propios. Solución adoptada: la página `web-auth/` con
  `token_hash` (D-014). Descartado por ahora (no implementado): código de 6 dígitos con `verifyOtp` dentro de la
  app; sirve como alternativa si se quitara Vercel.
- **No poner modo oscuro automático (`prefers-color-scheme`) en la web de Vercel.** El usuario la veía «negra, sin
  relación con la app» con el teléfono en oscuro (primero con un negro cálido propio `#14130f`, luego con la paleta
  oscura de la app). Decisión: **siempre clara** (`color-scheme: light` en `web-auth/styles.css` y en el `<meta>`).
- **Gmail aplica su propio modo oscuro a los correos y ignora `prefers-color-scheme`.** Las plantillas usan fondos
  `linear-gradient` de una sola tinta para que no inviertan los colores y llevan la paleta oscura de la app solo
  para clientes que la soportan (Apple Mail, Outlook). **No se verificó en Gmail real**: si sigue negro, pedir
  captura antes de tocar más.
- **En el Bash de esta sesión el Node por defecto es el 26** (nvm queda tapado). Antes de `npx`, `npm` o `jest`:
  `export PATH="/c/nvm4w/nodejs:$PATH"` (da 24.22.2). Ver ENTORNO.md.
- **Capturas de páginas con Chrome headless** (`chrome.exe --headless=new --screenshot=...`): con
  `--window-size` menor a ~500 de ancho recorta el lado derecho (artefacto, no del diseño); sin
  `--blink-settings=preferredColorScheme=1` sigue el modo del sistema (el Windows del usuario está en oscuro, por
  eso la captura «clara» salía oscura). Ver ENTORNO.md.
- **Un `rm -rf` en Bash fue denegado por permisos:** crear una carpeta nueva en el scratchpad en vez de borrar.
- **`TextField` (`src/components/text-field.tsx`) solo acepta un subconjunto de props de `TextInput`** y ya fija
  `autoCapitalize="none"`: pasar `autoCapitalize` hace fallar `tsc`.
- **Variables de Vercel sin el prefijo `EXPO_PUBLIC_`** (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`): `web-auth/build.js`
  busca exactamente esos nombres y el build falla si faltan. Pegar un `.env` entero en Vercel las crea con prefijo.
- **En la herramienta Bash, NO crear archivos largos con heredocs (`cat <<'EOF'`, `python - <<'EOF'`)
  si el contenido lleva comillas, apóstrofes o secuencias de escape (backslash + n, backslash + s).**
  Falló tres veces con `unexpected EOF while looking for matching` y, una vez, una regex con
  esas secuencias dentro del heredoc de Python quedó con un salto de línea real y rompió
  `features/audio/voice.ts` en silencio. **Lo que sí funciona:** crear el archivo con la
  herramienta `Write` (o editar con `Edit`) y, si hace falta un script, escribirlo con `Write` y
  ejecutarlo aparte; reservar `python - <<'EOF'` para reemplazos cortos sin regex ni escapes (y
  comprobar con `grep -n`/`cat -A` lo escrito).
- **No dejar el botón «Escuchar» funcionando con el interruptor «Lectura en voz alta» apagado.**
  Se hizo así primero (para que "siempre se pueda pedir a mano") y el usuario lo rechazó por
  confuso: el interruptor no hacía lo que decía. Ahora `SpeakButton` no se pinta si está apagado
  (D-013). No volver a la versión de "dos niveles".
- **No intentar arreglar que TalkBack "pise" la voz de la app.** Con TalkBack activo, Android da
  prioridad a TalkBack y corta `expo-speech`; el usuario lo confirmó y lo aceptó como correcto.
  El texto del interruptor ya avisa que con TalkBack no hace falta.
- **Levantar Expo para el celular desde un proceso en segundo plano no muestra QR** (no hay
  terminal visible). Dar al usuario la URL `exp://<IP-LAN>:8081` para «Enter URL manually» en Expo
  Go. Este equipo tiene varios adaptadores (VMware, Tailscale): la IP útil era `192.168.40.71`.
- **No asumas que todos los exports de "modo oscuro" de Stitch en `artifacts/modo-oscuro-stitch/`
  tienen el mismo formato.** Al extraer la paleta real (2026-11-09, 2ª sesión) se encontró que
  las ~35 carpetas vienen de generaciones distintas: unas traen la config Tailwind completa
  redefinida con los 41 roles M3 (la más confiable: `cuidador_inicio_modo_oscuro`), otras solo
  un `<style id="dark-theme-overrides">` con overrides puntuales por elemento (`paciente_inicio_
  modo_oscuro`, útil para ver qué tarjetas cambiaron de rol, no para la paleta base), y varias
  quedaron con la config **clara** sin tocar (`acceder_iniciar_sesi_n_modo_oscuro`,
  `cuidador_vincularme_modo_oscuro`) — su `screen.png` sí se ve oscuro porque el navegador headless
  que generó la captura sí aplicó estilos de `prefers-color-scheme`, pero el `code.html` no sirve
  para extraer valores. Antes de usar un `code.html` de esa carpeta para sacar colores, grepear
  `"surface": "#` y comparar contra el valor claro (`#fcf9f4`) para saber si de verdad trae
  paleta oscura o es el archivo original sin regenerar.
- **No generes SQL de datos de prueba con fechas relativas a `now()` (p. ej. `now() - interval
  'N days'`) cuando la pantalla a probar agrega por ventanas de calendario (semana/mes).**
  Pasó con `progreso_test_data.sql` (T3): "35-59 días atrás" se calculó en el momento de
  correr el script y cayó en el mes equivocado frente al momento en que el usuario abrió la
  app, y la ventana de "Semana" (~14 días) quedó casi vacía. **Lo que sí funciona:** fechas
  FIJAS en el `INSERT` (literales `'2026-10-26 12:00:00+00'`, no `now() - interval`), ancladas
  a la fecha real de la sesión, y verificar con una consulta de diagnóstico (contar días
  distintos dentro de la ventana exacta que usa la lógica) antes de asumir que el seed alcanzó.
- **No uses `useEffect` para derivar/mostrar feedback transitorio de un toque (ej. "resaltar
  la última opción tocada y borrarla sola a los 900ms"): el lint de este repo
  (`react-hooks/set-state-in-effect`, en `eslint.config.js`) lo rechaza como error, no como
  warning — "Calling setState synchronously within an effect can trigger cascading renders".
  Pasó en `src/app/actividad/[area].tsx` al construir el resaltado de `MemoriaResponderBlock`.
  **Patrón que sí pasa el lint:** mover el `setState` + `setTimeout` al manejador del evento
  (`onPress`/`onTap`), no a un `useEffect` disparado por el cambio de props/estado; usar
  `useRef` solo para guardar el id del `setTimeout` y limpiarlo en el cleanup de un efecto
  vacío (`useEffect(() => () => clearTimeout(ref.current), [])`), que no cuenta como
  "setState en el cuerpo del efecto" porque no llama `setState` ahí.
- **El mismo lint (`react-hooks/set-state-in-effect`) también rechaza el patrón "fetch de
  datos remotos con `useState` local + una función async llamada directo en `useEffect`"**
  (ej. `useEffect(() => { load(); }, [load])` donde `load` hace `await` y luego `setStatus(...)`)
  — no solo el caso de feedback transitorio de arriba. Pasó en `(cuidador)/acompanar.tsx` (T4)
  al traer `activity_progress`/`activity_sessions` del paciente acompañado. **Lo que sí pasa el
  lint, y es el patrón que ya usan todas las pantallas con datos remotos de este repo:** mover
  el fetch a un thunk de Redux (`createAsyncThunk`) y que el componente solo haga
  `dispatch(fetchX(...))` en el efecto y lea el resultado del store — nunca `useState` local
  para datos que vienen de una llamada async disparada en un efecto.
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
- **No usar la cuenta vieja `Samuelsss-oss`** para commits del
  proyecto: es una cuenta vieja de Samuel. La de la materia es `SamuelBlanco-65`. El Git local
  del repo ya está configurado correcto; no revertir.

## Errores conocidos
- **Sin captura ni confirmación en celular de lo hecho el 2026-11-11** salvo el flujo de correo de punta a punta
  (confirmado verbalmente por el usuario, sin captura): pantalla «Recuperar contraseña», «¿Qué es Neurotrack EM?»,
  imagen en la primera pantalla, casilla de consentimiento. Capturas pendientes en `artifacts/`.
- **La ilustración `acerca-fondo.jpeg` / `perfil-hero.jpg` solo existe en versión clara**; en modo oscuro es un bloque
  luminoso. Falta la variante oscura (el prompt para generarla se dio en la sesión; no se sabe si el usuario la hizo).
- **Texto legal con supuestos a confirmar:** dice «Gmail (Google)» como proveedor de correo (si se usó Brevo, cambiar
  `features/legal/documents.ts`); el correo de contacto `neurotrackem@gmail.com` se escribió antes como
  «gmial» — confirmar que existe con esa ortografía y que alguien revisa su bandeja. Las cuentas creadas antes del
  2026-11-11 no tienen `accepted_terms_at`.
- **Migración `supabase/migrations/20261114000000_harden_links_and_account.sql`**: no consta que el usuario la haya
  ejecutado en el SQL Editor (viene con «Mi cuenta» / borrar cuenta).
- `src/app/correo/*.tsx` y `src/features/auth/deep-link.ts` quedaron como respaldo del flujo anterior; ya no los usan
  las plantillas. Se pueden borrar o dejar; `deep-link-test.ts` los prueba.
- ~~**`supabase/seed/demo_data_completo.sql` sin commitear ni revisar**~~ **RESUELTO (2026-11-11):** se
  revisó (solo placeholders `PACIENTE@EJEMPLO.COM` / `CUIDADOR@EJEMPLO.COM`) y se commiteó. Antes de
  correrlo hay que sustituir esos dos correos por los de las cuentas de prueba, sin commitearlos.
- **Sin captura ni confirmación del dictado (REC-001) y sin capturas de REC-002** — ver
  "Siguiente acción concreta".
- ~~`package.json` no tiene script `test`~~ **RESUELTO (T6):** `"test": "jest"` con preset
  `jest-expo`, 31 tests en verde (`npx jest`).
- ~~El scaffold por defecto NO compila ni pasa lint~~ **RESUELTO (2026-11-03, 2ª sesión).**
  `typecheck` y `lint` pasan (exit 0). Ver "Hecho en la última sesión" para los 3 cambios.
  El conflicto de versión de ESLint ya no existe (`eslint.config.js` flat presente).
- El commit "Initial commit" (741ef4a) quedó atribuido a la cuenta vieja `Samuelsss-oss`. Es
  solo uno; se deja así salvo que se decida reescribir historial. Los commits nuevos ya van a
  `SamuelBlanco-65` + co-autores.
- **Fecha de entrega: en 2 días desde 2026-11-10, es decir ~2026-11-12** (dato del usuario,
  confirmado el 2026-11-10; la hora exacta sigue sin saberse). El enunciado de Fase 3 es
  tajante ("un minuto tarde = no se acepta"). **Con este margen, priorizar lo que la rúbrica
  puntúa y aún está en Pendiente: ENT-002 (documento), ENT-003 (README), ENT-004 (demo),
  RT-007, ENT-005 (defensa).** No ampliar extensiones más allá de la voz ya hecha (T7).
- ~~**Node v20.20.2 por debajo del mínimo de Expo SDK 58**~~ **RESUELTO (2026-11-10).** El
  equipo usa `nvm` (nvm4w, `C:\nvm4w\nodejs`); STATUS estaba desactualizado (ya estaba en
  22.15.0). Se actualizó a **Node 24.22.2** (LTS 24.x más reciente) con `nvm install 24.22.2`
  + `nvm use 24.22.2`. Verificado bajo esa versión: `tsc --noEmit` 0 errores, 31 tests jest en
  verde, `expo-doctor` 20/20. Ojo: hay otro Node 26.13.0 en `C:\Program Files\nodejs` que
  queda tapado por nvm en el PATH; no usarlo (Expo SDK 58 no se ha probado con Node 26).
- **Esquema de color oscuro sin verificar visualmente (actualizado 2ª sesión 2026-11-09).**
  `DarkColors` ya NO es el derivado a mano que el usuario rechazó — se reemplazó por la paleta
  real de Stitch con la escala de elevación corregida (ver D-012, sección T6 de arriba). Pero
  sigue sin capturarse en emulador con el tema oscuro activo tras este reemplazo (RNF-003/007
  siguen en "Implementado sin probar" por esto). Para verificar: forzar dark mode (`adb shell
  "cmd uimode night yes"`) y repetir el pase de capturas de `artifacts/t0/`, prestando atención
  especial a "Tu plan de hoy" en inicio del paciente (el bug concreto que se corrigió esta sesión).

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
- [x] **T1. Síntomas** — registro + calendario, persistidos con sync. (RF-001, RF-002)
  Verificado en emulador — ver sección "T1 — Síntomas" arriba.
- [x] **T2. Actividades** — set reducido (1–2 cognitivas + 1 motriz), dificultad progresiva. (RF-003, RF-004)
  Verificado por el usuario en emulador tras 4 rondas de ajustes — ver sección "T2 — Actividades" arriba.
- [x] **T3. Progreso** — historial y comparación actual vs pasado. (RF-005)
  Verificado por el usuario en emulador con datos de prueba — ver sección "T3 — Progreso" arriba.
- [x] **T4. Cuidador** — vinculación con consentimiento, observaciones, recordatorios
  (visual+háptica), acceso sincronizado a lo autorizado. (RF-006, RF-008, RF-012)
  Probado por el usuario en emulador con dos cuentas, commiteado y pusheado, **capturas en
  `artifacts/t4/` — VALIDADO** (confirmado por el usuario 2026-11-10). Ver sección
  "T4 — Módulo del cuidador" arriba.
- [x] **T5. Apoyo/Info** — contenidos de apoyo; subtítulos si hay audiovisual. (RF-009, RF-010)
  Verificado en emulador para ambos perfiles — ver sección "T5 — Apoyo/Info" arriba.
- [ ] **T6. Accesibilidad + pruebas** — pase de accesibilidad y pruebas jest-expo de la lógica. (RNF-*, pruebas)
- [~] **T7. Extensiones** — voz/dictado y versión auditiva commiteados en `7133316` (REC-001, REC-002, D-013); falta confirmar el dictado y capturas para Verificado; perfil médico (REC-003): **decidido hacerlo en la próxima sesión** (2026-11-11), ver sección «Siguiente objetivo».
- [ ] **T8. Documento Final** — `docs/ENTREGA-FINAL.md`: 5 secciones, matriz competitiva (Fase 1),
  diagrama de arquitectura E2E, **matriz trazable de accesibilidad** (mejora → archivo → prueba),
  pruebas y conclusiones; refs IEEE/APA. (ENT-002, EVA-001)
- [ ] **T9. README + entrega** — `README.md` (instalación, env vars, arquitectura, ejecución,
  accesibilidad); guion de demo en vivo; verificar commits equitativos de los 3. (ENT-003, ENT-004, RT-007)
- [x] **T7b. Correos reales + recuperar contraseña + legal + «¿Qué es?»** (2026-11-11) — RF-011 ampliado, D-014,
  D-015. Correo de punta a punta probado por el usuario (sin captura); pantallas nuevas sin ver en celular.
- [~] **T10. Perfil del médico tratante (REC-003)** — implementado y probado por el usuario (2026-11-11); falta
  guardar capturas en `artifacts/t10/` para pasar a Verificado; ver «T10» arriba y D-016. Extra: no lo exige el enunciado.
- [ ] **Transversal. Defensa individual** — repartir módulos por integrante y que cada quien
  entienda su código (estado, navegación, datos, accesibilidad). (ENT-005, EVA-004, 40%)
