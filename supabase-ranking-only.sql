create extension if not exists pgcrypto;

create table if not exists public.fantasy_tally_ho_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_fingerprint text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  score integer not null default 0 check (score >= 0),
  team text not null check (team in ('animals', 'hunters')),
  ai_difficulty text,
  opponent_name text,
  won boolean not null default false,
  last_nickname_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fantasy_tally_ho_leaderboard
  add column if not exists ai_difficulty text,
  add column if not exists opponent_name text,
  add column if not exists won boolean not null default false,
  add column if not exists last_nickname_changed_at timestamptz not null default now();

alter table public.fantasy_tally_ho_leaderboard
  drop constraint if exists fantasy_tally_ho_leaderboard_nickname_check;

update public.fantasy_tally_ho_leaderboard
  set nickname = '익명 플레이어'
  where char_length(trim(coalesce(nickname, ''))) < 2
    or trim(nickname) = '나';

alter table public.fantasy_tally_ho_leaderboard
  add constraint fantasy_tally_ho_leaderboard_nickname_check
  check (char_length(nickname) between 2 and 12 and nickname <> '나') not valid;

alter table public.fantasy_tally_ho_leaderboard
  validate constraint fantasy_tally_ho_leaderboard_nickname_check;

alter table public.fantasy_tally_ho_leaderboard
  drop constraint if exists fantasy_tally_ho_leaderboard_player_fingerprint_team_key;

drop index if exists public.fantasy_tally_ho_leaderboard_player_fingerprint_team_key;

with duplicate_rows as (
  select id,
         row_number() over (
           partition by player_fingerprint, team
           order by score desc, updated_at asc, created_at asc
         ) as row_number
    from public.fantasy_tally_ho_leaderboard
)
delete from public.fantasy_tally_ho_leaderboard leaderboard
  using duplicate_rows
  where leaderboard.id = duplicate_rows.id
    and duplicate_rows.row_number > 1;

alter table public.fantasy_tally_ho_leaderboard
  add constraint fantasy_tally_ho_leaderboard_player_fingerprint_team_key
  unique (player_fingerprint, team);

create index if not exists fantasy_tally_ho_leaderboard_team_score_idx
  on public.fantasy_tally_ho_leaderboard(team, score desc, updated_at asc);

alter table public.fantasy_tally_ho_leaderboard enable row level security;

drop policy if exists "tally leaderboard public read" on public.fantasy_tally_ho_leaderboard;

create policy "tally leaderboard public read"
  on public.fantasy_tally_ho_leaderboard
  for select
  using (true);

revoke insert, update, delete on public.fantasy_tally_ho_leaderboard from anon;
grant select on public.fantasy_tally_ho_leaderboard to anon;

create table if not exists public.fantasy_cant_stop_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_fingerprint text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  score integer not null default 0 check (score >= 0),
  columns_claimed integer not null default 0 check (columns_claimed between 0 and 3),
  turns integer not null default 0 check (turns >= 0),
  ai_difficulty text,
  opponent_name text,
  won boolean not null default false,
  last_nickname_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fantasy_cant_stop_leaderboard
  add column if not exists columns_claimed integer not null default 0,
  add column if not exists turns integer not null default 0,
  add column if not exists ai_difficulty text,
  add column if not exists opponent_name text,
  add column if not exists won boolean not null default false,
  add column if not exists last_nickname_changed_at timestamptz not null default now();

alter table public.fantasy_cant_stop_leaderboard
  drop constraint if exists fantasy_cant_stop_leaderboard_nickname_check;

update public.fantasy_cant_stop_leaderboard
  set nickname = '익명 플레이어'
  where char_length(trim(coalesce(nickname, ''))) < 2
    or trim(nickname) = '나';

alter table public.fantasy_cant_stop_leaderboard
  add constraint fantasy_cant_stop_leaderboard_nickname_check
  check (char_length(nickname) between 2 and 12 and nickname <> '나') not valid;

alter table public.fantasy_cant_stop_leaderboard
  validate constraint fantasy_cant_stop_leaderboard_nickname_check;

