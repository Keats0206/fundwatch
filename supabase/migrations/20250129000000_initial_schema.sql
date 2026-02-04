-- FundWatch initial schema. Run in Supabase SQL Editor or via Supabase CLI.

-- Funds (Mantis, Thrive, USV, etc.)
create table if not exists public.funds (
  id text primary key,
  name text not null
);

-- Portfolio companies per fund
create table if not exists public.companies (
  id text primary key,
  fund_id text not null references public.funds(id) on delete cascade,
  name text not null,
  domain text not null,
  health text not null check (health in ('green', 'yellow', 'red')),
  last_updated timestamptz not null,
  attention_reason text,
  highlight_chips text[] default '{}'
);

create index if not exists companies_fund_id_idx on public.companies(fund_id);

-- Signals (careers, LinkedIn, news, blog)
create table if not exists public.signals (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  source text not null check (source in ('Careers', 'LinkedIn', 'News', 'Blog')),
  timestamp timestamptz not null,
  summary text not null,
  external_url text not null
);

create index if not exists signals_company_id_idx on public.signals(company_id);

-- Open roles
create table if not exists public.roles (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  title text not null,
  role_type text not null check (role_type in ('Engineering', 'GTM', 'Leadership', 'Other')),
  source text not null check (source in ('LinkedIn', 'Careers')),
  first_seen date not null,
  status text not null check (status in ('new', 'removed', 'ongoing')),
  high_priority boolean default false
);

create index if not exists roles_company_id_idx on public.roles(company_id);

-- Person changes (joined/left)
create table if not exists public.person_changes (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  role text not null,
  change_type text not null check (change_type in ('joined', 'left')),
  source_url text not null
);

create index if not exists person_changes_company_id_idx on public.person_changes(company_id);

-- Alerts
create table if not exists public.alerts (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  type text not null check (type in ('hiring_pause', 'exec_departure', 'no_activity', 'negative_press', 'role_churn')),
  why_it_matters text not null,
  created_at timestamptz not null
);

create index if not exists alerts_company_id_idx on public.alerts(company_id);

-- Company briefs (one per company)
create table if not exists public.company_briefs (
  company_id text primary key references public.companies(id) on delete cascade,
  what_changed text[] not null default '{}',
  why_it_matters text[] not null default '{}',
  risks_to_watch text[] not null default '{}',
  where_you_can_help text[] not null default '{}',
  questions_for_call text[] not null default '{}',
  signal_ids_by_section jsonb default '{}'
);

-- Tasks (from briefs; can be edited)
create table if not exists public.tasks (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  type text not null check (type in ('action', 'question')),
  text text not null,
  status text not null check (status in ('pending', 'completed', 'snoozed')),
  created_at timestamptz not null,
  section text not null check (section in ('whereYouCanHelp', 'questionsForCall'))
);

create index if not exists tasks_company_id_idx on public.tasks(company_id);

-- Enable RLS; policies can restrict by fund_id when using Supabase Auth later.
alter table public.funds enable row level security;
alter table public.companies enable row level security;
alter table public.signals enable row level security;
alter table public.roles enable row level security;
alter table public.person_changes enable row level security;
alter table public.alerts enable row level security;
alter table public.company_briefs enable row level security;
alter table public.tasks enable row level security;

-- Allow anon/authenticated read for now (app filters by fund_id from cookie).
create policy "Allow read funds" on public.funds for select using (true);
create policy "Allow read companies" on public.companies for select using (true);
create policy "Allow read signals" on public.signals for select using (true);
create policy "Allow read roles" on public.roles for select using (true);
create policy "Allow read person_changes" on public.person_changes for select using (true);
create policy "Allow read alerts" on public.alerts for select using (true);
create policy "Allow read company_briefs" on public.company_briefs for select using (true);
create policy "Allow read tasks" on public.tasks for select using (true);
