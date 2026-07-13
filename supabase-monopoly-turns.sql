-- supabase-monopoly-turns.sql
-- 부루마불 랭킹 패널 보강: 최단 게임 기준을 "경과 시간(duration_sec)" → "턴 수(turns)"로 전환
-- 1. fantasy_player_stats 에 turns 컬럼 추가
-- 2. 모노폴리 leaveGame() 에서 state.turnCount 기록
-- 3. 랭킹 패널: "최고 점수 TOP 10" 제거, "최단 턴 TOP 10" 신설

-- ============================================================================
-- 1. 컬럼 추가 (기존 row는 turns=0 기본값)
-- ============================================================================
alter table public.fantasy_player_stats
  add column if not exists turns integer not null default 0 check (turns >= 0);

-- ============================================================================
-- 2. 인덱스 (승리 게임 중 턴 수 오름차순)
-- ============================================================================
create index if not exists fantasy_player_stats_turns_idx
  on public.fantasy_player_stats(turns asc, score desc, played_at asc)
  where result = 'win' and turns > 0;
