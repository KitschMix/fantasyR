# 게임 시작 화면 가이드

> 이 문서는 `fantasyR`에 **새 게임을 추가하거나** 기존 게임의 **시작 화면을 수정할 때** 따라야 할 단일 출처(SSOT)입니다.
> 규격의 1차 토큰 정의는 [`START_SCREEN_UNIFICATION_HANDOFF.md`](START_SCREEN_UNIFICATION_HANDOFF.md), git 운영은 [`GIT-WORKFLOW.md`](GIT-WORKFLOW.md), QA는 [`QA-CHECKLIST.md`](QA-CHECKLIST.md)를 참조하세요.

---

## 1. 핵심 원칙

**틀은 하나, 내용과 색만 게임별로 관리한다.**

- 시작 화면의 **구조/레이아웃**은 `setup-shell.css` 한 곳에서만 변경한다.
- 게임별 **테마/색상**은 compound class로만 override 한다. (`<game>-setup-shell`)
- **리터럴 값**(예: `width: 1180px`)을 게임 파일에 새로 박지 않는다. 항상 토큰(`var(--setup-*)`)을 쓴다.
- **랭킹 UI / 스케일 컨트롤**은 `setup-shell.js`가 자동 부착한다. 각 게임 HTML에 직접 구현하지 않는다.

---

## 2. 한 번 보면 끝: 시작 화면을 구성하는 파일 3종

| 종류 | 파일 | 역할 |
|---|---|---|
| **HTML** | `<game>.html` | 셸 골격 + 게임별 옵션/설명 마크업 |
| **CSS** | `setup-shell.css` + `<game>.css` | 공통 토큰/구조 + 게임 테마 override |
| **JS** | `setup-shell.js` + `scripts/player-stats.js` | 스케일/다이얼로그/랭킹 자동 부착 |
| **SQL** | `supabase-schema.sql` 등 | 게임별 `game_type` + RPC |

---

## 3. HTML 골격 — 모든 게임이 같은 모양

8개 게임이 모두 따르는 공통 골격입니다. `clue.html`을 기준으로 발췌했습니다.

```html
<main class="app-shell">
  <section id="clueSetupPanel" class="clue-setup-panel" aria-label="클루 게임 설정">
    <div class="game-setup-shell clue-setup-shell">

      <!-- 1) 헤더: 로고 + 우측 액션(도움말 + 배율 + 첫화면) -->
      <header class="game-setup-header">
        <div class="game-setup-brand">
          <img class="game-setup-logo" src="assets/titles/title-clue.jpg" alt="클루" />
        </div>
        <div class="game-setup-actions">
          <button class="icon-button" data-dialog-target="#clueRulesDialog" title="도움말">?</button>
          <div class="setup-scale-control"
               data-setup-scale
               data-scale-target=".clue-setup-shell"
               aria-label="클루 시작 화면 배율">
            <button class="icon-button" data-scale-down aria-label="축소">-</button>
            <span class="setup-scale-value" data-scale-value>100%</span>
            <button class="icon-button" data-scale-up aria-label="확대">+</button>
          </div>
          <button class="secondary-button">첫 화면</button>
        </div>
      </header>

      <!-- 2) 그리드: 2열 패널 + 전체 폭 랭킹 패널 -->
      <div class="game-setup-grid">
        <div class="mode-panel single-panel game-setup-mode">
          <!-- 싱글플레이 마크업 (게임별 옵션) -->
        </div>
        <div class="mode-panel online-panel game-setup-mode">
          <!-- 멀티플레이 마크업 (보통 disabled 상태 표시) -->
        </div>
        <div class="mode-panel leaderboard-panel game-ranking-panel">
          <!-- 랭킹 헤더 + <ul data-live-ranking data-game-type="clue"> -->
        </div>
      </div>

    </div>
  </section>
</main>
```

### 3.1 클래스 역할

| 클래스 | 역할 | 비고 |
|---|---|---|
| `.app-shell` | 메인 래퍼 | 페이지 전체 레이아웃 |
| `.<game>-setup-panel` | 게임별 컨테이너 | body 래퍼, body[data-active-game] 동기화 |
| `.game-setup-shell` | 공통 셸 | 폭/여백 토큰 적용 |
| `.<game>-setup-shell` | 게임별 테마 hook | 색상/길이 override 전용 |
| `.game-setup-header` | 헤더 행 | flex, space-between |
| `.game-setup-grid` | 메인 2열 + 랭킹 행 | `grid-column: 1 / -1` 자동 |
| `.game-setup-mode` | 일반 패널 | flex column |
| `.game-ranking-panel` | 랭킹 패널 | 항상 마지막, 전체 폭 |
| `.mode-panel-head` | 패널 머리 | strong + sub |

### 3.2 반드시 채워야 할 data-attribute

