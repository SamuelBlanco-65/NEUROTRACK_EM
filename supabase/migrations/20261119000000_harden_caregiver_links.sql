-- Endurecimiento del vínculo paciente-cuidador (hallazgos de la revisión del 2026-11-11).
-- Sin CLI de Supabase enlazado en este equipo: ejecutar a mano en el SQL Editor del proyecto.
-- Requiere haber corrido antes las migraciones anteriores (20261108 .. 20261118). Es seguro correrla
-- más de una vez. IMPORTANTE: ejecutarla ANTES de usar la versión nueva de la app (la app llama a
-- `create_caregiver_invite`, que no existe hasta correr este archivo).
--
-- Qué arregla:
--   1. El código de invitación del cuidador ya no lo elige el cliente: lo genera el servidor (8 caracteres,
--      como el del médico). Antes el cliente podía insertar filas con el código que quisiera y el índice
--      único respondía «ya existe», lo que servía para adivinar códigos ajenos sin pasar por el límite.
--   2. `claim_invite` hace atómico el límite de intentos (candado por usuario) y limpia intentos viejos.
--   3. El paciente ya no puede reescribir `caregiver_id`, el correo, el nombre ni el código de un vínculo
--      (antes podía marcar como «aceptado» a una cuenta que nunca lo reclamó).
--   4. En los mensajes de ánimo el paciente solo puede cambiar `read_at`.
--   5. Límites de longitud/rango en columnas que no los tenían (`not valid`: no revisa filas existentes).
--   6. Las funciones `security definer` fijan `search_path` terminado en `pg_temp`.

-- ---------------------------------------------------------------------------------------
-- 1. Crear la invitación en el servidor. Sin política de insert para el cliente.
-- ---------------------------------------------------------------------------------------
drop policy if exists "caregiver_links_insert_as_patient" on public.caregiver_links;

create or replace function public.create_caregiver_invite()
returns public.caregiver_links
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
  v_link public.caregiver_links;
  v_tries integer := 0;
  i integer;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Un candado por usuario: dos llamadas simultáneas no crean dos invitaciones pendientes.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 1));

  select * into v_link
    from public.caregiver_links
   where patient_id = v_user and status = 'pendiente' and caregiver_id is null
   order by created_at desc
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
      insert into public.caregiver_links (patient_id, invite_code)
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

revoke all on function public.create_caregiver_invite() from public, anon;
grant execute on function public.create_caregiver_invite() to authenticated;

-- ---------------------------------------------------------------------------------------
-- 2. claim_invite: límite de intentos atómico y limpieza de intentos de más de un día.
-- ---------------------------------------------------------------------------------------
create or replace function public.claim_invite(p_code text)
returns setof public.caregiver_links
language plpgsql
security definer
set search_path = public, auth, pg_temp
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

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

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

  update public.caregiver_links
     set caregiver_id = v_user,
         caregiver_email = left(v_email, 160),
         caregiver_name = left(v_name, 120),
         status = 'solicitado'
   where invite_code = upper(trim(p_code))
     and status = 'pendiente'
     and caregiver_id is null
     and patient_id <> v_user
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

revoke all on function public.claim_invite(text) from public, anon;
grant execute on function public.claim_invite(text) to authenticated;

-- ---------------------------------------------------------------------------------------
-- 3. caregiver_links: el paciente solo puede cambiar el estado (con transiciones válidas),
--    los permisos `share_*` y `responded_at`. RLS no restringe columnas, así que lo hace un trigger.
--    `claim_invite` actualiza con auth.uid() = el cuidador (distinto del paciente), así que no lo alcanza.
-- ---------------------------------------------------------------------------------------
create or replace function public.caregiver_links_guard_patient_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not distinct from old.patient_id then
    if new.patient_id is distinct from old.patient_id
       or new.caregiver_id is distinct from old.caregiver_id
       or new.caregiver_email is distinct from old.caregiver_email
       or new.caregiver_name is distinct from old.caregiver_name
       or new.invite_code is distinct from old.invite_code
       or new.created_at is distinct from old.created_at then
      raise exception 'patients_cannot_change_link_identity' using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
      if not (
        (old.status = 'solicitado' and new.status in ('aceptado', 'rechazado') and old.caregiver_id is not null)
        or (old.status = 'aceptado' and new.status = 'revocado')
      ) then
        raise exception 'invalid_status_transition' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Se llama «guard…» para que corra antes que `caregiver_links_set_patient_name` (orden alfabético).
