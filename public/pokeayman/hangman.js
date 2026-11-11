/* Hangman game module: setup modal and drawing-based word guessing gameplay */
(function () {
  let hangmanSession = null;
  // Expose hangmanSession getter/setter on window for any legacy external callers
  Object.defineProperty(window, 'hangmanSession', {
    get() { return hangmanSession; },
    set(val) { hangmanSession = val; },
    configurable: true
  });

  function chooseHangmanWordCount(listName) {
    if (currentRole === 'student') { window.gaStudentSetup(listName, 'chooseHangmanWordCount'); return; }
    const available = getVocabWords(listName, navSchool, navClass);
    if (!available.length) { toast('List needs at least 1 word'); return; }
    const modal = document.createElement('div');
    modal.className = 'game-inline-view game-setup-panel mx-auto my-4';
    modal.innerHTML = `<div class="game-setup-panel text-center"><h2 class="heading-font text-2xl font-bold text-gray-800 mb-2">🎮 Hangman</h2><p class="text-sm text-gray-500 text-center mb-4">The player with the higher score wins when the word is solved.</p><div class="rounded-lg border border-red-200 bg-red-50 p-3 mb-4 text-left"><label class="flex items-center gap-2 text-sm font-semibold text-gray-700"><input id="hangman-timer-enabled" type="checkbox" class="accent-red-500"> Enable per-player timer</label><div id="hangman-timer-settings" class="hidden mt-2"><span class="text-xs font-medium text-gray-600">Time for each player</span><div class="grid grid-cols-4 gap-2 mt-1" role="group" aria-label="Hangman timer duration"><input type="hidden" id="hangman-timer-seconds" value="300"><button type="button" class="hangman-timer-option rounded-lg border-2 border-red-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-400" data-seconds="60">1 min</button><button type="button" class="hangman-timer-option rounded-lg border-2 border-red-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-400" data-seconds="180">3 min</button><button type="button" class="hangman-timer-option rounded-lg border-2 border-red-500 bg-red-100 px-2 py-2 text-xs font-semibold text-gray-700 ring-2 ring-red-300" data-seconds="300">5 min</button><button type="button" class="hangman-timer-option rounded-lg border-2 border-red-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-400" data-seconds="600">10 min</button></div></div></div><div class="flex gap-2"><button type="button" id="hangman-count-start" class="flex-1 btn-primary">Start Game</button><button type="button" id="hangman-count-cancel" class="flex-1 btn-outline">Cancel</button></div></div>`;
    document.body.appendChild(modal);
    const hangmanTimerToggle = modal.querySelector('#hangman-timer-enabled');
    hangmanTimerToggle.addEventListener('change', () => modal.querySelector('#hangman-timer-settings').classList.toggle('hidden', !hangmanTimerToggle.checked));
    modal.querySelectorAll('.hangman-timer-option').forEach(option => option.addEventListener('click', () => {
      modal.querySelector('#hangman-timer-seconds').value = option.dataset.seconds;
      modal.querySelectorAll('.hangman-timer-option').forEach(button => button.classList.remove('border-red-500', 'bg-red-100', 'ring-2', 'ring-red-300', 'is-selected'));
      option.classList.add('border-red-500', 'bg-red-100', 'ring-2', 'ring-red-300', 'is-selected');
    }));
    modal.querySelector('#hangman-count-start').addEventListener('click', () => { const timerSeconds = hangmanTimerToggle.checked ? Number(modal.querySelector('#hangman-timer-seconds').value) : 0; modal.remove(); hangmanSession = null; resetGameTurnState(); openGameHangman(listName, 0, timerSeconds, 'easy', true); });
    modal.querySelector('#hangman-count-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }
  window.chooseHangmanWordCount = chooseHangmanWordCount;

  function openGameHangman(listName, wordCount = 1, timerSeconds = 0, difficulty = 'easy', freshRound = false, studentRound = null) {
    if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) {
      const student = (typeof currentStudent !== 'undefined' ? getAllStudents().find(s => s.student_name === currentStudent) : null) || { student_name: 'Player', avatar_pokemon_id: 25 };
      activeGamePlayers = [student, window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }];
    } else if (activeGamePlayers.length === 1) {
      activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 });
    }
    const difficultyConfig = { easy: { maxWrong: 8, showClue: true }, hard: { maxWrong: 8, showClue: false } };
    difficulty = difficultyConfig[difficulty] ? difficulty : 'easy';
    const activeDifficulty = difficultyConfig[difficulty];
    // A new round must never hydrate the previous lost word or guessed letters.
    if (freshRound) hangmanSession = null;
    setGameReplay(() => { resetGameTurnState(); hangmanSession = null; openGameHangman(listName, wordCount, timerSeconds, difficulty, true); });
    const words = getGameWords(listName);
    if (words.length < 1) { toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: no valid words were loaded.' : 'List needs at least 1 word'); return; }
    if (currentRole === 'student' && !studentRound) studentRound = { words: words.slice().sort(() => Math.random() - 0.5).slice(0, wordCount), index: 0 };
    const sessionIsValid = hangmanSession && hangmanSession.listName === listName && hangmanSession.difficulty === difficulty && hangmanSession.word && !hangmanSession.ended;
    if (!sessionIsValid) hangmanSession = { listName, difficulty, guessed: [], wrongGuesses: 0, word: (studentRound ? studentRound.words[studentRound.index] : words[Math.floor(Math.random() * words.length)]).vocab_word.toUpperCase(), ended: false };
    hangmanSession.difficulty = difficulty;
    hangmanSession.guessed = [...new Set(Array.isArray(hangmanSession.guessed) ? hangmanSession.guessed : [])].filter(letter => /^[A-Z]$/.test(letter));
    hangmanSession.wrongGuesses = Math.max(0, Math.min(activeDifficulty.maxWrong, Number(hangmanSession.wrongGuesses) || 0));
    const word = hangmanSession.word;
    const currentWordRecord = words.find(w => (w.vocab_word || '').toUpperCase() === word);
    const guessed = hangmanSession.guessed;
    const isMediumDifficulty = difficulty === 'medium';
    const maxWrong = activeDifficulty.maxWrong;
    let wrongGuesses = hangmanSession.wrongGuesses;
    let gameEnded = false;
    
    // Eight misses, eight visible stages; completed strokes stay mounted.
    const drawingStages = [
      '<path class="hm-line hm-scaffold" pathLength="1" d="M54 214 V38"/>',
      '<path class="hm-line hm-scaffold" pathLength="1" d="M54 38 H146 M54 68 L84 38"/>',
      '<path class="hm-line hm-scaffold" pathLength="1" d="M146 38 V70"/>',
      '<circle class="hm-line hm-character" pathLength="1" cx="146" cy="89" r="19"/>',
      '<path class="hm-line hm-character" pathLength="1" d="M146 108 V160"/>',
      '<path class="hm-line hm-character" pathLength="1" d="M146 121 L118 143 M146 121 L174 143"/>',
      '<path class="hm-line hm-character" pathLength="1" d="M146 160 L123 193 M146 160 L169 193"/>',
      '<path class="hm-line hm-face" pathLength="1" d="M136 83 L141 88 M141 83 L136 88 M151 83 L156 88 M156 83 L151 88 M138 99 Q146 93 154 99"/>',
    ];
    const impactPoints = [[54,130],[108,38],[146,57],[146,89],[146,135],[174,143],[169,193],[146,89]];
    let drawnWrongCount = -1;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `<div class="hangman-game-shell bg-white rounded-2xl shadow-2xl max-w-5xl w-full">
      <div class="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center justify-between rounded-t-2xl">
        <h2 class="heading-font text-3xl font-bold text-white text-center flex-1">🎮 Hangman</h2>
        <div class="flex items-center gap-2">
          <button type="button" class="game-fullscreen-btn text-white hover:bg-white/20 rounded-lg w-9 h-8 font-bold" aria-label="Enter fullscreen" title="Fullscreen">⛶</button>
          <button id="game-close" class="text-white hover:text-gray-200 text-3xl font-bold" aria-label="Close game">×</button>
        </div>
      </div>
      <div class="game-player-hud-slot flex justify-center w-full px-4 pt-3"></div>
      <div id="hangman-game-body" class="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)] gap-5 md:gap-8 items-center">
        <!-- Compact centered hangman board -->
        <div id="hangman-drawing-panel" class="flex flex-col items-center justify-center min-w-0">
          <div id="hangman-clue" class="mb-3 flex h-24 w-36 items-center justify-center overflow-hidden rounded-xl border-2 border-red-200 bg-red-50" aria-label="Picture clue"></div>
          <p id="hangman-word" class="font-mono text-center break-words"></p>
          <div id="hangman-solved-image" class="hidden mb-3 flex justify-center"></div>
          <svg id="hangman-drawing" width="220" height="260" viewBox="0 0 220 260" role="img" aria-label="Hangman: no wrong guesses">
            <path class="hm-grid" d="M20 60 H200 M20 110 H200 M20 160 H200 M20 210 H200 M60 20 V210 M110 20 V210 M160 20 V210"/>
            <rect class="hm-platform" x="25" y="211" width="170" height="9" rx="4"/>
            <g class="hm-stages"></g><g class="hm-effects" aria-hidden="true"></g>
            <g aria-hidden="true">${Array.from({length: maxWrong}, (_, i) => `<circle class="hm-life" cx="${47 + i * 18}" cy="239" r="4"/>`).join('')}</g>
          </svg>
          <p class="text-center mt-2 text-base font-bold">
            Wrong letters: <span id="hangman-wrong" class="text-red-600">${wrongGuesses}</span>/<span class="text-red-600">${maxWrong}</span>
          </p>
        </div>
        
        <!-- Letters and controls aligned in a compact right column -->
        <div id="hangman-content" class="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center gap-3">
          <div class="hangman-difficulty-selector mb-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Hangman difficulty">
            <button type="button" id="hangman-easy-btn" class="hangman-difficulty-btn hangman-difficulty-easy bg-green-200 text-green-900 border-2 border-green-500 rounded-lg px-3 py-2 text-xs font-black hover:bg-green-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300" aria-pressed="true">Easy</button>
            <button type="button" id="hangman-hard-btn" class="hangman-difficulty-btn hangman-difficulty-hard bg-rose-200 text-rose-900 border-2 border-rose-600 rounded-lg px-3 py-2 text-xs font-black hover:bg-rose-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300" aria-pressed="false">Hard</button>
          </div>
          <div id="hangman-letters" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-3"></div>
          <div id="hangman-feedback" class="text-base sm:text-lg font-semibold min-h-8 mb-3"></div>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    attachGameFullscreen(modal);
    renderGamePlayerHud(modal, Math.min(wordCount, words.length), 0);
    startPlayerTurnTimer(modal, timerSeconds);
    let hangmanLetterSize = 48;
    const updateHangmanLetterSize = () => {
      modal.querySelectorAll('.hangman-letter').forEach(button => {
        button.style.height = `${hangmanLetterSize}px`;
        button.style.fontSize = `${Math.max(16, Math.round(hangmanLetterSize * 0.44))}px`;
      });
    };
    modal.querySelector('#hangman-letter-decrease')?.addEventListener('click', () => { hangmanLetterSize = Math.max(36, hangmanLetterSize - 4); updateHangmanLetterSize(); });
    modal.querySelector('#hangman-letter-increase')?.addEventListener('click', () => { hangmanLetterSize = Math.min(68, hangmanLetterSize + 4); updateHangmanLetterSize(); });
    
    function drawHangman() {
      const svg = modal.querySelector('#hangman-drawing');
      if (drawnWrongCount === wrongGuesses) return;
      const animate = drawnWrongCount >= 0 && wrongGuesses > drawnWrongCount;
      const stages = svg.querySelector('.hm-stages');
      stages.querySelectorAll('.hm-new').forEach(part => part.classList.remove('hm-new'));
      for (let i = Math.max(0, drawnWrongCount); i < wrongGuesses; i++) {
        stages.insertAdjacentHTML('beforeend', `<g class="hm-stage ${animate ? 'hm-new' : ''}" data-stage="${i + 1}">${drawingStages[i]}</g>`);
      }
      svg.dataset.wrong = String(wrongGuesses);
      svg.setAttribute('aria-label', `Hangman: ${wrongGuesses} of ${maxWrong} wrong guesses`);
      svg.querySelectorAll('.hm-life').forEach((life, i) => life.classList.toggle('is-lost', i < wrongGuesses));
      if (animate) {
        const [x, y] = impactPoints[wrongGuesses - 1];
        const letter = guessed[guessed.length - 1];
        svg.querySelector('.hm-effects').innerHTML = `<circle class="hm-impact" cx="${x}" cy="${y}" r="12"/><text class="hm-miss" x="190" y="${Math.max(40, y - 12)}" text-anchor="end">${letter} ✕</text>`;
        svg.classList.remove('hm-hit');
        void svg.getBoundingClientRect();
        svg.classList.add('hm-hit');
      }
      drawnWrongCount = wrongGuesses;
    }
    
    const updateHangmanDifficulty = nextDifficulty => {
      const normalized = nextDifficulty === 'hard' ? 'hard' : 'easy';
      if (normalized === difficulty) return;
      modal.remove();
      hangmanSession = null;
      openGameHangman(listName, wordCount, timerSeconds, normalized);
    };
    modal.querySelector('#hangman-easy-btn').addEventListener('click', () => updateHangmanDifficulty('easy'));
    modal.querySelector('#hangman-hard-btn').addEventListener('click', () => updateHangmanDifficulty('hard'));
    const clue = modal.querySelector('#hangman-clue');
    if (difficulty === 'easy' && currentWordRecord?.vocab_image) clue.innerHTML = `<img src="${currentWordRecord.vocab_image}" class="h-full w-full object-contain" alt="Picture clue for ${word}">`;
    else clue.innerHTML = `<img src="${document.getElementById('hangman-hard-mode-image-loader')?.src || ''}" class="h-full w-full object-contain" alt="Ash and Pikachu">`;
    ['easy', 'hard'].forEach(mode => {
      const button = modal.querySelector(`#hangman-${mode}-btn`);
      if (!button) return;
      const active = difficulty === mode;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('ring-4', active);
      button.classList.toggle('ring-yellow-300', active);
    });

    let hangmanBotTimer = null;
    const clearHangmanBot = () => {
      if (hangmanBotTimer) {
        clearTimeout(hangmanBotTimer);
        hangmanBotTimer = null;
      }
    };
    const checkHangmanBotTurn = () => {
      clearHangmanBot();
      if (gameEnded || !document.body.contains(modal)) return;
      const curPlayer = activeGamePlayers[activeGamePlayerIndex];
      if (!curPlayer?.isBot) return;

      const diff = curPlayer.botDifficulty || window.selectedBotDifficulty || 'medium';
      hangmanBotTimer = setTimeout(() => {
        hangmanBotTimer = null;
        if (gameEnded || !document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer) return;
        const availableBtns = Array.from(modal.querySelectorAll('.hangman-letter:not([disabled])'));
        if (!availableBtns.length) return;

        const targetWord = word.toUpperCase();
        const correctBtns = availableBtns.filter(b => targetWord.includes(b.dataset.letter));
        const wrongBtns = availableBtns.filter(b => !targetWord.includes(b.dataset.letter));

        const acc = diff === 'hard' ? 0.95 : (diff === 'medium' ? 0.70 : 0.40);
        let chosenBtn = null;
        if (Math.random() < acc && correctBtns.length > 0) {
          chosenBtn = correctBtns[Math.floor(Math.random() * correctBtns.length)];
        } else if (wrongBtns.length > 0) {
          chosenBtn = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
        } else {
          chosenBtn = availableBtns[0];
        }
        chosenBtn?.click();
      }, 1000);
    };

    function render() {
      const display = word.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
      modal.querySelector('#hangman-word').textContent = display;
      modal.querySelector('#hangman-wrong').textContent = wrongGuesses;
      drawHangman();
      
      const letters = modal.querySelector('#hangman-letters');
      letters.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
        const isGuessed = guessed.includes(l);
        const isCorrect = isGuessed && word.includes(l);
        const isWrong = isGuessed && !word.includes(l);
        const colStyle = l === 'V' ? 'style="grid-column-start: 2;"' : '';
        let statusClass = 'is-available';
        let badge = '';
        if (isCorrect) {
          statusClass = 'is-correct';
          badge = '<span class="letter-badge letter-badge-correct" aria-hidden="true">✓</span>';
        } else if (isWrong) {
          statusClass = 'is-wrong';
          badge = '<span class="letter-badge letter-badge-wrong" aria-hidden="true">✕</span>';
        }
        return `<button type="button" class="hangman-letter ${statusClass}" ${colStyle} data-letter="${l}" ${isGuessed ? 'disabled aria-disabled="true"' : ''} title="${isWrong ? `${l} (Wrong - blocked)` : isCorrect ? `${l} (Correct)` : `Guess ${l}`}"><span class="letter-char">${l}</span>${badge}</button>`;
      }).join('');
      updateHangmanLetterSize();
      
      letters.querySelectorAll('.hangman-letter').forEach(btn => {
        if (!guessed.includes(btn.dataset.letter)) {
          btn.addEventListener('click', () => {
            const letter = btn.dataset.letter;
            guessed.push(letter);
            if (!word.includes(letter)) {
              try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
              wrongGuesses++;
              hangmanSession.wrongGuesses = wrongGuesses;
              modal.querySelector('#hangman-wrong').textContent = wrongGuesses;
              drawHangman();
              if (activeGamePlayers.length) {
                hangmanSession.playerWrongGuesses = hangmanSession.playerWrongGuesses || {};
                const playerKey = activeGamePlayers[activeGamePlayerIndex]?.student_name || '__solo__';
                hangmanSession.playerWrongGuesses[playerKey] = (hangmanSession.playerWrongGuesses[playerKey] || 0) + 1;
              }
              // The eighth miss ends the shared round immediately; neither player wins.
              if (wrongGuesses >= maxWrong) {
                gameEnded = true;
                render();
                const wordDisplay = modal.querySelector('#hangman-word');
                wordDisplay.classList.add('animate-pulse');
                wordDisplay.style.color = '#dc2626';
                modal.querySelector('#hangman-feedback').textContent = `😢 Game Over! The word was: ${word}`;
                modal.querySelector('#hangman-feedback').className = 'text-base sm:text-lg font-semibold min-h-0 mb-0 text-red-600';
                const solvedImage = modal.querySelector('#hangman-solved-image');
                if (difficulty === 'easy' && currentWordRecord?.vocab_image) {
                  solvedImage.innerHTML = `<div class="flex flex-col items-center justify-center gap-2"><p class="text-lg font-black text-red-600 text-center leading-tight">${word}</p><img src="${currentWordRecord.vocab_image}" class="w-36 max-w-full max-h-28 rounded-xl object-contain shadow-md mx-auto" alt="Picture for ${word}"></div>`;
                  solvedImage.className = 'w-full mb-2 flex flex-col items-center justify-center text-center gap-2';
                  modal.querySelector('#hangman-content').prepend(solvedImage);
                }
                modal.querySelector('#hangman-drawing-panel').classList.remove('hidden');
                modal.querySelectorAll('.hangman-letter').forEach(b => { b.disabled = true; b.classList.add('opacity-50'); });
                const gameOverOverlay = document.createElement('div');
                gameOverOverlay.className = 'game-celebration-overlay hangman-game-over-overlay';
                gameOverOverlay.innerHTML = `<div class="game-celebration-card" role="dialog" aria-modal="true" aria-labelledby="hangman-game-over-title" tabindex="-1">
                  <h2 id="hangman-game-over-title" class="heading-font text-4xl font-bold text-red-600 relative z-10">Game Over</h2>
                  <div class="relative z-10 mt-4 rounded-xl border border-red-200 bg-white/70 px-4 py-3 text-center">
                    <p class="text-lg font-black text-slate-700">Word: ${word}</p>
                    ${currentWordRecord?.vocab_image ? `<img src="${currentWordRecord.vocab_image}" class="mx-auto mt-3 h-28 w-40 rounded-lg object-contain" alt="Picture for ${word}">` : ''}
                  </div>
                  <div class="flex gap-3 mt-6 relative z-10">
                    <button type="button" id="hangman-game-over-again" class="btn-primary flex-1">Play again</button>
                    <button type="button" id="hangman-game-over-close" class="btn-outline flex-1">Close</button>
                  </div>
                </div>`;
                // Mount the result dialog inside the active game/fullscreen root so it stays above the game.
                setTimeout(() => {
                  if (!modal.isConnected) return;
                  mountGameCelebrationOverlay(modal, gameOverOverlay);
                  gameOverOverlay.querySelector('.game-celebration-card')?.focus();
                }, 850);
                gameOverOverlay.style.zIndex = '2147483647';
                gameOverOverlay.style.pointerEvents = 'auto';
                const closeGameOver = () => {
                  gameOverOverlay.remove();
                  modal.remove();
                  hangmanSession = null;
                  if (typeof window.gaExitSetupToArcade === 'function') {
                    window.gaExitSetupToArcade();
                  } else {
                    returnToGamesTab();
                  }
                };
                gameOverOverlay.querySelector('#hangman-game-over-close').addEventListener('click', closeGameOver);
                gameOverOverlay.querySelector('#hangman-game-over-again').addEventListener('click', () => {
                  gameOverOverlay.remove();
                  modal.remove();
                  hangmanSession = null;
                  resetGameTurnState();
                  openGameHangman(listName, wordCount, timerSeconds, difficulty, true);
                });
                return;
              }
              // Wrong letter ends the turn while preserving shared guesses and blocked letters.
              btn.classList.add('animate-shake', 'is-wrong');
              btn.disabled = true;
              btn.setAttribute('aria-disabled', 'true');
              const prevPlayerIndex = activeGamePlayerIndex;
              advanceGameTurn();
              updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeGamePlayerIndex);
              showWrongAnswerCelebration(modal, prevPlayerIndex);
              setTimeout(() => {
                btn.classList.remove('animate-shake');
                render();
              }, 400);
              return;
            } else {
              try { window.pokeSfx?.play?.('correct'); } catch (e) {}
              btn.classList.add('animate-bounce', 'is-correct');
              btn.disabled = true;
              btn.setAttribute('aria-disabled', 'true');
              showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
              // Regular letters award 1 point; the final completing letter awards 3.
              const completesWord = word.split('').every(l => guessed.includes(l));
              const letterPoints = completesWord ? 3 : 1;
              if (activeGamePlayers.length) activeGameScores[activeGamePlayerIndex] += letterPoints;
              updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeGamePlayerIndex);
              setTimeout(() => {
                btn.classList.remove('animate-bounce');
              }, 600);
            }
            if (word.split('').every(l => guessed.includes(l))) {
              updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeGamePlayerIndex);
              // Victory animation
              const wordDisplay = modal.querySelector('#hangman-word');
              wordDisplay.classList.add('animate-bounce', 'text-center', 'text-5xl', 'sm:text-6xl', 'w-full');
              wordDisplay.style.color = '#4052d6';
              modal.querySelector('#hangman-feedback').textContent = '';
              modal.querySelector('#hangman-feedback').className = 'text-base sm:text-lg font-semibold min-h-0 mb-0';
              modal.querySelector('.game-player-card.is-active')?.classList.add('victory-winner');
              const solvedImage = modal.querySelector('#hangman-solved-image');
              if (difficulty === 'easy' && currentWordRecord?.vocab_image) {
                solvedImage.innerHTML = `<div class="flex flex-col items-center justify-center gap-2"><p class="text-lg font-black text-amber-600 text-center leading-tight">${word}</p><img src="${currentWordRecord.vocab_image}" class="w-36 max-w-full max-h-28 rounded-xl object-contain shadow-md mx-auto" alt="Picture for ${word}"></div>`;
                solvedImage.className = 'w-full mb-2 flex flex-col items-center justify-center text-center gap-2';
                modal.querySelector('#hangman-content').prepend(solvedImage);
              }
              modal.querySelector('#hangman-drawing-panel').classList.add('hidden');
              modal.querySelector('#hangman-letters').classList.add('hidden');
              modal.querySelector('#hangman-game-body').classList.remove('gap-8');
              modal.querySelector('#hangman-game-body').classList.add('justify-center');
              modal.querySelector('#hangman-content').classList.remove('flex-1');
              modal.querySelector('#hangman-content').classList.add('w-full', 'max-w-md');
              showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
              modal.querySelector('#hangman-feedback').classList.add('text-green-600');
              const rankedPlayers = activeGamePlayers.map((player, index) => ({
                player,
                score: activeGameScores[index] || 0,
                wrongGuesses: index === activeGamePlayerIndex ? wrongGuesses : (hangmanSession.playerWrongGuesses?.[player.student_name] || 0)
              })).sort((a, b) => b.score - a.score || a.wrongGuesses - b.wrongGuesses);
              const winningEntry = rankedPlayers[0];
              const winningPlayer = winningEntry?.player || activeGamePlayers[activeGamePlayerIndex];
              const winningName = winningPlayer?.student_name || 'Player';
              setTimeout(() => {
                if (!document.body.contains(modal)) return;
                if (currentRole === 'student' && studentRound && studentRound.index + 1 < studentRound.words.length) {
                  studentRound.index += 1;
                  modal.remove();
                  openGameHangman(listName, wordCount, 0, difficulty, true, studentRound);
                  return;
                }
                hangmanSession = { listName, winningScore: wordCount, guessed: [], wrongGuesses: 0, word: null };
                showGameCelebration(modal, `Good job ${winningName}!`, word, winningPlayer, currentWordRecord?.vocab_image || '');
              }, 650);
              letters.querySelectorAll('.hangman-letter').forEach(b => b.disabled = true);
            }
            render();
          });
        }
      });
      checkHangmanBotTurn();
    }
    
    const handleHangmanKeydown = event => {
      if (gameEnded || event.ctrlKey || event.metaKey || event.altKey) return;
      const letter = String(event.key || '').toUpperCase();
      if (!/^[A-Z]$/.test(letter) || guessed.includes(letter)) return;
      const button = modal.querySelector(`[data-letter="${letter}"]`);
      if (button && !button.disabled) button.click();
    };
    modal.addEventListener('keydown', handleHangmanKeydown);
    render();
    const resetAndCloseHangman = () => {
      clearHangmanBot();
      hangmanSession = { listName, winningScore: wordCount, guessed: [], wrongGuesses: 0, word: null };
      modal.remove();
    };
    modal.querySelector('#game-close').addEventListener('click', resetAndCloseHangman);
    modal.addEventListener('click', e => { /* Outside clicks intentionally do not close the game. */ });
  }
  window.openGameHangman = openGameHangman;
})();
