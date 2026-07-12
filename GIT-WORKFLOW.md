# Git Workflow — 판타지왕국 PC버전

> **대상**: 본 저장소에서 작업하는 모든 사람과 AI 어시스턴트(Claude, GitHub Copilot, Cursor 등)
> **목적**: 브랜치/커밋 관리의 일관성 유지, 작업 손실 방지, 자동 배포 안전성 확보

---

## 🎯 핵심 원칙

1. **브랜치는 메모장, main은 정답지**
   - 메모(브랜치)는 작업 끝나면 정답지(main)에 옮기고 메모장은 비웁니다.
2. **PR 없이도 깔끔하게** — 솔로 프로젝트이므로 직접 머지 + 브랜치 삭제로 운영합니다.
3. **main 직접 push OK** — 안정화된 작업은 main에 직접 push. Vercel 자동 배포가 진행됩니다.
4. **작업 단위는 작게** — 커밋 1개 = 의미 있는 변경 1개.
5. **끝나면 즉시 정리** — 머지 후 같은 세션에서 브랜치 삭제.

---

## 📋 일상 워크플로우

### 새 작업 시작
```powershell
git switch main
git pull
git switch -c feat/<게임>-<내용>
```

### 브랜치 명명 규칙

| Prefix | 용도 | 예시 |
|---|---|---|
| `feat/` | 새 기능 | `feat/splendor-ai-easy-mode` |
| `fix/` | 버그 수정 | `fix/monopoly-dice-glitch` |
| `refactor/` | 리팩토링 | `refactor/hand-logic-cleanup` |
| `docs/` | 문서만 변경 | `docs/update-readme` |
| `chore/` | 빌드/도구 변경 | `chore/add-eslint` |

게임 prefix는 단축 사용: `splendor`, `monopoly`, `clue`, `tally-ho`, `cant-stop`, `dominion`, `sushi-go`, `fantasy`.

### 작업 중 커밋
```powershell
git add -p
git commit -m "feat(splendor): AI 쉬움 난이도 추가"
```

### 작업 완료 — main에 머지 + 브랜치 삭제 (한 줄)
```powershell
git switch main
git merge --squash @{-1}
git commit -m "feat(splendor): AI 쉬움 난이도 추가"
git branch -d @{-1}
git push origin main
git push origin --delete @{-1}
```

또는 alias 등록 후:
```powershell
git config --global alias.done "!git switch main && git merge --squash @{-1} && git branch -d @{-1}"
# 사용: 작업 브랜치에서 → git done (main으로 이동, 머지, 브랜치 삭제)
```

---

## 📏 커밋 메시지 규칙

```
<type>(<scope>): <한국어 요약>

<본문 — 선택, 변경 이유/맥락>

<footer — 선택, 이슈 번호 등>
```

**좋은 예:**
- `feat(splendor): AI 5단계 난이도 시스템 추가`
- `fix(monopoly): 더블 다이얼로그 사라지는 버그 수정`
- `refactor(vendor): Doppelganger playerCount=2 고정 수정`
- `docs(handoff): 부루마불 작업 인계 노트 갱신`

**나쁜 예:**
- `수정`
- `Update stuff`
- `feat: 작업`

---

## 🗓️ 주간 정리 (10분, 매주 또는 작업 막힐 때)

```powershell
# 1) 원격 미사용 브랜치 제거 (이미 main에 머지된 것)
git fetch --prune
git branch -r --merged main | Select-String 'origin/' | ForEach-Object {
  $b = ($_ -replace '^\s*origin/','').Trim()
  if ($b -ne 'HEAD' -and $b -ne 'main') { git push origin --delete $b }
}

# 2) 로컬 미사용 브랜치 제거
git branch --merged main | Where-Object { $_ -notmatch '\*|main' } | ForEach-Object { git branch -d $_.Trim() }

# 3) 추적 안 되는 임시 파일 확인 (필요 시 정리)
git status
```

---

## 🚫 하지 말 것

- ❌ 브랜치 여러 개 동시에 열어두고 며칠 방치 (부루마불 20+ 브랜치 잔존 사고 방지)
- ❌ "나중에 정리해야지" 미루기
- ❌ main에 의미 없는 `수정`, `Update` 같은 커밋 (squash로 합치기)
- ❌ `git push --force` (필요 시 `--force-with-lease` 사용)
- ❌ `.env`, 개인 키, 임시 파일 커밋
- ❌ 작업 끝났는데 브랜치 삭제 안 하기

