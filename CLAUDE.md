@AGENTS.md

## Producto

**Neurotrack EM** — app móvil de seguimiento, rehabilitación y acompañamiento para pacientes
con esclerosis múltiple (EM) y sus cuidadores. Complementa, no reemplaza, el seguimiento
médico. Dos perfiles principales (paciente, cuidador) y uno opcional fuera de alcance
(médico). MVP: registro + calendario de síntomas, set reducido de actividades de estimulación
cognitiva/motriz, y módulo básico del cuidador. Detalle en `docs/BRIEF.md` y `docs/REQUISITOS.md`.

La **accesibilidad (WCAG 2.2 AA)** es un requisito de dominio, no un adorno: escalado de texto,
contraste validado, lector de pantalla, área táctil ≥ 48 dp, ningún estado comunicado solo por
color, modo bajo brillo. Tono de acompañamiento y baja fatiga (poco texto por pantalla).

## Stack

- Expo / React Native con **Expo Router** (SDK 58). Rutas en `src/app/`; tema en `src/theme/`.
- **Backend: Supabase** (Auth + Postgres + Row Level Security, capa gratuita) para cuentas y
  sincronización entre dispositivos. Datos de salud sensibles: sesión en almacenamiento seguro,
  acceso del cuidador restringido por RLS a lo que el paciente autorice, manejo de errores de
  red y estado offline. No es un backend clínico ni de diagnóstico.
- Verificación solo en emulador Android (sin iOS). Pruebas con jest-expo (ver `docs/DECISIONES.md`).
