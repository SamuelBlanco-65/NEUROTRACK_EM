-- RF-008: recordatorios (medicación/eventos) con alternativa visual + háptica (RNF-009).
-- El paciente es siempre dueño de sus recordatorios; el cuidador solo puede crearlos/verlos/
-- marcarlos hechos si el vínculo está "aceptado" y el paciente autorizó "Mis recordatorios".
-- Sin CLI de Supabase enlazado en este equipo (ver docs/STATUS.md): ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase. Requiere haber corrido antes
-- 20261111000000_caregiver_links.sql.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null check (category in ('medicacion', 'cita', 'bienestar')),
  scheduled_at timestamptz not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'hecho')),
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reminders_patient_scheduled_idx
  on public.reminders (patient_id, scheduled_at);

alter table public.reminders enable row level security;

create policy "reminders_select_as_patient" on public.reminders
  for select using (auth.uid() = patient_id);

create policy "reminders_insert_as_patient" on public.reminders
  for insert with check (auth.uid() = patient_id and auth.uid() = created_by);

create policy "reminders_update_as_patient" on public.reminders
  for update using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

create policy "reminders_delete_as_patient" on public.reminders
  for delete using (auth.uid() = patient_id);

create policy "reminders_select_as_caregiver" on public.reminders
  for select using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = reminders.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_recordatorios = true
    )
  );

create policy "reminders_insert_as_caregiver" on public.reminders
  for insert with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = reminders.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_recordatorios = true
    )
  );

-- El cuidador solo puede marcar como hecho, no editar título/hora ni borrar lo del paciente.
create policy "reminders_mark_done_as_caregiver" on public.reminders
  for update using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = reminders.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_recordatorios = true
    )
  )
  with check (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = reminders.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_recordatorios = true
    )
  );