| 속성 | 위치 | 동작 |
|---|---|---|
| `data-setup-scale` + `data-scale-target` | `.setup-scale-control` | 셸에 `zoom` 자동 적용 |
| `data-dialog-target="#xxxRulesDialog"` | 도움말 버튼 | 모달 자동 오픈 |
| `data-preview-ranking-refresh` + `data-status-target` | 시안용 새로고침 | 안내 문구 토글 |
| `data-live-ranking` + `data-game-type="<game>"` + `data-ranking-mode` | 랭킹 `<ul>` | Supabase에서 자동 로드 |
| `data-live-ranking-refresh` | 새로고침 버튼 | 다시 fetch |

> **규칙:** 이 5개 속성 외에 시작 화면 동작에 필요한 별도 JS는 작성하지 않는다 — `setup-shell.js`가 다 처리한다.

---

## 4. CSS 토큰 5종 (handoff 스펙)

`setup-shell.css` 상단에 정의되어 있으며 모든 게임이 공유합니다.

```css
.game-setup-shell {
  --setup-accent: #d4a853;
  --setup-max-width: 1120px;
  --setup-panel-radius: 20px;
  --setup-gap: 24px;
  --setup-logo-height: 72px;
  --setup-panel-min-height: 430px;
  display: grid;
  gap: var(--setup-gap);
  width: min(var(--setup-max-width), 100%);
  margin: 0 auto;
}
```

| 토큰 | 기본값 | 의미 |
|---|---|---|
| `--setup-accent` | `#d4a853` | 게임별 강조색 (점수/링크 강조) |
| `--setup-max-width` | `1120px` | 셸 최대 폭. 데스크톱 데스크 캡 |
| `--setup-gap` | `24px` | 모든 gap (header/grid/panel 내부) |
| `--setup-panel-radius` | `20px` | 패널 모서리 (게임별 직접 override 가능) |
| `--setup-logo-height` | `72px` | 로고 max-height |
| `--setup-panel-min-height` | `430px` | 패널 최소 높이 (정렬) |

> 토큰을 **새로 정의하거나 값을 매번 box에 박지 마세요.** 게임별 override는 `.<game>-setup-shell { --setup-accent: #...; }` 한 줄만.

---

## 5. 게임별 테마 — compound class 패턴

게임별 색/길이는 항상 `<game>-setup-shell` (또는 `<game>-setup-panel`) 셀렉터 아래에서만 변경합니다. 예시는 `setup-shell.css` 발췌.

```css
/* Clue: 붉은 테두리 */
.clue-setup-shell .game-setup-header {
  border-bottom-color: rgba(216, 47, 40, 0.24);
}
.clue-setup-shell .game-setup-logo {
  width: min(360px, 42vw);
  max-height: 118px;
}

/* Monopoly: 파란/녹색 페이퍼 톤 */
body.monopoly-active .monopoly-setup-shell .online-panel {
  border: 2px solid rgba(45, 154, 103, 0.24);
  background: rgba(247, 252, 247, 0.94);
}

/* Tally-ho / Cant-stop: 2열 그리드 + 작은 입력 */
.cant-setup-grid.game-setup-grid,
.tally-setup-grid.game-setup-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--setup-gap);
}
```

### 5.1 절대 하지 말 것

- ❌ `.game-setup-shell` 자체에 게임 색을 박는 행 (모든 게임에 영향)
- ❌ 미디어 쿼리 **내부**에 게임별 폭/여백 리터럴 (이미 `setup-shell.css`에 통합됨)
- ❌ `<game>.css`에서 `.game-setup-shell`, `.game-setup-grid` 같은 **공통 셀렉터** 자체를 다시 정의
- ❌ 새 미디어 쿼리 추가 — 기존 1180 / 860 / 560px 분기를 우선 활용

---

## 6. JS 부착 — `setup-shell.js`가 자동으로 해주는 것

`<script src="setup-shell.js"></script>`를 `</body>` 직전에 한 번만 포함하면 됩니다.

```js
// setup-shell.js 핵심 (요약)
// 1) data-setup-scale: 셸에 zoom 적용, localStorage "fantasyR.setupScalePercent"
// 2) data-dialog-target: <dialog> showModal() 자동 호출
// 3) data-preview-ranking-refresh: 시안 새로고침 안내
// 4) data-live-ranking: Supabase에서 랭킹 fetch + 렌더
// 5) data-live-ranking-refresh: 재요청
// 6) escapeHtml(): XSS 방지
```

랭킹 자동 로딩은 `scripts/player-stats.js`를 함께 로드해야 합니다 (`window.FANTASY_PLAYER_STATS` 전역 노출).

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="scripts/player-stats.js"></script>
<script src="setup-shell.js"></script>
```

---

## 7. 새 게임 추가 절차 (8단계)

새 게임 `<game>`을 추가할 때의 권장 순서입니다. 분량은 게임당 약 30~60분.

### Step 1 — 디렉토리/자산 마련
```text
assets/<game>/covers/title-<game>.jpg
assets/<game>/tiles/...
assets/<game>/profiles/user/...  (선택)
```

### Step 2 — `index.html`에 카드 추가
```html
<a class="game-launch-card" data-game="<game>" href="<game>.html">
  <img src="assets/<game>/covers/title-<game>.jpg" alt="<게임명>" />
  <strong><게임명></strong>
