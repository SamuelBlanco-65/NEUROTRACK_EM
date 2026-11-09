-- RF-006: módulo del cuidador — observaciones privadas, mensajes de ánimo y acceso de
-- lectura al progreso del paciente (solo si el vínculo está "aceptado" y el paciente
-- autorizó ese permiso en caregiver_links). RNF-012: todo gateado por RLS.
-- Sin CLI de Supabase enlazado en este equipo (ver docs/STATUS.md): ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase. Requiere haber corrido antes
-- 20261111000000_caregiver_links.sql, 20261109000000_activity_progress.sql y
-- 20261110000000_activity_sessions.sql.

-- Bitácora privada del cuidador: notas que solo él puede ver (y comparte en consulta médica
-- por fuera de la app). El paciente NO tiene acceso, por diseño (ver docs/diseno/stitch-export).
create table if not exists public.caregiver_observations (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.caregiver_links (id) on delete cascade,
  caregiver_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('animo', 'movilidad', 'fatiga', 'medicacion', 'otro')),
  note text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists caregiver_observations_caregiver_idx
  on public.caregiver_observations (caregiver_id, occurred_at desc);

alter table public.caregiver_observations enable row level security;

create policy "caregiver_observations_select_own" on public.caregiver_observations
  for select using (auth.uid() = caregiver_id);

create policy "caregiver_observations_insert_own" on public.caregiver_observations
  for insert with check (
    auth.uid() = caregiver_id
    and exists (
      select 1 from public.caregiver_links cl
      where cl.id = link_id and cl.caregiver_id = auth.uid() and cl.status = 'aceptado'
    )
  );

create policy "caregiver_observations_delete_own" on public.caregiver_observations
  for delete using (auth.uid() = caregiver_id);

-- Mensajes de ánimo del cuidador al paciente: cortos, de una vía, visibles por el paciente.
create table if not exists public.caregiver_cheers (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.caregiver_links (id) on delete cascade,
  caregiver_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists caregiver_cheers_patient_idx
  on public.caregiver_cheers (patient_id, created_at desc);

alter table public.caregiver_cheers enable row level security;

create policy "caregiver_cheers_insert_as_caregiver" on public.caregiver_cheers
  for insert with check (
    auth.uid() = caregiver_id
    and exists (
      select 1 from public.caregiver_links cl
      where cl.id = link_id and cl.caregiver_id = auth.uid() and cl.patient_id = caregiver_cheers.patient_id
        and cl.status = 'aceptado'
    )
  );

create policy "caregiver_cheers_select_as_caregiver" on public.caregiver_cheers
  for select using (auth.uid() = caregiver_id);

create policy "caregiver_cheers_select_as_patient" on public.caregiver_cheers
  for select using (auth.uid() = patient_id);

create policy "caregiver_cheers_update_as_patient" on public.caregiver_cheers
  for update using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

-- Acceso de lectura del cuidador al progreso de actividades, solo con vínculo aceptado y
-- el permiso "Mi progreso" activo. Estas dos políticas se SUMAN a las ya existentes de
-- "select own" del paciente (ver 20261109000000 y 20261110000000); no las reemplazan.
create policy "activity_progress_select_as_caregiver" on public.activity_progress
  for select using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = activity_progress.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_progreso = true
    )
  );

create policy "activity_sessions_select_as_caregiver" on public.activity_sessions
  for select using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = activity_sessions.patient_id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'aceptado'
        and cl.share_progreso = true
    )
  );
