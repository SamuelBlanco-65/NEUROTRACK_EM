# Prompts de Stitch — Neurotrack EM

Un prompt por pantalla del plan (`docs/DESIGN.md` §4 + `docs/STATUS.md`), derivado de
`docs/REQUISITOS.md`. Cada pantalla trae su prompt principal y los estados de **carga,
vacío, error/offline** y los **límites de dominio**, más las notas de accesibilidad.

> **Estado:** estos prompts reflejan la propuesta de `docs/DESIGN.md`, que sigue
> **pendiente de aprobación**. Los valores de color son propuesta y deben validarse
> (contraste y daltonismo) antes de fijarse.

## Cómo usar este archivo
1. En Stitch, crea el proyecto y **pega primero el “Bloque de estilo base”** (abajo) para
   fijar tema, tipografía y reglas de accesibilidad.
2. Para cada pantalla, pega el **Prompt principal**. Stitch genera una pantalla por vez.
3. Para cada **estado** (carga / vacío / error / límite), pega el subprompt correspondiente
   como una variante nueva de esa misma pantalla.
4. Toda la interfaz va **en español (Latinoamérica)** (RNF-011). Mobile, Android, orientación
   vertical. Un solo elemento principal por pantalla (RNF-008, RNF-010).

---

## Bloque de estilo base (pegar una vez, y asumir en todas las pantallas)

```
Diseña una app móvil Android en español (Latinoamérica) llamada "Neurotrack EM",
eslogan "Tu evolución, tu proceso, tu camino.". Es una app de acompañamiento en salud
(esclerosis múltiple), con tono calmado, humano y de baja fatiga: NO parece un tablero
clínico denso. Mucho espacio en blanco, un solo elemento principal por pantalla, poco texto.

Tema de color (modo claro / modo bajo brillo-oscuro):
- Fondo bg: #F7FAFC / #14181D
- Superficie/tarjeta surface: #FFFFFF / #1E242B
- Texto principal: #1A2027 ; texto secundario: #5A6472
- Acción principal accent: #2B6CB0
- Estados: ok #2E7D5B, advertencia #B26A00, peligro #B23A48
  (los estados SIEMPRE se comunican con color + ícono + texto, nunca solo con color;
   evitar combinaciones rojo-verde). En modo bajo brillo evitar blanco puro sobre negro puro.

Tipografía (respeta el escalado de fuente del sistema, sin recortes ni superposición):
- Título 28 bold (uno por pantalla) · Subtítulo 20 semibold · Cuerpo 17 regular · Etiqueta 15 medium

Espaciado 4/8/12/16/24/32. Radios 8/12/16. Área táctil mínima 48x48 dp en todo control.

Accesibilidad obligatoria (WCAG 2.2 AA / POUR) en TODAS las pantallas:
- Contraste de texto mínimo 4.5:1.
- Cada ícono, botón e imagen con etiqueta descriptiva para lector de pantalla (TalkBack);
  orden de lectura lógico, sin depender de gestos complejos.
- Botones grandes, sin iconografía diminuta ni textos secundarios minúsculos.
- Los cambios dinámicos (resultados, errores, confirmaciones) se anuncian de forma visual
  (región activa) además del color.
- Avisos y recordatorios importantes con alternativa visual + vibración háptica, nunca solo sonido.
- Cualquier contenido de audio o video lleva subtítulos y transcripción.
- Instrucciones cortas, claras y directas; navegación simple y consistente.
Barra de pestañas inferior con ícono + etiqueta de texto, área táctil amplia.
```

Reglas de estados que aplican a TODAS las pantallas con datos:
- **Carga:** esqueleto o spinner con etiqueta “Cargando…”. Nunca pantalla congelada sin aviso.
- **Vacío:** mensaje breve y amable + una acción sugerida; sin culpabilizar al usuario.
- **Error / offline:** mensaje claro de qué pasó + botón “Reintentar”; nunca pantalla en blanco.
  Diferenciar “sin conexión” (datos locales en caché si existen) de “error del servidor”.

