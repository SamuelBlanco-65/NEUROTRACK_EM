# Prompts de Stitch v2 — Neurotrack EM

Segunda versión de los prompts. **No reemplaza a `prompts-stitch.md`**: lo deja intacto para
poder comparar. Esta versión parte de la revisión de las 5 vistas del paciente generadas con
la v1 y de cómo resuelven cada módulo apps que ya están en el mercado.

> **Estado:** propuesta. Cambia colores, tipografía y estructura respecto a `docs/DESIGN.md`,
> que sigue pendiente de aprobación. Si el equipo aprueba esta dirección, hay que actualizar
> `docs/DESIGN.md` §1, §2 y §5 con los valores de la sección "Tokens v2" (abajo) **antes** de
> implementar, para que el documento y los diseños no se contradigan.

---

## 1. Diagnóstico de las vistas actuales (v1)

Lo que hay que corregir, de más a menos grave:

| # | Problema | Dónde | Por qué importa |
|---|---|---|---|
| 1 | Servicios y personas inventados: "Servicio médico y psicológico 100% gratuito y confidencial", "Llamar ahora (Gratis)", "Chat con especialista", "Dra. Claudia Benítez", "validado por neurología" | Apoyo | En una app de salud, prometer una línea o un médico que no existe es un riesgo real para un paciente en crisis. Solo se muestran líneas verificadas. |
| 2 | Escala de severidad verde / azul / rojo con puntos diminutos | Calendario | Contradice RNF-006 (evitar rojo-verde) y RNF-003; el punto con número no se lee con baja visión. |
| 3 | Barra "Simulador de estado" en todas las pantallas | Todas | Es un control de demo, no parte de la app. Ocupa el primer lugar visual y se ve poco profesional. Los estados van como variantes separadas. |
| 4 | IDs de requisitos y textos internos en la UI: "(RF-003)", "(RF-004)", "Criterio WCAG / UX", "RF-009 / RF-019", "Límite de dominio" | Actividades, Progreso, Apoyo | Son notas para el equipo, no para el paciente. |
| 5 | Título del encabezado incorrecto ("Inicio" en Calendario y Actividades; "Progreso" en Apoyo, con la pestaña Progreso activa) | Encabezado y barra inferior | Rompe la navegación consistente (RNF-008) y confunde al lector de pantalla. |
| 6 | Texto truncado: "Medicación mat…", "Pausa activa e h…", "Vaso con agua y des…" | Inicio | Con la fuente del sistema ampliada (RNF-002) se corta todavía más. |
| 7 | Todo tiene el mismo peso: 5–6 tarjetas con borde, mismo azul, varios botones primarios por pantalla | Inicio, Actividades | Contradice "un elemento principal por pantalla" (RNF-008) y sube la carga visual (RNF-010). |
| 8 | El progreso premia la velocidad: "tu tiempo de concentración aumentó un 15%", "mayor acierto en agilidad cognitiva" | Progreso | El artículo (§V-B) dice que la velocidad no debe ser el criterio de rendimiento. Además, el subtítulo dice "sin comparaciones" y la pantalla compara. |
| 9 | Paleta monocroma azul-clínica y tarjetas con borde gris | Todas | Se lee como tablero clínico, justo lo que §III-B dice evitar. |
| 10 | Mayúsculas sostenidas en etiquetas ("PASO PRINCIPAL", "RECOMENDACIÓN ADAPTADA", "ÁREA: MEMORIA…") | Inicio, Actividades | Bloques en mayúsculas son más difíciles de leer, sobre todo con baja visión. |

Lo que **sí funciona** y se conserva: el saludo con fecha, "Sin límite de tiempo" en las
actividades, la actividad bloqueada con candado y explicación, el resumen del mes en texto bajo el
gráfico, la serie del gráfico con forma distinta (círculo / rombo), y el tono amable de
"No te preocupes por los días de descanso".

---

## 2. Qué tomamos de cada app de referencia

Solo patrones, no estética copiada. Las fuentes están al final.

