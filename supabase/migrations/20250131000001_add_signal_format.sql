-- Add format column to signal_texts to support both text patterns and URLs

-- Add column if it doesn't exist
alter table public.signal_texts
  add column if not exists format text;

-- Set default and not null constraint if column was just added or is null
do $$
begin
  -- Set default value for existing null rows
  update public.signal_texts set format = 'text' where format is null;
  
  -- Add default if not already set
  alter table public.signal_texts
    alter column format set default 'text';
  
  -- Make it not null if it isn't already
  alter table public.signal_texts
    alter column format set not null;
end $$;

-- Add check constraint only if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'signal_texts_format_check'
  ) then
    alter table public.signal_texts
      add constraint signal_texts_format_check check (format in ('text', 'url'));
  end if;
end $$;
