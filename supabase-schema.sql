begin;

create extension if not exists pgcrypto;

drop table if exists public.password_reset_requests cascade;
drop table if exists public.justifications cascade;
drop table if exists public.time_entries cascade;
drop table if exists public.employees cascade;
drop function if exists public.touch_updated_at() cascade;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department text not null,
  work_hours_per_day integer not null default 8 check (work_hours_per_day > 0),
  avatar_color text not null default 'bg-indigo-600',
  registry_id text not null unique,
  password_hash text not null,
  access_role text not null default 'colaborador' check (access_role in ('colaborador', 'gestor')),
  is_master boolean not null default false,
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  timestamp timestamptz not null,
  type text not null check (type in ('entrada', 'almoco_saida', 'almoco_retorno', 'saida', 'extra')),
  is_manual boolean not null default false,
  justification text,
  location jsonb,
  created_at timestamptz not null default now()
);

create table public.justifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  time_entry_id uuid references public.time_entries (id) on delete set null,
  date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.employees (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  temporary_password_hash text not null,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index employees_registry_id_idx on public.employees (registry_id);
create index time_entries_employee_id_idx on public.time_entries (employee_id);
create index time_entries_timestamp_idx on public.time_entries (timestamp desc);
create index justifications_employee_id_idx on public.justifications (employee_id);
create index justifications_date_idx on public.justifications (date desc);
create index password_reset_requests_employee_id_idx on public.password_reset_requests (employee_id);
create index password_reset_requests_requested_at_idx on public.password_reset_requests (requested_at desc);

create trigger employees_touch_updated_at
before update on public.employees
for each row
execute function public.touch_updated_at();

commit;