| Módulo | Referencia | Qué tomamos |
|---|---|---|
| Tono general, Inicio | **Headspace** | Una sola recomendación central con un botón grande; colores cálidos en vez de gris o blanco puro; formas redondeadas; ningún tono de urgencia. |
| Tono general | **Cleo (Biogen)** | App de EM planteada como "compañera digital", con consejos por área (sueño, actividad, ánimo, comunicación), no como instrumento de medición. |
| Registro de síntomas | **Bearable** | Registro "con pocos toques, sin escribir"; historial por día y mes; resumen para llevar a la consulta. |
| Calendario | Apps de seguimiento de ciclo (p. ej. **Clue**) | Saber de un vistazo dónde estás en el mes; íconos de registro en el día, no solo color. |
| Actividades | **Constant Therapy** (rehabilitación tras ACV/lesión cerebral) | Dificultad adaptativa por objetivo; sesión del día recomendada en vez de un catálogo largo. |
| Actividad en curso | **Finch** | Toda acción completada recibe una respuesta visible y amable (la crítica de Pratt señala que cuando falta, el usuario no sabe si se guardó). |
| Cuidador | **Medisafe (Medfriend)** | El cuidador ve, no edita, lo del paciente; y recibe aviso solo cuando algo se omite, no por cada evento. |
| Tipografía | **Atkinson Hyperlegible** (Braille Institute) | Fuente diseñada para baja visión, con letras muy diferenciadas. Gratuita (SIL OFL) y en Google Fonts. |

---

## 3. Cómo usar este archivo

1. Proyecto nuevo en Stitch. Pega primero el **Bloque de estilo base v2**.
2. Pega el prompt de cada pantalla. Genera **solo la variante "normal"** primero.
3. Cuando la pantalla normal te convenza, pega cada estado (carga / vacío / error) **como
   variante separada de esa misma pantalla**. Nunca en la misma pantalla.
4. Los prompts están en inglés porque Stitch suele seguir mejor las instrucciones en inglés;
   todos los textos de la interfaz van en español entre comillas, y deben salir **tal cual**.
5. Si Stitch no ofrece Atkinson Hyperlegible, pídele "a highly legible humanist sans-serif with
   distinct I, l, 1 and 0/O" y anota cuál usó.
6. Guarda cada PNG en `docs/diseno/` con el nombre `v2-<pantalla>-<estado>.png`.

---

## 4. Tokens v2 (propuesta para `docs/DESIGN.md`)

Contrastes **calculados** (fórmula WCAG 2.x) con un script, no estimados.

**Modo claro**

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `bg` | `#FAF7F2` | Fondo (papel cálido) | — |
| `surface` | `#FFFFFF` | Tarjeta | — |
| `sunken` | `#F1ECE3` | Zonas hundidas, filas de lista | — |
| `text` | `#22252B` | Texto principal | 14,4:1 sobre bg |
| `textMuted` | `#585E6B` | Texto secundario | 6,1:1 sobre bg · 5,5:1 sobre sunken |
| `primary` | `#1E5A66` | Botón principal, enlaces, pestaña activa | 7,8:1 con texto blanco |
| `primaryContainer` / `onPrimaryContainer` | `#DCEDEE` / `#123C44` | Selección, día de hoy, chips activos | 9,9:1 |
| `warm` / `onWarm` | `#F6E2D0` / `#5A3416` | Tarjeta destacada, celebración | 8,6:1 |
| `success` | `#2F6B4F` | "Tomado", "Guardado" (siempre con ✓ + texto) | 6,3:1 sobre surface |
| `severityInk` | `#8A4513` | Barras de severidad | ≥ 4,8:1 sobre los 3 fondos de chip |
| `severityBg1/2/3` | `#FBF0D9` / `#F6E0C4` / `#EFCFB4` | Fondo del chip Leve / Moderado / Fuerte | texto `#4A2A10` ≥ 8,7:1 |

**Modo bajo brillo** (sin negro ni blanco puros, §V-D4)

| Token | Valor | Contraste |
|---|---|---|
| `bg` / `surface` / `sunken` | `#1B1E22` / `#24282E` / `#202328` | — |
| `text` / `textMuted` | `#ECE6DA` / `#B3AC9F` | 11,9:1 y 6,6:1 sobre surface |
| `primary` (texto del botón `#10282C`) | `#8FC9D0` | 8,4:1 |
| `primaryContainer` / `onPrimaryContainer` | `#21434A` / `#D2ECEE` | 8,6:1 |
| `warm` / `onWarm` | `#4A3424` / `#F6E2D0` | 9,2:1 |
| `severityInk` | `#E2A469` | ≥ 4,8:1 sobre los 3 fondos de chip |
| `severityBg1/2/3` (texto `#F6E2D0`) | `#3A3024` / `#4A3424` / `#5A3826` | ≥ 8,2:1 |

