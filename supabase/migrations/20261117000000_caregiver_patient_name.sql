-- Nombre del paciente visible para su cuidador (como ya hace doctor_links.patient_name).
-- El cuidador no puede leer auth.users, así que el nombre se copia en la fila del vínculo.
-- Solo se llena cuando el vínculo está ACEPTADO (el paciente ya consintió); en cualquier otro
-- estado queda en null, para que quien solo conozca un código de invitación no vea el nombre.
-- Lo calcula un trigger a partir de patient_id, así que nadie puede escribir un nombre falso.
-- Sin CLI de Supabase enlazado en este equipo: ejecutar a mano en el SQL Editor. Es seguro repetirla.

alter table public.caregiver_links add column if not exists patient_name text;

create or replace function public.caregiver_links_set_patient_name()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status = 'aceptado' then
    new.patient_name := (
      select nullif(trim(coalesce(pu.raw_user_meta_data ->> 'full_name', '')), '')
        from auth.users pu where pu.id = new.patient_id
    );
  else
    new.patient_name := null;
  end if;
  return new;
end;
$$;

drop trigger if exists caregiver_links_set_patient_name on public.caregiver_links;
create trigger caregiver_links_set_patient_name
  before insert or update on public.caregiver_links
  for each row execute function public.caregiver_links_set_patient_name();

-- Rellena los vínculos aceptados que ya existen (el trigger calcula el nombre al actualizar).
update public.caregiver_links set status = status where status = 'aceptado';
