const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

/**
 * 스플렌더 난이도 점검 테스트:
 *  - 5개 셀렉트 옵션(easy/normal/hard/expert/boss)이 실제 AI 동작에 반영되는지
 *  - 각 난이도의 config 키(mistakeRate, cardStrategy, tokenStrategy, reserveStrategy)가
 *    AI_DIFFICULTY_CONFIG 그대로 설정되는지
 */
function loadSplendor(difficulty, count = 3) {
  const timers = new Map();
  let nextTimer = 1;
  let now = 100000;
  const children = [];
  const element = () => ({
    classList: { add() {}, remove() {}, contains() { return false; } },
    style: { setProperty() {} },
    appendChild(child) { children.push(child); },
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, setAttribute() {}, remove() {}
  });
  const sandbox = {
    console: { warn() {} },
    // shared-profiles.js 모킹: 각 난이도 그룹에 최소 1명씩
    FANTASY_SHARED_PROFILES: {
      root: "assets/profiles/user",
      human: { name: "나", avatarUrl: "assets/profiles/user/%EC%9C%A0%EC%A0%80.jpg" },
      difficultyLabels: { easy:"쉬움", normal:"보통", hard:"어려움", expert:"매우어려움", boss:"최종보스", random:"완전랜덤" },
      difficultyKeys: ["easy","normal","hard","expert","boss"],
      groups: {
        easy:   [{ name: "이지E", avatarUrl: "e.jpg" }, { name: "이지E2", avatarUrl: "e2.jpg" }],
        normal: [{ name: "건일", avatarUrl: "n1.jpg" }, { name: "루나", avatarUrl: "n2.jpg" }, { name: "케이", avatarUrl: "n3.jpg" }],
        hard:   [{ name: "레이븐", avatarUrl: "h.jpg" }, { name: "메이", avatarUrl: "h2.jpg" }],
        expert: [{ name: "강범례", avatarUrl: "ex.jpg" }, { name: "변판길", avatarUrl: "ex2.jpg" }],
        boss:   [{ name: "강범례", avatarUrl: "b.jpg" }, { name: "변판길", avatarUrl: "b2.jpg" }]
      }
    },
    document: {
      body: element(), documentElement: { clientWidth: 1280, clientHeight: 800 },
      querySelector(sel) {
        if (sel === '#splendorPlayerCountSelect') return { value: String(count) };
        if (sel === '#splendorDifficultySelect') return { value: difficulty };
        return null;
      },
      querySelectorAll() { return []; }, addEventListener() {}, createElement: element
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    Image: class { set src(value) { this.onload?.(); } },
    Date: class extends Date { static now() { return now; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    setTimeout(cb, delay) { const id = nextTimer++; timers.set(id, { at: now + delay, callback: cb }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { return nextTimer++; }, clearInterval() {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(__dirname, '../splendor.js'), 'utf8');
  vm.runInContext(
    source.replace(
      '  window.SplendorGame = {',
      '  window.splendorTest = { state };\n  window.SplendorGame = {'
    ),
    sandbox,
    { filename: 'splendor.js' }
  );
  sandbox.SplendorGame.start();
  return { state: sandbox.splendorTest.state, sandbox };
}

let pass = 0, total = 0;
async function check(name, fn) {
  total++;
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}: ${e.stack}`); }
}

(async () => {
  // 1) 5단계 모두 UI 셀렉트에 노출된 값으로 시작 가능
  for (const difficulty of ['easy', 'normal', 'hard', 'expert', 'boss']) {
    await check(`시작: ${difficulty} 난이도가 AI에 적용`, () => {
      const game = loadSplendor(difficulty);
      assert.equal(game.state.aiDifficulty, difficulty, `state.aiDifficulty 미반영: ${game.state.aiDifficulty}`);
      for (const player of game.state.players) {
        if (player.human) continue;
        assert.equal(player.difficulty, difficulty, `AI difficulty 미반영: ${player.difficulty}`);
      }
    });
  }

  // 2) 각 난이도별 mistakeRate / cardStrategy가 config에 존재
  const EXPECTED = {
    easy:   { mistakeRate: 0.45, cardStrategy: 'lowest',  tokenStrategy: 'random',  reserveStrategy: 'rare',              preferDoubles: false },
    normal: { mistakeRate: 0.25, cardStrategy: 'highest', tokenStrategy: 'needed',  reserveStrategy: 'tier3',             preferDoubles: false },
    hard:   { mistakeRate: 0.10, cardStrategy: 'value',   tokenStrategy: 'needed',  reserveStrategy: 'tier3_strategic',  preferDoubles: false },
    expert: { mistakeRate: 0.03, cardStrategy: 'value',   tokenStrategy: 'needed_bonus', reserveStrategy: 'high_value',  preferDoubles: true  },
    boss:   { mistakeRate: 0,    cardStrategy: 'value_noble', tokenStrategy: 'smart', reserveStrategy: 'denial',     preferDoubles: true  }
  };
  const configSrc = (() => {
    const txt = fs.readFileSync(path.join(__dirname, '../splendor.js'), 'utf8');
    const m = txt.match(/const AI_DIFFICULTY_CONFIG\s*=\s*\{[\s\S]*?^\s*\};/m);
    return m ? m[0] : '';
  })();

  for (const [level, exp] of Object.entries(EXPECTED)) {
    await check(`config: ${level} 키/${exp.cardStrategy}/${exp.tokenStrategy}/${exp.reserveStrategy} 노출`, () => {
      assert.match(configSrc, new RegExp(`\\b${level}\\s*:\\s*\\{`));
      assert.match(configSrc, new RegExp(`mistakeRate:\\s*${exp.mistakeRate}`));
      assert.match(configSrc, new RegExp(`cardStrategy:\\s*["']${exp.cardStrategy}["']`));
      assert.match(configSrc, new RegExp(`tokenStrategy:\\s*["']${exp.tokenStrategy}["']`));
      assert.match(configSrc, new RegExp(`reserveStrategy:\\s*["']${exp.reserveStrategy}["']`));
      assert.match(configSrc, new RegExp(`preferDoubles:\\s*(?:${exp.preferDoubles ? 'true' : 'false'})`));
    });
  }

  // 3) HTML 셀렉트 옵션에 5단계가 모두 노출
  await check('UI: splendor.html 셀렉트에 easy/boss 옵션 노출', () => {
    const html = fs.readFileSync(path.join(__dirname, '../splendor.html'), 'utf8');
    assert.match(html, /id="splendorDifficultySelect"[\s\S]*?<\/select>/);
    const sel = html.match(/<select[^>]*id="splendorDifficultySelect"[\s\S]*?<\/select>/)[0];
    for (const v of ['easy', 'normal', 'hard', 'expert', 'boss']) {
      assert.match(sel, new RegExp(`<option value="${v}">`));
    }
  });

  // 4) HTML 셀렉트가 1-step이고 6개 옵션 (random 포함)
  await check('UI: 셀렉트 옵션 수 = 6 (5+random)', () => {
    const html = fs.readFileSync(path.join(__dirname, '../splendor.html'), 'utf8');
    const sel = html.match(/<select[^>]*id="splendorDifficultySelect"[\s\S]*?<\/select>/)[0];
    const options = sel.match(/<option [^>]*value=/g) || [];
    assert.equal(options.length, 6, `옵션 ${options.length}개 (기대 6)`);
  });

  console.log(`\nResult: ${pass}/${total} passed`);
  if (pass !== total) process.exit(1);
})();