---

## 1. Selección de perfil
**Cubre:** RF-007 · **Plan:** antes de T0.

**Prompt principal**
```
Pantalla "Selección de perfil" de Neurotrack EM. Primera pantalla tras abrir la app.
Arriba: logo/nombre "Neurotrack EM" y el eslogan "Tu evolución, tu proceso, tu camino.".
Debajo, centrado, el título "¿Cómo vas a usar la app?" y dos tarjetas grandes apiladas
(cada una ocupa todo el ancho, mínimo 48 dp de alto, con ícono + título + una línea de
descripción):
1) "Soy paciente" — descripción "Registra tus síntomas y haz tus actividades".
2) "Soy cuidador o familiar" — descripción "Acompaña y registra observaciones".
Al pie, un enlace discreto "Más sobre Neurotrack EM". Una sola acción principal por tarjeta.
Tono calmado, mucho aire, sin densidad. Etiquetas de accesibilidad en cada tarjeta.
```
**Estados**
```
Carga: misma pantalla con las dos tarjetas en esqueleto mientras se verifica si ya hay una
sesión abierta; texto "Verificando tu sesión…".
Error/offline: tarjeta de aviso "No pudimos verificar tu sesión" con botón "Reintentar" y
texto secundario "Puedes elegir tu perfil de todas formas"; las dos tarjetas siguen activas.
```
Sin estado “vacío” (pantalla estática).

---

## 2. Registro / Inicio de sesión
**Cubre:** RF-011 (auth), RNF-012 · **Plan:** T0.5.

**Prompt principal**
```
Pantalla "Acceder" de Neurotrack EM con un selector superior de dos pestañas: "Iniciar sesión"
y "Crear cuenta". Muestra el perfil elegido antes como una etiqueta ("Perfil: Paciente").
Formulario:
- Correo electrónico (teclado de email).
- Contraseña (con botón mostrar/ocultar, etiquetado para lector de pantalla).
- En "Crear cuenta": además Nombre y Confirmar contraseña.
Botón principal grande de ancho completo ("Iniciar sesión" / "Crear cuenta", color accent).
Enlace "¿Olvidaste tu contraseña?". Debajo, texto pequeño de privacidad:
"Tus datos de salud se guardan de forma segura". Validación en línea bajo cada campo.
Un solo elemento principal (el formulario).
```
**Estados**
```
Carga: botón principal en estado "Enviando…" deshabilitado con spinner; campos bloqueados.
Vacío: estado inicial con campos vacíos y placeholders; botón principal deshabilitado hasta
que los campos requeridos sean válidos.
Error: mensajes de error bajo el campo correspondiente, con ícono de alerta + texto (no solo
color rojo). Ejemplos: "Correo o contraseña incorrectos", "Este correo ya está registrado",
"Revisa tu conexión a internet". El error se anuncia también como región activa.
```
**Accesibilidad extra:** los errores combinan ícono + texto; foco del lector va al primer campo con error.

---

## 3. Paciente · Inicio
**Cubre:** hub del paciente (enlaza RF-001, RF-003, RF-005, RF-008) · **Plan:** T1+.

**Prompt principal**
```
Pantalla "Inicio" del paciente en Neurotrack EM. Encabezado con saludo "Hola, [Nombre]".
Contenido en tarjetas apiladas, una acción clara por tarjeta:
1) Tarjeta destacada "¿Cómo te sientes hoy?" con botón grande "Registrar síntoma".
2) Tarjeta "Tu actividad de hoy" con nombre de la actividad sugerida, su nivel, y botón "Empezar".
3) Tarjeta "Recordatorios de hoy" con 1–2 recordatorios (hora + ícono + texto).
4) Tarjeta "Tu progreso" con un resumen breve (p. ej. "Has registrado 4 días esta semana").
Barra de pestañas inferior: Inicio, Calendario, Actividades, Progreso, Apoyo.
Calmado, poco texto, tipografía grande.
```
**Estados**
```
Carga: tarjetas en esqueleto con el encabezado visible.
Vacío (primer uso): una sola tarjeta de bienvenida "Empecemos" con texto "Aún no has
registrado nada. Registra tu primer síntoma para comenzar." y botón "Registrar síntoma";
las demás tarjetas muestran mensajes suaves ("Sin recordatorios por ahora").
Error/offline: banner superior "Sin conexión — mostrando lo guardado" si hay caché, o tarjeta
de error con "Reintentar" si no hay datos locales.
```

