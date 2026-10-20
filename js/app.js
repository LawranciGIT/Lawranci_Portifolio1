/**
 * Synthwave Portfolio Main Application Controller
 * Handles UI rendering, search/filtering, ADM mode, modals, and retro animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    isAdmin: sessionStorage.getItem('synthwave_adm_active') === 'true',
    gamesFilter: 'all', // 'all' | 'official' | 'fangame'
    gamesSearch: '',
    booksFilter: 'all', // 'all' | 'original' | 'fanbook'
    booksSearch: '',
    crtActive: localStorage.getItem('synthwave_crt') !== 'false', // default ON for authentic 90s retro feel!
    modalActive: null
  };

  // Initialize CRT effect
  if (state.crtActive) {
    document.body.classList.add('crt-active');
  } else {
    document.body.classList.remove('crt-active');
  }

  // DOM Elements
  const crtToggleBtn = document.getElementById('crt-toggle-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const bgmToggleBtn = document.getElementById('bgm-toggle-btn');
  const admLoginBtn = document.getElementById('adm-login-btn');
  const admStatusRibbon = document.getElementById('adm-status-ribbon');
  const admLogoutBtn = document.getElementById('adm-logout-btn');

  // Profile Elements
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileNickname = document.getElementById('profile-nickname');
  const profileAge = document.getElementById('profile-age');
  const profileNationality = document.getElementById('profile-nationality');
  const profileRole = document.getElementById('profile-role');
  const profileBio = document.getElementById('profile-bio');
  const profileHp = document.getElementById('profile-hp');
  const profileMp = document.getElementById('profile-mp');
  const profileScore = document.getElementById('profile-score');
  const profileEditBtn = document.getElementById('profile-edit-btn');

  // Games Elements
  const gamesGrid = document.getElementById('games-grid');
  const gamesSearchInput = document.getElementById('games-search-input');
  const gamesSearchClear = document.getElementById('games-search-clear');
  const gamesCountBadge = document.getElementById('games-count-badge');
  const gamesFilterTabs = document.querySelectorAll('.game-filter-tab');
  const addGameBtn = document.getElementById('add-game-btn');

  // Books Elements
  const booksGrid = document.getElementById('books-grid');
  const booksSearchInput = document.getElementById('books-search-input');
  const booksSearchClear = document.getElementById('books-search-clear');
  const booksCountBadge = document.getElementById('books-count-badge');
  const booksFilterTabs = document.querySelectorAll('.book-filter-tab');
  const addBookBtn = document.getElementById('add-book-btn');

  // Modals
  const admModal = document.getElementById('adm-modal');
  const itemModal = document.getElementById('item-modal');
  const profileModal = document.getElementById('profile-modal');
  const detailsModal = document.getElementById('details-modal');
  const backupModal = document.getElementById('backup-modal');
  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // TOAST NOTIFICATION SYSTEM
  // ==========================================
  function showToast(title, message, type = 'pink') {
    const toast = document.createElement('div');
    const borderColor = type === 'cyan' ? 'border-[#00f3ff]' : type === 'green' ? 'border-[#4dff88]' : 'border-[#ff007f]';
    const textColor = type === 'cyan' ? 'text-[#00f3ff]' : type === 'green' ? 'text-[#4dff88]' : 'text-[#ff007f]';
    const shadowColor = type === 'cyan' ? 'rgba(0, 243, 255, 0.4)' : type === 'green' ? 'rgba(77, 255, 136, 0.4)' : 'rgba(255, 0, 127, 0.4)';

    toast.className = `p-4 mb-3 bg-[#0f041e]/95 border-2 ${borderColor} shadow-lg text-white font-tech rounded-none transform transition-all duration-300 translate-x-full opacity-0 flex items-start gap-3`;
    toast.style.boxShadow = `0 0 15px ${shadowColor}`;
    toast.style.clipPath = 'polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';

    toast.innerHTML = `
      <div class="text-xl ${textColor}">⚡</div>
      <div class="flex-1">
        <h4 class="font-arcade text-xs ${textColor} mb-1 tracking-wider uppercase">${title}</h4>
        <p class="text-sm text-gray-200">${message}</p>
      </div>
      <button class="text-gray-400 hover:text-white font-arcade text-xs ml-2 cursor-pointer">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ==========================================
  // RENDER PROFILE
  // ==========================================
  function renderProfile() {
    const profile = window.dataStore.getProfile();
    if (!profile) return;

    if (profileAvatar) profileAvatar.src = profile.avatar || 'assets/avatar.jpg';
    if (profileName) profileName.textContent = profile.name;
    if (profileNickname) profileNickname.textContent = `@${profile.nickname}`;
    if (profileAge) profileAge.textContent = `${profile.age} YRS`;
    if (profileNationality) profileNationality.textContent = profile.nationality;
    if (profileRole) profileRole.textContent = profile.role;
    if (profileBio) profileBio.textContent = profile.bio;
    if (profileHp) profileHp.textContent = profile.hp || '100 / 100';
    if (profileMp) profileMp.textContent = profile.mp || '96 / 100';
    if (profileScore) profileScore.textContent = profile.score || '994,200';

    if (profileEditBtn) {
      if (state.isAdmin) {
        profileEditBtn.classList.remove('hidden');
      } else {
        profileEditBtn.classList.add('hidden');
      }
    }
  }

  // ==========================================
  // RENDER GAMES SECTION
  // ==========================================
  function renderGames() {
    const allGames = window.dataStore.getGames();
    const query = state.gamesSearch.trim().toLowerCase();

    const filteredGames = allGames.filter(game => {
      // Category tab match
      const categoryMatch = state.gamesFilter === 'all' || game.category === state.gamesFilter;
      if (!categoryMatch) return false;

      // Search match
      if (!query) return true;
      const titleMatch = game.title.toLowerCase().includes(query);
      const descMatch = (game.description || '').toLowerCase().includes(query);
      const tagMatch = (game.tags || []).some(t => t.toLowerCase().includes(query));
      const platformMatch = (game.platform || '').toLowerCase().includes(query);
      const yearMatch = (game.year || '').toLowerCase().includes(query);

      return titleMatch || descMatch || tagMatch || platformMatch || yearMatch;
    });

    if (gamesCountBadge) {
      gamesCountBadge.textContent = `${filteredGames.length} ${filteredGames.length === 1 ? 'GAME' : 'GAMES'}`;
    }

    if (!gamesGrid) return;

    if (filteredGames.length === 0) {
      gamesGrid.innerHTML = `
        <div class="col-span-full py-16 text-center border-2 border-dashed border-[#ff007f]/40 bg-[#120526]/60 p-8 rounded-lg">
          <div class="font-arcade text-[#ff007f] text-2xl mb-4 animate-pulse">! NO CARTRIDGE DETECTED !</div>
          <p class="font-tech text-gray-300 text-lg mb-6">No games found matching "${state.gamesSearch}" in this category.</p>
          <button id="reset-games-search" class="cyber-btn cyber-btn-cyan text-xs">
            RESET SEARCH FILTERS
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-games-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.retroAudio.playClick();
          state.gamesSearch = '';
          state.gamesFilter = 'all';
          if (gamesSearchInput) gamesSearchInput.value = '';
          updateGameFilterTabs();
          renderGames();
        });
      }
      return;
    }

    gamesGrid.innerHTML = filteredGames.map(game => {
      const isOfficial = game.category === 'official';
      const badgeColor = isOfficial ? 'bg-[#ff007f]/20 border-[#ff007f] text-[#ff007f]' : 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff]';
      const categoryTag = isOfficial ? 'OFFICIAL RELEASE' : 'FANGAME TRIBUTE';

      const tagsHtml = (game.tags || []).map(t => 
        `<span class="text-[10px] uppercase font-tech px-2 py-0.5 bg-[#1b0a33] text-cyan-300 border border-cyan-800/60 rounded">${t}</span>`
      ).join(' ');

      const admControls = state.isAdmin ? `
        <div class="absolute top-3 right-3 z-20 flex gap-1.5 bg-[#090214]/90 p-1.5 border border-[#ff007f] shadow-lg rounded">
          <button data-action="edit-game" data-id="${game.id}" class="px-2 py-1 bg-[#ff007f] text-white font-arcade text-[9px] hover:bg-white hover:text-black transition" title="Edit Game">
            EDIT
          </button>
          <button data-action="delete-game" data-id="${game.id}" class="px-2 py-1 bg-red-800 text-white font-arcade text-[9px] hover:bg-red-600 transition" title="Delete Game">
            DEL
          </button>
        </div>
      ` : '';

      return `
        <div class="cyber-card group flex flex-col justify-between overflow-hidden relative" data-game-id="${game.id}">
          ${admControls}
          
          <!-- Top Cartridge Header -->
          <div class="retro-cartridge-header flex items-center justify-between px-3">
            <span class="text-[8px] font-arcade text-gray-400">16-BIT CARTRIDGE</span>
            <span class="text-[8px] font-arcade text-pink-400">${game.year || '199X'}</span>
          </div>

          <!-- Cover Image Container -->
          <div class="relative w-full aspect-[4/3] overflow-hidden bg-[#070112] border-b border-[#b026ff]/30">
            <img 
              src="${game.cover || 'assets/game_racer.jpg'}" 
              alt="${game.title}"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onerror="this.src='assets/game_racer.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0d031f] via-transparent to-transparent opacity-80"></div>
            
            <!-- Category Badge -->
            <div class="absolute bottom-2 left-3">
              <span class="cyber-badge border ${badgeColor}">
                ${categoryTag}
              </span>
            </div>

            <!-- Platform / Rating -->
            <div class="absolute bottom-2 right-3 flex items-center gap-1 bg-[#090214]/90 px-2 py-0.5 rounded border border-purple-500/40 text-[10px] text-yellow-300 font-arcade">
              ★ ${game.rating || '5.0'}
            </div>
          </div>

          <!-- Content Details -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-tech text-cyan-400 tracking-wider uppercase font-semibold">${game.platform || 'PC / Arcade'}</span>
                <span class="text-xs font-tech text-gray-400">${game.badge || 'PROD #094'}</span>
              </div>

              <h3 class="font-cyber font-bold text-lg text-white group-hover:text-[#ff007f] transition-colors leading-tight mb-2.5">
                ${game.title}
              </h3>

              <p class="font-tech text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                ${game.description}
              </p>
            </div>

            <div>
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                ${tagsHtml}
              </div>

              <!-- Buttons -->
              <div class="flex items-center gap-2 pt-2 border-t border-purple-900/40">
                <button 
                  data-action="view-game-details" 
                  data-id="${game.id}"
                  class="flex-1 py-2 px-3 bg-gradient-to-r from-[#ff007f]/30 to-[#b026ff]/30 hover:from-[#ff007f] hover:to-[#b026ff] border border-[#ff007f] text-white font-arcade text-[10px] text-center tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,0,127,0.5)]"
                >
                  PLAY DEMO / INFO
                </button>
                ${game.playUrl ? `
                  <a 
                    href="${game.playUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="py-2 px-3 bg-[#00f3ff]/20 hover:bg-[#00f3ff] hover:text-black border border-[#00f3ff] text-[#00f3ff] font-arcade text-[10px] text-center tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                    title="External Store / Play Link"
                  >
                    LINK ↗
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to cards
    attachGameCardListeners();
  }

  function attachGameCardListeners() {
    gamesGrid.querySelectorAll('[data-action="view-game-details"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.retroAudio.playClick();
        const id = e.currentTarget.getAttribute('data-id');
        openGameDetails(id);
      });
    });

    if (state.isAdmin) {
      gamesGrid.querySelectorAll('[data-action="edit-game"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.retroAudio.playClick();
          const id = e.currentTarget.getAttribute('data-id');
          openItemEditor('game', id);
        });
      });

      gamesGrid.querySelectorAll('[data-action="delete-game"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.retroAudio.playError();
          const id = e.currentTarget.getAttribute('data-id');
          if (confirm('ADM WARNING: Are you sure you want to delete this game cartridge from the database?')) {
            window.dataStore.deleteGame(id);
            showToast('CARTRIDGE EJECTED', 'Game successfully removed from database.', 'pink');
            window.retroAudio.playCoin();
            renderGames();
          }
        });
      });
    }
  }

  // ==========================================
  // RENDER BOOKS SECTION
  // ==========================================
  function renderBooks() {
    const allBooks = window.dataStore.getBooks();
    const query = state.booksSearch.trim().toLowerCase();

    const filteredBooks = allBooks.filter(book => {
      // Category tab match
      const categoryMatch = state.booksFilter === 'all' || book.category === state.booksFilter;
      if (!categoryMatch) return false;

      // Search match
      if (!query) return true;
      const titleMatch = book.title.toLowerCase().includes(query);
      const summaryMatch = (book.summary || '').toLowerCase().includes(query);
      const authorMatch = (book.author || '').toLowerCase().includes(query);
      const tagMatch = (book.tags || []).some(t => t.toLowerCase().includes(query));
      const yearMatch = (book.year || '').toLowerCase().includes(query);

      return titleMatch || summaryMatch || authorMatch || tagMatch || yearMatch;
    });

    if (booksCountBadge) {
      booksCountBadge.textContent = `${filteredBooks.length} ${filteredBooks.length === 1 ? 'BOOK' : 'BOOKS'}`;
    }

    if (!booksGrid) return;

    if (filteredBooks.length === 0) {
      booksGrid.innerHTML = `
        <div class="col-span-full py-16 text-center border-2 border-dashed border-[#00f3ff]/40 bg-[#071329]/60 p-8 rounded-lg">
          <div class="font-arcade text-[#00f3ff] text-2xl mb-4 animate-pulse">! ARCHIVE EMPTY !</div>
          <p class="font-tech text-gray-300 text-lg mb-6">No books found matching "${state.booksSearch}" in this category.</p>
          <button id="reset-books-search" class="cyber-btn cyber-btn-cyan text-xs">
            RESET SEARCH FILTERS
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-books-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.retroAudio.playClick();
          state.booksSearch = '';
          state.booksFilter = 'all';
          if (booksSearchInput) booksSearchInput.value = '';
          updateBookFilterTabs();
          renderBooks();
        });
      }
      return;
    }

    booksGrid.innerHTML = filteredBooks.map(book => {
      const isOriginal = book.category === 'original';
      const badgeColor = isOriginal ? 'bg-[#ff007f]/20 border-[#ff007f] text-[#ff007f]' : 'bg-[#ffe600]/20 border-[#ffe600] text-[#ffe600]';
      const categoryTag = isOriginal ? 'ORIGINAL NOVEL' : 'FANBOOK SAGA';

      const tagsHtml = (book.tags || []).map(t => 
        `<span class="text-[10px] uppercase font-tech px-2 py-0.5 bg-[#10072b] text-purple-300 border border-purple-800/60 rounded">${t}</span>`
      ).join(' ');

      const admControls = state.isAdmin ? `
        <div class="absolute top-3 right-3 z-20 flex gap-1.5 bg-[#090214]/90 p-1.5 border border-[#00f3ff] shadow-lg rounded">
          <button data-action="edit-book" data-id="${book.id}" class="px-2 py-1 bg-[#00f3ff] text-black font-arcade text-[9px] hover:bg-white transition" title="Edit Book">
            EDIT
          </button>
          <button data-action="delete-book" data-id="${book.id}" class="px-2 py-1 bg-red-800 text-white font-arcade text-[9px] hover:bg-red-600 transition" title="Delete Book">
            DEL
          </button>
        </div>
      ` : '';

      return `
        <div class="cyber-card group flex flex-col justify-between overflow-hidden relative" data-book-id="${book.id}">
          ${admControls}
          
          <!-- Top Cyber Library Ribbon -->
          <div class="flex items-center justify-between px-3 py-1 bg-[#13072b] border-b border-[#00f3ff]/30">
            <span class="text-[8px] font-arcade text-cyan-400">ARCHIVE CODE: #${(book.id || '').toUpperCase()}</span>
            <span class="text-[8px] font-arcade text-yellow-400">${book.year || '199X'}</span>
          </div>

          <!-- Holographic Book Cover with Spine Illusion -->
          <div class="book-spine-effect relative w-full aspect-[3/4] overflow-hidden bg-[#0a031a] border-b border-[#00f3ff]/20">
            <img 
              src="${book.cover || 'assets/book_metropolis.jpg'}" 
              alt="${book.title}"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onerror="this.src='assets/book_metropolis.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0a031a] via-transparent to-transparent opacity-75"></div>
            
            <!-- Category Badge -->
            <div class="absolute bottom-2 left-3">
              <span class="cyber-badge border ${badgeColor}">
                ${categoryTag}
              </span>
            </div>

            <!-- Pages / Author -->
            <div class="absolute bottom-2 right-3 bg-[#090214]/90 px-2 py-0.5 rounded border border-cyan-500/40 text-[10px] text-cyan-300 font-tech">
              ${book.pages || '350 Pages'}
            </div>
          </div>

          <!-- Content Details -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-tech text-pink-400 tracking-wider uppercase font-semibold">BY ${book.author || 'Aria Sterling'}</span>
                <span class="text-xs font-tech text-gray-400">${book.badge || 'EDITION 1.0'}</span>
              </div>

              <h3 class="font-cyber font-bold text-lg text-white group-hover:text-[#00f3ff] transition-colors leading-tight mb-2.5">
                ${book.title}
              </h3>

              <p class="font-tech text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                ${book.summary}
              </p>
            </div>

            <div>
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                ${tagsHtml}
              </div>

              <!-- Buttons -->
              <div class="flex items-center gap-2 pt-2 border-t border-purple-900/40">
                <button 
                  data-action="view-book-details" 
                  data-id="${book.id}"
                  class="flex-1 py-2 px-3 bg-gradient-to-r from-[#00f3ff]/25 to-[#b026ff]/25 hover:from-[#00f3ff] hover:to-[#b026ff] hover:text-black border border-[#00f3ff] text-white font-arcade text-[10px] text-center tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                >
                  READ SYNOPSIS
                </button>
                ${book.readUrl ? `
                  <a 
                    href="${book.readUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="py-2 px-3 bg-[#ff007f]/20 hover:bg-[#ff007f] hover:text-white border border-[#ff007f] text-[#ff007f] font-arcade text-[10px] text-center tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,0,127,0.5)]"
                    title="External Store / Read Link"
                  >
                    READ ↗
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to cards
    attachBookCardListeners();
  }

  function attachBookCardListeners() {
    booksGrid.querySelectorAll('[data-action="view-book-details"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.retroAudio.playClick();
        const id = e.currentTarget.getAttribute('data-id');
        openBookDetails(id);
      });
    });

    if (state.isAdmin) {
      booksGrid.querySelectorAll('[data-action="edit-book"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.retroAudio.playClick();
          const id = e.currentTarget.getAttribute('data-id');
          openItemEditor('book', id);
        });
      });

      booksGrid.querySelectorAll('[data-action="delete-book"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.retroAudio.playError();
          const id = e.currentTarget.getAttribute('data-id');
          if (confirm('ADM WARNING: Are you sure you want to delete this book record from the cyber archives?')) {
            window.dataStore.deleteBook(id);
            showToast('RECORD PURGED', 'Book successfully removed from archives.', 'cyan');
            window.retroAudio.playCoin();
            renderBooks();
          }
        });
      });
    }
  }

  // ==========================================
  // FILTER TABS & SEARCH LISTENERS
  // ==========================================
  function updateGameFilterTabs() {
    gamesFilterTabs.forEach(tab => {
      const filter = tab.getAttribute('data-filter');
      if (filter === state.gamesFilter) {
        tab.classList.add('bg-[#ff007f]', 'text-white', 'shadow-[0_0_15px_rgba(255,0,127,0.7)]');
        tab.classList.remove('bg-transparent', 'text-gray-400');
      } else {
        tab.classList.remove('bg-[#ff007f]', 'text-white', 'shadow-[0_0_15px_rgba(255,0,127,0.7)]');
        tab.classList.add('bg-transparent', 'text-gray-400');
      }
    });
  }

  gamesFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      window.retroAudio.playHover();
      state.gamesFilter = tab.getAttribute('data-filter');
      updateGameFilterTabs();
      renderGames();
    });
  });

  if (gamesSearchInput) {
    gamesSearchInput.addEventListener('input', (e) => {
      state.gamesSearch = e.target.value;
      if (gamesSearchClear) {
        if (state.gamesSearch) {
          gamesSearchClear.classList.remove('hidden');
        } else {
          gamesSearchClear.classList.add('hidden');
        }
      }
      renderGames();
    });
  }

  if (gamesSearchClear) {
    gamesSearchClear.addEventListener('click', () => {
      window.retroAudio.playClick();
      state.gamesSearch = '';
      if (gamesSearchInput) gamesSearchInput.value = '';
      gamesSearchClear.classList.add('hidden');
      renderGames();
    });
  }

  function updateBookFilterTabs() {
    booksFilterTabs.forEach(tab => {
      const filter = tab.getAttribute('data-filter');
      if (filter === state.booksFilter) {
        tab.classList.add('bg-[#00f3ff]', 'text-black', 'font-bold', 'shadow-[0_0_15px_rgba(0,243,255,0.7)]');
        tab.classList.remove('bg-transparent', 'text-gray-400');
      } else {
        tab.classList.remove('bg-[#00f3ff]', 'text-black', 'font-bold', 'shadow-[0_0_15px_rgba(0,243,255,0.7)]');
        tab.classList.add('bg-transparent', 'text-gray-400');
      }
    });
  }

  booksFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      window.retroAudio.playHover();
      state.booksFilter = tab.getAttribute('data-filter');
      updateBookFilterTabs();
      renderBooks();
    });
  });

  if (booksSearchInput) {
    booksSearchInput.addEventListener('input', (e) => {
      state.booksSearch = e.target.value;
      if (booksSearchClear) {
        if (state.booksSearch) {
          booksSearchClear.classList.remove('hidden');
        } else {
          booksSearchClear.classList.add('hidden');
        }
      }
      renderBooks();
    });
  }

  if (booksSearchClear) {
    booksSearchClear.addEventListener('click', () => {
      window.retroAudio.playClick();
      state.booksSearch = '';
      if (booksSearchInput) booksSearchInput.value = '';
      booksSearchClear.classList.add('hidden');
      renderBooks();
    });
  }

  // ==========================================
  // ADM MODE & AUTHENTICATION
  // ==========================================
  function updateAdmUI() {
    if (state.isAdmin) {
      if (admStatusRibbon) admStatusRibbon.classList.remove('hidden');
      if (admLoginBtn) {
        admLoginBtn.innerHTML = '⚡ ADM [ACTIVE]';
        admLoginBtn.classList.add('border-[#4dff88]', 'text-[#4dff88]');
      }
      if (addGameBtn) addGameBtn.classList.remove('hidden');
      if (addBookBtn) addBookBtn.classList.remove('hidden');
      if (profileEditBtn) profileEditBtn.classList.remove('hidden');
    } else {
      if (admStatusRibbon) admStatusRibbon.classList.add('hidden');
      if (admLoginBtn) {
        admLoginBtn.innerHTML = '🔒 ADM LOGIN';
        admLoginBtn.classList.remove('border-[#4dff88]', 'text-[#4dff88]');
      }
      if (addGameBtn) addGameBtn.classList.add('hidden');
      if (addBookBtn) addBookBtn.classList.add('hidden');
      if (profileEditBtn) profileEditBtn.classList.add('hidden');
    }
  }

  if (admLoginBtn) {
    admLoginBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      if (state.isAdmin) {
        // Already logged in, prompt to log out or open ADM tools
        if (confirm('ADM Mode is currently active. Would you like to log out?')) {
          logoutAdm();
        }
      } else {
        openAdmModal();
      }
    });
  }

  if (admLogoutBtn) {
    admLogoutBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      logoutAdm();
    });
  }

  function logoutAdm() {
    state.isAdmin = false;
    sessionStorage.removeItem('synthwave_adm_active');
    updateAdmUI();
    renderProfile();
    renderGames();
    renderBooks();
    showToast('ADM TERMINATED', 'Logged out. Visitor mode restored.', 'pink');
  }

  function openAdmModal() {
    if (!admModal) return;
    const pinInput = document.getElementById('adm-pin-input');
    const pinError = document.getElementById('adm-pin-error');
    if (pinInput) pinInput.value = '';
    if (pinError) pinError.classList.add('hidden');
    admModal.classList.remove('hidden');
    setTimeout(() => {
      if (pinInput) pinInput.focus();
    }, 100);
  }

  // Keypad & PIN submission
  const admPinForm = document.getElementById('adm-pin-form');
  if (admPinForm) {
    admPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pinInput = document.getElementById('adm-pin-input');
      const pinError = document.getElementById('adm-pin-error');
      const val = pinInput.value.trim().toLowerCase();

      // Master code accepts "1984" or "admin" or "synth"
      if (val === '1984' || val === 'admin' || val === 'synth') {
        state.isAdmin = true;
        sessionStorage.setItem('synthwave_adm_active', 'true');
        admModal.classList.add('hidden');
        window.retroAudio.playSuccess();
        window.retroAudio.playCoin();
        updateAdmUI();
        renderProfile();
        renderGames();
        renderBooks();
        showToast('SYSTEM OVERRIDE GRANTED', 'Welcome back, Master Administrator (ADM).', 'green');
      } else {
        window.retroAudio.playError();
        if (pinError) {
          pinError.textContent = 'ACCESS DENIED: INVALID PASSCODE';
          pinError.classList.remove('hidden');
        }
        pinInput.classList.add('border-red-500', 'animate-shake');
        setTimeout(() => pinInput.classList.remove('animate-shake'), 400);
      }
    });
  }

  // Keypad button clicks
  document.querySelectorAll('.keypad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.retroAudio.playHover();
      const key = btn.getAttribute('data-key');
      const pinInput = document.getElementById('adm-pin-input');
      if (!pinInput) return;

      if (key === 'clear') {
        pinInput.value = '';
      } else if (key === 'backspace') {
        pinInput.value = pinInput.value.slice(0, -1);
      } else {
        pinInput.value += key;
      }
    });
  });

  // Close modals on click outside or close button
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      window.retroAudio.playClick();
      const modal = e.currentTarget.closest('.cyber-modal');
      if (modal) modal.classList.add('hidden');
    });
  });

  // ==========================================
  // UNIVERSAL ITEM EDITOR (ADD / EDIT GAME OR BOOK)
  // ==========================================
  let currentEditingItemType = 'game'; // 'game' | 'book'
  let currentEditingItemId = null;

  if (addGameBtn) {
    addGameBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      openItemEditor('game', null);
    });
  }

  if (addBookBtn) {
    addBookBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      openItemEditor('book', null);
    });
  }

  function openItemEditor(type, id) {
    currentEditingItemType = type;
    currentEditingItemId = id;

    const modalTitle = document.getElementById('item-modal-title');
    const form = document.getElementById('item-editor-form');
    const typeLabel = type === 'game' ? 'GAME CARTRIDGE' : 'CYBER BOOK';

    if (modalTitle) {
      modalTitle.textContent = id ? `EDIT ${typeLabel} #${id}` : `ADD NEW ${typeLabel}`;
    }

    // Category options switch based on type
    const categorySelect = document.getElementById('item-category');
    if (type === 'game') {
      categorySelect.innerHTML = `
        <option value="official">Official Game (Commercial / Studio)</option>
        <option value="fangame">Fangame (Fan Tribute / Indie ROM)</option>
      `;
      document.getElementById('item-platform-row').style.display = 'block';
      document.getElementById('item-platform-label').textContent = 'Platform / Engine:';
      document.getElementById('item-platform').placeholder = 'e.g. PC / Steam / Sega Genesis';
      document.getElementById('item-link-label').textContent = 'Play / Store Link:';
    } else {
      categorySelect.innerHTML = `
        <option value="original">Original Book</option>
        <option value="fanbook">Fanbook (Fan Artbook / Tribute Fiction)</option>
      `;
      document.getElementById('item-platform-row').style.display = 'block';
      document.getElementById('item-platform-label').textContent = 'Pages / Chapters:';
      document.getElementById('item-platform').placeholder = 'e.g. 420 Pages (Hardcover)';
      document.getElementById('item-link-label').textContent = 'Read / Store Link:';
    }

    // Populate data if editing
    let itemData = null;
    if (id) {
      itemData = type === 'game' ? window.dataStore.getGameById(id) : window.dataStore.getBookById(id);
    }

    document.getElementById('item-id').value = id || '';
    document.getElementById('item-title').value = itemData ? itemData.title : '';
    document.getElementById('item-category').value = itemData ? itemData.category : (type === 'game' ? 'official' : 'original');
    document.getElementById('item-year').value = itemData ? itemData.year : '199X';
    document.getElementById('item-platform').value = itemData ? (itemData.platform || itemData.pages || '') : '';
    document.getElementById('item-tags').value = itemData && itemData.tags ? itemData.tags.join(', ') : '';
    document.getElementById('item-cover-url').value = itemData ? itemData.cover : '';
    document.getElementById('item-link').value = itemData ? (itemData.playUrl || itemData.readUrl || '') : '';
    document.getElementById('item-description').value = itemData ? (itemData.description || itemData.summary || '') : '';

    // Live preview
    updateItemEditorPreview();

    if (itemModal) itemModal.classList.remove('hidden');
  }

  // Cover image file upload handler (converts file to Base64)
  const itemCoverFile = document.getElementById('item-cover-file');
  if (itemCoverFile) {
    itemCoverFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('item-cover-url').value = event.target.result;
          updateItemEditorPreview();
          showToast('IMAGE LOADED', 'Cover image converted to local memory.', 'cyan');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Live preview update
  function updateItemEditorPreview() {
    const coverUrl = document.getElementById('item-cover-url').value.trim();
    const previewImg = document.getElementById('item-preview-img');
    const previewTitle = document.getElementById('item-preview-title');
    const titleVal = document.getElementById('item-title').value.trim() || 'UNTITLED ITEM';

    if (previewTitle) previewTitle.textContent = titleVal;
    if (previewImg) {
      previewImg.src = coverUrl || (currentEditingItemType === 'game' ? 'assets/game_racer.jpg' : 'assets/book_metropolis.jpg');
    }
  }

  const itemCoverUrlInput = document.getElementById('item-cover-url');
  if (itemCoverUrlInput) {
    itemCoverUrlInput.addEventListener('input', updateItemEditorPreview);
  }
  const itemTitleInput = document.getElementById('item-title');
  if (itemTitleInput) {
    itemTitleInput.addEventListener('input', updateItemEditorPreview);
  }

  // Handle Item Editor Form Submit
  const itemEditorForm = document.getElementById('item-editor-form');
  if (itemEditorForm) {
    itemEditorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('item-id').value;
      const title = document.getElementById('item-title').value.trim();
      const category = document.getElementById('item-category').value;
      const year = document.getElementById('item-year').value.trim();
      const platformOrPages = document.getElementById('item-platform').value.trim();
      const tagsString = document.getElementById('item-tags').value.trim();
      const cover = document.getElementById('item-cover-url').value.trim() || (currentEditingItemType === 'game' ? 'assets/game_racer.jpg' : 'assets/book_metropolis.jpg');
      const link = document.getElementById('item-link').value.trim();
      const desc = document.getElementById('item-description').value.trim();

      const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : ['Synthwave'];

      if (currentEditingItemType === 'game') {
        const gamePayload = {
          id: id || undefined,
          title,
          category,
          categoryLabel: category === 'official' ? 'Official Game' : 'Fangame',
          year,
          platform: platformOrPages || 'PC / Arcade',
          tags,
          cover,
          rating: '5.0',
          description: desc,
          playUrl: link,
          badge: category === 'official' ? 'OFFICIAL RELEASE' : 'FANGAME TRIBUTE'
        };
        window.dataStore.saveGame(gamePayload);
        renderGames();
        showToast('GAME SAVED', `"${title}" has been saved to the games vault!`, 'pink');
      } else {
        const bookPayload = {
          id: id || undefined,
          title,
          category,
          categoryLabel: category === 'original' ? 'Original Book' : 'Fanbook',
          author: "Alex 'CyberViper' Sterling",
          year,
          pages: platformOrPages || '350 Pages',
          tags,
          cover,
          summary: desc,
          readUrl: link,
          badge: category === 'original' ? 'ORIGINAL NOVEL' : 'FANBOOK SAGA'
        };
        window.dataStore.saveBook(bookPayload);
        renderBooks();
        showToast('BOOK SAVED', `"${title}" has been recorded in the cyber library!`, 'cyan');
      }

      window.retroAudio.playSuccess();
      if (itemModal) itemModal.classList.add('hidden');
    });
  }

  // ==========================================
  // PROFILE EDITOR MODAL
  // ==========================================
  if (profileEditBtn) {
    profileEditBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      openProfileModal();
    });
  }

  const ribbonEditProfileBtn = document.getElementById('ribbon-edit-profile-btn');
  if (ribbonEditProfileBtn) {
    ribbonEditProfileBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      openProfileModal();
    });
  }

  function openProfileModal() {
    const profile = window.dataStore.getProfile();
    document.getElementById('edit-profile-name').value = profile.name || '';
    document.getElementById('edit-profile-nickname').value = profile.nickname || '';
    document.getElementById('edit-profile-age').value = profile.age || '';
    document.getElementById('edit-profile-nationality').value = profile.nationality || '';
    document.getElementById('edit-profile-role').value = profile.role || '';
    document.getElementById('edit-profile-bio').value = profile.bio || '';
    document.getElementById('edit-profile-avatar-url').value = profile.avatar || '';
    document.getElementById('edit-profile-preview-avatar').src = profile.avatar || 'assets/avatar.jpg';

    if (profileModal) profileModal.classList.remove('hidden');
  }

  const profileAvatarFile = document.getElementById('edit-profile-avatar-file');
  if (profileAvatarFile) {
    profileAvatarFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('edit-profile-avatar-url').value = event.target.result;
          document.getElementById('edit-profile-preview-avatar').src = event.target.result;
          showToast('AVATAR READY', 'Avatar converted to local memory.', 'pink');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const profileAvatarUrlInput = document.getElementById('edit-profile-avatar-url');
  if (profileAvatarUrlInput) {
    profileAvatarUrlInput.addEventListener('input', (e) => {
      document.getElementById('edit-profile-preview-avatar').src = e.target.value.trim() || 'assets/avatar.jpg';
    });
  }

  const profileEditorForm = document.getElementById('profile-editor-form');
  if (profileEditorForm) {
    profileEditorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        name: document.getElementById('edit-profile-name').value.trim(),
        nickname: document.getElementById('edit-profile-nickname').value.trim(),
        age: document.getElementById('edit-profile-age').value.trim(),
        nationality: document.getElementById('edit-profile-nationality').value.trim(),
        role: document.getElementById('edit-profile-role').value.trim(),
        bio: document.getElementById('edit-profile-bio').value.trim(),
        avatar: document.getElementById('edit-profile-avatar-url').value.trim() || 'assets/avatar.jpg'
      };
      window.dataStore.updateProfile(updated);
      renderProfile();
      window.retroAudio.playSuccess();
      showToast('DOSSIER UPDATED', 'Admin profile changes successfully synchronized!', 'green');
      if (profileModal) profileModal.classList.add('hidden');
    });
  }

  // ==========================================
  // ITEM DETAILS MODAL (GAME / BOOK)
  // ==========================================
  function openGameDetails(id) {
    const game = window.dataStore.getGameById(id);
    if (!game || !detailsModal) return;

    const modalContent = document.getElementById('details-modal-content');
    const isOfficial = game.category === 'official';
    const badgeColor = isOfficial ? 'border-[#ff007f] text-[#ff007f]' : 'border-[#00f3ff] text-[#00f3ff]';

    modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="relative overflow-hidden border-2 border-[#ff007f] shadow-[0_0_20px_rgba(255,0,127,0.4)] rounded-none">
          <img src="${game.cover || 'assets/game_racer.jpg'}" alt="${game.title}" class="w-full h-auto object-cover" />
          <div class="absolute top-3 left-3">
            <span class="cyber-badge bg-black/80 border ${badgeColor}">
              ${isOfficial ? 'OFFICIAL RELEASE' : 'FANGAME TRIBUTE'}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <span class="text-xs font-tech text-cyan-400 font-semibold tracking-wider uppercase">${game.platform || 'PC / Arcade'} • ${game.year || '199X'}</span>
            <h2 class="font-cyber font-bold text-2xl md:text-3xl text-white neon-text-pink mt-1">${game.title}</h2>
          </div>

          <div class="flex items-center gap-4 py-2 border-y border-purple-800/40 text-sm font-tech">
            <span class="text-yellow-400 font-arcade text-xs">★ ${game.rating || '5.0'} / 5.0</span>
            <span class="text-gray-400">STATUS: VERIFIED CARTRIDGE</span>
            <span class="text-purple-300">ROM #099</span>
          </div>

          <p class="font-tech text-gray-200 text-base leading-relaxed">
            ${game.description}
          </p>

          <div class="pt-2">
            <h4 class="font-arcade text-xs text-gray-400 mb-2 uppercase">GENRE / SYSTEM TAGS:</h4>
            <div class="flex flex-wrap gap-2">
              ${(game.tags || []).map(t => `<span class="px-2.5 py-1 bg-purple-950/80 border border-purple-500 text-cyan-300 text-xs font-tech">${t}</span>`).join('')}
            </div>
          </div>

          <div class="pt-6 flex flex-wrap gap-3">
            ${game.playUrl ? `
              <a href="${game.playUrl}" target="_blank" rel="noopener noreferrer" class="cyber-btn cyber-btn-cyan text-xs inline-flex items-center gap-2">
                LAUNCH / STEAM STORE ↗
              </a>
            ` : ''}
            <button class="cyber-btn text-xs modal-close-btn-inner">
              CLOSE ARCHIVE
            </button>
          </div>
        </div>
      </div>
    `;

    modalContent.querySelector('.modal-close-btn-inner').addEventListener('click', () => {
      window.retroAudio.playClick();
      detailsModal.classList.add('hidden');
    });

    detailsModal.classList.remove('hidden');
  }

  function openBookDetails(id) {
    const book = window.dataStore.getBookById(id);
    if (!book || !detailsModal) return;

    const modalContent = document.getElementById('details-modal-content');
    const isOriginal = book.category === 'original';
    const badgeColor = isOriginal ? 'border-[#ff007f] text-[#ff007f]' : 'border-[#ffe600] text-[#ffe600]';

    modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="book-spine-effect relative overflow-hidden border-2 border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.4)] rounded-none">
          <img src="${book.cover || 'assets/book_metropolis.jpg'}" alt="${book.title}" class="w-full h-auto object-cover" />
          <div class="absolute top-3 left-3">
            <span class="cyber-badge bg-black/80 border ${badgeColor}">
              ${isOriginal ? 'ORIGINAL NOVEL' : 'FANBOOK SAGA'}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <span class="text-xs font-tech text-pink-400 font-semibold tracking-wider uppercase">BY ${book.author || 'Aria Sterling'} • ${book.year || '199X'}</span>
            <h2 class="font-cyber font-bold text-2xl md:text-3xl text-white neon-text-cyan mt-1">${book.title}</h2>
          </div>

          <div class="flex items-center gap-4 py-2 border-y border-purple-800/40 text-sm font-tech">
            <span class="text-cyan-300 font-tech font-bold">${book.pages || '360 Pages'}</span>
            <span class="text-gray-400">FORMAT: PRINT & DIGITAL</span>
            <span class="text-yellow-300">★ TOP RATED</span>
          </div>

          <p class="font-tech text-gray-200 text-base leading-relaxed">
            ${book.summary}
          </p>

          <div class="pt-2">
            <h4 class="font-arcade text-xs text-gray-400 mb-2 uppercase">LORE / ARCHIVE CATEGORIES:</h4>
            <div class="flex flex-wrap gap-2">
              ${(book.tags || []).map(t => `<span class="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500 text-pink-300 text-xs font-tech">${t}</span>`).join('')}
            </div>
          </div>

          <div class="pt-6 flex flex-wrap gap-3">
            ${book.readUrl ? `
              <a href="${book.readUrl}" target="_blank" rel="noopener noreferrer" class="cyber-btn text-xs inline-flex items-center gap-2">
                READ NOW / PURCHASE ↗
              </a>
            ` : ''}
            <button class="cyber-btn cyber-btn-cyan text-xs modal-close-btn-inner">
              CLOSE ARCHIVE
            </button>
          </div>
        </div>
      </div>
    `;

    modalContent.querySelector('.modal-close-btn-inner').addEventListener('click', () => {
      window.retroAudio.playClick();
      detailsModal.classList.add('hidden');
    });

    detailsModal.classList.remove('hidden');
  }

  // ==========================================
  // BACKUP & FACTORY RESET MODAL
  // ==========================================
  const ribbonBackupBtn = document.getElementById('ribbon-backup-btn');
  if (ribbonBackupBtn) {
    ribbonBackupBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      openBackupModal();
    });
  }

  function openBackupModal() {
    if (!backupModal) return;
    const jsonOutput = document.getElementById('backup-json-output');
    if (jsonOutput) {
      jsonOutput.value = window.dataStore.exportJson();
    }
    backupModal.classList.remove('hidden');
  }

  const copyBackupBtn = document.getElementById('copy-backup-btn');
  if (copyBackupBtn) {
    copyBackupBtn.addEventListener('click', () => {
      const jsonOutput = document.getElementById('backup-json-output');
      if (jsonOutput) {
        navigator.clipboard.writeText(jsonOutput.value).then(() => {
          window.retroAudio.playSuccess();
          showToast('COPIED TO CLIPBOARD', 'JSON backup copied successfully!', 'cyan');
        });
      }
    });
  }

  const importBackupBtn = document.getElementById('import-backup-btn');
  if (importBackupBtn) {
    importBackupBtn.addEventListener('click', () => {
      const jsonOutput = document.getElementById('backup-json-output');
      if (jsonOutput) {
        const success = window.dataStore.importJson(jsonOutput.value);
        if (success) {
          window.retroAudio.playSuccess();
          showToast('DATABASE RESTORED', 'Data imported and reloaded!', 'green');
          renderProfile();
          renderGames();
          renderBooks();
          backupModal.classList.add('hidden');
        } else {
          window.retroAudio.playError();
          alert('ERROR: Invalid JSON format. Please verify the structure.');
        }
      }
    });
  }

  const resetFactoryBtn = document.getElementById('reset-factory-btn');
  if (resetFactoryBtn) {
    resetFactoryBtn.addEventListener('click', () => {
      window.retroAudio.playError();
      if (confirm('CRITICAL WARNING: This will reset all games, books, and profile data to original factory defaults! Continue?')) {
        window.dataStore.resetToDefaults();
        window.retroAudio.playCoin();
        renderProfile();
        renderGames();
        renderBooks();
        showToast('SYSTEM RESTORED', 'Reset to 90s factory default dataset.', 'pink');
        backupModal.classList.add('hidden');
      }
    });
  }

  // ==========================================
  // CRT & SOUND FX CONTROLS
  // ==========================================
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      state.crtActive = !state.crtActive;
      localStorage.setItem('synthwave_crt', state.crtActive);

      if (state.crtActive) {
        document.body.classList.add('crt-active');
        crtToggleBtn.innerHTML = '📺 CRT [ON]';
        crtToggleBtn.classList.add('text-[#00f3ff]');
        showToast('CRT ACTIVATED', '90s Scanline & monitor tube simulation engaged.', 'cyan');
      } else {
        document.body.classList.remove('crt-active');
        crtToggleBtn.innerHTML = '📺 CRT [OFF]';
        crtToggleBtn.classList.remove('text-[#00f3ff]');
        showToast('CRT DISABLED', 'Modern high-definition view restored.', 'pink');
      }
    });
  }

  if (soundToggleBtn) {
    // Sync initial state
    const isMuted = window.retroAudio.isMuted;
    soundToggleBtn.innerHTML = isMuted ? '🔇 SOUND [OFF]' : '🔊 SOUND [ON]';
    if (!isMuted) soundToggleBtn.classList.add('text-[#ff007f]');

    soundToggleBtn.addEventListener('click', () => {
      const active = window.retroAudio.toggleMute();
      if (active) {
        soundToggleBtn.innerHTML = '🔊 SOUND [ON]';
        soundToggleBtn.classList.add('text-[#ff007f]');
        window.retroAudio.playCoin();
        showToast('AUDIO ON', '8-bit arcade sound effects ready.', 'pink');
      } else {
        soundToggleBtn.innerHTML = '🔇 SOUND [OFF]';
        soundToggleBtn.classList.remove('text-[#ff007f]');
        showToast('AUDIO MUTED', 'Sound effects muted.', 'cyan');
      }
    });
  }

  if (bgmToggleBtn) {
    bgmToggleBtn.addEventListener('click', () => {
      const playing = window.retroAudio.toggleBgm();
      if (playing) {
        bgmToggleBtn.innerHTML = '🎵 BGM [PLAYING]';
        bgmToggleBtn.classList.add('text-[#ffe600]', 'border-[#ffe600]', 'animate-pulse');
        showToast('SYNTHWAVE FM', 'Now broadcasting analog synthesized chords.', 'cyan');
      } else {
        bgmToggleBtn.innerHTML = '🎵 BGM [STOPPED]';
        bgmToggleBtn.classList.remove('text-[#ffe600]', 'border-[#ffe600]', 'animate-pulse');
        showToast('SYNTHWAVE FM', 'Audio broadcast paused.', 'pink');
      }
    });
  }

  // Interactive Sound on button hovers
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button, a, .game-filter-tab, .book-filter-tab, .arcade-btn')) {
      window.retroAudio.playHover();
    }
  });

  // Mobile navigation drawer toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      window.retroAudio.playClick();
      mobileNavMenu.classList.toggle('hidden');
    });
    // Close mobile nav on link click
    mobileNavMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavMenu.classList.add('hidden');
      });
    });
  }

  // Quick Contact Terminal form
  const contactForm = document.getElementById('quick-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.retroAudio.playCoin();
      showToast('TRANSMISSION SENT', 'Your message has been beamed to the creator!', 'green');
      contactForm.reset();
    });
  }

  // ==========================================
  // INITIAL INITIALIZATION
  // ==========================================
  updateAdmUI();
  updateGameFilterTabs();
  updateBookFilterTabs();
  renderProfile();
  renderGames();
  renderBooks();

  // Welcome sound after slight delay on first interaction
  window.addEventListener('click', () => {
    window.retroAudio.init();
  }, { once: true });
});
