# Handoff — 2026-07-13

## 현재 상태 (Current State)

- **Branch**: `main`
- **Last commit**: `2598377` (방금)
- **Live URL**: `https://fantasyr.vercel.app` (Vercel 자동 배포)
- **GitHub**: `https://github.com/KitschMix/fantasyR`

## 방금 완료한 작업

### 1. 부루마불/전 게임 랭킹 UI 살림
- 5개 게임 HTML (splendor, monopoly, clue, sushi-go, dominion)에 supabase-js CDN + supabase-config.js + player-stats.js + DOMContentLoaded ranking script 추가
- fantasy.html + index.html도 jsdelivr → unpkg로 변경
- 모든 게임 (8개) 랭킹 UI 작동

### 2. 빈 상태 메시지
- scripts/player-stats.js의 renderTopRankings()에 이미 구현됨
- 데이터 없을 때: "아직 기록이 없습니다." 자동 표시

### 3. 커밋
- `2598377 fix(rankings): 5개 게임 supabase-js CDN 복구 + ranking script 추가`

## 다음 작업자를 위한 가이드

### 중요 규칙 (GIT-WORKFLOW.md 참조)
1. 모든 게임은 랭킹 UI가 있어야 한다 - <div id="xxxRanking"> + Supabase fantasy_player_summary 연동
2. 빈 상태 처리 - 데이터 없을 때 "아직 기록이 없습니다." 자동 표시
3. Supabase JS CDN - https://unpkg.com/@supabase/supabase-js@2 (Vercel에서 jsdelivr 차단)
4. 랭킹 UI 호출 패턴:
```html
<script>
  document.addEventListener("DOMContentLoaded", () => {
    if (window.FANTASY_PLAYER_STATS?.renderTopRankings) {
      window.FANTASY_PLAYER_STATS.renderTopRankings(
        document.getElementById("xxxRanking"),
        "game_type",
        { title: "🏆 게임명 TOP 10 랭킹" }
      );
    }
  });
</script>
```

### 알려진 이슈
- jsdelivr CDN 차단: Vercel 환경에서 unpkg 사용
- rebase 덮어쓰기: 우리 작업이 다른 AI에 덮어쓰여질 수 있음
- Vercel 캐시: 강력 새로고침 필요할 수 있음

### 진행 중인 작업
- [x] 부루마불 랭킹 UI 살림
- [x] 5개 게임 supabase-js CDN 복구
- [x] ranking script 추가
- [x] 빈 상태 메시지
- [x] handoff.md 재작성
- [ ] Supabase 추가 테스트 데이터 (선택)
- [ ] 홈 위젯 강화 (선택)

## 시스템 아키텍처

### Supabase 통계 시스템
- 테이블: fantasy_player_stats (방금 추가)
  - 컬럼: id, nickname, game_type, result, score, duration_sec, player_count, deck_list, played_at
  - RLS: anon read/insert/update/delete 모두 허용
- 뷰: fantasy_player_summary (nickname별 집계)
- JS: scripts/player-stats.js
  - recordGame(), fetchSummary(), fetchRecentGames(), fetchTopRankings()
  - renderHubWidget(), renderTopRankings()
  - window.FANTASY_PLAYER_STATS 전역 노출

### AI 난이도 시스템
- 5개 게임 (splendor, monopoly, clue, sushi-go, dominion)의 aiProfiles()에 state.aiDifficulty 분기
- normal/hard/expert: 기본 풀
- random: 모든 그룹 섞음
- 5개 게임 HTML에 <select id="xxxDifficultySelect"> 추가

## 다음 작업 추천
- 테스트 데이터 추가 (Supabase fantasy_player_stats에 더 많은 INSERT)
- 홈 위젯 강화 (최근 게임, 최고 점수, 연승 등)
- 연승 추적 (별도 컬럼)
- 게임 내 통계 (이번 판 통계 별도 표시)
- 다른 AI가 작업할 때 이 문서와 GIT-WORKFLOW.md 먼저 참조
