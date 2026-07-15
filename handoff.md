# Handoff — 2026-07-15 (심야, 낮+심야 통합)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

> **참고**: 본 통합 버전은 (1) 낮 세션 [ca32c9e](_handoff-2026-07-15-pm.md) + (2) 심야 세션 [1adf1b1](_handoff-night.md) (= 로컬 커밋 90ff1eb) 을 머지한 결과입니다. 로컬 풀 도중 충돌이 났고 `--theirs` 후 수동으로 본 통합본을 작성했습니다.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 (로컬) | `90ff1eb docs(handoff): 2026-07-15 심야 세션 + 본 통합본` |
| 마지막 코드 커밋 | `c367e52 feat(sushi-go): 카드 분배 공식화 + AI 스마트화 + 와사비 시각화 + 점수 상세` |
| 직전 통합 커밋 | `ca32c9e docs(handoff): 2026-07-15 낮 세션 갱신 (NPC·bg·로고)` |
| 이전 코드 통합 커밋 | `a880a53 docs(handoff): Splendor 별 2줄 + sushi-go 동점 룰 수정` |
| 이전 코드 통합 커밋 | `34f16c9 style: 캔트스탑 로고 사이즈를 다른 게임들과 통일` |
| 이전 코드 통합 커밋 | `d8a98a2 feat: 4개 게임 setup/game panel에 배경 이미지 적용` |
| 이전 코드 통합 커밋 | `1632b69 feat: 스시고 NPC 턴 딜레이 + 선택 말풍선 추가` |
| 로컬 서버 | `python -m http.server 8765 --bind 127.0.0.1` (필요 시 수동 실행) |
| 터미널 | PowerShell 5.1 (Windows) |
| GitHub | https://github.com/KitschMix/fantasyR |
| 라이브 URL | https://fantasyr.vercel.app (Vercel 자동 배포) |

---

## 2. 이번 세션 (2026-07-15)에서 완료한 일

### 2.1 스시고 NPC 턴 딜레이 + 선택 말풍선 (`1632b69`, 낮)
- **문제**: AI 카드를 즉시 골라 화면에 잔상이 남아 체감 답답
- **해결**:
  - 1~1.5초 랜덤 딜레이 (`aiFlightDelay = 1000 + Math.floor(Math.random() * 500)`) — 사용자가 "천천히 골라주는 느낌"
  - 선택 직후 말풍선(`showAiSelectionBubble`)으로 어떤 카드를 골랐는지 시각적으로 알림 (`hideAiSelectionBubble`로 1.2초 후 사라짐)
  - 비행 후 `state.phase = "flying"`에 stuck 되던 버그 수정 → `Promise.all(flights).finally` 에서 `state.phase = "pick"` 복원
- **검증**: DOM 플레이 테스트 (스시고 3라운드 25 사이클) 정상 동작

### 2.2 게임별 배경 이미지 일괄 적용 (`d8a98a2`, 낮)
- **목적**: 사용자가 `assets/`에 게임별 새 폴더(`cantstop/`, `clue/`)와 `splendor/bg.jpg` 추가. 부루마불/스시고와 동일 패턴으로 모든 게임에 일관된 배경 적용
- **적용 게임**:

  | 게임 | bg 파일 | 패널 | 그라데이션 |
  |---|---|---|---|
  | monopoly | `assets/monopoly/bg.jpg` | setup + game | (이전 작업 `07d1682`) |
  | sushi-go | `assets/sushi/bg.jpg` | setup + game | (이전 작업) |
  | **cant-stop** | `assets/cantstop/bg.jpg` | setup (= game) | 0.45→0.55 |
  | **clue** | `assets/clue/bg.jpg` | setup + game | 0.45→0.55 |
  | **splendor** | `assets/splendor/bg.jpg` | setup + game | 0.45→0.55 (setup만 0.35→0.45) |

- **패턴 (공통)**:
  ```css
  background-image:
    linear-gradient(rgba(15, 12, 8, 0.45), rgba(15, 12, 8, 0.55)),
    url('assets/{game}/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  ```
- **시각 검증**: 각 페이지 screenshot으로 bg 정상 표시 확인 (등반가/클루 캐릭터/보석 이미지)
- **스킵**: tally-ho, dominion — `bg.jpg` 미존재 (사용자 인지)

