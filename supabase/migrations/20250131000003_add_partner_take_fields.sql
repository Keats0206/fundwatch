-- Add new VC-partner focused fields to company_briefs

alter table public.company_briefs
  add column if not exists partner_take jsonb,
  add column if not exists insights jsonb,
  add column if not exists plays jsonb,
  add column if not exists confidence_modifiers jsonb,
  add column if not exists momentum_score numeric,
  add column if not exists momentum_status text check (momentum_status in ('green', 'yellow', 'red'));

-- Add index for momentum queries
create index if not exists company_briefs_momentum_score_idx on public.company_briefs(momentum_score);