drop trigger if exists caregiver_links_guard_patient_update on public.caregiver_links;
create trigger caregiver_links_guard_patient_update
  before update on public.caregiver_links
  for each row execute function public.caregiver_links_guard_patient_update();

-- ---------------------------------------------------------------------------------------
-- 4. caregiver_cheers: el paciente solo marca el mensaje como leído.
-- ---------------------------------------------------------------------------------------
create or replace function public.caregiver_cheers_guard_patient_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not distinct from old.patient_id then
    if new.link_id is distinct from old.link_id
       or new.caregiver_id is distinct from old.caregiver_id
       or new.patient_id is distinct from old.patient_id
       or new.message is distinct from old.message
       or new.created_at is distinct from old.created_at then
      raise exception 'patients_can_only_mark_cheer_read' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists caregiver_cheers_guard_patient_update on public.caregiver_cheers;
create trigger caregiver_cheers_guard_patient_update
  before update on public.caregiver_cheers
  for each row execute function public.caregiver_cheers_guard_patient_update();

-- ---------------------------------------------------------------------------------------
-- 5. Límites de longitud y de rango (`not valid`: las filas que ya existen no se revisan).
-- ---------------------------------------------------------------------------------------
alter table public.caregiver_links drop constraint if exists caregiver_links_text_len;
alter table public.caregiver_links
  add constraint caregiver_links_text_len check (
    char_length(coalesce(caregiver_name, '')) <= 120
    and char_length(coalesce(caregiver_email, '')) <= 160
    and char_length(coalesce(patient_name, '')) <= 120
    and char_length(invite_code) between 4 and 16
  ) not valid;

-- La app limita la nota a 300 caracteres; se deja margen.
alter table public.symptom_logs drop constraint if exists symptom_logs_note_len;
alter table public.symptom_logs
  add constraint symptom_logs_note_len check (note is null or char_length(note) <= 500) not valid;

-- Niveles reales de la app: 1 a 5 (Movimiento llega a 4).
alter table public.activity_progress drop constraint if exists activity_progress_level_range;
alter table public.activity_progress
  add constraint activity_progress_level_range check (level between 1 and 5) not valid;

-- ---------------------------------------------------------------------------------------
-- 6. search_path de las funciones security definer que no lo terminaban en pg_temp.
-- ---------------------------------------------------------------------------------------
alter function public.delete_my_account() set search_path = public, auth, pg_temp;
alter function public.caregiver_links_set_patient_name() set search_path = public, auth, pg_temp;
alter function public.doctor_links_guard_patient_update() set search_path = public, auth, pg_temp;
alter function public.create_doctor_invite() set search_path = public, pg_temp;
alter function public.claim_doctor_invite(text, text) set search_path = public, auth, pg_temp;
alter function public.mark_doctor_viewed(uuid) set search_path = public, pg_temp;
alter function public.shared_symptom_logs(uuid, timestamptz, timestamptz) set search_path = public, pg_temp;

-- ---------------------------------------------------------------------------------------
-- Comprobaciones sugeridas (con dos cuentas de prueba; sustituir los UUID):
--   Como paciente: insert into public.caregiver_links (patient_id, invite_code) values (auth.uid(), 'ABCD2345');
--     -> error de RLS (ya no hay política de insert; se usa create_caregiver_invite())
--   Como paciente: update public.caregiver_links set caregiver_id = '<otro uuid>', status = 'aceptado'
--                  where id = '<vínculo pendiente>';
--     -> error 42501 (patients_cannot_change_link_identity)
--   Como paciente: update public.caregiver_cheers set message = 'otro' where id = '<mensaje>';
--     -> error 42501 (patients_can_only_mark_cheer_read)
-- ---------------------------------------------------------------------------------------
