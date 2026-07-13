-- supabase-monopoly-ranking.sql
-- 부루마불(Monopoly) 전용 랭킹 시스템
-- 랭킹 1: 최소 턴 수로 이긴 사람 (ORDER BY turns ASC)
-- 랭킹 2: 최대 금액으로 이긴 사람 (ORDER BY score DESC)
-- KitschMix 정책 = IP당 1명 (fingerprint 기반 1인 1기록)

-- ============================================================================
-- 1. 부루마불 랭킹 테이블
-- ============================================================================
create table if not exists public.fantasy_monopoly_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_fingerprint text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '익명'),
  score integer not null default 0 check (score >= 0),
  turns integer not null default 0 check (turns >= 0),
  ai_difficulty text,
  player_count integer not null default 2 check (player_count between 2 and 4),
  won boolean not null default false,
  last_nickname_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 컬럼 마이그레이션 (기존 테이블에 컬럼 추가)
alter table public.fantasy_monopoly_leaderboard
  add column if not exists turns integer not null default 0,
  add column if not exists ai_difficulty text,
  add column if not exists player_count integer not null default 2,
  add column if not exists won boolean not null default false,
  add column if not exists last_nickname_changed_at timestamptz not null default now();

-- 닉네임 체크 제약
alter table public.fantasy_monopoly_leaderboard
  drop constraint if exists fantasy_monopoly_leaderboard_nickname_check;

update public.fantasy_monopoly_leaderboard
  set nickname = '익명 플레이어'
  where char_length(trim(coalesce(nickname, ''))) < 2
    or trim(nickname) = '익명';

alter table public.fantasy_monopoly_leaderboard
  add constraint fantasy_monopoly_leaderboard_nickname_check
  check (char_length(nickname) between 2 and 12 and nickname <> '익명') not valid;

alter table public.fantasy_monopoly_leaderboard
  validate constraint fantasy_monopoly_leaderboard_nickname_check;

-- fingerprint unique 제약 (1 IP 1 기록)
alter table public.fantasy_monopoly_leaderboard
  drop constraint if exists fantasy_monopoly_leaderboard_player_fingerprint_key;

drop index if exists public.fantasy_monopoly_leaderboard_player_fingerprint_key;

-- 중복 제거 후 unique 제약 추가
with duplicate_rows as (
  select id,
         row_number() over (
           partition by player_fingerprint
           order by case when won and turns > 0 then turns else 2147483647 end asc,
                    score desc,
                    updated_at asc,
                    created_at asc
         ) as row_number
    from public.fantasy_monopoly_leaderboard
)
delete from public.fantasy_monopoly_leaderboard leaderboard
  using duplicate_rows
  where leaderboard.id = duplicate_rows.id
    and duplicate_rows.row_number > 1;

alter table public.fantasy_monopoly_leaderboard
  add constraint fantasy_monopoly_leaderboard_player_fingerprint_key
  unique (player_fingerprint);

-- ============================================================================
-- 2. 인덱스 (랭킹 2개용)
-- ============================================================================

-- 랭킹 1: 최대 금액 랭킹 (가장 많이 가진 사람이 1등)
create index if not exists fantasy_monopoly_leaderboard_score_idx
  on public.fantasy_monopoly_leaderboard(score desc, updated_at asc)
  where won = true;

-- 랭킹 2: 최소 턴 수 랭킹 (가장 빨리 이긴 사람이 1등)
create index if not exists fantasy_monopoly_leaderboard_turns_idx
  on public.fantasy_monopoly_leaderboard(turns asc, score desc, updated_at asc)
  where won = true and turns > 0;

-- ============================================================================
-- 3. RLS 정책 (anon은 select만, insert/update/delete는 함수 통해서만)
-- ============================================================================
alter table public.fantasy_monopoly_leaderboard enable row level security;

drop policy if exists "monopoly leaderboard public read" on public.fantasy_monopoly_leaderboard;

create policy "monopoly leaderboard public read"
  on public.fantasy_monopoly_leaderboard
  for select
  using (true);

revoke insert, update, delete on public.fantasy_monopoly_leaderboard from anon;
grant select on public.fantasy_monopoly_leaderboard to anon;

-- ============================================================================
-- 4. 점수 제출 함수 (IP fingerprint 기반, 다른 게임과 닉네임 공유)
-- ============================================================================
drop function if exists public.fantasy_submit_monopoly_score(text, integer, integer, text, integer, boolean);

