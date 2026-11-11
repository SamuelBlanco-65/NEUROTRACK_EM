# Neurotrack EM

> *Tu evolución, tu proceso, tu camino.*

App móvil de **seguimiento, rehabilitación y acompañamiento** para personas con esclerosis múltiple (EM) y para quienes
las acompañan. Complementa el seguimiento médico, **no lo reemplaza**: no diagnostica, no genera alertas clínicas y no
usa sensores ni wearables.

Proyecto del curso de Desarrollo Móvil, Universidad de La Sabana (Bogotá, Colombia), docente Santiago Rivadeneira Delgado.
Equipo: Samuel Blanco, Amelyn Hofmann y Mariana Tirado.

## Qué hace

| Perfil | Qué puede hacer |
|---|---|
| **Paciente** | Registrar cómo se siente (síntomas con severidad y nota) y verlos en un calendario; hacer actividades de estimulación cognitiva (memoria, atención) y motriz (movimiento) con dificultad progresiva y sin cronómetro; ver su progreso (semana, mes, 3 meses); recibir recordatorios y mensajes de ánimo; consultar un espacio de apoyo con líneas de ayuda; decidir **qué ve** su cuidador y su médico. |
| **Cuidador** | Vincularse con un código que le da el paciente; ver lo que el paciente autorizó (progreso, síntomas de la semana); anotar observaciones privadas; crear recordatorios; enviar mensajes de ánimo. |
| **Médico tratante** *(opcional)* | Ver, **solo en lectura**, un resumen de lo que el paciente autorizó: constancia de registro, síntomas del período frente al anterior, intensidad, actividades y, si el paciente lo permite, sus notas. El acceso caduca y el paciente puede retirarlo cuando quiera. |

Cuenta con correo y contraseña, recuperación de contraseña, términos y política de privacidad, y borrado de cuenta desde
«Mi cuenta».

## Stack

- **Expo SDK 58** · React Native 0.88 · React 19 · TypeScript (estricto)
- **Expo Router** (rutas basadas en archivos en `src/app/`)
- **Redux Toolkit** para el estado global y las llamadas asíncronas (`createAsyncThunk`)
- **Supabase**: Auth + Postgres + Row Level Security (capa gratuita)
- `expo-secure-store` + `aes-js` para guardar la sesión cifrada, `expo-haptics`, `expo-speech`
- **Jest** (`jest-expo`) para la lógica pura
- `web-auth/`: página estática en Vercel para confirmar el correo y restablecer la contraseña

## Requisitos previos

- **Node.js ≥ 22.13** (se probó con 24.x)
- Una cuenta de **Supabase** (gratis)
- Un celular con **Expo Go** (misma red Wi-Fi que el computador) **o** un emulador de Android. No hay build de iOS
  verificada.

## Instalación

```bash
git clone https://github.com/SamuelBlanco-65/NEUROTRACK_EM.git
cd NEUROTRACK_EM
npm install
```

### 1. Variables de entorno

Copia `.env.example` a `.env` y completa los dos valores de tu proyecto de Supabase
(**Project Settings → API**):

```
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
```

La *publishable key* es pública por diseño (equivale a la antigua `anon key`): la seguridad de los datos la dan las
reglas RLS, no esconder la clave. **Nunca** uses la `service_role` en la app. `.env` está en `.gitignore`.

### 2. Base de datos

En el **SQL Editor** de Supabase, ejecuta **en orden** cada archivo de `supabase/migrations/`:

| # | Archivo | Qué crea |
|---|---|---|
| 1 | `20261108000000_symptom_logs.sql` | Registro de síntomas |
| 2 | `20261109000000_activity_progress.sql` | Nivel por área de actividad |
| 3 | `20261110000000_activity_sessions.sql` | Historial de sesiones |
| 4 | `20261111000000_caregiver_links.sql` | Vinculación paciente–cuidador y permisos |
| 5 | `20261112000000_caregiver_observations_and_access.sql` | Observaciones, mensajes de ánimo y lectura del cuidador |
| 6 | `20261113000000_reminders.sql` | Recordatorios |
| 7 | `20261114000000_harden_links_and_account.sql` | Reclamo seguro de códigos y borrado de cuenta |
| 8 | `20261115000000_doctor_links.sql` | Perfil del médico y lectura compartida de síntomas |

