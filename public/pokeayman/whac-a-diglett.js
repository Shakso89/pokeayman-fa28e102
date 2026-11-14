/* Whac-A-Diglett Arcade Mini-Game */
(() => {
  'use strict';

  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[c])
    );

  const ACCESSORIES = ['🕶️', '🤠', '🎩', '🎀', '⭐', '🧢', '👑', '🎉', '🥽'];

  window.chooseWhacADiglett = function (listName) {
    if (typeof currentRole !== 'undefined' && currentRole === 'student') {
      if (typeof window.gaStudentSetup === 'function') {
        window.gaStudentSetup(listName, 'chooseWhacADiglett');
        return;
      }
    }
    if (typeof chooseGamePlayers === 'function') {
      chooseGamePlayers(listName, window.chooseWhacADiglett);
    }
  };

  window.openGameWhacADiglett = function (listName, targetScore = 10, timerSeconds = 0) {
    const allWords = typeof getGameWords === 'function' ? getGameWords(listName, false) : [];
    if (!allWords || allWords.length < 2) {
      if (typeof toast === 'function') {
        toast('Whac-A-Diglett needs a vocabulary list with at least 2 words.');
      }
      return;
    }

    // Set up players
    if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) {
      const student = (typeof currentStudent !== 'undefined' ? (typeof getAllStudents === 'function' ? getAllStudents().find(s => s.student_name === currentStudent) : null) : null) || { student_name: 'Player', avatar_pokemon_id: 25 };
      activeGamePlayers = [student, window.createRobotPlayer?.(window.selectedBotDifficulty || 'normal') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }];
    } else if (activeGamePlayers.length === 1) {
      activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'normal') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 });
    }

    if (!Array.isArray(activeGameScores) || activeGameScores.length !== activeGamePlayers.length) {
      activeGameScores = activeGamePlayers.map(() => 0);
    }
    activeGamePlayerIndex = 0;

    if (typeof setGameReplay === 'function') {
      setGameReplay(() => {
        if (typeof resetGameTurnState === 'function') resetGameTurnState();
        window.openGameWhacADiglett(listName, targetScore, timerSeconds);
      });
    }

    const winningScore = Math.max(3, Number(targetScore) || 10);
    const numHoles = 6;
    let currentTargetWord = null;
    let roundActive = true;
    let comboStreak = 0;
    let waveTimer = null;
    let botTimer = null;
    let currentActiveHoles = [];

    // Create Modal
    const modal = document.createElement('div');
    modal.className = 'whac-game-modal game-popup-modal';
    modal.dataset.game = 'whac-a-diglett';
    modal.innerHTML = `
      <header class="whac-header ga-stage-header">
        <div class="whac-heading">
          <h2>🔨 Whac-A-Diglett</h2>
        </div>
        <div class="whac-header-tools">
          <button type="button" class="whac-btn-tool game-fullscreen-btn" aria-label="Toggle Fullscreen">⛶</button>
          <button type="button" class="whac-btn-tool" id="whac-close" aria-label="Close game">✕</button>
        </div>
      </header>
      <div class="whac-game-shell ga-stage-shell">
        <div class="game-player-hud-slot w-full max-w-xl mb-2 flex justify-center"></div>

        <section class="whac-signboard" aria-label="Target word to whack">
          <div class="whac-combo-badge" id="whac-combo">🔥 Combo x2!</div>
          <div class="text-center">
            <div class="whac-clue-label">WHACK THIS WORD</div>
            <div class="whac-clue-content">
              <img id="whac-clue-image" class="whac-clue-img hidden" alt="Word clue">
              <span id="whac-clue-text" class="whac-clue-text">...</span>
              <button type="button" id="whac-speak-btn" class="whac-clue-audio-btn" aria-label="Hear pronunciation" title="Listen to word">🔊</button>
            </div>
          </div>
        </section>

        <main class="whac-field" id="whac-field" role="region" aria-label="Diglett field">
          ${Array.from({ length: numHoles }).map((_, i) => `
            <div class="whac-mound-wrap" data-hole-index="${i}">
              <div class="whac-hole-container" data-hole="${i}">
                <div class="whac-diglett" data-hole-diglett="${i}">
                  <span class="whac-diglett-accessory">${ACCESSORIES[i % ACCESSORIES.length]}</span>
                  <div class="whac-diglett-body">
                    <div class="whac-diglett-eyes">
                      <div class="whac-diglett-eye"></div>
                      <div class="whac-diglett-eye"></div>
                    </div>
                    <div class="whac-diglett-nose"></div>
                    <div class="whac-word-badge" data-hole-badge="${i}"></div>
                  </div>
                </div>
                <div class="whac-mound-lip"></div>
              </div>
            </div>
          `).join('')}
        </main>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof attachGameFullscreen === 'function') attachGameFullscreen(modal);
    if (typeof renderGamePlayerHud === 'function') renderGamePlayerHud(modal, winningScore, 0, winningScore);
    if (typeof startPlayerTurnTimer === 'function') startPlayerTurnTimer(modal, timerSeconds);

    const clueText = modal.querySelector('#whac-clue-text');
    const clueImage = modal.querySelector('#whac-clue-image');
    const speakBtn = modal.querySelector('#whac-speak-btn');
    const comboEl = modal.querySelector('#whac-combo');
    const field = modal.querySelector('#whac-field');

    function speakTarget(word) {
      if (!word) return;
      if (typeof window.readGameWordAloud === 'function') {
        window.readGameWordAloud(word);
      } else if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(word);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
    }

    speakBtn.addEventListener('click', () => {
      if (currentTargetWord) speakTarget(currentTargetWord.vocab_word);
    });

    function cleanUpWave() {
      clearTimeout(waveTimer);
      clearTimeout(botTimer);
      modal.querySelectorAll('.whac-diglett').forEach((el) => {
        el.classList.remove('is-up', 'is-whacked');
      });
      currentActiveHoles = [];
    }

    function spawnWave() {
      if (!roundActive) return;
      cleanUpWave();

      // Pick next target word
      const nextWord = allWords[Math.floor(Math.random() * allWords.length)];
      currentTargetWord = nextWord;

      // Update signboard clue
      clueText.textContent = nextWord.vocab_word;
      if (nextWord.vocab_image && String(nextWord.vocab_image).trim().length > 0) {
        clueImage.src = nextWord.vocab_image;
        clueImage.classList.remove('hidden');
      } else {
        clueImage.classList.add('hidden');
      }

      // Automatically speak word once wave appears
      speakTarget(nextWord.vocab_word);

      // Select 2 or 3 random distinct holes
      const holeIndices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      const activeCount = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
      const chosenHoles = holeIndices.slice(0, activeCount);
      currentActiveHoles = chosenHoles;

      // Distractors
      const distractorPool = allWords.filter((w) => w.vocab_word !== nextWord.vocab_word);
      const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5);

      // Hole 0 in chosenHoles gets the correct word
      const targetHole = chosenHoles[Math.floor(Math.random() * chosenHoles.length)];

      chosenHoles.forEach((holeIdx) => {
        const diglett = modal.querySelector(`[data-hole-diglett="${holeIdx}"]`);
        const badge = modal.querySelector(`[data-hole-badge="${holeIdx}"]`);
        if (!diglett || !badge) return;

        const isTarget = holeIdx === targetHole;
        const wordObj = isTarget ? nextWord : (shuffledDistractors.pop() || nextWord);

        badge.textContent = wordObj.vocab_word;
        diglett.dataset.word = wordObj.vocab_word;
        diglett.dataset.isTarget = isTarget ? 'true' : 'false';

        // Pop up with slight random delay for natural arcade feel
        setTimeout(() => {
          if (roundActive) diglett.classList.add('is-up');
        }, Math.random() * 120);
      });

      // Handle Robot Opponent logic
      const currentPlayer = activeGamePlayers[activeGamePlayerIndex];
      if (currentPlayer && currentPlayer.isBot) {
        const botDiff = currentPlayer.botDifficulty || window.selectedBotDifficulty || 'normal';
        const reactionTimes = { easy: 1800, normal: 1200, hard: 750 };
        const delay = reactionTimes[botDiff] || 1200;

        botTimer = setTimeout(() => {
          if (!roundActive) return;
          const targetDiglett = modal.querySelector(`[data-hole-diglett="${targetHole}"]`);
          if (targetDiglett && targetDiglett.classList.contains('is-up') && !targetDiglett.classList.contains('is-whacked')) {
            handleHit(targetHole, true, true);
          }
        }, delay);
      }

      // Wave retreat timeout (if not whacked)
      waveTimer = setTimeout(() => {
        if (!roundActive) return;
        // Digletts retreat
        modal.querySelectorAll('.whac-diglett.is-up').forEach((el) => {
          el.classList.remove('is-up');
        });
        // Next wave after brief delay
        setTimeout(spawnWave, 400);
      }, 2200);
    }

    function createHitFx(holeIdx, isCorrect) {
      const container = modal.querySelector(`[data-hole="${holeIdx}"]`);
      if (!container) return;

      const fx = document.createElement('div');
      fx.className = 'whac-hit-fx';
      fx.style.top = '20px';
      fx.style.left = '50%';
      fx.style.marginLeft = '-30px';
      fx.innerHTML = `
        <div class="whac-hit-stars">${isCorrect ? '⚡⭐' : '❌'}</div>
        <div class="whac-hit-score">${isCorrect ? '+1' : 'MISS'}</div>
      `;
      container.appendChild(fx);
      setTimeout(() => fx.remove(), 550);
    }

    function handleHit(holeIdx, isTarget, fromBot = false) {
      const diglett = modal.querySelector(`[data-hole-diglett="${holeIdx}"]`);
      if (!diglett || !diglett.classList.contains('is-up') || diglett.classList.contains('is-whacked')) return;

      clearTimeout(waveTimer);
      clearTimeout(botTimer);

      diglett.classList.add('is-whacked');
      createHitFx(holeIdx, isTarget);

      if (isTarget) {
        // Correct hit!
        try { window.pokeSfx?.play?.('correct'); } catch (e) {}
        comboStreak++;
        if (comboStreak > 1) {
          comboEl.textContent = `🔥 Combo x${comboStreak}!`;
          comboEl.classList.add('is-visible');
        }

        activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
        if (typeof updateGamePlayerHud === 'function') {
          updateGamePlayerHud(modal, 1, activeGamePlayerIndex);
        }
        if (typeof showCorrectAnswerCelebration === 'function') {
          showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
        }

        // Check victory condition
        if (activeGameScores[activeGamePlayerIndex] >= winningScore) {
          roundActive = false;
          cleanUpWave();
          setTimeout(() => {
            if (typeof showGameCelebration === 'function') {
              showGameCelebration(modal, 'Whac-A-Diglett Champion!', currentTargetWord.vocab_word, null, currentTargetWord.vocab_image);
            }
          }, 450);
          return;
        }

        // Next round wave
        setTimeout(() => {
          diglett.classList.remove('is-up', 'is-whacked');
          setTimeout(spawnWave, 250);
        }, 350);

      } else {
        // Wrong hit!
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
        comboStreak = 0;
        comboEl.classList.remove('is-visible');

        const prevPlayerIndex = activeGamePlayerIndex;
        if (typeof advanceGameTurn === 'function') {
          advanceGameTurn();
        }
        if (typeof showWrongAnswerCelebration === 'function') {
          showWrongAnswerCelebration(modal, prevPlayerIndex);
        }
        if (typeof updateGamePlayerHud === 'function') {
          updateGamePlayerHud(modal, 0, activeGamePlayerIndex);
        }

        setTimeout(() => {
          diglett.classList.remove('is-up', 'is-whacked');
          setTimeout(spawnWave, 350);
        }, 350);
      }
    }

    // Attach click / tap listener to holes
    field.addEventListener('click', (e) => {
      if (!roundActive) return;
      const holeContainer = e.target.closest('[data-hole]');
      if (!holeContainer) return;
      const holeIdx = Number(holeContainer.dataset.hole);
      const diglett = holeContainer.querySelector('.whac-diglett');
      if (!diglett || !diglett.classList.contains('is-up')) return;

      const isTarget = diglett.dataset.isTarget === 'true';
      handleHit(holeIdx, isTarget, false);
    });

    // Close Handler
    modal.querySelector('#whac-close').addEventListener('click', () => {
      roundActive = false;
      cleanUpWave();
      modal.remove();
      if (typeof returnToGamesTab === 'function') returnToGamesTab();
    });

    // Start first wave
    setTimeout(spawnWave, 500);
  };
})();
