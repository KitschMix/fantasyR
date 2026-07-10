# Handoff

## Current State

- Branch: `main`
- Latest commit: `dc8be9f feat: 스플렌더 AI 5단계 난이도 시스템 (쉬움~최종보스) - 전략 차별화`
- Pushed to: `origin/main`
- Vercel 배포: 자동 진행 중

## 스플렌더 AI 5단계 난이도 시스템 (2026-07-10)

### 작업 요약

사용자 요청: "AI 난이도 조절 해보자 디테일하게"
→ 스플렌더 AI를 5단계 난이도(쉬움~최종보스)로 세분화하고 각 난이도마다 차별화된 전략 구현.

### 변경 사항

#### shared-profiles.js
- easy (초보, 연습, 학습), boss (마스터, 전설, 챔피언) 추가
- AI_PROFILE_DIFFICULTY_KEYS = ["easy", "normal", "hard", "expert", "boss"]

#### splendor.js
- AI_DIFFICULTY_CONFIG 5단계 추가:
  - easy: mistakeRate 0.45, 가장 저렴한 카드, 무작위 토큰
  - normal: mistakeRate 0.25, 가장 높은 점수, 필요한 토큰 순
  - hard: mistakeRate 0.10, 보너스 효율성 가중 (considerBonus)
  - expert: mistakeRate 0.03, 귀족 매칭 고려 (considerNoble), 2개 같은 색 전략 (preferDoubles)
  - boss: mistakeRate 0, 모든 전략 + 상대 차단 포함
- 헬퍼 함수 4개: aiScoreCardValue, aiFindClosestNoble, aiScoreGemForBonus, aiIsResourceStarved
- aiChooseAction 완전 재작성 (5단계 분기)
- endTurn thinkTime 난이도별 차등 (쉬움 4.5~7초, 최종보스 1~2.5초)
- buildPlayers 버그 수정: difficulty 필드 누락 → 정상 복사

### 발견된 치명적 버그

buildPlayers가 profile.difficulty를 player에 복사하지 않아 모든 AI가 normal로 동작.
한 줄 수정으로 5단계 시스템이 정상 작동하게 됨.

또한 shared-profiles.js의 expert/boss 그룹이 섞여있던 syntax 오류도 수정.

### 브라우저 테스트 결과

| AI | 평균 결정 시간 | 특징 |
|----|---------------|------|
| easy (연습) | 7.4초 | 무작위 토큰, 저렴한 카드 우선 |
| hard (미미) | 6.9초 | 보너스 효율성 가중, 5점 카드 예약 |
| expert (변판득) | 4.7초 | 귀족 매칭, 2개 같은 색 전략 |
| **boss (마스터)** | **4.1초** | **모든 전략 + 빠른 결정** |

자원 순환 정상화 확인 (이전엔 토큰 고갈로 게임 정체, 현재는 60턴+ 진행).

### 변경 통계

- shared-profiles.js: 19줄 변경
- splendor.js: 353줄 변경 (289 추가, 82 삭제)
- 커밋: `dc8be9f`
- GitHub 푸시: ✅

### 향후 개선 (선택)

1. splendor.html에 AI 난이도 선택 UI 추가
2. monopoly.js, clue.js 등에도 동일 시스템 적용
3. AI 대 AI 시뮬레이션으로 난이도 균형 측정
4. easy/boss 전용 프로필 이미지 제작 (현재 placeholder)

## What Changed

- Added the provided Burumabul logo asset at `assets/titles/brumable-logo.webp`.
- Updated `monopoly.html` to use the logo in the setup screen, game header, and board center.
- Reworked `monopoly.css` with a Burumabul-specific visual system:
  - blue logo-led palette
  - ivory board surface
  - colored city tiles
  - compact PC layout that fits a 1280x720 viewport without scrolling
- Updated `monopoly.js` copy and board data from Seoul/local placeholders to a world-tour Burumabul tone:
  - `부루마불`
  - `황금열쇠`
  - `무인도`
  - `우주여행`
  - world city names
- Updated `index.html` so the launcher uses the new Burumabul logo and keeps Korean text readable.

## Verification

- Ran JS syntax check:
  - `node --check monopoly.js`
- Browser-checked local app through:
  - `http://127.0.0.1:8765/monopoly.html`
- Confirmed:
  - setup screen logo renders
  - game screen logo renders in header and board center
  - no browser console errors
  - launcher uses `assets/titles/brumable-logo.webp`

## Deployment

- Git push completed to `origin/main`.
- Vercel reported success for commit `06dc1bf`:
  - `Deployment has completed`
  - deployment URL observed: `https://fantasyr.vercel.app`
- GitHub Pages deployment also ran, but failed with:
  - `Deployment failed, try again later.`
- Existing GitHub Pages URL was still serving older content during verification:
  - `https://kitschmix.github.io/fantasyR/`

## Follow-Up

- If GitHub Pages is the public target, rerun or inspect the Pages deployment job.
- We verified that the live Vercel URL `https://fantasyr.vercel.app` is successfully deploying changes from `main` without login block redirects.
