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

create table if not exists public.fantasy_lobby_chat (
  id uuid primary key default gen_random_uuid(),
  player_token text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  message text not null check (char_length(trim(message)) between 1 and 80),
  created_at timestamptz not null default now()
);

create index if not exists fantasy_lobby_chat_created_at_idx
  on public.fantasy_lobby_chat(created_at desc);

alter table public.fantasy_lobby_chat enable row level security;

drop policy if exists "lobby chat public read" on public.fantasy_lobby_chat;
drop policy if exists "lobby chat public insert" on public.fantasy_lobby_chat;
drop policy if exists "lobby chat public delete expired" on public.fantasy_lobby_chat;

create policy "lobby chat public read"
  on public.fantasy_lobby_chat
  for select
  using (true);

create policy "lobby chat public insert"
  on public.fantasy_lobby_chat
  for insert
  with check (
    char_length(nickname) between 2 and 12
    and nickname <> '나'
    and char_length(trim(message)) between 1 and 80
  );

create policy "lobby chat public delete expired"
  on public.fantasy_lobby_chat
  for delete
  using (created_at < now() - interval '30 seconds');

grant select, insert, delete on public.fantasy_lobby_chat to anon;

create table if not exists public.fantasy_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_fingerprint text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  score integer not null default 0 check (score >= 0),
  player_count integer check (player_count between 1 and 4),
  include_expansion boolean not null default false,
  ai_difficulty text,
  hand_cards jsonb not null default '[]'::jsonb,
  score_rows jsonb not null default '[]'::jsonb,
  card_actions jsonb not null default '{}'::jsonb,
  last_nickname_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fantasy_leaderboard
  add column if not exists hand_cards jsonb not null default '[]'::jsonb,
  add column if not exists score_rows jsonb not null default '[]'::jsonb,
  add column if not exists card_actions jsonb not null default '{}'::jsonb;

alter table public.fantasy_leaderboard
  drop constraint if exists fantasy_leaderboard_player_fingerprint_key;

alter table public.fantasy_leaderboard
  drop constraint if exists fantasy_leaderboard_nickname_check;

update public.fantasy_leaderboard
  set nickname = '익명 플레이어'
  where char_length(trim(coalesce(nickname, ''))) < 2
    or trim(nickname) = '나';

alter table public.fantasy_leaderboard
  add constraint fantasy_leaderboard_nickname_check
  check (char_length(nickname) between 2 and 12 and nickname <> '나') not valid;

alter table public.fantasy_leaderboard
  validate constraint fantasy_leaderboard_nickname_check;

alter table public.fantasy_leaderboard
  drop constraint if exists fantasy_leaderboard_player_fingerprint_mode_key;

drop index if exists public.fantasy_leaderboard_player_fingerprint_mode_key;

with duplicate_rows as (
  select id,
         row_number() over (
           partition by player_fingerprint, include_expansion
           order by score desc, updated_at asc, created_at asc
         ) as row_number
    from public.fantasy_leaderboard
)
delete from public.fantasy_leaderboard leaderboard
  using duplicate_rows
  where leaderboard.id = duplicate_rows.id
    and duplicate_rows.row_number > 1;

alter table public.fantasy_leaderboard
  add constraint fantasy_leaderboard_player_fingerprint_mode_key
  unique (player_fingerprint, include_expansion);

create index if not exists fantasy_leaderboard_score_idx
  on public.fantasy_leaderboard(score desc, updated_at asc);

create index if not exists fantasy_leaderboard_mode_score_idx
  on public.fantasy_leaderboard(include_expansion, score desc, updated_at asc);

alter table public.fantasy_leaderboard enable row level security;

drop policy if exists "leaderboard public read" on public.fantasy_leaderboard;

create policy "leaderboard public read"
  on public.fantasy_leaderboard
  for select
  using (true);

revoke insert, update, delete on public.fantasy_leaderboard from anon;
grant select on public.fantasy_leaderboard to anon;

drop function if exists public.fantasy_submit_leaderboard_score(text, integer, integer, boolean, text);

