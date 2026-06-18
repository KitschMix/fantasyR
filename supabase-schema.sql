create extension if not exists pgcrypto;

create table if not exists public.fantasy_multiplayer_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'lobby',
  host_token text not null,
  player_count integer not null default 2 check (player_count between 2 and 4),
  include_expansion boolean not null default false,
  ai_difficulty text not null default 'normal',
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fantasy_multiplayer_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.fantasy_multiplayer_rooms(id) on delete cascade,
  seat integer not null check (seat between 0 and 3),
  name text not null,
  token text not null,
  connected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (room_id, seat),
  unique (room_id, token)
);

create index if not exists fantasy_multiplayer_players_room_id_idx
  on public.fantasy_multiplayer_players(room_id);

alter table public.fantasy_multiplayer_rooms enable row level security;
alter table public.fantasy_multiplayer_players enable row level security;

drop policy if exists "rooms public read" on public.fantasy_multiplayer_rooms;
drop policy if exists "rooms public insert" on public.fantasy_multiplayer_rooms;
drop policy if exists "rooms public update" on public.fantasy_multiplayer_rooms;
drop policy if exists "players public read" on public.fantasy_multiplayer_players;
drop policy if exists "players public insert" on public.fantasy_multiplayer_players;
drop policy if exists "players public update" on public.fantasy_multiplayer_players;
drop policy if exists "players public delete" on public.fantasy_multiplayer_players;

create policy "rooms public read"
  on public.fantasy_multiplayer_rooms
  for select
  using (true);

create policy "rooms public insert"
  on public.fantasy_multiplayer_rooms
  for insert
  with check (true);

create policy "rooms public update"
  on public.fantasy_multiplayer_rooms
  for update
  using (true)
  with check (true);

create policy "players public read"
  on public.fantasy_multiplayer_players
  for select
  using (true);

create policy "players public insert"
  on public.fantasy_multiplayer_players
  for insert
  with check (true);

create policy "players public update"
  on public.fantasy_multiplayer_players
  for update
  using (true)
  with check (true);

create policy "players public delete"
  on public.fantasy_multiplayer_players
  for delete
  using (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.fantasy_multiplayer_rooms to anon;
grant select, insert, update, delete on public.fantasy_multiplayer_players to anon;

do $$
begin
  alter publication supabase_realtime add table public.fantasy_multiplayer_rooms;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.fantasy_multiplayer_players;
exception
  when duplicate_object then null;
end $$;
