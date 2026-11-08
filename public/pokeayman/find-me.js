/* Find Me game module: picture clue plus moving word choices */
// Find Me: picture clue plus moving word choices, using the shared player HUD and timer.
function chooseFindMeScore(listName) {
  if (currentRole === 'student') { window.gaStudentSetup(listName, 'chooseFindMeScore'); return; }
  const words = getGameWords(listName, true).filter(w => w.vocab_word && w.vocab_image);
  if (!words.length) { toast('Find Me needs words with pictures'); return; }
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `<div class="game-setup-panel text-center"><h2 class="heading-font text-2xl font-bold text-gray-800 mb-2">🕵️ Find Me</h2><p class="text-sm text-gray-500 mb-4">Choose the score needed to win.</p><div class="game-settings-grid mb-4 text-left"><div class="game-setting-control"><label for="find-me-winning-score" class="block text-xs font-bold text-gray-700 mb-1">Points to win</label><input id="find-me-winning-score" type="number" min="1" step="1" inputmode="numeric" value="5" placeholder="e.g. 5" aria-describedby="find-me-winning-score-help" class="w-full border-2 border-orange-300 rounded-lg px-3 py-2 text-sm"><p id="find-me-winning-score-help" class="text-xs text-gray-500 mt-1" aria-live="polite">First to 5 points.</p></div><div class="game-setting-control"><label for="find-me-reward-coins" class="block text-xs font-bold text-gray-700 mb-1">Winner reward coins</label><input id="find-me-reward-coins" type="number" min="0" step="1" value="0" inputmode="numeric" class="w-full border-2 border-orange-300 rounded-lg px-3 py-2 text-sm" aria-describedby="find-me-reward-help"><p id="find-me-reward-help" class="text-xs text-gray-500 mt-1">Optional whole-number reward. It cannot exceed your available credits.</p></div><div class="game-setting-control game-timer-setting-slot"><span class="block text-xs font-medium text-gray-600 mb-2">Timer</span><div class="grid grid-cols-4 gap-2" role="group" aria-label="Timer duration"><button type="button" class="find-me-timer-option is-selected rounded-lg border-2 border-orange-500 bg-orange-100 px-2 py-2 text-xs font-semibold" data-seconds="0" aria-pressed="true">No timer</button><button type="button" class="find-me-timer-option rounded-lg border-2 border-orange-200 bg-white px-2 py-2 text-xs font-semibold" data-seconds="60" aria-pressed="false">1 min</button><button type="button" class="find-me-timer-option rounded-lg border-2 border-orange-200 bg-white px-2 py-2 text-xs font-semibold" data-seconds="180" aria-pressed="false">3 min</button><button type="button" class="find-me-timer-option rounded-lg border-2 border-orange-200 bg-white px-2 py-2 text-xs font-semibold" data-seconds="300" aria-pressed="false">5 min</button></div></div></div><div class="flex gap-2"><button type="button" id="find-me-start" class="flex-1 btn-primary">Start Game</button><button type="button" id="find-me-cancel" class="flex-1 btn-outline">Cancel</button></div></div>`;
  document.body.appendChild(modal);
  let selectedFindMeTimerSeconds = 0;
  modal.querySelectorAll('.find-me-timer-option').forEach(option => option.addEventListener('click', () => { selectedFindMeTimerSeconds = Number(option.dataset.seconds || 0); modal.querySelectorAll('.find-me-timer-option').forEach(b => { const active = b === option; b.classList.toggle('border-orange-500', active); b.classList.toggle('bg-orange-100', active); b.classList.toggle('is-selected', active); b.setAttribute('aria-pressed', String(active)); }); }));
  const winningScoreInput = modal.querySelector('#find-me-winning-score');
  const winningScoreHelp = modal.querySelector('#find-me-winning-score-help');
  const updateWinningScoreText = () => {
    const value = Number(winningScoreInput.value);
    winningScoreHelp.textContent = Number.isInteger(value) && value > 0 ? `First to ${value} points.` : 'Enter a positive whole number of points.';
  };
  winningScoreInput.addEventListener('input', updateWinningScoreText);
  modal.querySelector('#find-me-start').addEventListener('click', () => { const score = Number(winningScoreInput.value); if (!Number.isInteger(score) || score < 1) { winningScoreInput.setCustomValidity('Enter a positive whole number.'); winningScoreInput.reportValidity(); updateWinningScoreText(); return; } winningScoreInput.setCustomValidity(''); const seconds = Number.isFinite(selectedFindMeTimerSeconds) ? selectedFindMeTimerSeconds : 0; modal.remove(); openGameFindMe(listName, score, seconds); });
  modal.querySelector('#find-me-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function openGameFindMe(listName, winningScore = 5, timerSeconds = 0) {
  setGameReplay(() => { resetGameTurnState(); openGameFindMe(listName, winningScore, timerSeconds); });
  const availableWords = getGameWords(listName, true).filter(w => w.vocab_word && w.vocab_image);
  const words = currentRole === 'student' ? availableWords.slice().sort(() => Math.random() - 0.5).slice(0, winningScore) : availableWords;
  if (!words.length) { toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: selected lists need valid words with pictures.' : 'Find Me needs words with pictures'); return; }
  let round = 0, locked = false;
  // Each player has an independent score against the same fixed target.
  const findMeTargetScore = Number.isInteger(Number(winningScore)) && Number(winningScore) > 0 ? Number(winningScore) : 1;
  const findMeWinningScore = findMeTargetScore;
  if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) {
    const student = (typeof currentStudent !== 'undefined' ? getAllStudents().find(s => s.student_name === currentStudent) : null) || { student_name: 'Player', avatar_pokemon_id: 25 };
    activeGamePlayers = [student, window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }];
  } else if (activeGamePlayers.length === 1) {
    activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 });
  }
  if (!Array.isArray(activeGameScores) || activeGameScores.length !== activeGamePlayers.length) activeGameScores = activeGamePlayers.map(() => 0);
  const getFindMePlayerScore = () => Number(activeGameScores[activeGamePlayerIndex] || 0);
  let findMeWordSize = 16;
  const findMeDifficulties = { easy: { itemCount: 10, speed: 1.5 }, medium: { itemCount: 15, speed: 1.5 }, hard: { itemCount: 20, speed: 2 } };
  let findMeDifficulty = 'easy';
  let findMeWordSpeed = findMeDifficulties.easy.speed;
  let findMeAnimationId = null;
  const modal = document.createElement('div'); modal.className = 'game-popup-modal game-find-me-root fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `<div class="find-me-game-shell bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[calc(100*min(var(--vh,1vh),1vh)-1rem)] overflow-hidden flex flex-col"><header class="find-me-game-header sticky top-0 px-3 py-2 flex items-center gap-2 rounded-t-2xl shrink-0"><div class="find-me-game-heading flex items-center gap-2 flex-1 min-w-0"><h2 class="heading-font text-2xl font-bold flex-1 min-w-0">🕵️ Find Me</h2></div><div class="find-me-game-tools flex items-center gap-1.5 ml-auto"><div class="match-game-density find-me-density" role="group" aria-label="Tile size"><button type="button" id="find-me-size-decrease" class="text-base font-black" aria-label="Make Find Me words smaller" title="Smaller words">−</button><button type="button" id="find-me-size-increase" class="text-base font-black" aria-label="Make Find Me words bigger" title="Bigger words">+</button></div><button class="game-fullscreen-btn text-xl font-bold" aria-label="Enter fullscreen">⛶</button><button id="find-me-close" class="text-2xl font-bold ml-2" aria-label="Close game">×</button></div></header><div class="find-me-game-content p-3 sm:p-4 overflow-y-auto"><div class="game-player-hud-slot flex justify-center w-full mb-3"></div><div class="text-center"><div class="find-me-controls find-me-inline-controls" role="group" aria-label="Find Me difficulty"><button type="button" class="find-me-difficulty-btn difficulty-easy" data-difficulty="easy" aria-pressed="false">Easy</button><button type="button" class="find-me-difficulty-btn difficulty-medium" data-difficulty="medium" aria-pressed="false">Medium</button><button type="button" class="find-me-difficulty-btn difficulty-hard" data-difficulty="hard" aria-pressed="false">Hard</button><p id="find-me-progress" class="text-sm font-semibold text-gray-600 mb-0 self-center">0/${findMeTargetScore}</p></div><div class="find-me-board-layout"><div class="flex items-center justify-center"><img id="find-me-picture" class="find-me-square object-contain rounded-xl border-2 border-orange-200 bg-orange-50" alt="Picture clue"></div><div id="find-me-box" class="find-me-square relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50"></div></div><p id="find-me-feedback" class="sr-only" aria-live="polite"></p></div></div></div>`;
  document.body.appendChild(modal); attachGameFullscreen(modal); modal.dataset.noWinnerOnTimeout = 'true'; renderGamePlayerHud(modal, winningScore, 0, findMeTargetScore); startPlayerTurnTimer(modal, timerSeconds);
  const box = modal.querySelector('#find-me-box'), feedback = modal.querySelector('#find-me-feedback');
  let findMeWordCount = Math.min(5, words.length, 15);
  const wordCountEl = modal.querySelector('#find-me-word-count');
  const wordCountDecrease = modal.querySelector('#find-me-word-decrease');
  const wordCountIncrease = modal.querySelector('#find-me-word-increase');
  const updateFindMeWordCountControls = () => {
    if (wordCountEl) wordCountEl.textContent = findMeWordCount;
    if (wordCountDecrease) wordCountDecrease.disabled = findMeWordCount <= 2;
    if (wordCountIncrease) wordCountIncrease.disabled = findMeWordCount >= Math.min(15, words.length);
  };
  const applyFindMeDifficulty = difficulty => {
    const setting = findMeDifficulties[difficulty] || findMeDifficulties.easy;
    findMeDifficulty = difficulty;
    findMeWordSpeed = setting.speed;
    activeGameScores = activeGamePlayers.map(() => 0);
    modal.querySelector('#find-me-progress').textContent = `0/${findMeTargetScore}`;
    modal.querySelectorAll('.find-me-difficulty-btn').forEach(button => {
      const selected = button.dataset.difficulty === difficulty;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    findMeTarget = null;
    renderRound();
  };
  const updateFindMeWordSize = () => box.querySelectorAll('.find-me-word').forEach(btn => { btn.style.fontSize = `${findMeWordSize}px`; });
  const getFindMeRoundItems = (target, itemCount) => {
    const pool = words.filter(word => word.vocab_word !== target.vocab_word);
    if (currentRole === 'student') return [target, ...pool.slice().sort(() => Math.random() - 0.5).slice(0, itemCount - 1)].sort(() => Math.random() - 0.5);
    const items = [target];
    while (items.length < itemCount) {
      const source = pool.length ? pool[Math.floor(Math.random() * pool.length)] : target;
      items.push(source);
    }
    return items.sort(() => Math.random() - 0.5);
  };
  const moveFindMeWords = (timestamp = performance.now()) => {
    if (!document.body.contains(modal)) return;
    const boxRect = box.getBoundingClientRect();
    const elapsed = Math.min(0.05, Math.max(0.001, (timestamp - (moveFindMeWords.lastTimestamp || timestamp)) / 1000));
    moveFindMeWords.lastTimestamp = timestamp;
    box.querySelectorAll('.find-me-word:not(.find-me-word--correct):not(.find-me-word--wrong):not([data-status="correct"]):not([data-status="wrong"])').forEach(btn => {
      const maxLeft = Math.max(4, boxRect.width - btn.offsetWidth - 8);
      const maxTop = Math.max(4, boxRect.height - btn.offsetHeight - 8);
      let x = Number(btn.dataset.x);
      let y = Number(btn.dataset.y);
      let targetX = Number(btn.dataset.targetX);
      let targetY = Number(btn.dataset.targetY);
      if (![x, y, targetX, targetY].every(Number.isFinite)) {
        x = 4 + Math.random() * Math.max(0, maxLeft - 4);
        y = 4 + Math.random() * Math.max(0, maxTop - 4);
        targetX = 4 + Math.random() * Math.max(0, maxLeft - 4);
        targetY = 4 + Math.random() * Math.max(0, maxTop - 4);
      }
      const distance = Math.hypot(targetX - x, targetY - y);
      if (distance < 2) {
        targetX = 4 + Math.random() * Math.max(0, maxLeft - 4);
        targetY = 4 + Math.random() * Math.max(0, maxTop - 4);
      }
      const step = Math.min(1, elapsed * (findMeWordSpeed * 1.35));
      x += (targetX - x) * step;
      y += (targetY - y) * step;
      x = Math.max(4, Math.min(maxLeft, x));
      y = Math.max(4, Math.min(maxTop, y));
      btn.dataset.x = x;
      btn.dataset.y = y;
      btn.dataset.targetX = targetX;
      btn.dataset.targetY = targetY;
      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
    });
    findMeAnimationId = requestAnimationFrame(moveFindMeWords);
    modal._gameAnimationFrame = findMeAnimationId;
  };
  let findMeTarget = null;
  const updateFindMeProgress = () => { modal.querySelector('#find-me-progress').textContent = `${getFindMePlayerScore()}/${findMeTargetScore}`; };
  let findMeBotTimer = null;
  const clearFindMeBot = () => {
    if (findMeBotTimer) {
      clearTimeout(findMeBotTimer);
      findMeBotTimer = null;
    }
  };
  const checkFindMeBotTurn = () => {
    clearFindMeBot();
    if (locked || !document.body.contains(modal)) return;
    const curPlayer = activeGamePlayers[activeGamePlayerIndex];
    if (!curPlayer?.isBot) return;

    const diff = curPlayer.botDifficulty || window.selectedBotDifficulty || 'medium';
    findMeBotTimer = setTimeout(() => {
      findMeBotTimer = null;
      if (locked || !document.body.contains(modal)) return;
      if (activeGamePlayers[activeGamePlayerIndex] !== curPlayer) return;
      const buttons = Array.from(box.querySelectorAll('button:not([disabled])'));
      if (!buttons.length || !findMeTarget) return;

      const targetWord = String(findMeTarget.vocab_word || '').trim().toLowerCase();
      const correctBtn = buttons.find(b => String(b.dataset.word || '').trim().toLowerCase() === targetWord);
      const wrongBtns = buttons.filter(b => b !== correctBtn);

      const acc = diff === 'hard' ? 0.95 : (diff === 'medium' ? 0.75 : 0.50);
      const pickCorrect = Math.random() < acc && correctBtn;
      const chosen = (pickCorrect ? correctBtn : (wrongBtns[Math.floor(Math.random() * wrongBtns.length)] || correctBtn));
      chosen?.click();
    }, 1100);
  };
  function renderRound() { locked = false; const setting = findMeDifficulties[findMeDifficulty]; const roundWords = words.slice().sort(() => Math.random() - 0.5); const target = (findMeTarget = currentRole === 'student' ? words[getFindMePlayerScore()] : roundWords[0]); const choices = getFindMeRoundItems(target, setting.itemCount); modal.querySelector('#find-me-picture').src = target.vocab_image; modal.querySelector('#find-me-picture').alt = `Picture clue for ${target.vocab_word}`; updateFindMeProgress(); feedback.textContent = ''; box.innerHTML = choices.map(w=>`<button type="button" class="find-me-word absolute px-4 py-2 rounded-xl bg-white border-2 border-orange-300 font-bold text-orange-700 shadow-md transition hover:bg-orange-100" data-word="${w.vocab_word}">${w.vocab_word}</button>`).join(''); updateFindMeWordSize(); cancelAnimationFrame(findMeAnimationId); findMeAnimationId = requestAnimationFrame(moveFindMeWords); checkFindMeBotTurn(); box.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      if(locked) return;
      locked = true;
      const correct = btn.dataset.word === target.vocab_word;
      if(correct) {
        activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
        updateFindMeProgress();
        feedback.textContent = '✅ Correct!';
        feedback.className = 'sr-only';
        btn.dataset.status = 'correct';
        btn.classList.add(
          'find-me-word--correct',
          'is-correct',
          'animate-bounce-short',
          'ring-4',
          'ring-emerald-400',
          'bg-emerald-500/20',
          'scale-110',
          'shadow-[0_0_20px_rgba(52,211,153,0.6)]',
          'duration-300'
        );
        const pop = document.createElement('span');
        pop.className = 'find-me-score-pop';
        pop.textContent = '+1';
        btn.appendChild(pop);
        showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
      } else {
        feedback.textContent = `❌ Not quite — the answer is ${target.vocab_word}`;
        feedback.className = 'sr-only';
        btn.dataset.status = 'wrong';
        btn.classList.add(
          'find-me-word--wrong',
          'is-wrong',
          'animate-shake',
          'ring-4',
          'ring-rose-500',
          'bg-rose-500/20',
          'duration-300'
        );
        box.querySelectorAll('button').forEach(b => {
          if (b.dataset.word === target.vocab_word) {
            b.dataset.status = 'hint';
            b.classList.add('find-me-word--hint', 'ring-4', 'ring-amber-400');
          }
        });
        const prevPlayerIndex = activeGamePlayerIndex;
        advanceGameTurn();
        showWrongAnswerCelebration(modal, prevPlayerIndex);
      }
      updateGamePlayerHud(modal, 1, activeGamePlayerIndex);
      if(getFindMePlayerScore() >= findMeTargetScore){
        locked = true;
        setTimeout(() => showGameCelebration(modal, 'Find Me champion!', target.vocab_word, null, target.vocab_image), 500);
      } else {
        setTimeout(() => { round++; renderRound(); }, 900);
      }
    })); }
  wordCountDecrease?.addEventListener('click', () => { findMeWordCount = Math.max(2, findMeWordCount - 1); updateFindMeWordCountControls(); renderRound(); });
  wordCountIncrease?.addEventListener('click', () => { findMeWordCount = Math.min(Math.min(15, words.length), findMeWordCount + 1); updateFindMeWordCountControls(); renderRound(); });
  updateFindMeWordCountControls();
  renderRound();
  modal.querySelector('#find-me-size-decrease').addEventListener('click', () => { findMeWordSize = Math.max(12, findMeWordSize - 2); updateFindMeWordSize(); });
  modal.querySelector('#find-me-size-increase').addEventListener('click', () => { findMeWordSize = Math.min(32, findMeWordSize + 2); updateFindMeWordSize(); });
  modal.querySelectorAll('.find-me-difficulty-btn').forEach(button => button.addEventListener('click', () => applyFindMeDifficulty(button.dataset.difficulty)));
  applyFindMeDifficulty('easy');
  modal.querySelector('#find-me-close').addEventListener('click',()=>{ clearFindMeBot(); clearTimeout(findMeAnimationId); cancelAnimationFrame(findMeAnimationId); modal.remove(); returnToGamesTab(); }); modal.addEventListener('click',()=>{});
}
window.chooseFindMeScore = chooseFindMeScore;
window.openGameFindMe = openGameFindMe;
