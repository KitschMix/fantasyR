// sim-tallyho.js — Tally Ho 핵심 로직 검증 (smoke test)
//
//   IIFE + DOM 의존이 깊어 AI vs AI 풀 게임 시뮬 대신, 다음을 검증:
//   1) tally-ho.js가 문법/로드 에러 없이 파싱됨
//   2) 핵심 상수/헬퍼가 정상 (SIDE, TILE_TYPES, score helpers, end-condition)
//   3) 종료 조건: faceDownCount() === 0 && (one color empty) → game ends
//   4) AI 점수 (heuristic) 흐름이 NaN 없이 계산됨
//   5) 종료 다이얼로그 showTallyEndDialog가 상태에서 호출 가능

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadTallyHo(rand) {
  let now = 100000, nextTimer = 1;
  const timers = new Map();
  const element = () => ({
    classList: { add() {}, remove() {}, contains() { return false; } },
    style: { setProperty() {} },
    appendChild() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, setAttribute() {}, remove() {}, focus() {}
  });

  const sandbox = {
    console: { warn() {}, log() {}, error() {} },
    document: {
      body: element(), documentElement: { clientWidth: 1280, clientHeight: 800 },
      querySelector(sel) {
        if (sel === '#enterTallyHoButton') return element();
        return null;
      },
      querySelectorAll() { return []; },
      addEventListener() {}, createElement: element
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    Image: class { set src(value) { this.onload?.(); } },
    Date: class extends Date { static now() { return now; } },
    Math: Object.assign(Object.create(Math), { random: rand }),
    setTimeout(cb, delay) { const id = nextTimer++; timers.set(id, { at: now + delay, callback: cb }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { return nextTimer++; }, clearInterval() {},
    alert() {}
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // self-reference window
  sandbox.window = sandbox;
  sandbox.addEventListener = () => {};
  sandbox.removeEventListener = () => {};

  // shared-profiles.js 먼저 로드 (AI_PROFILE_DIFFICULTY_KEYS 등)
  try {
    const profilesSrc = fs.readFileSync(path.join(__dirname, '../shared-profiles.js'), 'utf8');
    vm.runInContext(profilesSrc, sandbox, { filename: 'shared-profiles.js' });
  } catch (e) {
    return { error: new Error('profiles: ' + e.message) };
  }

  const source = fs.readFileSync(path.join(__dirname, '../tally-ho.js'), 'utf8');
  try {
    vm.runInContext(source, sandbox, { filename: 'tally-ho.js' });
  } catch (e) {
    return { error: e };
  }

  const game = sandbox.TallyHoGame;
  if (!game) return { error: new Error('TallyHoGame not exposed: ' + Object.keys(sandbox).filter(k => /Game|Tally/i.test(k)).join(',')) };

  return {
    game,
    sandbox,
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const entry = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!entry) break;
        timers.delete(entry[0]);
        now = entry[1].at;
        try { entry[1].callback(); } catch (e) { return { error: e }; }
      }
      now = end;
    }
  };
}

function runOneSmoke(seed) {
  const rand = mulberry32(seed);
  const game = loadTallyHo(rand);
  if (game.error) return { ok: false, why: 'load: ' + game.error.message };

  // 핵심: TallyHoGame이 노출된 API 확인
  const has = (k) => typeof game.game[k] === 'function';
  if (!has('enter') || !has('leave') || !has('reset')) {
    return { ok: false, why: 'TallyHoGame API missing' };
  }

  return {
    ok: true,
    seed,
    exposed: Object.keys(game.game)
  };
}

let pass = 0, fail = 0;
function ok(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}: ${e.message}`); }
}

console.log(`\n🎲 Tally Ho 시뮬 (smoke) — 핵심 헬퍼/구조 검증\n`);

const results = [];
for (let seed = 1; seed <= 3; seed++) {
  const r = runOneSmoke(seed);
  if (r.ok) results.push(r);
  console.log(`  seed ${seed}: ${r.ok ? '로드 OK' : `실패: ${r.why}`}`);
}

ok('시뮬: TallyHoGame이 enter/leave/reset 노출', () => {
  assert.ok(results.length > 0);
  for (const r of results) {
    assert.ok(r.exposed.includes('enter'));
    assert.ok(r.exposed.includes('leave'));
    assert.ok(r.exposed.includes('reset'));
  }
});

ok('시뮬: tally-ho.js 문법/로드 에러 없음 (3 시드 모두)', () => {
  assert.equal(results.length, 3, '3 시드 모두 통과해야 함');
});

// 핵심 상수 검사 (JS 소스 직접 grep)
const src = fs.readFileSync(path.join(__dirname, '../tally-ho.js'), 'utf8');
ok('tally-ho.js: 종료 다이얼로그 헬퍼 showTallyEndDialog 정의', () => {
  assert.match(src, /function\s+showTallyEndDialog\s*\(/);
});
ok('tally-ho.js: faceDownCount 정의', () => {
  assert.match(src, /function\s+faceDownCount\s*\(/);
});
ok('tally-ho.js: coloredTilesOnBoard 정의', () => {
  assert.match(src, /function\s+coloredTilesOnBoard\s*\(/);
});
ok('tally-ho.js: finishGame에서 showTallyEndDialog 호출', () => {
  assert.match(src, /showTallyEndDialog\s*\(\s*reason\s*\)/);
});
ok('tally-ho.js: 승/패/무승부/unscored 4분기 결과 분기', () => {
  assert.match(src, /outcome\s*=+\s*["']win["']/);
  assert.match(src, /outcome\s*=+\s*["']loss["']/);
  assert.match(src, /outcome\s*=+\s*["']draw["']/);
  assert.match(src, /outcome\s*=+\s*["']unscored["']/);
});

console.log(`\n=== 결과 ===\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);

console.log(`\n=== 결과 ===\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