---

## 4. Paciente · Calendario de síntomas
**Cubre:** RF-002, RF-001, RNF-006 · **Plan:** T1.

**Prompt principal**
```
Pantalla "Calendario de síntomas" del paciente. Arriba un calendario mensual con navegación
mes anterior/siguiente. Los días con registros se marcan con un punto + ícono (no solo color);
la intensidad del día se indica con color + ícono + número, nunca solo color, y sin usar
rojo-verde. Debajo del calendario, al seleccionar un día, una lista de los síntomas de ese
día: cada ítem muestra tipo de síntoma, severidad (escala leve/moderado/fuerte con ícono +
etiqueta de texto, no solo color), hora y nota corta. Botón flotante grande "Registrar síntoma".
Un elemento principal: el calendario con el detalle del día seleccionado.
```
**Prompt del formulario de registro (sub-pantalla / modal)**
```
Formulario "Registrar síntoma": selector de tipo de síntoma (fatiga, dolor, movilidad,
visión, cognición, ánimo, otro), selector de severidad en escala con ícono + texto
(leve / moderado / fuerte), campo de nota opcional, selector de fecha y hora (por defecto hoy).
Más adelante: botón opcional de dictado por voz (extensión). Botón principal "Guardar".
Instrucciones cortas, un paso a la vez.
```
**Estados**
```
Carga: calendario y lista en esqueleto; texto "Cargando tus registros…".
Vacío (día sin registros): bajo el calendario, mensaje "No hay síntomas registrados este día"
+ botón "Registrar síntoma".
Vacío (mes/todo sin registros): calendario sin marcas y tarjeta "Aún no tienes registros.
Empieza registrando cómo te sientes hoy."
Error/offline: si hay caché, mostrarla con banner "Sin conexión"; si no, tarjeta de error con
"Reintentar". Al guardar sin conexión: aviso "Se guardará y se sincronizará cuando vuelva la conexión".
Guardado: confirmación breve anunciada como región activa ("Síntoma registrado").
```

---

## 5. Paciente · Actividades
**Cubre:** RF-003 (cognitiva), RF-004 (motriz), RNF-008 · **Plan:** T2.

**Prompt principal**
```
Pantalla "Actividades" del paciente: ejercicios de estimulación. Lista de tarjetas por
actividad agrupadas por área (Memoria, Atención, Lógica, Motriz). Cada tarjeta: ícono,
nombre, una línea de descripción, nivel actual (p. ej. "Nivel 2 de 5" con barra de progreso
que combina texto + forma, no solo color) y botón "Empezar". Las actividades de niveles
superiores pueden verse bloqueadas con un candado + texto "Completa el nivel anterior".
Las instrucciones son cortas; la dificultad es progresiva. Un elemento principal: la lista.
```
**Prompt de una actividad en curso (sub-pantalla)**
```
Pantalla de una actividad de estimulación en curso: instrucción corta y clara arriba
(1 frase), el ejercicio en el centro (un solo paso visible a la vez), y controles grandes.
Indicador de paso "Paso 2 de 4". Sin presión de tiempo visible como criterio único; si hay
tiempo, se muestra de forma secundaria. Botones amplios, gestos simples. Al terminar, pantalla
de resultado que NO enfatiza solo la velocidad: muestra aciertos y progreso con texto + ícono.
```
**Estados**
```
Carga: lista de actividades en esqueleto.
Vacío: "No hay actividades disponibles por ahora" con ilustración amable.
Error/offline: tarjeta de error con "Reintentar"; si hay actividades cacheadas, permitir jugarlas offline.
Límite de dominio: actividad bloqueada (candado + explicación); resultado de actividad sin
intentos previos ("Este es tu primer intento, no hay con qué comparar todavía").
```

