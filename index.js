/* BOARDVAULT - 판타지왕국 프리미엄 컬렉션
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
const SESSIONS = [
  {
    game: '스플렌더', icon: 'diamond', status: 'victory',
    tier: 'VICTORY', time: '오늘 14:32', score: '점수 24', players: '나 vs 3 AI',
    accent: 'rgba(80,40,200,0.5)'
  },
  {
    game: '부루마불', icon: 'apartment', status: 'ongoing',
    tier: 'ONGOING SESSION', time: '3시간 전', score: '8라운드', players: '나 vs 3 AI',
    accent: 'rgba(20,80,40,0.5)', isRejoin: true
  },
  {
    game: '캔트스탑', icon: 'terrain', status: 'victory',
    tier: 'VICTORY', time: '어제 21:14', score: '3 컬럼 완성', players: '나 vs 1 AI',
    accent: 'rgba(15,80,140,0.5)'
  },
  {
    game: '클루', icon: 'psychology', status: 'victory',
    tier: 'VICTORY', time: '2일 전', score: '정답! 3턴 만에', players: '나 vs 5 AI',
    accent: 'rgba(140,15,30,0.5)'
  },
  {
    game: '텔리호', icon: 'pets', status: 'defeat',
    tier: 'DEFEAT', time: '3일 전', score: '점수 38', players: '나 vs 5 AI',
    accent: 'rgba(120,80,30,0.5)'
  }
];

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
  grid.innerHTML = filtered.map(g => gameCardHtml(g)).join('');
}

function gameCardHtml(g) {
  return `
    <a href="${g.file}" class="hub-game-card group relative aspect-[3/4] bg-surface-container-low rounded-xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1">
      <div class="absolute inset-0">
        <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style="background:radial-gradient(ellipse at 30% 20%, ${g.accent}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${g.accent2}, transparent 60%), linear-gradient(135deg, #1a1a1a, #0e0e0e);"></div>
        <div class="absolute inset-0 opacity-25 mix-blend-overlay" style="background:repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 8px);"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15">
          <span class="material-symbols-outlined text-[140px]">${g.symbol}</span>
        </div>
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

  list.innerHTML = SESSIONS.map(s => sessionHtml(s)).join('');
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
        if (c === chip) {
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
// 부트
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderGameGrid();
  renderSessions();
  setupInteractions();
});
