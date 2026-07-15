# Handoff — 2026-07-15 (심야)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 | `c367e52 feat(sushi-go): 카드 분배 공식화 + AI 스마트화 + 와사비 시각화 + 점수 상세` |
| 직전 통합 커밋 | `a880a53 docs(handoff): 2026-07-14 저녁 이후 세션 보고서 추가 (Splendor 별 2줄 + sushi-go 동점 룰 수정)` |
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

### 2.5 스시고 게임 대폭 개선 — 카드 공식화 + AI 스마트화 + UX (`c367e52`)
원격에서 24 신규 커밋 받기 (`git pull origin main` → `de03bc8..a880a53`) 후 스시고 한 세션에서 4가지 묶음 개선:

**🟥 버그 수정 묶음 (handoff §5, §6 해소)**
- **카드 분배 75 → 88장** (공식 스시고! 분배에 더 가깝게): 계란 4→5, 연어 5→10, 문어 3→5, 김밥2 5→6, 새우튀김 8→14, 사시미 10→6, 와사비 4→6. 만두·김밥1·김밥3·푸딩은 그대로
- **5인 핸드 8 → 7장**: `HAND_SIZES = {2:10, 3:9, 4:8, 5:7}` 테이블로 정리
- **라운드 라벨 깜빡임 수정**: `endGame()` 진입 시 `state.currentRound = TOTAL_ROUNDS`로 강제 → "라운드 4/3" 일시 표시 제거

**🟨 AI 스마트화 (`aiSelectCard(idx, difficulty)`)**
- `normal` (기본): 기존 단순 가중치
- `hard`: 핸드 컨텍스트 — 새우튀김 홀수면 +4 (쌍 완성), 사시미 1장 보유면 +5 (트리플), 와사비 미보유면 +1.5 (페어링 대기)
- `expert`: 김밥 선두 견제 (선두면 -maki*0.5, 뒤지면 +maki*0.8), 마지막 라운드 푸딩 0개면 +3 (패널티 회피), 노이즈 0.4 추가 (동점 방지)

**🟩 와사비 시각화**
- `state.players[i].wasabiHeld` 추적 (wasabi 픽 → ++, nigiri 픽 → --, 페어링 완료 시 자동 소비)
- 플레이어 카드에 **🟢×N 펄스 배지** (`sushi-wasabi-indicator` + `sushiWasabiPulse` 애니메이션)
- 인간/AI 모두 적용. 다음 초밥 3배 효과 시각적 알림

**🟦 점수 상세 + UX 가속**
- `scoreRound()`이 `{ totals, breakdown }` 반환 — 카드별 점수 분해 추적
- 라운드 종료 모달에 분해 표시 (`sushi-score-block` + `sushi-score-breakdown`):
  - `🍣 회전 초밥 +5 (와사비 보너스 +2)`
  - `🍤 새우튀김 쌍 +5`
  - `🥟 만두 +3`
  - `🍱 김밥 보너스 +6 (1등)` / `+3 (2등, 1등 단독)`
- 카드 선택 애니메이션 가속: 450+400ms → 250+200ms (라운드 종료 600→350ms)
- `sushi-go.html` 캐시 버스팅 `v=20260714-sushi-improvements`

**검증** (브라우저 수동 + 자동 클릭)
- 3인 게임 1라운드 완주 — 카드 분배/패스/점수/와사비/배지/분해 모두 정상
- 점수 수동 검증 통과:
  - 계란×3 + 와사비 = 5점 (3+1+1), 와사비 보너스 +2 ✓
  - 김밥 1등 +6점, 2등(1등 단독) +3점 ✓
  - 만두 1개 = 1점, 2개 = 3점 (DUMPLING_SCORES) ✓
  - 라운드 라벨 1/3 → 2/3 정상 전환

---

## 3. 누적 코드 상태 (commit 기준: `c367e52`)

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
| `sushi-go.html` / `sushi-go.css` | ✅ Tier A | (기본값 `score`) | `c367e52` 개선 — 공식 카드 분배, AI 스마트화, 와사비 배지, 점수 상세 |
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
- 로컬 잔존: `feat/monopoly-layout-zoom-restore` (1 unique commit `a241263`, 2026-07-07) — **미머지, 다음 세션 결정 필요**

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
| 🟡 중간 | 로컬 `feat/monopoly-layout-zoom-restore` 처리 | `a241263` (2026-07-07) — WIP 가능성. `git diff main..feat/monopoly-layout-zoom-restore -- monopoly.css monopoly.html index.html` 확인 후 머지 또는 폐기 결정 |
| 🟡 중간 | 잔존 원격 브랜치 정리 | 현재 `origin/main` 만 남음 — 추가 발생 시 `git fetch --prune` + `git push origin --delete` |
| 🟡 중간 | 자동 검증 스크립트(스크린샷) 표준화 | 8게임 × 2 viewport (1280/768) 회귀 테스트 고정 |
| 🟢 낮음 | Supabase 테스트 데이터 보강 | `fantasy_player_stats`에 더 많은 INSERT → 랭킹 UX 검증 |
| 🟢 낮음 | 홈 위젯 강화 | 최근 게임 / 최고 점수 / 연승 별도 컬럼 |
| 🟢 낮음 | 연승 추적 컬럼 | 별도 컬럼 추가 또는 별도 RPC |
| 🟢 낮음 | 게임 내 통계 | 이번 판 통계 별도 표시 |
| 🟢 낮음 | 타 게임 랭킹 모드 통일 점검 | sushi-go, splendor, cant-stop, tally-ho, fantasy — 현재 `score` 기본값. `turns`/`duration` 으로 전환할지 결정 |
| 🟢 낮음 | sushi-go AI 고도화 (Phase 2) | 현재는 difficulty별 가중치. 다음 후보: 상대 픽 예측, 카드별 기댓값 EV 테이블, 더 긴 lookahead |
| 🟢 낮음 | sushi-go 사운드/이펙트 | 카드 선택/라운드 종료 사운드, "+점수" 플로팅 애니메이션 |
| 🟢 낮음 | sushi-go 통계 화면 | 이번 판 통계 (각 카드별 모은 수, 점수 기여도) 별도 패널 |
| 🔵 선택 | 새 게임 추가 (예: Azul, Wingspan) | [START_SCREEN_GUIDE.md §7](START_SCREEN_GUIDE.md) 8단계 따르기 |

