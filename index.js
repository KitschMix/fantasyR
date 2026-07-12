/* BOARD GAME ROOM - 판타지왕국 프리미엄 컬렉션
 * Stitch 디자인 코드 기반으로 작성된 클라이언트 UI 스크립트.
 * 외부 의존성 없음 (모든 데이터는 인라인).
 */

// ============================================
// 게임 카탈로그 (우리 보드게임 7종)
// ============================================
const GAMES = [
  {
    id: 'splendor',
    title: '스플렌더',
    subtitle: 'SPLENDOR',
    file: 'splendor.html',
    category: 'strategy',
    categoryLabel: 'STRATEGY',
    players: '2-4',
    duration: '30m',
    rating: 4.9,
    accent: 'rgba(80,40,200,0.6)',     // 보석 보라
    accent2: 'rgba(212,160,55,0.5)',     // 골드
    symbol: 'diamond',
    coverArt: 'assets/main/스플렌더.jpg',
    desc: '보석을 모아 귀족의 후원을 받으세요.'
  },
  {
    id: 'monopoly',
    title: '부루마불',
    subtitle: 'MONOPOLY',
    file: 'monopoly.html',
    category: 'strategy',
    categoryLabel: 'STRATEGY',
    players: '2-4',
    duration: '60-90m',
    rating: 4.5,
    accent: 'rgba(20,80,40,0.6)',        // 깊은 그린
    accent2: 'rgba(242,202,80,0.5)',
    symbol: 'apartment',
    coverArt: 'assets/main/부루마불.jpg',
    desc: '서울 시내를 점령하고 부의 전쟁에 승리하세요.'
  },
  {
    id: 'clue',
    title: '클루',
    subtitle: 'CLUE',
    file: 'clue.html',
    category: 'family',
    categoryLabel: 'FAMILY',
    players: '3-6',
    duration: '45m',
    rating: 4.7,
    accent: 'rgba(140,15,30,0.6)',        // 미스터리 레드
    accent2: 'rgba(0,0,0,0.4)',
    symbol: 'psychology',
    coverArt: 'assets/main/클루.jpg',
    desc: '범인을 추리라! 섹튼 가의 비밀.'
  },
  {
    id: 'tally-ho',
    title: '텔리호',
    subtitle: 'TALLY HO',
    file: 'tally-ho.html',
    category: 'strategy',
    categoryLabel: 'STRATEGY',
    players: '2-6',
    duration: '45m',
    rating: 4.4,
    accent: 'rgba(200,140,40,0.6)',       // 사바나 오렌지
    accent2: 'rgba(120,80,30,0.5)',
    symbol: 'pets',
    coverArt: 'assets/main/텔리호.jpg',
    desc: '잉글랜드 사냥개와 늑대. 야생의 전쟁.'
  },
  {
    id: 'sushi-go',
    title: '스시고',
    subtitle: 'SUSHI GO!',
    file: 'sushi-go.html',
    category: 'party',
    categoryLabel: 'PARTY',
    players: '2-5',
    duration: '20m',
    rating: 4.6,
    accent: 'rgba(220,40,80,0.6)',        // 일본식 핑크-레드
    accent2: 'rgba(255,255,255,0.3)',
    symbol: 'restaurant',
    coverArt: 'assets/main/스시고.jpg',
    desc: '일본 회전초밥, 카드를 모아 최고의 점수.'
  },
  {
    id: 'cant-stop',
    title: '캔트스탑',
    subtitle: "CAN'T STOP",
    file: 'cant-stop.html',
    category: 'party',
    categoryLabel: 'PARTY',
    players: '2-4',
    duration: '30m',
    rating: 4.3,
    accent: 'rgba(15,80,140,0.6)',        // 산 블루
    accent2: 'rgba(255,140,0,0.5)',
    symbol: 'terrain',
    coverArt: 'assets/main/캔트스탑.jpg',
    desc: '주사위 굴리기, 과감한 결정!'
  },
  {
    id: 'dominion',
    title: '도미니언',
    subtitle: 'DOMINION',
    file: 'dominion.html',
    category: 'strategy',
    categoryLabel: 'STRATEGY',
    players: '2-4',
    duration: '30m',
    rating: 4.8,
    accent: 'rgba(60,20,80,0.6)',         // 왕국 퍼플
    accent2: 'rgba(242,202,80,0.5)',
    symbol: 'castle',
    desc: '중세 왕국의 패를 모아 끊임없이 확장하는 덱빌딩.'
  }
];

