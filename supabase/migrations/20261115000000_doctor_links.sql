-- REC-003: perfil del médico tratante (solo lectura, autorizado por el paciente, con caducidad).
-- También arregla el permiso «Síntomas» del cuidador: `share_sintomas` no se aplicaba en ninguna política
-- porque `symptom_logs` solo tenía políticas del propio paciente.
-- Sin CLI de Supabase enlazado en este equipo: ejecutar este archivo a mano en el
-- SQL Editor. Requiere haber corrido antes las migraciones anteriores (20261108 .. 20261114).
-- Es seguro correrlo más de una vez.
--
-- Endurecido tras la auditoría de seguridad del 2026-11-11: el código de invitación lo genera el
-- servidor (no el cliente), el límite de intentos es atómico, el paciente no puede reescribir la
-- identidad del médico y el nombre del paciente solo se copia al aceptar.

-- ---------------------------------------------------------------------------------------
-- 1. doctor_links: tabla propia (no un `role` en caregiver_links). Las políticas del cuidador
--    (recordatorios, mensajes de ánimo, observaciones) solo exigen `status = 'aceptado'` y le
--    darían al médico esos poderes de escritura.
-- ---------------------------------------------------------------------------------------
create table if not exists public.doctor_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  doctor_id uuid references auth.users (id) on delete cascade,
  -- Se copia desde la cuenta del paciente SOLO al aceptar (trigger), nunca al reclamar el código.
  patient_name text,
  doctor_name text,
  doctor_email text,
  -- Registro profesional AUTODECLARADO por el médico: Neurotrack EM no lo verifica.
  professional_id text,
  invite_code text not null,
  -- La invitación pendiente caduca a los 7 días.
  invite_expires_at timestamptz not null default now() + interval '7 days',
  status text not null default 'pendiente'
    check (status in ('pendiente', 'solicitado', 'aceptado', 'rechazado', 'revocado')),
  share_sintomas boolean not null default true,
  -- Las notas libres son lo más íntimo: apagadas por defecto.
  share_notas boolean not null default false,
  share_progreso boolean not null default true,
  -- null = sin fecha de fin. Pasada esta fecha el médico deja de ver datos aunque el vínculo siga «aceptado».
  expires_at timestamptz,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint doctor_links_text_len check (
    char_length(coalesce(doctor_name, '')) <= 120
    and char_length(coalesce(doctor_email, '')) <= 160
    and char_length(coalesce(patient_name, '')) <= 120
    and char_length(coalesce(professional_id, '')) <= 40
  )
);

-- Si la tabla ya existía de una corrida anterior, añadir la columna nueva.
alter table public.doctor_links
  add column if not exists invite_expires_at timestamptz not null default now() + interval '7 days';

create index if not exists doctor_links_patient_idx on public.doctor_links (patient_id);
create index if not exists doctor_links_doctor_idx on public.doctor_links (doctor_id);

-- Un código pendiente es único (los reclamados/rechazados conservan el suyo sin estorbar).
create unique index if not exists doctor_links_pending_code_uniq
  on public.doctor_links (invite_code)
  where status = 'pendiente';

alter table public.doctor_links enable row level security;

drop policy if exists "doctor_links_select_as_patient" on public.doctor_links;
create policy "doctor_links_select_as_patient" on public.doctor_links
  for select using (auth.uid() = patient_id);

-- SIN política de insert: si el cliente pudiera elegir `invite_code`, podría probar códigos sin
-- límite (el índice único respondería «ya existe») y esquivar `claim_attempts`. La invitación
-- se crea con `create_doctor_invite()`, que genera el código en el servidor.
drop policy if exists "doctor_links_insert_as_patient" on public.doctor_links;

drop policy if exists "doctor_links_update_as_patient" on public.doctor_links;
create policy "doctor_links_update_as_patient" on public.doctor_links
  for update using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

drop policy if exists "doctor_links_delete_as_patient" on public.doctor_links;
create policy "doctor_links_delete_as_patient" on public.doctor_links
  for delete using (auth.uid() = patient_id);

-- El médico solo LEE sus vínculos vivos (solicitado o aceptado): al rechazar o revocar, la fila
-- deja de ser visible para él y no conserva el nombre del paciente. No puede modificarlos:
-- reclama con `claim_doctor_invite` y marca su visita con `mark_doctor_viewed`.
drop policy if exists "doctor_links_select_as_doctor" on public.doctor_links;
create policy "doctor_links_select_as_doctor" on public.doctor_links
  for select using (auth.uid() = doctor_id and status in ('solicitado', 'aceptado'));

