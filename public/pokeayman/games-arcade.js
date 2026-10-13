// Arcade games hub, lobby helpers and 3-2-1 countdown. Only presentation; game logic stays in index.html.
(function () {
  const GAMES = [
    { fn: 'chooseBaamboozlePowerUps', icon: '🎁', name: 'Surprise Boxes', desc: 'Open mystery boxes full of power-ups, traps and score swaps.', tags: ['1–4 players', 'Class favourite'], accent: 'pink', teacherOnly: true },
    { fn: 'chooseMatchWordCount', icon: '🎯', name: 'Match Words', desc: 'Race to match each word with its picture.', tags: ['1–4 players', 'Fast reflexes'], accent: 'red' },
    { fn: 'chooseMemoryDifficulty', icon: '🧠', name: 'Memory Flip', desc: 'Flip the tiles and find the matching pairs.', tags: ['1–4 players', 'Focus'], accent: 'violet' },
    { fn: 'chooseScrambleWordCount', icon: '🔤', name: 'Unscramble', desc: 'Put the mixed-up letters back in order.', tags: ['1–4 players', 'Spelling'], accent: 'blue' },
    { fn: 'chooseHangmanWordCount', icon: '🎮', name: 'Hangman', desc: 'Guess the secret word letter by letter.', tags: ['1–4 players', 'Classic'], accent: 'yellow' },
    { fn: 'chooseFindMeScore', icon: '🕵️', name: 'Find Me', desc: 'Spot the right word as fast as you can.', tags: ['1–4 players', 'Quick recall'], accent: 'mint' },
    { fn: 'startListenCatch', icon: '🔊', name: 'Listen and Catch', desc: 'Hear a word, catch the right answer, and fill your Catchdex.', tags: ['Solo', 'Listening'], accent: 'violet', studentOnly: true },
    { fn: 'startVocabBattle', icon: '⚔️', name: 'Poké Battle', desc: 'Defeat a wild Pokémon and send its reward to your teacher for approval.', tags: ['Solo', 'Teacher-approved reward'], accent: 'red', studentOnly: true },
  ];
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.gaRenderHub = function (listLabel, isTeacher) {
    const cards = GAMES.filter(g => !(isTeacher ? g.studentOnly : g.teacherOnly)).map(g => `
      <button type="button" class="ga-cart ga-${g.accent}" onclick="${g.fn === 'startVocabBattle' || g.fn === 'startListenCatch' ? `${g.fn}(selectedGameList)` : `chooseGamePlayers(selectedGameList, ${g.fn})`}" aria-label="Play ${esc(g.name)}">
        <span class="ga-cart-art" aria-hidden="true"><span>${g.icon}</span></span>
        <span class="ga-cart-body">
          <span class="ga-cart-name">${esc(g.name)}</span>
          <span class="ga-cart-desc">${esc(g.desc)}</span>
          <span class="ga-cart-tags">${g.tags.map(t => `<span>${esc(t)}</span>`).join('')}</span>
        </span>
        <span class="ga-cart-play">Play ▶</span>
      </button>`).join('');
    return `<section class="ga-hub" aria-label="Game arcade">
      <header class="ga-hub-head"><div><span class="ga-hub-kicker">Game Arcade</span><div class="ga-hub-list">Playing with <b>${esc(listLabel)}</b></div></div><button type="button" class="ga-change-lists" onclick="gaShowListSelection()">← Change lists</button></header>
      <div class="ga-grid" role="group" aria-label="Choose a vocabulary game">${cards}</div>
    </section>`;
  };

  let arcadeOpen = false;
  window.gaStudentSetup = function (listName, fnName) {
    const game = GAMES.find(item => item.fn === fnName && !item.teacherOnly);
    if (!game) return;
    if (fnName === 'startVocabBattle') { window.startVocabBattle(listName); return; }
    if (fnName === 'startListenCatch') { window.startListenCatch(listName); return; }
    const pictured = fnName === 'chooseMatchWordCount' || fnName === 'chooseFindMeScore';
    const words = getGameWords(listName, true).filter(word => String(word.vocab_word || '').trim() && (!pictured || String(word.vocab_image || '').trim()));
    const area = document.getElementById('student-tab-games');
    if (!area) return;
    area.querySelectorAll(':scope > .game-inline-view').forEach(view => view.remove());
    const hub = area.querySelector(':scope > .glass-container');
    if (hub) hub.hidden = true;
    const panel = document.createElement('section');
    panel.className = 'game-inline-view ga-student-setup ga-hub';
    panel.setAttribute('aria-label', `${game.name} word count`);
    panel.innerHTML = `<header class="ga-hub-head"><h2>${game.icon} ${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header><div class="ga-student-counts" role="group" aria-label="Number of words">${[5, 10, 15].map(count => `<button type="button" class="btn-primary" data-count="${count}" ${words.length < count ? 'disabled' : ''}><strong>${count}</strong><span>words</span></button>`).join('')}</div>`;
    panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
    panel.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
      const count = Number(button.dataset.count);
      pendingGameTimerSeconds = 0;
      pendingGameReward = 0;
      activeGameReward = 0;
      resetGameTurnState();
      panel.remove();
      if (fnName === 'chooseMatchWordCount') openGameMatch(listName, count, 0);
      else if (fnName === 'chooseMemoryDifficulty') openGameMemory(listName, 'easy', 0, count);
      else if (fnName === 'chooseScrambleWordCount') { scrambleSession = null; openGameScramble(listName, count, 0); }
      else if (fnName === 'chooseFindMeScore') openGameFindMe(listName, count, 0);
      else if (fnName === 'chooseHangmanWordCount') openGameHangman(listName, count, 0, 'easy', true);
    }));
    area.appendChild(panel);
  };
  window.gaShowListSelection = function () { arcadeOpen = false; renderGamesList(); };
  window.gaListStep = function (selector, container, count) {
    if (!selector || !container) return;
    if (!count) arcadeOpen = false;
    selector.hidden = arcadeOpen;
    container.hidden = !arcadeOpen;
    if (arcadeOpen) return;
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'ga-continue'; next.disabled = !count;
    next.textContent = count ? `Next · Game Arcade → (${count} list${count === 1 ? '' : 's'})` : 'Next · Game Arcade →';
    next.addEventListener('click', () => {
      if (getGameWords(selectedGameList).length < 2) { toast('Choose lists with at least two words.'); return; }
      arcadeOpen = true; renderGamesList();
    });
    selector.appendChild(next);
  };

  window.gaMountStage = function (view) {
    const board = view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters');
    if (!board || view.querySelector('#game-player-list') || view.classList.contains('ga-stage')) return;
    view.classList.add('ga-stage');
    const shell = view.matches('.game-popup-modal') ? view.firstElementChild : view.querySelector('.game-popup-modal > div, .memory-game-shell, .cipher-lab-shell, .hangman-game-shell') || view.firstElementChild;
    if (!shell) return;
    shell.classList.add('ga-stage-shell');
    let parent = shell.parentElement;
    while (parent && parent !== view) { parent.classList.add('ga-stage-wrapper'); parent = parent.parentElement; }
    const header = view.querySelector('.surprise-boxes-header, .memory-game-header, .cipher-lab-header, .hangman-game-shell > div:first-child, .sticky.top-0') || shell.firstElementChild;
    if (header) {
      header.classList.add('ga-stage-header');
      header.querySelector('[data-games-back]')?.remove();
      header.querySelectorAll('.game-fullscreen-btn').forEach(button => button.remove());
      const controls = document.createElement('div'); controls.className = 'ga-stage-controls';
      const sound = document.createElement('button'); sound.type = 'button'; sound.className = 'ga-stage-sound';
      const syncSound = () => { const muted = window.pokeSfx?.isMuted() || false; sound.textContent = muted ? '🔇' : '🔊'; sound.setAttribute('aria-label', muted ? 'Turn game sounds on' : 'Turn game sounds off'); sound.title = sound.getAttribute('aria-label'); };
      syncSound(); sound.addEventListener('click', () => {
        window.pokeSfx?.setMuted(!window.pokeSfx.isMuted());
        if (typeof gameSoundState !== 'undefined') gameSoundState.muted = window.pokeSfx?.isMuted() || false;
        const scramble = view.querySelector('#scramble-sound-mute');
        if (scramble && (scramble.textContent.includes('🔇') !== Boolean(window.pokeSfx?.isMuted()))) scramble.click();
        syncSound();
      });
      const expand = document.createElement('button'); expand.type = 'button'; expand.textContent = '⛶'; expand.setAttribute('aria-label', 'Expand to browser fullscreen'); expand.title = 'Browser fullscreen';
      expand.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await view.requestFullscreen(); } catch (_) {} });
      const close = view.querySelector('#baam-close, #find-me-close, #game-close, #scramble-close, #hangman-close') || document.createElement('button');
      close.type = 'button'; close.textContent = '×'; close.classList.add('ga-stage-exit'); close.setAttribute('aria-label', 'Close game'); close.title = 'Close game';
      close.addEventListener('click', event => { event.preventDefault(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); endActiveGames(); });
      controls.append(sound, expand, close); header.appendChild(controls);
      header.querySelectorAll('.game-sound-controls, #scramble-sound-mute').forEach(node => { node.hidden = true; });
    }
    document.body.appendChild(view);
    document.body.classList.add('ga-playing');
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Vocabulary game');
    requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); view.querySelector('.ga-stage-exit')?.focus({ preventScroll: true }); });
  };
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.querySelector('.ga-stage')) { event.preventDefault(); endActiveGames(); } });
  const observeStages = () => new MutationObserver(() => {
    document.querySelectorAll('#class-subtab-games > .game-inline-view, #student-tab-games > .game-inline-view').forEach(view => window.gaMountStage(view));
    document.querySelectorAll('body > .ga-stage').forEach(view => { if (!view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters')) view.remove(); });
    if (!document.querySelector('.ga-stage') && document.body.classList.contains('ga-playing')) {
      document.body.classList.remove('ga-playing');
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.querySelectorAll('#class-subtab-games > .glass-container, #student-tab-games > .glass-container').forEach(hub => { hub.hidden = false; });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (document.body) observeStages(); else document.addEventListener('DOMContentLoaded', observeStages, { once: true });

  window.gaEnhanceLobby = function (modal, fnName, refresh) {
    if (modal.classList.contains('ga-lobby')) return;
    const game = GAMES.find(g => g.fn === fnName);
    modal.classList.add('ga-lobby');
    const h2 = modal.querySelector('h2');
    if (h2 && game) h2.innerHTML = `<span class="ga-lobby-icon" aria-hidden="true">${game.icon}</span> ${esc(game.name)}`;
    const p = h2?.nextElementSibling;
    if (p && game) p.textContent = 'Round setup';
    const list = modal.querySelector('#game-player-list');
    if (!list) return;
    const checks = [...list.querySelectorAll('.game-player-check')];
    const root = list.parentElement;
    const next = modal.querySelector('#game-players-next');
    const cancel = modal.querySelector('#game-players-cancel');
    const footer = next?.parentElement;
    if (!root || !footer) return;
    const players = document.createElement('section');
    players.className = 'ga-players-section';
    const bar = document.createElement('div');
    bar.className = 'ga-quick';
    bar.innerHTML = `<div class="ga-player-heading"><h3>Players</h3><span class="ga-player-count" aria-live="polite">0 / 4 selected</span></div>
      <div class="ga-pick-tools"><select aria-label="Random player count">${[1, 2, 3, 4].filter(n => n <= checks.length).map(n => `<option value="${n}" ${n === Math.min(2, checks.length) ? 'selected' : ''}>Random ${n}</option>`).join('')}</select><button type="button" data-q="random" aria-label="Pick random players" title="Pick random players">⤨</button><button type="button" data-q="clear" aria-label="Clear players" title="Clear players">×</button></div>`;
    const update = () => {
      const count = checks.filter(c => c.checked).length;
      bar.querySelector('.ga-player-count').textContent = `${count} / 4 selected · ${checks.length} in class`;
      if (next) next.textContent = count ? `Start game · ${count} player${count === 1 ? '' : 's'} →` : 'Start game →';
    };
    const set = picks => { checks.forEach(c => { c.disabled = false; c.checked = picks.includes(c); }); refresh?.(); update(); };
    bar.addEventListener('click', e => {
      const q = e.target.closest('button')?.dataset.q; if (!q) return;
      const shuffled = [...checks];
      for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      set(q === 'random' ? shuffled.slice(0, Number(bar.querySelector('select').value)) : []);
    });
    list.before(players);
    players.append(bar, list);
    checks.forEach(c => c.addEventListener('change', update));
    const settings = modal.querySelector('.game-settings-grid');
    const options = document.createElement('details');
    options.className = 'ga-round-options';
    options.innerHTML = '<summary><span>Timer & rewards</span><span class="ga-options-summary"></span></summary><div class="ga-options-body"></div>';
    if (settings) {
      settings.classList.add('ga-core-settings');
      settings.querySelectorAll('.game-setting-control').forEach(control => {
        if (!control.querySelector('#shared-winning-score')) options.querySelector('.ga-options-body').appendChild(control);
      });
      if (!settings.children.length) settings.remove();
    }
    // Card count and timer are separate segmented controls, never competing selections.
    modal.querySelectorAll('.shared-baam-count').forEach(button => button.classList.remove('game-timer-option'));
    [...root.children].forEach(el => {
      if (el.querySelector('.memory-level-option, .match-word-count-option, .shared-baam-count') || el === settings) el.classList.add('ga-round-setting');
    });
    if (options.querySelector('.ga-options-body').children.length) footer.before(options);
    const updateOptions = () => {
      const seconds = Number(modal.querySelector('.game-timer-option.is-selected')?.dataset.seconds || 0);
      const reward = Number(modal.querySelector('.game-reward-option.is-selected')?.dataset.reward || 0);
      options.querySelector('.ga-options-summary').textContent = `${seconds ? `${seconds / 60} min` : 'No timer'} · ${reward ? `${reward} coins` : 'No reward'}`;
    };
    modal.addEventListener('click', () => queueMicrotask(updateOptions));
    updateOptions();
    footer.classList.add('ga-lobby-footer');
    if (cancel) { cancel.textContent = '← Games'; footer.prepend(cancel); }
    const error = modal.querySelector('#game-player-error');
    error?.setAttribute('role', 'alert');
    update();
  };

  window.gaCountdown = function (players, firstIndex, start, avatar) {
    const sfx = window.pokeSfx;
    const ov = document.createElement('div');
    ov.className = 'ga-countdown';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-live', 'assertive');
    const first = players[firstIndex];
    ov.innerHTML = `<div class="ga-cd-stage">
      <div class="ga-cd-players">${players.map((pl, i) => `<div class="ga-cd-player ${i === firstIndex ? 'is-first' : ''}" style="--i:${i}">${avatar(pl, 'ga-cd-avatar')}<span>${esc(pl.student_name)}</span></div>`).join('<b class="ga-cd-vs">VS</b>')}</div>
      <p class="ga-cd-first">${esc(first.student_name)} goes first!</p>
      <div class="ga-cd-num" aria-label="Countdown">3</div>
      <button type="button" class="ga-cd-skip">Skip</button></div>`;
    document.body.appendChild(ov);
    const num = ov.querySelector('.ga-cd-num');
    let n = 3, done = false;
    const finish = () => { if (done) return; done = true; clearInterval(t); ov.remove(); start(); };
    sfx?.play('vs');
    const t = setInterval(() => {
      n -= 1;
      if (n > 0) { num.textContent = n; sfx?.play('click'); }
      else if (n === 0) { num.textContent = 'GO!'; num.classList.add('is-go'); sfx?.play('fanfare'); }
      else finish();
      num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    }, 850);
    ov.querySelector('.ga-cd-skip').addEventListener('click', finish);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(finish, 900);
  };
})();
