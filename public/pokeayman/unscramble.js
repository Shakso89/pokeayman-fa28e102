/* Unscramble game module: setup modal and letter tile unscramble gameplay */
let scrambleSession = null;
Object.defineProperty(window, 'scrambleSession', {
  get() { return scrambleSession; },
  set(val) { scrambleSession = val; },
  configurable: true
});

// Scramble and Hangman word-count choosers
function chooseScrambleWordCount(listName) {
  if (currentRole === 'student') { window.gaStudentSetup(listName, 'chooseScrambleWordCount'); return; }
  if (typeof chooseGamePlayers === 'function') {
    chooseGamePlayers(listName, chooseScrambleWordCount);
    return;
  }
  const available = getGameWords(listName);
  if (!available.length) { toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: no complete vocabulary words were loaded. Retry loading your lists.' : 'List needs at least 1 word'); return; }
  const modal = document.createElement('div');
  modal.className = 'game-inline-view game-setup-panel mx-auto my-4';
  modal.addEventListener('submit', event => { event.preventDefault(); });
  modal.innerHTML = `<div class="game-setup-panel text-center"><h2 class="heading-font text-2xl font-bold text-gray-800 mb-2">🔤 Unscramble</h2><label for="scramble-winning-score" class="block text-left text-xs font-bold text-gray-700 mb-1">Points to win</label><input id="scramble-winning-score" type="number" min="1" step="1" inputmode="numeric" value="5" placeholder="e.g. 5" aria-describedby="scramble-winning-score-help" class="w-full border-2 border-blue-300 rounded-lg px-3 py-2 mb-1 text-sm"><p id="scramble-winning-score-help" class="text-xs text-gray-500 text-left mb-4" aria-live="polite">First to 5 points.</p><div class="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4 text-left"><label class="flex items-center gap-2 text-sm font-semibold text-gray-700"><input id="scramble-timer-enabled" type="checkbox" class="accent-blue-500"> Enable per-player timer</label><div id="scramble-timer-settings" class="hidden mt-2"><span class="text-xs font-medium text-gray-600">Time for each player</span><div class="grid grid-cols-4 gap-2 mt-1" role="group" aria-label="Unscramble timer duration"><input type="hidden" id="scramble-timer-seconds" value="300"><button type="button" class="scramble-timer-option rounded-lg border-2 border-blue-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-400" data-seconds="60">1 min</button><button type="button" class="scramble-timer-option rounded-lg border-2 border-blue-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-400" data-seconds="180">3 min</button><button type="button" class="scramble-timer-option rounded-lg border-2 border-blue-500 bg-blue-100 px-2 py-2 text-xs font-semibold text-gray-700 ring-2 ring-blue-300" data-seconds="300">5 min</button><button type="button" class="scramble-timer-option rounded-lg border-2 border-blue-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-400" data-seconds="600">10 min</button></div></div></div><div class="flex gap-2"><button type="button" id="scramble-count-start" class="flex-1 btn-primary">Start Game</button><button type="button" id="scramble-count-cancel" class="flex-1 btn-outline">Cancel</button></div></div>`;
  document.body.appendChild(modal);
  const scrambleWinningScoreInput = modal.querySelector('#scramble-winning-score');
  const scrambleWinningScoreHelp = modal.querySelector('#scramble-winning-score-help');
  const updateScrambleWinningScoreText = () => {
    const value = Number(scrambleWinningScoreInput.value);
    const valid = Number.isInteger(value) && value > 0;
    scrambleWinningScoreHelp.textContent = valid ? `First to ${value} points.` : 'Enter a positive whole number of points.';
    scrambleWinningScoreInput.setCustomValidity(valid ? '' : 'Enter a positive whole number of points.');
    return valid;
  };
  scrambleWinningScoreInput.addEventListener('input', updateScrambleWinningScoreText);
  updateScrambleWinningScoreText();
  const scrambleTimerToggle = modal.querySelector('#scramble-timer-enabled');
  scrambleTimerToggle.addEventListener('change', () => modal.querySelector('#scramble-timer-settings').classList.toggle('hidden', !scrambleTimerToggle.checked));
  modal.querySelectorAll('.scramble-timer-option').forEach(option => option.addEventListener('click', () => {
    modal.querySelector('#scramble-timer-seconds').value = option.dataset.seconds;
    modal.querySelectorAll('.scramble-timer-option').forEach(button => button.classList.remove('border-blue-500', 'bg-blue-100', 'ring-2', 'ring-blue-300', 'is-selected'));
    option.classList.add('border-blue-500', 'bg-blue-100', 'ring-2', 'ring-blue-300', 'is-selected');
  }));
  const startScramble = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    const scoreInput = modal.querySelector('#scramble-winning-score');
    const scoreHelp = modal.querySelector('#scramble-winning-score-help');
    const rawScore = scoreInput.value.trim();
    const winningScore = Number(rawScore);
    const validScore = rawScore !== '' && Number.isInteger(winningScore) && winningScore >= 1 && winningScore <= 1000;
    if (!validScore) {
      scoreInput.setCustomValidity('Enter a whole number from 1 to 1,000.');
      scoreHelp.textContent = 'Enter a whole number from 1 to 1,000 points.';
      scoreHelp.classList.add('text-red-300');
      scoreInput.focus();
      return;
    }
    scoreInput.setCustomValidity('');
    scoreHelp.classList.remove('text-red-300');
    scoreHelp.textContent = `First to ${winningScore} points.`;
    const timerSeconds = scrambleTimerToggle.checked ? Number(modal.querySelector('#scramble-timer-seconds').value) : 0;
    modal.remove();
    clearInterval(scrambleSession?.timerId);
    scrambleSession = null;
    resetGameTurnState();
    activeGameRewardClaimed = false;
    try {
      openGameScramble(listName, winningScore, timerSeconds, 'easy');
    } catch (error) {
      scrambleSession = null;
      toast('Unable to start Unscramble. Please try again.');
    }
  };
  const startButton = modal.querySelector('#scramble-count-start');
  startButton.disabled = false;
  startButton.addEventListener('click', startScramble);
  scrambleWinningScoreInput.addEventListener('keydown', event => { if (event.key === 'Enter') startScramble(event); });
  modal.querySelector('#scramble-count-cancel').addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); modal.remove(); });
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// Hangman setup moved to /pokeayman/hangman.js

