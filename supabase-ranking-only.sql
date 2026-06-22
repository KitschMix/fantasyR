create extension if not exists pgcrypto;

create table if not exists public.fantasy_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_fingerprint text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  score integer not null default 0 check (score >= 0),
  player_count integer check (player_count between 1 and 4),
  include_expansion boolean not null default false,
  ai_difficulty text,
  last_nickname_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

do $$
begin
  alter table public.fantasy_leaderboard
    add constraint fantasy_leaderboard_player_fingerprint_mode_key
    unique (player_fingerprint, include_expansion);
exception
  when duplicate_object then null;
end $$;

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

create or replace function public.fantasy_submit_leaderboard_score(
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
  v_fingerprint text := encode(digest('fantasyR:' || trim(coalesce(v_ip, 'unknown')), 'sha256'), 'hex');
  v_now timestamptz := now();
  v_nickname text := left(regexp_replace(trim(coalesce(p_nickname, '')), '[[:space:]]+', ' ', 'g'), 12);
  v_existing public.fantasy_leaderboard%rowtype;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_score_updated boolean := false;
  v_nickname_allowed boolean := true;
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
      v_now,
      v_now
    )
    returning * into v_existing;

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'nickname_updated', true,
      'nickname', v_existing.nickname,
      'score', v_existing.score
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
    'score', v_existing.score
  );
end;
$$;

grant execute on function public.fantasy_submit_leaderboard_score(text, integer, integer, boolean, text) to anon;

notify pgrst, 'reload schema';
