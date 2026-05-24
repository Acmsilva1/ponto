begin;

alter table public.time_entries
  add column if not exists journey text not null default 'official';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'time_entries_journey_check'
  ) then
    alter table public.time_entries
      add constraint time_entries_journey_check
      check (journey in ('official', 'extra'));
  end if;
end $$;

comment on column public.time_entries.journey is 'official | extra';

commit;
