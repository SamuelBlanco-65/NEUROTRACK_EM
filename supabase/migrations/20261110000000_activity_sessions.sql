-- RF-005: historial de sesiones de actividad completadas, para agregarlas por período
-- en la pantalla de Progreso (activity_progress solo guarda el nivel actual, no el historial).
-- RNF-012: el paciente es el único dueño de su historial; RLS restringe todo a auth.uid().
-- Sin CLI de Supabase enlazado en este equipo (ver docs/STATUS.md): ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase.

create table if not exists public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  area text not null check (area in ('memoria', 'atencion', 'movimiento')),
  completed_at timestamptz not null default now()
);

create index if not exists activity_sessions_patient_completed_idx
  on public.activity_sessions (patient_id, completed_at desc);

alter table public.activity_sessions enable row level security;

create policy "activity_sessions_select_own" on public.activity_sessions
  for select using (auth.uid() = patient_id);

create policy "activity_sessions_insert_own" on public.activity_sessions
  for insert with check (auth.uid() = patient_id);
