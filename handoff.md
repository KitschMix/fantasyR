# Handoff — 2026-07-15 (새벽)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 | `c875307 feat(sushi-go): 카드 분배 88→110장 (사시미 6→14, 김밥 1/4→6, 김밥 2/6→12, 젓가락 6장 신규)` |
| 직전 통합 커밋 | `c367e52 feat(sushi-go): 카드 분배 공식화 + AI 스마트화 + 와사비 시각화 + 점수 상세` |
| 로컬 서버 | `python -m http.server 8765 --bind 127.0.0.1` (필요 시 수동 실행) |
| 터미널 | PowerShell 5.1 (Windows) |
| GitHub | https://github.com/KitschMix/fantasyR |
| 라이브 URL | https://fantasyr.vercel.app (Vercel 자동 배포) |

---

## 2. 이번 세션 (2026-07-14)에서 완료한 일

### 2.1 Git pull & 청소
- `git pull origin main` → `0007605..de03bc8` (5 신규 커밋 반영, fast-forward)
- 테스트 53/53, 파일 14/14 통과
- 로컬 잔존 `design-preview.html` (revert된 `ccfe6ec` 잔재) **삭제**
- 원격 잔존 `feat/monopoly-*` 25개 `git remote prune` 으로 정리
- 원격 `codex/*` 3개 (`add-sushi-splendor-setup`, `integrate-unified-setup`, `restore-character-names`) — 모두 main에 머지된 상태이므로 `git push origin --delete` 로 정리

### 2.2 handoff.md 갱신 (이 문서)
- 이전 `d063399` 기준 → 현재 `de03bc8` 기준으로 상태 갱신
- §3.1: setup-shell 자동 부착 5종 → 7종
- §3.3: 랭킹 패널 모드 변경 (monopoly/clue → turns, dominion → score 첫 테스트)
- §3.4: 신규 SQL `supabase-monopoly-turns.sql` 추가
- §5: 다음 세션 후보 보강 (로컬 잔존 브랜치 1개)

### 2.3 스플렌더 모바일 카드 — 별(점수) 2줄 표시 (`e5b018d`)
- **문제**: 모바일(≤640px)에서 카드 별이 한 줄로 표시되어 `★★★★★`가 106px 폭으로 카드 폭을 거의 다 차지
- **원인 분석**: `.splendor-card-points` 안의 ★가 단일 text node라서 grid item으로 인식 안 됨
- **수정**:
  - [splendor.js](splendor.js) — 글자별 `<span class="splendor-card-star">` 로 분리
  - [splendor.css](splendor.css) — 모바일 @media 안에서 `.splendor-card-points`를 `grid-template-columns: repeat(3, minmax(0, 1fr))` + `font-size: 20px` 로 적용
- **결과**: 5★ → `★★★`+`★★` (3+2), 4★ → `★★★`+`★` (3+1), 1~3★ → 1줄. PC 뷰는 grid 미적용으로 기존 한 줄 유지

### 2.4 스시고 게임 룰 검증 + 동점 룰 수정 (`c9e37da`)
- **플레이 검증**: 3명 게임 자동 플레이로 한 게임 완주 (라운드 3개 + 게임 종료). 카드 분배/왼쪽 패스/점수 계산/승자 결정 모두 정상 동작
- **발견된 룰 버그 2건** (원본 스시고! 룰북 위반):
  1. **김밥 동점 분배** (line 113): `Math.floor(6 / N)`으로 나누던 것을 → **모든 1등 동점자가 6점씩** 받도록 수정. 2등 점수는 1등 단독일 때만 3점
  2. **푸딩 동점 분배** (line 187): 동일 패턴 → **모든 1등 +6점, 모든 꼴등 -6점** 으로 수정
- **검증**: 9개 시나리오 (김밥 단독/2명동점/3명동점, 푸딩 단독/동점/모두같음) 콘솔 재현으로 모두 원본 룰과 일치 확인
- **검증 도구**: Playwright(412×900 모바일 뷰) + 브라우저 콘솔 단위 테스트. sushi-go.js IIFE 내부 함수 직접 호출 불가 → 동일 로직 재현으로 비교

### 2.5 다음 세션 후보 일괄 처리 (`c875307`)
- **로컬 잔존 브랜치 삭제**: `feat/monopoly-layout-zoom-restore` (`a241263`, 2026-07-07). main에서 한참 뒤처진 상태로 머지 시 다수 신규 파일/기능 제거되는 대규모 revert 발생 → `git branch -D` 로 폐기
- **원격 가지치기**: `git fetch --prune origin` 결과 `origin/main` 단일. 정리할 잔존 브랜치 없음
- **카드 카운트 88→110장 (`c875307`)**: 표준 스시고! 공식 분배 적용
  - 사시미 6→14, 김밥1 4→6, 김밥2 6→12, 김밥3 8 유지
  - 새우튀김 14, 만두 14, 계란 5, 연어 10, 문어 5, 푸딩 10, 와사비 6 (모두 유지)
  - **젓가락 6장 신규** (원본 Gamewright 공식은 4장이나 110장 맞추기 위해 6장. 스왑 메커닉 미구현 → 0점 데코 카드)
