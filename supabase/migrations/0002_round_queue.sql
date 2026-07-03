-- Say My Name - add per-round queue of remaining cards.
-- Run this if you already applied 0001 before this change.

alter table public.sessions
  add column if not exists queue jsonb not null default '[]'::jsonb;
