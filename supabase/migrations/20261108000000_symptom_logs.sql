-- RF-001 / RF-002: registro y calendario de síntomas del paciente.
-- RNF-012: el paciente es el único dueño de sus datos; RLS restringe todo a auth.uid().
-- Sin CLI de Supabase enlazado en este equipo: ejecutar este archivo
-- a mano en el SQL Editor del proyecto de Supabase.

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  symptom_type text not null check (symptom_type in ('fatiga', 'vision_borrosa', 'dolor', 'debilidad', 'equilibrio', 'otro')),
  severity text not null check (severity in ('leve', 'moderado', 'fuerte')),
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists symptom_logs_patient_occurred_idx
  on public.symptom_logs (patient_id, occurred_at desc);

alter table public.symptom_logs enable row level security;

create policy "symptom_logs_select_own" on public.symptom_logs
  for select using (auth.uid() = patient_id);

create policy "symptom_logs_insert_own" on public.symptom_logs
  for insert with check (auth.uid() = patient_id);

create policy "symptom_logs_update_own" on public.symptom_logs
  for update using (auth.uid() = patient_id);

create policy "symptom_logs_delete_own" on public.symptom_logs
  for delete using (auth.uid() = patient_id);
