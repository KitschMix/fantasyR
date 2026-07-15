# 부루마불 — AI 난이도별 체감 비교

> 모노폴리(부루마불) AI를 5단계 난이도별로 적용한 후, **인간 플레이어가 체감하는 차이**를 정리한 문서.
> 코드는 `monopoly.js` 안에 helper 5개(`monopolyDifficultyKey`, `shouldAiUseJailCard`, `shouldAiUseExemptionCard`, `evaluateAiBuyDecision`, `chooseAiSpaceTravelDestination`, `hasOpponentMonopolyThreat`) + `aiBuildIfPossible` / `aiBuyDecision` / `runAiTurn` / `runAiSpaceTravel` 4곳에 분기를 심었다.

---

## 한 줄 요약

| 난이도 | 체감 |
|---|---|
| **easy / normal** | 부동산을 사서 집을 짓는 "성실한 여행자". 적당히 돈 벌고 적당히 잃는다. |
| **hard** | 임대료·buffer·호텔 신중 등 **효율 계산**이 보이기 시작한다. |
| **expert / boss** | **상대 차단**과 **내 모노폴리 완성**을 의식한다. 무인도/우주선 카드까지 전략적으로 사용. |

---

## 1. 부동산 구매 — "돈이 되면 무조건 vs 효율 vs 차단"

### 체감 차이

| 시나리오 | easy/normal | hard | expert/boss |
|---|---|---|---|
| ₩500,000짜리 서울에 도착, 잔액 ₩2,900만 | **무조건 구매** | 효율 0.10↑ → **구매** | 효율 + 차단 가치 계산 |
| ₩2,000,000짜리 제주도, 잔액 ₩2,100만 | buffer(200만) 부족 → **패스** | 효율 ≥ 10%면 **구매** | **구매** (상대 위협 시 가중) |
| 후반(15턴 이후), 잔액 부족한 비싼 땅 | **구매** (턴 15+ 룰) | 효율 낮으면 **패스** | 효율 낮으면 **패스** |

### 로그로 보이는 신호

- normal/hard 로그:
  ```
  ✅ 이지(초록) 싱가포르 구매 (₩1,000,000)
  ✅ 건일(파랑) 제주도 구매 (₩2,000,000)
  ```
- expert 로그 (가상):
  ```
  🚫 이지(초록) 아테네 구매를 포기. (효율 낮음)
  🚫 건일(파랑) 마닐라 구매를 포기. (buffer 부족)
  ```

---

## 2. 집 짓기 — "무조건 짓기 vs 신중 vs 전략적"

### 핵심 코드

```javascript
function aiBuildIfPossible(player, tile) {
  const difficulty = monopolyDifficultyKey(player);
  const isMonopolyGroup = isMonopoly(player, tile.group);
  const threatened = hasOpponentMonopolyThreat(player, tile.group);

  while (canBuildOn(player, tile) === "") {
    const level = buildingLevel(player, tile.id);
    const cost = getBuildCost(tile, level + 1);

    if (difficulty === "easy" || difficulty === "normal") {
      if (player.money < cost + 200 * SCALE_FACTOR) break;
    } else if (difficulty === "hard") {
      // 호텔 신중 + buffer 강화
      if (level >= 3 && player.money < cost + 400 * SCALE_FACTOR) break;
      if (player.money < cost + 250 * SCALE_FACTOR) break;
    } else {
      // expert/boss: 모노폴리 그룹이거나 차단 의도 있을 때만
      if (!isMonopolyGroup && !threatened) break;
      if (level >= 3 && cost > player.money * 0.5) break;
      if (player.money < cost + 350 * SCALE_FACTOR) break;
    }
    buildProperty(player, tile.id);
  }
}
```

### 체감 차이

| 상황 | easy/normal | hard | expert/boss |
|---|---|---|---|
| 내 땅 도착 (호텔 가능) | 돈 남으면 **무조건 호텔까지** | 호텔(4단계)은 **buffer 400만 남기고 신중** | **모노폴리 그룹 아니면 짓지 않음**, 호텔은 잔고 50%+ 시 skip |
| 한 색깔 2/3 보유, 상대가 2/3 | 3채까지 그냥 짓기 | 3채까지 짓기 | **차단 의사로 4채까지 짓기** (상대 모노폴리 방지) |
| 한 색깔 1/3만 보유 | 3채까지 짓기 | 3채까지 짓기 | **지을 가치 없음 → 안 짓기** (모노폴리 불가) |

---

## 3. 우대권 사용 — "무조건 vs 큰 rent만"

### 체감 차이

| 임대료 금액 (잔액 대비) | easy/normal | hard+ |
|---|---|---|
| 잔액의 5% (₩100만 / ₩2,000만) | 우대권 **사용** | 우대권 **보존** |
| 잔액의 25% (₩500만 / ₩2,000만) | 우대권 **사용** | 우대권 **사용** |
| 잔액의 50% (₩1,000만 / ₩2,000만) | 우대권 **사용** | 우대권 **사용** + 잔여 카드 보존 의식 |

### 왜 중요한가
- easy/normal은 우대권을 일찍 써버려서 **큰 rent일 때 카드 없음**
- hard+는 작은 rent는 참다가 **큰 rent만 면제** → 위급할 때 카드가 남아있음

---

## 4. 감옥(무인도) — "카드 무조건 vs 더블 시도 우선"

