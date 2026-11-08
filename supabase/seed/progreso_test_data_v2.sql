-- Versión corregida de progreso_test_data.sql: usa fechas FIJAS (no relativas a now())
-- para que los días caigan dentro de las dos ventanas que usa la pantalla de Progreso:
--   Semana: [2026-10-26, 2026-11-09)  -- semana pasada + semana actual
--   Mes:    [2026-10-01, 2026-12-01)  -- mes pasado (octubre) + mes actual (noviembre)
-- Si ya corriste progreso_test_data.sql, no pasa nada: puedes correr este encima,
-- son filas adicionales (hasEnoughData cuenta días distintos, no filas).
--
-- Reemplaza 'TU_CORREO@EJEMPLO.COM' por tu correo de paciente antes de correr.

with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
insert into public.symptom_logs (patient_id, symptom_type, severity, note, occurred_at)
select patient.id, v.symptom_type, v.severity, null, v.fecha::timestamptz
from patient, (values
  -- octubre (mes pasado): fatiga bajando de 4 días...
  ('2026-10-20 12:00:00+00', 'fatiga', 'fuerte'),
  ('2026-10-22 12:00:00+00', 'fatiga', 'moderado'),
  ('2026-10-26 12:00:00+00', 'fatiga', 'fuerte'),
  ('2026-10-31 12:00:00+00', 'fatiga', 'moderado'),
  ('2026-10-24 12:00:00+00', 'vision_borrosa', 'leve'),
  ('2026-10-29 12:00:00+00', 'vision_borrosa', 'leve'),
  ('2026-10-27 12:00:00+00', 'dolor', 'leve'),
  -- noviembre (mes/semana actual): fatiga a solo 3 días (tendencia a la baja)...
  ('2026-11-01 12:00:00+00', 'fatiga', 'moderado'),
  ('2026-11-03 12:00:00+00', 'fatiga', 'leve'),
  ('2026-11-08 12:00:00+00', 'fatiga', 'moderado'),
  ('2026-11-05 12:00:00+00', 'vision_borrosa', 'leve'),
  -- ...y dolor subiendo, con racha de 4 días seguidos (2,3 ausente,6,7,8) para "Constancia"
  ('2026-11-02 12:00:00+00', 'dolor', 'leve'),
  ('2026-11-06 12:00:00+00', 'dolor', 'moderado'),
  ('2026-11-07 12:00:00+00', 'dolor', 'moderado')
) as v(fecha, symptom_type, severity);

with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
insert into public.activity_sessions (patient_id, area, completed_at)
select patient.id, v.area, v.fecha::timestamptz
from patient, (values
  ('2026-10-26 12:00:00+00', 'memoria'),
  ('2026-10-29 12:00:00+00', 'atencion'),
  ('2026-11-01 12:00:00+00', 'movimiento'),
  ('2026-11-03 12:00:00+00', 'memoria'),
  ('2026-11-06 12:00:00+00', 'atencion'),
  ('2026-11-08 12:00:00+00', 'memoria')
) as v(fecha, area);

-- Verifica después de correrlo con progreso_diagnostico.sql: deberías ver
-- dias_distintos >= 10 tanto para "semana" como para "mes".

-- Limpieza (borra SOLO estas fechas fijas; no toca registros reales que hagas a mano
-- en esos mismos días, salvo que coincidan exactamente a las 12:00:00 UTC):
-- with patient as (
--   select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
-- )
-- delete from public.symptom_logs where patient_id = (select id from patient)
--   and note is null
--   and occurred_at in (
--     '2026-10-20 12:00:00+00','2026-10-22 12:00:00+00','2026-10-26 12:00:00+00',
--     '2026-10-31 12:00:00+00','2026-10-24 12:00:00+00','2026-10-29 12:00:00+00',
--     '2026-10-27 12:00:00+00','2026-11-01 12:00:00+00','2026-11-03 12:00:00+00',
--     '2026-11-08 12:00:00+00','2026-11-05 12:00:00+00','2026-11-02 12:00:00+00',
--     '2026-11-06 12:00:00+00','2026-11-07 12:00:00+00'
--   );
-- with patient as (
--   select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
-- )
-- delete from public.activity_sessions where patient_id = (select id from patient)
--   and completed_at in (
--     '2026-10-26 12:00:00+00','2026-10-29 12:00:00+00','2026-11-01 12:00:00+00',
--     '2026-11-03 12:00:00+00','2026-11-06 12:00:00+00','2026-11-08 12:00:00+00'
--   );
