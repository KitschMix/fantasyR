-- supabase-player-stats.sql
-- 플레이어별 게임 결과를 저장하고 집계하는 테이블
-- KitschMix 계정 = 닉네임 1개 기준 (IP별 누적 통계)

-- ============================================================================
-- 1. 게임 결과 저장 테이블
-- ============================================================================
create table if not exists public.fantasy_player_stats (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  game_type text not null check (game_type in ('fantasy', 'splendor', 'monopoly', 'clue', 'cant-stop', 'tally-ho', 'sushi-go', 'dominion')),
  result text not null check (result in ('win', 'loss', 'draw')),
  score integer not null default 0 check (score >= 0),
  duration_sec integer not null default 0 check (duration_sec >= 0),
  player_count integer not null default 2 check (player_count between 2 and 4),
  deck_list jsonb,
  played_at timestamptz not null default now()
);

-- 인덱스: 닉네임별/게임별/날짜별 빠른 조회
create index if not exists fantasy_player_stats_nickname_idx
  on public.fantasy_player_stats(nickname);

create index if not exists fantasy_player_stats_game_type_idx
  on public.fantasy_player_stats(game_type);

create index if not exists fantasy_player_stats_played_at_idx
  on public.fantasy_player_stats(played_at desc);

create index if not exists fantasy_player_stats_nickname_played_at_idx
  on public.fantasy_player_stats(nickname, played_at desc);

-- ============================================================================
-- 2. RLS 정책 (다른 정책과 동일: public read/insert/update/delete)
-- ============================================================================
alter table public.fantasy_player_stats enable row level security;

drop policy if exists "stats public read" on public.fantasy_player_stats;
drop policy if exists "stats public insert" on public.fantasy_player_stats;
drop policy if exists "stats public update" on public.fantasy_player_stats;
drop policy if exists "stats public delete" on public.fantasy_player_stats;

create policy "stats public read"
  on public.fantasy_player_stats
  for select
  using (true);

create policy "stats public insert"
  on public.fantasy_player_stats
  for insert
  with check (true);

create policy "stats public update"
  on public.fantasy_player_stats
  for update
  using (true)
  with check (true);

create policy "stats public delete"
  on public.fantasy_player_stats
  for delete
  using (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.fantasy_player_stats to anon;

-- ============================================================================
-- 3. 집계 뷰 (선택): 닉네임별 누적 통계 빠른 조회
-- ============================================================================
create or replace view public.fantasy_player_summary as
select
  nickname,
  count(*) as total_games,
  count(*) filter (where result = 'win') as wins,
  count(*) filter (where result = 'loss') as losses,
  count(*) filter (where result = 'draw') as draws,
  case
    when count(*) = 0 then 0
    else round((count(*) filter (where result = 'win'))::numeric / count(*) * 100, 1)
  end as win_rate_pct,
  coalesce(sum(score) filter (where result = 'win'), 0) as total_score,
  coalesce(avg(score) filter (where result = 'win'), 0)::numeric(10,1) as avg_win_score,
  coalesce(sum(duration_sec), 0) as total_duration_sec,
  coalesce(sum(duration_sec) filter (where played_at > now() - interval '7 days'), 0) as week_duration_sec,
  max(played_at) as last_played_at
from public.fantasy_player_stats
group by nickname;

grant select on public.fantasy_player_summary to anon;

-- ============================================================================
-- 사용 예시
-- ============================================================================
-- 게임 결과 저장:
-- insert into public.fantasy_player_stats (nickname, game_type, result, score, duration_sec, player_count)
-- values ('테스터', 'fantasy', 'win', 250, 1800, 3);

-- 닉네임별 통계 조회:
-- select * from fantasy_player_summary where nickname = '테스터';

-- 최근 게임 히스토리:
-- select * from fantasy_player_stats
-- where nickname = '테스터'
-- order by played_at desc
-- limit 10;