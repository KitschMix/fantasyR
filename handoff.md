# Handoff — 2026-07-14 (저녁)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 | `de03bc8 feat(multiplay): 라벨 통합 + 자동 부착 (8게임 공통)` |
| 직전 통합 커밋 | `00b0f01 refactor(setup): 5게임 시작화면을 공통 setup-shell로 통합 + handoff 5토큰 일괄 도입` |
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
| 🔵 선택 | 새 게임 추가 (예: Azul, Wingspan) | [START_SCREEN_GUIDE.md §7](START_SCREEN_GUIDE.md) 8단계 따르기 |

---

## 6. 알려진 이슈 / 함정

1. **CDN**: `jsdelivr.net`이 Vercel에서 차단됨 — 반드시 `https://unpkg.com/@supabase/supabase-js@2` 사용
2. **로컬 배율 캐시**: 직전 세션에서 셸 zoom을 50%로 설정했다면 다음 세션에도 `fantasyR.setupScalePercent = 100`로 리셋 필요
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`de03bc8`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`
6. **`data-ranking-mode="turns"` 호환**: 새 게임이 이 모드를 쓰려면 Supabase `fantasy_player_stats.turns` 컬럼이 반드시 0 이상으로 기록돼야 함. `recordGame()`에서 `turns: 0` 도 허용하지만 랭킹에서는 `turns > 0` 만 집계

---

## 7. 작업 중 의사결정 기록

- **테스트 스크린샷**: 검증용 `verify-screenshots/` 폴더는 git에 커밋하지 않고 폐기. 일회성 검증이었기 때문
- **`design-preview.html`**: `ccfe6ec` 커밋이 revert된 뒤 로컬에 untracked 로 잔존. 같은 원칙으로 **삭제** (`Remove-Item`)
- **squash 커밋**: 다중 파일 변경을 한 커밋으로 squash → Vercel은 어차피 마지막 커밋만 트리거하므로 안전
- **가이드 vs handoff**: 둘을 분리함. 가이드는 영구 SSOT, handoff는 일회성 상태 스냅샷
- **턴 vs 시간 랭킹**: monopoly·clue는 "최단 시간"보다 "최단 턴"이 보드게임의 자연스러운 승리 척도라고 보고 `data-ranking-mode="turns"`로 전환. dominion은 첫 테스트로 `score` 유지 (`f5ccf44`)
- **멀티플레이 라벨 통합**: 8게임 공통으로 묶음. HTML에 `.online-panel`이 없으면 `ensureMultiplayerPanel()`이 기본 "준비 중" 패널 자동 부착 → 새 게임 추가 시 마크업 부담 0

---

## 8. 연락/참조

- 저장소: https://github.com/KitschMix/fantasyR
- Vercel 대시보드: https://vercel.com/dashboard (배포 상태 확인)
- Supabase: 저장소 `supabase-*.sql` 파일 참조
- 1차 출처: [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) (5토큰 정의 근거)

---

마지막 갱신: 2026-07-14 (저녁) · `de03bc8`