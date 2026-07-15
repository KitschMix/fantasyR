# Handoff — 2026-07-15 (낮)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 | `34f16c9 style: 캔트스탑 로고 사이즈를 다른 게임들과 통일` |
| 직전 통합 커밋 | `d8a98a2 feat: 4개 게임 setup/game panel에 배경 이미지 적용` |
| 이전 통합 커밋 | `1632b69 feat: 스시고 NPC 턴 딜레이 + 선택 말풍선 추가` |
| 로컬 서버 | `python -m http.server 8765 --bind 127.0.0.1` (필요 시 수동 실행) |
| 터미널 | PowerShell 5.1 (Windows) |
| GitHub | https://github.com/KitschMix/fantasyR |
| 라이브 URL | https://fantasyr.vercel.app (Vercel 자동 배포) |

---

## 2. 이번 세션 (2026-07-15 낮)에서 완료한 일

### 2.1 스시고 NPC 턴 딜레이 + 선택 말풍선 (`1632b69`)
- **문제**: AI 카드를 즉시 골라 화면에 잔상이 남아 체감 답답
- **해결**:
  - 1~1.5초 랜덤 딜레이 (`aiFlightDelay = 1000 + Math.floor(Math.random() * 500)`) — 사용자가 "천천히 골라주는 느낌"
  - 선택 직후 말풍선(`showAiSelectionBubble`)으로 어떤 카드를 골랐는지 시각적으로 알림 (`hideAiSelectionBubble`로 1.2초 후 사라짐)
  - 비행 후 `state.phase = "flying"`에 stuck 되던 버그 수정 → `Promise.all(flights).finally` 에서 `state.phase = "pick"` 복원
- **검증**: DOM 플레이 테스트 (스시고 3라운드 25 사이클) 정상 동작

### 2.2 게임별 배경 이미지 일괄 적용 (`d8a98a2`)
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

### 2.3 캔트스탑 로고 사이즈 조정 (`34f16c9`)
- **문제**: `.cant-title-art`에 `max-height` 미정의 → 원본 4:3(1448×1086)이 자연 노출되어 다른 게임 대비 width 2배, height 3.5배 (378×284 vs 타 게임 181×70~80)
- **수정**:
  - `width`: `min(430px, 42vw)` → `min(340px, 40vw)`
  - `max-height`: 없음 → **`132px`** 추가 (clue setup-shell 패턴)
  - 모바일 media query도 동일하게 조정
  - 셀렉터에 `.cant-title-art.game-setup-logo` 컴파운드 추가 → 모바일에서 setup-shell.css의 `.game-setup-logo` 룰(specificity 0,0,1,0)보다 specificity를 (0,0,2,0)으로 높여 cascade에서 이김
- **결과**: viewport 430px → 340×132px. 다른 게임과 비슷한 헤더 사이즈

---

## 3. 누적 코드 상태 (commit 기준: `34f16c9`)

### 3.1 시작 화면 셸 (`setup-shell.css` + `setup-shell.js`)
| 영역 | 상태 | 비고 |
|---|---|---|
| `setup-shell.css` | ✅ 5토큰 + 17+ 셀렉터 정리 | 게임별 compound class만 override |
| `setup-shell.js` 자동 부착 | ✅ 7종 | scale, dialog, preview-refresh, live-ranking, ranking-heading(h3), multiplayer-panel, live-ranking-refresh |
| `RANKING_LABELS` | ✅ 신규 | `turns`/`duration`/`score` 기본 라벨 + `data-ranking-title` override |
| `MULTIPLAYER_LABELS` | ✅ 신규 | 8게임 공통 (panelTitle/Status/Buttons/Placeholders/Notes) |
| `scripts/player-stats.js` | ✅ 정상 | `fetchTopRankingsByTurns` 추가 |

