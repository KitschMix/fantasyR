# 시작화면 디자인 명세

> 기준 게임: **스플렌더 (splendor)** · 비교 게임: **스시고 (sushi-go)** — 두 게임 모두 표준 셸을 그대로 쓰는 6개 게임의 대표 케이스  
> 기준 파일: [splendor.html](splendor.html) · [splendor.css](splendor.css) · [sushi-go.html](sushi-go.html) · [setup-shell.css](setup-shell.css)  
> 최종 갱신: 2026-07-14

이 명세서는 **8개 게임의 시작화면이 공유하는 표준 구조**와, 각 게임이 자기 톤으로 살짝 얹는 차이점을 정리한다. 캔트스탑/탤리호처럼 자기 톤을 강하게 넣는 패턴은 11번 섹션에서 "예외 케이스"로 다룬다.

---

## 1. 한 줄 요약

> **표준 셸(setup-shell)을 그대로 입고, 게임별 톤은 로고/멀티플레이 안내 한두 곳에만 살짝 얹는다.**

---

## 2. 디자인 토큰

### 2.1 글로벌 토큰 ([styles.css](styles.css))

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--text` | `#f7ecd9` | 본문 텍스트 |
| `--muted` | `#bcae96` | 보조 텍스트 / 라벨 |
| `--accent` | `#d9a63c` | 강조 (골드) |
| `--accent-2` | `#6bc6a2` | 보조 강조 (민트) |
| `--line` | `rgba(246, 232, 202, 0.16)` | 기본 보더 |
| `--surface` | 어두운 갈색 계열 | 패널 배경 |
| `--surface-2`, `--surface-3` | (참조) | 그라디언트용 |
| `--shadow` | (참조) | 패널 그림자 |
| `--font-ui` | (참조) | 본문 폰트 |

### 2.2 셸 토큰 ([setup-shell.css](setup-shell.css), `.game-setup-shell`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--setup-accent` | `#d4a853` | 셸 골드 액센트 |
| `--setup-max-width` | `1120px` | 본문 최대 폭 |
| `--setup-panel-radius` | `20px` | 패널 둥근 모서리 |
| `--setup-gap` | `24px` | 패널/요소 간 간격 |
| `--setup-logo-height` | `72px` | 로고 최대 높이 (표준) |
| `--setup-panel-min-height` | `430px` | 패널 최소 높이 |

> 게임별 톤은 `.game-setup-shell--<game>` 또는 후손 셀렉터(`.splendor-setup-shell` 등)로 오버라이드한다.

### 2.3 스플렌더 톤 추가 ([splendor.css](splendor.css))

| 추가 셀렉터 | 값 | 비고 |
|-----------|-----|------|
| `.splendor-setup-logo` | `height: 80px` | 표준 72px → 80px로 살짝 키움 |
| `.splendor-panel` | `width: min(520px, 92vw)` | 패널 폭 가드 |
| `.splendor-setup-controls label` | `font-weight: 600` | 라벨 weight (기본 850보다 가벼움) |

> 게임 톤은 셀렉터 한두 개, 값도 한두 줄 — 셸을 깨지 않는다.

---

## 3. 페이지 레이아웃

### 3.1 전체 구조

```
.splendor-setup-panel               ← body 최상위 wrapper
└── #splendorSetupShell              ← id가 scale target
    └── .game-setup-shell.splendor-setup-shell   ← 셸 컨테이너 (max 1120px)
        ├── .game-setup-header         ← 헤더
        │   ├── .game-setup-brand      ← 좌측 로고
        │   └── .game-setup-actions    ← 우측 액션 그룹
        └── .game-setup-grid.splendor-setup-grid   ← 메인 2컬럼
            ├── .mode-panel.single-panel.splendor-panel   ← 싱글플레이 (좌)
            ├── .mode-panel.online-panel.splendor-panel   ← 멀티플레이 (우)
            └── .mode-panel.leaderboard-panel.game-ranking-panel   ← 랭킹 (풀폭)
```

### 3.2 그리드 정의

