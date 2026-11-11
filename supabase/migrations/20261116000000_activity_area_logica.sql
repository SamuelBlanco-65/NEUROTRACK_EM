-- Actividad "Lógica": amplía las áreas permitidas en activity_progress y activity_sessions.
-- Sin CLI de Supabase enlazado en este equipo: ejecutar a mano en el SQL Editor del proyecto.
-- Es seguro repetirla. Si no se ejecuta, la actividad funciona igual pero no guarda su nivel
-- ni su historial (la app tolera el error de guardado, RNF-012).

alter table public.activity_progress drop constraint if exists activity_progress_area_check;
alter table public.activity_progress
  add constraint activity_progress_area_check
  check (area in ('memoria', 'atencion', 'logica', 'movimiento'));

alter table public.activity_sessions drop constraint if exists activity_sessions_area_check;
alter table public.activity_sessions
  add constraint activity_sessions_area_check
  check (area in ('memoria', 'atencion', 'logica', 'movimiento'));