-- ---------------------------------------------------------------------------------------
-- 2. Protección de columnas. RLS no restringe columnas: sin esto, el paciente podría escribir
--    `doctor_id` de un tercero, un `status` inventado o el nombre/registro del médico, y el
--    «médico» recibiría un paciente falso con texto elegido por el atacante.
--    - Cuando el que actualiza es el paciente: solo puede cambiar `status` (con transiciones
--      válidas), `share_*`, `expires_at` y `responded_at`.
--    - Al pasar a «aceptado» se copia el nombre del paciente desde su cuenta (no desde el cliente).
--    Las funciones del médico (claim/mark_viewed) actualizan con `auth.uid()` distinto del
--    paciente, así que esta guarda no las alcanza.
-- ---------------------------------------------------------------------------------------
create or replace function public.doctor_links_guard_patient_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is not distinct from old.patient_id then
    if new.patient_id is distinct from old.patient_id
       or new.doctor_id is distinct from old.doctor_id
       or new.doctor_name is distinct from old.doctor_name
       or new.doctor_email is distinct from old.doctor_email
       or new.professional_id is distinct from old.professional_id
       or new.patient_name is distinct from old.patient_name
       or new.invite_code is distinct from old.invite_code
       or new.invite_expires_at is distinct from old.invite_expires_at
       or new.last_viewed_at is distinct from old.last_viewed_at
       or new.created_at is distinct from old.created_at then
      raise exception 'patients_cannot_change_link_identity' using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
      if not (
        (old.status = 'solicitado' and new.status in ('aceptado', 'rechazado') and old.doctor_id is not null)
        or (old.status = 'aceptado' and new.status = 'revocado')
      ) then
        raise exception 'invalid_status_transition' using errcode = '42501';
      end if;
    end if;

    if new.status = 'aceptado' and old.status is distinct from 'aceptado' then
      new.patient_name := (
        select nullif(trim(coalesce(pu.raw_user_meta_data ->> 'full_name', '')), '')
          from auth.users pu where pu.id = old.patient_id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists doctor_links_guard_patient_update on public.doctor_links;
create trigger doctor_links_guard_patient_update
  before update on public.doctor_links
  for each row execute function public.doctor_links_guard_patient_update();

-- ---------------------------------------------------------------------------------------
-- 3. Crear la invitación: el código lo genera el servidor (8 caracteres, 32^8 ≈ 1.1e12 combinaciones,
--    sin 0/O/1/I). El paciente tiene como máximo una invitación vigente a la vez.
-- ---------------------------------------------------------------------------------------
create or replace function public.create_doctor_invite()
returns public.doctor_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
  v_link public.doctor_links;
  v_tries integer := 0;
  i integer;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Las invitaciones pendientes vencidas se descartan.
  delete from public.doctor_links
   where patient_id = v_user and status = 'pendiente' and doctor_id is null and invite_expires_at <= now();

  select * into v_link
    from public.doctor_links
   where patient_id = v_user and status = 'pendiente' and doctor_id is null
   limit 1;
  if found then
    return v_link;
  end if;

  loop
    -- gen_random_uuid() es criptográficamente aleatorio; 256 es múltiplo de 32, sin sesgo.
    v_bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;

    begin
      insert into public.doctor_links (patient_id, invite_code)
      values (v_user, v_code)
      returning * into v_link;
      return v_link;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 5 then
        raise;
      end if;
    end;
  end loop;
end;
$$;

revoke all on function public.create_doctor_invite() from public, anon;
grant execute on function public.create_doctor_invite() to authenticated;

-- ---------------------------------------------------------------------------------------
-- 4. Reclamar una invitación de médico (misma mecánica y mismo límite de intentos que
--    `claim_invite`, que ya guarda los fallos en `claim_attempts`). Un candado por usuario hace
--    atómico el conteo: sin él, una ráfaga de llamadas simultáneas superaba el límite.
-- ---------------------------------------------------------------------------------------
create or replace function public.claim_doctor_invite(p_code text, p_professional_id text default null)
returns setof public.doctor_links
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_name text;
  v_recent integer;
  v_link public.doctor_links;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  -- Limpieza: los intentos de más de un día no sirven para el límite.
  delete from public.claim_attempts where attempted_at < now() - interval '1 day';

  select count(*) into v_recent
    from public.claim_attempts
   where user_id = v_user and attempted_at > now() - interval '15 minutes';

  if v_recent >= 10 then
    raise exception 'rate_limited' using errcode = 'P0003';
  end if;

  select u.email, nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), '')
    into v_email, v_name
    from auth.users u
   where u.id = v_user;

  -- No se copia el nombre del paciente aquí: solo se conoce al aceptar (trigger de la sección 2).
  update public.doctor_links dl
     set doctor_id = v_user,
         doctor_email = v_email,
         doctor_name = v_name,
         professional_id = left(nullif(trim(coalesce(p_professional_id, '')), ''), 40),
         status = 'solicitado'
   where dl.invite_code = upper(trim(p_code))
     and dl.status = 'pendiente'
     and dl.doctor_id is null
     and dl.invite_expires_at > now()
     and dl.patient_id <> v_user
  returning * into v_link;

  if v_link.id is null then
    -- Solo se registran los intentos fallidos (si lanzáramos una excepción, el insert se
    -- desharía): devolvemos un conjunto vacío y el cliente lo trata como «código inválido».
    insert into public.claim_attempts (user_id) values (v_user);
    return;
  end if;

  return next v_link;