**Severidad sin depender del color:** tres barras verticales; las llenas van rellenas y las
vacías solo con contorno, **del mismo color**. Leve = 1 llena, Moderado = 2, Fuerte = 3, y
siempre con la palabra al lado. Así funciona sin color, con daltonismo y en blanco y negro.
(Simulé protanopia, deuteranopia y tritanopia: el orden claro→oscuro de la escala se conserva
en los tres.)

**Tipografía:** Atkinson Hyperlegible. Título 28/34 bold · Sección 20/26 bold ·
Cuerpo 17/24 regular · Etiqueta 15/20 bold. Mayúscula solo inicial, nunca bloques en
mayúsculas. Números grandes para datos clave.

**Forma y textura:** radios 16 (tarjetas) y 999 (botones y chips). Menos bordes: las tarjetas
se separan por el fondo cálido y una sombra muy suave teñida, no por líneas grises. Una sola
ilustración suave por pantalla como máximo (formas orgánicas redondeadas, sin caras
detalladas), nunca detrás de texto.

**Íconos:** Material Symbols Rounded (relleno = activo, contorno = inactivo). Verificar la
licencia al implementar y anotarla en el README.

---

## 5. Bloque de estilo base v2 (pegar una vez)

```
Design an Android mobile app called "Neurotrack EM" (tagline: "Tu evolución, tu proceso, tu camino.").
It is a daily companion for people living with multiple sclerosis and their caregivers in Latin America.
ALL user-facing text must be in Spanish (Latin America), exactly as written in quotes.

Mood: calm, warm, human, premium wellness app (think Headspace or Calm), NOT a clinical dashboard.
Low cognitive load: one clear primary element per screen, short sentences, generous white space.

Colors (light theme):
- Background warm paper #FAF7F2, cards #FFFFFF, recessed rows #F1ECE3
- Text #22252B, secondary text #585E6B (never lighter than this)
- Primary deep teal #1E5A66 with white text; selected/today chips #DCEDEE with text #123C44
- Warm highlight card #F6E2D0 with text #5A3416
- Success #2F6B4F, always with a check icon and a word
- No pure black, no pure white backgrounds behind long text, no red/green pairs, no neon, no gradients behind text.

Typography: Atkinson Hyperlegible. Screen title 28 bold, section 20 bold, body 17 regular,
labels 15 bold. Sentence case only — never ALL CAPS labels or eyebrows. Text must never be truncated
with "…"; let it wrap to two lines instead.

Shape: card radius 16, buttons and chips fully rounded (pill). Prefer separating cards with
background color and a very soft warm shadow instead of grey borders. Max one soft, rounded,
organic illustration per screen, never behind text.

Icons: Material Symbols Rounded; filled = active, outlined = inactive. Every icon has a text label next to it.

Accessibility (mandatory on every screen):
- Touch targets at least 48x48 dp; primary buttons 56 dp tall, full width.
- Only ONE filled primary button per screen. Other actions are secondary (outlined or text).
- States are never shown by color alone: always icon + word (and shape when it is a scale).
- Severity scale = three vertical bars, filled bars solid and empty bars outlined in the same
  brown #8A4513, plus the word "Leve", "Moderado" or "Fuerte".
- Charts always have a one-sentence text summary above them.

Navigation: top app bar with the current screen's title on the left and a profile avatar on the right.
Bottom navigation with 5 tabs, icon + always-visible label: "Inicio", "Calendario", "Actividades",
"Progreso", "Apoyo". The active tab has a teal pill behind the icon AND a bold label (not color only).
The title in the top bar always matches the active tab.

Never include: demo controls, state simulators, debug toggles, requirement IDs (like RF-003),
lorem ipsum, invented doctors, invented statistics, or promises of free medical services.
```

---

## 6. Prompts por pantalla

### 1. Selección de perfil
**Cubre:** RF-007.

```
Welcome screen for "Neurotrack EM". Warm paper background, one soft rounded illustration at the top
(two abstract rounded figures walking side by side, no detailed faces).
Title: "Te acompañamos en tu camino". Subtitle: "¿Cómo vas a usar la app?"
Two large selectable cards, full width, stacked, each with a rounded icon on the left, a title and one line:
1) Icon person: "Soy paciente" — "Registra cómo te sientes y haz tus actividades"
2) Icon two people: "Acompaño a alguien" — "Familiar, pareja o cuidador"
Small text link at the bottom: "¿Qué es Neurotrack EM?"
No bottom navigation on this screen.
```
**Estados**
```
Loading variant: same layout, the two cards as soft skeleton blocks, text "Verificando tu sesión…".
Error variant: a calm notice card at the top with an info icon, "No pudimos verificar tu sesión" and a
text button "Reintentar"; below it, "Puedes elegir tu perfil igual" and the two cards still active.
```

