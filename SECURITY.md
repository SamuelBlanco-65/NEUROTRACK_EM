# Seguridad

Neurotrack EM es un proyecto académico que maneja datos de salud de ejemplo. Aun así, si encuentras una
vulnerabilidad (por ejemplo, ver datos de otra persona, saltarse el consentimiento del vínculo
paciente-cuidador-médico o leer una clave que no debería estar en el repositorio), por favor avísanos sin
publicarla primero:

- Escribe a **neurotrackem@gmail.com** con el asunto «Seguridad», o abre un
  [aviso privado de seguridad](https://github.com/SamuelBlanco-65/NEUROTRACK_EM/security/advisories/new) en GitHub.
- Cuéntanos qué viste, cómo reproducirlo y qué datos quedaron expuestos. No uses cuentas ajenas ni descargues datos reales.

## Cómo está protegido

- **Sin secretos en el repositorio.** `.env` está en `.gitignore`; solo se versiona `.env.example`. La app usa únicamente la
  clave *publishable* de Supabase (pública por diseño); la clave `service_role` nunca está en la app.
- **Row Level Security** en todas las tablas: cada persona ve lo suyo, y el cuidador o el médico solo lo que el paciente autorizó.
  Las operaciones sensibles (reclamar un código, crear invitaciones, borrar la cuenta) son funciones del servidor con límite de intentos.
- **Sesión cifrada** en el teléfono (AES + `expo-secure-store`).
- La web de confirmar correo y cambiar contraseña (`web-auth/`) usa una política de seguridad de contenido estricta y el script de la CDN con SRI.

Límites conocidos: ver `DOCUMENTO-ENTREGA-FINAL.pdf` (sección 5).