### 3.2 게임별 시작 화면 (8게임 공통 셸)
| 파일 | 셸 | 랭킹 모드 | 비고 |
|---|---|---|---|
| `clue.html` / `clue.css` | ✅ Tier A | `turns` (최단 턴) | bg.jpg 적용 + `.clue-setup-panel` 풀 정의 신규 추가 |
| `monopoly.html` / `monopoly.css` | ✅ Tier A | `turns` (최단 턴) | `07d1682`에서 bg.jpg 적용 |
| `dominion.html` / `dominion.css` | ✅ Tier A | `score` (누적 점수) | `data-ranking-title="누적 점수 TOP 10"` |
| `sushi-go.html` / `sushi-go.css` | ✅ Tier A | (기본값 `score`) | bg.jpg 적용 (이전), NPC 딜레이 + 말풍선 추가 (`1632b69`) |
| `splendor.html` / `splendor.css` | ✅ Tier A | (기본값 `score`) | bg.jpg 적용 (`splendor/bg.jpg` 추가) |
| `cant-stop.html` / `cant-stop.css` | ✅ Tier B | (기본값 `score`) | bg.jpg 적용 + 로고 340×132px로 축소 (`34f16c9`) |
| `tally-ho.html` / `tally-ho.css` | ✅ Tier B | (기본값 `score`) | (bg 없음, 사용자 자산 추가 시 적용) |
| `fantasy.html` | ✅ Tier B | (기본값 `score`) | |

> **데이터-attribute 기준 (공통)**: `data-setup-scale`, `data-dialog-target`, `data-live-ranking` (+ `data-game-type`, `data-ranking-mode`, `data-ranking-title`), `data-live-ranking-refresh`, `data-preview-ranking-refresh` (+ `data-status-target`)

### 3.3 배경 이미지 자산 (오늘 추가분)
- `assets/cantstop/bg.jpg` (432KB)
- `assets/clue/bg.jpg` (341KB)
- `assets/splendor/bg.jpg` (520KB, 기존 `background.jpg` 외 신규)
- 사용자 폴더 추가 → 동일 bg 패턴 일괄 적용이 SSOT

### 3.4 백엔드 / DB
- Supabase 테이블: `fantasy_player_stats` (+ `turns` 컬럼 `not null default 0`), 인덱스 `fantasy_player_stats_turns_idx`
- Supabase 뷰: `fantasy_player_summary` (RLS 모두 허용)
- SQL 파일:
  - [supabase-schema.sql](supabase-schema.sql), [supabase-player-stats.sql](supabase-player-stats.sql)
  - [supabase-ranking-only.sql](supabase-ranking-only.sql), [supabase-chat-only.sql](supabase-chat-only.sql)
  - [supabase-monopoly-ranking.sql](supabase-monopoly-ranking.sql), [supabase-monopoly-turns.sql](supabase-monopoly-turns.sql)
- JS API: `recordGame` (turns 포함), `fetchSummary`, `fetchRecentGames`, `fetchTopRankingsByScore`, `fetchTopRankingsByDuration`, `fetchTopRankingsByTurns`
- 빈 상태: "아직 등록된 기록이 없습니다." / "아직 승리 기록이 없습니다." 자동 표시