create or replace function public.fantasy_submit_monopoly_score(
  p_nickname text,
  p_score integer,
  p_turns integer default 0,
  p_ai_difficulty text default null,
  p_player_count integer default 2,
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
  v_existing public.fantasy_monopoly_leaderboard%rowtype;
  v_shared_nickname text;
  v_shared_changed_at timestamptz;
  v_score integer := greatest(coalesce(p_score, 0), 0);
  v_turns integer := greatest(coalesce(p_turns, 0), 0);
  v_player_count integer := least(greatest(coalesce(p_player_count, 2), 2), 4);
  v_score_updated boolean := false;
  v_turns_updated boolean := false;
  v_nickname_allowed boolean := true;
  v_last_nickname_changed_at timestamptz := v_now;
begin
  -- 닉네임 검증
  if char_length(v_nickname) < 2 or v_nickname = '익명' then
    raise exception 'invalid nickname'
      using errcode = '22023';
  end if;

  -- 패배는 점수만 반환 (저장 안 함)
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

  -- 다른 게임에서 사용 중인 닉네임 공유 (최근 1일 이내 변경분)
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
      union all
      select nickname, last_nickname_changed_at, updated_at
        from public.fantasy_monopoly_leaderboard
        where player_fingerprint = v_fingerprint
    ) shared_game_names
    order by last_nickname_changed_at desc, updated_at desc
    limit 1;

  -- 기존 기록 잠금
  select *
    into v_existing
    from public.fantasy_monopoly_leaderboard
    where player_fingerprint = v_fingerprint
    for update;

  if not found then
    -- 새 기록 삽입
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

    insert into public.fantasy_monopoly_leaderboard (
      player_fingerprint,
      nickname,
      score,
      turns,
      ai_difficulty,
      player_count,
      won,
      last_nickname_changed_at,
      updated_at
    )
    values (
      v_fingerprint,
      v_nickname,
      v_score,
      v_turns,
      left(coalesce(p_ai_difficulty, ''), 32),
      v_player_count,
      true,
      coalesce(v_last_nickname_changed_at, v_now),
      v_now
    );

    return jsonb_build_object(
      'created', true,
      'score_updated', true,
      'turns_updated', true,
      'nickname_updated', not v_nickname_allowed,
      'nickname', v_nickname,
      'score', v_score,
      'turns', v_turns
    );
  end if;

  -- 기존 기록 있음 → 점수/턴 비교 후 업데이트
  -- 최대 금액 랭킹: 더 많은 돈을 가진 경우만 업데이트
  if v_score > v_existing.score then
    v_score_updated := true;
  end if;

  -- 최소 턴 수 랭킹: 더 적은 턴으로 이긴 경우만 업데이트
  if v_turns > 0 and (v_existing.turns = 0 or v_turns < v_existing.turns) then
    v_turns_updated := true;
  end if;

  -- 둘 다 업데이트가 필요 없으면 닉네임만 갱신 후 종료
  if not v_score_updated and not v_turns_updated then
    return jsonb_build_object(
      'created', false,
      'score_updated', false,
      'turns_updated', false,
      'nickname_updated', false,
      'skipped', true,
      'nickname', v_existing.nickname,
      'score', v_existing.score,
      'turns', v_existing.turns
    );
  end if;

  -- 닉네임 변경 정책 (1일 이내 다른 게임에서 변경한 적 있으면 막힘)
  if v_existing.nickname is distinct from v_nickname then
    if v_existing.last_nickname_changed_at > v_now - interval '1 day' then
      v_nickname := v_existing.nickname;
      v_nickname_allowed := false;
    else
      v_last_nickname_changed_at := v_now;
    end if;
  end if;

  update public.fantasy_monopoly_leaderboard
    set nickname = v_nickname,
        score = case when v_score_updated then v_score else score end,
        turns = case when v_turns_updated then v_turns else turns end,
        ai_difficulty = case when v_score_updated or v_turns_updated then left(coalesce(p_ai_difficulty, ''), 32) else ai_difficulty end,
        player_count = case when v_score_updated or v_turns_updated then v_player_count else player_count end,
        won = true,
        last_nickname_changed_at = coalesce(v_last_nickname_changed_at, v_existing.last_nickname_changed_at),
        updated_at = v_now
    where player_fingerprint = v_fingerprint;

  return jsonb_build_object(
    'created', false,
    'score_updated', v_score_updated,
    'turns_updated', v_turns_updated,
    'nickname_updated', v_existing.nickname is distinct from v_nickname,
    'skipped', false,
    'nickname', v_nickname,
    'score', case when v_score_updated then v_score else v_existing.score end,
    'turns', case when v_turns_updated then v_turns else v_existing.turns end
  );
end;
$$;

grant execute on function public.fantasy_submit_monopoly_score(text, integer, integer, text, integer, boolean) to anon;

-- ============================================================================
-- 사용 예시
-- ============================================================================

-- 부루마불 승리 시 기록 (점수 1500만원, 25턴, AI 어려움)
-- select fantasy_submit_monopoly_score('플레이어', 15000000, 25, 'hard', 3, true);

-- 최대 금액 랭킹 TOP 10 조회:
-- select nickname, score, turns, player_count
--   from fantasy_monopoly_leaderboard
--   where won = true
--   order by score desc
--   limit 10;

-- 최소 턴 수 랭킹 TOP 10 조회:
-- select nickname, turns, score, player_count
--   from fantasy_monopoly_leaderboard
--   where won = true and turns > 0
--   order by turns asc, score desc
--   limit 10;