### 2. Acceder (iniciar sesión / crear cuenta)
**Cubre:** RF-011, RNF-012.

```
Sign-in screen for "Neurotrack EM". Top: back arrow and a small chip "Perfil: Paciente" with a person icon.
Title: "Hola de nuevo". Segmented control with two options: "Iniciar sesión" (selected) and "Crear cuenta".
Fields with visible labels above them (not placeholder-only), 56 dp tall:
"Correo electrónico", "Contraseña" with an eye icon button labeled "Mostrar contraseña".
Text link "¿Olvidaste tu contraseña?".
One full-width primary button: "Iniciar sesión".
Below, small secondary text with a lock icon: "Tus datos de salud se guardan cifrados y solo tú decides quién los ve."
```
**Estados**
```
Create-account variant: segmented control on "Crear cuenta", fields "Nombre", "Correo electrónico",
"Contraseña", "Confirmar contraseña", button "Crear cuenta".
Sending variant: button shows a small spinner and "Enviando…", fields dimmed.
Error variant: under the password field, an alert icon and "Correo o contraseña incorrectos" in dark text
(not red-only), the field outlined in brown #8A4513.
```

### 3. Paciente · Inicio
**Cubre:** hub (RF-001, RF-003, RF-005, RF-008). Referencias: Headspace (una recomendación central), Bearable (registro en pocos toques), Medisafe (fila de toma).

```
Patient home screen. Top bar title "Inicio".
Greeting block (no card): "Hola, María" in 28 bold, and below "Jueves 24 de octubre".

Hero card, the only primary element, warm highlight color #F6E2D0, radius 24:
title "¿Cómo te sientes hoy?", one line "Toca lo que notes. Puedes cambiarlo después."
A wrap of large pill chips with icons (min 48 dp): "Fatiga", "Dolor", "Visión", "Equilibrio",
"Concentración", "Ánimo", and a separate outlined chip "Me siento bien".
Primary full-width button: "Registrar cómo me siento".

Section "Tu plan de hoy" (title 20 bold), as a simple list on recessed rows, not separate cards.
Each row: time on the left in bold, icon, title wrapping to two lines if needed, and a status on the right:
- "9:00 a. m." pill icon, "Medicación de la mañana", secondary "Fingolimod 0,5 mg", status check icon + "Tomada"
- "11:00 a. m." stretch icon, "Estiramiento y respiración suave", secondary "10 min · Se puede hacer sentada",
  outlined button "Empezar"
- "4:30 p. m." water icon, "Pausa activa e hidratación", outlined button "Marcar"

Small card "Esta semana": seven small circles L M X J V S D, past registered days filled teal with a check,
today outlined with "Hoy", future days empty; text "Registraste 4 días. Los días de descanso también cuentan."
Text link "Ver mi progreso".
```
**Estados**
```
Loading variant: greeting visible, hero and list as soft skeleton blocks, text "Cargando tu día…".
First-use variant: hero card says "Empecemos" / "Registra cómo te sientes hoy para empezar tu historial." with the
same chips; "Tu plan de hoy" shows one friendly line "Aún no tienes recordatorios" and an outlined button
"Crear recordatorio". No weekly card.
Offline variant: slim banner under the top bar with a cloud-off icon: "Sin conexión. Lo que registres se guardará
y se enviará después." Content otherwise normal.
After saving: a snackbar at the bottom with a check icon: "Registro guardado".
```

### 3b. Paciente · Registrar cómo me siento (hoja inferior en 3 pasos)
**Cubre:** RF-001, REC-001. Referencia: Bearable ("pocos toques, sin escribir").

```
Bottom sheet over the home screen, covering 90% of height, with a drag handle and a close button "Cerrar".
Step indicator text "Paso 2 de 3" and three short segments.
Step 2 title: "¿Qué tan fuerte es la fatiga?"
Three very large vertical option cards, each full width, 72 dp tall, with the three-bar severity icon on the left:
"Leve" — "Puedo hacer mis cosas"
"Moderado" — "Me cuesta, pero puedo"
"Fuerte" — "Necesito parar o descansar"
Selected option: teal outline 2 dp, check icon and container #DCEDEE.
Bottom: secondary text button "Atrás" and primary button "Siguiente".
```
```
Step 3 variant: title "¿Quieres agregar algo?" (optional). A large text area labeled "Nota (opcional)",
an outlined button with a microphone icon "Dictar nota", a row "Hoy, 9:30 a. m." with an edit icon labeled
"Cambiar fecha y hora". Primary button "Guardar registro".
```