| 그리드 | 컬럼 | 비고 |
|--------|------|------|
| `.game-setup-grid` | `repeat(2, minmax(0, 1fr))` | 2컬럼 (싱글/멀티) |
| `.game-ranking-panel` | `1 / -1` | 풀 폭 (3번째 행) |
| `.setup-controls` | `grid-template-columns: 1fr` (또는 2컬럼) | 게임별 상이 |
| `.online-controls` | (게임별 상이) | 멀티 패널 입력 그룹 |

---

## 4. 상단 헤더 (`.game-setup-header`)

### 4.1 구조

```
.game-setup-header
├── .game-setup-brand
│   └── .game-setup-logo (img)        ← 표준 72px
└── .game-setup-actions
    ├── .icon-button [data-dialog-target="#...RulesDialog"]   ← ? (도움말)
    ├── .setup-scale-control            ← 배율 조절
    │   ├── .icon-button [data-scale-down]   ← 축소 (-)
    │   ├── .setup-scale-value              ← "100%"
    │   └── .icon-button [data-scale-up]     ← 확대 (+)
    └── .secondary-button #gameBackButton  ← "첫 화면"
```

### 4.2 스타일

| 요소 | 값 | 비고 |
|------|-----|------|
| `.game-setup-header` | `display: flex`, `justify-content: space-between`, `min-height: 126px` | |
| `.game-setup-logo` | `width: min(420px, 42vw)`, `max-height: 72px` | 표준 |
| `.splendor-setup-logo` | `height: 80px` | 스플렌더만 살짝 큰 톤 |
| `.icon-button` | `width/height: 57px` (default) | |
| `.game-setup-actions > *` | `min-height: 46px` | 액션 그룹은 46px로 통일 |
| `.setup-scale-control` | grid `38px / minmax(58px, auto) / 38px` | |
| `.setup-scale-value` | `font-size: 14px`, `font-weight: 900`, `color: #fff6d8` | |

### 4.3 배율 컨트롤 동작

- 범위: `50% ~ 120%`, step `10%`
- 적용 대상: `[data-scale-target]` (스플렌더는 `#splendorSetupShell`)
- 저장소: `localStorage["fantasyR.setupScalePercent"]`
- 적용 방식: `target.style.zoom = scale / 100`
- setup-shell.js가 페이지 로드 시 자동으로 부착한다

---

## 5. 3개 모드 패널

### 5.1 공통 패널 (`.mode-panel`)

```
.mode-panel
├── .mode-panel-head             ← 헤더 (제목 + 부제)
│   ├── <strong>{모드명}</strong>
│   └── <span>{부제}</span>
└── {컨텐츠 — .setup-controls | .online-controls | .leaderboard-board}
```

- 셸에서 `display: flex`, `flex-direction: column`, `gap: var(--setup-gap)`
- `min-height: var(--setup-panel-min-height)` (430px)
- 게임별 패널 자체 추가 스타일 (예: `.splendor-panel`)

### 5.2 모드 헤더 (`.mode-panel-head`)

| 요소 | 표준 값 | 셸(game-setup-mode) 값 |
|------|---------|----------------------|
| `strong` 폰트 | `29px` | `25px` |
| `span` 폰트 | `18px` | `16px` |
| `span` 색상 | `var(--muted)` | (기본) |
| 정렬 | `baseline` | `baseline` |
| 보더 하단 | (없음) | `1px solid rgba(246, 232, 202, 0.12)` |
| 최소 높이 | (없음) | `54px` |
| 간격 | `space-between` | `space-between` |

> `game-setup-mode` 모디파이어를 붙이면 표준 패널보다 약간 작아진다 — 시작화면에 더 균형 잡힌 비율로 표시.

### 5.3 싱글플레이 패널 (`.single-panel`)

