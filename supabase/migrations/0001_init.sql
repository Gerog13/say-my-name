-- Say My Name - initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.sessions (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  host_id           uuid not null,
  state             text not null default 'lobby',   -- lobby|countdown|round|round_end|finished
  round             int  not null default 0,
  phase             text not null default 'round1',  -- round1|round2|lightning|round3
  category          text not null default 'titles',  -- titles|characters|anything
  current_team_id   uuid,
  current_player_id uuid,
  deck              jsonb not null default '[]'::jsonb,
  lightning_deck    jsonb not null default '[]'::jsonb,
  queue             jsonb not null default '[]'::jsonb,
  deck_index        int  not null default 0,
  keyword_revealed  boolean not null default false,
  phase_complete    boolean not null default false,
  turn_ends_at      timestamptz,
  turn_active       boolean not null default false,
  config            jsonb not null default jsonb_build_object(
                       'mainPerPlayer', 5,
                       'lightningPerPlayer', 1,
                       'turnSeconds', 30,
                       'lightningSeconds', 5,
                       'maxPlayers', 16,
                       'teamCount', 2
                     ),
  stats             jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  name        text not null,
  color       text not null default 'cyan',
  score       int  not null default 0,
  turns_taken int  not null default 0,
  time_used   int  not null default 0,
  "order"     int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.players (
  id            uuid primary key,             -- equals auth.uid()
  session_id    uuid not null references public.sessions(id) on delete cascade,
  team_id       uuid references public.teams(id) on delete set null,
  name          text not null,
  avatar        text not null default '🙂',
  connected     boolean not null default true,
  is_host       boolean not null default false,
  correct_count int not null default 0,
  last_seen     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_teams_session on public.teams(session_id);
create index if not exists idx_players_session on public.players(session_id);
create index if not exists idx_sessions_code on public.sessions(code);

-- ---------------------------------------------------------------------------
-- updated_at trigger for sessions
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sessions_touch on public.sessions;
create trigger trg_sessions_touch
  before update on public.sessions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Anonymous-auth friendly: any authenticated (incl. anonymous) user may read
-- game rows and create/join. State transitions are restricted to the host.
-- ---------------------------------------------------------------------------

alter table public.sessions enable row level security;
alter table public.teams    enable row level security;
alter table public.players  enable row level security;

-- sessions
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions
  for select using (true);

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions
  for insert with check (auth.uid() = host_id);

-- Any member of the session may update the session row (host is authoritative
-- for transitions, but the active player drives their own turn). Party-game
-- trust model among friends.
drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions
  for update using (
    auth.uid() = host_id
    or exists (select 1 from public.players p where p.session_id = sessions.id and p.id = auth.uid())
  ) with check (
    auth.uid() = host_id
    or exists (select 1 from public.players p where p.session_id = sessions.id and p.id = auth.uid())
  );

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions
  for delete using (auth.uid() = host_id);

-- teams (host manages team roster/scoring)
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select using (true);

-- Members of a session may update team rows (scoring during their turn);
-- inserts/deletes of teams are limited to the host.
drop policy if exists teams_write on public.teams;
create policy teams_write on public.teams
  for update using (
    exists (select 1 from public.players p where p.session_id = teams.session_id and p.id = auth.uid())
  ) with check (
    exists (select 1 from public.players p where p.session_id = teams.session_id and p.id = auth.uid())
  );

drop policy if exists teams_insert on public.teams;
create policy teams_insert on public.teams
  for insert with check (
    exists (select 1 from public.sessions s where s.id = teams.session_id and s.host_id = auth.uid())
  );

drop policy if exists teams_delete on public.teams;
create policy teams_delete on public.teams
  for delete using (
    exists (select 1 from public.sessions s where s.id = teams.session_id and s.host_id = auth.uid())
  );

-- players: anyone can read; a user may insert/update/delete their own row
drop policy if exists players_select on public.players;
create policy players_select on public.players
  for select using (true);

drop policy if exists players_insert on public.players;
create policy players_insert on public.players
  for insert with check (auth.uid() = id);

drop policy if exists players_update_self on public.players;
create policy players_update_self on public.players
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- host may update any player in their session (e.g. move teams, scoring)
drop policy if exists players_update_host on public.players;
create policy players_update_host on public.players
  for update using (
    exists (select 1 from public.sessions s where s.id = players.session_id and s.host_id = auth.uid())
  ) with check (
    exists (select 1 from public.sessions s where s.id = players.session_id and s.host_id = auth.uid())
  );

drop policy if exists players_delete on public.players;
create policy players_delete on public.players
  for delete using (
    auth.uid() = id
    or exists (select 1 from public.sessions s where s.id = players.session_id and s.host_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Server time RPC (for client clock sync)
-- ---------------------------------------------------------------------------

create or replace function public.server_time()
returns timestamptz language sql stable as $$
  select now();
$$;

grant execute on function public.server_time() to anon, authenticated;

create or replace function public.increment_correct(player_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.players set correct_count = correct_count + 1 where id = player_id;
$$;

grant execute on function public.increment_correct(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