---

## ⚠️ 자동 배포 보호 (Vercel)

`main`에 push하면 **Vercel이 자동 배포**합니다.

| 상황 | 권장 |
|---|---|
| 안정적인 기능 추가 | main 직접 push OK |
| 실험적 변경 | 작업 브랜치에서 충분히 테스트 후 main 머지 |
| 큰 리팩토링 | 작업 브랜치에서 검증 → main 머지 → push |
| 긴급 핫픽스 | hotfix/<이름> 브랜치 → main 머지 → push |

---

## 🔧 충돌 해결 가이드

```powershell
# main이 먼저 진행됐을 때 — 내 브랜치를 main 위로 재배치
git switch feat/my-branch
git rebase main
# 충돌 시 → 파일 수정 → git add → git rebase --continue

# 머지 시 충돌
git switch main
git merge feat/my-branch
# 충돌 시 → 파일 수정 → git add → git commit
```

---

## 📌 태그 (Releases)

큰 마일스톤에 태그를 달아 롤백 지점을 확보합니다.

```powershell
git tag -a v1.0-monopoly -m "부루마불 월드투어 v1.0"
git push origin v1.0-monopoly
```

---

## 🎨 디자인 규칙 (모든 게임 공통, 2026-07-12 확립)

본 저장소의 모든 게임 페이지는 다음 디자인 패턴을 따릅니다. 새 게임 추가 시에도 동일하게 적용합니다.

### 1. 카드 비율 — **정사각형** (1:1) 유지 필수

- 모든 게임 카드의 종횡비는 **정사각형**이어야 합니다 (예: 120×120, 170×170 등 1:1 비율).
- 직사각형 / 와이드 / 세로형 카드는 사용하지 않습니다 (오리지널 Splendor 63×88mm 비율도 본 프로젝트에서는 정사각형 통일).
- 귀족(Noble) / 개발 / 보너스 / 패널티 / 특수 카드 모두 포함.
- 단, 보드게임 카드 외의 UI 요소(게임 보드, 패널, 이미지 등)는 자유 비율 가능.

### 2. 로고 — **클릭 가능한 버튼 ❌, 단순 이미지 ✅**

- 게임 페이지의 로고 이미지는 `<img>` 또는 `<div>`로 감싸고 클릭 가능 영역에서 제외합니다 (`aria-hidden="true"` 권장, `<button>` 사용 금지).
- 로고 자체에 페이지 이동 동작을 넣지 않습니다 — 같은 페이지 내 다른 기능과 충돌합니다.
- **이유**: 다른 게임 페이지(splendor, monopoly, clue 등)도 모두 단순 이미지 패턴을 따릅니다.
- 판타지왕국은 2026-07-12에 `<button id="homeLogoButton">` → `<div>` 패턴으로 통일 완료.

### 3. 첫 화면 버튼 — **모든 게임에 명시적 텍스트 버튼**

- 모든 게임 페이지에는 우측 상단 또는 적절한 위치에 `<button id="xxxBackButton" class="secondary-button">첫 화면</button>` 형식의 명시적 첫 화면 버튼이 있어야 합니다 (이미지/아이콘 ❌, 텍스트 ✅, `secondary-button` 클래스 사용).
- 클릭 시 `window.location.href = "index.html"`로 첫 화면(게임 허브) 이동.
- 판타지왕국은 2026-07-12에 `<button id="fantasyBackButton">첫 화면</button>` 추가 완료.
- 다른 게임들(splendor, monopoly, clue, cant-stop, tally-ho, sushi-go, dominion)은 이미 이 패턴을 따르고 있어 변경 불필요.

### 4. Stitch 링크 — **메인 게임 페이지에서 제거** ⛔

- 게임 페이지(`*.html`)에는 `<a href="stitch.html">` 링크를 두지 않습니다 (개발 도구이므로 메인 진입 경로에 노출 안 함).
- 필요 시 별도 디버그/개발 경로(`/dev/` 등)로 분리.
- 판타지왕국은 2026-07-12에 제거 완료.

### 5. 닉네임 — **홈 화면에서만 입력, 게임에서는 읽기만**