```
.single-panel.splendor-panel.game-setup-mode
├── .mode-panel-head
│   ├── <strong>싱글플레이</strong>
│   └── <span>AI와 보석 경쟁</span>       ← 게임별 부제
└── .splendor-setup-controls.setup-controls
    ├── <label> 플레이어 수 <select>... 2~4명
    ├── <label class="setup-tooltip"> AI 난이도 <select>... 보통/어려움/매우어려움/완전랜덤
    ├── .setup-profile-source.setup-profile-card   ← 표준 44px 카드
    │   ├── <img />
    │   ├── <span>플레이어</span>
    │   └── <strong data-profile-name>닉네임 필요</strong>
    └── .primary-button #startGameButton   ← "게임 시작" (풀 폭, 하단 고정)
```

#### 표준 프로필 카드 (`.setup-profile-source.setup-profile-card`)

- `display: flex`, `align-items: center`, `gap: 12px`
- `padding: 8px 14px`
- `border: 1px solid var(--line)`, `border-radius: 8px`
- 아바타: `width/height: 44px`, `border-radius: 50%`
- 텍스트 span/strong: 라벨/닉네임
- `data-profile-name` 속성으로 setup-shell.js가 자동 동기화

#### 라벨/셀렉트 (`.setup-controls label`)

```
display: grid
gap: 6px
color: var(--muted)
font-size: 16px
font-weight: 850
```

- input/select `min-height: 50px`
- `.setup-tooltip` 클래스로 `data-tooltip` 호버 설명 제공

### 5.4 멀티플레이 패널 (`.online-panel`)

```
.online-panel.splendor-panel.game-setup-mode
├── .mode-panel-head.online-panel-head
│   ├── <strong>멀티플레이</strong>
│   └── <span class="online-status">준비 중</span>      ← 상태 뱃지
└── .online-controls
    ├── .secondary-button [disabled] 방 만들기
    ├── <label> 방 코드 <input maxlength="6" placeholder="6자리 코드" disabled />
    ├── .secondary-button [disabled] 입장
└── .setup-online-note                              ← 표준 안내 카드
    ├── <strong>온라인 보석 경쟁을 준비하고 있습니다.</strong>
    ├── <small>방에 입장하면 참가자와 준비 상태를 확인한 뒤 같은 보석 시장에서 시작하게 됩니다.</small>
```

#### 표준 안내 노트 (`.setup-online-note`)

- `padding: 16px 18px`
- `border-radius: 12px`
- `background: rgba(48, 42, 33, 0.5)`
- `border: 1px dashed rgba(246, 232, 202, 0.22)`
- `<strong>` 폰트: `18px`, `<small>` 폰트: `14px`, weight 750

### 5.5 랭킹 패널 (`.leaderboard-panel` / `.game-ranking-panel`)

```
.leaderboard-panel.splendor-leaderboard-panel.game-ranking-panel
├── .mode-panel-head
│   ├── <strong>스플렌더 랭킹</strong>
│   └── .secondary-button.leaderboard-refresh-button   ← 새로고침
└── .leaderboard-board
    └── .leaderboard-column (1~N개)
        ├── <h3>{랭킹 종류}</h3>
        └── <ol class="leaderboard-list" data-live-ranking data-game-type="splendor"> ... </ol>
└── .leaderboard-status                                  ← "랭킹을 불러오는 중입니다."
```

#### 랭킹 패널 공통

- `grid-column: 1 / -1` (풀 폭)
- `display: grid`, `gap: 16px`
- `padding: 20px 22px`

#### 리더보드 항목 (`.leaderboard-list li`)

- `min-height: 58px`
- 닉네임, 점수, 메타(인원/시간) 표시

---

## 6. 공통 컴포넌트

### 6.1 버튼

#### `.primary-button`

- `min-height: 57px`
- `padding: 0 24px`
- 골드 그라디언트: `linear-gradient(180deg, #f0c96a, #d9962e)`
- 텍스트 색: `#1f180b` (어두운 갈색)
- 그림자: `0 10px 26px rgba(217, 166, 60, 0.25)`
- 폰트 weight: 800
- 호버: `transform: translateY(-1px)`

#### `.secondary-button`

- `min-height: 57px`
- `padding: 0 20px`
- 보더: `1px solid var(--line)`
- 배경: `rgba(48, 42, 33, 0.92)`
- 호버: `transform: translateY(-1px)`
- `[disabled]` 상태에서 클릭 차단