### 2.3 캔트스탑 로고 사이즈 조정 (`34f16c9`, 낮)
- **문제**: `.cant-title-art`에 `max-height` 미정의 → 원본 4:3(1448×1086)이 자연 노출되어 다른 게임 대비 width 2배, height 3.5배 (378×284 vs 타 게임 181×70~80)
- **수정**:
  - `width`: `min(430px, 42vw)` → `min(340px, 40vw)`
  - `max-height`: 없음 → **`132px`** 추가 (clue setup-shell 패턴)
  - 모바일 media query도 동일하게 조정
  - 셀렉터에 `.cant-title-art.game-setup-logo` 컴파운드 추가 → 모바일에서 setup-shell.css의 `.game-setup-logo` 룰(specificity 0,0,1,0)보다 specificity를 (0,0,2,0)으로 높여 cascade에서 이김
- **결과**: viewport 430px → 340×132px. 다른 게임과 비슷한 헤더 사이즈

### 2.4 스플렌더 모바일 카드 — 별(점수) 2줄 표시 (`e5b018d`, 심야)
- **문제**: 모바일(≤640px)에서 카드 별이 한 줄로 표시되어 `★★★★★`가 106px 폭으로 카드 폭을 거의 다 차지
- **원인 분석**: `.splendor-card-points` 안의 ★가 단일 text node라서 grid item으로 인식 안 됨
- **수정**:
  - [splendor.js](splendor.js) — 글자별 `<span class="splendor-card-star">` 로 분리
  - [splendor.css](splendor.css) — 모바일 @media 안에서 `.splendor-card-points`를 `grid-template-columns: repeat(3, minmax(0, 1fr))` + `font-size: 20px` 로 적용
- **결과**: 5★ → `★★★`+`★★` (3+2), 4★ → `★★★`+`★` (3+1), 1~3★ → 1줄. PC 뷰은 grid 미적용으로 기존 한 줄 유지

### 2.5 스시고 게임 룰 검증 + 동점 룰 수정 (`c9e37da`, 심야)
- **플레이 검증**: 3명 게임 자동 플레이로 한 게임 완주 (라운드 3개 + 게임 종료). 카드 분배/왼쪽 패스/점수 계산/승자 결정 모두 정상 동작
- **발견된 룰 버그 2건** (원본 스시고! 룰북 위반):
  1. **김밥 동점 분배** (line 113): `Math.floor(6 / N)`으로 나누던 것을 → **모든 1등 동점자가 6점씩** 받도록 수정. 2등 점수는 1등 단독일 때만 3점
  2. **푸딩 동점 분배** (line 187): 동일 패턴 → **모든 1등 +6점, 모든 꼴등 -6점** 으로 수정
- **검증**: 9개 시나리오 (김밥 단독/2명동점/3명동점, 푸딩 단독/동점/모두같음) 콘솔 재현으로 모두 원본 룰과 일치 확인
- **검증 도구**: Playwright(412×900 모바일 뷰) + 브라우저 콘솔 단위 테스트. sushi-go.js IIFE 내부 함수 직접 호출 불가 → 동일 로직 재현으로 비교

### 2.6 스시고 게임 대폭 개선 — 카드 공식화 + AI 스마트화 + UX (`c367e52`, 심야)
원격에서 24 신규 커밋 받기 (`git pull origin main` → `de03bc8..a880a53`) 후 스시고 한 세션에서 4가지 묶음 개선:

**🟥 버그 수정 묶음 (handoff §6 해소)**
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
| `setup-shell.js` 자동 부착 | ✅ **7종** | scale, dialog, preview-refresh, live-ranking, ranking-heading(h3), multiplayer-panel, live-ranking-refresh |
| `RANKING_LABELS` | ✅ 신규 | `turns`/`duration`/`score` 기본 라벨 + `data-ranking-title` override |
| `MULTIPLAYER_LABELS` | ✅ 신규 | 8게임 공통 (panelTitle/Status/Buttons/Placeholders/Notes) |
| `scripts/player-stats.js` | ✅ 정상 | `fetchTopRankingsByTurns` 추가 |

