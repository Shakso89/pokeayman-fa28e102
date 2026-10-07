// Arcade games hub, lobby helpers and 3-2-1 countdown. Only presentation; game logic stays in index.html.
(function () {
  const GAMES = [
    { fn: 'chooseBaamboozlePowerUps', icon: '🎁', name: 'Surprise Boxes', desc: 'Open mystery boxes full of power-ups, traps and score swaps.', tags: ['1–4 players', 'Class favourite'], accent: 'pink', teacherOnly: true },
    { fn: 'chooseMatchWordCount', icon: '🎯', name: 'Match Words', desc: 'Race to match each word with its picture.', tags: ['1–4 players', 'Fast reflexes'], accent: 'red' },
    { fn: 'chooseMemoryDifficulty', icon: '🧠', name: 'Memory Flip', desc: 'Flip the tiles and find the matching pairs.', tags: ['1–4 players', 'Focus'], accent: 'violet' },
    { fn: 'chooseScrambleWordCount', icon: '🔤', name: 'Unscramble', desc: 'Put the mixed-up letters back in order.', tags: ['1–4 players', 'Spelling'], accent: 'blue' },
    { fn: 'chooseHangmanWordCount', icon: '🎮', name: 'Hangman', desc: 'Guess the secret word letter by letter.', tags: ['1–4 players', 'Classic'], accent: 'yellow' },
    { fn: 'chooseFindMeScore', icon: '🕵️', name: 'Find Me', desc: 'Spot the right word as fast as you can.', tags: ['1–4 players', 'Quick recall'], accent: 'mint' },
  ];
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.gaRenderHub = function (listLabel, isTeacher) {
    const cards = GAMES.filter(g => isTeacher || !g.teacherOnly).map(g => `
      <button type="button" class="ga-cart ga-${g.accent}" onclick="chooseGamePlayers(selectedGameList, ${g.fn})" aria-label="Play ${esc(g.name)}">
        <span class="ga-cart-art" aria-hidden="true"><span>${g.icon}</span></span>
        <span class="ga-cart-body">
          <span class="ga-cart-name">${esc(g.name)}</span>
          <span class="ga-cart-desc">${esc(g.desc)}</span>
          <span class="ga-cart-tags">${g.tags.map(t => `<span>${esc(t)}</span>`).join('')}</span>
        </span>
        <span class="ga-cart-play">Play ▶</span>
      </button>`).join('');
    return `<section class="ga-hub" aria-label="Game arcade">
      <header class="ga-hub-head"><span class="ga-hub-kicker">Game Arcade</span><span class="ga-hub-list">Playing with <b>${esc(listLabel)}</b></span></header>
      <div class="ga-grid" role="group" aria-label="Choose a vocabulary game">${cards}</div>
    </section>`;
  };

  window.gaEnhanceLobby = function (modal, fnName, refresh) {
    const game = GAMES.find(g => g.fn === fnName);
    modal.classList.add('ga-lobby');
    const h2 = modal.querySelector('h2');
    if (h2 && game) h2.innerHTML = `<span class="ga-lobby-icon">${game.icon}</span> ${esc(game.name)} lobby`;
    const p = h2?.nextElementSibling;
    if (p && game) p.textContent = `${game.desc} Pick up to 4 players from this class.`;
    const list = modal.querySelector('#game-player-list');
    if (!list) return;
    const checks = [...list.querySelectorAll('.game-player-check')];
    const set = picks => { checks.forEach(c => { c.disabled = false; c.checked = picks.includes(c); }); refresh?.(); };
    const bar = document.createElement('div');
    bar.className = 'ga-quick';
    bar.innerHTML = `<span>${checks.length} students in this class</span>
      <button type="button" data-q="all">First 4</button><button type="button" data-q="r2">Random 2</button><button type="button" data-q="r4">Random 4</button><button type="button" data-q="clear">Clear</button>`;
    bar.addEventListener('click', e => {
      const q = e.target.closest('button')?.dataset.q; if (!q) return;
      const shuffled = [...checks].sort(() => Math.random() - 0.5);
      set(q === 'all' ? checks.slice(0, 4) : q === 'r2' ? shuffled.slice(0, 2) : q === 'r4' ? shuffled.slice(0, 4) : []);
    });
    list.before(bar);
    const next = modal.querySelector('#game-players-next');
    if (next) next.textContent = 'Enter arena →';
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
