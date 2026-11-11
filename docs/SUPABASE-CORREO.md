# Correos reales de Neurotrack EM (Supabase + página en Vercel)

Los correos de **confirmar cuenta** y **recuperar contraseña** llevan un enlace a una **página web**
(`web-auth/`, desplegada en Vercel). Así el enlace funciona en cualquier dispositivo, aunque no sea el
teléfono donde está la app. La app solo pide el correo; el usuario confirma o cambia la contraseña en la
web y después inicia sesión en la app.

## 1. SMTP propio (imprescindible)
El correo integrado de Supabase **solo entrega a miembros de tu organización** y con un límite muy bajo.

**Project Settings → Authentication → SMTP Settings → Enable custom SMTP.**

| Proveedor | Datos | Nota |
|---|---|---|
| **Gmail** (cuenta propia del proyecto) | Host `smtp.gmail.com`, puerto `465`, usuario = el correo completo, clave = *contraseña de aplicación* (exige verificación en 2 pasos) | Unos 500/día; puede caer en spam |
| **Brevo** | Host `smtp-relay.brevo.com`, puerto `587`, usuario = *Login* de SMTP & API, clave = *SMTP key* | 300/día; basta verificar el correo remitente |

*Sender email* debe ser una dirección real que controles. *Sender name* = `Neurotrack EM`.

## 2. Desplegar la página en Vercel
1. En vercel.com → **Add New → Project** → importa el repo `NEUROTRACK_EM` de GitHub.
2. **Root Directory:** `web-auth`. Framework: *Other*. El `vercel.json` ya fija el comando de build.
3. **Environment Variables** (las del `.env` de la app):
   - `SUPABASE_URL` = el valor de `EXPO_PUBLIC_SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY` = el valor de `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. **Deploy.** Anota la URL final, p. ej. `https://neurotrack-em.vercel.app`.

El build genera `web-auth/config.js` con esas variables; ese archivo está en `.gitignore`, así que ni la URL
ni la clave quedan en el repositorio. Para cambiar una variable hay que **redesplegar**.

## 3. URLs en Supabase (imprescindible)
**Authentication → URL Configuration:**
- **Site URL:** la URL de Vercel (sin barra final). Las plantillas usan `{{ .SiteURL }}`.
- **Redirect URLs:** agrega la misma URL de Vercel (`https://tu-proyecto.vercel.app/**`).

## 4. Plantillas en español
**Authentication → Emails →** pega el contenido de:
- *Confirm signup* → `supabase/email-templates/confirmar-correo.html`
- *Reset password* → `supabase/email-templates/restablecer-contrasena.html`

Los asuntos sugeridos están al inicio de cada archivo. Las plantillas **ya no usan** `{{ .ConfirmationURL }}`:
enlazan a `{{ .SiteURL }}/confirmar?token_hash={{ .TokenHash }}&type=signup` y
`{{ .SiteURL }}/restablecer?token_hash={{ .TokenHash }}&type=recovery`.

## 5. Recomendado
- **Authentication → Providers → Email → Confirm email:** activado.
- Longitud mínima de contraseña `8`.

## Cómo funciona por dentro
1. La app pide el correo (`signUp` / `resetPasswordForEmail`).
2. El correo trae un enlace a la página con un `token_hash` de un solo uso.
3. La página **no gasta el enlace al abrirse** (así los revisores automáticos de correo no lo consumen):
   - `confirmar`: al tocar «Confirmar mi correo» llama a `verifyOtp({ token_hash, type: 'signup' })`.
   - `restablecer`: al enviar el formulario llama a `verifyOtp({ token_hash, type: 'recovery' })`, luego
     `updateUser({ password })` y `signOut({ scope: 'global' })` (cierra las sesiones abiertas de la cuenta).
4. La página no guarda sesión (`persistSession: false`). El usuario vuelve a la app e inicia sesión.

Las pantallas `src/app/correo/*` de la app quedan como respaldo del flujo anterior (enlace directo a la app);
con estas plantillas ya no se usan.

## Lista de prueba (con una cuenta real)
- [ ] Crear cuenta con un correo propio → llega el correo en español.
- [ ] Abrir el enlace **desde el computador** → «Confirmar mi correo» → «¡Correo confirmado!».
- [ ] Iniciar sesión en la app con esa cuenta.
- [ ] «¿Olvidaste tu contraseña?» → llega el correo → enlace desde cualquier dispositivo → contraseña nueva.
- [ ] Iniciar sesión con la contraseña nueva; con la vieja debe fallar.
- [ ] Abrir el mismo enlace otra vez → «El enlace venció o ya se usó».
- [ ] «Reenviar correo de confirmación» en una cuenta sin confirmar.
