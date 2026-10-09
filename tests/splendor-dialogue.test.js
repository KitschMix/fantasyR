const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { suite, test } = require('./runner');
let pass = 0, total = 0;
const check = (name, fn) => { total++; test(name, () => { fn(); pass++; }); };

function load(count = 4) {
  let now = 100000, timerId = 0;
  const timers = new Map();
  class Element {
    constructor() {
      this.children = []; this.dataset = {}; this.className = ''; this.parent = null;
      this.style = { setProperty() {} };
      this.classList = { add() {}, remove() {}, contains() { return false; } };
    }
    get isConnected() { return this === body || Boolean(this.parent?.isConnected); }
    set innerHTML(value) { this.html = value; this.children.forEach(c => { c.parent = null; }); this.children = []; }
    get innerHTML() { return this.html || ''; }
    appendChild(child) { child.parent = this; this.children.push(child); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; }
    matches(selector) {
      if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
      const m = selector.match(/^\[data-player-index="(\d+)"\]$/);
      return Boolean(m && String(this.dataset.playerIndex) === m[1]);
    }
    querySelectorAll(selector) { return this.children.flatMap(c => (c.matches(selector) ? [c] : []).concat(c.querySelectorAll(selector))); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    addEventListener() {} setAttribute() {}
  }
  const body = new Element(), list = new Element(); body.appendChild(list);
  const sandbox = {
    console,
    document: {
      body, documentElement: { clientWidth: 1280, clientHeight: 800 },
      querySelector(selector) {
        if (selector === '#splendorPlayersList') return list;
        if (selector === '#splendorPlayerCountSelect') return { value: count };
        return body.querySelector(selector);
      },
      querySelectorAll: s => body.querySelectorAll(s), createElement: () => new Element(), addEventListener() {}
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    Image: class { set src(v) { this.onload?.(); } },
    Date: class extends Date { static now() { return now; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    setTimeout(fn, delay = 0) { const id = ++timerId; timers.set(id, { at: now + delay, fn }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { return ++timerId; }, clearInterval() {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of ['shared-profiles.js', 'splendor-dialogues.js', 'splendor.js']) {
    let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    if (file === 'splendor.js') source = source.replace('  window.SplendorGame = {',
      '  window.audit = { state, DIALOGUE, renderPlayers, showThinking, hideThinking, runAiTurn, aiChooseAction, attemptBuyReserved, attemptReserve, resetToSetup, declareWinners };\n  window.SplendorGame = {');
    vm.runInContext(source, sandbox, { filename: file });
  }
  sandbox.SplendorGame.start();
  const game = {
    ...sandbox.audit, window: sandbox, body, list,
    bubbles: () => body.querySelectorAll('.splendor-dialogue-bubble'),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        timers.delete(next[0]); now = next[1].at; next[1].fn();
      }
      now = end;
    }
  };
  game.DIALOGUE.reset();
  game.state.players.slice(1).forEach((p, i) => { p.name = ['건일', '메이', '미미'][i]; });
  game.renderPlayers();
  return game;
}
const card = (points = 0, cost = {}) => ({ bonus: 'ruby', cost, points });
const textIn = (g, event) => Object.values(g.window.SPLENDOR_DIALOGUES).some(b => b.dialogues[event]?.includes(g.bubbles()[0]?.textContent));

suite('splendor: 대사 표시와 행동 연결', () => {
  check('2인 게임에서도 같은 AI가 세 번 이상 계속 말함', () => {
    const g = load(2);
    for (let i = 0; i < 5; i++) {
      g.DIALOGUE.speak(1, 'aiBuy');
      assert.equal(g.bubbles().length, 1);
      g.advance(3000);
    }
    assert.equal(g.DIALOGUE._usedLines['rough:aiBuy'].length, 5);
  });
  check('생각중 표시를 지워도 실제 대사는 유지', () => {
    const g = load(); g.showThinking(2);
    g.DIALOGUE.speak(1, 'aiGem'); g.hideThinking();
    assert.equal(g.bubbles().length, 1);
    assert.equal(g.body.querySelectorAll('.splendor-thinking-bubble').length, 0);
  });
  check('여러 캐릭터의 동시 대사가 재렌더 뒤에도 유지되고 제시간에 사라짐', () => {
    const g = load(); g.DIALOGUE.speakAll('gameStart'); g.advance(500);
    assert.equal(g.bubbles().length, 3);
    g.advance(1000); g.renderPlayers(); assert.equal(g.bubbles().length, 3);
    g.advance(1000); g.renderPlayers(); assert.equal(g.bubbles().length, 3);
    g.advance(750); assert.equal(g.bubbles().length, 0);
  });
  check('시작 인사 중 발생한 행동 대사는 인사가 끝난 뒤 표시', () => {
    const g = load(2); g.DIALOGUE.speakAll('gameStart');
    g.DIALOGUE.speak(1, 'aiBuy'); g.advance(500);
    assert.ok(textIn(g, 'gameStart'));
    g.advance(3000); assert.ok(textIn(g, 'aiBuy'));
  });
  check('모든 실제 캐릭터와 사용 이벤트에 대사가 연결됨; 문서 제목 제외', () => {
    const g = load();
    for (const p of Object.values(g.window.FANTASY_SHARED_PROFILES.groups).flat()) {
      const tone = g.DIALOGUE._getTone(p.name); assert.ok(tone, p.name);
      for (const event of ['gameStart','idle','aiGem','userGem','aiBuy','userBuy','aiReserve','userReserve','aiWin','aiLoss']) {
        assert.ok(g.window.SPLENDOR_DIALOGUES[tone].dialogues[event].length, `${p.name}/${event}`);
      }
    }
    for (const book of Object.values(g.window.SPLENDOR_DIALOGUES)) {
      assert.ok(!Object.values(book.dialogues).flat().some(t => t === 'AI가 졌을 때 대사'));
    }
  });
  check('AI 실제 보석 행동 뒤에도 대사 유지', () => {
    const g = load(2); g.state.currentPlayer = 1;
    g.state.visibleCards = {1:[],2:[],3:[]}; g.runAiTurn();
    assert.ok(textIn(g, 'aiGem')); g.advance(800); assert.ok(textIn(g, 'aiGem'));
  });
  check('AI 예약 카드 구매에도 구매 대사 표시', () => {
    const g = load(2); g.state.currentPlayer = 1;
    g.state.visibleCards = {1:[],2:[],3:[]}; g.state.players[1].reserved.push(card());
    g.runAiTurn(); assert.equal(g.state.players[1].reserved.length, 0); assert.ok(textIn(g, 'aiBuy'));
  });
  check('사람 예약 카드 구매에도 반응 대사 표시', () => {
    const g = load(2); g.state.players[0].reserved.push(card());
    g.attemptBuyReserved(0); assert.ok(textIn(g, 'userBuy'));
  });
  check('사람과 AI의 카드 예약 대사 연결', () => {
    const g = load(2); g.attemptReserve(1,0); assert.ok(textIn(g,'userReserve'));
    g.DIALOGUE.reset(); g.state.currentPlayer = 1; g.state.players[1].difficulty = 'expert';
    g.state.visibleCards = {1:[],2:[],3:[card(5,{diamond:99})]};
    g.aiChooseAction(g.state.players[1]); assert.ok(textIn(g,'aiReserve'));
  });
  check('패배·승리 대사는 이전 대기열에 밀리지 않고 모두 표시', () => {
    const g = load();
    g.DIALOGUE.speak(1,'aiBuy'); g.DIALOGUE.speak(2,'aiGem');
    g.state.players[0].points = 15; g.declareWinners(); g.advance(500);
    assert.equal(g.bubbles().length, 3);
    assert.ok(g.bubbles().every(b=>Object.values(g.window.SPLENDOR_DIALOGUES).some(book=>book.dialogues.aiLoss.includes(b.textContent))));
  });
  check('설정 복귀·새 게임에서 이전 대기열과 지연 대사 취소', () => {
    const g = load(); g.DIALOGUE.speak(1,'aiBuy'); g.DIALOGUE.speak(2,'aiGem'); g.DIALOGUE.speakAll('gameStart');
    g.resetToSetup(); g.advance(7000); assert.equal(g.bubbles().length,0);
    assert.equal(g.DIALOGUE._queue.length,0); assert.equal(g.DIALOGUE._busy,false);
    g.window.SplendorGame.start(); g.advance(500); assert.equal(g.bubbles().length,3);
  });
});
console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
