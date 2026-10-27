/* Poké Battle: solo vocabulary battle. Student unscrambles words under a 20s timer to
   defeat a wild shop Pokémon; winning sends a teacher-approved claim request. */
(function () {
  const TURN_SECONDS = 20;
  const STUDENT_HP = 100;
  const DODGE_CHANCE = 0.35;
  const RARITY_WEIGHT = { common: 100, uncommon: 45, rare: 15, epic: 6, mythic: 4 };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sprite = (id) => `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${id}.png`;
  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let battle = null;

  function battlePartner(student) {
    if (student.__practice) return null;
    const resolve = (id) => typeof getStudentRecordByStableId === 'function' ? getStudentRecordByStableId(id) : null;
    const identity = (record) => String(record?.__backendId || record?.student_id || '').trim();
    const canonical = resolve(identity(student)) || student;
    const ids = new Set([identity(student), identity(canonical), String(canonical.student_id || '')].filter(Boolean));
    const owned = getPokemons().filter((pokemon) => {
      if (!(Number(pokemon.pokemon_id) > 0)) return false;
      const ownerId = String(pokemon.student_id || pokemon.owner_id || '').trim();
      if (ownerId) return ids.has(ownerId) || ids.has(identity(resolve(ownerId)));
      return normalizeStudentIdentity(pokemon.owner) === normalizeStudentIdentity(canonical.student_name);
    });
    return owned.find((pokemon) => Number(pokemon.pokemon_id) === Number(canonical.avatar_pokemon_id)) || owned[0] || null;
  }

  function classManagersFor(student) {
    const rows = typeof allData !== 'undefined' ? allData : [];
    const school = String(student.school_name || '');
    const className = String(student.class_name || '');
    const cls = rows.find((r) => r.type === 'class' && r.school_name === school && r.class_name === className);
    const names = new Set([cls?.teacher_name, cls?.created_by, cls?.assigned_teacher].filter(Boolean).map(normalizeStudentIdentity));
    const ids = new Set();
    rows.filter((r) => r.type === 'teacher_class_assignment' && r.assigned_school === school && r.assigned_class === className)
      .forEach((r) => { if (r.assigned_teacher_id) ids.add(String(r.assigned_teacher_id)); if (r.assigned_teacher) names.add(normalizeStudentIdentity(r.assigned_teacher)); });
    rows.filter((r) => r.type === 'teacher_school_assignment' && r.assigned_school === school)
      .forEach((r) => { if (r.assigned_teacher_id) ids.add(String(r.assigned_teacher_id)); if (r.assigned_teacher) names.add(normalizeStudentIdentity(r.assigned_teacher)); });
    return getTeachers().filter((teacher) => ids.has(String(teacher.__backendId || '')) || names.has(normalizeStudentIdentity(teacher.teacher_name)));
  }

  function classTeacherFor(student) {
    const teachers = classManagersFor(student);
    const rows = typeof allData !== 'undefined' ? allData : [];
    const cls = rows.find((r) => r.type === 'class' && r.school_name === student.school_name && r.class_name === student.class_name);
    const owner = normalizeStudentIdentity(cls?.teacher_name || cls?.created_by || cls?.assigned_teacher || '');
    return teachers.find((teacher) => normalizeStudentIdentity(teacher.teacher_name) === owner) || teachers[0] || null;
  }

  function pickOpponent(student) {
    const teacher = student && (student.__practice || student.__teacherLed) ? (typeof currentTeacherRec === 'function' ? currentTeacherRec() : null) : null;
    const credits = teacher ? (teacher.teacher_credits === -1 ? Infinity : Number(teacher.teacher_credits || 0)) : Infinity;
    const studentRequestBattle = Boolean(student && !student.__practice && !student.__teacherLed && typeof currentRole !== 'undefined' && currentRole === 'student');
    const catalog = (typeof pokemonCatalog !== 'undefined' && Array.isArray(pokemonCatalog)) ? pokemonCatalog : [];
    const pool = catalog.map((p) => ({
      shop_pokemon_id: Number(p.id), shop_pokemon_name: p.name, shop_pokemon_rarity: String(p.rarity || 'common').toLowerCase(),
      shop_pokemon_price: Number(p.price) || 0, shop_pokemon_power: Number(p.power) || 0, shop_pokemon_hp: Number(p.hp) || 0,
      __backendId: `catalog-${p.id}`,
    })).filter((item) => {
      const rarity = String(item.shop_pokemon_rarity || 'common').toLowerCase();
      if (rarity === 'legendary') return false;
      // Let students play even when teacher credits are low; approval still charges
      // the approving manager and remains pending if they need more credits.
      return studentRequestBattle || Number(item.shop_pokemon_price || 0) <= credits;
    });
    if (!pool.length) return null;
    const weighted = [];
    pool.forEach((item) => {
      const rarity = String(item.shop_pokemon_rarity || 'common').toLowerCase();
      const weight = RARITY_WEIGHT[rarity] ?? 30;
      for (let i = 0; i < weight; i += 5) weighted.push(item);
    });
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  function scrambleWord(word) {
    const letters = word.split('');
    if (letters.length < 2) return letters;
    for (let attempt = 0; attempt < 12; attempt++) {
      const copy = [...letters];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      if (copy.join('') !== word) return copy;
    }
    return letters.reverse();
  }

  function hpClass(ratio) { return ratio > 0.5 ? '' : ratio > 0.25 ? 'vb-mid' : 'vb-low'; }

  function renderHp(el, current, max) {
    if (!el) return;
    const ratio = Math.max(0, Math.min(1, current / max));
    const fill = el.querySelector('.vb-hp-fill');
    const track = el.querySelector('.vb-hp-track');
    const number = el.querySelector('.vb-hp-num');
    if (!fill || !track || !number) return;
    let trail = track.querySelector('.vb-hp-trail');
    if (!trail) { trail = document.createElement('div'); trail.className = 'vb-hp-trail'; track.prepend(trail); }
    const before = Number(el.dataset.hp ?? current);
    el.dataset.hp = String(current);
    cancelAnimationFrame(el._hpFrame);
    trail.style.width = `${Math.max(0, before / max) * 100}%`;
    fill.style.width = `${ratio * 100}%`;
    fill.className = `vb-hp-fill ${hpClass(ratio)}`;
    el.classList.toggle('vb-hp-critical', ratio <= .25 && current > 0);
    el.classList.remove('vb-hp-loss');
    if (before > current) { void el.offsetWidth; el.classList.add('vb-hp-loss'); }
    const started = performance.now();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    function count(now) {
      if (!el.isConnected) return;
      const progress = duration ? Math.min(1, (now - started) / duration) : 1;
      number.textContent = `${Math.max(0, Math.round(before + (current - before) * progress))}/${max}`;
      if (progress < 1) el._hpFrame = requestAnimationFrame(count);
    }
    el._hpFrame = requestAnimationFrame(count);
    requestAnimationFrame(() => { if (trail.isConnected) trail.style.width = `${ratio * 100}%`; });
  }

  function setMessage(text) { const m = battle?.root.querySelector('.vb-message'); if (m) m.textContent = text; }

  function floatDamage(text, targetEl, kind) {
    if (!battle || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const tag = document.createElement('span');
    tag.className = `vb-damage ${kind}`;
    tag.textContent = text;
    tag.style.left = `${rect.left + rect.width / 2}px`;
    tag.style.top = `${rect.top + rect.height * .35}px`;
    (battle.root || document.body).appendChild(tag);
    setTimeout(() => tag.remove(), 1400);
  }

  function later(callback, delay) {
    const active = battle;
    const id = setTimeout(() => { active?.timeouts.delete(id); if (battle === active) callback(); }, delay);
    active?.timeouts.add(id);
  }

  function animateAttack(retaliation, dodged, impact) {
    const active = battle;
    if (!active) return;
    const root = active.root;
    const source = root.querySelector(retaliation ? '.vb-foe-art' : '.vb-me-art') || root.querySelector('.vb-slots');
    const target = root.querySelector(retaliation ? '.vb-me-art' : '.vb-foe-art') || root.querySelector('.vb-me');
    if (!source || !target) { impact(); return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const attacker = retaliation ? active.foe : active.partner;
    let attackType = 'fire';
    try {
      const id = Number(attacker?.pokemon_id || attacker?.shop_pokemon_id);
      const resolved = typeof getPokemonTypes === 'function' ? getPokemonTypes({ pokemon_id: id }) : [];
      if (Array.isArray(resolved) && resolved.length && resolved[0] !== 'unknown') attackType = String(resolved[0]).toLowerCase();
    } catch (_) { /* Use the familiar fire attack when type data is unavailable. */ }
    window.pokeSfx?.play('lunge');
    const layer = document.createElement('div');
    layer.className = `vb-attack-layer vb-fire vb-element${retaliation ? ' vb-counter' : ''}`;
    layer.dataset.type = attackType;
    layer.setAttribute('aria-hidden', 'true');
    const container = root.querySelector('.vb-arena') || root;
    container.appendChild(layer);
    const bounds = container.getBoundingClientRect();
    const a = source.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const start = { x: a.left + a.width / 2 - bounds.left, y: a.top + a.height / 2 - bounds.top };
    const end = { x: b.left + b.width / 2 - bounds.left, y: b.top + b.height / 2 - bounds.top };
    const bolt = document.createElement('i'); bolt.className = 'vb-energy-bolt';
    bolt.style.left = `${start.x}px`; bolt.style.top = `${start.y}px`; layer.appendChild(bolt);
    const travel = reduced ? 0 : 420;
    if (!reduced) {
      try {
        source.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: .5 }, { transform: 'scale(1)' }], { duration: 260 });
        bolt.animate([
          { transform: 'translate(-50%, -50%) scale(.2)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: .2 },
          { transform: `translate(calc(-50% + ${end.x - start.x}px), calc(-50% + ${end.y - start.y}px)) scale(.8)`, opacity: 1 },
        ], { duration: travel, easing: 'cubic-bezier(.5,0,.85,.5)', fill: 'forwards' });
      } catch (_) {}
    }
    later(() => {
      try {
        bolt.remove();
        if (dodged) {
          window.pokeSfx?.play('whoosh');
          target.classList.add('vb-dodge');
          floatDamage('DODGED', target, 'vb-dmg-dodge');
          later(() => target.classList.remove('vb-dodge'), 650);
        } else {
          window.pokeSfx?.play('hit', attackType);
          const burst = document.createElement('div'); burst.className = 'vb-impact-burst';
          burst.style.left = `${end.x}px`; burst.style.top = `${end.y}px`;
          burst.innerHTML = '<b></b>' + Array.from({ length: 10 }, (_, i) => `<i style="--spark-angle:${i * 36}deg"></i>`).join('')
            + Array.from({ length: 7 }, (_, i) => `<em class="vb-ember" style="--ember-angle:${i * 51 + 12}deg;--ember-delay:${i * 45}ms"></em>`).join('');
          layer.appendChild(burst);
          target.classList.add('vb-hit');
          later(() => target.classList.remove('vb-hit'), 600);
        }
      } catch (err) {
        console.warn('Attack visual effect error:', err);
      }
      try {
        impact();
      } catch (err) {
        console.error('Attack impact error:', err);
      } finally {
        later(() => layer.remove(), 900);
      }
    }, travel);
  }

  function stopTimer() {
    if (battle?.timerId) { clearInterval(battle.timerId); battle.timerId = null; }
  }

  function startTurn() {
    if (!battle) return;
    stopTimer();
    battle.resolving = false;
    if (!battle.queue.length) battle.queue = [...battle.words].sort(() => Math.random() - 0.5);
    const entry = battle.queue.shift();
    const word = String(entry.vocab_word || '').trim();
    battle.currentWord = word;
    battle.slots = new Array(word.length).fill(null);
    battle.tiles = scrambleWord(word.toLowerCase()).map((letter, i) => ({ letter, used: false, key: i }));
    const price = Math.max(0, Number(battle.foe.shop_pokemon_price) || 0);
    const catalog = (typeof pokemonCatalog !== 'undefined' && Array.isArray(pokemonCatalog)) ? pokemonCatalog : [];
    const maxPrice = Math.max(200, ...catalog.map((pokemon) => Number(pokemon.price) || 0));
    const difficulty = Math.max(0, Math.min(1, price / maxPrice));
    const wordBonus = Math.min(4, Math.floor(word.length / 3));
    battle.turnSeconds = Math.max(8, 18 - Math.round(difficulty * 8) + wordBonus + rand(-1, 1));
    battle.deadline = Date.now() + battle.turnSeconds * 1000;
    renderWord();
    battle.timerId = setInterval(tickTimer, 100);
    tickTimer();
  }

  function tickTimer() {
    if (!battle) return;
    const left = Math.max(0, battle.deadline - Date.now());
    const ratio = left / ((battle.turnSeconds || TURN_SECONDS) * 1000);
    const fill = battle.root.querySelector('.vb-timer-fill');
    const text = battle.root.querySelector('.vb-timer-text');
    if (fill) { fill.style.width = `${ratio * 100}%`; fill.classList.toggle('vb-urgent', ratio < 0.3); }
    if (text) text.textContent = `${Math.ceil(left / 1000)}s`;
    if (left <= 0) { stopTimer(); onFail('⏰ Time ran out!'); }
  }

  function renderWord() {
    const slotsEl = battle.root.querySelector('.vb-slots');
    const tilesEl = battle.root.querySelector('.vb-tiles');
    slotsEl.innerHTML = battle.slots.map((letter, i) => `<button type="button" class="vb-slot${letter ? ' is-filled' : ''}" data-slot="${i}" aria-label="Letter slot ${i + 1}">${letter ? esc(letter) : ''}</button>`).join('');
    tilesEl.innerHTML = battle.tiles.map((tile) => `<button type="button" class="vb-tile" data-tile="${tile.key}" ${tile.used ? 'disabled' : ''} aria-label="Letter ${esc(tile.letter)}">${esc(tile.letter)}</button>`).join('');
  }

  function fillNextSlot(tileKey) {
    if (battle.resolving) return;
    const tile = battle.tiles.find((t) => t.key === tileKey);
    const idx = battle.slots.indexOf(null);
    if (!tile || tile.used || idx < 0) return;
    tile.used = true;
    tile._slot = idx;
    battle.slots[idx] = tile.letter;
    renderWord();
    if (!battle.slots.includes(null)) checkAnswer();
  }

  function clearSlot(slotIdx) {
    if (battle.resolving) return;
    const letter = battle.slots[slotIdx];
    if (!letter) return;
    const tile = battle.tiles.find((t) => t.used && t._slot === slotIdx);
    battle.slots[slotIdx] = null;
    if (tile) { tile.used = false; delete tile._slot; }
    renderWord();
  }

  function checkAnswer() {
    const guess = battle.slots.join('');
    if (guess.toLowerCase() === battle.currentWord.toLowerCase()) onSuccess();
    else {
      battle.root.querySelectorAll('.vb-slot').forEach((s) => s.classList.add('vb-wrong'));
      onFail('❌ Wrong answer!');
    }
  }

  function onSuccess() {
    stopTimer();
    battle.resolving = true;
    battle.failStreak = 0;
    const foeArt = battle.root.querySelector('.vb-foe-art');
    if (Math.random() < DODGE_CHANCE) {
      setMessage('Attack incoming!');
      return animateAttack(false, true, () => {
        setMessage(`${battle.foe.shop_pokemon_name} dodged the attack!`);
        scheduleNext(1000);
      });
    }
    const damage = 6 + battle.currentWord.length + rand(0, 4);
    setMessage('Correct! Energy strike!');
    animateAttack(false, false, () => {
      battle.foeHp = Math.max(0, battle.foeHp - damage);
      renderHp(battle.root.querySelector('.vb-foe-hp'), battle.foeHp, battle.foeMaxHp);
      floatDamage(`−${damage}`, foeArt, 'vb-dmg-foe');
      setMessage(`You hit ${battle.foe.shop_pokemon_name} for ${damage}!`);
      if (battle.foeHp <= 0) {
        later(() => foeArt?.classList.add('vb-faint'), 600);
        return later(() => endBattle(true), 1500);
      }
      scheduleNext(1300);
    });
  }

  function onFail(reason) {
    stopTimer();
    battle.resolving = true;
    const price = Math.max(0, Number(battle.foe.shop_pokemon_price) || 0);
    const catalog = (typeof pokemonCatalog !== 'undefined' && Array.isArray(pokemonCatalog)) ? pokemonCatalog : [];
    const maxPrice = Math.max(200, ...catalog.map((pokemon) => Number(pokemon.price) || 0));
    const difficulty = Math.max(0, Math.min(1, price / maxPrice));
    const damage = rand(4, 7) + Math.round(difficulty * 6) + battle.failStreak * 2;
    battle.failStreak += 1;
    const meEl = battle.root.querySelector('.vb-me');
    setMessage(`${reason} ${battle.foe.shop_pokemon_name} is charging an attack!`);
    animateAttack(true, false, () => {
      battle.studentHp = Math.max(0, battle.studentHp - damage);
      renderHp(battle.root.querySelector('.vb-me-hp'), battle.studentHp, STUDENT_HP);
      floatDamage(`−${damage}`, meEl, 'vb-dmg-me');
      setMessage(`${battle.foe.shop_pokemon_name} strikes back for ${damage}! The word was "${battle.currentWord}".`);
      if (battle.studentHp <= 0) return later(() => endBattle(false), 1400);
      scheduleNext(1700);
    });
  }

  function scheduleNext(delay) { later(() => { if (!battle.over) startTurn(); }, delay); }

  async function logBattle(outcome) {
    try {
      await window.dataSdk.create({
        type: 'battle_log', outcome, student_id: battle.studentId, student_name: battle.student.student_name,
        school_name: battle.student.school_name || '', class_name: battle.student.class_name || '',
        pokemon_id: Number(battle.foe.shop_pokemon_id), pokemon_name: battle.foe.shop_pokemon_name,
        pokemon_rarity: battle.foe.shop_pokemon_rarity || '', pokemon_price: Number(battle.foe.shop_pokemon_price) || 0,
        student_hp_left: battle.studentHp, foe_hp_left: battle.foeHp, created_at: new Date().toISOString(),
      });
    } catch (e) { /* logging must never break the game */ }
  }

  function endBattle(won) {
    battle.over = true;
    stopTimer();
    if (!battle.student.__practice) logBattle(won ? 'win' : 'loss');
    const arena = battle.root.querySelector('.vb-arena');
    const foe = battle.foe;
    if (won) battle.root.querySelector('.vb-foe-art')?.classList.add('vb-faint');
    arena.innerHTML = `
      <div class="vb-result">
        <img class="vb-result-art" src="${sprite(foe.shop_pokemon_id)}" alt="${esc(foe.shop_pokemon_name)}">
        <h2 class="vb-result-title ${won ? 'vb-win' : 'vb-lose'}">${won ? '🏆 Victory!' : '💫 You fainted…'}</h2>
        <p class="vb-result-sub">${won
          ? battle.student.__teacherLed ? `${esc(battle.student.student_name)} defeated ${esc(foe.shop_pokemon_name)}! Approve to add it to their collection for ${Number(foe.shop_pokemon_price) || 0} of your credits, or deny.` : battle.student.__practice ? `Practice win against ${esc(foe.shop_pokemon_name)}! Nothing is claimed or charged in teacher practice.` : `You defeated ${esc(foe.shop_pokemon_name)}! Ask your teacher to approve the claim and it joins your collection for ${Number(foe.shop_pokemon_price) || 0} credits.`
          : `${esc(foe.shop_pokemon_name)} was too strong this time. Train your words and try again!`}</p>
        <div class="vb-result-actions">
          ${won && battle.student.__teacherLed ? `<button type="button" class="vb-btn" data-vb="approve">✅ Approve · ${Number(foe.shop_pokemon_price) || 0} credits</button><button type="button" class="vb-btn vb-btn-ghost" data-vb="deny">✕ Deny</button>` : won && battle.student.__practice ? `<button type="button" class="vb-btn" data-vb="retry">⚔️ Practice again</button>` : won ? `<button type="button" class="vb-btn" data-vb="claim">🎁 Request claim</button>` : `<button type="button" class="vb-btn" data-vb="retry">⚔️ Battle again</button>`}
          <button type="button" class="vb-btn vb-btn-ghost" data-vb="close">${won ? (battle.student.__teacherLed ? 'Close' : 'Maybe later') : 'Back to games'}</button>
        </div>
      </div>`;
  }

  async function requestClaim(button) {
    if (!battle || battle.claimed || battle.claimSending) return;
    battle.claimSending = true;
    const foe = battle.foe;
    const existing = allData.find((r) => r.type === 'battle_claim' && r.status === 'pending' && r.student_id === battle.studentId && String(r.shop_record_id) === String(foe.__backendId));
    if (existing) { toast('Your teacher already has this claim request.'); battle.claimed = true; button.disabled = true; return; }
    button.disabled = true;
    button.textContent = 'Sending…';
    const teacher = classTeacherFor(battle.student);
    const result = await window.dataSdk.create({
      type: 'battle_claim', status: 'pending',
      claim_id: `claim-${battle.studentId}-${foe.__backendId}-${Date.now()}`,
      student_id: battle.studentId, student_name: battle.student.student_name,
      school_name: battle.student.school_name || '', class_name: battle.student.class_name || '',
      teacher_name: teacher?.teacher_name || '', shop_record_id: String(foe.__backendId),
      pokemon_id: Number(foe.shop_pokemon_id), pokemon_name: foe.shop_pokemon_name,
      pokemon_rarity: foe.shop_pokemon_rarity || '', pokemon_price: Number(foe.shop_pokemon_price) || 0,
      pokemon_power: Number(foe.shop_pokemon_power) || 0, created_at: new Date().toISOString(),
    });
    if (!result?.isOk) { battle.claimSending = false; button.disabled = false; button.textContent = '🎁 Request claim'; toast('Could not send the claim. Try again.'); return; }
    const saved = result.data || result;
    const claimId = saved?.__backendId || saved?.id;
    if (claimId) {
      const local = allData.find((r) => r.type === 'battle_claim' && r.student_id === battle.studentId && String(r.shop_record_id) === String(foe.__backendId) && r.status === 'pending' && !r.__backendId);
      if (local) local.__backendId = claimId;
    }
    battle.claimed = true;
    button.textContent = '✓ Sent to your teacher';
    await window.sendTeacherNotifications?.(classManagersFor(battle.student), 'Battle claim needs review', `${battle.student.student_name} won ${foe.shop_pokemon_name} in ${battle.student.class_name || 'their class'} and is waiting for an approval decision.`, 'battle', { target: 'battle-claims' });
    toast('Claim sent! Your teacher will review it.');
  }

  async function teacherDecide(approve, button) {
    if (!battle || battle.claimed || battle.claimSending) return;
    battle.claimSending = true;
    const actions = battle.root.querySelectorAll('[data-vb="approve"],[data-vb="deny"]');
    actions.forEach((b) => { b.disabled = true; });
    if (!approve) {
      battle.claimed = true;
      button.textContent = 'Denied';
      toast(`Claim denied. ${battle.foe.shop_pokemon_name} stays in the shop.`);
      return;
    }
    const foe = battle.foe;
    const s = battle.student;
    const claimId = `claim-${battle.studentId}-${foe.__backendId}-${Date.now()}`;
    const result = await window.dataSdk.create({
      type: 'battle_claim', status: 'pending', claim_id: claimId,
      student_id: battle.studentId, student_name: s.student_name,
      school_name: s.school_name || '', class_name: s.class_name || '',
      teacher_name: currentTeacher || '', shop_record_id: String(foe.__backendId),
      pokemon_id: Number(foe.shop_pokemon_id), pokemon_name: foe.shop_pokemon_name,
      pokemon_rarity: foe.shop_pokemon_rarity || '', pokemon_price: Number(foe.shop_pokemon_price) || 0,
      pokemon_power: Number(foe.shop_pokemon_power) || 0, created_at: new Date().toISOString(),
    });
    if (!result?.isOk) { battle.claimSending = false; actions.forEach((b) => { b.disabled = false; }); toast('Could not save. Try again.'); return; }
    const saved = result.data || result;
    if (!allData.some((r) => r.type === 'battle_claim' && r.claim_id === claimId)) allData.push({ ...saved });
    const ok = await approveClaim(claimId);
    if (ok) { battle.claimed = true; button.textContent = '✓ Approved'; }
    else { battle.claimSending = false; actions.forEach((b) => { b.disabled = false; }); }
  }

  function openPlayerPicker(listName) {
    const school = typeof navSchool !== 'undefined' ? navSchool : '';
    const cls = typeof navClass !== 'undefined' ? navClass : '';
    const seen = new Set();
    const roster = (school && cls && typeof getStudents === 'function' ? getStudents(school, cls) : []).filter((st) => {
      const k = String(st.__backendId || st.student_name);
      if (!st.student_name || seen.has(k)) return false;
      seen.add(k); return true;
    }).sort((a, b) => String(a.student_name).localeCompare(String(b.student_name)));
    const root = document.createElement('div');
    root.className = 'vb-stage vb-picker-stage';
    root.dataset.inGamesHub = 'true';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Choose a player');
    const selectedThemeId = window.gaGetTheme?.() || 'classroom';
    const themes = window.gaThemes || [];
    const selectedTheme = themes.find(t => t.id === selectedThemeId) || { name: 'Classroom', subtitle: 'Poké Academy & chalkboard' };
    root.innerHTML = `
      <header class="vb-head"><span class="vb-title">⚔️ Choose who battles</span><button type="button" class="vb-close" data-pick="close">✕ Close</button></header>
      <div class="vb-picker">
        <p class="vb-picker-sub">${roster.length ? `Students in ${esc(cls)}. If they win, you approve or deny the Pokémon (your credits pay for it).` : 'No students in the current class. Open a class first, or practise on your own.'}</p>
        ${typeof window.renderThemeCardsMarkup === 'function' ? `<div class="ga-theme-picker ga-round-setting" aria-label="Visual style" style="margin: 12px 0 16px;"><div class="ga-theme-picker-head"><h3>Visual style</h3><span class="ga-theme-active-label">${esc(selectedTheme.name)} · ${esc(selectedTheme.subtitle)}</span></div><div class="ga-theme-grid ga-theme-grid-compact" role="radiogroup" aria-label="Choose visual style">${window.renderThemeCardsMarkup(selectedThemeId)}</div></div>` : ''}
        <div class="vb-picker-grid">${roster.map((st, i) => `<button type="button" class="vb-picker-btn" data-pick="${i}">${esc(st.student_name)}</button>`).join('')}</div>
        <button type="button" class="vb-btn vb-btn-ghost" data-pick="practice">Practise myself (no claim)</button>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener('click', (e) => {
      const card = e.target.closest('[data-ga-theme-choice]');
      if (card) {
        window.gaSetTheme?.(card.dataset.gaThemeChoice);
        return;
      }
      const b = e.target.closest('[data-pick]');
      if (!b) return;
      const v = b.dataset.pick;
      root.remove();
      if (v === 'close') return;
      if (v === 'practice') return launchBattle(listName, { student_name: 'Teacher practice', __practice: true });
      const st = roster[Number(v)];
      launchBattle(listName, { ...st, school_name: st.school_name || school, class_name: st.class_name || cls, __teacherLed: true });
    });
  }

  function closeBattle() {
    if (!battle) return;
    stopTimer();
    battle.timeouts.forEach(clearTimeout);
    battle.root.querySelectorAll('.vb-hp').forEach((el) => cancelAnimationFrame(el._hpFrame));
    document.querySelectorAll('.vb-attack-layer, .vb-damage').forEach((el) => el.remove());
    battle.root.remove();
    battle = null;
  }
  window.closeVocabBattle = closeBattle;

  window.startVocabBattle = function startVocabBattle(listName, studentRecord) {
    if (!window.canUseProGames?.()) { window.requireProGame?.('Poké Battle'); return; }
    if (studentRecord) {
      return launchBattle(listName, studentRecord);
    }
    if (currentRole !== 'student') {
      const activeStudent = (typeof activeGamePlayers !== 'undefined' && activeGamePlayers?.[0]) ? activeGamePlayers[0] : null;
      if (activeStudent) {
        return launchBattle(listName, { ...activeStudent, school_name: activeStudent.school_name || (typeof navSchool !== 'undefined' ? navSchool : ''), class_name: activeStudent.class_name || (typeof navClass !== 'undefined' ? navClass : ''), __teacherLed: true });
      }
      return openPlayerPicker(listName);
    }
    const student = ((typeof getStudentRecordByStableId === 'function' && currentStudentRecordId && getStudentRecordByStableId(currentStudentRecordId))
      || getAllStudents().find((s) => s.student_name === currentStudent));
    if (!student) { toast('Signed-in student was not found.'); return; }
    // Do not inherit a teacher's cross-list mode or pass through generic multiplayer setup.
    selectedGameSource = 'class';
    selectedGameSession = null;
    // The selected list may belong to one of this student's other enrolled classes.
    const battleStudent = { ...student, school_name: navSchool || student.school_name || '', class_name: navClass || student.class_name || '' };
    // Students always battle with every list available in their current class.
    const classLists = (typeof getVocabLists === 'function' ? getVocabLists(battleStudent.school_name, battleStudent.class_name) : []).map((l) => l.vocab_list_name).filter(Boolean);
    navSchool = battleStudent.school_name; navClass = battleStudent.class_name;
    launchBattle(classLists.length ? classLists : listName, battleStudent);
  };

  function launchBattle(listName, student) {
    const words = getGameWords(listName).filter((w) => String(w.vocab_word || '').trim().length >= 2);
    if (!words.length) { toast('This list has no battle-ready words yet.'); return; }
    const foe = pickOpponent(student);
    if (!foe) { toast('No affordable Pokémon in the shop right now. Ask your teacher to stock the shop!'); return; }
    closeBattle();
    const root = document.createElement('div');
    root.className = 'vb-stage ga-stage';
    root.dataset.inGamesHub = 'true';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Poké Battle');
    const foeMaxHp = Number(foe.shop_pokemon_hp) || (Number(foe.shop_pokemon_power) || 20) + 30;
    const partner = battlePartner(student);
    root.innerHTML = `
      <main class="vb-shell">
        <header class="vb-head"><div class="vb-title-wrap"><span class="vb-pro-pill">👑 PRO ARENA</span><span class="vb-title">⚔️ Poké Battle</span></div><button type="button" class="vb-close" data-vb="close">✕ Leave battle</button></header>
        <div class="vb-arena">
          <div class="vb-hud">
            <div class="vb-hud-side vb-hud-me"><p class="vb-hud-name">${esc(student.student_name)}</p><div class="vb-hp vb-me-hp"><div class="vb-hp-label"><span>HP</span><span class="vb-hp-num"></span></div><div class="vb-hp-track"><div class="vb-hp-fill"></div></div></div></div>
            <span class="vb-hud-vs" aria-hidden="true">VS</span>
            <div class="vb-hud-side vb-hud-foe"><p class="vb-hud-name">${esc(foe.shop_pokemon_name)}</p><div class="vb-hp vb-foe-hp"><div class="vb-hp-label"><span class="vb-hp-num"></span><span>HP</span></div><div class="vb-hp-track"><div class="vb-hp-fill"></div></div></div></div>
          </div>
          <div class="vb-matchup">
          <div class="vb-me">
            ${partner ? `<img class="vb-me-art" src="${sprite(Number(partner.pokemon_id))}" alt="${esc(student.student_name)}'s ${esc(partner.pokemon_name)}"><p class="vb-partner-name">${esc(partner.pokemon_name || `Pokémon ${partner.pokemon_id}`)}</p>` : '<span class="vb-me-art vb-trainer-fallback" role="img" aria-label="Trainer">' + esc(String(student.student_name || '?').charAt(0).toUpperCase()) + '</span>'}
            <p class="vb-me-name">${esc(student.student_name)}</p>
          </div>
          <span class="vb-versus" aria-hidden="true">VS</span>
          <div class="vb-foe">
            <img class="vb-foe-art" src="${sprite(foe.shop_pokemon_id)}" alt="Wild ${esc(foe.shop_pokemon_name)}">
            <p class="vb-foe-name">Wild ${esc(foe.shop_pokemon_name)}</p>
            <p class="vb-foe-rarity">${esc(foe.shop_pokemon_rarity || 'common')} · wins cost ${Number(foe.shop_pokemon_price) || 0} credits</p>
          </div>
          </div>
          <p class="vb-message" aria-live="polite">Unscramble the word to attack!</p>
          <div class="vb-timer"><div class="vb-timer-track"><div class="vb-timer-fill"></div></div><p class="vb-timer-text"></p></div>
          <div class="vb-word"><div class="vb-slots"></div><div class="vb-tiles"></div></div>
        </div>
      </main>`;
    document.body.appendChild(root);
    battle = {
      root, student, partner, studentId: String(student.__teacherLed ? (student.__backendId || '') : (currentStudentRecordId || student.__backendId || '')),
      foe, foeMaxHp, foeHp: foeMaxHp, studentHp: STUDENT_HP,
      words, queue: [], failStreak: 0, over: false, claimed: false, timerId: null, resolving: false, timeouts: new Set(),
    };
    renderHp(root.querySelector('.vb-foe-hp'), battle.foeHp, foeMaxHp);
    renderHp(root.querySelector('.vb-me-hp'), STUDENT_HP, STUDENT_HP);
    window.gaMountStage?.(root);
    root.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn || !battle) return;
      if (btn.dataset.vb === 'close') {
        closeBattle();
        if (typeof endActiveGames === 'function') endActiveGames();
        return;
      }
      if (btn.dataset.vb === 'claim') return requestClaim(btn);
      if (btn.dataset.vb === 'approve') return teacherDecide(true, btn);
      if (btn.dataset.vb === 'deny') return teacherDecide(false, btn);
      if (btn.dataset.vb === 'retry') { closeBattle(); if (student.__practice) launchBattle(listName, student); else window.startVocabBattle(listName); return; }
      if (btn.dataset.tile !== undefined && !battle.over) return fillNextSlot(Number(btn.dataset.tile));
      if (btn.dataset.slot !== undefined && !battle.over) return clearSlot(Number(btn.dataset.slot));
    });
    startTurn();
  }

  /* ---- Teacher: claim approvals & history ---- */
  let battleClaimsActiveTab = 'pending';

  function myPendingClaims() {
    const claims = allData.filter((r) => r.type === 'battle_claim' && r.status === 'pending');
    if (typeof canAccessAdmin === 'function' && canAccessAdmin()) return claims;
    const me = normalizeStudentIdentity(currentTeacher || '');
    return claims.filter((c) => normalizeStudentIdentity(c.teacher_name || '') === me
      || (typeof canManageClass === 'function' && canManageClass(c.school_name || '', c.class_name || '')));
  }

  function myApprovedClaims() {
    const claims = allData.filter((r) => r.type === 'battle_claim' && r.status === 'approved');
    const filtered = (typeof canAccessAdmin === 'function' && canAccessAdmin())
      ? claims
      : claims.filter((c) => {
          const me = normalizeStudentIdentity(currentTeacher || '');
          return normalizeStudentIdentity(c.teacher_name || '') === me
            || normalizeStudentIdentity(c.resolved_by || '') === me
            || (typeof canManageClass === 'function' && canManageClass(c.school_name || '', c.class_name || ''));
        });
    return filtered.slice().sort((a, b) => new Date(b.resolved_at || b.created_at || 0) - new Date(a.resolved_at || a.created_at || 0));
  }

  function formatApprovalTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function renderStudentAvatar(c) {
    const student = (allData || []).find((r) => r.type === 'student' && (String(r.__backendId) === String(c.student_id) || r.student_name === c.student_name));
    const avatarId = student?.avatar_pokemon_id;
    if (avatarId && Number(avatarId) > 0) {
      return `<img src="${sprite(avatarId)}" alt="" class="vb-student-avatar-img w-9 h-9 rounded-full bg-slate-800 object-contain p-0.5 border border-slate-700/80 flex-shrink-0" loading="lazy">`;
    }
    const initial = (c.student_name ? c.student_name[0] : 'S').toUpperCase();
    return `<div class="vb-student-avatar-fallback w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0 select-none">${initial}</div>`;
  }

  window.renderBattleClaims = function () {
    const panel = document.getElementById('battle-claims-list');
    if (!panel) return;
    const pending = myPendingClaims();
    const approved = myApprovedClaims();

    // Sync tab buttons and badge in the header
    const pendingTab = document.getElementById('battle-claims-tab-pending');
    const historyTab = document.getElementById('battle-claims-tab-history');
    const badge = document.getElementById('battle-claims-pending-count');
    if (badge) badge.textContent = pending.length;

    if (pendingTab && historyTab) {
      const isPending = battleClaimsActiveTab === 'pending';
      pendingTab.classList.toggle('is-active', isPending);
      pendingTab.setAttribute('aria-selected', String(isPending));
      historyTab.classList.toggle('is-active', !isPending);
      historyTab.setAttribute('aria-selected', String(!isPending));

      if (!pendingTab.dataset.bound) {
        pendingTab.dataset.bound = 'true';
        pendingTab.addEventListener('click', () => {
          battleClaimsActiveTab = 'pending';
          renderBattleClaims();
        });
      }
      if (!historyTab.dataset.bound) {
        historyTab.dataset.bound = 'true';
        historyTab.addEventListener('click', () => {
          battleClaimsActiveTab = 'history';
          renderBattleClaims();
        });
      }
    }

    if (battleClaimsActiveTab === 'history') {
      panel.innerHTML = `<div class="vb-claims">${approved.length ? approved.map((c) => `
        <article class="vb-claim vb-claim-history">
          <div class="vb-claim-student flex items-center gap-3">
            ${renderStudentAvatar(c)}
            <div>
              <strong class="vb-claim-student-name font-bold text-sm text-white block">${esc(c.student_name)}</strong>
              <span class="vb-claim-meta text-xs text-slate-400 block">${esc(c.class_name || '')}${c.school_name ? ' · ' + esc(c.school_name) : ''}</span>
            </div>
          </div>
          <div class="vb-claim-reward flex items-center gap-3">
            <img class="vb-claim-art w-10 h-10 object-contain rounded-lg bg-slate-800/80 p-1 border border-slate-700/60 flex-shrink-0" src="${sprite(c.pokemon_id)}" alt="${esc(c.pokemon_name)}" loading="lazy">
            <div>
              <strong class="vb-claim-pokemon-name font-bold text-sm text-slate-200 block">${esc(c.pokemon_name)}</strong>
              <span class="vb-claim-meta text-xs text-slate-400 block capitalize">${esc(c.pokemon_rarity || 'common')} · ${Number(c.pokemon_price) || 0} credits</span>
            </div>
          </div>
          <div class="vb-claim-history-status flex items-center justify-between md:justify-end gap-3 flex-wrap">
            <span class="vb-claim-time text-xs text-slate-400 font-medium">${formatApprovalTime(c.resolved_at || c.created_at)}</span>
            <span class="vb-claim-status-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Approved
            </span>
          </div>
        </article>`).join('') : `
        <div class="vb-claims-empty">
          <svg class="vb-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p>No approved claims yet. Approved Pokémon rewards will be logged here.</p>
        </div>`}</div>`;
    } else {
      panel.innerHTML = `<div class="vb-claims">${pending.length ? pending.map((c) => `
        <article class="vb-claim">
          <img class="vb-claim-art" src="${sprite(c.pokemon_id)}" alt="${esc(c.pokemon_name)}" loading="lazy">
          <div class="vb-claim-info">
            <p class="vb-claim-name">
              <span class="font-bold text-white">${esc(c.student_name)}</span>
              ${c.claim_source === 'listen_catch_mystery' ? `unlocked <strong class="text-amber-300">${esc(c.pokemon_name)}</strong> from a Catchdex Mystery Box!` : `defeated <strong class="text-amber-300">${esc(c.pokemon_name)}</strong>!`}
            </p>
            <p class="vb-claim-meta">${esc(c.class_name || '')}${c.school_name ? ' · ' + esc(c.school_name) : ''} · <span class="capitalize">${esc(c.pokemon_rarity || 'common')}</span> · costs ${Number(c.pokemon_price) || 0} credits${c.created_at ? ' · ' + formatApprovalTime(c.created_at) : ''}</p>
          </div>
          <div class="vb-claim-actions">
            <button type="button" class="vb-approve rounded-full px-4 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer border-0 shadow-sm" data-vb-approve="${esc(c.claim_id)}">Approve</button>
            <button type="button" class="vb-decline rounded-full px-4 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer" data-vb-decline="${esc(c.claim_id)}">Decline</button>
          </div>
        </article>`).join('') : `
        <div class="vb-claims-empty">
          <svg class="vb-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke-width="2"/></svg>
          <p>No battle claims waiting. When a student wins a Poké Battle, their catch request appears here.</p>
        </div>`}</div>`;
      panel.querySelectorAll('[data-vb-approve]').forEach((b) => b.addEventListener('click', () => approveClaim(b.dataset.vbApprove)));
      panel.querySelectorAll('[data-vb-decline]').forEach((b) => b.addEventListener('click', () => declineClaim(b.dataset.vbDecline)));
    }
    updateClaimsBadge();
  };

  async function approveClaim(claimId) {
    const claim = allData.find((r) => r.type === 'battle_claim' && r.claim_id === claimId && r.status === 'pending');
    if (!claim) { toast('This claim is no longer pending.'); renderBattleClaims(); return false; }
    const isCatalog = String(claim.shop_record_id || '').startsWith('catalog-');
    const shopItem = isCatalog ? null : allData.find((r) => String(r.__backendId) === String(claim.shop_record_id) && r.type === 'shop_pokemon');
    if (!isCatalog && !shopItem) {
      await window.dataSdk.update({ ...claim, status: 'expired', resolved_at: new Date().toISOString() });
      toast('That Pokémon is no longer in the shop.');
      renderBattleClaims(); return false;
    }
    const price = Number(claim.pokemon_price) || 0;
    if (!(await deductTeacherCredits(price))) return false; // keeps the Pokémon in the shop, claim stays pending
    const grant = await window.dataSdk.create({
      type: 'pokemon', student_id: claim.student_id, school_name: claim.school_name || '', class_name: claim.class_name || '',
      student_name: '', coins: 0, owner: claim.student_name,
      pokemon_id: Number(claim.pokemon_id), pokemon_name: claim.pokemon_name, pokemon_rarity: claim.pokemon_rarity || '',
      pokemon_price: price, pokemon_power: Number(claim.pokemon_power) || 0,
      current_hp: (Number(claim.pokemon_power) || 0) + 30, last_battle_time: '', created_at: new Date().toISOString(),
    });
    if (!grant?.isOk) { await refundTeacherCredits(price, currentTeacher); toast('Could not add the Pokémon. No credits were charged.'); return false; }
    const removed = isCatalog ? { isOk: true } : await window.dataSdk.delete(shopItem);
    if (!removed?.isOk) {
      await window.dataSdk.delete(grant.data || grant);
      await refundTeacherCredits(price, currentTeacher);
      toast('Could not remove the shop item. The claim was rolled back.');
      return false;
    }
    await window.dataSdk.update({ ...claim, status: 'approved', resolved_at: new Date().toISOString(), resolved_by: currentTeacher });
    toast(`Approved! ${claim.pokemon_name} joins ${claim.student_name}'s collection.`);
    renderBattleClaims();
    return true;
  }

  async function declineClaim(claimId) {
    const claim = allData.find((r) => r.type === 'battle_claim' && r.claim_id === claimId && r.status === 'pending');
    if (!claim) return renderBattleClaims();
    await window.dataSdk.update({ ...claim, status: 'declined', resolved_at: new Date().toISOString(), resolved_by: currentTeacher });
    toast('Claim declined. The Pokémon stays in the shop.');
    renderBattleClaims();
  }

  function updateClaimsBadge() {
    if (currentRole !== 'teacher') return;
    const count = myPendingClaims().length;
    const navBtn = document.querySelector('#ts-sidebar [data-ts-zone="battle-claims"]');
    if (navBtn) {
      navBtn.querySelector('.vb-claims-badge')?.remove();
      if (count) navBtn.insertAdjacentHTML('beforeend', `<span class="vb-claims-badge" aria-label="${count} pending claims">${count}</span>`);
    }
    const tab = document.getElementById('teacher-zone-battle-claims-tab');
    if (tab) tab.textContent = count ? `Pocket Battle Claims (${count})` : 'Pocket Battle Claims';
  }
  window.vbUpdateClaimsBadge = updateClaimsBadge;
  setInterval(updateClaimsBadge, 20000);
})();