### 3.2 배경 이미지 자산 (WebP, `6f14a47`)
- `assets/{game}/bg.webp` — 모든 게임 1672×941px, q=80
- `tools/convert-bg-to-webp.js` — sharp 기반 재실행 가능
- 합계 **1.88 MB → 565 KB (70%↓)**: sushi 224→40KB(82↓), clue 334→77KB(77↓), monopoly 388→155KB(60↓), cantstop 423→122KB(71↓), splendor 509→171KB(66↓)
- 적용: 5게임 CSS `url('bg.jpg')` → `url('bg.webp')` 9곳. 원본 .jpg 5파일 삭제 (Chrome 2014+/FF 2019+/Safari 2020+ 모두 WebP 지원)
- 사용자 폴더 추가 → 동일 bg 패턴 일괄 적용이 SSOT. tally-ho/dominion은 자산 없음

### 3.3 게임별 시작 화면 (8게임 공통 셸)
| 파일 | 셸 | 랭킹 모드 | 비고 |
|---|---|---|---|
| `clue.html` / `clue.css` | ✅ Tier A | `turns` (최단 턴) | bg.jpg + `.clue-setup-panel` 풀 정의 신규 추가 |
| `monopoly.html` / `monopoly.css` | ✅ Tier A | `turns` (최단 턴) | bg.jpg 적용 (`07d1682`) |
| `dominion.html` / `dominion.css` | ✅ Tier A | `score` (누적 점수) | `data-ranking-title="누적 점수 TOP 10"` |
| `sushi-go.html` / `sushi-go.css` | ✅ Tier A | (기본값 `score`) | **오늘 대폭 개선** — 공식 카드 분배, AI 스마트화, 와사비 배지, 점수 상세. NPC 딜레이 + 말풍선 |
| `splendor.html` / `splendor.css` | ✅ Tier A | (기본값 `score`) | bg.jpg 적용, 모바일 ★ 2줄 표시 (`e5b018d`) |
| `cant-stop.html` / `cant-stop.css` | ✅ Tier B | (기본값 `score`) | bg.jpg 적용, **로고 340×132px로 축소** (`34f16c9`) |
| `tally-ho.html` / `tally-ho.css` | ✅ Tier B | (기본값 `score`) | (bg 없음, 사용자 자산 추가 시 적용) |
| `fantasy.html` | ✅ Tier B | (기본값 `score`) | |

> **데이터-attribute 기준 (공통)**: `data-setup-scale`, `data-dialog-target`, `data-live-ranking` (+ `data-game-type`, `data-ranking-mode`, `data-ranking-title`), `data-live-ranking-refresh`, `data-preview-ranking-refresh` (+ `data-status-target`)

### 3.4 백엔드 / DB
- Supabase 테이블: `fantasy_player_stats` (+ `turns` 컬럼 `not null default 0`), 인덱스 `fantasy_player_stats_turns_idx`
- Supabase 뷰: `fantasy_player_summary` (RLS 모두 허용)
- SQL 파일:
  - [supabase-schema.sql](supabase-schema.sql), [supabase-player-stats.sql](supabase-player-stats.sql)
  - [supabase-ranking-only.sql](supabase-ranking-only.sql), [supabase-chat-only.sql](supabase-chat-only.sql)
  - [supabase-monopoly-ranking.sql](supabase-monopoly-ranking.sql), [supabase-monopoly-turns.sql](supabase-monopoly-turns.sql)
- JS API: `recordGame` (turns 포함), `fetchSummary`, `fetchRecentGames`, `fetchTopRankingsByScore`, `fetchTopRankingsByDuration`, **`fetchTopRankingsByTurns`** (신규)
- 빈 상태: "아직 등록된 기록이 없습니다." / "아직 승리 기록이 없습니다." 자동 표시