alter table public.fantasy_cant_stop_leaderboard
  drop constraint if exists fantasy_cant_stop_leaderboard_player_fingerprint_key;

drop index if exists public.fantasy_cant_stop_leaderboard_player_fingerprint_key;

with duplicate_rows as (
  select id,
         row_number() over (
           partition by player_fingerprint
           order by case when won and turns > 0 then turns else 2147483647 end asc,
                    score desc,
                    updated_at asc,
                    created_at asc
         ) as row_number
    from public.fantasy_cant_stop_leaderboard
)
delete from public.fantasy_cant_stop_leaderboard leaderboard
  using duplicate_rows
  where leaderboard.id = duplicate_rows.id
    and duplicate_rows.row_number > 1;

alter table public.fantasy_cant_stop_leaderboard
  add constraint fantasy_cant_stop_leaderboard_player_fingerprint_key
  unique (player_fingerprint);

create index if not exists fantasy_cant_stop_leaderboard_score_idx
  on public.fantasy_cant_stop_leaderboard(score desc, updated_at asc);

create index if not exists fantasy_cant_stop_leaderboard_turns_idx
  on public.fantasy_cant_stop_leaderboard(turns asc, score desc, updated_at asc)
  where won = true and turns > 0;

alter table public.fantasy_cant_stop_leaderboard enable row level security;

drop policy if exists "cant stop leaderboard public read" on public.fantasy_cant_stop_leaderboard;

create policy "cant stop leaderboard public read"
  on public.fantasy_cant_stop_leaderboard
  for select
  using (true);

revoke insert, update, delete on public.fantasy_cant_stop_leaderboard from anon;
grant select on public.fantasy_cant_stop_leaderboard to anon;

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
  v_tally_nickname text;
  v_tally_changed_at timestamptz;
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

  select nickname, last_nickname_changed_at
    into v_tally_nickname, v_tally_changed_at
    from (
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_tally_ho_leaderboard
        where player_fingerprint = v_fingerprint
      union all
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_cant_stop_leaderboard
        where player_fingerprint = v_fingerprint
    ) shared_game_names
    order by last_nickname_changed_at desc, updated_at desc
    limit 1;

  select *
    into v_existing
    from public.fantasy_leaderboard
    where player_fingerprint = v_fingerprint
      and include_expansion = coalesce(p_include_expansion, false)
    for update;

  if not found then
    if v_tally_nickname is not null
       and v_tally_nickname is distinct from v_nickname
       and v_tally_changed_at > v_now - interval '1 day' then
      v_nickname := v_tally_nickname;
      v_nickname_allowed := false;
    end if;

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
      'nickname_updated', v_nickname_allowed,
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
    elsif v_tally_nickname is not null
       and v_tally_nickname is distinct from v_nickname
       and v_tally_changed_at > v_now - interval '1 day' then
      v_nickname := v_tally_nickname;
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

drop function if exists public.fantasy_submit_tally_ho_score(text, integer, text, text, text, boolean);

