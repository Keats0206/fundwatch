-- Optional seed: run after applying migrations. Inserts demo data for Mantis, Thrive, USV.
-- Run in Supabase SQL Editor if you want to start with the same data as mock-data.

insert into public.funds (id, name) values
  ('mantis', 'Mantis'),
  ('mantis-ventures', 'Mantis Ventures'),
  ('thrive', 'Thrive'),
  ('usv', 'USV')
on conflict (id) do nothing;

insert into public.companies (id, fund_id, name, domain, health, last_updated, attention_reason, highlight_chips) values
  ('c1', 'mantis', 'Flowstack', 'flowstack.io', 'red', '2025-01-28', 'Multiple roles removed and exec departure this week.', array['2 roles removed', 'Exec departure']),
  ('c2', 'mantis', 'DataLens', 'datalens.ai', 'yellow', '2025-01-27', 'No public activity for 3 weeks; hiring paused.', array['Hiring pause', 'Quiet 3 weeks']),
  ('c3', 'mantis', 'Meridian', 'meridian.dev', 'green', '2025-01-29', null, array['New blog post', '2 open roles']),
  ('c4', 'thrive', 'Nexus Labs', 'nexuslabs.com', 'yellow', '2025-01-26', 'Negative press mention; repeated role churn.', array['Negative press', 'Role churn']),
  ('c5', 'thrive', 'Vertex AI', 'vertexai.io', 'green', '2025-01-29', null, array['Series B announced', 'Head of Sales open']),
  ('c6', 'thrive', 'QuietCo', 'quietco.com', 'red', '2025-01-15', 'No public activity for 6 weeks.', array['No activity 6w']),
  ('c7', 'usv', 'ScalePath', 'scalepath.com', 'green', '2025-01-28', null, array['New CTO', '3 open roles']),
  ('c8', 'usv', 'Pulse Health', 'pulsehealth.com', 'yellow', '2025-01-25', 'Long-open Head of Sales role; no new signals.', array['Long-open role', 'Quiet 1w'])
on conflict (id) do nothing;

insert into public.signals (id, company_id, source, timestamp, summary, external_url) values
  ('s1', 'c1', 'Careers', '2025-01-28 10:00:00+00', 'Senior Engineer and Product Manager roles removed from careers page.', 'https://flowstack.io/careers'),
  ('s2', 'c1', 'LinkedIn', '2025-01-27 14:00:00+00', 'VP Engineering updated profile to "Former VP Eng at Flowstack".', 'https://linkedin.com/in/example'),
  ('s3', 'c1', 'News', '2025-01-26 09:00:00+00', 'TechCrunch: Flowstack delays product launch.', 'https://techcrunch.com/example'),
  ('s4', 'c2', 'Careers', '2025-01-10 12:00:00+00', 'All engineering roles removed; careers page unchanged since.', 'https://datalens.ai/careers'),
  ('s5', 'c2', 'Blog', '2025-01-05 11:00:00+00', 'Last blog post: product update from early January.', 'https://datalens.ai/blog'),
  ('s6', 'c3', 'Blog', '2025-01-29 08:00:00+00', 'New post: "Why we built Meridian" — product vision.', 'https://meridian.dev/blog'),
  ('s7', 'c3', 'Careers', '2025-01-28 00:00:00+00', 'Backend Engineer and Frontend Engineer roles added.', 'https://meridian.dev/careers'),
  ('s8', 'c4', 'News', '2025-01-25 16:00:00+00', 'Industry blog: "Nexus Labs faces headwinds in enterprise segment."', 'https://example.com/news'),
  ('s9', 'c4', 'LinkedIn', '2025-01-24 00:00:00+00', 'Head of Sales role reposted (previously removed then re-added).', 'https://linkedin.com/company/nexuslabs'),
  ('s10', 'c5', 'News', '2025-01-28 10:00:00+00', 'Vertex AI announces $40M Series B.', 'https://techcrunch.com/vertex'),
  ('s11', 'c5', 'Careers', '2025-01-27 00:00:00+00', 'Head of Sales role posted on careers page.', 'https://vertexai.io/careers'),
  ('s12', 'c6', 'Blog', '2024-12-10 00:00:00+00', 'Last blog post over 6 weeks ago.', 'https://quietco.com/blog'),
  ('s13', 'c7', 'LinkedIn', '2025-01-27 12:00:00+00', 'New CTO announced via LinkedIn post.', 'https://linkedin.com/company/scalepath'),
  ('s14', 'c7', 'Careers', '2025-01-26 00:00:00+00', 'Engineering and GTM roles added.', 'https://scalepath.com/careers'),
  ('s15', 'c8', 'Careers', '2025-01-20 00:00:00+00', 'Head of Sales role open for 60+ days.', 'https://pulsehealth.com/careers')
