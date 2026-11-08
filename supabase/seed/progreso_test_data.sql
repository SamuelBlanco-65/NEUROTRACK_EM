-- Datos de prueba para verificar la pantalla de Progreso (RF-005) sin tener que
-- registrar 10+ días a mano en la app. NO es una migración: es un script de una sola vez,
-- pensado para correr en el SQL Editor de Supabase sobre tu propia cuenta de paciente.
--
-- Qué genera (relativo a la fecha en que lo corras):
--   - symptom_logs: fatiga en 7 días distintos del mes pasado y en 3 del mes actual
--     (para ver la flecha de "menos días" en Progreso), visión borrosa estable (2 y 2),
--     y dolor en los últimos 3 días consecutivos (para el insight de "Constancia").
--     Total: 14 días distintos con síntomas → pasa el umbral MIN_DISTINCT_DAYS_FOR_INSIGHTS (10).
--   - activity_sessions: unas cuantas sesiones de memoria/atención/movimiento repartidas
--     entre el mes pasado y el actual, para que las barras de "Actividades hechas" no queden en 0.
--
-- USO:
--   1. Reemplaza 'TU_CORREO@EJEMPLO.COM' por el correo con el que iniciaste sesión como paciente.
--   2. Pega y corre esto en el SQL Editor de Supabase (una sola vez).
--   3. Abre la app → Progreso. Para limpiar después, corre el bloque DELETE al final
--      (comentado por seguridad).

with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
insert into public.symptom_logs (patient_id, symptom_type, severity, note, occurred_at)
select patient.id, v.symptom_type, v.severity, null, now() - (v.days_ago || ' days')::interval
from patient, (values
  -- mes pasado: fatiga en 7 días distintos (35..60 días atrás)
  (35, 'fatiga', 'fuerte'), (39, 'fatiga', 'fuerte'), (43, 'fatiga', 'moderado'),
  (47, 'fatiga', 'fuerte'), (51, 'fatiga', 'moderado'), (55, 'fatiga', 'fuerte'), (59, 'fatiga', 'moderado'),
  -- mes actual: fatiga en solo 3 días (tendencia a la baja)
  (2, 'fatiga', 'moderado'), (9, 'fatiga', 'leve'), (16, 'fatiga', 'moderado'),
  -- visión borrosa estable: 2 días cada período
  (10, 'vision_borrosa', 'leve'), (20, 'vision_borrosa', 'leve'),
  (40, 'vision_borrosa', 'leve'), (50, 'vision_borrosa', 'leve'),
  -- racha reciente para el insight de "Constancia"
  (0, 'dolor', 'leve'), (1, 'dolor', 'leve'), (2, 'dolor', 'moderado')
) as v(days_ago, symptom_type, severity);

with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
insert into public.activity_sessions (patient_id, area, completed_at)
select patient.id, v.area, now() - (v.days_ago || ' days')::interval
from patient, (values
  (1, 'memoria'), (3, 'atencion'), (5, 'memoria'), (8, 'movimiento'),
  (20, 'memoria'), (25, 'atencion'), (45, 'movimiento'), (55, 'memoria')
) as v(days_ago, area);

-- Limpieza (borra SOLO lo insertado arriba, no tus registros reales hechos a mano
-- en los mismos días): descomenta y corre cuando termines de verificar.
-- with patient as (
--   select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
-- )
-- delete from public.symptom_logs where patient_id = (select id from patient) and note is null
--   and occurred_at > now() - interval '61 days';
-- with patient as (
--   select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
-- )
-- delete from public.activity_sessions where patient_id = (select id from patient)
--   and completed_at > now() - interval '61 days';
