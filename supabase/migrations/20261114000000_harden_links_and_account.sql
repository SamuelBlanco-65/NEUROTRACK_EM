-- Endurecimiento de seguridad + borrado de cuenta (hallazgos de la auditoría 2026-11-10).
-- Sin CLI de Supabase enlazado en este equipo (ver docs/STATUS.md): ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase. Requiere haber corrido antes todas las
-- migraciones anteriores (20261108 .. 20261113). Es seguro correrlo más de una vez.

-- ---------------------------------------------------------------------------------------
-- 1. caregiver_links: ya no se puede listar ni reescribir una invitación ajena.
--    Antes, `select_unclaimed_by_code` no comparaba el código: cualquiera (incluso sin sesión)
--    podía leer todos los códigos pendientes y los patient_id; y la política de reclamo dejaba
--    al cuidador reescribir patient_id, permisos y nombre/correo. Ahora reclamar solo se puede
--    con la función `claim_invite`, que fija esos campos en el servidor.
-- ---------------------------------------------------------------------------------------
drop policy if exists "caregiver_links_select_unclaimed_by_code" on public.caregiver_links;
drop policy if exists "caregiver_links_claim_as_caregiver" on public.caregiver_links;

-- Un código pendiente es único (los reclamados/rechazados conservan el suyo sin estorbar).
create unique index if not exists caregiver_links_pending_code_uniq
  on public.caregiver_links (invite_code)
  where status = 'pendiente';

-- Intentos de reclamo, para frenar la adivinanza de códigos. Sin políticas: solo la función
-- `claim_invite` (security definer) puede leer o escribir aquí.
create table if not exists public.claim_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);

create index if not exists claim_attempts_user_idx on public.claim_attempts (user_id, attempted_at desc);

alter table public.claim_attempts enable row level security;

create or replace function public.claim_invite(p_code text)
returns setof public.caregiver_links
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_name text;
  v_recent integer;
  v_link public.caregiver_links;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

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

  update public.caregiver_links
     set caregiver_id = v_user,
         caregiver_email = v_email,
         caregiver_name = v_name,
         status = 'solicitado'
   where invite_code = upper(trim(p_code))
     and status = 'pendiente'
     and caregiver_id is null
     and patient_id <> v_user
  returning * into v_link;

  if v_link.id is null then
    -- Solo se registran los intentos fallidos (si lanzáramos una excepción, el insert se
    -- desharía): devolvemos un conjunto vacío y el cliente lo trata como "código inválido".
    insert into public.claim_attempts (user_id) values (v_user);
    return;
  end if;

  return next v_link;
end;
$$;

revoke all on function public.claim_invite(text) from public, anon;
grant execute on function public.claim_invite(text) to authenticated;

-- ---------------------------------------------------------------------------------------
-- 2. reminders: el cuidador solo puede marcar "hecho". RLS no restringe columnas, así que
--    un trigger rechaza cualquier otro cambio hecho por quien no es el paciente.
-- ---------------------------------------------------------------------------------------
create or replace function public.reminders_guard_caregiver_update()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is distinct from old.patient_id then
    if new.patient_id is distinct from old.patient_id
       or new.created_by is distinct from old.created_by
       or new.title is distinct from old.title
       or new.category is distinct from old.category
       or new.scheduled_at is distinct from old.scheduled_at
       or new.created_at is distinct from old.created_at then
      raise exception 'caregivers_can_only_mark_done' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reminders_guard_caregiver_update on public.reminders;
create trigger reminders_guard_caregiver_update
  before update on public.reminders
  for each row execute function public.reminders_guard_caregiver_update();

-- ---------------------------------------------------------------------------------------
-- 3. caregiver_observations: el patient_id debe ser el del vínculo (antes solo se miraba link_id).
-- ---------------------------------------------------------------------------------------
drop policy if exists "caregiver_observations_insert_own" on public.caregiver_observations;

create policy "caregiver_observations_insert_own" on public.caregiver_observations
  for insert with check (
    auth.uid() = caregiver_id
    and exists (
      select 1 from public.caregiver_links cl
      where cl.id = link_id
        and cl.caregiver_id = auth.uid()
        and cl.patient_id = caregiver_observations.patient_id
        and cl.status = 'aceptado'
    )
  );

-- ---------------------------------------------------------------------------------------
-- 4. Longitudes máximas de los textos libres (`not valid`: no revisa filas ya existentes).
-- ---------------------------------------------------------------------------------------
alter table public.caregiver_observations drop constraint if exists caregiver_observations_note_len;
alter table public.caregiver_observations
  add constraint caregiver_observations_note_len check (char_length(note) between 1 and 1000) not valid;

alter table public.caregiver_cheers drop constraint if exists caregiver_cheers_message_len;
alter table public.caregiver_cheers
  add constraint caregiver_cheers_message_len check (char_length(message) between 1 and 280) not valid;

alter table public.reminders drop constraint if exists reminders_title_len;
alter table public.reminders
  add constraint reminders_title_len check (char_length(title) between 1 and 120) not valid;

-- ---------------------------------------------------------------------------------------
-- 5. Borrado de cuenta (exigido por Google Play y App Store). Todas las tablas del dominio
--    referencian auth.users con `on delete cascade`, así que borrar al usuario borra todo.
-- ---------------------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
