# Handoff — 2026-07-14 (새벽)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | (현재 머신) `F:\문서\Playground\fantasy-kingdom-pc` (구 노트북은 `e:\Download\fantasy-kingdom-pc`) |
| 브랜치 | `main` |
| 마지막 커밋 | `f5ccf44 feat(ranking): setup-shell auto h3 inject + dominion first test` |
| 이번 세션 커밋 흐름 | `263f2d1` → `44d5c0a` → `f5ccf44` → **(Soft 자동화 배포 후 추가)** |
| 직전 통합 커밋 | `00b0f01 refactor(setup): 5게임 시작화면을 공통 setup-shell로 통합 + handoff 5토큰 일괄 도입` |
| GitHub | https://github.com/KitschMix/fantasyR |
| 라이브 URL | https://fantasyr.vercel.app (Vercel 자동 배포) |
| 로컬 서버 | `python -m http.server 8765 --bind 127.0.0.1` (필요 시 수동 실행) |
| 터미널 | PowerShell 5.1 (Windows) |
| 직전 세션 | (이전 기재: codex/minimax 가능성) — 본 세션에서 직접 마무리. 시작 전 `git log --oneline -10` / `git status --short` 확인 |

---

## 2. 이번 세션에서 완료한 일

### 2.1 시작 화면 통합 (`00b0f01`)
- **5게임**에 공통 셸(`setup-shell.css` + `setup-shell.js`) 일괄 적용: clue, monopoly, sushi-go, splendor, dominion
- **Tier B**(cant-stop / tally-ho / fantasy)는 직전 세션에서 이미 적용됨
- **8개 게임 모두** 동일한 `game-setup-shell` 구조 + 5토큰(`--setup-accent`, `--setup-max-width`, `--setup-panel-radius`, `--setup-gap`, `--setup-logo-height`) 사용
- 게임별 색/사이즈는 모두 **compound class**(`.<game>-setup-shell`) 안에서만 override
- `setup-shell.css`에서 `var(--setup-*)` 17+ 회 적용, 게임 CSS의 리터럴 폭/여백 제거
- 미디어 쿼리 3단 분기 (1180 / 860 / 560px) — 신규 게임도 그대로 따라옴

### 2.2 시작화면 가이드 문서화 (`d063399`)
- [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) 신규 추가 (10 섹션)
- 새 게임 추가 시 따라야 할 8단계 절차 + PR 전 체크리스트 포함
- HTML 골격 예시, 5토큰 표, JS 자동 부착 데이터-attribute 표 수록

### 2.3 부루마불/클루 랭킹 의미 수정 + 라벨 자동화 (`263f2d1` → `44d5c0a` → `f5ccf44` → Soft 자동화 배포)
**배경**: 랭킹 패널에서 "최고 점수/최단 시간"만으로는 보드게임의 의미를 못 살림
**결과**: monopoly(남은 돈=점수)를 "최단 턴"으로, clue(score=0 고정 버그)를 "최단 턴"으로 교체. splendor/sushi-go/dominion은 점수가 의미 있어 그대로 둠.

| 커밋 | 내용 |
|---|---|
| `263f2d1` | monopoly: '최고 점수' 패널 삭제 + '최단 턴 TOP 10' 추가. leaveGame에서 `turns: state.turnCount` 기록 |
| `44d5c0a` | clue: '누적 점수(score=0 버그)' 패널을 '최단 턴 TOP 10'으로 교체. finishGame에서 `turns: state.turnSerial` 기록 |
| `f5ccf44` | setup-shell.js `RANKING_LABELS` 맵 + `ensureRankingHeading` 함수. HTML에 `<h3>` 없으면 자동 주입. dominion 첫 적용 (h3 제거 + `data-ranking-mode="score"` + `data-ranking-title="누적 점수 TOP 10"`) |

**DB 변경**: `fantasy_player_stats.turns` 컬럼 + 인덱스 (`supabase-monopoly-turns.sql`)
- ⚠️ **사용자가 직접 Supabase Dashboard SQL Editor 에서 실행 필요** (anon key로는 DDL 불가)
- 안 돌리면 새 게임 recordGame 시 turns 컬럼 부재로 silent fail, 랭킹 패널은 "아직 승리 기록이 없습니다" fallback

**자동화 메커니즘** (다음 새 게임 등록 시):
```html
<ol data-live-ranking data-game-type="neongame" data-ranking-mode="turns"></ol>
```
- 이 한 줄이면 `<h3>최단 턴 TOP 10</h3>` 자동 생성
- `data-ranking-title="다른 이름"` 으로 명시적 오버라이드 가능