### 체감 차이

| 난이도 | 탈출권 사용 의사결정 |
|---|---|
| **easy** | 탈출권 있으면 **무조건 사용** (더블 시도 안 함) |
| **normal** | **50% 무작위** (가끔 카드, 가끔 더블) |
| **hard** | 돈 < 400만 + 카드 1장일 때만 사용 |
| **expert/boss** | 돈 ≥ 200만이면 **더블 시도 우선** (탈출권은 진짜 위급할 때만) |

### 로그 신호
- easy: `🎫 이지(초록) 무인도 탈출권을 사용하여 무인도 탈출.` (거의 매번)
- expert: `🎲 이지(초록) 더블로 탈옥! (5+5)` (더블 시도 후 성공)

---

## 5. 우주선 — "가장 비싼 곳 vs 그룹 보너스 vs 차단"

### 핵심 코드

```javascript
function chooseAiSpaceTravelDestination(player, affordables, difficulty) {
  if (difficulty === "easy" || difficulty === "normal") {
    return [...affordables].sort((a, b) => b.price - a.price)[0].id;
  }
  // hard+: 점수 = 가격*0.5 + (내가 그룹 보유 시 +50~+80) + (차단 가치 +50~+100)
  const scored = affordables.map((t) => {
    let score = t.price * 0.5;
    const group = COLOR_GROUPS[t.group] || [];
    const ownedByMe = player.properties.filter((id) => group.includes(id)).length;
    const ownedByOpps = state.players
      .filter((p) => p !== player && !p.bankrupt)
      .reduce((sum, p) => sum + p.properties.filter((id) => group.includes(id)).length, 0);
    if (ownedByMe > 0) score += 50 + ownedByMe * 30;          // 내 그룹 보너스
    if (ownedByOpps >= group.length - 1) {
      score += difficulty === "expert" || difficulty === "boss" ? 100 : 50;  // 차단
    }
    return { t, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0].t.id;
}
```

### 체감 차이

| 상황 | easy/normal | hard | expert/boss |
|---|---|---|---|
| 같은 색 1개 보유, 비싼 미소유 2개 | 더 비싼 곳으로 | **같은 색**으로 (보너스 50) | **같은 색**으로 (보너스 50) |
| 상대가 모노폴리 1개 자리 (3/3 보유) | 신경 안 씀 | **차단 가중 50** | **차단 가중 100** (강하게 막음) |

---

## 6. 한 게임 비교 — 직접 플레이 시 체크리스트

3개 페이지를 동시에 열어두고 다음을 관찰하면 차이가 보입니다:

- [ ] **초반 5턴**: easy/hard/expert 모두 비슷한 구매 패턴 (큰 차이 없음)
- [ ] **중반 10~15턴**: hard가 효율 낮은 땅을 **패스**하기 시작
- [ ] **중반 15~20턴**: expert가 **차단 의도**로 4채까지 짓는 모습 보임
- [ ] **감옥 갇힘**: expert는 **더블 시도**, easy는 **즉시 카드 사용**
- [ ] **큰 rent (500만+)**: hard/expert가 우대권 **사용**, easy는 이미 소진
- [ ] **우주선**: expert는 **상대 위협 그룹**으로 이동

---

## 7. 추천 플레이

| 목적 | 난이도 |
|---|---|
| 게임 룰 익히기 | easy / normal |
| 적당히 경쟁적인 게임 | hard |
| 진짜 전략적 상대 | expert |
| 압도적인 도전 | boss (강범례 NPC 등장) |

---

## 8. 알려진 한계 / TODO

- [ ] **모노폴리 완성 가치 계산** — 현재는 "그룹 다 모았나"만 봄, "남은 1장의 가격 대비 효율"은 미고려
- [ ] **auction 경매** — 미소유 땅 경매 시 입찰 전략 없음 (현재는 항상 skip)
- [ ] **상대 파산 추적** — 한 상대 파산 후 해당 색 그룹 재배분 시 우선권 평가 없음
- [ ] **감옥 위기의도적 자진 입소** (3 더블 조작) — 일부 숙련자는 의도적으로 감옥에 들어가는데 AI는 그 반대 (탈출 우선)

---

## 부록 — 추가된 helper 함수 위치

| 함수 | 라인 | 역할 |
|---|---|---|
| `monopolyDifficultyKey` | ~monopoly.js:1938 | player.profile.difficulty 추출 |
| `hasOpponentMonopolyThreat` | ~monopoly.js:1945 | 상대 모노폴리 1개자리 위협 감지 |
| `shouldAiUseJailCard` | ~monopoly.js:1954 | 감옥 탈출권 사용 여부 |
| `shouldAiUseExemptionCard` | ~monopoly.js:1963 | 우대권 사용 여부 |
| `evaluateAiBuyDecision` | ~monopoly.js:1972 | 부동산 구매 결정 |
| `chooseAiSpaceTravelDestination` | ~monopoly.js:1986 | 우주선 목적지 |

분기 적용:
- [`runAiTurn`](monopoly.js#L2066) — jail
- [`aiBuyDecision`](monopoly.js#L1916) — 임대료 + 구매
- [`aiBuildIfPossible`](monopoly.js#L1879) — 집 짓기
- [`runAiSpaceTravel`](monopoly.js#L2246) — 우주선 목적지