- **라운드 라벨 깜빡임** (`c367e52`에서 이미 처리됨): `endGame()` 진입 직전 `state.currentRound = TOTAL_ROUNDS` 로 강제. 트레이스: 라운드 3 종료 → 다음 라운드 클릭 → `currentRound` 가 4로 증가 → 4>3 → `endGame()` → currentRound=3 복원 → `renderAll()` → "라운드 3/3" 정상 표시

---

## 3. 누적 코드 상태 (commit 기준: `de03bc8`)

### 3.1 시작 화면 셸 (`setup-shell.css` + `setup-shell.js`)
| 영역 | 상태 | 비고 |
|---|---|---|
| `setup-shell.css` | ✅ 5토큰 + 17+ 셀렉터 정리 | 게임별 compound class만 override |
| `setup-shell.js` 자동 부착 | ✅ **7종** | scale, dialog, preview-refresh, live-ranking, **ranking-heading(h3)**, **multiplayer-panel**, live-ranking-refresh |
| `RANKING_LABELS` | ✅ 신규 | `turns`/`duration`/`score` 기본 라벨 + `data-ranking-title` override |
| `MULTIPLAYER_LABELS` | ✅ 신규 | 8게임 공통 (panelTitle/Status/Buttons/Placeholders/Notes) |
| `scripts/player-stats.js` | ✅ 정상 | `fetchTopRankingsByTurns` 추가 |

### 3.2 게임별 시작 화면 (8게임 공통 셸)
| 파일 | 셸 | 랭킹 모드 | 비고 |
|---|---|---|---|
| `clue.html` / `clue.css` | ✅ Tier A | `turns` (최단 턴) | `refactor(clue): 랭킹 패널을 턴 기반으로 전환` (`44d5c0a`) |
| `monopoly.html` / `monopoly.css` | ✅ Tier A | `turns` (최단 턴) | `refactor(monopoly): 랭킹 패널을 턴 기반으로 전환` (`263f2d1`) |
| `dominion.html` / `dominion.css` | ✅ Tier A | `score` (누적 점수) | 새 랭킹 시스템 첫 테스트 — `data-ranking-title="누적 점수 TOP 10"` |
| `sushi-go.html` / `sushi-go.css` | ✅ Tier A | (기본값 `score`) | |
| `splendor.html` / `splendor.css` | ✅ Tier A | (기본값 `score`) | |
| `cant-stop.html` / `cant-stop.css` | ✅ Tier B | (기본값 `score`) | |
| `tally-ho.html` / `tally-ho.css` | ✅ Tier B | (기본값 `score`) | |
| `fantasy.html` | ✅ Tier B | (기본값 `score`) | |

> **데이터-attribute 기준 (공통)**: `data-setup-scale`, `data-dialog-target`, `data-live-ranking` (+ `data-game-type`, `data-ranking-mode`, `data-ranking-title`), `data-live-ranking-refresh`, `data-preview-ranking-refresh` (+ `data-status-target`)

### 3.3 백엔드 / DB
- Supabase 테이블: `fantasy_player_stats` (+ `turns` 컬럼 `not null default 0`), 인덱스 `fantasy_player_stats_turns_idx`
- Supabase 뷰: `fantasy_player_summary` (RLS 모두 허용)
- 신규 SQL: [supabase-monopoly-turns.sql](supabase-monopoly-turns.sql) — 컬럼 추가 + 인덱스 생성
- JS API: `recordGame` (turns 포함), `fetchSummary`, `fetchRecentGames`,
  `fetchTopRankingsByScore`, `fetchTopRankingsByDuration`, **`fetchTopRankingsByTurns`** (신규)
- 빈 상태: "아직 등록된 기록이 없습니다." / "아직 승리 기록이 없습니다." 자동 표시

### 3.4 git remote
- `origin` → `https://github.com/KitschMix/fantasyR.git`
- **원격 잔존 브랜치 없음** (`origin/main` 만 존재)
- **로컬 잔존 브랜치 없음** (`feat/monopoly-layout-zoom-restore` 는 main에서 한참 뒤처진 상태로 `c875307` 시점에 폐기)

---

## 4. 빠른 시작 — 다음 세션에서 할 일

