/* Poké Battle: Multiplayer / Class PvP Battle Arena */
(function () {
  let battleState = { left: null, right: null, leftPokemon: null, rightPokemon: null, running: false };

  function resetManualBattleStage() {
    const stage = document.getElementById('manual-vs-stage');
    if (stage) stage.classList.remove('stage-ready');
    
    // Reset side 1 pod
    const av1 = document.getElementById('mvs-avatar-1');
    const ph1 = document.getElementById('mvs-avatar-ph-1');
    const nm1 = document.getElementById('mvs-name-1');
    const ped1 = document.getElementById('mvs-pedestal-1');
    const emp1 = document.getElementById('mvs-empty-1');
    const act1 = document.getElementById('mvs-active-1');
    if (av1) { av1.src = ''; av1.classList.add('hidden'); }
    if (ph1) ph1.classList.remove('hidden');
    if (nm1) nm1.textContent = 'Choose Trainer';
    if (ped1) ped1.classList.remove('pedestal-active');
    if (emp1) emp1.classList.remove('hidden');
    if (act1) act1.classList.add('hidden');
    
    // Reset side 2 pod
    const av2 = document.getElementById('mvs-avatar-2');
    const ph2 = document.getElementById('mvs-avatar-ph-2');
    const nm2 = document.getElementById('mvs-name-2');
    const ped2 = document.getElementById('mvs-pedestal-2');
    const emp2 = document.getElementById('mvs-empty-2');
    const act2 = document.getElementById('mvs-active-2');
    if (av2) { av2.src = ''; av2.classList.add('hidden'); }
    if (ph2) ph2.classList.remove('hidden');
    if (nm2) nm2.textContent = 'Choose Trainer';
    if (ped2) ped2.classList.remove('pedestal-active');
    if (emp2) emp2.classList.remove('hidden');
    if (act2) act2.classList.add('hidden');
  }

  function updateManualBattleStagePokemon(side, studentName, pokemon) {
    const isOne = side === 1;
    const ped = document.getElementById(isOne ? 'mvs-pedestal-1' : 'mvs-pedestal-2');
    const emp = document.getElementById(isOne ? 'mvs-empty-1' : 'mvs-empty-2');
    const act = document.getElementById(isOne ? 'mvs-active-1' : 'mvs-active-2');
    const img = document.getElementById(isOne ? 'mvs-poke-img-1' : 'mvs-poke-img-2');
    const name = document.getElementById(isOne ? 'mvs-poke-name-1' : 'mvs-poke-name-2');
    const pwr = document.getElementById(isOne ? 'mvs-poke-power-1' : 'mvs-poke-power-2');
    const hp = document.getElementById(isOne ? 'mvs-poke-hp-1' : 'mvs-poke-hp-2');
    const rar = document.getElementById(isOne ? 'mvs-poke-rarity-1' : 'mvs-poke-rarity-2');

    if (!pokemon) {
      if (ped) ped.classList.remove('pedestal-active');
      if (emp) emp.classList.remove('hidden');
      if (act) act.classList.add('hidden');
      return;
    }

    const pwrVal = Number(pokemon.pokemon_power ?? pokemon.power ?? pokemon.level) || 50;
    const maxHpVal = typeof getMaxHP === 'function' ? getMaxHP(pokemon) : (pwrVal + 30);
    const curHpVal = typeof getHealedHP === 'function' ? getHealedHP(pokemon) : (pokemon.current_hp ?? maxHpVal);
    const rarityVal = pokemon.pokemon_rarity ? (pokemon.pokemon_rarity.charAt(0).toUpperCase() + pokemon.pokemon_rarity.slice(1)) : (pokemon.rarity || 'Common');
    const artwork = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${pokemon.pokemon_id}.png`;

    if (ped) ped.classList.add('pedestal-active');
    if (emp) emp.classList.add('hidden');
    if (act) act.classList.remove('hidden');
    if (img) { img.src = artwork; img.alt = pokemon.pokemon_name; }
    if (name) name.textContent = pokemon.pokemon_name;
    if (pwr) pwr.textContent = `⚡ ${pwrVal} PWR`;
    if (hp) hp.textContent = `❤️ ${curHpVal}/${maxHpVal} HP`;
    if (rar) rar.textContent = rarityVal;
  }

  function updateManualBattleStageTrainer(side, studentName, avatarSrc) {
    const isOne = side === 1;
    const av = document.getElementById(isOne ? 'mvs-avatar-1' : 'mvs-avatar-2');
    const ph = document.getElementById(isOne ? 'mvs-avatar-ph-1' : 'mvs-avatar-ph-2');
    const nm = document.getElementById(isOne ? 'mvs-name-1' : 'mvs-name-2');
    if (av) {
      if (avatarSrc) {
        av.src = avatarSrc;
        av.classList.remove('hidden');
        if (ph) ph.classList.add('hidden');
      } else {
        av.classList.add('hidden');
        if (ph) ph.classList.remove('hidden');
      }
    }
    if (nm) nm.textContent = studentName || 'Choose Trainer';
  }

  function populateBattleSelects() {
    const students = typeof getStudents === 'function' ? getStudents(navSchool, navClass) : [];
    const s1Grid = document.getElementById('battle-student-1-grid');
    const s2Grid = document.getElementById('battle-student-2-grid');
    const p1Grid = document.getElementById('battle-pokemon-1-grid');
    const p2Grid = document.getElementById('battle-pokemon-2-grid');

    if (p1Grid) p1Grid.innerHTML = '<div class="empty-pokemon-deck"><span>Select Trainer 1</span><small>to view available Pokémon cards</small></div>';
    if (p2Grid) p2Grid.innerHTML = '<div class="empty-pokemon-deck"><span>Select Trainer 2</span><small>to view available Pokémon cards</small></div>';

    resetManualBattleStage();

    const renderTrainerList = (sideClass) => {
      return students.map((s) => {
        const avatar = Number(s.avatar_pokemon_id);
        const avatarSrc = Number.isInteger(avatar) && avatar > 0 && typeof getCanonicalPokemon === 'function' && getCanonicalPokemon(avatar)
          ? `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${avatar}.png`
          : (typeof getAvatarFallbackSrc === 'function' ? getAvatarFallbackSrc() : '');
        const studentPokes = (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === s.student_name);
        const count = studentPokes.length;
        const escName = typeof escapeHtml === 'function' ? escapeHtml(s.student_name) : s.student_name;
        return `<button type="button" class="${sideClass} trainer-select-pill" data-name="${escName}" data-avatar="${avatarSrc}">
          <img src="${avatarSrc}" class="battle-student-avatar" alt="${escName}" loading="lazy" onerror="this.onerror=null;this.src=typeof getAvatarFallbackSrc==='function'?getAvatarFallbackSrc():'';">
          <div class="trainer-pill-meta">
            <span class="battle-student-name">${escName}</span>
            <span class="trainer-poke-count">⚡ ${count} Pokémon</span>
          </div>
        </button>`;
      }).join('');
    };

    if (s1Grid) s1Grid.innerHTML = renderTrainerList('battle-s1-btn');
    if (s2Grid) s2Grid.innerHTML = renderTrainerList('battle-s2-btn');

    // Student 1 click
    s1Grid?.querySelectorAll('.battle-s1-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        s1Grid.querySelectorAll('.battle-s1-btn').forEach(b => b.classList.remove('border-blue-400', 'bg-blue-600'));
        btn.classList.add('border-blue-400', 'bg-blue-600');
        const name = btn.dataset.name;
        const avatarSrc = btn.dataset.avatar;
        updateManualBattleStageTrainer(1, name, avatarSrc);

        const sel1 = document.getElementById('battle-selected-s1');
        if (sel1) {
          sel1.dataset.student = name;
          sel1.dataset.pokemonId = '';
        }
        updateManualBattleStagePokemon(1, name, null);

        const pokes = (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === name);
        if (!p1Grid) return;
        if (pokes.length === 0) {
          p1Grid.innerHTML = '<div class="empty-pokemon-deck"><span>No Pokémon found for this trainer</span><small>Add Pokémon to their collection first</small></div>';
        } else {
          p1Grid.innerHTML = pokes.map(p => {
            const pokeImg = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p.pokemon_id}.png`;
            const pwr = Number(p.pokemon_power ?? p.power ?? p.level) || 50;
            const maxHp = typeof getMaxHP === 'function' ? getMaxHP(p) : (pwr + 30);
            const curHp = typeof getHealedHP === 'function' ? getHealedHP(p) : (p.current_hp ?? maxHp);
            const hpLabel = curHp < maxHp ? `${curHp}/${maxHp}` : `${curHp}`;
            const escPoke = typeof escapeHtml === 'function' ? escapeHtml(p.pokemon_name) : p.pokemon_name;
            return `<button type="button" class="battle-p1-btn pokemon-battle-card" data-id="${p.__backendId}" data-name="${escPoke}">
              <img src="${pokeImg}" class="p-card-img" alt="${escPoke}" loading="lazy" onerror="this.onerror=null;this.src=typeof getAvatarFallbackSrc==='function'?getAvatarFallbackSrc():'';">
              <span class="card-p-name">${escPoke}</span>
              <div class="card-p-stats">
                <span class="chip-power" title="Power: ${pwr}">⚡ ${pwr}</span>
                <span class="chip-hp" title="HP: ${curHp}/${maxHp}">❤️ ${hpLabel}</span>
              </div>
            </button>`;
          }).join('');

          p1Grid.querySelectorAll('.battle-p1-btn').forEach(btn2 => {
            btn2.addEventListener('click', e2 => {
              e2.preventDefault();
              p1Grid.querySelectorAll('.battle-p1-btn').forEach(b => b.classList.remove('border-green-400', 'bg-green-600'));
              btn2.classList.add('border-green-400', 'bg-green-600');
              const selectedPokemon = (typeof allData !== 'undefined' ? allData : []).find(r => r.__backendId === btn2.dataset.id && r.type === 'pokemon');
              if (!selectedPokemon) return;
              const sel1 = document.getElementById('battle-selected-s1');
              if (sel1) {
                sel1.innerHTML = `<span>${name} - ${selectedPokemon.pokemon_name}</span>`;
                sel1.dataset.student = name;
                sel1.dataset.pokemonId = selectedPokemon.__backendId;
              }
              updateManualBattleStagePokemon(1, name, selectedPokemon);
              updateManualBattleStartState();
            });
          });
        }
        updateManualBattleStartState();
      });
    });

    // Student 2 click
    s2Grid?.querySelectorAll('.battle-s2-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        s2Grid.querySelectorAll('.battle-s2-btn').forEach(b => b.classList.remove('border-purple-400', 'bg-purple-600'));
        btn.classList.add('border-purple-400', 'bg-purple-600');
        const name = btn.dataset.name;
        const avatarSrc = btn.dataset.avatar;
        updateManualBattleStageTrainer(2, name, avatarSrc);

        const sel2 = document.getElementById('battle-selected-s2');
        if (sel2) {
          sel2.dataset.student = name;
          sel2.dataset.pokemonId = '';
        }
        updateManualBattleStagePokemon(2, name, null);

        const pokes = (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === name);
        if (!p2Grid) return;
        if (pokes.length === 0) {
          p2Grid.innerHTML = '<div class="empty-pokemon-deck"><span>No Pokémon found for this trainer</span><small>Add Pokémon to their collection first</small></div>';
        } else {
          p2Grid.innerHTML = pokes.map(p => {
            const pokeImg = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p.pokemon_id}.png`;
            const pwr = Number(p.pokemon_power ?? p.power ?? p.level) || 50;
            const maxHp = typeof getMaxHP === 'function' ? getMaxHP(p) : (pwr + 30);
            const curHp = typeof getHealedHP === 'function' ? getHealedHP(p) : (p.current_hp ?? maxHp);
            const hpLabel = curHp < maxHp ? `${curHp}/${maxHp}` : `${curHp}`;
            const escPoke = typeof escapeHtml === 'function' ? escapeHtml(p.pokemon_name) : p.pokemon_name;
            return `<button type="button" class="battle-p2-btn pokemon-battle-card" data-id="${p.__backendId}" data-name="${escPoke}">
              <img src="${pokeImg}" class="p-card-img" alt="${escPoke}" loading="lazy" onerror="this.onerror=null;this.src=typeof getAvatarFallbackSrc==='function'?getAvatarFallbackSrc():'';">
              <span class="card-p-name">${escPoke}</span>
              <div class="card-p-stats">
                <span class="chip-power" title="Power: ${pwr}">⚡ ${pwr}</span>
                <span class="chip-hp" title="HP: ${curHp}/${maxHp}">❤️ ${hpLabel}</span>
              </div>
            </button>`;
          }).join('');

          p2Grid.querySelectorAll('.battle-p2-btn').forEach(btn2 => {
            btn2.addEventListener('click', e2 => {
              e2.preventDefault();
              p2Grid.querySelectorAll('.battle-p2-btn').forEach(b => b.classList.remove('border-pink-400', 'bg-pink-600'));
              btn2.classList.add('border-pink-400', 'bg-pink-600');
              const selectedPokemon = (typeof allData !== 'undefined' ? allData : []).find(r => r.__backendId === btn2.dataset.id && r.type === 'pokemon');
              if (!selectedPokemon) return;
              const sel2 = document.getElementById('battle-selected-s2');
              if (sel2) {
                sel2.innerHTML = `<span>${name} - ${selectedPokemon.pokemon_name}</span>`;
                sel2.dataset.student = name;
                sel2.dataset.pokemonId = selectedPokemon.__backendId;
              }
              updateManualBattleStagePokemon(2, name, selectedPokemon);
              updateManualBattleStartState();
            });
          });
        }
        updateManualBattleStartState();
      });
    });
  }

  // Manual Battle owns only the four current draft selections; ended-battle state never gates readiness.
  function getManualBattleDraft() {
    const left = document.getElementById('battle-selected-s1');
    const right = document.getElementById('battle-selected-s2');
    const sideOneStudent = left?.dataset.student || '';
    const sideTwoStudent = right?.dataset.student || '';
    const rows = typeof allData !== 'undefined' ? allData : [];
    const sideOnePokemon = rows.find(r => r.__backendId === (left?.dataset.pokemonId || '') && r.type === 'pokemon');
    const sideTwoPokemon = rows.find(r => r.__backendId === (right?.dataset.pokemonId || '') && r.type === 'pokemon');
    return { sideOneStudent, sideOnePokemon, sideTwoStudent, sideTwoPokemon };
  }

  function updateManualBattleStartState() {
    const draft = getManualBattleDraft();
    const start = document.getElementById('confirm-manual-battle');
    const instruction = document.getElementById('manual-battle-instruction');
    const stage = document.getElementById('manual-vs-stage');
    if (!start) return;

    const hasS1 = Boolean(draft.sideOneStudent);
    const hasS2 = Boolean(draft.sideTwoStudent);
    const sameTrainer = hasS1 && hasS2 && draft.sideOneStudent === draft.sideTwoStudent;
    const hasP1 = Boolean(draft.sideOnePokemon);
    const hasP2 = Boolean(draft.sideTwoPokemon);

    const ready = Boolean(hasS1 && hasP1 && hasS2 && hasP2 && !sameTrainer);
    start.disabled = !ready;
    start.setAttribute('aria-disabled', String(!ready));

    if (stage) {
      if (ready) {
        stage.classList.add('stage-ready');
      } else {
        stage.classList.remove('stage-ready');
      }
    }

    if (instruction) {
      if (ready) {
        instruction.innerHTML = '<span class="ready-badge">🔥 Both Champions Ready! Start the Battle!</span>';
      } else if (!hasS1 && !hasS2) {
        instruction.textContent = 'Select Trainer 1 and Trainer 2 to begin draft.';
      } else if (sameTrainer) {
        instruction.textContent = 'Select two different trainers for the battle.';
      } else if (!hasS1) {
        instruction.textContent = 'Select Trainer 1 in the blue corner.';
      } else if (!hasS2) {
        instruction.textContent = 'Select Trainer 2 in the red corner.';
      } else if (!hasP1) {
        instruction.textContent = `Choose a battle Pokémon for ${draft.sideOneStudent}.`;
      } else if (!hasP2) {
        instruction.textContent = `Choose a battle Pokémon for ${draft.sideTwoStudent}.`;
      } else {
        instruction.textContent = 'Select one student and one Pokémon on each side.';
      }
    }
  }

  function animateBattleHp(barId, nextHp, maxHp, cardId) {
    const bar = document.getElementById(barId);
    const card = document.getElementById(cardId);
    if (!bar || !Number.isFinite(nextHp) || !Number.isFinite(maxHp) || maxHp <= 0) return;
    const nextPercent = Math.max(0, Math.min(100, (nextHp / maxHp) * 100));
    const previousPercent = Math.max(0, Math.min(100, parseFloat(bar.dataset.hpPercent ?? bar.style.width) || 100));
    bar.dataset.hpPercent = String(nextPercent);
    if (nextPercent >= previousPercent) { bar.style.width = `${nextPercent}%`; return; }
    const track = bar.parentElement;
    let trail = track?.querySelector('.battle-hp-trail');
    if (!trail && track) { trail = document.createElement('span'); trail.className = 'battle-hp-trail'; track.appendChild(trail); }
    if (trail) { trail.style.setProperty('--trail-width', `${previousPercent}%`); requestAnimationFrame(() => { trail.style.setProperty('--trail-width', `${nextPercent}%`); }); }
    if (card) { card.classList.remove('battle-impact'); void card.offsetWidth; card.classList.add('battle-impact'); clearTimeout(card._impactTimer); card._impactTimer = setTimeout(() => card.classList.remove('battle-impact'), 700); }
    if (track) { const ripple = document.createElement('span'); ripple.className = 'battle-hp-ripple'; ripple.style.setProperty('--ripple-x', `${nextPercent}%`); track.appendChild(ripple); setTimeout(() => ripple.remove(), 700); }
    bar.style.width = `${nextPercent}%`;
  }

  function resetBattleVisualState() {
    document.getElementById('arena-stage')?.classList.remove('arena-ready', 'arena-active', 'arena-result');
    document.querySelectorAll('#arena-stage .arena-projectile').forEach(projectile => projectile.remove());
    document.querySelectorAll('#arena-stage .arena-attack-layer').forEach(layer => layer.remove());
    ['battle-left', 'battle-right'].forEach(id => {
      const card = document.getElementById(id);
      if (!card) return;
      card.classList.remove('battle-winner-final', 'battle-loser-final', 'battle-impact', 'battle-winner-celebrate', 'arena-fainting', 'arena-lunge-left', 'arena-lunge-right');
      card.querySelectorAll('.arena-pop, .arena-fx').forEach(n => n.remove());
      card.querySelector('.battle-winner-label')?.remove();
      card.querySelector('img[id$="-img"]')?.classList.remove('battle-winner-art', 'attack-punch', 'take-damage', 'battle-winner-celebrate', 'arena-windup-left', 'arena-windup-right', 'arena-strike-left', 'arena-strike-right', 'arena-hit-react');
      card.querySelectorAll('.battle-hp-ripple, .battle-hp-trail').forEach(effect => effect.remove());
    });
  }

  function resetBattleTabState({ preserveManualSelections = false } = {}) {
    arenaExitProjector();
    // Safe lifecycle reset: clear results and battle state without wiping a live picker.
    battleState = { left: null, right: null, leftPokemon: null, rightPokemon: null, running: false };
    resetBattleVisualState();
    const battleArea = document.getElementById('battle-area');
    const manualSelect = document.getElementById('manual-select-ui');
    const startButton = document.getElementById('start-battle-btn');
    if (battleArea) battleArea.classList.add('hidden');
    if (manualSelect) manualSelect.classList.add('hidden');
    if (startButton) { startButton.disabled = false; startButton.textContent = 'Start Battle'; }
    document.getElementById('arena-new-match-btn')?.classList.add('hidden');
    ['manual-battle-btn', 'random-battle-btn'].forEach(id => { const modeButton = document.getElementById(id); if (modeButton) modeButton.disabled = false; });
    ['battle-selected-s1', 'battle-selected-s2'].forEach(id => {
      const selected = document.getElementById(id);
      if (!selected) return;
      selected.textContent = 'Select Student & Pokémon';
      selected.dataset.student = '';
      selected.dataset.pokemonId = '';
    });
    ['battle-left-hp-bar', 'battle-right-hp-bar'].forEach(id => {
      const bar = document.getElementById(id);
      if (bar) { bar.style.width = '100%'; bar.dataset.hpPercent = '100'; bar.style.background = ''; }
    });
    ['battle-left-hp', 'battle-right-hp', 'battle-left-name', 'battle-right-name', 'battle-left-pokemon', 'battle-right-pokemon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    document.querySelectorAll('.battle-s1-btn, .battle-s2-btn, .battle-p1-btn, .battle-p2-btn').forEach(button => {
      button.classList.remove('selected', 'border-blue-400', 'bg-blue-600', 'border-purple-400', 'bg-purple-600', 'border-green-400', 'bg-green-600', 'border-pink-400', 'bg-pink-600');
    });
  }

  function finalizeBattleVisuals(winnerId, loserId) {
    resetBattleVisualState();
    const winner = document.getElementById(winnerId);
    const loser = document.getElementById(loserId);
    if (!winner || !loser) return;
    winner.classList.add('battle-winner-final');
    loser.classList.add('battle-loser-final');
    const image = winner.querySelector('img[id$="-img"]');
    if (image) image.classList.add('battle-winner-art');
    const label = document.createElement('span');
    label.className = 'battle-winner-label';
    label.textContent = 'WINNER';
    winner.insertBefore(label, image || winner.firstChild);
  }

  const ARENA_TYPE_ICON = { fire:'🔥', water:'💧', grass:'🌿', electric:'⚡', ice:'❄️', fighting:'🥊', poison:'☠️', ground:'⛰️', flying:'🪶', psychic:'🔮', bug:'🐛', rock:'🪨', ghost:'👻', dragon:'🐉', dark:'🌑', steel:'⚙️', fairy:'✨', normal:'⭐' };
  const ARENA_ATTACK_NAME = { fire:'Flame Burst', water:'Aqua Jet', grass:'Leaf Blade', electric:'Thunderbolt', ice:'Ice Beam', fighting:'Power Strike', poison:'Toxic Stinger', ground:'Earth Power', flying:'Air Slash', psychic:'Psybeam', bug:'Bug Buzz', rock:'Rock Blast', ghost:'Shadow Ball', dragon:'Dragon Pulse', dark:'Night Slash', steel:'Metal Claw', fairy:'Dazzling Gleam', normal:'Quick Attack' };
  let arenaSpeed = 1;
  let arenaRound = 1;
  const arenaWait = ms => new Promise(r => setTimeout(r, ms / arenaSpeed));
  function arenaTypes(p) { try { const t = typeof getPokemonTypes === 'function' ? getPokemonTypes(p) : 'normal'; return (Array.isArray(t) ? t : [t]).filter(Boolean).map(x => String(x).toLowerCase()); } catch (e) { return ['normal']; } }
  function arenaEsc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }

  function arenaDecorate(cardId, studentName, pokemon) {
    const card = document.getElementById(cardId); if (!card) return;
    const types = arenaTypes(pokemon);
    card.classList.add('arena-card'); card.dataset.type = types[0] || 'normal'; card.dataset.type2 = types[1] || types[0] || 'normal';
    card.querySelectorAll('.arena-trainer, .arena-types, .arena-pop, .arena-fx').forEach(n => n.remove());
    const student = (typeof allData !== 'undefined' ? allData : []).find(r => r.type === 'student' && r.student_name === studentName);
    const trainer = document.createElement('div'); trainer.className = 'arena-trainer';
    let avatar = '';
    try { avatar = student && typeof gameStudentAvatarMarkup === 'function' ? gameStudentAvatarMarkup(student, 'arena-trainer-avatar') : ''; } catch (e) {}
    trainer.innerHTML = `${avatar || '<span class="arena-trainer-avatar arena-trainer-fallback">🧢</span>'}<span class="arena-trainer-label">Trainer</span>`;
    card.insertBefore(trainer, card.firstChild);
    const badges = document.createElement('div'); badges.className = 'arena-types';
    badges.innerHTML = types.map(t => `<span class="arena-type" data-type="${t}">${ARENA_TYPE_ICON[t] || ''} ${arenaEsc(t === 'unknown' ? 'TYPE UNAVAILABLE' : (typeof titleCasePokemonType === 'function' ? titleCasePokemonType(t) : t))}</span>`).join('');
    const nameEl = card.querySelector('[id$="-pokemon"]'); nameEl?.after(badges);
  }

  function getArenaAttackLayer() {
    const stage = document.getElementById('arena-stage');
    if (!stage) return null;
    let layer = stage.querySelector('.arena-attack-layer');
    if (!layer) { layer = document.createElement('div'); layer.className = 'arena-attack-layer'; layer.setAttribute('aria-hidden', 'true'); stage.appendChild(layer); }
    return { stage, layer };
  }

  function arenaPop(cardId, text, kind) {
    const card = document.getElementById(cardId), image = card?.querySelector('img[id$="-img"]');
    const attack = getArenaAttackLayer();
    if (!card || !image || !attack) return;
    const stageRect = attack.stage.getBoundingClientRect(), imageRect = image.getBoundingClientRect();
    const el = document.createElement('span'); el.className = `arena-pop arena-pop-${kind}`; el.textContent = text;
    el.style.setProperty('--pop-x', `${imageRect.left + imageRect.width / 2 - stageRect.left}px`);
    el.style.top = `${imageRect.top - stageRect.top + imageRect.height * .22}px`;
    attack.layer.appendChild(el); setTimeout(() => el.remove(), 1400);
  }

  function arenaFx(cardId, type) {
    const card = document.getElementById(cardId), image = card?.querySelector('img[id$="-img"]');
    const attack = getArenaAttackLayer();
    if (!card || !image || !attack) return;
    const stageRect = attack.stage.getBoundingClientRect(), imageRect = image.getBoundingClientRect();
    const fx = document.createElement('span'); fx.className = 'arena-fx'; fx.dataset.type = type || 'normal';
    fx.style.left = `${imageRect.left + imageRect.width / 2 - stageRect.left}px`;
    fx.style.top = `${imageRect.top + imageRect.height * .48 - stageRect.top}px`;
    fx.innerHTML = '<i style="--angle:0deg"></i><i style="--angle:60deg"></i><i style="--angle:120deg"></i><i style="--angle:180deg"></i><i style="--angle:240deg"></i><i style="--angle:300deg"></i>'
      + Array.from({ length: 8 }, (_, i) => `<em style="--spark-angle:${i * 45}deg"></em>`).join('');
    attack.layer.appendChild(fx); setTimeout(() => fx.remove(), 850);
    card.classList.remove('battle-impact'); void card.offsetWidth; card.classList.add('battle-impact');
    clearTimeout(card._impactTimer); card._impactTimer = setTimeout(() => card.classList.remove('battle-impact'), 500);
  }

  function arenaLaunchProjectile(fromSide, type, start, end) {
    const attack = getArenaAttackLayer();
    if (!attack) return null;
    const projectile = document.createElement('span');
    projectile.className = 'arena-projectile';
    projectile.dataset.type = type || 'normal';
    projectile.dataset.from = fromSide;
    projectile.setAttribute('aria-hidden', 'true');
    projectile.style.setProperty('--arena-flight-duration', `${480 / arenaSpeed}ms`);
    projectile.style.left = `${start.x}px`; projectile.style.top = `${start.y}px`;
    attack.layer.appendChild(projectile);
    const dx = end.x - start.x, dy = end.y - start.y;
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      projectile.animate([
        { transform: 'translate(-50%,-50%) scale(.22) rotate(-18deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.12) rotate(0)', opacity: 1, offset: .18 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.9) rotate(22deg)`, opacity: 1, offset: .88 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.25) rotate(36deg)`, opacity: 0 }
      ], { duration: 480 / arenaSpeed, easing: 'cubic-bezier(.45,.02,.72,.45)', fill: 'forwards' });
    }
    return projectile;
  }

  function arenaBanner(text, kind = '') {
    const b = document.getElementById('arena-banner'); if (!b) return;
    b.className = `arena-banner is-on ${kind}`; b.textContent = text;
    clearTimeout(b._t); if (kind !== 'is-victory') b._t = setTimeout(() => b.classList.remove('is-on'), 1100 / arenaSpeed);
  }

  async function arenaAttack(fromSide, toSide, attacker, multiplier, dmg) {
    const fromImg = document.getElementById(`battle-${fromSide}-img`), to = `battle-${toSide}`, toImg = document.getElementById(`battle-${toSide}-img`);
    const stage = document.getElementById('arena-stage'), attack = getArenaAttackLayer();
    const type = arenaTypes(attacker)[0] || 'normal';
    const callout = document.getElementById('arena-callout');
    if (callout) callout.textContent = `${attacker.pokemon_name} used ${ARENA_ATTACK_NAME[type] || 'Quick Attack'}!`;
    const windup = `arena-windup-${fromSide}`;
    fromImg?.classList.remove(windup, 'arena-cast');
    toImg?.classList.remove('arena-hit-react');
    if (fromImg) void fromImg.offsetWidth;
    fromImg?.classList.add(windup);
    await arenaWait(180);
    fromImg?.classList.remove(windup);
    fromImg?.classList.add('arena-cast');
    const stageRect = stage?.getBoundingClientRect(), fromRect = fromImg?.getBoundingClientRect(), toRect = toImg?.getBoundingClientRect();
    const point = (rect, direction) => ({ x: rect.left + rect.width / 2 - stageRect.left + direction * Math.min(24, rect.width * .08), y: rect.top + rect.height * .48 - stageRect.top });
    const projectile = stageRect && fromRect && toRect ? arenaLaunchProjectile(fromSide, type, point(fromRect, fromSide === 'left' ? 1 : -1), point(toRect, fromSide === 'left' ? -1 : 1)) : null;
    window.pokeSfx?.play('lunge');
    await arenaWait(480);
    projectile?.remove();
    arenaFx(to, type); window.pokeSfx?.play('hit', type);
    toImg?.classList.add('arena-hit-react');
    arenaPop(to, `-${dmg} HP`, 'dmg');
    if (multiplier > 1) { arenaBanner(`SUPER EFFECTIVE! ×${multiplier.toFixed(1)}`, 'is-super'); window.pokeSfx?.play('superEff'); }
    else if (multiplier < 1) arenaBanner(`RESISTED ×${multiplier.toFixed(1)}`, 'is-resist');
  }

  let arenaProjectorAnchor = null;
  function arenaExitProjector() {
    const area = document.getElementById('battle-area');
    if (!area?.classList.contains('arena-cinema')) return;
    area.classList.remove('arena-cinema');
    if (document.fullscreenElement === area) document.exitFullscreen().catch(() => {});
    if (arenaProjectorAnchor?.parentNode) arenaProjectorAnchor.replaceWith(area);
    arenaProjectorAnchor = null;
    const button = document.getElementById('arena-cinema-btn');
    if (button) { button.textContent = '⛶ Projector'; button.setAttribute('aria-pressed', 'false'); button.focus({ preventScroll: true }); }
  }

  function setupBattle(s1Name, p1, s2Name, p2) {
    resetBattleVisualState();
    battleState = { left: s1Name, right: s2Name, leftPokemon: p1, rightPokemon: p2, running: false };
    const maxHp1 = typeof getMaxHP === 'function' ? getMaxHP(p1) : 100;
    const maxHp2 = typeof getMaxHP === 'function' ? getMaxHP(p2) : 100;
    const currentHp1 = typeof getHealedHP === 'function' ? getHealedHP(p1) : maxHp1;
    const currentHp2 = typeof getHealedHP === 'function' ? getHealedHP(p2) : maxHp2;
    if (!s1Name || !s2Name || !p1 || !p2 || !p1.pokemon_id || !p2.pokemon_id) {
      if (typeof toast === 'function') toast('Select two students and Pokémon before starting the battle.');
      document.getElementById('battle-area')?.classList.add('hidden');
      document.getElementById('manual-select-ui')?.classList.remove('hidden');
      return;
    }
    const leftNameEl = document.getElementById('battle-left-name');
    const leftImgEl = document.getElementById('battle-left-img');
    const leftPokeEl = document.getElementById('battle-left-pokemon');
    const leftHpEl = document.getElementById('battle-left-hp');
    if (leftNameEl) leftNameEl.textContent = s1Name;
    if (leftImgEl) leftImgEl.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p1.pokemon_id}.png`;
    if (leftPokeEl) leftPokeEl.textContent = p1.pokemon_name;
    if (leftHpEl) leftHpEl.textContent = `${currentHp1}/${maxHp1} HP`;
    animateBattleHp('battle-left-hp-bar', currentHp1, maxHp1, 'battle-left');

    const rightNameEl = document.getElementById('battle-right-name');
    const rightImgEl = document.getElementById('battle-right-img');
    const rightPokeEl = document.getElementById('battle-right-pokemon');
    const rightHpEl = document.getElementById('battle-right-hp');
    if (rightNameEl) rightNameEl.textContent = s2Name;
    if (rightImgEl) rightImgEl.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p2.pokemon_id}.png`;
    if (rightPokeEl) rightPokeEl.textContent = p2.pokemon_name;
    if (rightHpEl) rightHpEl.textContent = `${currentHp2}/${maxHp2} HP`;
    animateBattleHp('battle-right-hp-bar', currentHp2, maxHp2, 'battle-right');

    const battleLog = document.getElementById('battle-log');
    if (battleLog) battleLog.innerHTML = '<p class="text-yellow-300 text-sm text-center">Battle started!</p>';
    arenaDecorate('battle-left', s1Name, p1); arenaDecorate('battle-right', s2Name, p2);
    document.getElementById('arena-banner')?.classList.remove('is-on', 'is-victory');
    const arenaStage = document.getElementById('arena-stage');
    const roundBadge = document.getElementById('arena-round-badge');
    const callout = document.getElementById('arena-callout');
    if (roundBadge) roundBadge.textContent = 'READY';
    if (callout) callout.textContent = `${p1.pokemon_name} faces ${p2.pokemon_name}. Let the battle begin!`;
    document.getElementById('arena-new-match-btn')?.classList.add('hidden');
    if (arenaStage) { arenaStage.classList.remove('arena-intro', 'arena-active', 'arena-result'); arenaStage.classList.add('arena-ready'); void arenaStage.offsetWidth; arenaStage.classList.add('arena-intro'); }
    window.pokeSfx?.play('whoosh'); setTimeout(() => window.pokeSfx?.play('vs'), 450);
    document.getElementById('battle-area')?.classList.remove('hidden');
    const startBtn = document.getElementById('start-battle-btn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Start Battle';
    }
  }

  function bindBattleArenaEvents() {
    const manualBtn = document.getElementById('manual-battle-btn');
    if (manualBtn && !manualBtn._arenaBound) {
      manualBtn._arenaBound = true;
      manualBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        resetBattleTabState();
        battleState = { left: null, right: null, leftPokemon: null, rightPokemon: null, running: false };
        document.getElementById('battle-area')?.classList.add('hidden');
        document.getElementById('manual-select-ui')?.classList.remove('hidden');
        populateBattleSelects();
        updateManualBattleStartState();
      });
    }

    const randomBtn = document.getElementById('random-battle-btn');
    if (randomBtn && !randomBtn._arenaBound) {
      randomBtn._arenaBound = true;
      randomBtn.addEventListener('click', () => {
        resetBattleTabState();
        document.getElementById('manual-select-ui')?.classList.add('hidden');
        const students = typeof getStudents === 'function' ? getStudents(navSchool, navClass) : [];
        const eligible = students.filter(s => (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === s.student_name).length > 0);
        if (eligible.length < 2) {
          if (typeof toast === 'function') toast('Need at least 2 students with Pokémon!');
          return;
        }
        const shuffled = eligible.sort(() => Math.random() - 0.5);
        const s1 = shuffled[0]; const s2 = shuffled[1];
        const pokes1 = (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === s1.student_name);
        const pokes2 = (typeof getPokemons === 'function' ? getPokemons() : []).filter(p => p.owner === s2.student_name);
        const p1 = pokes1[Math.floor(Math.random() * pokes1.length)];
        const p2 = pokes2[Math.floor(Math.random() * pokes2.length)];
        document.getElementById('battle-area')?.classList.remove('hidden');
        const sel1 = document.getElementById('battle-selected-s1');
        if (sel1) {
          sel1.textContent = `${s1.student_name} - ${p1.pokemon_name}`;
          sel1.dataset.student = s1.student_name;
          sel1.dataset.pokemonId = p1.__backendId;
        }
        const sel2 = document.getElementById('battle-selected-s2');
        if (sel2) {
          sel2.textContent = `${s2.student_name} - ${p2.pokemon_name}`;
          sel2.dataset.student = s2.student_name;
          sel2.dataset.pokemonId = p2.__backendId;
        }
        setupBattle(s1.student_name, p1, s2.student_name, p2);
      });
    }

    const newMatchBtn = document.getElementById('arena-new-match-btn');
    if (newMatchBtn && !newMatchBtn._arenaBound) {
      newMatchBtn._arenaBound = true;
      newMatchBtn.addEventListener('click', () => document.getElementById('manual-battle-btn')?.click());
    }

    const confirmManualBtn = document.getElementById('confirm-manual-battle');
    if (confirmManualBtn && !confirmManualBtn._arenaBound) {
      confirmManualBtn._arenaBound = true;
      confirmManualBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const start = event.currentTarget;
        if (start.dataset.busy === 'true') return;
        start.dataset.busy = 'true';
        const draft = getManualBattleDraft();
        if (!draft.sideOneStudent || !draft.sideOnePokemon || !draft.sideTwoStudent || !draft.sideTwoPokemon || draft.sideOneStudent === draft.sideTwoStudent) {
          updateManualBattleStartState();
          start.dataset.busy = 'false';
          return;
        }
        resetBattleVisualState();
        battleState = { left: draft.sideOneStudent, right: draft.sideTwoStudent, leftPokemon: draft.sideOnePokemon, rightPokemon: draft.sideTwoPokemon, running: false };
        document.getElementById('manual-select-ui')?.classList.add('hidden');
        setupBattle(draft.sideOneStudent, draft.sideOnePokemon, draft.sideTwoStudent, draft.sideTwoPokemon);
        start.dataset.busy = 'false';
      });
    }

    const speedBtn = document.getElementById('arena-speed-btn');
    if (speedBtn && !speedBtn._arenaBound) {
      speedBtn._arenaBound = true;
      speedBtn.addEventListener('click', e => {
        arenaSpeed = arenaSpeed === 1 ? 2 : 1;
        e.currentTarget.textContent = arenaSpeed === 1 ? '⏩ 1×' : '⏩ 2×';
        e.currentTarget.setAttribute('aria-pressed', String(arenaSpeed === 2));
      });
    }

    const cinemaBtn = document.getElementById('arena-cinema-btn');
    if (cinemaBtn && !cinemaBtn._arenaBound) {
      cinemaBtn._arenaBound = true;
      cinemaBtn.addEventListener('click', async () => {
        const area = document.getElementById('battle-area'); if (!area) return;
        if (area.classList.contains('arena-cinema')) { arenaExitProjector(); return; }
        arenaProjectorAnchor = document.createComment('battle-projector-position');
        area.before(arenaProjectorAnchor); document.body.appendChild(area);
        area.classList.add('arena-cinema');
        const button = document.getElementById('arena-cinema-btn');
        if (button) {
          button.textContent = '✕ Exit projector';
          button.setAttribute('aria-pressed', 'true');
        }
        try { await area.requestFullscreen(); } catch (_) {}
      });
    }

    const startBattleBtn = document.getElementById('start-battle-btn');
    if (startBattleBtn && !startBattleBtn._arenaBound) {
      startBattleBtn._arenaBound = true;
      startBattleBtn.addEventListener('click', async () => {
        if (battleState.running) return;
        battleState.running = true;
        startBattleBtn.disabled = true; startBattleBtn.textContent = 'Battling...';
        document.getElementById('arena-new-match-btn')?.classList.add('hidden');
        ['manual-battle-btn', 'random-battle-btn'].forEach(id => { const modeButton = document.getElementById(id); if (modeButton) modeButton.disabled = true; });
        arenaRound = 1;
        const roundBadge = document.getElementById('arena-round-badge');
        if (roundBadge) roundBadge.textContent = 'ROUND 1';
        const arenaStage = document.getElementById('arena-stage');
        arenaStage?.classList.remove('arena-ready', 'arena-result');
        arenaStage?.classList.add('arena-active');
        const p1 = battleState.leftPokemon;
        const p2 = battleState.rightPokemon;
        const maxHp1 = typeof getMaxHP === 'function' ? getMaxHP(p1) : 100;
        const maxHp2 = typeof getMaxHP === 'function' ? getMaxHP(p2) : 100;
        let hp1 = typeof getHealedHP === 'function' ? getHealedHP(p1) : maxHp1;
        let hp2 = typeof getHealedHP === 'function' ? getHealedHP(p2) : maxHp2;
        const callout = document.getElementById('arena-callout');

        async function turn() {
          const leftImg = document.getElementById('battle-left-img');
          const rightImg = document.getElementById('battle-right-img');
          
          const matchup1 = typeof getTypeEffectiveness === 'function' ? getTypeEffectiveness(arenaTypes(p1), arenaTypes(p2)) : 1;
          const dmg1 = Math.max(1, Math.floor((Math.random() * (p1.pokemon_power || 50) * 0.25 + 3) * matchup1));
          hp2 = Math.max(0, hp2 - dmg1);
          await arenaAttack('left', 'right', p1, matchup1, dmg1);
          if (callout) callout.textContent = `${p1.pokemon_name} hit for ${dmg1} damage${matchup1 > 1 ? ' — super effective!' : matchup1 < 1 ? ' — resisted!' : '.'}`;
          const rightHpEl = document.getElementById('battle-right-hp');
          if (rightHpEl) rightHpEl.textContent = `${hp2}/${maxHp2} HP`;
          animateBattleHp('battle-right-hp-bar', hp2, maxHp2, 'battle-right');
          
          await arenaWait(400);
          rightImg?.classList.remove('arena-hit-react');
          
          if (hp2 <= 0) {
            const bar = document.getElementById('battle-right-hp-bar');
            if (bar) bar.style.background = '#ef4444';
            return 'left';
          }

          await arenaWait(400);

          // Right attacks left
          const matchup2 = typeof getTypeEffectiveness === 'function' ? getTypeEffectiveness(arenaTypes(p2), arenaTypes(p1)) : 1;
          const dmg2 = Math.max(1, Math.floor((Math.random() * (p2.pokemon_power || 50) * 0.25 + 3) * matchup2));
          hp1 = Math.max(0, hp1 - dmg2);
          await arenaAttack('right', 'left', p2, matchup2, dmg2);
          if (callout) callout.textContent = `${p2.pokemon_name} hit for ${dmg2} damage${matchup2 > 1 ? ' — super effective!' : matchup2 < 1 ? ' — resisted!' : '.'}`;
          const leftHpEl = document.getElementById('battle-left-hp');
          if (leftHpEl) leftHpEl.textContent = `${hp1}/${maxHp1} HP`;
          animateBattleHp('battle-left-hp-bar', hp1, maxHp1, 'battle-left');
          
          await arenaWait(400);
          leftImg?.classList.remove('arena-hit-react');
          
          if (hp1 <= 0) {
            const bar = document.getElementById('battle-left-hp-bar');
            if (bar) bar.style.background = '#ef4444';
            return 'right';
          }
          return null;
        }

        let winner = null;
        while (!winner) {
          winner = await turn();
          if (!winner) {
            arenaRound += 1;
            if (roundBadge) roundBadge.textContent = `ROUND ${arenaRound}`;
          }
          await arenaWait(600);
        }

        const loserCard = document.getElementById(winner === 'left' ? 'battle-right' : 'battle-left');
        loserCard?.classList.add('arena-fainting');
        window.pokeSfx?.play('faint');
        await arenaWait(700);
        arenaBanner(`🏆 VICTORY! ${winner === 'left' ? battleState.left : battleState.right}`, 'is-victory');
        if (roundBadge) roundBadge.textContent = 'FINISH';
        if (callout) callout.textContent = `${winner === 'left' ? battleState.left : battleState.right} wins the stadium battle!`;
        window.pokeSfx?.play('fanfare');
        const stage = document.getElementById('arena-stage');
        if (stage) {
          const c = document.createElement('div');
          c.className = 'arena-confetti';
          c.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};--x:${Math.round(Math.random() * 100)}%"></i>`).join('');
          stage.appendChild(c);
          setTimeout(() => c.remove(), 3200);
        }

        // Determine winner and transfer pokemon with reduced HP
        try {
          if (winner === 'left') {
            document.getElementById('battle-left-img')?.classList.add('battle-winner-celebrate');
            const maxHp2 = typeof getMaxHP === 'function' ? getMaxHP(p2) : 100;
            const recoveryHp2 = Math.max(1, Math.floor(maxHp2 * 0.1));
            if (window.dataSdk?.update) {
              await window.dataSdk.update({ ...p1, current_hp: hp1, last_battle_time: new Date().toISOString() });
              await window.dataSdk.update({ ...p2, owner: battleState.left, current_hp: recoveryHp2, last_battle_time: new Date().toISOString(), claimed_via_battle: true });
            }
            if (typeof syncStudentAvatarAfterPokemonLoss === 'function') {
              await syncStudentAvatarAfterPokemonLoss(battleState.right, p2.pokemon_id);
            }
          } else {
            document.getElementById('battle-right-img')?.classList.add('battle-winner-celebrate');
            const maxHp1 = typeof getMaxHP === 'function' ? getMaxHP(p1) : 100;
            const recoveryHp1 = Math.max(1, Math.floor(maxHp1 * 0.1));
            if (window.dataSdk?.update) {
              await window.dataSdk.update({ ...p2, current_hp: hp2, last_battle_time: new Date().toISOString() });
              await window.dataSdk.update({ ...p1, owner: battleState.right, current_hp: recoveryHp1, last_battle_time: new Date().toISOString(), claimed_via_battle: true });
            }
            if (typeof syncStudentAvatarAfterPokemonLoss === 'function') {
              await syncStudentAvatarAfterPokemonLoss(battleState.left, p1.pokemon_id);
            }
          }
        } catch (e) {
          console.warn('[battle-arena] Update error:', e);
        }

        startBattleBtn.textContent = 'Battle Complete!';
        battleState.running = false;
        if (callout) callout.textContent = `${winner === 'left' ? battleState.left : battleState.right} wins! ${winner === 'left' ? p2.pokemon_name : p1.pokemon_name} joins their collection.`;
        finalizeBattleVisuals(winner === 'left' ? 'battle-left' : 'battle-right', winner === 'left' ? 'battle-right' : 'battle-left');
        arenaStage?.classList.remove('arena-active');
        arenaStage?.classList.add('arena-result');
        document.getElementById('arena-new-match-btn')?.classList.remove('hidden');
        ['manual-battle-btn', 'random-battle-btn'].forEach(id => { const modeButton = document.getElementById(id); if (modeButton) modeButton.disabled = false; });
        window.pkRecordWin?.(winner === 'left' ? battleState.left : battleState.right, 'battle_wins');
      });
    }
  }

  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) arenaExitProjector(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') arenaExitProjector(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBattleArenaEvents);
  } else {
    bindBattleArenaEvents();
  }

  // Export on window for outside consumers and class tab navigation
  window.populateBattleSelects = populateBattleSelects;
  window.resetBattleTabState = resetBattleTabState;
  window.setupBattle = setupBattle;
  window.arenaExitProjector = arenaExitProjector;
  window.resetManualBattleStage = resetManualBattleStage;
  window.getManualBattleDraft = getManualBattleDraft;
})();