### 3.5 git remote
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
| 🟢 낮음 | bg WebP 추가 절감 | 현재 q=80. q=75 또는 모바일 분기(750×422 모바일용 별도 webp)로 추가 30%↓ 가능. `node tools/convert-bg-to-webp.js` 재실행 |
| 🟡 중간 | 잔존 원격 브랜치 정리 | 현재 `origin/main` 만 남음 — 추가 발생 시 `git fetch --prune` + `git push origin --delete` |
| 🟡 중간 | 자동 검증 스크립트(스크린샷) 표준화 | 8게임 × 2 viewport (1280/768) 회귀 테스트 고정 |
| 🟡 중간 | sushi-go 젓가락 스왑 메커닉 구현 | 현 4장 데코(0점). 공식 룰: 손패 2장 ↔ 이번 라운드 낸 카드 2장 교환. UI/로직 둘 다 필요 |
| 🟡 중간 | RULEBOOK.md에 스시고 섹션 추가 | 카드 구성/점수/김밥 동점 등 명시. 원본 한국어 룰북 이미지 인용 필수 |
| 🟢 낮음 | tally-ho, dominion bg.jpg 추가 | 사용자가 자산 추가 시 동일 패턴으로 부착 |
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
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`c367e52`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`
6. **`data-ranking-mode="turns"` 호환**: 새 게임이 이 모드를 쓰려면 Supabase `fantasy_player_stats.turns` 컬럼이 반드시 0 이상으로 기록돼야 함. `recordGame()`에서 `turns: 0` 도 허용하지만 랭킹에서는 `turns > 0` 만 집계
7. **CSS specificity 함정** (`34f16c9` 트레이스): 게임별 CSS의 compound class(예: `.cant-title-art.game-setup-logo`)는 `setup-shell.css`의 단순 class(예: `.game-setup-logo`)보다 specificity가 높아야 mobile @media 안에서도 cascade에서 이김. 단일 class만 쓰면 모바일 width가 덮어써질 수 있음 — 같은 패턴이 의심되는 다른 게임(특히 `.sushi-setup-logo`)도 추후 점검
8. **sushi-go 라운드 라벨 깜빡임** ✅ **해결** (`c367e52`): `endGame()` 진입 직전 `state.currentRound = TOTAL_ROUNDS` 강제
9. **sushi-go 카드 카운트 차이** ⚠️ **완화** (`c367e52`): 75 → 88장 (원본 Gamewright 공식 분배에 더 가까워짐). 새우튀김 14, 사시미 6, 와사비 6, 연어 10, 문어 5, 김밥2 6, 계란 5 (BGG 공식 104장까지는 아직 미달). 게임 진행·밸런스 모두 정상
10. **sushi-go 김밥 동점 룰** ✅ **해결** (`c9e37da`): 룰북대로 "모든 1등 동점자가 6점씩" 패턴으로 수정. `Math.floor(6/N)` 분배는 오류
11. **sushi-go 푸딩 동점 룰** ✅ **해소** (`c9e37da`): 동점 시 "모든 꼴등 -6점" 패턴 적용
12. **sushi-go 젓가락 스왑 메커닉**: 현재 4장 모두 0점 데코. 미구현
13. **sushi-go NPC 딜레이/말풍선** ✅ **오늘 추가** (`1632b69`): 1~1.5초 랜덤 딜레이 + 선택 말풍선. 비행 후 phase 복원 버그 동시 수정
14. **sushi-go 룰 SSOT**: 디지털 구현에서는 한 명씩 차례차례 (공식 앱도 동일) — 원본 룰은 동시 드래프트. 사용자 질문 시 §2.1 인용
15. **sushi-go bg**: `assets/sushi/bg.jpg`만 적용. sushi-setup-logo의 compound specificity 점검 필요 (위 §6-7)
16. **sushi-go 풀 카드 104장 미달** (`c367e52`): BGG 공식 사시미 14장 / 김밥2 12장 / 김밥1 6장까지 추가하면 104장 도달. 현 88장은 밸런스 정상이나 사용자 요구 시 확장
17. **hand-off 머징 충돌**: `git pull --rebase` 도중 `handoff.md` 8개 충돌 마커 발생 가능. 본 통합본 작성으로 해소. 차후에는 충돌 시 `git checkout --theirs handoff.md` 후 수동 머지 권장

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **`design-preview.html`**: `ccfe6ec` 커밋이 revert된 뒤 로컬에 untracked 로 잔존. 같은 원칙으로 **삭제** (`Remove-Item`)
- **squash 커밋**: 다중 파일 변경을 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷
- **턴 vs 시간 랭킹**: monopoly·clue는 "최단 시간"보다 "최단 턴"이 보드게임의 자연스러운 승리 척도라고 보고 `data-ranking-mode="turns"`로 전환. dominion은 첫 테스트로 `score` 유지 (`f5ccf44`)
- **멀티플레이 라벨 통합**: 8게임 공통으로 묶음. HTML에 `.online-panel`이 없으면 `ensureMultiplayerPanel()`이 기본 "준비 중" 패널 자동 부착 → 새 게임 추가 시 마크업 부담 0
- **sushi-go NPC 딜레이 추가 이유** (`1632b69`): AI가 즉시 카드를 골라 사용자가 무슨 카드를 골랐는지 인지하기 어려움 → 1~1.5초 랜덤 딜레이 + 말풍선으로 의도 노출
- **bg 패턴 SSOT** (`d8a98a2`): `linear-gradient(rgba(15, 12, 8, 0.45), rgba(15, 12, 8, 0.55)), url('assets/{game}/bg.jpg')` + cover/center/fixed. 신규 게임도 이 패턴 그대로 따름
- **setup-panel 그라데이션 변형**: setup 화면은 0.35→0.45 (조금 밝게, 컨트롤 잘 보이게), game 화면은 0.45→0.55 (더 어둡게, 카드/UI 부각)
- **캔트스탑 로고 사이즈 결정** (`34f16c9`): clue setup-shell 패턴 (max-height 132px) 그대로 따라함. 정사각형에 가까운 4:3 이미지(1448×1086)는 width만 줄여도 height가 폭의 75%로 커지므로 `max-height` 명시가 핵심
- **sushi-go 동점 룰**: 원본 스시고! 룰북은 "동점이면 모든 동점자가 보너스 점수" (1등 둘 다 6점, 1등 셋 다 6점). 초기에 `Math.floor(6/N)` 으로 분배한 것은 명백한 오류. 스시고 게임 뿐 아니라 향후 추가 게임도 원본 룰북을 SSOT로 삼고, 동점 처리 시 분배 대신 "모든 동점자에게 보너스" 패턴을 기본으로 채택
- **AI 난이도 분기 (`c367e52`)**: 같은 `aiSelectCard()` 함수 안에 difficulty 인자를 받아 가중치 매트릭스를 갈아끼움. 점수 계산 로직 자체는 동일 → 난이도 변경이 게임 룰 위반 위험을 만들지 않음. 향후 다른 게임에도 동일 패턴 적용 가능
- **와사비 `wasabiHeld` 상태 모델**: 라운드 종료 시가 아닌 플레이어 객체에 영속 → 다음 라운드로 미사용 와사비가 넘어감 (실제 룰북 동작). selectCardForPlayer에서 와사비 픽(++) / nigiri 픽(--) 단일 소스에서 관리 → 동시성/이벤트 순서 의존 없음
- **점수 분해(`breakdown`)는 별도 객체로**: `scoreRound()`가 `{ totals, breakdown }` 반환. totals는 점수 합계(규칙 검증용), breakdown은 UI 표시용(영향 0). 점수 계산은 totals만 사용 → UI 추가/제거가 게임 로직에 영향 없음
- **카드 분배 표기**: handoff.md에 "(110장)" 추정값이 있었지만 실제 BGG 공식은 104장. 이번 88장 조정은 그 중간값. 완전 일치가 필요하면 104장으로 추가 조정 가능 (사시미 6→14, 김밥2 6→12, 김밥1 4→6)
- **handoff 백업 규칙**: 머지 전 handoff는 `_handoff-YYYY-MM-DD-{period}.md` 패턴으로 untracked 보존. 예: `_handoff-2026-07-15-pm.md` (낮), `_handoff-night.md` (심야 임시)
- **bg WebP 단순 교체 패턴 (`6f14a47`)**: 5장 bg.jpg → bg.webp, sharp(q=80) 변환. image-set 폴백 없이 url() 직접 webp 참조 — Chrome/FF/Safari 모두 2014-2020 사이 WebP 지원했으므로 폴백 불필요. 구형 브라우저 필요 시 `-webkit-image-set(url('bg.webp') 1x, url('bg.jpg') 1x)` 패턴으로 전환 가능 (현재는 미사용). 재변환: `node tools/convert-bg-to-webp.js`

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (5토큰 정의 근거)

---

마지막 갱신: 2026-07-15 (심야, 낮+심야 통합 머지) · `90ff1eb`