---

## 6. Paciente · Progreso
**Cubre:** RF-005, RNF-006 · **Plan:** T3.

**Prompt principal**
```
Pantalla "Progreso" del paciente: evolución en el tiempo y comparación actual vs pasado.
Un selector de rango (semana / mes). Un gráfico de línea o barras por área (síntomas,
actividades), donde cada serie se distingue por color + patrón/forma + etiqueta (no solo
color) y SIEMPRE acompaña una versión en texto/tabla accesible ("En octubre registraste X,
en noviembre Y"). Debajo, tarjetas de resumen tipo "Tu atención mejoró respecto al mes
pasado" con ícono direccional + texto (flecha arriba/abajo), nunca solo color rojo-verde.
Un elemento principal: el gráfico con su resumen textual.
```
**Estados**
```
Carga: gráfico y tarjetas en esqueleto.
Vacío: "Aún no hay suficientes datos para comparar. Necesitas al menos 2 registros."
+ botón que lleva a registrar.
Error/offline: tarjeta de error con "Reintentar"; usar caché si existe.
Límite de dominio: un solo punto de datos → mostrar el dato actual y texto "Vuelve cuando
tengas más registros para ver tu evolución".
```
**Accesibilidad extra:** todo gráfico tiene alternativa textual/tabla; nunca información solo visual.

---

## 7. Paciente · Apoyo / Información
**Cubre:** RF-009, RF-010 · **Plan:** T5.

**Prompt principal**
```
Pantalla "Apoyo" del paciente: contenidos informativos sobre la EM y red de apoyo
psicológico. Lista de tarjetas de cápsulas/artículos: ícono, título, tiempo de lectura o
duración. Una sección "Si necesitas hablar" con accesos de apoyo (líneas de ayuda, contacto).
Si una cápsula es video o audio, al abrirla DEBE mostrar subtítulos y un botón de transcripción
de texto visible. Tono humano y cálido, poco texto por tarjeta.
```
**Prompt del detalle de cápsula (sub-pantalla)**
```
Detalle de una cápsula de apoyo. Si es texto: lectura con tipografía grande y buen interlineado.
Si es video/audio: reproductor con subtítulos activados por defecto y botón "Ver transcripción"
que muestra el texto completo sincronizado; controles grandes y etiquetados.
```
**Estados**
```
Carga: tarjetas en esqueleto.
Vacío: "Pronto encontrarás aquí contenidos de apoyo."
Error/offline: tarjeta de error con "Reintentar"; permitir leer lo cacheado sin conexión.
```

---

## 8. Cuidador · Inicio
**Cubre:** hub del cuidador (enlaza RF-006, RF-008, RF-012) · **Plan:** T4.

**Prompt principal**
```
Pantalla "Inicio" del cuidador en Neurotrack EM. Encabezado "Hola, [Nombre]".
Tarjeta superior de estado del vínculo con el paciente ("Acompañando a [Nombre del paciente]"
o, si no hay vínculo, "Aún no estás vinculado a un paciente" con botón "Vincularme").
Tarjetas: "Resumen de [paciente]" (solo lo que el paciente autorizó, con ícono + texto),
"Recordatorios de hoy", y acceso rápido a "Registrar observación".
Barra de pestañas inferior: Inicio, Observaciones, Acompañar, Recordatorios, Apoyo.
Tono de apoyo; reconoce la carga del cuidador. Poco texto.
```
**Estados**
```
Carga: tarjetas en esqueleto.
Vacío (sin vínculo): una sola tarjeta central "Vincúlate con la persona que acompañas para
empezar" + botón "Vincularme".
Vacío (vinculado, sin datos autorizados): "El paciente aún no ha compartido información contigo."
Error/offline: banner "Sin conexión" con caché, o tarjeta de error con "Reintentar".
```