Son idempotentes (puedes volver a correrlas). No hay CLI de Supabase enlazada: se ejecutan a mano.

### 3. Autenticación en Supabase

La app pide confirmar el correo al registrarse. Elige una opción:

- **Rápida, para probar:** *Authentication → Providers → Email* → desactiva **Confirm email**. Así el registro entra
  directo, sin SMTP ni Vercel.
- **Completa (correos reales):** configura SMTP propio, despliega `web-auth/` en Vercel y pega las plantillas de
  `supabase/email-templates/`. Paso a paso en [`docs/SUPABASE-CORREO.md`](docs/SUPABASE-CORREO.md). El correo integrado
  de Supabase solo entrega a miembros de tu organización.

### 4. Datos de demostración (opcional)

`supabase/seed/demo_data_completo.sql` carga ~5 meses de síntomas y actividades, un vínculo de cuidador, observaciones y
recordatorios, para ver el calendario, el progreso y el resumen sin registrar días a mano. Requiere dos cuentas ya
registradas y confirmadas (paciente y cuidador): reemplaza los placeholders `PACIENTE@EJEMPLO.COM` y
`CUIDADOR@EJEMPLO.COM` por sus correos **sin commitear ese cambio**. El vínculo con el médico no se siembra: se crea
desde la app («Mi médico»).

## Ejecutar

```bash
npx expo start --go          # Expo Go en el celular (escanea el QR, o «Enter URL manually» con exp://<IP-LAN>:8081)
npx expo start --android     # emulador Android (con adb en el PATH)
```

Para probar el flujo de tres perfiles necesitas **dos o tres cuentas** (paciente, cuidador, médico). Cada una elige su
perfil en la primera pantalla.

### Comprobaciones

```bash
npm run typecheck    # tsc --noEmit
npx expo lint        # ESLint (flat config)
npm test             # 108 pruebas de lógica
npx expo-doctor      # dependencias alineadas con el SDK
```

## Arquitectura

```
┌─────────────── App móvil (Expo / React Native) ───────────────┐
│  src/app/          Pantallas y rutas (Expo Router)            │
│     (paciente) (cuidador) (medico) (auth)  + modales          │
│  src/store/        Redux Toolkit: slices + thunks             │
│  src/features/     Lógica y acceso a datos por módulo         │
│  src/theme/        Tokens: color (claro/oscuro), tipografía   │
│  src/lib/supabase.ts   Cliente + sesión cifrada               │
└──────────────┬────────────────────────────────────────────────┘
               │ HTTPS (supabase-js)
┌──────────────▼────────────────────────────────────────────────┐
│ Supabase: Auth · Postgres con RLS · funciones RPC             │
└──────────────▲────────────────────────────────────────────────┘
               │ verifyOtp (token_hash)
┌──────────────┴────────────────┐
│ web-auth/ en Vercel (estático)│  confirmar correo / restablecer contraseña
└───────────────────────────────┘
```

**Flujo de datos:** la pantalla despacha un *thunk* → `features/<módulo>/api.ts` llama a Supabase y traduce los errores a
mensajes en español (sin conexión, servidor, validación) → el *slice* guarda el resultado y los estados de
carga/error/vacío → la pantalla solo lee del store. La lógica de dominio (generar rondas, agregar períodos, comparar
meses) vive en `logic.ts` **puro**, sin UI, y por eso tiene pruebas.

**Navegación:** el perfil se elige en la primera pantalla y decide el grupo de rutas: `(paciente)` y `(cuidador)` usan
pestañas nativas (`NativeTabs`); `(medico)` es una pila sin pestañas.

### Módulos (`src/features/`)

| Carpeta | Responsabilidad |
|---|---|
| `auth` | Registro, acceso, recuperación de contraseña, validaciones |
| `symptoms` | Registro y calendario de síntomas; lectura compartida |
| `activities` | Actividades de memoria, atención y movimiento; niveles |
| `progress` | Períodos, agregación y tendencias del paciente |
| `caregiver` | Vinculación, observaciones, mensajes de ánimo |
| `reminders` | Recordatorios con alternativa visual y háptica |
| `doctor` | Vinculación del médico, comparación de períodos, resumen |
| `support` · `about` · `legal` | Espacio de apoyo, «¿Qué es?», términos y privacidad |
| `audio` · `settings` · `profile` | Lectura en voz alta, preferencias de accesibilidad, perfiles |