end;
$$;

revoke all on function public.claim_doctor_invite(text, text) from public, anon;
grant execute on function public.claim_doctor_invite(text, text) to authenticated;

-- ---------------------------------------------------------------------------------------
-- 5. «Último acceso» visible para el paciente. Solo cuenta si el vínculo sigue vigente.
-- ---------------------------------------------------------------------------------------
create or replace function public.mark_doctor_viewed(p_link uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.doctor_links
     set last_viewed_at = now()
   where id = p_link
     and doctor_id = auth.uid()
     and status = 'aceptado'
     and (expires_at is null or expires_at > now());
$$;

revoke all on function public.mark_doctor_viewed(uuid) from public, anon;
grant execute on function public.mark_doctor_viewed(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------
-- 6. Actividades: el médico lee `activity_progress` y `activity_sessions` del paciente solo con
--    vínculo aceptado, `share_progreso` y sin caducar. Se SUMA a las políticas del paciente y del
--    cuidador (no las reemplaza).
-- ---------------------------------------------------------------------------------------
drop policy if exists "activity_progress_select_as_doctor" on public.activity_progress;
create policy "activity_progress_select_as_doctor" on public.activity_progress
  for select using (
    exists (
      select 1 from public.doctor_links dl
      where dl.patient_id = activity_progress.patient_id
        and dl.doctor_id = auth.uid()
        and dl.status = 'aceptado'
        and dl.share_progreso = true
        and (dl.expires_at is null or dl.expires_at > now())
    )
  );

drop policy if exists "activity_sessions_select_as_doctor" on public.activity_sessions;
create policy "activity_sessions_select_as_doctor" on public.activity_sessions
  for select using (
    exists (
      select 1 from public.doctor_links dl
      where dl.patient_id = activity_sessions.patient_id
        and dl.doctor_id = auth.uid()
        and dl.status = 'aceptado'
        and dl.share_progreso = true
        and (dl.expires_at is null or dl.expires_at > now())
    )
  );

-- ---------------------------------------------------------------------------------------
-- 7. Síntomas: SIN política directa sobre `symptom_logs`. RLS filtra filas, no columnas, y la
--    nota (`note`) es un dato aparte que el paciente autoriza por separado. Esta función es la
--    única vía de lectura para terceros:
--      - cuidador aceptado con `share_sintomas`  -> filas SIN nota (arregla el permiso que antes no hacía nada);
--      - médico aceptado, vigente y con `share_sintomas` -> filas, y la nota solo si TODOS sus vínculos
--        vigentes con ese paciente tienen `share_notas` (el más restrictivo manda).
--    Si quien llama no tiene acceso, devuelve cero filas (no lanza error). El historial se limita a
--    los últimos 2 años (minimización de datos).
-- ---------------------------------------------------------------------------------------
create or replace function public.shared_symptom_logs(p_patient uuid, p_from timestamptz, p_to timestamptz)
returns table (
  id uuid,
  symptom_type text,
  severity text,
  note text,
  occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with access as (
    select
      exists (
        select 1 from public.caregiver_links cl
        where cl.patient_id = p_patient
          and cl.caregiver_id = auth.uid()
          and cl.status = 'aceptado'
          and cl.share_sintomas = true
      ) as caregiver_ok,
      -- null = el médico no tiene acceso; true/false = tiene acceso y esto dice si ve las notas.
      (
        select bool_and(dl.share_notas) from public.doctor_links dl
        where dl.patient_id = p_patient
          and dl.doctor_id = auth.uid()
          and dl.status = 'aceptado'
          and dl.share_sintomas = true
          and (dl.expires_at is null or dl.expires_at > now())
      ) as doctor_notes
  )
  select s.id, s.symptom_type, s.severity,
         case when a.doctor_notes is true then s.note else null end,
         s.occurred_at
    from public.symptom_logs s
    cross join access a
   where s.patient_id = p_patient
     and s.occurred_at >= greatest(p_from, now() - interval '2 years')
     and s.occurred_at < p_to
     and (a.caregiver_ok or a.doctor_notes is not null)
   order by s.occurred_at;
$$;

revoke all on function public.shared_symptom_logs(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.shared_symptom_logs(uuid, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------------------
-- Comprobaciones sugeridas (con dos cuentas de prueba; sustituir los UUID):
--   select * from public.shared_symptom_logs('<paciente>', now() - interval '60 days', now());
--     como médico sin vínculo        -> 0 filas
--     como médico con notas apagadas -> filas con note = null
--     como médico con notas activas  -> filas con note
--     tras revocar o con expires_at en el pasado -> 0 filas
--   Como paciente: update public.doctor_links set doctor_id = '<otro uuid>' where id = '<vínculo>';
--     -> error 42501 (patients_cannot_change_link_identity)
-- ---------------------------------------------------------------------------------------
