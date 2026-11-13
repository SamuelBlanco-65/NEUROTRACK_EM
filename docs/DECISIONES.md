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
- **Actualización 2026-11-11:** el equipo decidió hacer el **perfil del médico (REC-003)** en la próxima
  sesión, como extra (el enunciado de Fase 3 no lo exige). Sensores, wearables y validación clínica siguen
  fuera. La decisión de diseño del perfil médico (vinculación, solo lectura, qué ve) está en **D-016**.

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
  `transformIgnorePatterns` y tipos de jest en `tsconfig.json`, ver el README).
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
  PDF al final. Elegido por el usuario. (2026-11-12: en el repo queda solo el PDF final, `DOCUMENTO-ENTREGA-FINAL.pdf`
  en la raíz; el Markdown fuente sigue en el historial de git, commit `dd2b099`.)
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
- **Estado:** Reemplazada en parte (2026-11-11, 3ª sesión): «Lógica» ya NO queda bloqueada; ver D-018. El punto 2
  (Memoria falla rápido) y el 3 (`expo-haptics`) siguen vigentes.
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
- **Estado:** Vigente (RF-012 implementado sin probar, ver `docs/REQUISITOS.md`)
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

## D-011 · Pantalla de Accesibilidad (T6): 4 controles reales, no un "overlay widget"

- **Fecha:** 2026-11-09
- **Estado:** Vigente (implementado sin probar en emulador)
- **Contexto:** el usuario propuso una pantalla de accesibilidad en el perfil del paciente,
  con un mock de Stitch (`artifacts/pngs-referencia/Accesibilidad-Vista.jpeg`) que mostraba
  "perfiles recomendados" por diagnóstico (Motora/Dislexia/TDAH/Daltonismo/Epilepsia...) y 15
  botones de "herramientas de lectura" (puntero grande, resaltar enlaces, estructura, etc.).
- **Decisión:** se construyó `src/app/accesibilidad.tsx` con solo 4 controles, todos con
  efecto real verificable en la app, y se descartó el resto del mock:
  1. **Apariencia** (claro/oscuro/automático) — el estado ya existía en `settings-slice` pero
     no tenía pantalla; ahora sí.
  2. **Tamaño de texto** (normal/grande/extra grande) — multiplicador aplicado en
     `ThemedText`, se suma al del sistema operativo, no lo reemplaza.
  3. **Alto contraste** — paleta nueva (`applyHighContrast` en `theme/colors.ts`) con negro/
     blanco puro deliberado (excepción al RNF-007, que aplica al tema por defecto, no a un
     modo de alto contraste que el usuario activa a propósito).
  4. **Reducir animaciones** — apaga el autoborrado a los 900ms del resaltado de acierto/error
     en Memoria (`actividad/[area].tsx`).
  - **Se descartaron los "perfiles por diagnóstico"**: autoclasificarse por etiqueta clínica
    (Dislexia/TDAH/Epilepsia...) es el patrón de "accessibility overlay widget" que la
    comunidad de accesibilidad critica activamente — es mejor exponer los controles directos.
  - **Se descartó un toggle de "tipografía para dislexia"**: la app ya usa Atkinson
    Hyperlegible Next en todo momento (elegida justo por ser legible para baja visión/dislexia);
    un botón que "activa" una fuente que ya está activa no cambiaría nada — exactamente el tipo
    de control decorativo que se quería evitar.
  - **Se descartaron los botones sin equivalente nativo** (puntero grande, resaltar enlaces,
    "leer página", estructura, guía de uso): no tienen una implementación real en React Native,
    y un toggle que no hace nada es peor que no tenerlo.
- **Persistencia nueva:** antes ninguna preferencia de `settings` sobrevivía a cerrar la app.
  Se agregó `src/features/settings/persistence.ts` (`AsyncStorage`, sin cifrar — son
  preferencias de apariencia, no datos de salud) + hidratación en `_layout.tsx` + guardado
  automático vía `store.subscribe` en `store.ts`.
- **Consecuencias:** el texto "tus preferencias son privadas, se guardan en este dispositivo"
  de la pantalla es literalmente cierto, no decorativo.
- **Requisitos relacionados:** RNF-001, RNF-002, RNF-003, RNF-007.

---

## D-012 · Paleta de modo oscuro reemplazada por la real de Stitch (T6)