---

## 9. Cuidador · Vincular con paciente
**Cubre:** RF-012, RNF-012 · **Plan:** T4. (Necesaria para el acceso con autorización.)

**Prompt principal**
```
Pantalla "Vincularme con un paciente" del cuidador. Explicación corta de qué significa el
vínculo y que el paciente decide qué comparte. Campo para ingresar un código de invitación
del paciente (o escanear un QR), botón principal "Enviar solicitud". Debajo, estado de la
solicitud: "Pendiente de que el paciente acepte". Texto de privacidad claro: "Solo verás lo
que el paciente autorice". Un elemento principal: el campo de código.
```
**Estados**
```
Carga: botón "Enviando solicitud…" con spinner.
Vacío: estado inicial con el campo de código vacío.
Error: código inválido o expirado → mensaje con ícono + texto "Ese código no es válido o ya
expiró"; sin conexión → "Revisa tu conexión". Anunciado como región activa.
Pendiente/aceptado/rechazado: tarjetas de estado claras con ícono + texto (no solo color).
```

---

## 10. Paciente · Autorizar acceso del cuidador (consentimiento)
**Cubre:** RF-012, RNF-012 · **Plan:** T4. (Lado paciente del consentimiento.)

**Prompt principal**
```
Pantalla "Permisos del cuidador" del paciente. Muestra la solicitud entrante de un cuidador
("[Nombre] quiere acompañarte"). El paciente decide, con interruptores claros y etiquetados,
QUÉ comparte: síntomas, progreso, recordatorios, observaciones. Cada interruptor con ícono +
texto que explica qué verá el cuidador. Botones "Aceptar" y "Rechazar". Aviso: "Puedes cambiar
estos permisos o quitar el acceso cuando quieras." Un elemento principal: la lista de permisos.
```
**Estados**
```
Carga: lista de permisos en esqueleto.
Vacío (sin solicitudes): "No tienes solicitudes de acompañamiento."
Error/offline: tarjeta de error con "Reintentar".
Confirmación: al guardar, mensaje anunciado "Permisos actualizados".
```
**Accesibilidad extra:** cada interruptor dice en voz su estado (activado/desactivado) y qué comparte.

---

## 11. Cuidador · Observaciones
**Cubre:** RF-006 · **Plan:** T4.

**Prompt principal**
```
Pantalla "Observaciones" del cuidador: registrar y ver notas sobre lo que observa en el
paciente. Lista cronológica de observaciones (fecha + ícono de categoría + texto corto).
Botón flotante grande "Nueva observación". El formulario de nueva observación: categoría
(ánimo, movilidad, fatiga, medicación, otro), nota de texto, fecha/hora. Instrucciones cortas.
Un elemento principal: la lista.
```
**Estados**
```
Carga: lista en esqueleto.
Vacío: "Aún no has registrado observaciones. Anota lo que notes para la próxima consulta."
+ botón "Nueva observación".
Error/offline: tarjeta de error con "Reintentar"; al guardar sin conexión, aviso de que se
sincronizará luego.
Guardado: confirmación anunciada como región activa.
```

---

## 12. Cuidador · Acompañar
**Cubre:** RF-006 · **Plan:** T4.

**Prompt principal**
```
Pantalla "Acompañar" del cuidador: ver las actividades y el proceso del paciente (solo lo
autorizado) para animarlo y acompañarlo. Lista de las actividades del paciente con su progreso
(texto + ícono + barra), y una acción "Enviar ánimo" (mensaje de apoyo). Si el paciente no
autorizó esta sección, se muestra un estado de bloqueo explicativo. Tono cálido y de apoyo.
Un elemento principal: la lista de actividades del paciente.
```
**Estados**
```
Carga: lista en esqueleto.
Vacío: "El paciente aún no ha hecho actividades para acompañar."
Error/offline: tarjeta de error con "Reintentar".
Límite de dominio (sin autorización): tarjeta "El paciente no ha compartido esta sección
contigo" con ícono de candado + texto, sin exponer ningún dato.
```