// Scramble Game
function openGameScramble(listName, wordCount = 1, timerSeconds = 0, difficulty = 'easy') {
  const difficultyConfig = { easy: { showClue: true }, hard: { showClue: false } };
  difficulty = difficultyConfig[difficulty] ? difficulty : (scrambleSession?.difficulty || 'easy');
  setGameReplay(() => { resetGameTurnState(); scrambleSession = null; openGameScramble(listName, wordCount, timerSeconds, difficulty); });
  if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) {
    const student = (typeof currentStudent !== 'undefined' ? getAllStudents().find(s => s.student_name === currentStudent) : null) || { student_name: 'Player', avatar_pokemon_id: 25 };
    activeGamePlayers = [student, window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }];
  } else if (activeGamePlayers.length === 1) {
    activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 });
  }
  const availableWords = getGameWords(listName);
  const words = currentRole === 'student' ? availableWords.slice().sort(() => Math.random() - 0.5).slice(0, wordCount) : availableWords;
  if (words.length < 1) { toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: no valid words were loaded.' : 'List needs at least 1 word'); return; }
  // Always initialize the complete round state before loading the first word.
  // The previous two-step initialization left playerWords undefined on a fresh round.
  if (!scrambleSession || scrambleSession.listName !== listName || scrambleSession.winningScore !== wordCount) {
    scrambleSession = { listName, winningScore: wordCount, difficulty, playerWords: {}, playerScores: {}, remainingSeconds: 300, timerStarted: false, timerId: null };
  } else {
    scrambleSession.playerWords = scrambleSession.playerWords || {};
    scrambleSession.playerScores = scrambleSession.playerScores || {};
    if (difficulty) scrambleSession.difficulty = difficulty;
  }
  const getPlayerKey = () => activeGamePlayers[activeGamePlayerIndex]?.student_name || '__solo__';
  const getNextWord = () => {
    const playerKey = getPlayerKey();
    const received = scrambleSession.playerWords[playerKey] || [];
    const unused = words.filter(item => !received.includes(item.vocab_word));
    const pool = unused.length ? unused : words;
    const next = pool[Math.floor(Math.random() * pool.length)];
    scrambleSession.playerWords[playerKey] = [...received, next.vocab_word];
    return next;
  };
  let word = getNextWord();
  let formattedWord = String(word.vocab_word || '');
  let correctWord = formattedWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let scrambledLetters = correctWord.split('').sort(() => Math.random() - 0.5);
  let selectedLetters = Array(correctWord.length).fill(null);
  // Each shuffled tile is assigned one stable occurrence in the target word.
  const scrambleTileTargets = new Map();
  correctWord.split('').forEach((letter, targetIndex) => {
    const tileIndex = scrambledLetters.findIndex((tileLetter, index) => tileLetter === letter && !scrambleTileTargets.has(index));
    if (tileIndex >= 0) scrambleTileTargets.set(tileIndex, targetIndex);
  });
  let scrambleTileAnimating = false;
  let scrambleTileQueue = [];
  let scrambleTileAnimation = null;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `<div class="cipher-lab-shell relative rounded-2xl shadow-2xl max-w-3xl w-full">
    <div class="cipher-lab-header p-4 flex items-center justify-between rounded-t-2xl">
      <div class="flex-1 text-center"><p class="cipher-lab-progress">Pokémon Cipher Lab</p><h2 class="heading-font text-2xl font-bold text-white">Unscramble Lab</h2></div>
      <div class="flex items-center gap-2">
        <div class="scramble-sound-controls flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1" role="group" aria-label="Unscramble sounds">
          <button type="button" id="scramble-sound-mute" class="text-white hover:bg-white/20 rounded-lg w-8 h-8 font-bold" aria-label="Mute Unscramble sounds" title="Mute sounds">🔊</button>
          <label class="sr-only" for="scramble-sound-volume">Unscramble sound volume</label>
          <input id="scramble-sound-volume" class="w-14 accent-cyan-300" type="range" min="0" max="1" step="0.05" value="0.32" aria-label="Unscramble sound volume">
        </div>
        <div class="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1">
          <button type="button" id="scramble-letter-decrease" class="text-white hover:bg-white/20 rounded-lg w-8 h-8 font-bold" aria-label="Make letter buttons smaller" title="Smaller letters">−</button>
          <button type="button" id="scramble-letter-increase" class="text-white hover:bg-white/20 rounded-lg w-8 h-8 font-bold" aria-label="Make letter buttons bigger" title="Bigger letters">+</button>
        </div>
        
        <button id="game-close" class="text-white hover:text-gray-200 text-2xl font-bold" aria-label="Close game">×</button>
      </div>
    </div>
    <div class="cipher-lab-contestants grid grid-cols-2 gap-3 px-4 pt-2">
      <div class="game-player-hud-slot col-span-full flex justify-center w-full"></div>
    </div>
    <div class="cipher-lab-panel mx-auto my-1 p-3 sm:p-5 text-center max-w-2xl w-full">
      <div class="scramble-difficulty-selector mb-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Unscramble difficulty">
        <button type="button" id="scramble-easy-btn" class="scramble-difficulty-btn scramble-difficulty-easy bg-green-200 text-green-900 border-2 border-green-500 rounded-lg px-3 py-1 text-xs font-black hover:bg-green-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300 transition cursor-pointer" aria-pressed="true">Easy</button>
        <button type="button" id="scramble-hard-btn" class="scramble-difficulty-btn scramble-difficulty-hard bg-rose-200 text-rose-900 border-2 border-rose-600 rounded-lg px-3 py-1 text-xs font-black hover:bg-rose-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300 transition cursor-pointer" aria-pressed="false">Hard</button>
      </div>
      <div id="scramble-clue-wrapper" class="mb-2 flex flex-col items-center justify-center">
        <div id="scramble-clue" class="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-cyan-400/40 bg-black/40 shadow-lg p-1 transition-all" aria-label="Picture clue"></div>
      </div>
      <p id="scramble-answer" class="cipher-lab-answer text-4xl sm:text-6xl font-black mb-3 tracking-wider flex items-center justify-center" aria-label="Unscramble word">_____</p>
      <div id="scramble-tiles" class="flex flex-wrap gap-2.5 mb-3 justify-center" aria-label="Available letters"></div>
      <div id="scramble-feedback" class="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="scramble-practice-hint" class="hidden my-2 flex items-center justify-center gap-3" aria-live="polite"></div>
      <div class="cipher-lab-actions flex gap-3 mt-3">
        <button id="scramble-reset" class="cipher-lab-reset flex-1 font-bold py-2.5 rounded-lg transition text-base">Reset</button>
        <button id="scramble-next" class="cipher-lab-next flex-1 font-bold py-2.5 rounded-lg transition text-base" disabled aria-disabled="true">Next Word</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  attachGameFullscreen(modal);
  renderGamePlayerHud(modal, Math.min(wordCount, words.length), 0, Math.min(wordCount, words.length));
  startPlayerTurnTimer(modal, timerSeconds);
  const scrambleSoundState = { muted: false, volume: 0.32, lastPlayed: 0 };
  const scrambleMute = modal.querySelector('#scramble-sound-mute');
  const scrambleVolume = modal.querySelector('#scramble-sound-volume');
  const updateScrambleSoundButton = () => {
    scrambleMute.textContent = scrambleSoundState.muted ? '🔇' : '🔊';
    scrambleMute.setAttribute('aria-label', scrambleSoundState.muted ? 'Unmute Unscramble sounds' : 'Mute Unscramble sounds');
  };
  const playScrambleSound = kind => {
    if (scrambleSoundState.muted || !scrambleSoundState.volume || !gameSoundState.unlocked) return;
    const now = performance.now();
    if (now - scrambleSoundState.lastPlayed < 70) return;
    scrambleSoundState.lastPlayed = now;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = window._pokeymanScrambleAudioContext || (window._pokeymanScrambleAudioContext = new AudioContext());
      if (context.state === 'suspended') context.resume().catch(() => {});
      const settings = { select: [520, .055, 'triangle'], wrong: [180, .12, 'sine'], correct: [740, .16, 'triangle'], complete: [660, .28, 'triangle'] }[kind] || [520, .055, 'triangle'];
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = settings[2]; oscillator.frequency.setValueAtTime(settings[0], start);
      if (kind === 'correct') oscillator.frequency.exponentialRampToValueAtTime(980, start + settings[1]);
      if (kind === 'complete') oscillator.frequency.exponentialRampToValueAtTime(1040, start + settings[1]);
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(Math.max(.001, scrambleSoundState.volume * .3), start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + settings[1]);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + settings[1] + .02);
    } catch (error) {}
  };
  scrambleMute.addEventListener('click', () => { unlockGameSound(); scrambleSoundState.muted = !scrambleSoundState.muted; updateScrambleSoundButton(); });
  scrambleVolume.addEventListener('input', event => { scrambleSoundState.volume = Number(event.target.value); unlockGameSound(); });
  updateScrambleSoundButton();

  const tilesContainer = modal.querySelector('#scramble-tiles');
  const answerDisplay = modal.querySelector('#scramble-answer');
  const checkBtn = modal.querySelector('#scramble-check');
  let scrambleLetterSize = 64;
  const updateScrambleLetterSize = () => {
    tilesContainer.querySelectorAll('.scramble-tile').forEach(tile => {
      tile.style.width = `${scrambleLetterSize}px`;
      tile.style.height = `${scrambleLetterSize}px`;
      tile.style.fontSize = `${Math.max(16, Math.round(scrambleLetterSize * 0.38))}px`;
    });
  };
  const resetBtn = modal.querySelector('#scramble-reset');
  const nextBtn = modal.querySelector('#scramble-next');
  const feedback = modal.querySelector('#scramble-feedback');
  let usedIndices = new Set();
  let awaitingMakeup = false;
  let phase = 'first-attempt';
  let submissionGuard = false;
  let turnToken = `${Date.now()}-${Math.random()}`;
  
  modal.querySelector('#scramble-letter-decrease').addEventListener('click', () => { scrambleLetterSize = Math.max(40, scrambleLetterSize - 8); updateScrambleLetterSize(); });
  modal.querySelector('#scramble-letter-increase').addEventListener('click', () => { scrambleLetterSize = Math.min(104, scrambleLetterSize + 8); updateScrambleLetterSize(); });

  let scrambleBotTimer = null;
  const clearScrambleBot = () => {
    if (scrambleBotTimer) {
      clearTimeout(scrambleBotTimer);
      scrambleBotTimer = null;
    }
  };
  const checkScrambleBotTurn = () => {
    clearScrambleBot();
    if (!document.body.contains(modal) || submissionGuard || phase === 'evaluating') return;
    const curPlayer = activeGamePlayers[activeGamePlayerIndex];
    if (!curPlayer?.isBot) return;

    const activeDifficulty = difficulty || scrambleSession?.difficulty || 'easy';
    const diff = curPlayer.botDifficulty || (activeDifficulty === 'hard' ? 'hard' : (activeDifficulty === 'easy' ? 'easy' : (window.selectedBotDifficulty || 'normal')));
    scrambleBotTimer = setTimeout(() => {
      scrambleBotTimer = null;
      if (!document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer || submissionGuard) return;

      const isMakeoverRound = awaitingMakeup || phase === 'retrying';
      // In makeover rounds, the robot can NEVER do wrong spelling.
      // On Hard: 100% correct (robot cannot make spelling errors).
      // On Normal: 90% correct (does not spell wrong constantly).
      // On Easy: 70% correct.
      let spellCorrect = true;
      if (!isMakeoverRound) {
        if (diff === 'hard') {
          spellCorrect = true;
        } else if (diff === 'normal' || diff === 'medium') {
          spellCorrect = Math.random() < 0.90;
        } else {
          spellCorrect = Math.random() < 0.70;
        }
      }

      const targetLetters = correctWord.split('');

      if (!spellCorrect && targetLetters.length > 1) {
        const temp = targetLetters[0];
        targetLetters[0] = targetLetters[1];
        targetLetters[1] = temp;
      }

      let step = 0;
      const queueNextLetter = () => {
        if (!document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer || step >= targetLetters.length) return;
        const letter = targetLetters[step];
        const availableButtons = Array.from(tilesContainer.querySelectorAll('.scramble-tile:not([disabled])'));
        const matchingBtn = availableButtons.find(b => b.textContent.trim().toUpperCase() === letter);
        const btnToClick = matchingBtn || availableButtons[0];
        if (btnToClick) {
          btnToClick.click();
          step++;
          if (step < targetLetters.length) {
            setTimeout(queueNextLetter, 320);
          }
        }
      };
      queueNextLetter();
    }, 1000);
  };

  function renderTiles() {
    tilesContainer.innerHTML = scrambledLetters.map((letter, idx) => {
      const isUsed = usedIndices.has(idx);
      return `<button type="button" class="scramble-tile px-5 py-3 rounded-lg text-2xl font-bold transition w-16 h-16 flex items-center justify-center ${isUsed ? 'bg-gray-300 text-gray-500 opacity-50' : 'bg-blue-400 text-white hover:bg-blue-500'}" data-index="${idx}" ${isUsed ? 'disabled' : ''}>${letter}</button>`;
    }).join('');
    updateScrambleLetterSize();
    tilesContainer.querySelectorAll('.scramble-tile').forEach(tile => {
      if (!usedIndices.has(parseInt(tile.dataset.index))) tile.addEventListener('click', (e) => {
        const curPlayer = activeGamePlayers[activeGamePlayerIndex];
        if (curPlayer?.isBot && e.isTrusted) return;
        queueScrambleTile(tile);
      });
    });
    if (!selectedLetters.some(Boolean)) checkScrambleBotTurn();
  }

  function updateAnswerDisplay() {
    // Render one slot per letter so the fly-in animation can target the exact slot rect.
    answerDisplay.innerHTML = selectedLetters.map((letter, i) =>
      `<span class="scramble-answer-slot${letter ? ' is-filled' : ''}" data-slot="${i}" style="--slot-index:${i}">${letter ? letter.letter : ''}</span>`
    ).join('');
  }

  function animateScrambleResult(result, announcement) {
    answerDisplay.classList.remove('scramble-result-correct', 'scramble-result-wrong');
    tilesContainer.classList.remove('scramble-tiles-wrong', 'scramble-tiles-correct');
    // Restart the short feedback animation without changing the answer layout.
    void answerDisplay.offsetWidth;
    answerDisplay.classList.add(result === 'correct' ? 'scramble-result-correct' : 'scramble-result-wrong');
    if (result === 'wrong') {
      tilesContainer.classList.add('scramble-tiles-wrong');
    } else if (result === 'correct') {
      tilesContainer.classList.add('scramble-tiles-correct');
    }
    feedback.textContent = announcement;
  }

  function queueScrambleTile(tile) {
    const idx = Number(tile?.dataset.index);
    // Any unused letter instance may be entered; its clicked order fills the next blank.
    const targetIndex = selectedLetters.findIndex(letter => !letter);
    if (!Number.isInteger(idx) || targetIndex < 0 || usedIndices.has(idx) || scrambleTileAnimating || scrambleTileQueue.length || phase === 'evaluating' || phase === 'retry-complete' || phase === 'turn-ended') return;
    scrambleTileQueue.push({ tile, idx, targetIndex });
    processScrambleTileQueue();
  }

  function processScrambleTileQueue() {
    if (scrambleTileAnimating || !scrambleTileQueue.length) return;
    const next = scrambleTileQueue.shift();
    if (!next?.tile?.isConnected || usedIndices.has(next.idx)) return processScrambleTileQueue();
    scrambleTileAnimating = true;
    unlockGameSound();
    playScrambleSound('select');
    next.tile.disabled = true;
    const slotTarget = answerDisplay.querySelector(`[data-slot="${next.targetIndex}"]`) || answerDisplay;
    const from = next.tile.getBoundingClientRect();
    const to = slotTarget.getBoundingClientRect();
    const x = to.left + to.width / 2 - (from.left + from.width / 2);
    const y = to.top + to.height / 2 - (from.top + from.height / 2);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrambleTileAnimation = reduced ? null : next.tile.animate([
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      { transform: `translate3d(${x}px,${y}px,0) scale(.92)`, opacity: .2 }
    ], { duration: 260, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'both' });
    const finish = () => {
      usedIndices.add(next.idx);
      selectedLetters[next.targetIndex] = { letter: scrambledLetters[next.idx], originalIdx: next.idx, targetIndex: next.targetIndex };
      // Letter entry never changes score; scoring happens once after full evaluation.
      scrambleTileAnimating = false;
      scrambleTileAnimation = null;
      updateAnswerDisplay();
      renderTiles();
      if (selectedLetters.every(Boolean)) checkAnswer();
      processScrambleTileQueue();
    };
    if (scrambleTileAnimation) scrambleTileAnimation.onfinish = finish; else finish();
  }
  
  function reset() {
    scrambleTileQueue = [];
    scrambleTileAnimation?.cancel();
    phase = awaitingMakeup ? 'retrying' : 'first-attempt';
    submissionGuard = false;
    scrambleTileAnimation = null;
    scrambleTileAnimating = false;
    selectedLetters = Array(correctWord.length).fill(null);
    usedIndices.clear();
    feedback.textContent = '';
    answerDisplay.classList.remove('scramble-result-correct', 'scramble-result-wrong');
    tilesContainer.classList.remove('scramble-tiles-wrong', 'scramble-tiles-correct');
    tilesContainer.querySelectorAll('.scramble-tile').forEach(t => t.classList.remove('is-wrong', 'is-correct', 'bg-green-500', 'animate-pulse'));
    updateAnswerDisplay();
    renderTiles();
  }
  
  function updateNextWordAvailability() {
    const latestScore = Number(activeGameScores[activeGamePlayerIndex] || 0);
    const canAdvance = Number.isFinite(latestScore) && latestScore >= 1 && phase !== 'evaluating' && phase !== 'retrying' && phase !== 'retry-complete' && phase !== 'turn-ended';
    nextBtn.disabled = !canAdvance;
    nextBtn.setAttribute('aria-disabled', String(!canAdvance));
  }
  function nextWord() {
    if (nextBtn.dataset.busy === 'true') return;
    const activeIndex = activeGamePlayerIndex;
    const latestScore = Number(activeGameScores[activeIndex] || 0);
    if (!Number.isFinite(latestScore) || latestScore < 1) {
      updateNextWordAvailability();
      feedback.textContent = 'You need at least 1 point to continue.';
      return;
    }
    nextBtn.dataset.busy = 'true';
    nextBtn.disabled = true;
    nextBtn.setAttribute('aria-disabled', 'true');
    // Deduct and advance as one guarded transition, using the authoritative score at click time.
    activeGameScores[activeIndex] = latestScore - 1;
    awaitingMakeup = false;
    phase = 'first-attempt';
    submissionGuard = false;
    turnToken = `${Date.now()}-${Math.random()}`;
    scrambleTileQueue = [];
    scrambleTileAnimation?.cancel();
    scrambleTileAnimation = null;
    scrambleTileAnimating = false;
    selectedLetters = Array(correctWord.length).fill(null);
    usedIndices.clear();
    updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeIndex);
    word = getNextWord();
    formattedWord = String(word.vocab_word || '');
    correctWord = formattedWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
    scrambledLetters = correctWord.split('').sort(() => Math.random() - 0.5);
    reset();
    updateScrambleClueAndDifficultyUi();
    nextBtn.dataset.busy = 'false';
    updateNextWordAvailability();
  }
  
  const clueWrapper = modal.querySelector('#scramble-clue-wrapper');
  const clue = modal.querySelector('#scramble-clue');
  const updateScrambleClueAndDifficultyUi = () => {
    if (!clue) return;
    const isEasy = difficulty === 'easy';
    if (isEasy) {
      if (word?.vocab_image) {
        clue.innerHTML = `<img src="${word.vocab_image}" class="h-full w-full object-contain rounded-lg drop-shadow" alt="Picture clue for ${word.vocab_word}">`;
      } else {
        clue.innerHTML = `<div class="flex flex-col items-center justify-center text-slate-400 select-none"><span class="text-3xl">🖼️</span><span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">No Image</span></div>`;
      }
    } else {
      // Hard mode: hides the picture
      const fallbackSrc = document.getElementById('hangman-hard-mode-image-loader')?.src || '';
      if (fallbackSrc) {
        clue.innerHTML = `<img src="${fallbackSrc}" class="h-full w-full object-contain opacity-60" alt="Picture hidden">`;
      } else {
        clue.innerHTML = `<div class="flex flex-col items-center justify-center text-slate-400 select-none"><span class="text-3xl">❓</span><span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Picture Hidden</span></div>`;
      }
    }

    ['easy', 'hard'].forEach(mode => {
      const button = modal.querySelector(`#scramble-${mode}-btn`);
      if (!button) return;
      const active = difficulty === mode;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('ring-4', active);
      button.classList.toggle('ring-yellow-300', active);
    });
  };

  const updateScrambleDifficulty = nextDifficulty => {
    const normalized = nextDifficulty === 'hard' ? 'hard' : 'easy';
    if (normalized === difficulty) return;
    difficulty = normalized;
    if (scrambleSession) scrambleSession.difficulty = normalized;
    updateScrambleClueAndDifficultyUi();
  };

  modal.querySelector('#scramble-easy-btn')?.addEventListener('click', () => updateScrambleDifficulty('easy'));
  modal.querySelector('#scramble-hard-btn')?.addEventListener('click', () => updateScrambleDifficulty('hard'));

  renderTiles();
  updateAnswerDisplay();
  updateScrambleClueAndDifficultyUi();
  updateNextWordAvailability();
  
  // Undo last letter (click on answer area to remove last selected letter)
  answerDisplay.addEventListener('click', () => {
    if (selectedLetters.length > 0) {
      let removeIndex = selectedLetters.length - 1;
      while (removeIndex >= 0 && !selectedLetters[removeIndex]) removeIndex -= 1;
      const removed = removeIndex >= 0 ? selectedLetters[removeIndex] : null;
      if (removed) {
        selectedLetters[removeIndex] = null;
        usedIndices.delete(removed.originalIdx);
      }
      updateAnswerDisplay();
      renderTiles();
    }
  });
  
  resetBtn.addEventListener('click', (e) => {
    const curPlayer = activeGamePlayers[activeGamePlayerIndex];
    if (curPlayer?.isBot && e.isTrusted) return;
    reset();
  });
  nextBtn.addEventListener('click', (e) => {
    const curPlayer = activeGamePlayers[activeGamePlayerIndex];
    if (curPlayer?.isBot && e.isTrusted) return;
    nextWord();
  });
  
  const checkAnswer = () => {
    if (submissionGuard || phase === 'evaluating' || phase === 'retry-complete' || phase === 'turn-ended') return;
    if (!selectedLetters.every(Boolean)) return;
    const answeringPlayerIndex = activeGamePlayerIndex;
    const isMakeupAttempt = awaitingMakeup || phase === 'retrying';
    submissionGuard = true;
    phase = 'evaluating';
    const answer = selectedLetters.map(letter => letter?.letter || '').join('');
    const normalizeEntry = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    if (normalizeEntry(answer) === normalizeEntry(correctWord)) {
      unlockGameSound();
      playScrambleSound('correct');
      if (isMakeupAttempt) {
        phase = 'retry-complete';
        awaitingMakeup = false;
      } else {
        activeGameScores[answeringPlayerIndex] = (activeGameScores[answeringPlayerIndex] || 0) + 1;
        updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeGamePlayerIndex);
        updateNextWordAvailability();
      }
      animateScrambleResult('correct', 'Correct answer.');
      showCorrectAnswerCelebration(modal, answeringPlayerIndex);
      setTimeout(() => {
        if (isMakeupAttempt) {
          advanceGameTurn();
          updateGamePlayerHud(modal, Math.min(wordCount, words.length), activeGamePlayerIndex);
          phase = 'turn-ended';
        }
        const playerKey = getPlayerKey();
        const completedAllWords = (scrambleSession.playerWords[playerKey] || []).length >= words.length;
        if (activeGameScores[activeGamePlayerIndex] < scrambleSession.winningScore && !completedAllWords) {
          // Advance the existing game instance in place. Recreating the modal here
          // created a second word state and left the fullscreen view on the old one.
          phase = 'first-attempt';
          awaitingMakeup = false;
          submissionGuard = false;
          turnToken = `${Date.now()}-${Math.random()}`;
          scrambleTileQueue = [];
          scrambleTileAnimation?.cancel();
          scrambleTileAnimation = null;
          scrambleTileAnimating = false;
          selectedLetters = [];
          word = getNextWord();
          formattedWord = String(word.vocab_word || '');
          correctWord = formattedWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
          scrambledLetters = correctWord.split('').sort(() => Math.random() - 0.5);
          selectedLetters = Array(correctWord.length).fill(null);
          usedIndices = new Set();
          answerDisplay.classList.remove('animate-pulse', 'shake', 'scramble-result-correct', 'scramble-result-wrong');
          tilesContainer.classList.remove('scramble-tiles-wrong');
          feedback.textContent = '';
          modal.querySelector('#scramble-practice-hint')?.classList.add('hidden');
          updateScrambleClueAndDifficultyUi();
          updateAnswerDisplay();
          renderTiles();
          updateNextWordAvailability();
          // Keep the same modal, fullscreen shell, timer budget, and game session.
        } else {
          clearInterval(scrambleSession.timerId);
          scrambleSession.timerId = null;
          scrambleSession = null;
          unlockGameSound();
          playScrambleSound('complete');
          showGameCelebration(modal, 'Word champion!');
        }
      }, 650);
      answerDisplay.classList.remove('shake', 'animate-pulse');
      tilesContainer.querySelectorAll('.scramble-tile').forEach(t => {
        t.disabled = true;
        t.classList.remove('bg-blue-400', 'hover:bg-blue-500');
        t.classList.add('bg-green-500', 'is-correct', 'animate-pulse');
      });
    } else if (answer.length === correctWord.length) {
      // Keep the same round visible after a wrong submission. The correct
      // answer and its picture are shown immediately; only a correct retry
      // may advance a makeover round, and no makeover retry awards points.
      playGameSound('wrong');
      showWrongAnswerCelebration(modal, answeringPlayerIndex);
      const isMakeoverAttempt = awaitingMakeup || phase === 'retrying';
      const practiceHint = modal.querySelector('#scramble-practice-hint');
      if (practiceHint) {
        const image = word?.vocab_image ? `<img src="${word.vocab_image}" class="w-16 h-12 rounded-lg object-contain bg-white/10" alt="Picture for ${word.vocab_word}">` : '';
        practiceHint.innerHTML = `${image}<p class="scramble-practice-lead">Correct answer: <span class="scramble-practice-word">${formattedWord}</span></p>`;
        practiceHint.classList.remove('hidden');
      }
      animateScrambleResult('wrong', isMakeoverAttempt ? 'Incorrect. Keep trying this same word. No points are awarded for this retry.' : 'Incorrect. Try the same word again.');
      tilesContainer.querySelectorAll('.scramble-tile').forEach(t => t.classList.add('is-wrong'));
      answerDisplay.classList.remove('animate-pulse');
      phase = 'retrying';
      awaitingMakeup = true;
      submissionGuard = false;
      setTimeout(() => {
        if (phase === 'retrying') reset();
      }, 700);
    } else {
      submissionGuard = false;
      feedback.textContent = `Select ${correctWord.length - answer.length} more letter${correctWord.length - answer.length !== 1 ? 's' : ''}.`;
      answerDisplay.classList.remove('scramble-result-correct', 'scramble-result-wrong');
      tilesContainer.classList.remove('scramble-tiles-wrong');
    }
  };
  
  modal.querySelector('#game-close').addEventListener('click', () => {
    clearScrambleBot();
    clearInterval(scrambleSession?.timerId);
    scrambleSession = null;
    modal.remove();
  });
  modal.addEventListener('click', e => { /* Outside clicks intentionally do not close the game. */ });
}
window.chooseScrambleWordCount = chooseScrambleWordCount;
window.openGameScramble = openGameScramble;