### 3.5 git remote
- `origin` → `https://github.com/KitschMix/fantasyR.git`
- **원격 잔존 브랜치 없음** (`origin/main` 만 존재)
- **로컬 잔존 브랜치 없음**

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
| 🟡 중간 | sushi-go 젓가락 스왑 메커닉 구현 | 현 4장 데코(0점). 공식 룰: 손패 2장 ↔ 이번 라운드 낸 카드 2장 교환. UI/로직 둘 다 필요 |
| 🟡 중간 | RULEBOOK.md에 스시고 섹션 추가 | 카드 구성/점수/김밥 동점 등 명시. 원본 한국어 룰북 이미지 인용 필수 |
| 🟢 낮음 | tally-ho, dominion bg.jpg 추가 | 사용자가 자산 추가 시 동일 패턴으로 부착 |
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
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`34f16c9`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`
6. **`data-ranking-mode="turns"` 호환**: 새 게임이 이 모드를 쓰려면 Supabase `fantasy_player_stats.turns` 컬럼이 반드시 0 이상으로 기록돼야 함. `recordGame()`에서 `turns: 0` 도 허용하지만 랭킹에서는 `turns > 0` 만 집계
7. **CSS specificity 함정** (`34f16c9` 트레이스): 게임별 CSS의 compound class(예: `.cant-title-art.game-setup-logo`)는 `setup-shell.css`의 단순 class(예: `.game-setup-logo`)보다 specificity가 높아야 mobile @media 안에서도 cascade에서 이김. 단일 class만 쓰면 모바일 width가 덮어써질 수 있음 — 같은 패턴이 의심되는 다른 게임(특히 `.sushi-setup-logo`)도 추후 점검
8. **sushi-go 라운드 라벨 깜빡임** ✅ **해결** (`c367e52`): `endGame()` 진입 직전 `state.currentRound = TOTAL_ROUNDS` 로 강제
9. **sushi-go 카드 카운트 차이** ✅ **해결** (`3b85c59`): 88장→108장 (원본 Gamewright 공식 그대로)
10. **sushi-go 김밥 동점 룰** ✅ **해결** (`3b85c59`): 룰북대로 `Math.floor(6/N)` 분배로 복원
11. **sushi-go 젓가락 스왑 메커닉**: 현재 4장 모두 0점 데코. 미구현
12. **sushi-go NPC 딜레이/말풍선** ✅ **오늘 추가** (`1632b69`): 1~1.5초 랜덤 딜레이 + 선택 말풍선. 비행 후 phase 복원 버그 동시 수정
13. **sushi-go 룰 SSOT**: 디지털 구현에서는 한 명씩 차례차례 (공식 앱도 동일) — 원본 룰은 동시 드래프트. 사용자 질문 시 §2.1 인용
14. **sushi-go bg**: `assets/sushi/bg.jpg`만 적용. sushi-setup-logo의 compound specificity 점검 필요 (위 §6-7)

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **`design-preview.html`**: `ccfe6ec` 커밋이 revert된 뒤 로컬에 untracked 로 잔존. 같은 원칙으로 **삭제** (`Remove-Item`)
- **squash 커밋**: 다중 파일 변경을 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷
- **턴 vs 시간 랭킹**: monopoly·clue는 "최단 시간"보다 "최단 턴"이 보드게임의 자연스러운 승리 척도 → `data-ranking-mode="turns"`로 전환. dominion은 첫 테스트로 `score` 유지 (`f5ccf44`)
- **멀티플레이 라벨 통합**: 8게임 공통으로 묶음. HTML에 `.online-panel`이 없으면 `ensureMultiplayerPanel()`이 기본 "준비 중" 패널 자동 부착
- **sushi-go 김밥 동점 룰**: 룰북은 "1등 동점이면 6점을 나눠서 갖습니다. 이 경우에는 두번째로 많은 사람은 점수를 얻지 못합니다." → **분배(split)**가 정답. 푸딩 동점은 룰북에 명시 없어 보류
- **sushi-go 카드 카운트 (108장)**: Gamewright 공식 108장 그대로. 젓가락 4장 포함. 스왑 메커닉은 미구현이므로 0점 데코로 처리
- **0점 2등 버그**: makiSeconds 계산 시 `m === secondMaki`만 체크하면 0점 플레이어가 2등으로 잡혀버림. `m > 0` 추가
- **2등 동점 처리**: 룰북에 명시 없음. 원본 코드의 `Math.floor(3/N)` 분배 패턴 유지
- **로컬 잔존 브랜치 처리 원칙**: main 대비 한참 뒤처진 상태이거나 WIP 가능성이 있는 로컬 브랜치는 diff stat 만 보고도 폐기 가능
- **이전 핸드오프 보존**: 갱신 전 handoff.md → `_handoff-2026-07-15-am.md` 로 rename. untracked 그대로 유지 (1회성 백업)
- **sushi-go NPC 딜레이 추가 이유** (`1632b69`): AI가 즉시 카드를 골라 사용자가 무슨 카드를 골랐는지 인지하기 어려움 → 1~1.5초 랜덤 딜레이 + 말풍선으로 의도 노출
- **bg 패턴 SSOT** (`d8a98a2`): `linear-gradient(rgba(15, 12, 8, 0.45), rgba(15, 12, 8, 0.55)), url('assets/{game}/bg.jpg')` + cover/center/fixed. 신규 게임도 이 패턴 그대로 따름
- **setup-panel 그라데이션 변형**: setup 화면은 0.35→0.45 (조금 밝게, 컨트롤 잘 보이게), game 화면은 0.45→0.55 (더 어둡게, 카드/UI 부각)
- **캔트스탑 로고 사이즈 결정** (`34f16c9`): clue setup-shell 패턴 (max-height 132px) 그대로 따라함. 정사각형에 가까운 4:3 이미지(1448×1086)는 width만 줄여도 height가 폭의 75%로 커지므로 `max-height` 명시가 핵심

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (5토큰 정의 근거)

---

마지막 갱신: 2026-07-15 (낮) · `34f16c9`