### 2.4 멀티플레이 라벨 통합 + 도미니언 멀티 자동 부착 (커밋 예정)
- `setup-shell.js` 에 `MULTIPLAYER_LABELS` 맵 (8게임 공통) 추가
- `ensureMultiplayerPanel(grid)` — `.game-setup-grid` 에 `.online-panel` 없으면 마지막 single-panel 형제로 "준비 중" 패널 자동 주입
- **도미니언이 이제 멀티플레이 섹션을 가지게 됨** (다른 7게임은 이미 있었음)
- 첫 화면 버튼 / 게임 시작 버튼 / 플레이어 수 셀렉트 / AI 난이도 셀렉트 — 이미 8게임 공통 (memory rule #3, START_SCREEN_GUIDE §3)으로 추가 작업 불필요

### 2.5 게임별 랭킹 metric 결정표 (이번 세션 확정)
| 게임 | metric | mode | 비고 |
|---|---|---|---|
| monopoly | 남은 돈이 무의미 → 턴 수 | turns | 이 세션에서 변경 |
| clue | score=0 버그 → 턴 수 | turns | 이 세션에서 변경 |
| splendor | 보석 수 (=점수 자체) | score | 유지 |
| sushi-go | 초밥 합산 | score | 유지 |
| dominion | VP (승리점수) | score | 유지 |
| cant-stop | 별도 테이블 `fantasy_cant_stop_leaderboard` | 자체 시스템 | 손 안 댐 |
| tally-ho | 별도 테이블 `fantasy_tally_ho_leaderboard` | 팀제 | 손 안 댐 |
| fantasy | 별도 테이블 `fantasy_leaderboard` | 자체 | 손 안 댐 |

---

## 3. 현재 코드 상태 (commit 기준: `d063399`)

### 3.1 시작 화면 셸
| 파일 | 상태 | 비고 |
|---|---|---|
| `setup-shell.css` | ✅ 5토큰 + 17+ 셀렉터 정리 | 게임별 compound class만 override |
| `setup-shell.js` | ✅ 자동 부착 5종 | scale, dialog, ranking, preview-refresh |
| `scripts/player-stats.js` | ✅ 정상 | renderTopRankings 등 사용 |
| `clue.html` / `clue.css` | ✅ 셸 적용 | reference 게임 |
| `monopoly.html` / `monopoly.css` | ✅ 셸 적용 | 가장 큰 변경 폭 |
| `sushi-go.html` / `sushi-go.css` | ✅ 셸 적용 | |
| `splendor.html` / `splendor.css` | ✅ 셸 적용 | |
| `dominion.html` / `dominion.css` | ✅ 셸 적용 (마지막) | |
| `cant-stop.html` / `cant-stop.css` | ✅ Tier B 셸 | |
| `tally-ho.html` / `tally-ho.css` | ✅ Tier B 셸 | |
| `fantasy.html` | ✅ Tier B 셸 | |

### 3.2 백엔드 / DB
- Supabase 테이블/뷰: `fantasy_player_stats`, `fantasy_player_summary` (RLS 모두 허용)
- JS API: `recordGame`, `fetchSummary`, `fetchRecentGames`, `fetchTopRankings`
- `fetchTopRankingsByScore('game_type', n)` 형태로 8게임 모두 연결
- 빈 상태: "아직 기록이 없습니다." 자동 표시

### 3.3 git remote
- `origin` → `https://github.com/KitschMix/fantasyR.git`
- `origin/codex/add-sushi-splendor-setup` 등 잔존 브랜치는 향후 정리 대상 (이번 작업 무관)

---

## 4. 빠른 시작 — 다음 세션에서 할 일

### 4.1 세션 시작 시
```powershell
cd e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc
git status --short
git log --oneline -20
# 작업 중이면 git stash list 확인
```

### 4.2 로컬 미리보기
```powershell
python -m http.server 8765 --bind 127.0.0.1
# 브라우저에서 http://127.0.0.1:8765/<game>.html
```

### 4.3 작업 후 배포
- 커밋 메시지는 한국어 + Conventional Commits
- PR/직접 push는 `git push origin main` → Vercel 자동 배포
- 자세한 절차: [GIT-WORKFLOW.md](GIT-WORKFLOW.md)

---

## 5. 진행 중 / 대기 작업 (다음 세션 후보)

| 우선순위 | 작업 | 메모 |
|---|---|---|
| 🟡 중간 | 잔존 feature 브랜치 정리 (`origin/codex/*`) | `git fetch --prune` 후 미사용 브랜치 삭제 |
| 🟡 중간 | 자동 검증 스크립트(스크린샷) 표준화 | 8게임 × 2 viewport (1280/768) 회귀 테스트 고정 |
| 🟢 낮음 | Supabase 테스트 데이터 보강 | `fantasy_player_stats`에 더 많은 INSERT → 랭킹 UX 검증 |
| 🟢 낮음 | 홈 위젯 강화 | 최근 게임 / 최고 점수 / 연승 별도 컬럼 |
| 🟢 낮음 | 연승 추적 컬럼 | 별도 컬럼 추가 또는 별도 RPC |
| 🟢 낮음 | 게임 내 통계 | 이번 판 통계 별도 표시 |
| 🔵 선택 | 새 게임 추가 (예: Azul, Wingspan) | [START_SCREEN_GUIDE.md §7](START_SCREEN_GUIDE.md) 8단계 따르기 |

---

## 6. 알려진 이슈 / 함정

1. **CDN**: `jsdelivr.net`이 Vercel에서 차단됨 — 반드시 `https://unpkg.com/@supabase/supabase-js@2` 사용
2. **로컬 배율 캐시**: 직전 세션에서 셸 zoom을 50%로 설정했다면 다음 세션에도 `fantasyR.setupScalePercent = 100`로 리셋 필요
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`f5ccf44`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R` (혹은 URL에 `?v=커밋해시` 쿼리)
6. **turns 컬럼 미적용 시**: Supabase SQL 안 돌렸으면 recordGame의 turns 필드 때문에 신규 row insert 실패 가능. fallback이 `try/catch` 라 페이지 안 깨지지만 새 게임 기록이 안 잡힘
7. **Vercel 첫 배포 시 308 리다이렉트**: `https://fantasyr.vercel.app/monopoly.html` → `/monopoly` 로 영구 이동. PowerShell `Invoke-WebRequest`는 `-MaximumRedirection 3` 필요

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **squash 커밋**: 다중 파일 변경을 `00b0f01` 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (직전 세션에서 커밋됨, 5토큰 정의 근거)

---

마지막 갱신: 2026-07-13 (저녁) · `d063399`