on conflict (id) do nothing;

insert into public.roles (id, company_id, title, role_type, source, first_seen, status, high_priority) values
  ('r1', 'c1', 'Senior Engineer', 'Engineering', 'Careers', '2025-01-15', 'removed', false),
  ('r2', 'c1', 'Product Manager', 'Other', 'Careers', '2025-01-15', 'removed', false),
  ('r3', 'c3', 'Backend Engineer', 'Engineering', 'Careers', '2025-01-28', 'new', false),
  ('r4', 'c3', 'Frontend Engineer', 'Engineering', 'Careers', '2025-01-28', 'new', false),
  ('r5', 'c4', 'Head of Sales', 'Leadership', 'LinkedIn', '2025-01-24', 'ongoing', true),
  ('r6', 'c5', 'Head of Sales', 'Leadership', 'Careers', '2025-01-27', 'new', true),
  ('r7', 'c5', 'Enterprise AE', 'GTM', 'LinkedIn', '2025-01-27', 'new', false),
  ('r8', 'c6', 'Full Stack Engineer', 'Engineering', 'Careers', '2024-11-01', 'ongoing', false),
  ('r9', 'c7', 'Staff Engineer', 'Engineering', 'Careers', '2025-01-26', 'new', false),
  ('r10', 'c7', 'Account Executive', 'GTM', 'Careers', '2025-01-26', 'new', false),
  ('r11', 'c7', 'Solutions Architect', 'Engineering', 'Careers', '2025-01-26', 'new', false),
  ('r12', 'c8', 'Head of Sales', 'Leadership', 'Careers', '2024-11-25', 'ongoing', true)
on conflict (id) do nothing;

insert into public.person_changes (id, company_id, name, role, change_type, source_url) values
  ('p1', 'c1', 'Jordan Lee', 'VP Engineering', 'left', 'https://linkedin.com/in/jordanlee'),
  ('p2', 'c7', 'Sam Chen', 'CTO', 'joined', 'https://linkedin.com/in/samchen')
on conflict (id) do nothing;

insert into public.alerts (id, company_id, type, why_it_matters, created_at) values
  ('a1', 'c1', 'hiring_pause', 'Two key roles removed in one week often signals budget or strategy shift.', '2025-01-28 12:00:00+00'),
  ('a2', 'c1', 'exec_departure', 'VP Engineering departure with no announced successor may impact delivery.', '2025-01-27 15:00:00+00'),
  ('a3', 'c2', 'no_activity', 'No public activity for 3 weeks can indicate focus shift or quiet trouble.', '2025-01-27 00:00:00+00'),
  ('a4', 'c4', 'negative_press', 'Negative press may affect customer and partner perception.', '2025-01-25 17:00:00+00'),
  ('a5', 'c4', 'role_churn', 'Head of Sales role removed then reposted suggests hiring difficulty.', '2025-01-24 00:00:00+00'),
  ('a6', 'c6', 'no_activity', 'No public activity for 6 weeks; worth a check-in.', '2025-01-22 00:00:00+00')
on conflict (id) do nothing;

