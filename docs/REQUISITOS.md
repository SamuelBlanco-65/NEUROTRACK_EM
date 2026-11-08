# Requisitos y trazabilidad — Neurotrack EM

Fuente: `docs/enunciado/NEUROTRACK_EM - FUENTE DE VERDAD.pdf`. Las secciones se citan como §N.

> **Dos fuentes del profesor** (actualizado 2026-11-07):
> 1. **Propuesta/artículo del equipo** (Samuel Blanco, Amelin Hofmann, Mariana Tirado) —
>    `NEUROTRACK_EM - FUENTE DE VERDAD.pdf`. Resume las Fases 1 y 2 (visión del producto,
>    análisis competitivo, estado del arte y propuesta de accesibilidad). Define el producto
>    y el alcance del MVP (§IV-C) y las prioridades de accesibilidad (§V-D6).
> 2. **Enunciado oficial de la Fase 3** — `Course Project Phase 3 - Entrega Final.pdf`.
>    **Trae la rúbrica real, los entregables y el formato de entrega.** Contra este documento
>    se evalúa la entrega final (ver sección Rúbrica).
>
> "Obligatorio" = exigido por el enunciado de Fase 3 **o** comprometido por el equipo en el
> artículo. Lo que el artículo sugiere pero no fija como MVP va como Inferido o Recomendado.
> Lo que sigue sin definir el profesor está en Dudas.

Tipos: **Obligatorio** (comprometido en el artículo) · **Inferido** (necesario para cumplir
otro, con su justificación) · **Recomendado** (mejora opcional) · **Aclarar** (ambiguo o
contradictorio; ver Dudas).

Estados: Pendiente · Implementado sin probar · Verificado · Bloqueado.
**"Verificado" solo con evidencia**: una prueba que pasa, o una captura en `artifacts/`.

## Requisitos

