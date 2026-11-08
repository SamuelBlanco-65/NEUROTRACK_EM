# Brief — Neurotrack EM

**"Tu evolución, tu proceso, tu camino."**

## Problema
La esclerosis múltiple (EM) es muy variable y el seguimiento clínico tradicional no
permite monitoreo continuo entre consultas. Pacientes y cuidadores quedan sin
acompañamiento en ese intervalo, y los cuidadores notan cambios que no saben cómo
transmitir al médico (§II-A, §II-B).

## Objetivo
Una app móvil que **complemente** (no reemplace) el seguimiento médico: registrar
síntomas, hacer actividades de estimulación cognitiva/motriz e integrar al cuidador,
generando un historial útil para la próxima consulta (§II-C).

## Usuarios
- **Paciente** (principal): registra síntomas, hace actividades, ve su evolución, encuentra apoyo.
- **Cuidador / familiar** (principal): registra observaciones, acompaña, recibe recordatorios,
  accede a lo que el paciente autorice.
- **Médico tratante** (opcional, fuera del MVP): revisaría resúmenes. Trabajo futuro.

## Alcance (MVP, §IV-C)
Dentro: registro + calendario de síntomas, set reducido de actividades de estimulación
(no todas las áreas), módulo básico del cuidador, cuentas y sincronización entre dispositivos.
Transversal: accesibilidad WCAG 2.2 AA (prioridad semestre: escalado de texto, contraste
validado, lector de pantalla).
Fuera: biomarcadores digitales, sensores/wearables, validación clínica, perfil del médico.

## Entregables (Fase 3, §6 — 100% de la nota final)
1. **Documento Técnico Final** — Markdown en `/docs` (`ENTREGA-FINAL.md`), 5 secciones, 5–8 págs,
   refs IEEE/APA. **20%**
2. **Repositorio funcional** — app 100% E2E sin mocks, código limpio/tipado, README completo,
   historial de commits equitativo de los 3. **30%**
3. **Presentación + demo en vivo** sobre emulador. **10%**
4. **Defensa técnica individual** (preguntas aleatorias por integrante). **40%**

## Fechas
**Aún no confirmada** (Duda 3). El enunciado es estricto: un minuto tarde = no se acepta.
Confirmar con el profesor / la plataforma del curso cuanto antes.

## Restricciones
- Expo / React Native, SDK 58 (usar docs versionadas).
- Verificación solo en emulador Android (sin iOS).
- Backend propio para cuentas/datos (Supabase, capa gratuita); sin backend clínico.
- Estado global con **Redux Toolkit** (D-005).
- Uso de IA **libre** (D-008).

> Fuentes: la propuesta del equipo (Fases 1–2, `FUENTE DE VERDAD.pdf`) + el enunciado oficial
> de Fase 3. La rúbrica, los entregables y el formato ya están definidos; solo falta la fecha.