insert into public.company_briefs (company_id, what_changed, why_it_matters, risks_to_watch, where_you_can_help, questions_for_call, signal_ids_by_section) values
  ('c1', array['Two roles removed from careers page (Senior Engineer, Product Manager).', 'VP Engineering departed; LinkedIn profile updated.', 'TechCrunch mentioned product launch delay.'], array['Role removal often precedes or follows restructure.', 'Exec departure without successor can slow roadmap.', 'Public delay may affect customer confidence.'], array['Further role cuts or leadership changes.', 'Silence on new hire for VP Eng.'], array['Offer to intro interim or full-time VP Eng candidates.', 'Check in on runway and plan.'], array['What''s the timeline for backfilling VP Eng?', 'Any other role or org changes planned?'], '{"whatChanged": ["s1", "s2", "s3"], "whyItMatters": ["s1", "s2", "s3"]}'::jsonb),
  ('c2', array['Careers page unchanged; engineering roles were removed over two weeks ago.', 'Last blog post was early January.'], array['Hiring pause can mean reprioritization or cost pressure.', 'Long quiet period may mean all-hands on product or internal focus.'], array['Extended silence on hiring or product.', 'Leadership or strategy change with no announcement.'], array['Offer to help with candidate pipeline when they''re ready.', 'Light-touch check-in on priorities.'], array['Is the hiring pause intentional? Until when?', 'What''s the main focus for the next 30 days?'], null),
  ('c3', array['New blog post on product vision.', 'Two new engineering roles posted (Backend, Frontend).'], array['Continued hiring and content signal momentum.', 'Good moment to offer intro to engineers if you have them.'], array['None significant this week.'], array['Share strong Backend or Frontend candidates.', 'Amplify the new post if relevant to your network.'], array['How''s the pipeline for the new roles?', 'Anything else where the board can help?'], '{"whatChanged": ["s6", "s7"]}'::jsonb),
  ('c4', array['Negative coverage on enterprise segment.', 'Head of Sales role reposted on LinkedIn after being removed.'], array['Press can affect deal flow; worth monitoring.', 'Role churn on critical hire suggests difficulty filling.'], array['More negative press or competitor narrative.', 'Extended time to fill Head of Sales.'], array['Intro Head of Sales candidates.', 'Offer to support narrative or references if helpful.'], array['How are enterprise deals trending?', 'What''s the plan to close the Head of Sales search?'], null),
  ('c5', array['Series B announced.', 'Head of Sales and Enterprise AE roles posted.'], array['New capital and hiring signal growth mode.', 'Strong moment to help with GTM hiring.'], array['None significant this week.'], array['Intro Head of Sales and AE candidates.', 'Offer customer or partner intros if relevant.'], array['How will the new capital change hiring plans?', 'Priority roles beyond Head of Sales?'], null),
  ('c6', array['No new signals; last activity was over 6 weeks ago.'], array['Extended quiet can mean stealth mode or trouble; hard to tell from outside.'], array['Continued absence of public activity.', 'Leadership or strategy change without announcement.'], array['Reach out for a quick sync.', 'Offer help if they''re in a quiet phase.'], array['What''s been the focus the last few weeks?', 'Anything the board should know?'], null),
  ('c7', array['New CTO announced (Sam Chen).', 'Three new roles: Staff Engineer, AE, Solutions Architect.'], array['Leadership hire and hiring expansion signal confidence.', 'Good time to offer engineering and GTM intros.'], array['None significant this week.'], array['Intro strong candidates for Staff Engineer or AE.', 'Support CTO onboarding if relevant.'], array['How''s the CTO ramp going?', 'Which role is highest priority to fill?'], '{"whatChanged": ["s13", "s14"]}'::jsonb),
  ('c8', array['Head of Sales role has been open 60+ days.', 'No other new signals this week.'], array['Long-open critical role can indicate market or comp fit issues.', 'Worth checking if they need help with the search.'], array['Role stays open with no new outreach.', 'Quiet on other GTM hires.'], array['Intro Head of Sales candidates.', 'Offer to brainstorm search strategy.'], array['What''s blocking the Head of Sales hire?', 'Would a fractional or interim help?'], null)
on conflict (company_id) do nothing;