create or replace function public.fantasy_submit_tally_ho_score(
  p_nickname text,
  p_score integer,
  p_team text,
  p_ai_difficulty text default null,
  p_opponent_name text default null,
  p_won boolean default false
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
  v_team text := lower(trim(coalesce(p_team, '')));
  v_existing public.fantasy_tally_ho_leaderboard%rowtype;
  v_tally_nickname text;
  v_tally_changed_at timestamptz;
  v_fantasy_nickname text;
  v_fantasy_changed_at timestamptz;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_score_updated boolean := false;
  v_nickname_allowed boolean := true;
begin
  if char_length(v_nickname) < 2 or v_nickname = '나' then
    raise exception 'invalid nickname'
      using errcode = '22023';
  end if;

  if v_team not in ('animals', 'hunters') then
    raise exception 'invalid tally team'
      using errcode = '22023';
  end if;

  select nickname, last_nickname_changed_at
    into v_fantasy_nickname, v_fantasy_changed_at
    from public.fantasy_leaderboard
    where player_fingerprint = v_fingerprint
    order by last_nickname_changed_at desc, updated_at desc
    limit 1;

  select nickname, last_nickname_changed_at
    into v_tally_nickname, v_tally_changed_at
    from (
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_tally_ho_leaderboard
        where player_fingerprint = v_fingerprint
      union all
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_cant_stop_leaderboard
        where player_fingerprint = v_fingerprint
    ) shared_side_game_names
    order by last_nickname_changed_at desc, updated_at desc
    limit 1;

  select *
    into v_existing
    from public.fantasy_tally_ho_leaderboard
    where player_fingerprint = v_fingerprint
      and team = v_team
    for update;

  if not found then
    if v_tally_nickname is not null
       and v_tally_nickname is distinct from v_nickname
       and v_tally_changed_at > v_now - interval '1 day' then
      v_nickname := v_tally_nickname;
      v_nickname_allowed := false;
    elsif v_fantasy_nickname is not null
       and v_fantasy_nickname is distinct from v_nickname
       and v_fantasy_changed_at > v_now - interval '1 day' then
      v_nickname := v_fantasy_nickname;
      v_nickname_allowed := false;
    end if;

    insert into public.fantasy_tally_ho_leaderboard (
      player_fingerprint,
      nickname,
      score,
      team,
      ai_difficulty,
      opponent_name,
      won,
      last_nickname_changed_at,
      updated_at
    )
    values (
      v_fingerprint,
      v_nickname,
      v_score,
      v_team,
      left(coalesce(p_ai_difficulty, ''), 32),
      left(coalesce(p_opponent_name, ''), 32),
      coalesce(p_won, false),
      coalesce(v_tally_changed_at, v_fantasy_changed_at, v_now),
      v_now
    )
    returning * into v_existing;

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'nickname_updated', v_nickname_allowed,
      'nickname', v_existing.nickname,
      'score', v_existing.score,
      'team', v_existing.team
    );
  end if;

  v_score_updated := v_score > v_existing.score;

  if v_existing.nickname is distinct from v_nickname then
    if v_existing.last_nickname_changed_at > v_now - interval '1 day' then
      v_nickname := v_existing.nickname;
      v_nickname_allowed := false;
    elsif v_tally_nickname is not null
       and v_tally_nickname is distinct from v_nickname
       and v_tally_changed_at > v_now - interval '1 day' then
      v_nickname := v_tally_nickname;
      v_nickname_allowed := false;
    elsif v_fantasy_nickname is not null
       and v_fantasy_nickname is distinct from v_nickname
       and v_fantasy_changed_at > v_now - interval '1 day' then
      v_nickname := v_fantasy_nickname;
      v_nickname_allowed := false;
    end if;
  end if;

  update public.fantasy_tally_ho_leaderboard
    set nickname = v_nickname,
        score = case when v_score_updated then v_score else score end,
        ai_difficulty = case when v_score_updated then left(coalesce(p_ai_difficulty, ''), 32) else ai_difficulty end,
        opponent_name = case when v_score_updated then left(coalesce(p_opponent_name, ''), 32) else opponent_name end,
        won = case when v_score_updated then coalesce(p_won, false) else won end,
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
    'team', v_existing.team
  );
end;
$$;

grant execute on function public.fantasy_submit_tally_ho_score(text, integer, text, text, text, boolean) to anon;

drop function if exists public.fantasy_submit_cant_stop_score(text, integer, integer, integer, text, text, boolean);