### Datos y privacidad

Datos de salud sensibles (Ley 1581 de 2012, Colombia). Todo está restringido por **Row Level Security**:

- Cada paciente es el único dueño de sus registros (`auth.uid() = patient_id`).
- El cuidador y el médico **solo leen** lo que el paciente autorizó y mientras el vínculo siga aceptado. El paciente es
  el único que puede aceptar, y puede retirar el acceso en cualquier momento. El acceso del médico además caduca.
- Los síntomas de terceros solo se leen con la función `shared_symptom_logs`; las **notas** son un permiso aparte,
  apagado por defecto.
- Los códigos de invitación los genera el servidor y los intentos de reclamo están limitados.
- La sesión se guarda cifrada (AES-256, clave en `expo-secure-store`).

Decisiones con su razón en [`docs/DECISIONES.md`](docs/DECISIONES.md).

## Accesibilidad (WCAG 2.2 AA)

La accesibilidad es un requisito del dominio (EM: fatiga, temblor, visión, cognición), no un adorno:

- **Texto escalable:** respeta el tamaño de fuente del sistema, y el `lineHeight` se escala a mano para que nada se
  recorte (`src/components/themed-text.tsx`).
- **Contraste validado** en claro y oscuro (se calculó con la fórmula WCAG); modo oscuro de bajo brillo sin blanco ni
  negro puros, y opción de alto contraste.
- **Lector de pantalla (TalkBack):** roles, etiquetas, pistas y estados en todos los controles, regiones vivas al
  cambiar datos, orden de lectura lógico y `testID` estables.
- **Área táctil ≥ 48 dp**, sin gestos complejos ni tiempos límite en las actividades.
- **Ningún estado depende solo del color:** ícono + texto + forma (p. ej. severidad con tres barras y la palabra).
- **Baja carga cognitiva:** una acción principal por pantalla, instrucciones cortas, actividades por pasos.
- **Alternativas al audio y a la vista:** háptica en recordatorios y actividades, transcripción como texto en el
  contenido de apoyo, dictado con el micrófono del teclado y «Lectura en voz alta» opcional.
- **Pantalla «Accesibilidad»:** apariencia, tamaño de texto, alto contraste, reducir animaciones y lectura en voz alta.

Matriz de requisitos y evidencias en [`docs/REQUISITOS.md`](docs/REQUISITOS.md).

## Estructura del repositorio

```
src/            app, components, features, store, theme, lib
supabase/       migrations/ · seed/ · email-templates/
web-auth/       página estática de confirmación y restablecimiento (Vercel)
docs/           BRIEF, REQUISITOS, DECISIONES, DESIGN, ENTORNO, STATUS, enunciado y diseño (Stitch)
artifacts/      capturas de verificación por módulo
```

## Estado

Verificado en emulador Android y en celular con Expo Go. **No hay verificación en iOS.** El estado detallado de cada
requisito (verificado / sin probar / pendiente) está en [`docs/REQUISITOS.md`](docs/REQUISITOS.md) y el avance por tarea
en [`docs/STATUS.md`](docs/STATUS.md).

## Equipo

| Integrante | Módulos |
|---|---|
| Samuel Blanco ([@SamuelBlanco-65](https://github.com/SamuelBlanco-65)) | Síntomas, datos y autenticación |
| Amelyn Hofmann ([@Amelynhs](https://github.com/Amelynhs)) | Módulo del cuidador |
| Mariana Tirado ([@MarianaTB-03](https://github.com/MarianaTB-03)) | Actividades y progreso |

Los commits llevan a los tres como autor o coautor (`Co-Authored-By`).

## Créditos y licencias

- Tipografía **Atkinson Hyperlegible Next**, del Braille Institute (SIL Open Font License).
- Íconos **Material Icons**, de Google (Apache 2.0).
- Diseño de pantallas generado con Stitch y adaptado por el equipo.
- Plantilla base: Expo (MIT, ver `LICENSE`).

## Aviso

Neurotrack EM es un proyecto académico de apoyo y acompañamiento. **No es un dispositivo médico, no diagnostica ni
sustituye a tu equipo de salud.** Ante una urgencia llama al **123**; para apoyo en crisis emocionales, la **Línea 106**.
Los textos legales de la app no son asesoría jurídica.
