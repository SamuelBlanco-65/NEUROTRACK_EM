-- Diagnóstico: por qué "Semana" y "Mes" en Progreso siguen mostrando datos insuficientes
-- después de correr progreso_test_data.sql. Reemplaza el correo y corre en el SQL Editor.
--
-- Pista antes de correrlo: el seed puso la fatiga "del mes pasado" a 35-59 días atrás
-- contados desde el momento en que lo corriste. Si hoy es 2026-11-08, 59 días atrás es
-- ~10 de septiembre, es decir NO cae dentro de octubre. La app solo cuenta los registros
-- que caen en la ventana [inicio del período anterior, fin del período actual), así que
-- cualquier dato fuera de esa ventana no suma, aunque exista en la tabla.

with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
-- 1) Todo lo que hay en symptom_logs para tu cuenta, del más viejo al más nuevo
select 'symptom_logs' as tabla, symptom_type as detalle, severity, occurred_at as fecha,
       (occurred_at::date) as dia
from public.symptom_logs, patient
where patient_id = patient.id
union all
-- 2) Todo lo que hay en activity_sessions
select 'activity_sessions' as tabla, area as detalle, null as severity, completed_at as fecha,
       (completed_at::date) as dia
from public.activity_sessions, patient
where patient_id = patient.id
order by fecha;

-- 3) Cuántos días DISTINTOS de síntomas caen dentro de cada ventana que usa la pantalla
-- de Progreso (ajusta las fechas si hoy ya no es 2026-11-08):
--   Semana: ventana = [inicio semana pasada, fin semana actual) = [2026-10-26, 2026-11-09)
--   Mes:    ventana = [inicio mes pasado,    fin mes actual)    = [2026-10-01, 2026-12-01)
with patient as (
  select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
)
select
  'semana (2026-10-26 a 2026-11-09)' as ventana,
  count(distinct occurred_at::date) as dias_distintos
from public.symptom_logs, patient
where patient_id = patient.id
  and occurred_at >= '2026-10-26' and occurred_at < '2026-11-09'
union all
select
  'mes (2026-10-01 a 2026-12-01)' as ventana,
  count(distinct occurred_at::date) as dias_distintos
from public.symptom_logs, patient
where patient_id = patient.id
  and occurred_at >= '2026-10-01' and occurred_at < '2026-12-01';
