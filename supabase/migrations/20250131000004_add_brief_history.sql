-- Add brief history support
-- Remove primary key constraint and add id + created_at for versioning

-- First, create a new table with the updated schema
create table if not exists public.company_briefs_new (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  what_changed text[] not null default '{}',
  why_it_matters text[] not null default '{}',
  risks_to_watch text[] not null default '{}',
  where_you_can_help text[] not null default '{}',
  questions_for_call text[] not null default '{}',
  signal_ids_by_section jsonb default '{}',
  partner_take jsonb,
  insights jsonb,
  plays jsonb,
  confidence_modifiers jsonb,
  momentum_score numeric,
  momentum_status text check (momentum_status in ('green', 'yellow', 'red'))
);

-- Migrate existing data (if any) - take the latest brief per company
-- Only migrate if table exists and has data
do $$
begin
  -- Check if old table exists and has rows
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'company_briefs') then
    -- Check if optional columns exist, then migrate accordingly
    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'company_briefs' 
      and column_name = 'partner_take'
    ) then
      -- Full migration with all columns
      insert into public.company_briefs_new (
        id, company_id, created_at,
        what_changed, why_it_matters, risks_to_watch,
        where_you_can_help, questions_for_call, signal_ids_by_section,
        partner_take, insights, plays, confidence_modifiers,
        momentum_score, momentum_status
      )
      select 
        gen_random_uuid()::text as id,
        company_id,
        now() as created_at,
        what_changed,
        why_it_matters,
        risks_to_watch,
        where_you_can_help,
        questions_for_call,
        signal_ids_by_section,
        partner_take,
        insights,
        plays,
        confidence_modifiers,
        momentum_score,
        momentum_status
      from public.company_briefs
      on conflict do nothing;
    else
      -- Basic migration without optional columns
      insert into public.company_briefs_new (
        id, company_id, created_at,
        what_changed, why_it_matters, risks_to_watch,
        where_you_can_help, questions_for_call, signal_ids_by_section,
        partner_take, insights, plays, confidence_modifiers,
        momentum_score, momentum_status
      )
      select 
        gen_random_uuid()::text as id,
        company_id,
        now() as created_at,
        what_changed,
        why_it_matters,
        risks_to_watch,
        where_you_can_help,
        questions_for_call,
        signal_ids_by_section,
        null as partner_take,
        null as insights,
        null as plays,
        null as confidence_modifiers,
        null as momentum_score,
        null as momentum_status
      from public.company_briefs
      on conflict do nothing;
    end if;
  end if;
end $$;

-- Drop old table
drop table if exists public.company_briefs;

-- Rename new table to original name
alter table public.company_briefs_new rename to company_briefs;

-- Add indexes
create index if not exists company_briefs_company_id_idx on public.company_briefs(company_id);
create index if not exists company_briefs_created_at_idx on public.company_briefs(created_at desc);
create index if not exists company_briefs_momentum_score_idx on public.company_briefs(momentum_score);
