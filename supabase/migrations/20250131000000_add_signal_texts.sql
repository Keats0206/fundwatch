-- Add signal texts table for text-based signals (standard and custom)
-- Standard signals are reusable across companies (company_id = null)
-- Custom signals are company-specific (company_id set)

create table if not exists public.signal_texts (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  text text not null,
  type text not null check (type in ('standard', 'custom')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add constraint only if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'signal_texts_type_check'
  ) then
    alter table public.signal_texts
      add constraint signal_texts_type_check check (
        (type = 'standard' and company_id is null) or
        (type = 'custom' and company_id is not null)
      );
  end if;
end $$;

create index if not exists signal_texts_company_id_idx on public.signal_texts(company_id);
create index if not exists signal_texts_type_idx on public.signal_texts(type);

-- Enable RLS
alter table public.signal_texts enable row level security;

-- Allow read/write (app filters by company_id which is tied to fund_id)
-- Drop policies if they exist, then recreate (idempotent)
drop policy if exists "Allow read signal_texts" on public.signal_texts;
drop policy if exists "Allow insert signal_texts" on public.signal_texts;
drop policy if exists "Allow update signal_texts" on public.signal_texts;
drop policy if exists "Allow delete signal_texts" on public.signal_texts;

create policy "Allow read signal_texts" on public.signal_texts for select using (true);
create policy "Allow insert signal_texts" on public.signal_texts for insert with check (true);
create policy "Allow update signal_texts" on public.signal_texts for update using (true);
create policy "Allow delete signal_texts" on public.signal_texts for delete using (true);

-- Insert some default standard signals
insert into public.signal_texts (id, company_id, text, type) values
  ('st-1', null, 'Company recently raised funding', 'standard'),
  ('st-2', null, 'New executive hires detected', 'standard'),
  ('st-3', null, 'Hiring activity increased significantly', 'standard'),
  ('st-4', null, 'Product launch or major update announced', 'standard'),
  ('st-5', null, 'Partnership or customer win announced', 'standard'),
  ('st-6', null, 'Leadership changes detected', 'standard'),
  ('st-7', null, 'Hiring pause or slowdown detected', 'standard'),
  ('st-8', null, 'Negative press or controversy', 'standard')
on conflict (id) do nothing;
