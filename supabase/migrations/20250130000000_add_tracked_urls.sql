-- Add tracked URLs and signal cache for automated monitoring

-- Tracked URLs per company (careers, blog, LinkedIn - stable URLs)
create table if not exists public.company_tracked_urls (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  url text not null,
  label text, -- "Careers", "Blog", "LinkedIn", "Main"
  url_type text not null default 'static' check (url_type in ('static', 'dynamic')),
  enabled boolean default true,
  last_checked timestamptz,
  last_content_hash text, -- SHA-256 hash for change detection
  created_at timestamptz default now()
);

create index if not exists company_tracked_urls_company_id_idx on public.company_tracked_urls(company_id);
create index if not exists company_tracked_urls_enabled_idx on public.company_tracked_urls(enabled) where enabled = true;

-- Cache for signal checks (avoid re-checking too frequently)
create table if not exists public.company_signal_cache (
  company_id text primary key references public.companies(id) on delete cascade,
  last_checked timestamptz not null,
  signals_generated int default 0,
  urls_checked int default 0
);

-- Enable RLS
alter table public.company_tracked_urls enable row level security;
alter table public.company_signal_cache enable row level security;

-- Allow read/write (app filters by company_id which is tied to fund_id)
create policy "Allow read tracked_urls" on public.company_tracked_urls for select using (true);
create policy "Allow insert tracked_urls" on public.company_tracked_urls for insert with check (true);
create policy "Allow update tracked_urls" on public.company_tracked_urls for update using (true);
create policy "Allow delete tracked_urls" on public.company_tracked_urls for delete using (true);

create policy "Allow read signal_cache" on public.company_signal_cache for select using (true);
create policy "Allow insert signal_cache" on public.company_signal_cache for insert with check (true);
create policy "Allow update signal_cache" on public.company_signal_cache for update using (true);