---

## 13. Cuidador · Recordatorios
**Cubre:** RF-008, RNF-009 · **Plan:** T4.

**Prompt principal**
```
Pantalla "Recordatorios" del cuidador: recordatorios de medicación y eventos del paciente.
Lista de recordatorios con hora, ícono de tipo (medicación/cita/actividad) y texto. Botón
grande "Nuevo recordatorio". Cada recordatorio al activarse da aviso VISUAL destacado + vibración
háptica, nunca solo sonido (muéstralo con un ejemplo de notificación visual en pantalla).
Formulario de nuevo recordatorio: título, tipo, fecha/hora, repetición. Un elemento principal:
la lista.
```
**Estados**
```
Carga: lista en esqueleto.
Vacío: "No hay recordatorios. Crea uno para no perder una toma o una cita." + botón.
Error/offline: tarjeta de error con "Reintentar".
Recordatorio activo (estado especial): tarjeta/alerta visual grande con color + ícono + texto
("Es hora de: [título]") + indicación de vibración; botones "Hecho" y "Posponer", ambos ≥48 dp.
```
**Accesibilidad extra:** la alerta nunca depende solo del sonido ni solo del color; combina visual + háptica + texto.

---

## 14. Cuidador · Apoyo / Información
**Cubre:** RF-009, RF-010 (enfocado al rol del cuidador y su carga, §II-B) · **Plan:** T5.

**Prompt principal**
```
Pantalla "Apoyo" del cuidador: contenidos para cuidadores y familiares, reconociendo la carga
de cuidar (§II-B). Lista de tarjetas de cápsulas/artículos (autocuidado del cuidador, cómo
acompañar, cómo comunicar cambios al médico), con ícono, título y duración. Sección "Si necesitas
apoyo" con accesos de ayuda. Si una cápsula es video/audio, al abrirla muestra subtítulos
activados y botón de transcripción. Tono cálido y empático, poco texto.
```
**Estados**
```
Carga: tarjetas en esqueleto.
Vacío: "Pronto encontrarás aquí contenidos para acompañarte en tu rol."
Error/offline: tarjeta de error con "Reintentar"; lectura offline de lo cacheado.
```
**Accesibilidad extra:** todo video/audio con subtítulos + transcripción (RF-010).

---

## Resumen de cobertura
| # | Pantalla | Requisitos |
|---|---|---|
| 1 | Selección de perfil | RF-007 |
| 2 | Registro / Login | RF-011, RNF-012 |
| 3 | Paciente · Inicio | RF-001/003/005/008 (hub) |
| 4 | Paciente · Calendario de síntomas | RF-001, RF-002, RNF-006 |
| 5 | Paciente · Actividades | RF-003, RF-004, RNF-008 |
| 6 | Paciente · Progreso | RF-005, RNF-006 |
| 7 | Paciente · Apoyo/Info | RF-009, RF-010 |
| 8 | Cuidador · Inicio | RF-006/008/012 (hub) |
| 9 | Cuidador · Vincular con paciente | RF-012, RNF-012 |
| 10 | Paciente · Autorizar acceso (consentimiento) | RF-012, RNF-012 |
| 11 | Cuidador · Observaciones | RF-006 |
| 12 | Cuidador · Acompañar | RF-006 |
| 13 | Cuidador · Recordatorios | RF-008, RNF-009 |
| 14 | Cuidador · Apoyo/Info | RF-009, RF-010 |

Accesibilidad transversal (RNF-001..011) incluida en el Bloque de estilo base y aplicable a
todas. Los valores de color (RNF-003) son propuesta a validar antes de aprobar `docs/DESIGN.md`.