</a>
```

### Step 3 — `<game>.html` 작성
- §3 골격을 그대로 복사
- `aria-label`만 게임명으로 변경
- `clueSetupPanel` → `<game>SetupPanel`
- `clue-setup-shell` → `<game>-setup-shell`로 일관 변경

### Step 4 — `<game>.css` 작성
- 색상/패널 라운드/로고 사이즈만 override
- 첫 줄은 항상 `<game>-setup-shell { ... }`로 시작
- §5.1 금지 사항 준수

### Step 5 — `setup-shell.js` + `scripts/player-stats.js` 로드
§6의 4개 스크립트 태그를 `<body>` 끝에 동일하게 배치.

### Step 6 — Supabase `game_type` 등록
```sql
-- supabase-schema.sql 안에 game_type enum 또는 text 추가
-- fetchTopRankingsByScore('clue', 10) 처럼 game_type 문자열 일치시키기
```

### Step 7 — 시작 화면 검증
서버 띄우고(viewport 1280 + 768) 셸 폭이 `min(1120, 100%)` 인지, 그리드 2열이 정상인지, 스케일 컨트롤이 `100%로 시작`하는지 확인.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

### Step 8 — QA-CHECKLIST.md 따라 최종 점검
특히 `Q-11 .. Q-15` (시작 화면/랭킹/스케일) 통과 확인.

---

## 8. 흔한 실수 & FAQ

| 증상 | 원인 | 해결 |
|---|---|---|
| 셸 폭이 138px로 줄음 | 직전 세션에서 배율 컨트롤을 50%로 조정한 뒤 localStorage 잔존 | `fantasyR.setupScalePercent = 100` 으로 리셋 |
| 시작 화면이 한쪽만 보임 | 게임 `<game>-setup-panel`의 래퍼가 `align-items:center` 누락 | 부모 `display:grid; place-items:start center` 확인 |
| 랭킹이 "랭킹 연결을 확인해주세요." | `data-game-type` 미스매치 또는 supabase 호출 실패 | 콘솔 + `supabase-doctor.js` 실행 |
| 모달이 안 열림 | `<dialog id="...">` 누락 또는 `data-dialog-target` 오타 | ID 일치 확인 |
| 반응형 깨짐 | 새 미디어 쿼리 추가 | 기존 1180/860/560 분기 활용 또는 부모 토큰 사용 |

---

## 9. 빠른 참조 — 코드 위치

| 항목 | 파일:라인 |
|---|---|
| 5토큰 정의 | [setup-shell.css:2-9](setup-shell.css#L2-L9) |
| 1180px 분기 | [setup-shell.css:521](setup-shell.css#L521) |
| compound class 패턴 (clue) | [setup-shell.css:384-405](setup-shell.css#L384-L405) |
| compound class 패턴 (monopoly) | [setup-shell.css:433-460](setup-shell.css#L433-L460) |
| compound class 패턴 (cant/tally) | [setup-shell.css:311-340](setup-shell.css#L311-L340) |
| 스케일 컨트롤 | [setup-shell.js:11-40](setup-shell.js#L11-L40) |
| 랭킹 자동 로딩 | [setup-shell.js:63-130](setup-shell.js#L63-L130) |
| 1차 출처 (토큰 정의) | [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md) |
| 데모 시작 화면 | [clue.html](clue.html), [monopoly.html](monopoly.html) |

---

## 10. 체크리스트 (PR 전 확인)

- [ ] 셸 루트에 `.game-setup-shell` **+** `.<game>-setup-shell` 두 클래스 동시 적용
- [ ] `<game>.css`에 새 폭/여백 **리터럴** 박지 않음 — 모두 `var(--setup-*)`
- [ ] 미디어 쿼리 분기 추가 없음 (또는 명백한 이유로 부모 셸트 OK)
- [ ] `data-setup-scale` + `data-scale-target=".game-setup-shell"` 일치
- [ ] 랭킹 `<ul data-live-ranking data-game-type="<game>">` 가 game_type과 일치
- [ ] 도움말 `<dialog id="<game>RulesDialog">` 존재 + `data-dialog-target` 일치
- [ ] 1280px viewport에서 셸 폭 `1120px` (±2px 허용)
- [ ] 768px viewport에서 1열 fallback 정상
- [ ] QA-CHECKLIST Q-11~Q-15 통과

---

마지막 변경: 2026-07-13 · 8게임 통합 작업 (`00b0f01`)
