-- Schema minimo para a aplicacao de ponto funcionar com Supabase.
-- Execute este script no SQL Editor do projeto.

create table if not exists public.employees (
  id text primary key,
  name text not null,
  role text not null,
  department text not null,
  work_hours_per_day integer not null default 8,
  avatar_color text not null default 'bg-indigo-600',
  registry_id text not null unique,
  password text not null,
  access_role text not null default 'colaborador'
    check (access_role in ('colaborador', 'gestor')),
  created_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id text primary key,
  employee_id text not null references public.employees (id) on delete cascade,
  timestamp timestamptz not null,
  type text not null
    check (type in ('entrada', 'almoco_saida', 'almoco_retorno', 'saida')),
  is_manual boolean not null default false,
  justification text,
  location jsonb,
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;
alter table public.time_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'public_employees_all'
  ) then
    create policy public_employees_all
      on public.employees
      for all
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'time_entries'
      and policyname = 'public_time_entries_all'
  ) then
    create policy public_time_entries_all
      on public.time_entries
      for all
      using (true)
      with check (true);
  end if;
end $$;

grant usage on schema public to anon, authenticated;
grant all privileges on table public.employees to anon, authenticated;
grant all privileges on table public.time_entries to anon, authenticated;
