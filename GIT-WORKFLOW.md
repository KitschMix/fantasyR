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

## 🤖 AI 어시스턴트 작업 가이드

본 저장소에서 작업하는 AI는 다음을 준수해야 합니다:

1. **작업 전 `git status` 확인** — 미추적 파일이나 미푸시 커밋이 있으면 사용자에게 알림.
2. **새 기능은 작업 브랜치에서** — main에서 직접 작업하지 않음 (단, 단순 문서 수정 제외).
3. **작업 완료 후 정리 제안** — `git push origin --delete <branch>` 까지 한 번에.
4. **충돌 시 작업 중단 + 보고** — cherry-pick/rebase 중 충돌이 발견되면 사용자 확인.
5. **Vercel 배포 영향 인지** — main push 전 안정성 한 번 더 확인.
6. **로컬 main을 임의로 푸시하지 않음** — 사용자 명시 허락 후에만.
7. **카드 비율 정사각형 유지** — 디자인 규칙 (자세한 내용은 사용자 메모리 참조).

---

## 📞 도움말

- PR 없이도 깔끔하게 운영 가능 (위 워크플로우 참고).
- Git 자체가 처음이면: `git --help`, `git <명령> --help`, 또는 ChatGPT/Copilot에게 질문.
- 저장소 정리 1회 작업 필요 시: `gh` CLI 설치 후 `gh repo view --web` 또는 GitHub 웹에서 수동 정리.

---

**마지막 정리 일자**: 2026-07-12 (부루마불 브랜치 22개 정리, main 단일 라인화)