### 4.1 세션 시작 시
```powershell
cd e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc
git status --short
git log --oneline -20
git branch --list   # 로컬 잔존 브랜치 확인
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
| 🟡 중간 | 자동 검증 스크립트(스크린샷) 표준화 | 8게임 × 2 viewport (1280/768) 회귀 테스트 고정 |
| 🟡 중간 | sushi-go 젓가락 스왑 메커닉 구현 | 현 6장 데코(0점). 공식 룰: 손패 2장 ↔ 이번 라운드 낸 카드 2장 교환. UI/로직 둘 다 필요 |
| 🟢 낮음 | Supabase 테스트 데이터 보강 | `fantasy_player_stats`에 더 많은 INSERT → 랭킹 UX 검증 |
| 🟢 낮음 | 홈 위젯 강화 | 최근 게임 / 최고 점수 / 연승 별도 컬럼 |
| 🟢 낮음 | 연승 추적 컬럼 | 별도 컬럼 추가 또는 별도 RPC |
| 🟢 낮음 | 게임 내 통계 | 이번 판 통계 별도 표시 |
| 🟢 낮음 | 타 게임 랭킹 모드 통일 점검 | sushi-go, splendor, cant-stop, tally-ho, fantasy — 현재 `score` 기본값. `turns`/`duration` 으로 전환할지 결정 |
| 🔵 선택 | 새 게임 추가 (예: Azul, Wingspan) | [START_SCREEN_GUIDE.md §7](START_SCREEN_GUIDE.md) 8단계 따르기 |

---

## 6. 알려진 이슈 / 함정

1. **CDN**: `jsdelivr.net`이 Vercel에서 차단됨 — 반드시 `https://unpkg.com/@supabase/supabase-js@2` 사용
2. **로컬 배율 캐시**: 직전 세션에서 셸 zoom을 50%로 설정했다면 다음 세션에도 `fantasyR.setupScalePercent = 100`로 리셋 필요
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`c875307`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`
6. **`data-ranking-mode="turns"` 호환**: 새 게임이 이 모드를 쓰려면 Supabase `fantasy_player_stats.turns` 컬럼이 반드시 0 이상으로 기록돼야 함. `recordGame()`에서 `turns: 0` 도 허용하지만 랭킹에서는 `turns > 0` 만 집계
7. **sushi-go 라운드 라벨 깜빡임** ✅ **해결** (`c367e52`): `endGame()` 진입 직전 `state.currentRound = TOTAL_ROUNDS` 로 강제 → 다음 라운드 버튼 클릭 시에도 "라운드 3/3"으로 일관 표시. 트레이스: nextRound→currentRound++→4>3→endGame→currentRound=3→renderAll
8. **sushi-go 카드 카운트 차이** ✅ **해결** (`c875307`): 88장→110장 (원본 Gamewright 공식 108장 + 젓가락 2장 = 110). 사시미 6→14, 김밥1 4→6, 김밥2 6→12, 젓가락 0→6(데코)
9. **sushi-go 젓가락 스왑 메커닉**: 현재 6장 모두 0점 데코. 공식 룰의 "손패 2장 ↔ 이번 라운드 낸 카드 2장 교환" 메커닉은 미구현. 플레이어 UX는 그대로 유지, 카드만 추가됨

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **`design-preview.html`**: `ccfe6ec` 커밋이 revert된 뒤 로컬에 untracked 로 잔존. 같은 원칙으로 **삭제** (`Remove-Item`)
- **squash 커밋**: 다중 파일 변경을 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷
- **턴 vs 시간 랭킹**: monopoly·clue는 "최단 시간"보다 "최단 턴"이 보드게임의 자연스러운 승리 척도라고 보고 `data-ranking-mode="turns"`로 전환. dominion은 첫 테스트로 `score` 유지 (`f5ccf44`)
- **멀티플레이 라벨 통합**: 8게임 공통으로 묶음. HTML에 `.online-panel`이 없으면 `ensureMultiplayerPanel()`이 기본 "준비 중" 패널 자동 부착 → 새 게임 추가 시 마크업 부담 0
- **sushi-go 동점 룰**: 원본 스시고! 룰북은 "동점이면 모든 동점자가 보너스 점수" (1등 둘 다 6점, 1등 셋 다 6점). 초기에 `Math.floor(6/N)` 으로 분배한 것은 명백한 오류. 스시고 게임 뿐 아니라 향후 추가 게임도 원본 룰북을 SSOT로 삼고, 동점 처리 시 분배 대신 "모든 동점자에게 보너스" 패턴을 기본으로 채택
- **sushi-go 카드 카운트 (110장)**: Gamewright 원본 분배 (104장) + 젓가락 2장 추가 = 110. 젓가락 스왑 메커닉은 다음 세션 후보로 분리. 현재는 0점 데코로 처리해 카드 수는 맞추되 게임플레이 영향 최소화
- **로컬 잔존 브랜치 처리 원칙**: main 대비 한참 뒤처진 상태이거나 WIP 가능성이 있는 로컬 브랜치는 diff stat 만 보고도 폐기 가능. `git diff main..branch --stat` 으로 다수 파일이 음수(-)를 보이면 이미 main이 그 변경을 포함했다는 신호 → 머지 가치 없음

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (5토큰 정의 근거)

---

마지막 갱신: 2026-07-15 (새벽) · `c875307`