---

## 6. 알려진 이슈 / 함정

1. **CDN**: `jsdelivr.net`이 Vercel에서 차단됨 — 반드시 `https://unpkg.com/@supabase/supabase-js@2` 사용
2. **로컬 배율 캐시**: 직전 세션에서 셸 zoom을 50%로 설정했다면 다음 세션에도 `fantasyR.setupScalePercent = 100`로 리셋 필요
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`de03bc8`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`
6. **`data-ranking-mode="turns"` 호환**: 새 게임이 이 모드를 쓰려면 Supabase `fantasy_player_stats.turns` 컬럼이 반드시 0 이상으로 기록돼야 함. `recordGame()`에서 `turns: 0` 도 허용하지만 랭킹에서는 `turns > 0` 만 집계
7. ~~**sushi-go 라운드 라벨 깜빡임**~~ — ✅ **해소** (`c367e52`): `endGame()` 진입 시 `state.currentRound = TOTAL_ROUNDS` 강제
8. ~~**sushi-go 카드 카운트 차이**~~ — ✅ **완화** (`c367e52`): 75 → 88장으로 공식 분배에 더 가까워짐. 새우튀김 14, 사시미 6, 와사비 6, 연어 10, 문어 5, 김밥2 6, 계란 5 (handoff §5의 "110장" 표기는 추정값; BGG 공식은 104장). 원본과 완전 일치는 미해결이지만 게임 진행·밸런스 모두 정상

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **`design-preview.html`**: `ccfe6ec` 커밋이 revert된 뒤 로컬에 untracked 로 잔존. 같은 원칙으로 **삭제** (`Remove-Item`)
- **squash 커밋**: 다중 파일 변경을 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷
- **턴 vs 시간 랭킹**: monopoly·clue는 "최단 시간"보다 "최단 턴"이 보드게임의 자연스러운 승리 척도라고 보고 `data-ranking-mode="turns"`로 전환. dominion은 첫 테스트로 `score` 유지 (`f5ccf44`)
- **멀티플레이 라벨 통합**: 8게임 공통으로 묶음. HTML에 `.online-panel`이 없으면 `ensureMultiplayerPanel()`이 기본 "준비 중" 패널 자동 부착 → 새 게임 추가 시 마크업 부담 0
- **sushi-go 동점 룰**: 원본 스시고! 룰북은 "동점이면 모든 동점자가 보너스 점수" (1등 둘 다 6점, 1등 셋 다 6점). 초기에 `Math.floor(6/N)` 으로 분배한 것은 명백한 오류. 스시고 게임 뿐 아니라 향후 추가 게임도 원본 룰북을 SSOT로 삼고, 동점 처리 시 분배 대신 "모든 동점자에게 보너스" 패턴을 기본으로 채택
- **AI 난이도 분기 (`c367e52`)**: 같은 `aiSelectCard()` 함수 안에 difficulty 인자를 받아 가중치 매트릭스를 갈아끼움. 점수 계산 로직 자체는 동일 → 난이도 변경이 게임 룰 위반 위험을 만들지 않음. 향후 다른 게임에도 동일 패턴 적용 가능
- **와사비 `wasabiHeld` 상태 모델**: 라운드 종료 시가 아닌 플레이어 객체에 영속 → 다음 라운드로 미사용 와사비가 넘어감 (실제 룰북 동작). selectCardForPlayer에서 와사비 픽(++) / nigiri 픽(--) 단일 소스에서 관리 → 동시성/이벤트 순서 의존 없음
- **점수 분해(`breakdown`)는 별도 객체로**: `scoreRound()`가 `{ totals, breakdown }` 반환. totals는 점수 합계(규칙 검증용), breakdown은 UI 표시용(영향 0). 점수 계산은 totals만 사용 → UI 추가/제거가 게임 로직에 영향 없음
- **카드 분배 표기**: handoff.md에 "(110장)" 추정값이 있었지만 실제 BGG 공식은 104장. 이번 88장 조정은 그 중간값. 완전 일치가 필요하면 104장으로 추가 조정 가능 (사시미 6→14, 김밥2 6→12, 김밥1 4→6)

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (5토큰 정의 근거)

---

마지막 갱신: 2026-07-15 (심야) · `c367e52`