### 4. Paciente · Calendario
**Cubre:** RF-002, RF-001, RNF-006. Referencias: Clue (ubicación en el mes de un vistazo), Bearable (vista día y mes).

```
Patient calendar screen. Top bar title "Calendario".
Subtitle: "Tu mes, día a día."
Month header with previous/next round icon buttons labeled "Mes anterior" and "Mes siguiente", and title "Octubre 2024".
Month grid on a white card, each day cell at least 48x48 dp:
- Days with records show, under the number, a tiny three-bar severity icon in brown #8A4513
  (1, 2 or 3 bars filled) — no colored dots.
- Days marked "Me siento bien" show a small outlined sun icon.
- Today: teal outline ring. Selected day: filled #DCEDEE.
Below the grid, a compact legend row: three-bar icons with "Leve", "Moderado", "Fuerte" and sun icon "Bien".

Section "Jueves 24 de octubre" with a chip "2 registros".
A list of compact rows (recessed background, radius 16), each: symptom icon, symptom name in bold,
time "9:30 a. m.", a severity chip on the right (three bars + "Fuerte"), and one line of the note,
then a chevron. Rows:
- "Fatiga" · "Fuerte" · "Pesadez en las piernas al levantarme."
- "Visión borrosa" · "Leve" · "Mejoró al descansar los ojos."
Extended floating action button bottom-right: plus icon + "Registrar".
```
**Estados**
```
Loading variant: grid and rows as skeletons, text "Cargando tus registros…".
Empty day variant: under the grid, a sun-outline icon and "No registraste nada este día." with an outlined
button "Registrar para este día".
Empty month variant: grid with no marks and a warm card "Aún no tienes registros este mes. Cuando registres
cómo te sientes, aparecerá aquí."
Offline variant: slim banner "Sin conexión. Mostrando lo guardado en este teléfono."
```

### 5. Paciente · Actividades
**Cubre:** RF-003, RF-004, RNF-008. Referencia: Constant Therapy (sesión del día con dificultad adaptativa).

```
Patient activities screen. Top bar title "Actividades".
Subtitle: "A tu ritmo, sin cronómetro."

Hero card (only primary element), radius 24, container #DCEDEE:
small label "Tu sesión de hoy", title "Secuencia de patrones", line "Memoria · Nivel 2 de 5 · 3 a 5 minutos",
a soft rounded illustration of three shapes in sequence,
primary full-width button "Empezar sesión".

Section "Áreas" as a 2-column grid of square tiles (radius 20, white), each tile:
rounded icon, area name in bold, "Nivel X de 5" text and a segmented progress bar of 5 segments
(filled segments solid teal, empty ones outlined teal):
- "Memoria" Nivel 2 de 5
- "Atención" Nivel 3 de 5
- "Movimiento" Nivel 1 de 4, with a small chip "Apto con temblor"
- "Lógica" locked: lock icon, muted, text "Se abre al llegar al nivel 3 de Memoria"
Tiles are tappable (no buttons inside tiles).
```
**Estados**
```
Loading variant: hero and four tiles as skeletons.
Offline variant: banner "Sin conexión. Puedes hacer las actividades guardadas."; locked or unavailable tiles say
"Disponible con conexión".
```

### 5b. Paciente · Actividad en curso
**Cubre:** RF-003, RNF-008, RNF-009. Referencia: Finch (respuesta visible a cada acción).

```
Full-screen focused activity, no bottom navigation. Top: close icon button labeled "Pausar y salir" and centered
text "Paso 2 de 4" with four short segments.
Instruction at the top in 22 bold, one sentence: "Toca las figuras en el mismo orden en que aparecieron."
Center: a 2x2 grid of very large rounded tiles (at least 120 dp each), each with a simple shape icon and its name
below: "Círculo", "Estrella", "Hoja", "Ola". Tiles have generous spacing to tolerate tremor.
Bottom: secondary text button "Ver la secuencia otra vez". No timer anywhere.
```
```
Feedback variant after a correct tap: the tapped tile shows a check icon and the text "¡Bien!" below the grid;
a calm, non-flashing confirmation.
```
```
Session complete screen: soft rounded illustration, title "Sesión completada", line "Hiciste 4 de 4 pasos.
Cada práctica cuenta." Two small stat blocks: "Aciertos 7 de 8" and "Nivel 2 de 5". No speed or time stats.
Primary button "Volver a actividades", text button "Repetir".
```