create or replace function public.fantasy_submit_leaderboard_score(
  p_nickname text,
  p_score integer,
  p_player_count integer default null,
  p_include_expansion boolean default false,
  p_ai_difficulty text default null,
  p_hand_cards jsonb default '[]'::jsonb,
  p_score_rows jsonb default '[]'::jsonb,
  p_card_actions jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip text := split_part(coalesce(
    v_headers->>'cf-connecting-ip',
    v_headers->>'x-forwarded-for',
    v_headers->>'x-real-ip',
    'unknown'
  ), ',', 1);
  v_fingerprint text := encode(extensions.digest(('fantasyR:' || trim(coalesce(v_ip, 'unknown')))::text, 'sha256'::text), 'hex');
  v_now timestamptz := now();
  v_nickname text := left(regexp_replace(trim(coalesce(p_nickname, '')), '[[:space:]]+', ' ', 'g'), 12);
  v_existing public.fantasy_leaderboard%rowtype;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_score_updated boolean := false;
  v_nickname_allowed boolean := true;
  v_hand_cards jsonb := case
    when jsonb_typeof(coalesce(p_hand_cards, '[]'::jsonb)) = 'array' then coalesce(p_hand_cards, '[]'::jsonb)
    else '[]'::jsonb
  end;
  v_score_rows jsonb := case
    when jsonb_typeof(coalesce(p_score_rows, '[]'::jsonb)) = 'array' then coalesce(p_score_rows, '[]'::jsonb)
    else '[]'::jsonb
  end;
  v_card_actions jsonb := case
    when jsonb_typeof(coalesce(p_card_actions, '{}'::jsonb)) = 'object' then coalesce(p_card_actions, '{}'::jsonb)
    else '{}'::jsonb
  end;
begin
  if char_length(v_nickname) < 2 or v_nickname = '나' then
    raise exception 'invalid nickname'
      using errcode = '22023';
  end if;

  select *
    into v_existing
    from public.fantasy_leaderboard
    where player_fingerprint = v_fingerprint
      and include_expansion = coalesce(p_include_expansion, false)
    for update;

  if not found then
    insert into public.fantasy_leaderboard (
      player_fingerprint,
      nickname,
      score,
      player_count,
      include_expansion,
      ai_difficulty,
      hand_cards,
      score_rows,
      card_actions,
      last_nickname_changed_at,
      updated_at
    )
    values (
      v_fingerprint,
      v_nickname,
      v_score,
      p_player_count,
      coalesce(p_include_expansion, false),
      left(coalesce(p_ai_difficulty, ''), 32),
      v_hand_cards,
      v_score_rows,
      v_card_actions,
      v_now,
      v_now
    )
    returning * into v_existing;

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'nickname_updated', true,
      'nickname', v_existing.nickname,
      'score', v_existing.score,
      'include_expansion', v_existing.include_expansion
    );
  end if;

  v_score_updated := v_score > v_existing.score;

  if v_existing.nickname is distinct from v_nickname then
    if v_existing.last_nickname_changed_at > v_now - interval '1 day' then
      v_nickname := v_existing.nickname;
      v_nickname_allowed := false;
    end if;
  end if;

  update public.fantasy_leaderboard
    set nickname = v_nickname,
        score = case when v_score_updated then v_score else score end,
        player_count = case when v_score_updated then p_player_count else player_count end,
        ai_difficulty = case when v_score_updated then left(coalesce(p_ai_difficulty, ''), 32) else ai_difficulty end,
        hand_cards = case when v_score_updated then v_hand_cards else hand_cards end,
        score_rows = case when v_score_updated then v_score_rows else score_rows end,
        card_actions = case when v_score_updated then v_card_actions else card_actions end,
        last_nickname_changed_at = case
          when v_existing.nickname is distinct from v_nickname then v_now
          else last_nickname_changed_at
        end,
        updated_at = case
          when v_score_updated or v_existing.nickname is distinct from v_nickname then v_now
          else updated_at
        end
    where id = v_existing.id
    returning * into v_existing;

  return jsonb_build_object(
    'created', false,
    'score_updated', v_score_updated,
    'nickname_updated', v_nickname_allowed,
    'nickname', v_existing.nickname,
    'score', v_existing.score,
    'include_expansion', v_existing.include_expansion
  );