- **Fecha:** 2026-11-09
- **Estado:** Vigente (implementado sin probar en emulador — ver "Errores conocidos")
- **Contexto:** en la sesión anterior el usuario probó la primera `DarkColors` (derivada a
  mano de los roles `inverse-*`) en el emulador y la rechazó: las superficies no se aclaraban
  con la elevación y las tarjetas grandes con rol `tertiaryFixed` (p. ej. "¿Necesitas hablar
  con alguien?" en Apoyo) se veían como un recorte claro flotando sobre un fondo casi negro.
  El usuario generó variantes oscuras reales en Stitch para ~35 pantallas
  (`artifacts/modo-oscuro-stitch/`, carpeta quitada del repo el 2026-11-12; sigue en el historial de git) y pidió aplicarlas.
- **Decisión:**
  1. Las 35 exportaciones son inconsistentes entre sí (distintas sesiones de generación): unas
     traen la config Tailwind completa redefinida, otras un `<style id="dark-theme-overrides">`
     con overrides puntuales, y varias quedaron con la config clara sin tocar. Se usó
     `cuidador_inicio_modo_oscuro/code.html` como fuente única de la paleta porque fue la
     única con los 41 roles M3 completos y coherentes entre sí.
  2. **Excepción deliberada a la convención M3** de que los roles "Fixed" son constantes entre
     esquemas: `tertiaryFixed`/`onTertiaryFixed`/`tertiaryFixedDim`/`onTertiaryFixedVariant` SÍ
     cambian en `DarkColors`. Es justo el bug de arriba — esta app usa esos roles para tarjetas
     grandes (tip de "Un paso a la vez", crisis de Apoyo, banner del wizard), no solo acentos
     pequeños. El propio override de Stitch para esas pantallas específicas
     (`paciente_inicio_modo_oscuro`, `paciente_registrar_c_mo_me_siento_paso_2_modo_oscuro`)
     confirma el arreglo: en vez del durazno claro constante, esas tarjetas pasan a un marrón
     oscuro cálido con texto crema — se adoptaron esos valores tal cual.
  3. **La escala de elevación del export (`surfaceContainer`/`Low`/`Lowest`) se corrigió a
     mano**: en los valores originales del export, esos tres roles estaban a 1-2 puntos de
     luminosidad del fondo, así que tarjetas como "Tu plan de hoy" en `(paciente)/inicio.tsx`
     quedaban prácticamente invisibles (reportado por el usuario tras esta misma sesión). Se
     separó la escala conservando el tono frío de base, y se añadió un borde de 1px
     (`outlineVariant`) a esas tarjetas, igual que en el mock de Stitch.
- **Verificación:** todos los pares texto/fondo nuevos se recalcularon con la fórmula de
  contraste WCAG (script Python ad-hoc, no quedó en el repo) — el más bajo da 5.22:1, la
  mayoría por encima de 7:1. Sigue pendiente la verificación visual real en emulador.
- **Requisitos relacionados:** RNF-003, RNF-007.

---

## D-013 · Voz (REC-001/REC-002): dictado con el teclado del sistema y texto a voz con `expo-speech`

- **Fecha:** 2026-11-10
- **Estado:** Vigente (implementado sin probar en emulador)
- **Contexto:** las extensiones de voz del artículo base (§V-D5/D6) quedaban como opcionales.
  Expo SDK 58 no trae reconocimiento de voz y las librerías de terceros para eso exigen una
  build de desarrollo que Expo Go no admite; en cambio `expo-speech` (texto a voz) sí está en
  Expo Go y funciona sin conexión.
- **Decisión:**
  1. **REC-001 (dictado):** no se construye un reconocedor propio. El botón «Dictar con voz» de
     la nota del síntoma enfoca el campo y explica que se toque el micrófono del teclado del
     sistema (Gboard u otro). El audio lo procesa el teclado del teléfono, no esta app, lo que
     además evita enviar voz de salud a un servicio propio (RNF-012). El texto dictado se puede
     corregir antes de guardar.
  2. **REC-002 (versión auditiva):** `expo-speech` con la voz del sistema. Elige la mejor voz
     en español instalada (es-CO, luego es-419, es-US, es-MX, cualquier español) a velocidad
     0.9 para bajar la fatiga cognitiva. Si no hay voz, calla sin bloquear la actividad.
  3. **El interruptor «Lectura en voz alta» manda sobre todo** (corregido el mismo día tras
     probarlo: al principio el botón «Escuchar» funcionaba aunque estuviera apagado y era
     confuso). Apagado (valor por defecto: quien ya usa TalkBack no la necesita y se pisarían)
     no se pinta ningún botón «Escuchar» ni se lee nada. Encendido: botón «Escuchar» en las
     pantallas principales (actividades, los 3 pasos de registrar síntoma, inicio del paciente,
     detalle del día del calendario, resumen de Progreso y guías de Apoyo) y, solo en las
     actividades, lectura automática al cambiar de momento. Las demás preferencias de
     Accesibilidad (texto, contraste, apariencia) ya eran globales. TalkBack sigue cubriendo
     toda la interfaz (V-D5). Nunca es el único canal: todo sigue en texto, ícono y háptica
     (RNF-006/009). Los textos largos se parten por frases (límite del motor de voz).
  4. Los guiones (`features/audio/scripts.ts`) y qué se narra en cada momento
     (`narrationFor`) son funciones puras, para poder probarlos con jest sin voz ni UI.
- **Consecuencia sobre D-011:** la pantalla de Accesibilidad pasa de 4 a 5 controles; el nuevo
  también tiene efecto real y se restablece con «Restablecer configuración».
- **Requisitos relacionados:** REC-001, REC-002, RNF-005, RNF-006, RNF-009, RNF-012.

---

## D-014 · Correos de confirmar cuenta y recuperar contraseña: página web en Vercel con `token_hash`

- **Fecha:** 2026-11-11
- **Estado:** Vigente (probado de punta a punta por el usuario con una cuenta real; sin captura)
- **Contexto:** el primer diseño enviaba `{{ .ConfirmationURL }}` con `redirectTo` a la app (`neurotrackem://…`
  o `exp://<IP>:8081/…`). Fallaba: PKCE ata el enlace al dispositivo que pidió el correo, Expo Go no registra el
  esquema `neurotrackem://` y el visor de Gmail no abre esquemas propios (ventana negra). El usuario pidió que el
  enlace funcione desde cualquier dispositivo.
- **Decisión:** las plantillas de Supabase enlazan a una **página estática** (`web-auth/`, desplegada en
  Vercel Hobby, gratis) con `{{ .SiteURL }}/confirmar|restablecer?token_hash={{ .TokenHash }}&type=…`. La página
  llama a `verifyOtp` **al tocar el botón / enviar el formulario** (no al abrir, para que los revisores
  automáticos de correo no gasten el enlace), cambia la contraseña con `updateUser` y cierra todas las
  sesiones (`signOut({ scope: 'global' })`). No guarda sesión. La URL y la clave de Supabase entran por variables
  de entorno de Vercel (`build.js` genera `config.js`, ignorado por git). La web va **siempre en modo claro**
  con la paleta de la app (el usuario rechazó el modo oscuro automático).
- **Alternativas consideradas:** (a) código de 6 dígitos con `verifyOtp` dentro de la app: no depende de hosting
  ni de URLs, pero la persona tiene que copiar y escribir el código — se dejó como plan B; (b) APK con esquema
  propio: solo sirve para quien lo tenga instalado; (c) mantener el enlace a la app: descartado por lo de arriba.
- **Consecuencias:** hay un componente fuera de la app que desplegar y mantener; el Site URL de Supabase debe ser
  la URL de Vercel; las plantillas hay que pegarlas a mano en el panel (viven en `supabase/email-templates/`).
  La web sale en la política de privacidad como tercero. `src/app/correo/*` queda sin uso (respaldo).
- **Requisitos relacionados:** RF-011, RNF-006, RNF-007, RNF-012.

---

## D-015 · Texto legal y constancia de consentimiento

- **Fecha:** 2026-11-11
- **Estado:** Vigente (implementado, `tsc`/`eslint`/jest en verde; no es asesoría legal)
- **Contexto:** la app trata datos de salud (sensibles, Ley 1581 de 2012). La política decía «escríbenos desde
  GitHub», no identificaba al responsable ni a los terceros, y el consentimiento no dejaba constancia.
- **Decisión:** (1) contacto `neurotrackem@gmail.com` y responsable = «el equipo de Neurotrack EM»;
  (2) sección de terceros (Supabase, Gmail, Vercel) y aviso de transferencia a otro país, aceptado al registrarse
  (la casilla lo menciona); (3) derechos con plazos de 10 días hábiles (consultas) y 15 (reclamos); (4) retención:
  mientras exista la cuenta; (5) mayoría de edad **sin excepciones**; (6) créditos de licencias (Atkinson
  Hyperlegible, Material Icons); (7) al registrarse se guardan `accepted_terms_at` y `accepted_terms_version`
  (`LEGAL_VERSION` en `features/legal/documents.ts`) en los metadatos del usuario, además de `created_at` del
  servidor. Los metadatos los envía el cliente, así que son constancia razonable, no prueba infalible.
- **Alternativas consideradas:** tabla de consentimientos con trigger en el servidor (más sólida; implicaba otra
  migración a mano antes de la entrega) — pendiente si se publica de verdad.
- **Consecuencias:** al cambiar el texto legal hay que **subir `LEGAL_VERSION`**. Si se hace el perfil médico (un
  destinatario nuevo de datos de salud) hay que actualizar los documentos y la casilla. El registro ante la SIC no
  aplica a este proyecto académico (verificar si se publica).
- **Requisitos relacionados:** RF-011, RT-004, RNF-012.

---

## D-016 · Perfil del médico tratante (REC-003): solo lectura, autorizado por el paciente, con caducidad

- **Fecha:** 2026-11-11
- **Estado:** Vigente (implementado sin probar en celular; migración `20261115000000_doctor_links.sql` sin ejecutar)
- **Contexto:** la fuente de verdad lo define como perfil opcional «para que el neurólogo pueda ver los resultados del
  paciente y comparar el resultado de los meses anteriores con el actual», y a la app como complemento que «no busca
  reemplazar la atención médica». Es un extra: el enunciado de Fase 3 no lo exige.
- **Decisión:**
  1. **El médico solo lee un resumen.** Sin chat, sin mensajes, sin indicaciones y sin escribir nada del paciente:
     evita que la app se vuelva un canal clínico (telesalud) y la responsabilidad por mensajes no leídos.
  2. **Tendencias, nunca alertas.** Compara el período actual con el anterior con diferencias neutras («3 días más
     que el mes anterior»), sin «mejor/peor», semáforos, riesgos ni diagnósticos (RT-004). Siempre un aviso fijo de
     que no es una evaluación clínica, y la constancia de registro («18 de 30 días») para no confundir un día sin
     registro con un día sin síntomas.
  3. **Tabla propia `doctor_links`**, no un `role` en `caregiver_links`: las políticas del cuidador (recordatorios,
     mensajes, observaciones) solo exigen `status='aceptado'` y le darían al médico poderes de escritura.
  4. **Permisos por categoría** (síntomas, actividades) y **notas como permiso aparte, apagado por defecto**: son el
     dato más íntimo. RLS filtra filas, no columnas, así que la nota se oculta con una función
     (`shared_symptom_logs`, security definer) que es la única vía de lectura de síntomas para terceros.
  5. **Caducidad y último acceso:** el paciente elige 3 meses, 6 meses, 1 año o sin fecha; pasada la fecha el médico
     deja de ver datos aunque el vínculo siga «aceptado» (lo comprueba la base de datos, no la app). El paciente ve
     cuándo lo revisó su médico (`mark_doctor_viewed`).
  6. **Sin verificación profesional:** el registro profesional (RETHUS) es autodeclarado y opcional, y el paciente lo ve
     marcado como «no verificado». Verificarlo exigiría integrarse con un registro oficial; fuera de alcance.
  7. **Vinculación** parecida a la del cuidador, pero endurecida tras la auditoría de seguridad del 2026-11-11:
     el código (8 caracteres, vale 7 días) lo **genera el servidor** (`create_doctor_invite`; sin política de insert,
     para que nadie pueda probar códigos ajenos fuera del límite de intentos), se reclama con `claim_doctor_invite`
     (límite de 10 fallos por 15 min, atómico con un candado por usuario) y un trigger impide que el paciente
     reescriba la identidad del médico o invente estados. El nombre del paciente solo se copia al aceptar.
     **El mismo oráculo de códigos y la misma carrera del límite existían en `caregiver_links`/`claim_invite`
     (migraciones anteriores): se cerraron después, ver D-026.**
- **Arreglo de un bug del cuidador en la misma migración:** `share_sintomas` no se aplicaba en ninguna política
  (el cuidador nunca podía leer `symptom_logs`). Ahora lo cubre `shared_symptom_logs`, sin notas, y la pantalla
  Acompañar muestra «Síntomas esta semana».
- **Legal:** términos y privacidad suman la sección «Médico tratante» (deber de reserva, no es historia clínica ni
  telesalud, no verificamos al profesional); la casilla de consentimiento menciona al profesional de salud; se subió
  `LEGAL_VERSION` a `2026-11.2`. No es asesoría legal: conviene que la revise alguien con formación jurídica antes de
  un uso real.
- **Alternativas consideradas:** (a) chat o notas del médico — descartado por (1); (b) alertas de cambio — descartado
  por RT-004 y por riesgo de falsos negativos; (c) verificar RETHUS — fuera de alcance.
- **Consecuencias:** el perfil `medico` no está ligado a la cuenta (igual que los otros: se elige al abrir la app).
  `ProfileKind` ahora tiene tres valores y `features/profile/constants.ts` centraliza el inicio y la etiqueta de cada uno.
  La retención y el borrado de cuenta ya lo cubren: `doctor_links` referencia `auth.users` con `on delete cascade`.
- **Diseño (2026-11-11):** se comparó con los exports de Stitch (`artifacts/stitch-medico/`, carpeta quitada del repo el 2026-11-12; sigue en el historial de git). Base: la implementación
  propia. Adoptado de Stitch: chip de diferencia por síntoma, «% del período» en la constancia, barras verticales con
  «Ver como tabla» y frase de resumen, fecha en chip en las notas, avatares con iniciales, contadores («1 pendiente»),
  Aceptar/Rechazar lado a lado, «Quitar acceso» como botón con ícono, pasos «¿Cómo funciona?» en el vacío, ayuda
  «¿Dónde está el código?» y «Limpiar código», síntomas del cuidador agrupados en una tarjeta. Descartado: datos que la
  app no recoge (edad, diagnóstico, energía, expediente, especialidad, minutos de sesión), tono clínico («Panel clínico»,
  «Expediente», PDF para historia clínica, «Finalizar revisión»), notas del cuidador visibles al médico (contradice
  D-010), «cifrado de extremo a extremo» (es TLS), casillas separadas para el código y textos truncados.
- **Requisitos relacionados:** REC-003, RT-004, RNF-012, RF-006.

---

## D-017 · Contraste del botón principal en oscuro: usar `primary`, no cambiar la paleta

- **Fecha:** 2026-11-11 (3ª sesión) · **Estado:** Vigente (implementado; visto en emulador oscuro el 2026-11-11, 4ª: `artifacts/t11/01`, `02`, `07`)
- **Contexto:** `onPrimary` sobre `primaryContainer` daba ~1,1:1 en el esquema oscuro (`#00363f` sobre `#223a40`) en 25
  archivos de pantallas; los íconos y barras de nivel pintados con `primaryContainer` sobre `surface` eran casi invisibles.
  Incumplía WCAG AA y lo prometido en la propuesta (§V-D3, §V-D4). La limitación estaba declarada en el documento final.
- **Decisión:** sustituir `colors.primaryContainer` por `colors.primary` en `src/app/` y `src/features/` (no en
  `src/theme/`). La paleta de D-012 no se modifica. Resultado medido con `scripts/validar-paleta.mjs`: texto sobre botón
  principal 6,7:1 en oscuro y 11,1:1 en claro. También `placeholderTextColor` → `onSurfaceVariant`.
- **Alternativas:** (a) cambiar `primaryContainer` en `DarkColors` — descartado: lo usa `onPrimaryContainer` (que no
  se usa en `src/`, pero está en la paleta de Stitch) y obliga a revalidar D-012; (b) subir solo el texto del botón —
  descartado: el problema también afecta íconos y barras.
- **Consecuencias:** en claro el verde-azulado de botones e íconos queda un poco más oscuro (`#00424d` frente a `#1e5a66`).
  `primaryContainer` ya no se usa en pantallas; si se vuelve a usar, validar el par en ambos esquemas.
- **Requisitos relacionados:** RNF-003, RNF-007, RNF-001.

---

## D-018 · Actividad «Lógica»: series numéricas, sin cronómetro, con migración propia

- **Fecha:** 2026-11-11 (3ª sesión) · **Estado:** Vigente (implementado y jugado de punta a punta en emulador el 2026-11-11, 4ª: `artifacts/t11/04`–`06`, migración ejecutada y nivel guardado; reemplaza el punto 1 de D-009)
- **Contexto:** la propuesta (§V-B) promete memoria, atención y lógica; la tarjeta «Lógica» seguía bloqueada con
  «Próximamente», lo que prometía algo que nunca ocurría. El usuario pidió terminarla.
- **Decisión:** juego de **series numéricas**: se muestra la serie y un «?» y se elige entre 4 opciones el número que
  sigue. 5 niveles (suma de 1/2/5/10 · suma de 2 a 9 · resta · ×2 o ×3 · dos pasos alternados), 2 de 3 rondas correctas para
  subir (mismo criterio que Memoria y Atención, RF-003), sin cronómetro. Tras responder se muestra la regla. Opciones sin
  negativos y todas distintas. Misma estructura que Atención en el store (`logicaRound`, `logicaOptionTapped`).
  Se añadió la lista `ACTIVITY_AREAS` para no repetir las áreas en cada pantalla.
- **Migración:** `20261116000000_activity_area_logica.sql` amplía los `check (area in (...))` de `activity_progress` y
  `activity_sessions`. Sin ella el juego se puede jugar pero no se guarda el nivel ni el historial (el error se tolera,
  RNF-012).
- **Alternativas:** (a) dejarla bloqueada y declararla fuera de alcance — descartado por el usuario; (b) juego de patrones de
  figuras — descartado: se parecería a Atención y a Memoria; la propuesta habla de «lógico matemática» (§I-B).
- **Consecuencias:** 4 áreas en Actividades, Acompañar y el resumen del médico; 13 pruebas nuevas (124 en total).
- **Requisitos relacionados:** RF-003, RNF-008, RNF-010.

---

## D-019 · El cuidador ve el nombre del paciente: columna `patient_name` llenada por un trigger, solo con vínculo aceptado

- **Fecha:** 2026-11-11 (4ª sesión) · **Estado:** Vigente (implementado, migración ejecutada y verificado en emulador)
- **Contexto:** el inicio del cuidador decía «Acompañas a la persona que acompañas» porque el cuidador no puede leer
  `auth.users` (RLS) y la fila de `caregiver_links` no traía el nombre del paciente.
- **Decisión:** columna `patient_name` en `caregiver_links`, calculada por el trigger `caregiver_links_set_patient_name`
  (`security definer`) desde `raw_user_meta_data ->> 'full_name'` del paciente, **solo cuando `status = 'aceptado'`**; en
  otro estado queda en `null`. Mismo patrón que `doctor_links.patient_name` (D-016). Sin nombre, la app dice «Acompañas a tu
  persona vinculada».
- **Por qué solo aceptado:** la política `caregiver_links_select_unclaimed_by_code` deja leer la fila con el código; así quien
  adivine un código no obtiene el nombre, y el paciente ya consintió cuando acepta. El trigger sobrescribe cualquier valor
  del cliente, así nadie puede poner un nombre falso.
- **Alternativas:** (a) join contra `auth.users` desde el cliente — imposible por RLS; (b) una función RPC — más código para
  un dato que ya cabe en la fila; (c) guardar el nombre en `profiles` — no existe esa tabla en el MVP.
- **Consecuencias:** 10 migraciones (README y figura 2 del documento final). Quien instale desde cero debe correrla; sin
  ella las pantallas del cuidador fallan al pedir la columna. El nombre se congela cuando el vínculo pasa a aceptado: si
  el paciente cambia su nombre después, no se actualiza hasta un nuevo vínculo.
- **Requisitos relacionados:** RF-006, RF-012.

## D-020 · Video de la app: grabación real del emulador + montaje con Hyperframes, sin voz en off

- **Fecha:** 2026-11-11 (4ª sesión) · **Estado:** Vigente (hecho; visto por muestreo de fotogramas, no completo)
- **Decisión:** estilo «video de ficha de tienda»: las tomas del emulador real (`adb screenrecord`, 3 perfiles, 17 clips,
  1,35×) dentro de un teléfono, con rótulo por cada vista, tarjetas de perfil, intro y cierre; salida 1920×1080 a 30 fps,
  música ambiental **sintetizada por el propio script** (sin derechos de terceros) y sin voz en off.
- **Por qué:** los datos y pantallas son reales (RT/ENT-001 exigen app funcional, no mocks); el montaje es reproducible
  (`artifacts/video/promo/build.mjs`) y editable en HTML.
- **Alternativas:** solo ffmpeg con rótulos (plan base, descartado: el usuario pidió animación y sonido); locución — pendiente
  si el usuario la quiere.
- **Consecuencias:** `artifacts/video/` pesa ~158 MB y no está en Git; se recortaron las partes con el correo personal;
  las cuentas de demo son reales: cambiar sus contraseñas o borrarlas cuando termine la entrega, sobre todo si el video se publica.

---

## D-021 · Brillo propio de la app y rotación de pantalla libre

- **Fecha:** 2026-11-11 (6ª sesión) · **Estado:** Vigente (probado por el usuario en celular; sin captura)
- **Contexto:** la propuesta (§V-D4) prometía un control de brillo «disociado del brillo general del celular» y WCAG 1.3.4
  prohíbe bloquear la orientación; la app estaba en `portrait` y sin control de brillo.
- **Decisión:** opción «Brillo de la app» (Del teléfono / Bajo 50 % / Muy bajo 25 %) con `expo-brightness`
  (`features/settings/brightness.ts`): en Android afecta solo a la actividad mientras la app está abierta, no cambia el ajuste
  del sistema y no pide permisos. Tres botones y no un deslizador (más fácil con temblor y con TalkBack). `app.json`:
  `orientation: default`.
- **Alternativas:** deslizador continuo (descartado por accesibilidad); `setSystemBrightnessAsync` (pide `WRITE_SETTINGS` y cambia
  el brillo global).
- **Requisitos relacionados:** RNF-007, RNF-001 (1.3.4).

---

## D-022 · «Actividades solo con audio» (versión auditiva de Memoria y Lógica)

- **Fecha:** 2026-11-11 (6ª sesión) · **Estado:** Vigente (probado por el usuario; sin captura)
- **Contexto:** §V-D5 prometía una versión auditiva de las actividades (memoria con sonidos) para quien no ve la pantalla;
  solo existía la lectura en voz alta de instrucciones.
- **Decisión:** interruptor en Accesibilidad. Con él, Memoria y Lógica **no muestran** la secuencia ni la serie: se dicen en voz
  alta (con las opciones, en Lógica) y se repiten con «Escuchar»; en Memoria cada acierto intermedio se confirma en voz.
  Requiere «Lectura en voz alta» (activarlo la enciende; apagarla lo apaga). Con TalkBack activo `speakForAudioMode` usa
  `announceForAccessibility` para que el lector lea el texto en vez de silenciar la voz (no se «arregla» el pisado de
  TalkBack: aquí la voz ES el contenido). Atención no se adapta (es visual por naturaleza); Movimiento ya funciona con audio.
- **Requisitos relacionados:** REC-002, RNF-009.

---

## D-023 · Campos libres: síntoma «Otro», mensaje de ánimo y recordatorios

- **Fecha:** 2026-11-11 (6ª sesión) · **Estado:** Vigente (migración `20261118000000`)
- **Contexto:** el paciente quedaba limitado a 6 tipos de síntoma, el cuidador a 3 mensajes de ánimo fijos, y los
  recordatorios a 3 categorías y 4 horarios predeterminados.
- **Decisión:** (1) «Otro» admite un nombre propio (`custom_label`, ≤ 60) que solo ve el paciente; (2) el cuidador escribe su
  mensaje (≤ 280, el límite que ya tenía la base) y se envía con un avión de papel animado, omitido con «Reducir animaciones»;
  (3) recordatorios con selector nativo de fecha y hora (`@react-native-community/datetimepicker`, incluido en Expo Go), sin
  fechas pasadas, y categoría «Otro» con nombre (`category_label`, ≤ 40). El trigger `reminders_guard_caregiver_update`
  cubre la columna nueva.
- **Alternativas:** guardar el nombre propio dentro de la nota (frágil); selector de fecha casero con botones +/− (más código y
  peor accesibilidad que el nativo).
- **Consecuencias:** la migración es obligatoria; el cuidador y el médico ven «Otro» (no se amplió `shared_symptom_logs`).
- **Requisitos relacionados:** RF-001, RF-006, RF-008.

---

## D-024 · Apoyo: guías reescritas y botón «Escuchar» siempre en las guías de audio

- **Fecha:** 2026-11-11 (6ª sesión) · **Estado:** Vigente (contenido sin revisión profesional)
- **Contexto:** las guías eran muy breves, las «Escuchar» no tenían audio con la lectura en voz alta apagada y los textos
  hablaban de un audio y un video que no existen.
- **Decisión:** 8 guías con pasos concretos y avisos de seguridad (todo sentado en Movimiento, 106 y 123 donde corresponde,
  sin nombres de asociaciones no verificadas); los tipos «Escuchar» y «Paso a paso» (antes «Ver») muestran siempre «Escuchar
  la guía» (`always` en `SpeakButton`); los textos dicen que se lee con la voz del teléfono.
- **Requisitos relacionados:** RF-009, RF-010, RNF-009.

---

## D-025 · El perfil es una vista, no un permiso: la selección avisa con qué cuenta se entra

- **Fecha:** 2026-11-11 (6ª sesión) · **Estado:** Vigente (probado por el usuario)
- **Contexto:** con una sesión abierta se podía volver a la selección y entrar a otro perfil con la misma cuenta sin que se
  notara.
- **Decisión:** se mantiene que el perfil no va ligado a la cuenta (una persona puede ser paciente y cuidador de otra; los
  permisos están en RLS y en los vínculos, y una cuenta no puede vincularse consigo misma). Se añade la tarjeta «Sesión
  iniciada como…» con «Usar otra cuenta» y una confirmación al elegir un perfil con sesión abierta.
- **Alternativas:** rol guardado en la cuenta (más estricto, pero rompe el caso paciente-que-cuida y exige rehacer las cuentas
  de demo); pedir la contraseña otra vez (seguridad aparente, la cuenta es la misma).
- **Requisitos relacionados:** RF-007, RF-012.

## D-026 · Revisión de seguridad del repositorio: el cuidador pasa al mismo modelo que el médico

- **Fecha:** 2026-11-11 (7ª sesión) · **Estado:** Implementada en el repo; la migración 12 **no se ha ejecutado** en Supabase ni se
  ha probado contra una base real (solo `tsc`, ESLint y Jest).
- **Contexto:** una revisión de todo el repositorio encontró, además de higiene, tres huecos de servidor en `caregiver_links` y
  `caregiver_cheers` (la deuda que D-016 dejó declarada) y dos defensas que faltaban en la web de contraseñas.
- **Decisión:** (1) el código de invitación del cuidador lo genera el servidor (`create_caregiver_invite`, 8 caracteres) y se
  quita la política de insert del cliente; (2) `claim_invite` usa el mismo candado por usuario que el del médico y limpia intentos
  viejos; (3) un trigger impide que el paciente reescriba `caregiver_id`, correo, nombre o código del vínculo y limita sus
  cambios de estado a transiciones válidas; en los mensajes de ánimo solo puede cambiar `read_at`; (4) límites de longitud y
  de rango (`not valid`) y `search_path` terminado en `pg_temp` en las funciones `security definer`; (5) `web-auth/` carga
  `supabase-js` con SRI, sin scripts en línea y con una Content-Security-Policy; (6) los errores inesperados ya no imprimen el
  objeto completo (`lib/log.ts`).
- **Limpieza:** se quitaron el flujo de enlaces profundos que ya no usaba nadie (`app/correo/*`, `deep-link.ts`, `consumeAuthLink`,
  `setNewPassword`, `emailRedirectTo`), siete dependencias sin uso, tres seeds duplicados y se añadieron CI, `SECURITY.md` y la
  licencia del equipo. `v_limpiar` del seed de demo se deja en `true` (es lo que permite repetirlo), con una advertencia.
- **Alternativas:** dejarlo como «limitación conocida» (ya estaba declarado, pero era un hueco real); caducidad de 7 días también
  para el cuidador (no se hizo: cambia el flujo y no era parte del hallazgo).
- **Requisitos relacionados:** RT-007, RNF-012, RF-012.

---

## Cosas que el material pedía y quedan fuera (con su razón)
- **Perfil del médico** — marcado como opcional/futuro en §I-C y §IV-C (REC-003). **Actualización 2026-11-11: el
  equipo lo hizo como extra, ver D-016.**
- **Biomarcadores / sensores / wearables** — requieren validación clínica y años de estudio
  fuera del alcance del semestre (§IV-C). (RT-003)
- **Versión auditiva completa de las actividades y voz/dictado** — el propio artículo los deja
  como extensión (§V-D6). **Ya implementadas en versión acotada, ver D-013.** (REC-001, REC-002)