### 6. Paciente · Progreso
**Cubre:** RF-005, RNF-006. Referencias: Bearable (patrones y resumen para la consulta).

```
Patient progress screen. Top bar title "Progreso".
Segmented control: "Semana", "Mes" (selected), "3 meses".
Period row: "Octubre 2024" with previous/next icon buttons.

Summary card (the main element), white, radius 24: a large sentence in 22 bold:
"Este mes registraste menos días con fatiga fuerte que en septiembre."
Below, a line chart of weekly counts for October: series 1 "Días con síntomas" solid teal line #1E5A66 with circle markers,
series 2 "Actividades hechas" dashed brown line #8A4513 with diamond markers. Each line is labeled directly at its end
(no separate legend). Y axis labels in 15 text, light grid lines.
Text button with a table icon: "Ver como tabla".

Section "Lo que notamos" — up to three rows on recessed background, each with a direction icon and text, no percentages:
- arrow-down icon: "Fatiga fuerte" — "3 días en octubre, 7 en septiembre."
- equal icon: "Visión borrosa" — "Igual que el mes pasado."
- check icon: "Constancia" — "Registraste 4 semanas seguidas."
Small muted text with an info icon: "Esto es un resumen de tus registros, no un diagnóstico."
Outlined button with a document icon: "Preparar resumen para mi consulta".
```
**Estados**
```
Loading variant: summary card and rows as skeletons.
Not-enough-data variant: summary card says "Necesitamos al menos dos semanas de registros para mostrarte cambios."
with an outlined button "Registrar cómo me siento"; no chart.
Table variant: the chart replaced by a simple 3-column table "Semana", "Días con síntomas", "Actividades".
```
> **Nota de alcance:** "Preparar resumen para mi consulta" no está en `REQUISITOS.md`. Si no lo
> van a implementar, quítenlo del prompt para no diseñar algo que luego no existe.

### 7. Paciente · Apoyo
**Cubre:** RF-009, RF-010. Referencia: Cleo (consejos por área de la vida diaria).

```
Patient support screen. Top bar title "Apoyo". Bottom tab "Apoyo" active.
Subtitle: "Información clara y ayuda cuando la necesites."

Card "¿Necesitas hablar con alguien?" (warm container #F6E2D0, radius 24), heart-hands icon, two rows:
- phone icon, "Línea 106 · Bogotá", secondary "Escucha y orientación psicológica · 24 horas · gratuita",
  outlined button "Llamar al 106"
- alert icon, "Emergencias", secondary "Si estás en peligro, llama al 123", outlined button "Llamar al 123"
Small muted text: "Si no estás en Bogotá, consulta la línea de tu ciudad."

Section "Para tu día a día" with filter chips: "Todo" (selected), "Leer", "Escuchar", "Ver".
Content rows (white cards, radius 16), each: rounded icon by format, title in bold, a format chip and duration:
- book icon, "Entender la fatiga en la EM", chip "Leer · 3 min"
- headphones icon, "Respiración para momentos de tensión", chip "Escuchar · 5 min", secondary "Con transcripción"
- play icon, "Moverte con energía limitada", chip "Ver · 6 min", secondary "Con subtítulos"
- people icon, "Cómo contarle a tu familia lo que sientes", chip "Leer · 4 min"
Footer muted text: "Estos contenidos informan y acompañan; no reemplazan a tu médico."
```
**Estados**
```
Loading variant: help card visible immediately (never hidden while loading), content rows as skeletons.
Offline variant: help card still visible; banner "Sin conexión. Puedes leer lo que ya abriste."
```
> **Importante:** las dos líneas del prompt están verificadas para Bogotá (fuentes al final).
> Antes de entregar, confirmen que siguen vigentes. No agreguen chats, psicólogos ni médicos que
> la app no tenga de verdad.

### 7b. Paciente · Detalle de contenido
**Cubre:** RF-010.

```
Content detail for a video: top bar with back arrow and title "Moverte con energía limitada".
16:9 video player with captions ON by default and a visible "Subtítulos: activados" toggle chip.
Large play/pause, back 10 s and forward 10 s buttons, each at least 56 dp, labeled.
Below, a section "Transcripción" with readable 17 text, the current sentence highlighted with the #DCEDEE container.
A control "Tamaño del texto" with "A-" and "A+" buttons.
```

