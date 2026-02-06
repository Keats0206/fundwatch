-- Demo fund seed data for FundWatch
-- Run this in your Supabase SQL Editor to create a demo portfolio

-- Create demo fund
INSERT INTO public.funds (id, name)
VALUES ('demo', 'Y Combinator')
ON CONFLICT (id) DO UPDATE SET name = 'Y Combinator';

-- Demo companies (Y Combinator portfolio)
INSERT INTO public.companies (id, fund_id, name, domain, health, last_updated, attention_reason, highlight_chips)
VALUES
  ('airbnb', 'demo', 'Airbnb', 'airbnb.com', 'green', NOW(), NULL, ARRAY['Public', 'Hiring']),
  ('coinbase', 'demo', 'Coinbase', 'coinbase.com', 'green', NOW() - INTERVAL '1 day', NULL, ARRAY['Public', 'Hiring']),
  ('stripe', 'demo', 'Stripe', 'stripe.com', 'green', NOW(), NULL, ARRAY['Series H', 'Hiring']),
  ('dropbox', 'demo', 'Dropbox', 'dropbox.com', 'yellow', NOW() - INTERVAL '6 days', 'Product pivot signals', ARRAY['Public']),
  ('reddit', 'demo', 'Reddit', 'reddit.com', 'green', NOW() - INTERVAL '3 days', NULL, ARRAY['Public', 'Hiring']),
  ('doordash', 'demo', 'DoorDash', 'doordash.com', 'green', NOW() - INTERVAL '1 day', NULL, ARRAY['Public', 'Hiring']),
  ('twitch', 'demo', 'Twitch', 'twitch.tv', 'yellow', NOW() - INTERVAL '7 days', 'Leadership changes', ARRAY['Acquired']),
  ('gusto', 'demo', 'Gusto', 'gusto.com', 'green', NOW() - INTERVAL '2 days', NULL, ARRAY['Series E', 'Hiring']),
  ('instacart', 'demo', 'Instacart', 'instacart.com', 'green', NOW(), NULL, ARRAY['Public', 'Hiring']),
  ('ramp', 'demo', 'Ramp', 'ramp.com', 'green', NOW() - INTERVAL '1 day', NULL, ARRAY['Series C', 'Hiring']),
  ('brex', 'demo', 'Brex', 'brex.com', 'yellow', NOW() - INTERVAL '8 days', 'Strategic shift in focus', ARRAY['Series D']),
  ('openai', 'demo', 'OpenAI', 'openai.com', 'green', NOW(), NULL, ARRAY['Series', 'Hiring'])
ON CONFLICT (id) DO UPDATE SET
  fund_id = EXCLUDED.fund_id,
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  health = EXCLUDED.health,
  last_updated = EXCLUDED.last_updated,
  attention_reason = EXCLUDED.attention_reason,
  highlight_chips = EXCLUDED.highlight_chips;
