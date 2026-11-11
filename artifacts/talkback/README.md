# Recorrido con TalkBack (celular real, 2026-11-11)

14 capturas tomadas por el equipo en un celular Android físico con **TalkBack activo** (el rectángulo verde es el foco del
lector de pantalla), en modo oscuro y con Expo Go, de las 10:31 a las 10:43. Perfil paciente. Sirven de evidencia de
RNF-004 (semántica y orden de lectura), RNF-006, RNF-009, REC-001 y de la sección 4.3 de `docs/ENTREGA-FINAL.md`.

| # | Pantalla | Qué muestra el foco de TalkBack |
|---|---|---|
| 01 | Selección de perfil | Tarjeta «Soy paciente» como un solo elemento (título + descripción) |
| 02 | Iniciar sesión | Foco en el campo de correo |
| 03 | Inicio del paciente | Botón principal «Registrar cómo me siento» |
| 04 | Asistente de síntomas, paso 1 | Tarjeta «Fatiga» con descripción, como un solo elemento |
| 05 | Asistente, paso 2 | Opción «Moderado» seleccionada: ícono de check + dos barras + palabra (nunca solo color) |
| 06 | Asistente, paso 3 | Foco en «Escritura por voz» del teclado del sistema (el botón «Dictar con voz» lo abre) |
| 07 | Asistente, paso 3 | Campo de nota con contador 0/300 y botón «Dictar con voz» |
| 08 | Dictado | El micrófono del teclado («Escuchando…») escribe en la nota: «Se nota Progreso y un avance» (REC-001) |
| 09 | Calendario | Día 11 seleccionado; cada día con registro lleva barras de severidad y la leyenda Leve/Moderado/Fuerte |
| 10 | Calendario | El registro dictado aparece guardado (Fatiga, Moderado, 10:40 a. m.); foco en el botón «Registrar» |
| 11 | Actividades | Tarjeta «Tu sesión de hoy» como un solo elemento |
| 12 | Movimiento | Primer paso marcado como hecho (check + texto), «Paso 1 de 6» |
| 13 | Accesibilidad | Opciones de apariencia (Claro / Oscuro / Automático) y tamaño de texto |
| 14 | Progreso | Foco en la pestaña «Progreso» de la barra inferior; gráfico con leyenda de forma y color |

## Observaciones
- Es una **compilación anterior** a la actividad Lógica: en la 11 la tarjeta «Lógica» aparece con candado. La Lógica
  jugable se ve en `artifacts/t11/04`–`06`.
- Con TalkBack se detectó que **las barras del gráfico de Progreso no se podían seleccionar**. Se corrigieron (botones con
  etiqueta y estado) y el arreglo se ve en `artifacts/t11/03`; la captura 14 muestra la pestaña, no las barras.
- Cobertura: perfil paciente (selección de perfil, acceso, inicio, síntomas, calendario, actividades, accesibilidad,
  progreso). No incluye cuidador ni médico.
- La pastilla «Tools» y el engranaje flotante son de Expo Go, no de la app.