create or replace function public.fantasy_submit_cant_stop_score(
  p_nickname text,
  p_score integer,
  p_columns_claimed integer default 0,
  p_turns integer default 0,
  p_ai_difficulty text default null,
  p_opponent_name text default null,
  p_won boolean default false
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
  v_existing public.fantasy_cant_stop_leaderboard%rowtype;
  v_shared_nickname text;
  v_shared_changed_at timestamptz;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_columns_claimed integer := least(greatest(coalesce(p_columns_claimed, 0), 0), 3);
  v_turns integer := greatest(coalesce(p_turns, 0), 0);
  v_score_updated boolean := false;
  v_turns_updated boolean := false;
  v_nickname_allowed boolean := true;
  v_last_nickname_changed_at timestamptz := v_now;
begin
  if char_length(v_nickname) < 2 or v_nickname = '나' then
    raise exception 'invalid nickname'
      using errcode = '22023';
  end if;

  if coalesce(p_won, false) is not true then
    return jsonb_build_object(
      'created', false,
      'score_updated', false,
      'turns_updated', false,
      'nickname_updated', true,
      'skipped', true,
      'nickname', v_nickname,
      'score', v_score,
      'turns', v_turns
    );
  end if;

  select nickname, last_nickname_changed_at
    into v_shared_nickname, v_shared_changed_at
    from (
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_leaderboard
        where player_fingerprint = v_fingerprint
      union all
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_tally_ho_leaderboard
        where player_fingerprint = v_fingerprint
      union all
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_cant_stop_leaderboard
        where player_fingerprint = v_fingerprint
    ) shared_game_names
    order by last_nickname_changed_at desc, updated_at desc
    limit 1;

  select *
    into v_existing
    from public.fantasy_cant_stop_leaderboard
    where player_fingerprint = v_fingerprint
    for update;

  if not found then
    if v_shared_nickname is not null
       and v_shared_nickname is distinct from v_nickname
       and v_shared_changed_at > v_now - interval '1 day' then
      v_nickname := v_shared_nickname;
      v_nickname_allowed := false;
      v_last_nickname_changed_at := v_shared_changed_at;
    elsif v_shared_nickname is not null
       and v_shared_nickname is not distinct from v_nickname then
      v_last_nickname_changed_at := v_shared_changed_at;
    end if;

    insert into public.fantasy_cant_stop_leaderboard (
      player_fingerprint,
      nickname,
      score,
      columns_claimed,
      turns,
      ai_difficulty,
      opponent_name,
      won,
      last_nickname_changed_at,
      updated_at
    )
    values (
      v_fingerprint,
      v_nickname,
      v_score,
      v_columns_claimed,
      v_turns,
      left(coalesce(p_ai_difficulty, ''), 32),
      left(coalesce(p_opponent_name, ''), 32),
      true,
      coalesce(v_last_nickname_changed_at, v_now),
      v_now
    )
    returning * into v_existing;

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'turns_updated', true,
      'nickname_updated', v_nickname_allowed,
      'nickname', v_existing.nickname,
      'score', v_existing.score,
      'turns', v_existing.turns
    );
  end if;

  v_turns_updated := v_turns > 0 and (
    coalesce(v_existing.won, false) is not true
    or coalesce(v_existing.turns, 0) = 0
    or v_turns < v_existing.turns
    or (v_turns = v_existing.turns and v_score > v_existing.score)
  );
  v_score_updated := v_turns_updated;

  if v_existing.nickname is distinct from v_nickname then
    if v_existing.last_nickname_changed_at > v_now - interval '1 day' then
      v_nickname := v_existing.nickname;
      v_nickname_allowed := false;
    elsif v_shared_nickname is not null
       and v_shared_nickname is distinct from v_nickname
       and v_shared_changed_at > v_now - interval '1 day' then
      v_nickname := v_shared_nickname;
      v_nickname_allowed := false;
    end if;
  end if;

  update public.fantasy_cant_stop_leaderboard
    set nickname = v_nickname,
        score = case when v_score_updated then v_score else score end,
        columns_claimed = case when v_score_updated then v_columns_claimed else columns_claimed end,
        turns = case when v_score_updated then v_turns else turns end,
        ai_difficulty = case when v_score_updated then left(coalesce(p_ai_difficulty, ''), 32) else ai_difficulty end,
        opponent_name = case when v_score_updated then left(coalesce(p_opponent_name, ''), 32) else opponent_name end,
        won = case when v_score_updated then true else won end,
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
    'turns_updated', v_turns_updated,
    'nickname_updated', v_nickname_allowed,
    'nickname', v_existing.nickname,
    'score', v_existing.score,
    'turns', v_existing.turns
  );
end;
$$;

grant execute on function public.fantasy_submit_cant_stop_score(text, integer, integer, integer, text, text, boolean) to anon;

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
