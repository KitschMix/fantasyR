const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

function loadSplendor(count, recordGame) {
  let now = 100000, nextTimer = 1;
  const timers = new Map();
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
    document: {
      body: element(), documentElement: { clientWidth: 1280, clientHeight: 800 },
      querySelector(selector) {
        if (selector === '#splendorPlayerCountSelect') return { value: String(count) };
        return null;
      },
      querySelectorAll() { return []; }, addEventListener() {}, createElement: element
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    Image: class { set src(value) { this.onload?.(); } },
    Date: class extends Date { static now() { return now; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    setTimeout(callback, delay) { const id = nextTimer++; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { return nextTimer++; }, clearInterval() {}
  };
  sandbox.window = sandbox;
  if (recordGame) sandbox.FANTASY_PLAYER_STATS = { recordGame };
  vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(__dirname, '../splendor.js'), 'utf8');
  vm.runInContext(source.replace('  window.SplendorGame = {',
    '  window.splendorTest = { state, endTurn, runAiTurn };\n  window.SplendorGame = {'), sandbox, { filename: 'splendor.js' });
  sandbox.SplendorGame.start();
  return {
    ...sandbox.splendorTest,
    results: () => children.filter((el) => el.className === 'splendor-result-overlay'),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const entry = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!entry) break;
        timers.delete(entry[0]);
        now = entry[1].at;
        entry[1].callback();
      }
      now = end;
    }
  };
}

function lastAiTurn(game) {
  game.state.currentPlayer = game.state.players.length - 1;
  game.state.turnCount = 60;
  game.state.visibleCards = { 1: [], 2: [], 3: [] };
  game.state.phase = 'action';
}

let pass = 0, total = 0;
async function check(name, fn) {
  total++;
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (error) { console.log(`  ✗ ${name}: ${error.stack}`); }
}

(async () => {
  for (const count of [3, 4]) {
    await check(`${count}명: 일반 라운드 마지막 AI 행동 후 사람 차례 복귀`, () => {
      const game = loadSplendor(count, () => { throw new Error('must not record before game ends'); });
      lastAiTurn(game);
      game.runAiTurn();
      game.advance(800);
      assert.equal(game.state.currentPlayer, 0);
      assert.equal(game.state.phase, 'action');
      assert.equal(game.results().length, 0);
    });

    await check(`${count}명: 마지막 AI가 15점에 도달해도 결과 화면까지 완료`, () => {
      const records = [];
      const game = loadSplendor(count, (entry) => { records.push(entry); return Promise.resolve({ ok: true }); });
      lastAiTurn(game);
      const last = game.state.players[count - 1];
      last.points = 14;
      last.difficulty = 'expert';
      game.state.players[0].points = 7;
      game.state.visibleCards[1] = [{ cost: {}, bonus: 'ruby', points: 1 }];
      game.runAiTurn();
      game.advance(800);
      assert.equal(last.points, 15);
      assert.equal(game.state.phase, 'finished');
      game.advance(2000);
      assert.equal(game.results().length, 1);
      assert.equal(records.length, 1);
      assert.equal(records[0].result, 'loss');
      assert.equal(records[0].score, 7);
      assert.equal(records[0].playerCount, count);
      assert.ok(Number.isFinite(records[0].durationSec));
    });
  }

  for (const mode of ['missing', 'throws', 'rejects', 'pending']) {
    await check(`통계 저장 ${mode}: 저장 상태와 무관하게 종료 화면 표시`, async () => {
      const record = mode === 'missing' ? null : mode === 'throws'
        ? () => { throw new Error('stats unavailable'); }
        : mode === 'rejects' ? () => Promise.reject(new Error('network unavailable'))
          : () => new Promise(() => {});
      const game = loadSplendor(4, record);
      lastAiTurn(game);
      game.state.players[0].points = 15;
      game.state.lastRoundTriggered = true;
      game.endTurn();
      game.advance(2000);
      await Promise.resolve();
      assert.equal(game.state.phase, 'finished');
      assert.equal(game.results().length, 1);
      assert.ok(game.results()[0].innerHTML.includes('승리!'));
    });
  }
  console.log(`\nResult: ${pass}/${total} passed`);
  process.exit(pass === total ? 0 : 1);
})();