#### `.icon-button`

- `width: 57px`
- `font-weight: 900`
- 보더/배경은 secondary와 동일

### 6.2 다이얼로그 (`<dialog>`)

```
<dialog id="splendorRulesDialog" class="splendor-rules-dialog">
  <form method="dialog" class="splendor-rules-help">
    <h2>💎 스플렌더 규칙</h2>
    <ul>...</ul>
    <button class="primary-button" type="submit">확인</button>
  </form>
</dialog>
```

- 스플렌더: `width: min(760px, calc(100vw - 32px))`
- 도움말 영역: `max-height: calc(100vh - 150px)`, `overflow: auto`
- 트리거: `data-dialog-target="#splendorRulesDialog"` (setup-shell.js가 자동 처리)

---

## 7. 인터랙션

### 7.1 호버

- 모든 버튼: `transform: translateY(-1px)` (150ms ease)
- 보더 색 / 배경색은 150ms ease로 전환

### 7.2 배율 컨트롤

- 클릭 시 즉시 적용
- 50% 도달 시 축소 버튼 비활성화
- 120% 도달 시 확대 버튼 비활성화
- 새로고침 후에도 localStorage에서 복원

### 7.3 새로고침 (랭킹)

- 클릭 시 버튼 disabled → `setup-shell.js`의 `loadLiveRanking` 호출 → 완료 후 re-enable

### 7.4 도움말

- `[data-dialog-target]` 클릭 → `<dialog>` 오픈
- `form[method="dialog"]` submit 시 자동 닫힘

### 7.5 첫 화면

- `#gameBackButton`: 시작화면 (`index.html`)으로 이동

---

## 8. 색상 팔레트 요약

| 영역 | 색상 |
|------|------|
| 배경 (앱) | 어두운 갈색 계열 (`var(--surface)`) |
| 액센트 (골드) | `#d9a63c` / `#d4a853` |
| 액센트 (민트) | `#6bc6a2` |
| 텍스트 (본문) | `#f7ecd9` |
| 텍스트 (보조) | `#bcae96` |
| 보더 (표준) | `rgba(246, 232, 202, 0.16)` |
| 보더 (헤더) | `rgba(246, 232, 202, 0.14)` |
| 보더 (온라인 노트 점선) | `rgba(246, 232, 202, 0.22)` |
| 표준 프로필 카드 배경 | `rgba(31, 28, 23, 0.5)` |

---

## 9. 타이포그래피

| 요소 | 크기 | 비고 |
|------|------|------|
| `.mode-panel-head strong` (표준) | `29px` | |
| `.mode-panel-head strong` (game-setup-mode) | `25px` | 시작화면에 사용 |
| `.mode-panel-head span` (표준) | `18px` | |
| `.mode-panel-head span` (game-setup-mode) | `16px` | |
| `.setup-controls label` | `16px`, weight 850 | |
| `.splendor-setup-controls label` | `font-weight: 600` | 스플렌더만 |
| `.primary-button` | default, weight 800 | |
| `.setup-scale-value` | `14px`, weight 900 | |
| `.setup-online-note strong` | `18px` | |
| `.setup-online-note small` | `14px`, weight 750 | |

기본 폰트: 프로젝트 공통 폰트 (assets/fonts/)

---

## 10. 반응형 / 스케일

### 10.1 viewport 대응

- 셸 폭: `width: min(1120px, 100%)`
- 헤더: `min-height: 126px`
- 로고: `width: min(420px, 42vw)` 로 viewport 비례 축소
- 그리드: 2컬럼 고정 → 좁아지면 wrap
- 패널 폭 가드: `.splendor-panel` `width: min(520px, 92vw)`

### 10.2 사용자 배율

- 50%~120% 자유 조정 (10% step)
- 셸 전체에 `zoom` 속성 적용 (id 셀렉터 대상)

### 10.3 `body` 클래스

