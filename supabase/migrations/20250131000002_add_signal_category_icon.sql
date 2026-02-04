-- Add category and icon fields to signal_texts for better organization

alter table public.signal_texts
  add column if not exists category text;
  
alter table public.signal_texts
  add column if not exists icon_name text;

-- Update existing signals with categories based on their text
update public.signal_texts set category = 'Funding' where text ilike '%funding%' or text ilike '%raised%' or text ilike '%capital%';
update public.signal_texts set category = 'Leadership' where text ilike '%executive%' or text ilike '%leadership%' or text ilike '%organizational%';
update public.signal_texts set category = 'Hiring' where text ilike '%hiring%';
update public.signal_texts set category = 'Product' where text ilike '%product%' or text ilike '%launch%' or text ilike '%update%';
update public.signal_texts set category = 'Business' where text ilike '%partnership%' or text ilike '%customer%';
update public.signal_texts set category = 'Risk' where text ilike '%negative%' or text ilike '%controversy%';