- 닉네임 입력 UI는 **홈 화면(`index.html`)만** 가집니다.
- 게임 페이지(`fantasy.html`, `splendor.html`, 등)는 자체 닉네임 입력 폼을 가지지 않고, `localStorage["fantasyKingdom.humanProfile.v1"]`에서 읽기만 합니다 (`currentHumanNickname()` 사용).
- 판타지왕국은 2026-07-12에 자체 폼 제거 → 통합 모달 읽기로 통일 완료 (커밋 `b99c602`).

### 6. 온라인 input — **readonly, 자동 prefill**

- 게임 페이지의 온라인 모드 input(예: `onlineNameInput`, `cantOnlineNameInput`)은 `readonly` 또는 `disabled`로 설정하여 사용자 변경 불가.
- 페이지 로드 시 `localStorage`의 닉네임을 자동으로 input value에 채움 (`syncOnlineNicknameInput()` 같은 함수).
- 플레이어 수 / AI 난이도 같은 게임 옵션은 일반 select/checkbox 유지 (변경 가능).

### 7. input/버튼/label 높이 — **57px 통일** (`.secondary-button` 기준)

- 모든 입력 컨트롤(`input`, `select`, `button`)은 `.secondary-button`의 `min-height: 57px`와 동일하게 맞춥니다.
- 라벨 텍스트는 input 위/안에 placeholder로 통합 (별도 라벨 영역 ❌).
- 예: `<input placeholder="방 코드">` 형태 권장 (라벨 + input 분리 ❌).

### 8. CSS 클래스 통일

- 게임 페이지에서 공통으로 쓰는 스타일:
  - `.secondary-button`: 보조 버튼 (57px 높이, 다크 배경)
  - `.primary-button`: 주요 버튼 (골드 배경, 게임 시작 등)
  - `.icon-button`: 작은 아이콘 버튼 (57×57)
  - `.mode-panel`: 게임 설정 패널
  - `.online-controls`: 온라인 모드 영역

### 변경 이력

- **2026-07-12**: 판타지왕국 디자인 통일 + 로고 클릭 제거 + Stitch 링크 제거 + 첫 화면 버튼 추가 + 닉네임 통합 (`b99c602`, `dd830ec`).
- 이 시점에 splendor / monopoly / clue / cant-stop / tally-ho / sushi-go / dominion은 이미 위 규칙을 따르고 있어 변경 불필요.

---

## 🤖 AI 어시스턴트 작업 가이드

본 저장소에서 작업하는 AI는 다음을 준수해야 합니다:

1. **작업 전 `git status` 확인** — 미추적 파일이나 미푸시 커밋이 있으면 사용자에게 알림.
2. **새 기능은 작업 브랜치에서** — main에서 직접 작업하지 않음 (단, 단순 문서 수정 제외).
3. **작업 완료 후 정리 제안** — `git push origin --delete <branch>` 까지 한 번에.
4. **충돌 시 작업 중단 + 보고** — cherry-pick/rebase 중 충돌이 발견되면 사용자 확인.
5. **Vercel 배포 영향 인지** — main push 전 안정성 한 번 더 확인.
6. **로컬 main을 임의로 푸시하지 않음** — 사용자 명시 허락 후에만.
7. **디자인 규칙 준수** — 위 "🎨 디자인 규칙" 섹션의 8가지 항목 (카드 정사각형, 로고 이미지, 첫 화면 버튼, Stitch 링크 제거, 닉네임 통합, input readonly, 높이 통일, CSS 클래스)을 항상 따른다.
8. **utils.js 의존성 인지** — `script.js`(판타지왕국)는 `scripts/utils.js`의 `shuffle` 함수를 사용하므로 `fantasy.html`에서 utils.js를 로드해야 한다. 새 페이지에서 utils.js의 함수를 사용할 때도 같은 패턴 적용.

---

## 📞 도움말

- PR 없이도 깔끔하게 운영 가능 (위 워크플로우 참고).
- Git 자체가 처음이면: `git --help`, `git <명령> --help`, 또는 ChatGPT/Copilot에게 질문.
- 저장소 정리 1회 작업 필요 시: `gh` CLI 설치 후 `gh repo view --web` 또는 GitHub 웹에서 수동 정리.

---

**마지막 정리 일자**: 2026-07-12 (부루마불 브랜치 22개 정리, main 단일 라인화)