| ID | Requisito | Tipo | Fuente | Implementación | Prueba | Estado |
|---|---|---|---|---|---|---|
| RT-001 | Stack Expo / React Native | Obligatorio | Entorno + andamiaje del repo | Proyecto Expo Router ya andamiado | `expo-doctor` sin errores + app arranca en emulador | Verificado (`expo-doctor` 20/20; app corrida en emulador Android vía `agent-device`, ver `artifacts/t0/`) |
| RT-002 | Verificación solo en emulador Android (sin iOS) | Obligatorio | `docs/ENTORNO.md` | — | Capturas en `artifacts/` desde Android | Verificado (`artifacts/t0/seleccion-perfil-2.png`, `paciente-inicio-fix.png`, `cuidador-inicio.png`) |
| RT-003 | Sin sensores / wearables / biomarcadores digitales | Obligatorio | §IV-C | No usar APIs de sensores | Revisión de código (no hay imports de sensores) | Pendiente |
| RT-004 | Sin backend clínico ni validación clínica (sí backend propio de cuentas/datos) | Obligatorio | §IV-C + decisión usuario | Supabase para cuentas/datos, no para diagnóstico | Doc en `DECISIONES.md` (D-002) | Pendiente |
| RT-005 | Expo SDK 58: usar docs versionadas antes de cada API | Obligatorio | AGENTS.md | Consultar docs al implementar | Revisión de código | Pendiente |
| RT-006 | Estado global con **Redux Toolkit** (decisión D-005) | Obligatorio | Fase 3 §2 ("Redux Toolkit o Context") | Store + slices tipados; async con thunks/RTK Query | Revisión de código + defensa individual | Implementado sin probar (`src/store/`: `profile-slice`, `settings-slice`, probado en vivo en emulador — selección de perfil navega según el estado; aún sin thunks/RTK Query, llegan con T0.5) |
| RT-007 | Repo limpio: tipado, modular, **sin secretos en el historial** y **commits equitativos de los 3 integrantes** | Obligatorio | Fase 3 §3 (30%) | `.env` fuera de git, claves en variables de entorno, Co-Authored-By / autoría real | `git shortlog -sne` muestra a los 3; `security-reviewer` sin secretos | Pendiente |
| RF-001 | Registro de síntomas del paciente | Obligatorio | §I-C, §II-C, §IV-C | Pantalla + validación + persistencia en backend | Prueba unitaria de validación + captura en `artifacts/` | Pendiente |
| RF-002 | Calendario de síntomas (registrar/ver por fecha) | Obligatorio | §IV-C | Vista calendario, selección de día | Prueba de mapeo síntomas→día + captura | Pendiente |
| RF-003 | Actividades de estimulación cognitiva (memoria/atención/lógica), dificultad progresiva, sin que la velocidad sea el único criterio | Obligatorio | §II-C, §V-B | 1–2 actividades con niveles | Prueba de lógica de puntaje/nivel + captura | Pendiente |
| RF-004 | Actividades de estimulación motriz sencillas y progresivas | Obligatorio | §V-C | 1 actividad motriz por pasos | Prueba de lógica + captura | Pendiente |
| RF-005 | Historial / comparación de evolución (actual vs pasado) | Obligatorio | §II-C | Pantalla de progreso con histórico | Prueba de agregación/comparación + captura | Pendiente |
| RF-006 | Módulo del cuidador: observaciones, acompañar ejercicios, acceso a registros con autorización | Obligatorio | §II-C, §IV-B, §IV-C | Pantallas de cuidador + reglas de acceso | Prueba de regla de acceso + captura | Pendiente |
| RF-007 | Selección de perfil paciente/cuidador | Inferido (los módulos distinguen perfil) | §I-C | Pantalla de selección + navegación por perfil | Captura de cada perfil en `artifacts/` | Pendiente |
| RF-008 | Recordatorios (medicación/eventos) con alternativa visual + háptica | Obligatorio | §V-A | Recordatorio con aviso visual y háptico | Captura + revisión de que no depende solo de audio | Pendiente |
| RF-009 | Espacio de información / red de apoyo psicológico | Inferido (prometido a ambos perfiles en §I-C) | §I-C | Pantalla de contenidos de apoyo | Captura en `artifacts/` | Pendiente |
| RF-010 | Todo contenido audiovisual con subtítulos/transcripción | Obligatorio si hay AV | §V-A | Subtítulos/transcripción en cualquier AV | Captura mostrando subtítulos | Pendiente |
| RF-011 | Cuentas de usuario: registro e inicio de sesión | Inferido (lo exige la sync elegida) | Decisión usuario + §IV-B | Auth de Supabase | Prueba de flujo de validación + captura | Pendiente |
| RF-012 | Vinculación paciente↔cuidador con consentimiento explícito y sync entre dispositivos | Obligatorio | §II-C, §IV-B | Vínculo con autorización + RLS | Prueba de que sin consentimiento no hay acceso + captura | Pendiente |
| RNF-001 | Base WCAG 2.2 AA + principios POUR | Obligatorio | §V, §V-D | Guía de accesibilidad transversal | Auditoría de `accessibility-reviewer` | Pendiente |
| RNF-002 | Escalado dinámico de texto sin recortes/superposición; `lineHeight` adecuado para evitar clipping de caracteres | Obligatorio (prioridad semestre) | §V-D2, §V-D6 + Fase 3 §3 | Respetar tamaño de fuente del SO; tokens de tipografía con `lineHeight` | Captura con fuente del sistema ampliada | Pendiente |
| RNF-003 | Contraste ≥ 4.5:1 y paleta validada contra 3 tipos de daltonismo | Obligatorio (prioridad) | §V-D3, §V-D6 | Tokens de color validados | Cálculo de contraste (`accessibility-reviewer`) | Implementado sin probar (auditado 2026-11-08: todos los pares en uso ≥4.5:1; esquema claro confirmado visualmente en emulador, `artifacts/t0/`; falta captura del esquema oscuro) |
| RNF-004 | Semántica para lector de pantalla (TalkBack): `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, `accessibilityState`; agrupamiento de contenedores táctiles para evitar focos fragmentados; orden de navegación lógico | Obligatorio (prioridad) | §V-D5, §V-D6 + Fase 3 §3 | Props nativas en todo control; `accessible` en contenedores | Recorrido con TalkBack + auditoría | Implementado sin probar (auditado en `ProfileOption`/`ScreenState`/pantallas T0; falta recorrido real con TalkBack) |
| RNF-005 | Áreas táctiles ≥ 44×44 pt / 48×48 dp, `hitSlop` donde corresponda, evitar gestos complejos | Obligatorio | §V-C + Fase 3 §3 | Tamaño mínimo de toque en tokens + `hitSlop` | Auditoría de `accessibility-reviewer` | Implementado sin probar (`MinTouchSize`=48 + `hitSlop` en `ProfileOption`; toques confirmados funcionales en emulador vía `agent-device`, falta medición pixel exacta) |
| RNF-006 | Ningún estado/alerta solo por color (color+ícono+texto); evitar rojo-verde | Obligatorio | §V-D3 | Indicadores con ícono y texto | Captura de indicadores de severidad | Pendiente (sin indicadores de severidad implementados aún, llegan con T1) |
| RNF-007 | Modo oscuro / bajo brillo; evitar blanco puro sobre negro puro; sin destellos | Obligatorio | §V-D4 | Tema de bajo brillo | Captura en modo bajo brillo | Implementado sin probar (`DarkColors` sin blanco/negro puro, derivado y auditado; falta captura real en emulador) |
| RNF-008 | Instrucciones cortas, navegación consistente, un elemento principal por pantalla | Obligatorio | §V-B | Patrón de pantalla simple | Revisión de diseño + captura | Pendiente |
| RNF-009 | `accessibilityLiveRegion` para cambios dinámicos; háptica complementaria | Obligatorio | §V-A | Anuncio de cambios dinámicos | Revisión de código + recorrido con TalkBack | Implementado sin probar (`ScreenState` usa `accessibilityLiveRegion`/`accessibilityState busy`; háptica aún no aplica, no hay recordatorios en T0) |
| RNF-010 | Simplicidad / baja fatiga (evitar exceso de texto, lección de MSCopilot) | Obligatorio | §III-B, §IV-C | Densidad de contenido controlada | Revisión de diseño | Pendiente |
| RNF-011 | Español y contexto Latinoamérica | Obligatorio | §III-B, §IV-B | Textos en español | Revisión de UI | Pendiente |
| RNF-012 | Privacidad de datos de salud: sesión en almacenamiento seguro, RLS, manejo de errores/offline | Obligatorio | §IV-C + decisión usuario | SecureStore + RLS + estados de red | Prueba de capa de datos + revisión de `security-reviewer` | Pendiente |
| REC-001 | Entrada por voz/dictado para registro de síntomas | Recomendado | §V-D5 | Extensión | Captura si se implementa | Pendiente |
| REC-002 | Versión auditiva completa de actividades de estimulación | Recomendado | §V-D5, §V-D6 | Extensión | Captura si se implementa | Pendiente |
| REC-003 | Perfil del médico tratante | Recomendado (opcional/futuro) | §I-C, §IV-C | Fuera del MVP | — | Pendiente |
| ENT-001 | App móvil funcional **extremo a extremo**, sin mocks hardcodeados injustificados ni crashes | Obligatorio | Fase 3 §3 (30%) | Flujos de negocio reales sobre Supabase | Demo en vivo + capturas en `artifacts/` | Pendiente |
| ENT-002 | **Documento Técnico Final** (Markdown en `/docs`, 5–8 págs, refs IEEE/APA) con 5 secciones: Visión+estado del arte · Arquitectura E2E · Accesibilidad (matriz trazable) · Pruebas · Conclusiones | Obligatorio | Fase 3 §2 (20%) | `docs/ENTREGA-FINAL.md` + diagramas | Revisión contra las 5 secciones exigidas | Pendiente |
| ENT-003 | **README.md** completo: instalación, variables de entorno, arquitectura, guía de ejecución, resumen de accesibilidad | Obligatorio | Fase 3 §3 (30%) | README en raíz del repo | Reproducir instalación desde cero | Pendiente |
| ENT-004 | **Presentación + demo EN VIVO** sobre emulador/dispositivo (pitch + flujo de negocio + accesibilidad en acción) | Obligatorio | Fase 3 §4 (10%) | Guion de demo (ver `GUIA-VIDEO.md`, reorientar a demo en vivo) | Ensayo de demo | Pendiente |
| ENT-005 | **Defensa técnica individual** (40%): cada integrante explica su código, estado, navegación, datos y accesibilidad; inspección de código en vivo | Obligatorio | Fase 3 §5 (40%) | Reparto de módulos + autoría real por integrante | Los 3 pueden abrir y explicar su parte | Pendiente |

Prefijos: `RF-` funcional · `RNF-` no funcional · `RT-` restricción técnica ·
`ENT-` entregable · `EVA-` criterio de rúbrica.

## Rúbrica

Fuente: `Course Project Phase 3 - Entrega Final.pdf` §6. Son 4 componentes (100%).

| ID | Criterio | Peso | Evidencia | Requisitos que lo cubren |
|---|---|---|---|---|
| EVA-001 | **Documento Final (Fase 3)**: 5 secciones (visión+estado del arte, arquitectura, accesibilidad trazable, pruebas, conclusiones), diagramas, tablas, refs IEEE/APA | 20% | `docs/ENTREGA-FINAL.md` | ENT-002 |
| EVA-002 | **Funcionalidad y Repositorio**: app 100% funcional E2E, accesibilidad real en UI, código limpio/tipado, README reproducible, **historial de commits equitativo** de los 3 | 30% | App en emulador + repo + `git shortlog` | ENT-001, ENT-003, RT-006, RT-007, RF-*, RNF-* |
| EVA-003 | **Presentación y demo en vivo**: pitch, calidad visual, manejo del tiempo, demo fluida de negocio + accesibilidad | 10% | Demo en vivo | ENT-004 |
| EVA-004 | **Defensa técnica individual**: preguntas aleatorias a cada integrante sobre arquitectura, estado, datos y accesibilidad; inspección de código en vivo | 40% | Respuesta oral de cada integrante | ENT-005 (transversal a todo el código) |

> **Lectura estratégica.** El 40% (defensa individual) + 30% (funcionalidad/repo, que incluye
> commits equitativos) significan que **cada integrante debe haber escrito y entender una parte
> real del código**. No basta con que la app funcione: hay que poder explicarla línea por línea.

## Dudas para el profesor

_(Numeradas. La mayoría se resolvieron con el enunciado de Fase 3 del 2026-11-07.)_
1. ~~¿Existe rúbrica?~~ **RESUELTA** — Fase 3 §6: Documento 20% · Funcionalidad/Repo 30% · Presentación 10% · Defensa individual 40%.
2. ~~¿Entregables y formato?~~ **RESUELTA** — Documento técnico final (PDF/Markdown, 5–8 págs, refs IEEE/APA, en `/docs` o raíz) + repositorio funcional + presentación/defensa en vivo.
3. **ABIERTA** — El enunciado exige puntualidad ("un minuto tarde = no se acepta") pero **no indica la fecha/hora**. Hay que confirmarla con el profesor / la plataforma del curso.
4. ~~¿Política de uso de IA?~~ **RESUELTA** — El profesor dejó **uso libre de IA**. No se requiere declaración (Decisión D-008).
5. ~~¿Contra qué se evalúa el alcance?~~ **RESUELTA** — Contra la visión de Fase 1 + la propuesta de accesibilidad de Fase 2, consolidadas en el documento final. La Fuente de Verdad del equipo es la base.
6. ~~¿Sync real o simulada?~~ **RESUELTA** — Real: el enunciado prohíbe "mocks hardcodeados injustificados". Backend Supabase (D-002) validado.
7. **ABIERTA (bajo riesgo)** — El perfil del médico queda fuera del MVP por decisión del equipo (REC-003, D-003); el enunciado no lo exige.

## Decisiones provisionales

_(Permiten avanzar sin bloquearse mientras el profesor responde. Si responde distinto,
se cambia la decisión y se anota en `docs/enunciado/aclaraciones.md`.)_

| Duda | Decisión | Por qué |
|---|---|---|
| 3 | Avanzar a buen ritmo asumiendo plazo cercano; confirmar fecha con el profesor cuanto antes | El enunciado es estricto con la puntualidad pero no da fecha; no bloquea el desarrollo |
| 7 | Dejar el perfil médico fuera del MVP (REC-003) | El artículo lo marca como futuro y el enunciado no lo exige |

_(Las dudas 1, 2, 4, 5 y 6 quedaron resueltas por el enunciado de Fase 3; ya no son provisionales.)_