### 8. Cuidador · Inicio
**Cubre:** hub (RF-006, RF-008, RF-012). Referencia: Medisafe Medfriend (ver sin editar; avisar solo lo omitido).

```
Caregiver home screen. Top bar title "Inicio". Bottom navigation for caregiver: "Inicio", "Observaciones",
"Acompañar", "Recordatorios", "Apoyo" (icon + label, active tab with teal pill and bold label).
Greeting: "Hola, Andrés" and below, a chip with avatar "Acompañas a María".

Main card (only primary element): "Cómo va María hoy", with only what María shared:
- severity chip three bars "Moderado" + "Fatiga, registrada a las 9:30 a. m."
- check icon "Medicación de la mañana tomada"
- small muted text with an eye icon: "Ves lo que María decidió compartir."
Primary button: "Anotar una observación".

Section "Necesita atención" (only shown when something was missed): a recessed row with alert icon
"No se marcó la pausa de las 4:30 p. m." and an outlined button "Recordarle".

Small warm card for the caregiver: "¿Y tú cómo estás? Cuidar también cansa." with text link "Ver apoyo para ti".
```
**Estados**
```
Not-linked variant: a single centered card with illustration, "Aún no acompañas a nadie",
"Pídele a la persona que acompañas su código de invitación.", primary button "Ingresar código".
Linked but nothing shared variant: main card says "María todavía no ha compartido información contigo."
Loading variant: skeletons. Offline variant: banner "Sin conexión. Mostrando lo último guardado."
```

### 9. Cuidador · Vincularme
**Cubre:** RF-012, RNF-012.

```
Caregiver link screen. Top bar with back arrow, title "Vincularme".
Illustration small. Title "Ingresa el código de invitación". Line: "La persona que acompañas lo encuentra en
su app, en Perfil > Invitar a alguien."
Six large separate boxes for a 6-character code, each at least 48 dp. Outlined button with QR icon "Escanear código QR".
Info row with lock icon: "Solo verás lo que esa persona autorice, y puede quitarte el acceso cuando quiera."
Primary button "Enviar solicitud".
```
**Estados**
```
Pending variant: hourglass icon, "Solicitud enviada", "Esperando a que María acepte." Text button "Cancelar solicitud".
Error variant: alert icon under the code boxes, "Ese código no es válido o ya venció. Pide uno nuevo."
Accepted variant: check icon, "¡Listo! Ya acompañas a María.", primary button "Ir al inicio".
```

### 10. Paciente · Permisos del cuidador
**Cubre:** RF-012, RNF-012.

```
Patient consent screen. Top bar back arrow, title "Permisos".
Card with avatar: "Andrés quiere acompañarte".
Line: "Elige qué puede ver. Puedes cambiarlo cuando quieras."
List of rows, each with icon, title, one line explaining what he will see, and a large switch with "Sí"/"No" text inside:
- "Mis síntomas" — "Verá qué registras y qué tan fuerte."  [Sí]
- "Mi progreso" — "Verá el resumen de tus semanas."  [Sí]
- "Mis recordatorios" — "Sabrá si se te pasó una toma."  [Sí]
- "Mis notas" — "Leerá las notas que escribes."  [No]
Bottom: primary button "Aceptar y compartir", text button "Rechazar".
```
**Estados**
```
No-requests variant: illustration and "No tienes solicitudes. Puedes invitar a alguien desde tu perfil."
Saved variant: snackbar with check icon "Permisos guardados".
```

### 11. Cuidador · Observaciones
**Cubre:** RF-006.

```
Caregiver observations screen. Top bar title "Observaciones". Subtitle: "Lo que notas también ayuda en la consulta."
Timeline list grouped by day headers ("Hoy", "Ayer", "22 de octubre"); each entry on a recessed row:
category icon, category name in bold, time, two lines of note text, chevron.
Entries: "Ánimo" · "Estuvo más callada en la tarde." / "Movilidad" · "Se apoyó en la pared al subir la escalera."
Extended floating action button "Nueva observación".
```
```
New observation bottom sheet: title "Nueva observación". Category as large pill chips with icons:
"Ánimo", "Movilidad", "Fatiga", "Medicación", "Otro". Text area "¿Qué notaste?", microphone button "Dictar",
row "Hoy, 6:10 p. m." with "Cambiar". Primary button "Guardar".
```
**Estados**
```
Empty variant: "Aún no hay observaciones. Anota lo que notes; servirá para la próxima consulta." + button.
Offline-saving variant: snackbar "Guardado en este teléfono. Se enviará cuando haya conexión."
```