// ============================================
// 세션 히스토리 (한국어)
// ============================================
// SESSIONS 하드코딩 제거됨 — Supabase fantasy_player_stats에서 fetchRecentGames()로 실시간 데이터 표시

// ============================================
// 렌더링: 게임 카드
// ============================================
function renderGameGrid(filter = 'all', query = '') {
  const grid = document.getElementById('gameGrid');
  if (!grid) return;

  const filtered = GAMES
    .filter(g => filter === 'all' || g.category === filter)
    .filter(g => !query || g.title.toLowerCase().includes(query.toLowerCase()));

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-20 text-center text-on-surface-variant/60">
        <span class="material-symbols-outlined text-6xl mb-4 block">search_off</span>
        <p class="font-headline-md">검색 결과가 없습니다</p>
        <p class="text-sm mt-2">다른 카테고리나 키워드를 시도해보세요.</p>
      </div>`;
    return;
  }

  // 게임 카드만 렌더링 ("컬렉션에 추가" 카드는 제거됨)
  // 첫 줄 4장은 LCP 이므로 fetchpriority="high", 나머지는 fetchpriority="low"
  grid.innerHTML = filtered.map((g, idx) => gameCardHtml(g, idx)).join('');
  if (typeof setupGameCardGuard === 'function') setupGameCardGuard();
}

function gameCardHtml(g, idx) {
  const isFirstRow = idx < 4;
  const fpAttrs = isFirstRow ? 'fetchpriority="high"' : 'fetchpriority="low"';
  const heroInner = g.coverArt
    ? `<img class="hub-game-cover transition-transform duration-500 group-hover:scale-110" src="${g.coverArt}" alt="${g.title} 카드 아트" loading="eager" decoding="async" ${fpAttrs} onload="this.classList.add('is-loaded')" onerror="this.classList.add('is-loaded')" />`
    : `<div class="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style="background:radial-gradient(ellipse at 30% 20%, ${g.accent}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${g.accent2}, transparent 60%), linear-gradient(135deg, #1a1a1a, #0e0e0e);"></div>
       <div class="absolute inset-0 opacity-25 mix-blend-overlay" style="background:repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 8px);"></div>
       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15">
         <span class="material-symbols-outlined text-[140px]">${g.symbol}</span>
       </div>`;

  return `
    <a href="${g.file}" data-game-file="${g.file}" class="hub-game-card group relative aspect-[3/4] bg-surface-container-low rounded-xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1${g.coverArt ? ' has-art' : ''}">
      <div class="absolute inset-0">
        ${heroInner}
        <div class="absolute inset-0 card-img-overlay"></div>
      </div>
      <div class="absolute top-2 right-2 lg:top-3 lg:right-3 bg-surface-bright/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1 text-[10px] lg:text-xs font-bold text-primary">
        <span class="material-symbols-outlined text-[12px] lg:text-[14px]">star</span>
        ${g.rating}
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-3 lg:p-5 flex flex-col justify-end">
        <span class="hidden lg:block text-primary font-label-lg text-label-lg uppercase tracking-widest mb-1">${g.categoryLabel}</span>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-1 leading-tight">${g.title}</h3>
        <div class="flex items-center gap-stack-sm text-on-surface-variant">
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">group</span>
            <span class="font-label-md text-label-md">${g.players}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            <span class="font-label-md text-label-md">${g.duration}</span>
          </div>
        </div>
        <div class="hidden lg:flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span class="text-on-surface-variant text-[10px]">${g.subtitle}</span>
          <button class="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-primary-container transition-colors">
            플레이
          </button>
        </div>
      </div>
    </a>
  `;
}

// ============================================
// 렌더링: 세션 히스토리
// ============================================
function renderSessions() {
  const list = document.getElementById('sessionList');
  if (!list) return;

  // SESSIONS 하드코딩 제거됨 — Supabase fantasy_player_stats에서 실제 최근 게임 fetch
  if (window.FANTASY_PLAYER_STATS?.fetchRecentGames) {
    window.FANTASY_PLAYER_STATS.fetchRecentGames(5).then((games) => {
      if (!games || games.length === 0) {
        list.innerHTML = `
          <div class="p-8 text-center text-on-surface-variant/60">
            <span class="material-symbols-outlined text-4xl mb-2 block">history</span>
            <p class="text-sm">아직 플레이한 게임이 없습니다.</p>
            <p class="text-xs mt-1">게임을 끝까지 플레이하면 여기에 표시됩니다.</p>
          </div>
        `;
        return;
      }
      list.innerHTML = games.map((g) => realSessionHtml(g)).join('');
    }).catch(() => {
      list.innerHTML = `<div class="p-4 text-center text-on-surface-variant/60 text-sm">세션 기록을 불러올 수 없습니다.</div>`;
    });
  } else {
    list.innerHTML = `<div class="p-4 text-center text-on-surface-variant/60 text-sm">통계 모듈을 로드 중입니다.</div>`;
  }
}

function realSessionHtml(g) {
  const gameNames = { fantasy: '판타지왕국', splendor: '스플렌더', monopoly: '부루마불', clue: '클루', 'cant-stop': '캔트스탑', 'tally-ho': '텔리호', 'sushi-go': '스시고', dominion: '도미니언' };
  const gameIcons = { fantasy: 'castle', splendor: 'diamond', monopoly: 'apartment', clue: 'psychology', 'cant-stop': 'terrain', 'tally-ho': 'pets', 'sushi-go': 'restaurant', dominion: 'shield' };
  const gameAccents = { fantasy: 'rgba(212,160,55,0.5)', splendor: 'rgba(80,40,200,0.5)', monopoly: 'rgba(20,80,40,0.5)', clue: 'rgba(140,15,30,0.5)', 'cant-stop': 'rgba(15,80,140,0.5)', 'tally-ho': 'rgba(120,80,30,0.5)', 'sushi-go': 'rgba(200,60,80,0.5)', dominion: 'rgba(40,100,80,0.5)' };
  const win = g.result === 'win';
  const played = new Date(g.played_at);
  const timeText = formatRelativeTime(played);
  return `
    <div class="flex items-center justify-between p-4 hover:bg-surface-container transition-colors">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:${gameAccents[g.game_type] || 'rgba(100,100,100,0.5)'};">
          <span class="material-symbols-outlined text-on-surface">${gameIcons[g.game_type] || 'games'}</span>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-headline-md text-headline-md text-on-surface truncate">${gameNames[g.game_type] || g.game_type}</h4>
          <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            ${timeText} · ${g.player_count}명
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <p class="text-sm text-on-surface">점수 ${g.score}</p>
        <span class="px-3 py-1 ${win ? 'bg-primary text-on-primary' : 'bg-surface-bright text-on-surface-variant'} text-[10px] font-bold rounded-full uppercase tracking-wider">
          ${win ? 'VICTORY' : 'DEFEAT'}
        </span>
      </div>
    </div>
  `;
}

function formatRelativeTime(date) {
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '방금';
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

function sessionHtml(s) {
  const statusBadge = s.isRejoin
    ? `<button class="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full uppercase tracking-wider hover:bg-secondary-container transition-colors flex items-center gap-1">
         <span class="material-symbols-outlined text-[14px]">play_arrow</span> 다시 접속
       </button>`
    : `<span class="px-3 py-1 ${s.status === 'victory' ? 'bg-primary text-on-primary' : 'bg-surface-bright text-on-surface-variant'} text-[10px] font-bold rounded-full uppercase tracking-wider">
         ${s.tier}
       </span>`;

  return `
    <div class="flex items-center justify-between p-4 hover:bg-surface-container transition-colors">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:${s.accent};">
          <span class="material-symbols-outlined text-on-surface">${s.icon}</span>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-headline-md text-on-surface truncate">${s.game}</h4>
          <p class="text-xs text-on-surface-variant truncate">
            <span class="material-symbols-outlined text-[12px] align-middle">schedule</span>
            ${s.time} · ${s.players}
          </p>
        </div>
        <div class="text-right hidden md:block">
          <p class="text-sm font-medium text-on-surface">${s.score}</p>
        </div>
      </div>
      <div class="ml-4">
        ${statusBadge}
      </div>
    </div>
  `;
}

// ============================================
// 인터랙션 (필터 / 검색)
// ============================================
function setupInteractions() {
  // 필터 칩 (모바일 + 데스크탑 모두)
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'all';
      // 모든 칩 동기화: 활성 칩은 골드, 나머지는 비활성 스타일
      document.querySelectorAll('.filter-chip').forEach(c => {
        const isActive = c.getAttribute('data-filter') === filter;
        c.setAttribute('aria-pressed', String(isActive));
        if (isActive) {
          // 활성
          c.classList.add('bg-primary', 'text-on-primary', 'active-pill');
          c.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant/30');
        } else {
          // 비활성
          c.classList.remove('bg-primary', 'text-on-primary', 'active-pill');
          c.classList.add('bg-surface-container-high', 'text-on-surface-variant');
        }
      });
      const query = document.getElementById('vaultSearch')?.value || '';
      renderGameGrid(filter, query);
    });
  });

  // 검색 (데스크탑)
  const search = document.getElementById('vaultSearch');
  if (search) {
    search.addEventListener('input', () => {
      const activeFilter = document.querySelector('.filter-chip.bg-primary')?.getAttribute('data-filter') || 'all';
      renderGameGrid(activeFilter, search.value);
    });
  }

  // FAB 클릭 피드백
  document.getElementById('fabAdd')?.addEventListener('click', () => {
    const btn = document.getElementById('fabAdd');
    btn.style.transform = 'scale(0.85)';
    setTimeout(() => btn.style.transform = '', 150);
    alert('컬렉션에 추가할 게임을 선택하세요.');
  });

  // 모바일 드로어 열릴 때 transition 보정
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) {
    // 초기 상태 보장
    drawer.classList.add('opacity-0', 'pointer-events-none');
  }
}

// ============================================
// 닉네임/프로필 (메인에서 통합 관리)
// ============================================
const NICKNAME_STORAGE_KEY = 'fantasyKingdom.humanProfile.v1';
const NICKNAME_INTERVAL_MS = 24 * 60 * 60 * 1000;
const NICKNAME_BLOCKED_NAME = '나';

function readHumanProfile() {
  try {
    const raw = window.localStorage?.getItem(NICKNAME_STORAGE_KEY);
    if (!raw) return { nickname: '', lastChangedAt: '' };
    const profile = JSON.parse(raw);
    return {
      nickname: (profile?.nickname || '').trim(),
      lastChangedAt: profile?.lastChangedAt || ''
    };
  } catch {
    return { nickname: '', lastChangedAt: '' };
  }
}

function saveHumanProfile(profile) {
  try {
    window.localStorage?.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({
      nickname: (profile?.nickname || '').trim(),
      lastChangedAt: profile?.lastChangedAt || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('saveHumanProfile 실패', err);
  }
}

function nicknameValidationMessage(nickname) {
  if (nickname.length < 2) return '닉네임은 2글자 이상이어야 합니다.';
  if (nickname.length > 12) return '닉네임은 12자 이하여야 합니다.';
  if (nickname === NICKNAME_BLOCKED_NAME) return "'나'는 닉네임으로 사용할 수 없습니다.";
  return '';
}

function nicknameRemainingMs(lastChangedAt) {
  const t = Date.parse(lastChangedAt || '');
  if (!t) return 0;
  return Math.max(0, NICKNAME_INTERVAL_MS - (Date.now() - t));
}

function nicknameRemainingLabel(ms) {
  if (ms <= 0) return '';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `다음 변경까지 약 ${hours}시간 ${minutes}분 남았습니다.`;
  return `다음 변경까지 약 ${minutes}분 남았습니다.`;
}

// 프로필 칩의 닉네임/이니셜을 화면에 반영
function refreshProfileChrome() {
  const profile = readHumanProfile();
  const nickname = profile.nickname || '';
  const isGuest = nickname.length === 0;
  const initial = isGuest ? '게' : nickname.trim().charAt(0);

  const desktopName = document.getElementById('desktopProfileName');
  const desktopAvatar = document.getElementById('desktopProfileAvatar');
  const mobileBtn = document.getElementById('mobileProfileButton');
  const drawerName = document.getElementById('drawerProfileName');
  const drawerAvatar = document.getElementById('drawerProfileAvatar');

  if (desktopName) desktopName.textContent = isGuest ? '게스트' : nickname;
  if (desktopAvatar) desktopAvatar.textContent = isGuest ? '게' : initial;
  if (mobileBtn) mobileBtn.textContent = isGuest ? '게' : initial;
  if (drawerName) drawerName.textContent = isGuest ? '게스트' : nickname;
  if (drawerAvatar) drawerAvatar.textContent = isGuest ? '게' : initial;
}

// 모달 컨트롤
let profileModalState = {
  pendingHref: null,    // 닉네임 저장 후 진입할 게임 파일
  mode: 'edit',         // 'edit' | 'firstRun'
};

function openProfileModal(mode = 'edit') {
  profileModalState.mode = mode;
  const profile = readHumanProfile();
  const modal = document.getElementById('profileModal');
  const input = document.getElementById('profileModalInput');
  const title = document.getElementById('profileModalTitle');
  const intro = document.getElementById('profileModalIntro');
  const warning = document.getElementById('profileModalRankingWarning');
  const errorEl = document.getElementById('profileModalError');
  const cooldown = document.getElementById('profileModalCooldown');

  if (!modal || !input) return;

  input.value = profile.nickname || '';
  errorEl.textContent = '';

  const remaining = nicknameRemainingMs(profile.lastChangedAt);
  if (remaining > 0 && profile.nickname) {
    cooldown.textContent = nicknameRemainingLabel(remaining);
    cooldown.classList.remove('hidden');
  } else {
    cooldown.textContent = '';
    cooldown.classList.add('hidden');
  }

  const confirmCheckbox = document.getElementById('profileModalRankingConfirm');

  if (mode === 'firstRun') {
    title.textContent = '닉네임 설정';
    intro.textContent = '게임을 시작하려면 먼저 사용할 닉네임을 정해주세요.';
    warning.classList.add('hidden');
    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
      confirmCheckbox.classList.add('hidden');
    }
  } else {
    title.textContent = '닉네임 변경';
    intro.textContent = '변경 시 랭킹과 플레이 기록이 초기화됩니다.';
    warning.classList.remove('hidden');
    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
      confirmCheckbox.classList.remove('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    input.focus();
    input.select();
  }, 60);
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.setAttribute('aria-hidden', 'true');
  profileModalState.pendingHref = null;
}

function handleProfileSave() {
  const input = document.getElementById('profileModalInput');
  const errorEl = document.getElementById('profileModalError');
  if (!input || !errorEl) return;

  const nickname = input.value.trim();
  const validation = nicknameValidationMessage(nickname);
  if (validation) {
    errorEl.textContent = validation;
    input.focus();
    return;
  }

  const profile = readHumanProfile();
  // 동일 이름이면 저장하지 않고 닫기 (쿨다운 검사 불필요)
  if (profile.nickname === nickname) {
    errorEl.textContent = '';
    refreshProfileChrome();
    const pendingHref = profileModalState.pendingHref;
    closeProfileModal();
    if (pendingHref) window.location.href = pendingHref;
    return;
  }

  // 변경 쿨다운 체크
  const remaining = nicknameRemainingMs(profile.lastChangedAt);
  if (remaining > 0 && profile.nickname) {
    errorEl.textContent = '아직 닉네임을 변경할 수 없습니다. ' + nicknameRemainingLabel(remaining);
    return;
  }

  // 랭킹 초기화 경고(체크박스) — 있을 때만 강제
  const confirmCheckbox = document.getElementById('profileModalRankingConfirm');
  if (confirmCheckbox && !confirmCheckbox.classList.contains('hidden') && !confirmCheckbox.checked) {
    errorEl.textContent = '랭킹 초기화 안내에 동의해야 변경할 수 있습니다.';
    return;
  }

  saveHumanProfile({ nickname });
  errorEl.textContent = '';
  refreshProfileChrome();

  const pendingHref = profileModalState.pendingHref;
  closeProfileModal();
  if (pendingHref) window.location.href = pendingHref;
}

function setupProfileModal() {
  document.getElementById('profileModalCloseButton')?.addEventListener('click', () => {
    profileModalState.pendingHref = null;
    closeProfileModal();
  });
  document.getElementById('profileModalCancelButton')?.addEventListener('click', () => {
    profileModalState.pendingHref = null;
    closeProfileModal();
  });
  document.getElementById('profileModalSaveButton')?.addEventListener('click', handleProfileSave);
  document.getElementById('profileModalInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProfileSave();
    }
  });

  // 백드롭 클릭으로 닫기
  const modal = document.getElementById('profileModal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      profileModalState.pendingHref = null;
      closeProfileModal();
    }
  });

  // 진입 트리거들
  document.getElementById('desktopProfileButton')?.addEventListener('click', () => openProfileModal('edit'));
  document.getElementById('mobileProfileButton')?.addEventListener('click', () => openProfileModal('edit'));
  document.getElementById('mobileNavProfileButton')?.addEventListener('click', () => openProfileModal('edit'));
  document.getElementById('drawerProfileEditButton')?.addEventListener('click', () => openProfileModal('edit'));

  refreshProfileChrome();
}

function setupGameCardGuard() {
  document.querySelectorAll('.hub-game-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const profile = readHumanProfile();
      if (!profile.nickname) {
        e.preventDefault();
        const href = card.getAttribute('data-game-file') || card.getAttribute('href') || '';
        profileModalState.pendingHref = href;
        openProfileModal('firstRun');
      }
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  renderGameGrid();
  renderSessions();
  setupInteractions();
  setupProfileModal();
  setupGameCardGuard();
  // 플레이어 통계 위젯 렌더링 (Supabase 기반)
  const statsWidget = document.getElementById('statsWidget');
  if (statsWidget && window.FANTASY_PLAYER_STATS?.renderHubWidget) {
    window.FANTASY_PLAYER_STATS.renderHubWidget(statsWidget);
  }
});
