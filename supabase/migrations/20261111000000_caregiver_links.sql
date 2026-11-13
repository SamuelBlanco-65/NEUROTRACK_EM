-- RF-012: vinculación paciente-cuidador con consentimiento explícito.
-- El paciente genera un código; el cuidador lo reclama ("solicitado"); solo el paciente
-- puede pasar el vínculo a "aceptado" (o "rechazado"/"revocado" en cualquier momento después).
-- Sin CLI de Supabase enlazado en este equipo: ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase.

create table if not exists public.caregiver_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  caregiver_id uuid references auth.users (id) on delete cascade,
  caregiver_email text,
  caregiver_name text,
  invite_code text not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'solicitado', 'aceptado', 'rechazado', 'revocado')),
  share_sintomas boolean not null default true,
  share_progreso boolean not null default true,
  share_recordatorios boolean not null default true,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists caregiver_links_patient_idx on public.caregiver_links (patient_id);
create index if not exists caregiver_links_caregiver_idx on public.caregiver_links (caregiver_id);

alter table public.caregiver_links enable row level security;

-- El paciente ve y administra todos sus propios vínculos (en cualquier estado).
create policy "caregiver_links_select_as_patient" on public.caregiver_links
  for select using (auth.uid() = patient_id);

create policy "caregiver_links_insert_as_patient" on public.caregiver_links
  for insert with check (auth.uid() = patient_id and caregiver_id is null and status = 'pendiente');

create policy "caregiver_links_update_as_patient" on public.caregiver_links
  for update using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

create policy "caregiver_links_delete_as_patient" on public.caregiver_links
  for delete using (auth.uid() = patient_id);

-- El cuidador ve los vínculos que ya reclamó o que le fueron aceptados.
create policy "caregiver_links_select_as_caregiver" on public.caregiver_links
  for select using (auth.uid() = caregiver_id);

-- Cualquier cuidador autenticado que conozca el código puede "reclamarlo" (enviar la
-- solicitud), pero solo mientras esté pendiente y sin reclamar, y solo para marcarse a sí
-- mismo como solicitante. El paso de "solicitado" a "aceptado" queda exclusivamente en manos
-- del paciente (política de arriba), que es el consentimiento explícito que exige RF-012.
create policy "caregiver_links_select_unclaimed_by_code" on public.caregiver_links
  for select using (status = 'pendiente' and caregiver_id is null);

create policy "caregiver_links_claim_as_caregiver" on public.caregiver_links
  for update using (status = 'pendiente' and caregiver_id is null)
  with check (auth.uid() = caregiver_id and status = 'solicitado');