### 12. Cuidador · Acompañar
**Cubre:** RF-006.

```
Caregiver accompany screen. Top bar title "Acompañar". Subtitle: "Así va María con sus actividades."
Card per area (Memoria, Atención, Movimiento) with icon, "Nivel X de 5", the same segmented progress bar as the
patient app, and "Última práctica: ayer".
Main element card at top: "Esta semana María hizo 5 actividades." with a primary button "Enviarle un mensaje de ánimo".
Message sheet variant: three ready-made messages as large selectable cards ("¡Vas muy bien!", "Estoy orgulloso de ti",
"¿Practicamos juntos hoy?") plus "Escribir otro".
```
**Estados**
```
Not-shared variant: lock icon card "María no ha compartido sus actividades contigo." No data shown at all.
Empty variant: "María aún no ha hecho actividades esta semana." (neutral, no blame).
```

### 13. Cuidador · Recordatorios
**Cubre:** RF-008, RNF-009.

```
Caregiver reminders screen. Top bar title "Recordatorios".
Segmented control "Hoy" (selected) / "Todos".
Timeline list by time; each row: time in bold, type icon (pill, calendar, activity), title wrapping to two lines,
status at right with icon + word: "Tomada", "Pendiente", "Se pasó".
Extended floating action button "Nuevo recordatorio".
```
```
Active reminder variant: full-width high-visibility card at the top (warm container #F6E2D0, thick left accent
in primary teal), bell icon with a small vibration icon, text "Es hora de: Medicación de la noche",
secondary "Vibración activada", two buttons 56 dp: primary "Hecho" and outlined "Posponer 10 min".
```
**Estados**
```
Empty variant: "No hay recordatorios. Crea uno para no perder una toma o una cita." + button.
```

### 14. Cuidador · Apoyo
**Cubre:** RF-009, RF-010.

```
Caregiver support screen, same layout as the patient support screen, top bar title "Apoyo".
Same verified help card ("Línea 106 · Bogotá", "Emergencias 123").
Section "Para quien cuida" with filter chips and rows:
- "Cuidar sin agotarte" · "Leer · 4 min"
- "Cómo contarle al médico lo que observas" · "Leer · 3 min"
- "Pausa de 5 minutos para ti" · "Escuchar · 5 min · Con transcripción"
Footer: "Estos contenidos informan y acompañan; no reemplazan la atención profesional."
```

---

## 7. Checklist al revisar cada diseño generado

- [ ] Ningún simulador, control de demo ni ID de requisito visible.
- [ ] El título superior coincide con la pestaña activa.
- [ ] Un solo botón relleno (primario) en la pantalla.
- [ ] Ningún texto cortado con "…".
- [ ] Severidad con barras + palabra; ningún punto rojo/verde.
- [ ] Ningún servicio, persona o cifra inventada.
- [ ] Textos en español exactamente como en el prompt.
- [ ] Probado también en modo bajo brillo (pídeselo a Stitch como variante: "Same screen in the low-brightness
      dark theme: background #1B1E22, cards #24282E, text #ECE6DA, secondary #B3AC9F, primary #8FC9D0 with
      dark text #10282C").

---

## Fuentes

- Headspace, principios de diseño (análisis no oficial; los valores son aproximados):
  https://blakecrosley.com/guides/design/headspace
- Cleo, app de EM de Biogen: https://betomorrow.com/en/our-projects/cleo-application-health ·
  https://apps.apple.com/gb/app/cleo/id1453391433
- Bearable, registro de síntomas: https://bearable.app/symptom-tracker/
- Medisafe, Medfriend vs. perfil dependiente:
  https://help-center.medisafe.com/en/articles/9708717-what-is-the-difference-between-medfriend-and-dependent-profiles
- Constant Therapy: https://constanttherapyhealth.com/constant-therapy/for-patients/
- Finch, crítica de diseño (Pratt Institute): https://ixd.prattsi.org/2025/09/design-critique-finch-ios-app-2/
- Atkinson Hyperlegible (Braille Institute, Google Fonts):
  https://prnewswire.com/news-releases/braille-institutes-atkinson-hyperlegible-typeface-now-available-on-google-fonts-301349120.html
- Línea 106 Bogotá y línea 123 (Alcaldía de Bogotá, 30-sep-2026):
  https://bogota.gov.co/mi-ciudad/salud/linea-106-en-bogota-apoyo-psicologico-y-escucha-las-24-horas