- `body.splendor-active` → 스플렌더 화면 표시, 다른 게임 화면 `display: none !important`
- `body.app-loading` → 로딩 오버레이 표시
- 게임 진입 후: `.splendor-active.splendor-playing` → 셸 hide, 게임 패널 show

---

## 11. 8개 게임 비교표

| 게임 | 표준 패턴 준수 | 자기 톤 추가 | 부제 |
|------|--------------|------------|------|
| **splendor** | ✅ 완전 표준 | 로고 80px, 패널 폭 가드 | "AI와 보석 경쟁" |
| **sushi-go** | ✅ 완전 표준 | (없음) | "AI와 카드 드래프팅" |
| **clue** | ✅ 표준 | (없음) | "AI와 사건 해결" |
| **monopoly** | ✅ 표준 | (없음) | "AI와 세계 여행" |
| **fantasy** | ✅ 표준 | (없음) | "AI와 바로 시작" |
| **dominion** | ✅ 표준 | 멀티 플레이 패널 미존재 | "덱 빌딩" |
| **cant-stop** | ⚠️ 톤 강조 | 자체 큰 카드 74px, 자체 로고 180px, 자체 보더 블루, 자체 멀티 placeholder | "AI와 등반 대결" |
| **tally-ho** | ⚠️ 톤 강조 | 자체 큰 카드 74px, 자체 보더 골드, 자체 멀티 placeholder | "AI와 바로 시작" |

### 표준 패턴 vs 톤 강조 패턴

**표준 패턴 (6 게임)**: 셸 토큰 + 표준 셀렉터만 사용. 게임 톤 추가 거의 없음.
- 모든 카드: `data-profile-name` 자동 동기화
- 모든 멀티플레이 패널: `.setup-online-note` 사용
- 모든 헤더: `min-height: 126px`

**톤 강조 패턴 (2 게임: cant-stop, tally-ho)**: 게임 안에서 쓰는 자기 톤을 시작화면에도 들여옴.
- 자체 큰 프로필 카드 (74px) — 게임 내 player card와 톤 일치
- 자체 멀티플레이 placeholder (.cant-online-placeholder 등)
- 캔트스탑: 시그니처 블루 (`rgba(98, 162, 191, 0.32)` 보더)
- 캔트스탑: 자체 로고 크기 (`max-height: 180px`)

> 모든 카드는 `data-profile-name`을 가져서 첫 화면에서 닉네임을 바꾸면 setup-shell.js가 즉시 모든 카드를 갱신한다.

---

## 12. 자동 동작 ([setup-shell.js](setup-shell.js))

페이지 로드 시 다음 기능이 자동 부착된다:

1. **배율 컨트롤** — `[data-setup-scale]`
2. **다이얼로그** — `[data-dialog-target]`
3. **라이브 랭킹** — `[data-live-ranking]`, `[data-live-ranking-refresh]`
4. **미리보기 랭킹 새로고침** — `[data-preview-ranking-refresh]`
5. **멀티플레이 패널 보장** — `.game-setup-grid` 단위로 1회
6. **프로필 카드 동기화** — `[data-profile-name]` 모두 자동 (localStorage `fantasyKingdom.humanProfile.v1`)
   - `storage` 이벤트 + 커스텀 `fantasy:profile-updated` 이벤트 구독

---

## 13. 라이브 미리보기

- 라이브 URL: https://fantasyr.vercel.app/splendor.html
- 디자인 시안 미리보기: [design-preview.html](design-preview.html)

---

## 변경 이력

- **2026-07-14**: 스플렌더 기준으로 다시 작성 (캔트스탑 기준 → 스플렌더 기준으로 변경). 싱글플레이 프로필 카드 통일 (옵션 B), 멀티플레이 패널 프로필 카드 추가 후 재제거, 헤드 텍스트/버튼 라벨 통일 (`fix(setup): 시작화면 텍스트 일관성`)
- **2026-07-06**: 시작화면 8게임 통일 (setup-shell.css/.js 분리, [START_SCREEN_UNIFICATION_HANDOFF.md](START_SCREEN_UNIFICATION_HANDOFF.md))