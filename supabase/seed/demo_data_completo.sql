-- Datos de DEMO completos para paciente + cuidador + médico (no es una migración).
-- Llena TODAS las pantallas con historia suficiente para que se vean completas:
--   * symptom_logs      ~5 meses (2026-06-01 hasta hoy): calendario + Progreso Semana/Mes/3 meses,
--                       con tendencia de mejora (menos fatiga y menos severidad con el tiempo).
--                       Los últimos 14 días tienen registro TODOS los días.
--   * activity_sessions mismo rango; los últimos 10 días tienen sesión todos los días (racha).
--   * activity_progress niveles actuales por área.
--   * caregiver_links   vínculo ACEPTADO con los 3 permisos activos (se reutiliza el que ya exista).
--   * caregiver_observations (bitácora del cuidador), caregiver_cheers (mensajes de ánimo,
--                       el último sin leer para que salga el banner en Inicio del paciente).
--   * reminders         historial de la última semana + hoy + próximos días + uno vencido.
--   * doctor_links      (opcional) vínculo ACEPTADO con el médico: síntomas, notas y progreso
--                       compartidos, sin fecha de fin. Si no hay cuenta de médico, se omite.
--   * Lógica            sesiones y nivel de la actividad Lógica. REQUIERE haber corrido antes
--                       supabase/migrations/20261116000000_activity_area_logica.sql.
--
-- Los niveles quedan a la mitad (memoria 3, atención 3, lógica 2, movimiento 2) para que en la
-- grabación todavía se puedan hacer las actividades y se vea subir de nivel.
--
-- CÓMO USAR (SQL Editor de Supabase, que corre como postgres e ignora RLS):
--   1. Crea (o usa) TRES cuentas ya registradas y confirmadas en la app: paciente, cuidador y
--      médico (el médico se registra eligiendo el perfil «Médico»). Reemplaza los tres correos
--      de abajo. Si no tienes cuenta de médico, deja el correo como está: se omite esa parte.
--   2. Pega el archivo completo y ejecútalo UNA vez.
--   3. Si lo vuelves a correr, v_limpiar = true borra antes los datos de ESTE paciente
--      (síntomas, sesiones, recordatorios, observaciones, mensajes) y los regenera, así no se
--      duplican. Pon false si NO quieres borrar lo que ya tenga cargado.
--
-- Fechas: el rango de síntomas/sesiones va de una fecha FIJA (2026-06-01) hasta "hoy" en hora
-- de Bogotá, un registro por día calendario (no ventanas relativas por semana), así que todas
-- las vistas (semana, mes, 3 meses y los períodos anteriores) quedan cubiertas sin importar el
-- día en que se corra. Los recordatorios SÍ son relativos a hoy a propósito: corre el script el
-- día de la demo (o antes de grabar) para que "Hoy" y "Se pasó" tengan sentido.
-- Los datos se generan con hashes deterministas de la fecha (no usa random()): el resultado es
-- reproducible.

do $$
declare
  v_patient_email   constant text    := 'PACIENTE@EJEMPLO.COM';
  v_caregiver_email constant text    := 'CUIDADOR@EJEMPLO.COM';
  v_doctor_email    constant text    := 'MEDICO@EJEMPLO.COM';
  v_limpiar         constant boolean := true;

  v_start   constant date := date '2026-06-01';
  v_today   date := (now() at time zone 'America/Bogota')::date;
  v_span    int;
  v_patient uuid;
  v_caregiver uuid;
  v_doctor  uuid;
  v_link    uuid;
  n_sym int; n_act int; n_obs int; n_cheer int; n_rem int;
