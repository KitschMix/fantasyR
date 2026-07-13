# Handoff — 2026-07-13 (저녁)

> 재택/외출 후 작업을 이어가기 위한 현재 상태 스냅샷입니다.
> 새 세션에서는 본 문서 → [START_SCREEN_GUIDE.md](START_SCREEN_GUIDE.md) → [GIT-WORKFLOW.md](GIT-WORKFLOW.md) → [QA-CHECKLIST.md](QA-CHECKLIST.md) 순으로 읽어주세요.

---

## 1. 환경 요약

| 항목 | 값 |
|---|---|
| 작업 폴더 | `e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc` |
| 브랜치 | `main` |
| 마지막 커밋 | `d063399 docs(setup): 시작화면 통합 가이드 문서 추가` |
| 직전 통합 커밋 | `00b0f01 refactor(setup): 5게임 시작화면을 공통 setup-shell로 통합 + handoff 5토큰 일괄 도입` |
| GitHub | https://github.com/KitschMix/fantasyR |
| 라이브 URL | https://fantasyr.vercel.app (Vercel 자동 배포) |
| 로컬 서버 | `python -m http.server 8765 --bind 127.0.0.1` (필요 시 수동 실행) |
| 터미널 | PowerShell 5.1 (Windows) |
| 직전 세션 | codex/minimax가 일부 작업을 진행할 가능성 — 시작 전 `git log --oneline -20` / `git status --short` 확인 |

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
3. **rebase 덮어쓰기**: 다른 AI가 동시에 작업하면 우리 변경이 덮어써질 수 있음 → 시작 전 `git status` + `git log`로 우리 마지막 커밋(`d063399`) 살아있는지 확인
4. **CP949 인코딩 파일**: 일부 오래된 `.md`는 EUC-KR/CP949 — `Get-Content -Encoding 51949`로 읽기
5. **강력 새로고침**: Vercel 캐시 때문에 CSS/JS 변경이 안 보이면 `Ctrl+Shift+R`

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