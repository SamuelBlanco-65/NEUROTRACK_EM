-- RF-003 / RF-004: actividades de estimulación cognitiva y motriz, con nivel progresivo.
-- RNF-012: el paciente es el único dueño de su progreso; RLS restringe todo a auth.uid().
-- Sin CLI de Supabase enlazado en este equipo (ver docs/STATUS.md): ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase.

create table if not exists public.activity_progress (
  patient_id uuid not null references auth.users (id) on delete cascade,
  area text not null check (area in ('memoria', 'atencion', 'movimiento')),
  level integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (patient_id, area)
);

alter table public.activity_progress enable row level security;

create policy "activity_progress_select_own" on public.activity_progress
  for select using (auth.uid() = patient_id);

create policy "activity_progress_insert_own" on public.activity_progress
  for insert with check (auth.uid() = patient_id);

create policy "activity_progress_update_own" on public.activity_progress
  for update using (auth.uid() = patient_id);