begin
  select id into v_patient   from auth.users where lower(email) = lower(v_patient_email);
  select id into v_caregiver from auth.users where lower(email) = lower(v_caregiver_email);
  select id into v_doctor    from auth.users where lower(email) = lower(v_doctor_email);
  if v_patient is null then
    raise exception 'No existe un usuario con el correo de paciente %', v_patient_email;
  end if;
  if v_caregiver is null then
    raise exception 'No existe un usuario con el correo de cuidador %', v_caregiver_email;
  end if;
  if v_patient = v_caregiver then
    raise exception 'Paciente y cuidador deben ser cuentas distintas';
  end if;
  v_span := greatest(v_today - v_start, 1);

  -- ---------------------------------------------------------------- limpieza opcional
  if v_limpiar then
    delete from public.caregiver_cheers       where patient_id = v_patient;
    delete from public.caregiver_observations where patient_id = v_patient;
    delete from public.reminders              where patient_id = v_patient;
    delete from public.activity_sessions      where patient_id = v_patient;
    delete from public.symptom_logs           where patient_id = v_patient;
    delete from public.doctor_links           where patient_id = v_patient;
  end if;

  -- ---------------------------------------------------------------- vínculo cuidador
  select id into v_link from public.caregiver_links
   where patient_id = v_patient and caregiver_id = v_caregiver
   order by created_at desc limit 1;

  if v_link is null then
    insert into public.caregiver_links
      (patient_id, caregiver_id, caregiver_email, caregiver_name, invite_code, status,
       share_sintomas, share_progreso, share_recordatorios, created_at, responded_at)
    values
      (v_patient, v_caregiver, lower(v_caregiver_email), 'Cuidador de prueba',
       upper(substr(md5(v_patient::text || 'demo'), 1, 6)), 'aceptado',
       true, true, true, now() - interval '30 days', now() - interval '30 days')
    returning id into v_link;
  else
    update public.caregiver_links
       set status = 'aceptado', share_sintomas = true, share_progreso = true,
           share_recordatorios = true, responded_at = coalesce(responded_at, now())
     where id = v_link;
  end if;

  -- ---------------------------------------------------------------- síntomas
  -- Hasta 2 registros por día; probabilidad de registrar sube de 40% a 80% con el tiempo.
  -- Antes de septiembre: más fatiga y más severidad. Después: mejora gradual.
  with rolls as (
    select
      g::date as day,
      (abs(hashtext(g::date::text || 'a')::bigint)   % 100)::int as ra,
      (abs(hashtext(g::date::text || 'b')::bigint)   % 100)::int as rb,
      (abs(hashtext(g::date::text || 't1')::bigint)  % 100)::int as rt1,
      (abs(hashtext(g::date::text || 't2')::bigint)  % 100)::int as rt2,
      (abs(hashtext(g::date::text || 's1')::bigint)  % 100)::int as rs1,
      (abs(hashtext(g::date::text || 's2')::bigint)  % 100)::int as rs2,
      (abs(hashtext(g::date::text || 'h1')::bigint)  % 100)::int as rh1,
      (abs(hashtext(g::date::text || 'h2')::bigint)  % 100)::int as rh2,
      (abs(hashtext(g::date::text || 'm1')::bigint)  % 100)::int as rm1,
      (abs(hashtext(g::date::text || 'm2')::bigint)  % 100)::int as rm2,
      (abs(hashtext(g::date::text || 'n1')::bigint)  % 100)::int as rn1,
      (abs(hashtext(g::date::text || 'n2')::bigint)  % 100)::int as rn2,
      (abs(hashtext(g::date::text || 'i1')::bigint)  % 100)::int as ri1,
      (abs(hashtext(g::date::text || 'i2')::bigint)  % 100)::int as ri2
    from generate_series(v_start::timestamp, v_today::timestamp, interval '1 day') g
  ),
  base as (
    select r.*,
           (r.day < date '2026-09-01') as early,
           (r.day >= v_today - 14 or r.ra < 40 + (40 * (r.day - v_start)) / v_span) as log1
    from rolls r
  ),
  typed as (
    select b.*,
      case when b.early then
        case when b.rt1 < 45 then 'fatiga' when b.rt1 < 62 then 'dolor' when b.rt1 < 74 then 'vision_borrosa'
             when b.rt1 < 86 then 'debilidad' when b.rt1 < 95 then 'equilibrio' else 'otro' end
      else
        case when b.rt1 < 30 then 'fatiga' when b.rt1 < 52 then 'dolor' when b.rt1 < 66 then 'vision_borrosa'
             when b.rt1 < 80 then 'debilidad' when b.rt1 < 92 then 'equilibrio' else 'otro' end
      end as t1,
      case when b.early then
        case when b.rt2 < 45 then 'fatiga' when b.rt2 < 62 then 'dolor' when b.rt2 < 74 then 'vision_borrosa'
             when b.rt2 < 86 then 'debilidad' when b.rt2 < 95 then 'equilibrio' else 'otro' end
      else
        case when b.rt2 < 30 then 'fatiga' when b.rt2 < 52 then 'dolor' when b.rt2 < 66 then 'vision_borrosa'
             when b.rt2 < 80 then 'debilidad' when b.rt2 < 92 then 'equilibrio' else 'otro' end
      end as t2raw
    from base b
  ),
  fixed as (
    select t.*,
      case when t.t2raw = t.t1 then (case when t.t1 = 'dolor' then 'fatiga' else 'dolor' end) else t.t2raw end as t2
    from typed t
  ),
  slots as (
    select day, early, t1 as symptom_type, rs1 as rs, rh1 as rh, rm1 as rm, rn1 as rn, ri1 as ri
      from fixed where log1
    union all
    select day, early, t2, rs2, rh2, rm2, rn2, ri2
      from fixed where log1 and rb < 22
  ),
  final as (
    select s.*,
      -- least(...): si la hora del día de hoy cae después de "ahora", se adelanta a hace 10 min;
      -- si no, el registro de hoy se descartaba y la vista Semana quedaba en 9 de 10 días.
      least(((s.day::timestamp + make_interval(hours => 7 + (s.rh % 15), mins => s.rm % 60))
         at time zone 'America/Bogota'), now() - interval '10 minutes') as occurred_at
    from slots s
  )
  insert into public.symptom_logs (patient_id, symptom_type, severity, note, occurred_at)
  select v_patient, f.symptom_type,
    case when f.early then
      case when f.rs < 30 then 'fuerte' when f.rs < 75 then 'moderado' else 'leve' end
    else
      case when f.rs < 10 then 'fuerte' when f.rs < 45 then 'moderado' else 'leve' end
    end,
    case when f.rn < 28 then (array[
      'Apareció al despertar.', 'Empeoró por la tarde.', 'Mejoró después de descansar.',
      'Fue un día de mucho calor.', 'Dormí poco anoche.', 'Me pasó mientras caminaba.',
      'Un día con bastante estrés.', 'Se me pasó con una pausa corta.'
    ])[1 + (f.ri % 8)] end,
    f.occurred_at
  from final f
  where f.occurred_at <= now();
  get diagnostics n_sym = row_count;

  -- ---------------------------------------------------------------- sesiones de actividad
  -- Probabilidad de hacer una sesión sube de 35% a 75%; últimos 10 días: una por día (racha).
  with rolls as (
    select
      g::date as day,
      (abs(hashtext(g::date::text || 'xa')::bigint) % 100)::int as ra,
      (abs(hashtext(g::date::text || 'xb')::bigint) % 100)::int as rb,
      (abs(hashtext(g::date::text || 'xt')::bigint) % 100)::int as rt1,
      (abs(hashtext(g::date::text || 'xu')::bigint) % 100)::int as rt2,
      (abs(hashtext(g::date::text || 'xh')::bigint) % 100)::int as rh1,
      (abs(hashtext(g::date::text || 'xi')::bigint) % 100)::int as rh2,
      (abs(hashtext(g::date::text || 'xm')::bigint) % 100)::int as rm1,
      (abs(hashtext(g::date::text || 'xn')::bigint) % 100)::int as rm2
    from generate_series(v_start::timestamp, v_today::timestamp, interval '1 day') g
  ),
  base as (
    select r.*,
           (r.day >= v_today - 9 or r.ra < 35 + (40 * (r.day - v_start)) / v_span) as act1
    from rolls r
  ),
  slots as (
    select day,
      case when rt1 < 30 then 'memoria' when rt1 < 55 then 'atencion' when rt1 < 75 then 'logica' else 'movimiento' end as area,
      rh1 as rh, rm1 as rm
      from base where act1
    union all
    select day,
      case when rt2 < 30 then 'memoria' when rt2 < 55 then 'atencion' when rt2 < 75 then 'logica' else 'movimiento' end,
      rh2, rm2
      from base where act1 and rb < 20
  ),
  final as (
    select s.*,
      least(((s.day::timestamp + make_interval(hours => 8 + (s.rh % 13), mins => s.rm % 60))
         at time zone 'America/Bogota'), now() - interval '10 minutes') as completed_at
    from slots s
  )
  insert into public.activity_sessions (patient_id, area, completed_at)
  select v_patient, f.area, f.completed_at from final f where f.completed_at <= now();
  get diagnostics n_act = row_count;

  -- ---------------------------------------------------------------- nivel actual por área
  insert into public.activity_progress (patient_id, area, level, updated_at) values
    (v_patient, 'memoria',    3, now()),
    (v_patient, 'atencion',   3, now()),
    (v_patient, 'logica',     2, now()),
    (v_patient, 'movimiento', 2, now())
  on conflict (patient_id, area) do update set level = excluded.level, updated_at = excluded.updated_at;

  -- ---------------------------------------------------------------- observaciones del cuidador
  insert into public.caregiver_observations (link_id, caregiver_id, patient_id, category, note, occurred_at)
  select v_link, v_caregiver, v_patient, o.category, o.note, o.occurred_at::timestamptz
  from (values
    ('2026-10-05 19:30:00-05', 'animo',      'Hoy estuvo con buen ánimo, hizo la caminata sin quejarse.'),
    ('2026-10-08 08:15:00-05', 'medicacion', 'Tomó la medicación a tiempo. Sin náuseas después.'),
    ('2026-10-11 17:40:00-05', 'fatiga',     'Se cansó mucho después del almuerzo y durmió una siesta larga.'),
    ('2026-10-14 10:05:00-05', 'movilidad',  'Le costó subir las escaleras; fue más lento que la semana pasada.'),
    ('2026-10-17 20:10:00-05', 'animo',      'Estuvo algo decaído por la tarde; conversamos un rato y mejoró.'),
    ('2026-10-20 09:00:00-05', 'otro',       'Anoté preguntas para la próxima cita de neurología.'),
    ('2026-10-23 18:25:00-05', 'movilidad',  'Caminó 15 minutos por el parque sin apoyarse. Buen avance.'),
    ('2026-10-26 08:20:00-05', 'medicacion', 'Olvidó la dosis de la mañana; se la recordé y la tomó a las 10.'),
    ('2026-10-29 16:50:00-05', 'fatiga',     'Día de calor, más cansancio de lo normal. Descansó con las piernas arriba.'),
    ('2026-11-01 11:30:00-05', 'animo',      'Salió a almorzar con la familia, estuvo de buen ánimo y conversó mucho.'),
    ('2026-11-03 19:15:00-05', 'movilidad',  'Hizo los ejercicios de movimiento completos y sin ayuda.'),
    ('2026-11-05 08:10:00-05', 'medicacion', 'Todas las dosis de la semana tomadas a tiempo.'),
    ('2026-11-07 17:00:00-05', 'otro',       'Se notó con la visión algo borrosa por la tarde; lo registró en la app.'),
    ('2026-11-09 20:00:00-05', 'animo',      'Muy motivado con la racha de actividades. Quiere seguir mañana.')
  ) as o(occurred_at, category, note);
  get diagnostics n_obs = row_count;

  -- ---------------------------------------------------------------- mensajes de ánimo
  insert into public.caregiver_cheers (link_id, caregiver_id, patient_id, message, created_at, read_at) values
    (v_link, v_caregiver, v_patient, '💛 Cada paso cuenta muchísimo',      now() - interval '20 days', now() - interval '20 days'),
    (v_link, v_caregiver, v_patient, '☕ Tómate un rico descanso hoy',      now() - interval '9 days',  now() - interval '9 days'),
    (v_link, v_caregiver, v_patient, '🌸 ¡Orgulloso de tu constancia!',     now() - interval '4 days',  now() - interval '4 days'),
    -- el más reciente queda SIN LEER: aparece como banner en el Inicio del paciente
    (v_link, v_caregiver, v_patient, '💛 Cada paso cuenta muchísimo',      now() - interval '3 hours', null);
  get diagnostics n_cheer = row_count;

  -- ---------------------------------------------------------------- recordatorios (relativos a hoy)
  -- Última semana: medicación de la mañana hecha todos los días + algunos eventos.
  insert into public.reminders (patient_id, created_by, title, category, scheduled_at, status, done_at)
  select v_patient, v_patient, 'Medicación de la mañana', 'medicacion',
         ((days.d + time '08:00') at time zone 'America/Bogota'), 'hecho',
         ((days.d + time '08:00') at time zone 'America/Bogota')
           + make_interval(mins => 5 + (abs(hashtext(days.d::text)::bigint) % 40)::int)
  from (
    select g::date as d
    from generate_series((v_today - 7)::timestamp, (v_today - 1)::timestamp, interval '1 day') g
  ) days;

  insert into public.reminders (patient_id, created_by, title, category, scheduled_at, status, done_at) values
    -- pasado
    (v_patient, v_caregiver, 'Cita de control con neurología', 'cita',
       ((v_today - 5 + time '09:30') at time zone 'America/Bogota'), 'hecho',
       ((v_today - 5 + time '09:40') at time zone 'America/Bogota')),
    (v_patient, v_caregiver, 'Caminata corta de 10 minutos', 'bienestar',
       ((v_today - 2 + time '17:00') at time zone 'America/Bogota'), 'hecho',
       ((v_today - 2 + time '17:20') at time zone 'America/Bogota')),
    -- vencido: ayer en la noche, sigue pendiente -> sale como "Se pasó"
    (v_patient, v_caregiver, 'Tomar vitamina D', 'medicacion',
       ((v_today - 1 + time '21:00') at time zone 'America/Bogota'), 'pendiente', null),
    -- hoy
    (v_patient, v_patient, 'Medicación de la mañana', 'medicacion',
       ((v_today + time '08:00') at time zone 'America/Bogota'),
       case when now() > ((v_today + time '08:30') at time zone 'America/Bogota') then 'hecho' else 'pendiente' end,
       case when now() > ((v_today + time '08:30') at time zone 'America/Bogota')
            then ((v_today + time '08:12') at time zone 'America/Bogota') end),
    (v_patient, v_caregiver, 'Caminata corta de 10 minutos', 'bienestar',
       ((v_today + time '11:00') at time zone 'America/Bogota'), 'pendiente', null),
    (v_patient, v_patient, 'Medicación de la tarde', 'medicacion',
       ((v_today + time '15:00') at time zone 'America/Bogota'), 'pendiente', null),
    (v_patient, v_caregiver, 'Ejercicios de respiración', 'bienestar',
       ((v_today + time '19:00') at time zone 'America/Bogota'), 'pendiente', null),
    -- próximos días
    (v_patient, v_caregiver, 'Cita con neurología', 'cita',
       ((v_today + 1 + time '10:00') at time zone 'America/Bogota'), 'pendiente', null),
    (v_patient, v_patient, 'Medicación de la mañana', 'medicacion',
       ((v_today + 1 + time '08:00') at time zone 'America/Bogota'), 'pendiente', null),
    (v_patient, v_caregiver, 'Examen de laboratorio (en ayunas)', 'cita',
       ((v_today + 4 + time '07:30') at time zone 'America/Bogota'), 'pendiente', null);
  select count(*) into n_rem from public.reminders where patient_id = v_patient;

  -- ---------------------------------------------------------------- médico tratante (opcional)
  if v_doctor is null then
    raise notice 'No hay cuenta de médico con el correo %: se omite el vínculo con el médico.', v_doctor_email;
  elsif v_doctor = v_patient or v_doctor = v_caregiver then
    raise notice 'La cuenta de médico debe ser distinta de la del paciente y la del cuidador: se omite.';
  else
    insert into public.doctor_links
      (patient_id, doctor_id, patient_name, doctor_name, doctor_email, professional_id,
       invite_code, status, share_sintomas, share_notas, share_progreso, expires_at,
       created_at, responded_at)
    select v_patient, v_doctor,
           nullif(trim(coalesce(pu.raw_user_meta_data ->> 'full_name', '')), ''),
           coalesce(nullif(trim(coalesce(du.raw_user_meta_data ->> 'full_name', '')), ''), 'Médico de prueba'),
           lower(v_doctor_email), 'RM 12345',
           upper(substr(md5(v_patient::text || 'demo-medico'), 1, 8)), 'aceptado',
           true, true, true, null, now() - interval '20 days', now() - interval '20 days'
      from auth.users pu, auth.users du
     where pu.id = v_patient and du.id = v_doctor;
  end if;

  raise notice 'Demo cargada para % (cuidador %): % síntomas, % sesiones, % observaciones, % mensajes, % recordatorios.',
    v_patient_email, v_caregiver_email, n_sym, n_act, n_obs, n_cheer, n_rem;
end $$;

-- Verificación opcional (reemplaza el correo): días distintos con síntomas por mes.
-- select date_trunc('month', occurred_at at time zone 'America/Bogota') as mes,
--        count(distinct (occurred_at at time zone 'America/Bogota')::date) as dias,
--        count(*) as registros
--   from public.symptom_logs
--  where patient_id = (select id from auth.users where lower(email) = lower('PACIENTE@EJEMPLO.COM'))
--  group by 1 order by 1;
