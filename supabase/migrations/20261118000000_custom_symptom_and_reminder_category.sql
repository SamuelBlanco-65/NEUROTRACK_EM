-- Campos personalizados: el paciente puede nombrar un síntoma «Otro» con sus propias palabras y el
-- cuidador puede crear recordatorios de una categoría propia (no solo medicación, cita o bienestar).
-- Sin CLI de Supabase enlazado en este equipo: ejecutar a mano en el SQL Editor del proyecto.
-- Es seguro repetirla. IMPORTANTE: ejecutarla ANTES de usar la versión nueva de la app (la app pide
-- las columnas nuevas al leer síntomas y recordatorios).

-- 1. Síntomas: nombre propio para el tipo «otro».
alter table public.symptom_logs add column if not exists custom_label text;
alter table public.symptom_logs drop constraint if exists symptom_logs_custom_label_len;
alter table public.symptom_logs
  add constraint symptom_logs_custom_label_len
  check (custom_label is null or char_length(custom_label) between 1 and 60);

-- 2. Recordatorios: categoría «otro» con nombre propio.
alter table public.reminders add column if not exists category_label text;
alter table public.reminders drop constraint if exists reminders_category_label_len;
alter table public.reminders
  add constraint reminders_category_label_len
  check (category_label is null or char_length(category_label) between 1 and 40);

alter table public.reminders drop constraint if exists reminders_category_check;
alter table public.reminders
  add constraint reminders_category_check
  check (category in ('medicacion', 'cita', 'bienestar', 'otro'));

-- 3. El cuidador solo puede marcar «hecho»: la guarda también cubre la columna nueva.
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
       or new.category_label is distinct from old.category_label
       or new.scheduled_at is distinct from old.scheduled_at
       or new.created_at is distinct from old.created_at then
      raise exception 'caregivers_can_only_mark_done' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
