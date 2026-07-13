/* design-test.js — 시작화면 디자인 테스트 도구
 *
 * 8개 게임 셸을 한 페이지에서 비교하고, 5토큰을 슬라이더로 실시간 조정한다.
 * 시안 프리셋(기본/컴팩트/와이드/다크/둥근/네모)을 제공한다.
 *
 * 외부 의존 없음. setup-shell.js는 호출하지 않는다(자체 scale/zoom 구현).
 */

(() => {
  'use strict';

  // === 1) 게임 메타 =============================================
  const GAMES = [
    { id: 'clue',      label: '클루',       accent: '#d4a853', logo: 'assets/titles/title-clue.jpg',
      desc: 'AI와 추리전을 펼쳐보세요.' },
    { id: 'monopoly',  label: '모노폴리',   accent: '#2d9a67', logo: 'assets/titles/title-monopoly.svg',
      desc: '부루마불과 함께하는 경제 전략 게임.' },
    { id: 'sushi-go',  label: '스시고',     accent: '#e36d6d', logo: 'assets/titles/title-sushi-go.png',
      desc: '카드 드래프트로 최고 점수를 노려라.' },
    { id: 'splendor',  label: '스플렌더',   accent: '#caa45a', logo: 'assets/titles/title-splendor.png',
      desc: '보석 토큰으로 발전 칩을 사서 명성을 쌓으세요.' },
    { id: 'dominion',  label: '도미니언',   accent: '#9b6bd9', logo: 'assets/titles/title-dominion.webp',
      desc: '카드 획득으로 덱을 강화하는 엔진 빌딩.' },
    { id: 'cant-stop', label: '칸트스탑',   accent: '#3f8fd1', logo: 'assets/titles/title-cant-stop.png',
      desc: '주사위 4개를 굴려 칸을 등반하는 운과 판단의 게임.' },
    { id: 'tally-ho',  label: '탈리호',     accent: '#a05c2c', logo: 'assets/titles/title-tally-ho.png',
      desc: '영역 점령과 자원 채굴의 경량 전략.' },
    { id: 'fantasy',   label: '판타지 킹덤', accent: '#8a2f5e', logo: 'assets/titles/title-base.png',
      desc: '카드 조합으로 왕국을 건설하는 8게임 통합 로비.' },
  ];

  // === 2) 시안 프리셋 ==========================================
  const PRESETS = {
    default: { '--setup-max-width': 1120, '--setup-gap': 24, '--setup-panel-radius': 20,
               '--setup-logo-height': 72, '--setup-panel-min-height': 430, '--setup-accent': '#d4a853',
               dark: false, _note: 'handoff 5토큰 그대로' },
    compact: { '--setup-max-width': 960, '--setup-gap': 14, '--setup-panel-radius': 14,
               '--setup-logo-height': 56, '--setup-panel-min-height': 340, '--setup-accent': '#d4a853',
               dark: false, _note: '좁은 화면 / 모바일 친화' },
    wide:    { '--setup-max-width': 1280, '--setup-gap': 32, '--setup-panel-radius': 24,
               '--setup-logo-height': 96, '--setup-panel-min-height': 500, '--setup-accent': '#d4a853',
               dark: false, _note: '데스크톱 풀HD 활용' },
    dark:    { '--setup-max-width': 1120, '--setup-gap': 24, '--setup-panel-radius': 20,
               '--setup-logo-height': 72, '--setup-panel-min-height': 430, '--setup-accent': '#d4a853',
               dark: true,  _note: '스테이지 배경 반전' },
    rounded: { '--setup-max-width': 1120, '--setup-gap': 28, '--setup-panel-radius': 36,
               '--setup-logo-height': 72, '--setup-panel-min-height': 430, '--setup-accent': '#d4a853',
               dark: false, _note: 'radius↑ 부드러운 인상' },
    square:  { '--setup-max-width': 1120, '--setup-gap': 16, '--setup-panel-radius': 0,
               '--setup-logo-height': 72, '--setup-panel-min-height': 430, '--setup-accent': '#d4a853',
               dark: false, _note: '각진 미니멀 룩' },
  };

  // === 3) 상태 ==================================================
  const state = {
    mode: 'grid',
    gameFilter: 'all',
    tokens: { ...PRESETS.default },
    preset: 'default',
    zoom: 100,
  };

  // === 4) 더미 데이터 ==========================================
  const MOCK_NICKS = ['탐정G', '요리사H', '해적J', '마법사K', '닌자L', '기사M', '농부N', '별님O', '달님P', '구름Q'];
  const MOCK_SCORES = [9840, 8120, 7560, 6240, 5810, 4720, 3990, 2840, 1950, 880];

  function mockRankingHTML() {
    return MOCK_NICKS.map((nick, i) =>
      `<li class="leaderboard-row"><span class="rank">${i + 1}</span><strong>${nick}</strong><span class="score">${MOCK_SCORES[i].toLocaleString()}</span></li>`
    ).join('');
  }

  // === 5) 셸 마크업 생성 =======================================
  function shellMarkup(game) {
    return `
<section class="preview-frame" data-game="${game.id}">
  <span class="preview-label">${game.label}</span>
  <div class="game-setup-shell ${game.id}-setup-shell" style="--setup-accent: ${game.accent}">
    <header class="game-setup-header">
      <div class="game-setup-brand">
        <img class="${game.id}-setup-logo game-setup-logo" src="${game.logo}" alt="${game.label}" onerror="this.outerHTML='<strong style=&quot;font-size:24px;color:#fff6d8&quot;>${game.label}</strong>'" />
      </div>
      <div class="game-setup-actions">
        <button class="icon-button" type="button" title="도움말">?</button>
        <div class="setup-scale-control" aria-label="${game.label} 시작 화면 배율">
          <button class="icon-button" type="button">−</button>
          <span class="setup-scale-value">100%</span>
          <button class="icon-button" type="button">+</button>
        </div>
        <button class="secondary-button" type="button">첫 화면</button>
      </div>
    </header>

    <div class="game-setup-grid">
      <div class="mode-panel single-panel ${game.id}-panel game-setup-mode">
        <div class="mode-panel-head">
          <strong>싱글플레이</strong>
          <span>${game.desc}</span>
        </div>
        <div class="${game.id}-setup-controls setup-controls">
          <label>플레이어 수
            <select>
              <option>2명</option><option selected>3명</option><option>4명</option>
            </select>
          </label>
          <label>AI 난이도
            <select>
              <option>보통</option><option selected>어려움</option><option>매우 어려움</option><option>완전랜덤</option>
            </select>
          </label>
          <label>덱/맵
            <select disabled><option>기본</option></select>
          </label>
          <button class="primary-button" type="button">게임 시작</button>
        </div>
      </div>

      <div class="mode-panel online-panel ${game.id}-panel game-setup-mode">
        <div class="mode-panel-head online-panel-head">
          <strong>멀티플레이</strong>
          <span class="online-status">준비 중</span>
        </div>
        <div class="setup-coming-actions">
          <div class="setup-profile-source">
            <span>플레이어</span><strong>첫 화면 프로필 사용</strong>
          </div>
          <button class="secondary-button" type="button" disabled>방 만들기</button>
          <label>방 코드
            <input type="text" maxlength="6" placeholder="6자리 코드" disabled />
          </label>
          <button class="secondary-button" type="button" disabled>입장</button>
          <div class="setup-online-note">
            <strong>온라인 대전 준비 중</strong>
            <small>방에 입장하면 참가자와 준비 상태를 확인한 뒤 게임을 시작합니다.</small>
          </div>
        </div>
      </div>

      <div class="mode-panel leaderboard-panel ${game.id}-leaderboard-panel game-ranking-panel">
        <div class="mode-panel-head">
          <strong>${game.label} 랭킹</strong>
          <button class="secondary-button leaderboard-refresh-button" type="button">새로고침</button>
        </div>
        <div class="leaderboard-board ${game.id}-leaderboard-board">
          <section class="leaderboard-column">
            <h3>누적 점수 TOP 10</h3>
            <ol class="leaderboard-list" data-live-ranking data-game-type="${game.id}">
              ${mockRankingHTML()}
            </ol>
          </section>
        </div>
        <div class="leaderboard-status">랭킹은 디자인 테스트용 mock 데이터입니다.</div>
      </div>
    </div>
  </div>
</section>`;
  }

  // === 6) 렌더링 ===============================================
  function render() {
    const stage = document.getElementById('stage');
    const games = state.gameFilter === 'all' ? GAMES : GAMES.filter(g => g.id === state.gameFilter);

    if (state.mode === 'single') {
      const g = games[0] || GAMES[0];
      stage.innerHTML = shellMarkup(g);
    } else if (state.mode === 'ab') {
      const a = games[0] || GAMES[0];
      const b = games[1] || games[0] || GAMES[1];
      stage.innerHTML = shellMarkup(a) + shellMarkup(b);
    } else {
      // grid + vertical: 모두 출력
      stage.innerHTML = games.map(shellMarkup).join('');
    }

    stage.dataset.mode = state.mode;
    stage.dataset.dark = state.tokens._dark ? 'true' : 'false';
    applyTokensToShells();
    applyZoom();

    // 게임 필터 셀렉트 옵션 채우기
    const sel = document.getElementById('gameFilterSelect');
    if (sel.options.length === 1) {
      GAMES.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.label;
        sel.appendChild(opt);
      });
    }

    updateStatePreview();
  }

  function applyTokensToShells() {
    const stage = document.getElementById('stage');
    stage.style.setProperty('--stage-zoom', String(state.zoom / 100));

    // accent가 "기본(#d4a853)"이고 프리셋도 default면 셸의 게임별 색상 유지
    const preservePerGameAccent =
      state.tokens['--setup-accent'] === PRESETS.default['--setup-accent'] &&
      state.preset === 'default';

    const shells = stage.querySelectorAll('.game-setup-shell');
    shells.forEach(shell => {
      shell.style.setProperty('--setup-max-width',       `${state.tokens['--setup-max-width']}px`);
      shell.style.setProperty('--setup-gap',             `${state.tokens['--setup-gap']}px`);
      shell.style.setProperty('--setup-panel-radius',    `${state.tokens['--setup-panel-radius']}px`);
      shell.style.setProperty('--setup-logo-height',     `${state.tokens['--setup-logo-height']}px`);
      shell.style.setProperty('--setup-panel-min-height', `${state.tokens['--setup-panel-min-height']}px`);
      if (preservePerGameAccent) {
        // 인라인 제거하여 게임별 원본 색상 복원
        shell.style.removeProperty('--setup-accent');
      } else {
        shell.style.setProperty('--setup-accent', state.tokens['--setup-accent']);
      }
    });

    stage.dataset.dark = state.tokens._dark ? 'true' : 'false';

    // 슬라이더 표시값 갱신
    document.querySelectorAll('[data-token]').forEach(input => {
      const name = input.dataset.token;
      const display = document.querySelector(`[data-token-display="${name}"]`);
      if (!display) return;
      const val = state.tokens[name];
      if (name === '--setup-accent') {
        display.textContent = val;
      } else {
        display.textContent = `${val}px`;
      }
    });
  }

  function applyZoom() {
    const stage = document.getElementById('stage');
    stage.style.setProperty('--stage-zoom', String(state.zoom / 100));
    document.getElementById('stageZoomValue').textContent = `${state.zoom}%`;
    document.getElementById('stageZoomRange').value = String(state.zoom);
  }

  function updateStatePreview() {
    const el = document.getElementById('statePreview');
    if (!el) return;
    el.textContent = JSON.stringify({
      mode: state.mode,
      gameFilter: state.gameFilter,
      preset: state.preset,
      zoom: state.zoom,
      tokens: state.tokens,
    }, null, 2);
  }

  // === 7) 컨트롤 바인딩 ========================================
  function bind() {
    // 모드 탭
    document.querySelectorAll('.test-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.test-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.mode = tab.dataset.mode;
        render();
      });
    });

    // 프리셋
    document.querySelectorAll('.test-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.preset;
        const preset = PRESETS[name];
        if (!preset) return;
        document.querySelectorAll('.test-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.assign(state.tokens, preset);
        state.tokens._dark = preset.dark;
        state.preset = name;
        // 슬라이더 값 동기화
        document.querySelectorAll('[data-token]').forEach(input => {
          const name2 = input.dataset.token;
          if (state.tokens[name2] !== undefined) {
            input.value = String(state.tokens[name2]);
          }
        });
        // 프리셋 변경 시 셸을 다시 렌더해서 게임별 원본 색상도 복원
        // (accent 슬라이더로 일괄 덮어쓴 상태에서 프리셋 복귀할 때 깨끗하게 시작)
        render();
      });
    });

    // 토큰 슬라이더/컬러
    document.querySelectorAll('[data-token]').forEach(input => {
      input.addEventListener('input', () => {
        const name = input.dataset.token;
        state.tokens[name] = input.value;
        // 프리셋 활성 표시 해제
        document.querySelectorAll('.test-preset').forEach(b => b.classList.remove('active'));
        state.preset = 'custom';
        applyTokensToShells();
        updateStatePreview();
      });
    });

    // 게임 필터
    document.getElementById('gameFilterSelect').addEventListener('change', e => {
      state.gameFilter = e.target.value;
      render();
    });

    // 줌
    document.getElementById('stageZoomRange').addEventListener('input', e => {
      state.zoom = Number(e.target.value);
      applyZoom();
    });
    document.getElementById('stageZoomReset').addEventListener('click', () => {
      state.zoom = 100;
      applyZoom();
    });

    // 캡처
    document.getElementById('captureButton').addEventListener('click', () => {
      document.getElementById('captureDialog').showModal();
    });
    document.getElementById('captureCloseButton').addEventListener('click', () => {
      document.getElementById('captureDialog').close();
    });
    document.getElementById('captureAllButton').addEventListener('click', () => {
      document.getElementById('captureDialog').close();
      window.print();
    });
    document.getElementById('captureStageButton').addEventListener('click', () => {
      // 헤더/사이드바 잠시 숨김
      const hdr = document.querySelector('.test-header');
      const ctl = document.querySelector('.test-controls');
      const restore = [hdr.style.display, ctl.style.display];
      hdr.style.display = 'none';
      ctl.style.display = 'none';
      document.getElementById('captureDialog').close();
      window.print();
      setTimeout(() => { hdr.style.display = restore[0]; ctl.style.display = restore[1]; }, 200);
    });

    // 리로드
    document.getElementById('reloadButton').addEventListener('click', () => {
      location.reload();
    });

    // URL 복사
    document.getElementById('copyUrlButton').addEventListener('click', async () => {
      const params = new URLSearchParams();
      params.set('mode', state.mode);
      params.set('game', state.gameFilter);
      params.set('zoom', String(state.zoom));
      Object.entries(state.tokens).forEach(([k, v]) => {
        if (k.startsWith('--setup-')) params.set(k.replace('--setup-', ''), String(v));
      });
      const url = `${location.origin}${location.pathname}?${params.toString()}`;
      try {
        await navigator.clipboard.writeText(url);
        flash('URL 복사 완료 — 새 탭에 붙여넣어 동일 상태 복원');
      } catch {
        prompt('URL을 복사하세요', url);
      }
    });
  }

  function flash(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: '#2a2620', color: '#fff6d8', padding: '10px 14px',
      borderRadius: '8px', border: '1px solid #d4a853', fontSize: '13px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  // === 8) URL → 상태 복원 ======================================
  function restoreFromUrl() {
    const p = new URLSearchParams(location.search);
    if (p.has('mode')) state.mode = p.get('mode');
    if (p.has('game')) state.gameFilter = p.get('game');
    if (p.has('zoom')) state.zoom = Number(p.get('zoom'));
    ['max-width', 'gap', 'panel-radius', 'logo-height', 'panel-min-height', 'accent'].forEach(k => {
      const full = `--setup-${k}`;
      if (p.has(k)) state.tokens[full] = isNaN(Number(p.get(k))) ? p.get(k) : Number(p.get(k));
    });
    // UI 동기화
    document.querySelectorAll('.test-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === state.mode));
    document.getElementById('gameFilterSelect').value = state.gameFilter;
    document.querySelectorAll('[data-token]').forEach(input => {
      const v = state.tokens[input.dataset.token];
      if (v !== undefined) input.value = String(v);
    });
  }

  // === 9) 부트 =================================================
  document.addEventListener('DOMContentLoaded', () => {
    restoreFromUrl();
    bind();
    render();
  });
})();