end;
$$;

grant execute on function public.fantasy_submit_leaderboard_score(text, integer, integer, boolean, text, jsonb, jsonb, jsonb) to anon;

create table if not exists public.fantasy_beomrye_hall_of_fame (
  id integer primary key default 1 check (id = 1),
  player_fingerprint text,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  score integer not null default 0 check (score >= 0),
  player_count integer check (player_count between 1 and 4),
  include_expansion boolean not null default false,
  ai_difficulty text,
  defeated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

delete from public.fantasy_beomrye_hall_of_fame
  where id <> 1;

delete from public.fantasy_beomrye_hall_of_fame
  where coalesce(ai_difficulty, '') <> 'random';

alter table public.fantasy_beomrye_hall_of_fame enable row level security;

drop policy if exists "beomrye hall public read" on public.fantasy_beomrye_hall_of_fame;

create policy "beomrye hall public read"
  on public.fantasy_beomrye_hall_of_fame
  for select
  using (true);

revoke insert, update, delete on public.fantasy_beomrye_hall_of_fame from anon;
grant select on public.fantasy_beomrye_hall_of_fame to anon;

create or replace function public.fantasy_submit_beomrye_hall_score(
  p_nickname text,
  p_score integer,
  p_player_count integer default null,
  p_include_expansion boolean default false,
  p_ai_difficulty text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip text := split_part(coalesce(
    v_headers->>'cf-connecting-ip',
    v_headers->>'x-forwarded-for',
    v_headers->>'x-real-ip',
    'unknown'
  ), ',', 1);
  v_fingerprint text := encode(extensions.digest(('fantasyR:beomrye:' || trim(coalesce(v_ip, 'unknown')))::text, 'sha256'::text), 'hex');
  v_now timestamptz := now();
  v_nickname text := left(regexp_replace(trim(coalesce(p_nickname, '')), '[[:space:]]+', ' ', 'g'), 12);
  v_existing public.fantasy_beomrye_hall_of_fame%rowtype;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_score_updated boolean := false;
begin
  if char_length(v_nickname) < 2 or v_nickname = '나' then
    raise exception 'invalid nickname'
      using errcode = '22023';
  end if;

  if coalesce(p_ai_difficulty, '') <> 'random' then
    return jsonb_build_object(
      'created', false,
      'score_updated', false,
      'nickname', v_nickname,
      'score', 0,
      'ignored', true,
      'reason', 'random_only'
    );
  end if;

  select *
    into v_existing
    from public.fantasy_beomrye_hall_of_fame
    where id = 1
    for update;

  if not found then
    insert into public.fantasy_beomrye_hall_of_fame (
      id,
      player_fingerprint,
      nickname,
      score,
      player_count,
      include_expansion,
      ai_difficulty,
      defeated_at,
      updated_at
    )
    values (
      1,
      v_fingerprint,
      v_nickname,
      v_score,
      p_player_count,
      coalesce(p_include_expansion, false),
      left(coalesce(p_ai_difficulty, ''), 32),
      v_now,
      v_now
    )
    returning * into v_existing;

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'nickname', v_existing.nickname,
      'score', v_existing.score
    );
  end if;

  v_score_updated := v_score > v_existing.score;

  if v_score_updated then
    update public.fantasy_beomrye_hall_of_fame
      set player_fingerprint = v_fingerprint,
          nickname = v_nickname,
          score = v_score,
          player_count = p_player_count,
          include_expansion = coalesce(p_include_expansion, false),
          ai_difficulty = left(coalesce(p_ai_difficulty, ''), 32),
          defeated_at = v_now,
          updated_at = v_now
      where id = 1
      returning * into v_existing;
  end if;

  return jsonb_build_object(
    'created', false,
    'score_updated', v_score_updated,
    'nickname', v_existing.nickname,
    'score', v_existing.score
  );
end;
$$;

grant execute on function public.fantasy_submit_beomrye_hall_score(text, integer, integer, boolean, text) to anon;

notify pgrst, 'reload schema';

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

do $$
begin
  alter publication supabase_realtime add table public.fantasy_lobby_chat;
exception
  when duplicate_object then null;
end $$;