-- Tasks: generated from briefs (whereYouCanHelp + questionsForCall). IDs t1..tN.
insert into public.tasks (id, company_id, type, text, status, created_at, section) 
select * from (values
  ('t1', 'c1', 'action', 'Offer to intro interim or full-time VP Eng candidates.', 'pending', now(), 'whereYouCanHelp'),
  ('t2', 'c1', 'action', 'Check in on runway and plan.', 'pending', now(), 'whereYouCanHelp'),
  ('t3', 'c1', 'question', 'What''s the timeline for backfilling VP Eng?', 'pending', now(), 'questionsForCall'),
  ('t4', 'c1', 'question', 'Any other role or org changes planned?', 'pending', now(), 'questionsForCall'),
  ('t5', 'c2', 'action', 'Offer to help with candidate pipeline when they''re ready.', 'pending', now(), 'whereYouCanHelp'),
  ('t6', 'c2', 'action', 'Light-touch check-in on priorities.', 'pending', now(), 'whereYouCanHelp'),
  ('t7', 'c2', 'question', 'Is the hiring pause intentional? Until when?', 'pending', now(), 'questionsForCall'),
  ('t8', 'c2', 'question', 'What''s the main focus for the next 30 days?', 'pending', now(), 'questionsForCall'),
  ('t9', 'c3', 'action', 'Share strong Backend or Frontend candidates.', 'pending', now(), 'whereYouCanHelp'),
  ('t10', 'c3', 'action', 'Amplify the new post if relevant to your network.', 'pending', now(), 'whereYouCanHelp'),
  ('t11', 'c3', 'question', 'How''s the pipeline for the new roles?', 'pending', now(), 'questionsForCall'),
  ('t12', 'c3', 'question', 'Anything else where the board can help?', 'pending', now(), 'questionsForCall'),
  ('t13', 'c4', 'action', 'Intro Head of Sales candidates.', 'pending', now(), 'whereYouCanHelp'),
  ('t14', 'c4', 'action', 'Offer to support narrative or references if helpful.', 'pending', now(), 'whereYouCanHelp'),
  ('t15', 'c4', 'question', 'How are enterprise deals trending?', 'pending', now(), 'questionsForCall'),
  ('t16', 'c4', 'question', 'What''s the plan to close the Head of Sales search?', 'pending', now(), 'questionsForCall'),
  ('t17', 'c5', 'action', 'Intro Head of Sales and AE candidates.', 'pending', now(), 'whereYouCanHelp'),
  ('t18', 'c5', 'action', 'Offer customer or partner intros if relevant.', 'pending', now(), 'whereYouCanHelp'),
  ('t19', 'c5', 'question', 'How will the new capital change hiring plans?', 'pending', now(), 'questionsForCall'),
  ('t20', 'c5', 'question', 'Priority roles beyond Head of Sales?', 'pending', now(), 'questionsForCall'),
  ('t21', 'c6', 'action', 'Reach out for a quick sync.', 'pending', now(), 'whereYouCanHelp'),
  ('t22', 'c6', 'action', 'Offer help if they''re in a quiet phase.', 'pending', now(), 'whereYouCanHelp'),
  ('t23', 'c6', 'question', 'What''s been the focus the last few weeks?', 'pending', now(), 'questionsForCall'),
  ('t24', 'c6', 'question', 'Anything the board should know?', 'pending', now(), 'questionsForCall'),
  ('t25', 'c7', 'action', 'Intro strong candidates for Staff Engineer or AE.', 'pending', now(), 'whereYouCanHelp'),
  ('t26', 'c7', 'action', 'Support CTO onboarding if relevant.', 'pending', now(), 'whereYouCanHelp'),
  ('t27', 'c7', 'question', 'How''s the CTO ramp going?', 'pending', now(), 'questionsForCall'),
  ('t28', 'c7', 'question', 'Which role is highest priority to fill?', 'pending', now(), 'questionsForCall'),
  ('t29', 'c8', 'action', 'Intro Head of Sales candidates.', 'pending', now(), 'whereYouCanHelp'),
  ('t30', 'c8', 'action', 'Offer to brainstorm search strategy.', 'pending', now(), 'whereYouCanHelp'),
  ('t31', 'c8', 'question', 'What''s blocking the Head of Sales hire?', 'pending', now(), 'questionsForCall'),
  ('t32', 'c8', 'question', 'Would a fractional or interim help?', 'pending', now(), 'questionsForCall')
) as v(id, company_id, type, text, status, created_at, section)
on conflict (id) do nothing;
