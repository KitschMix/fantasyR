# 판타지왕국 PC버전

판타지 왕국 계산기 사이트의 카드 목록을 기준으로 만든 PC용 조합 카드게임 프로토타입입니다.

## 실행

`index.html`을 브라우저로 열면 바로 실행됩니다.

## 현재 구현

- 2~4인 로컬 플레이
- 사람 1명 + AI 상대
- 손패 7장 유지
- 덱 또는 공개 버린 카드에서 가져오기
- 가져온 뒤 1장 버리기
- 공개 버린 카드 10장 도달 시 자동 종료
- 계산기 기준 카드 54장
- 보너스/패널티/무효를 반영한 자동 점수 계산과 점수 내역 표시

## 참고

카드 목록과 기본 점수 로직은 `https://khj098765.github.io/fantasy-realms-kor/`의 공개 계산기 스크립트를 `vendor/fantasy-realms-kor/`에 보관해 사용합니다. 해당 스크립트를 읽지 못하면 내장 오리지널 덱으로 fallback됩니다.

## Supabase keep-alive (6시간 ping)

Supabase 무료 플랜은 **7일간 비활성 시 자동 paused** 되어 DB endpoint가 응답을 멈춥니다. 이를 막기 위해 6시간마다 가벼운 read 쿼리를 보내는 keep-alive 파이프라인:

- **스케줄러** (`.github/workflows/keep-alive.yml`) — 6시간마다 (`17 */6 * * *`, 정시 트래픽 분산)
- **워밍업 엔드포인트** (`api/keep-alive.js`) — Vercel Serverless Function. supabase `fantasy_player_summary` 1행 read. 외부 실패해도 200 응답 (재시도 부담 ↓)
- **왜 이렇게 분리?** — Vercel Hobby Cron = 일 2회 한도 → 6시간(4회) 유지 불가. GitHub Actions 무료 cron + Vercel 함수 wake-up 조합.

### 첫 배포 시 1회 세팅

1. **Vercel** 대시보드 → 프로젝트 → Settings → Environment Variables:
   - `SUPABASE_URL` = `https://<project-ref>.supabase.co`
   - `SUPABASE_KEY` = `sb_publishable_…` (anon public)

2. **GitHub** repo → Settings → Secrets and variables → Actions:
   - `VERCEL_KEEPALIVE_URL` = `https://<your-project>.vercel.app/api/keep-alive`

3. **테스트**: `curl https://<your-project>.vercel.app/api/keep-alive` → 200 OK.

이후 GitHub Actions cron이 6시간마다 자동 호출 → Supabase 활성 유지.
