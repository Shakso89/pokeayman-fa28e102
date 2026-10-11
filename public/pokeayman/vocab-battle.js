/* Poké Battle: solo vocabulary battle. Student unscrambles words under a 20s timer to
   defeat a wild shop Pokémon; winning sends a teacher-approved claim request. */
(function () {
  const TURN_SECONDS = 20;
  const STUDENT_HP = 100;
  const DODGE_CHANCE = 0.2;
  const RARITY_WEIGHT = { common: 100, uncommon: 45, rare: 15, epic: 6, mythic: 4 };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sprite = (id) => `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${id}.png`;
  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let battle = null;

  function classTeacherFor(student) {
    const cls = (typeof allData !== 'undefined' ? allData : []).find((r) => r.type === 'class' && r.school_name === student.school_name && r.class_name === student.class_name);
    const name = cls?.teacher_name || cls?.created_by || cls?.assigned_teacher || '';
    if (!name) return null;
    return getTeachers().find((t) => normalizeStudentIdentity(t.teacher_name) === normalizeStudentIdentity(name)) || null;
  }

  function pickOpponent(student) {
    const teacher = classTeacherFor(student);
    const credits = teacher ? (teacher.teacher_credits === -1 ? Infinity : Number(teacher.teacher_credits || 0)) : Infinity;
    const pool = getShopItems().filter((item) => {
      const rarity = String(item.shop_pokemon_rarity || 'common').toLowerCase();
      if (rarity === 'legendary') return false;
      return Number(item.shop_pokemon_price || 0) <= credits;
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
    const ratio = Math.max(0, Math.min(1, current / max));
    const fill = el.querySelector('.vb-hp-fill');
    fill.style.width = `${ratio * 100}%`;
    fill.className = `vb-hp-fill ${hpClass(ratio)}`;
    el.querySelector('.vb-hp-num').textContent = `${Math.max(0, current)}/${max}`;
  }

  function setMessage(text) { const m = battle?.root.querySelector('.vb-message'); if (m) m.textContent = text; }

  function floatDamage(text, targetEl, kind) {
    const rect = targetEl.getBoundingClientRect();
    const tag = document.createElement('span');
    tag.className = `vb-damage ${kind}`;
    tag.textContent = text;
    tag.style.left = `${rect.left + rect.width / 2 - 20}px`;
    tag.style.top = `${rect.top}px`;
    battle.root.appendChild(tag);
    setTimeout(() => tag.remove(), 1000);
  }

  function stopTimer() {
    if (battle?.timerId) { clearInterval(battle.timerId); battle.timerId = null; }
  }

  function startTurn() {
    if (!battle) return;
    stopTimer();
    if (!battle.queue.length) battle.queue = [...battle.words].sort(() => Math.random() - 0.5);
    const entry = battle.queue.shift();
    const word = String(entry.vocab_word || '').trim();
    battle.currentWord = word;
    battle.slots = new Array(word.length).fill(null);
    battle.tiles = scrambleWord(word.toLowerCase()).map((letter, i) => ({ letter, used: false, key: i }));
    battle.deadline = Date.now() + TURN_SECONDS * 1000;
    renderWord();
    battle.timerId = setInterval(tickTimer, 100);
    tickTimer();
  }

  function tickTimer() {
    if (!battle) return;
    const left = Math.max(0, battle.deadline - Date.now());
    const ratio = left / (TURN_SECONDS * 1000);
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
      setTimeout(() => { if (!battle) return; battle.slots.fill(null); battle.tiles.forEach((t) => { t.used = false; delete t._slot; }); renderWord(); }, 500);
    }
  }

  function onSuccess() {
    stopTimer();
    battle.failStreak = 0;
    const foeArt = battle.root.querySelector('.vb-foe-art');
    if (Math.random() < DODGE_CHANCE) {
      setMessage(`${battle.foe.shop_pokemon_name} dodged the attack!`);
      foeArt?.classList.add('vb-dodge');
      setTimeout(() => foeArt?.classList.remove('vb-dodge'), 550);
      return scheduleNext(900);
    }
    const damage = 10 + battle.currentWord.length * 2 + rand(0, 6);
    battle.foeHp = Math.max(0, battle.foeHp - damage);
    renderHp(battle.root.querySelector('.vb-foe-hp'), battle.foeHp, battle.foeMaxHp);
    floatDamage(`-${damage}`, foeArt, 'vb-dmg-foe');
    foeArt?.classList.add('vb-hit');
    setTimeout(() => foeArt?.classList.remove('vb-hit'), 500);
    setMessage(`Correct! You hit ${battle.foe.shop_pokemon_name} for ${damage}!`);
    if (battle.foeHp <= 0) return endBattle(true);
    scheduleNext(1100);
  }

  function onFail(reason) {
    stopTimer();
    const damage = rand(6, 12) + battle.failStreak * 5;
    battle.failStreak += 1;
    battle.studentHp = Math.max(0, battle.studentHp - damage);
    renderHp(battle.root.querySelector('.vb-me-hp'), battle.studentHp, STUDENT_HP);
    const meEl = battle.root.querySelector('.vb-me');
    floatDamage(`-${damage}`, meEl, 'vb-dmg-me');
    meEl?.classList.add('vb-hit');
    setTimeout(() => meEl?.classList.remove('vb-hit'), 500);
    setMessage(`${reason} ${battle.foe.shop_pokemon_name} strikes back for ${damage}! The word was "${battle.currentWord}".`);
    if (battle.studentHp <= 0) return endBattle(false);
    scheduleNext(1600);
  }

  function scheduleNext(delay) { setTimeout(() => { if (battle && !battle.over) startTurn(); }, delay); }

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
    logBattle(won ? 'win' : 'loss');
    const arena = battle.root.querySelector('.vb-arena');
    const foe = battle.foe;
    if (won) battle.root.querySelector('.vb-foe-art')?.classList.add('vb-faint');
    arena.innerHTML = `
      <div class="vb-result">
        <img class="vb-result-art" src="${sprite(foe.shop_pokemon_id)}" alt="${esc(foe.shop_pokemon_name)}">
        <h2 class="vb-result-title ${won ? 'vb-win' : 'vb-lose'}">${won ? '🏆 Victory!' : '💫 You fainted…'}</h2>
        <p class="vb-result-sub">${won
          ? `You defeated ${esc(foe.shop_pokemon_name)}! Ask your teacher to approve the claim and it joins your collection for ${Number(foe.shop_pokemon_price) || 0} credits.`
          : `${esc(foe.shop_pokemon_name)} was too strong this time. Train your words and try again!`}</p>
        <div class="vb-result-actions">
          ${won ? `<button type="button" class="vb-btn" data-vb="claim">🎁 Request claim</button>` : `<button type="button" class="vb-btn" data-vb="retry">⚔️ Battle again</button>`}
          <button type="button" class="vb-btn vb-btn-ghost" data-vb="close">${won ? 'Maybe later' : 'Back to games'}</button>
        </div>
      </div>`;
  }

  async function requestClaim(button) {
    if (!battle || battle.claimed) return;
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
    if (!result?.isOk) { button.disabled = false; button.textContent = '🎁 Request claim'; toast('Could not send the claim. Try again.'); return; }
    battle.claimed = true;
    button.textContent = '✓ Sent to your teacher';
    toast('Claim sent! Your teacher will review it.');
  }

  function closeBattle() {
    if (!battle) return;
    stopTimer();
    battle.root.remove();
    battle = null;
  }

  window.startVocabBattle = function (listName) {
    if (currentRole !== 'student') { toast('Poké Battle is a student game.'); return; }
    const student = (typeof getStudentRecordByStableId === 'function' && currentStudentRecordId && getStudentRecordByStableId(currentStudentRecordId))
      || getAllStudents().find((s) => s.student_name === currentStudent);
    if (!student) { toast('Signed-in student was not found.'); return; }
    const words = getGameWords(listName).filter((w) => String(w.vocab_word || '').trim().length >= 2);
    if (!words.length) { toast('This list has no battle-ready words yet.'); return; }
    const foe = pickOpponent(student);
    if (!foe) { toast('No affordable Pokémon in the shop right now. Ask your teacher to stock the shop!'); return; }
    closeBattle();
    const root = document.createElement('div');
    root.className = 'vb-stage';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Poké Battle');
    const foeMaxHp = Number(foe.shop_pokemon_hp) || (Number(foe.shop_pokemon_power) || 20) + 30;
    root.innerHTML = `
      <header class="vb-head"><span class="vb-title">⚔️ Poké Battle</span><button type="button" class="vb-close" data-vb="close">✕ Leave battle</button></header>
      <div class="vb-arena">
        <div class="vb-foe">
          <img class="vb-foe-art" src="${sprite(foe.shop_pokemon_id)}" alt="Wild ${esc(foe.shop_pokemon_name)}">
          <p class="vb-foe-name">Wild ${esc(foe.shop_pokemon_name)}</p>
          <p class="vb-foe-rarity">${esc(foe.shop_pokemon_rarity || 'common')} · wins cost ${Number(foe.shop_pokemon_price) || 0} credits</p>
          <div class="vb-hp vb-foe-hp"><div class="vb-hp-label"><span>HP</span><span class="vb-hp-num"></span></div><div class="vb-hp-track"><div class="vb-hp-fill"></div></div></div>
        </div>
        <p class="vb-message" aria-live="polite">Unscramble the word to attack!</p>
        <div class="vb-timer"><div class="vb-timer-track"><div class="vb-timer-fill"></div></div><p class="vb-timer-text"></p></div>
        <div class="vb-word"><div class="vb-slots"></div><div class="vb-tiles"></div></div>
        <div class="vb-me">
          <p class="vb-me-name">${esc(student.student_name)}</p>
          <div class="vb-hp vb-me-hp"><div class="vb-hp-label"><span>HP</span><span class="vb-hp-num"></span></div><div class="vb-hp-track"><div class="vb-hp-fill"></div></div></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    battle = {
      root, student, studentId: String(currentStudentRecordId || student.__backendId || ''),
      foe, foeMaxHp, foeHp: foeMaxHp, studentHp: STUDENT_HP,
      words, queue: [], failStreak: 0, over: false, claimed: false, timerId: null,
    };
    renderHp(root.querySelector('.vb-foe-hp'), battle.foeHp, foeMaxHp);
    renderHp(root.querySelector('.vb-me-hp'), STUDENT_HP, STUDENT_HP);
    root.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn || !battle) return;
      if (btn.dataset.vb === 'close') return closeBattle();
      if (btn.dataset.vb === 'claim') return requestClaim(btn);
      if (btn.dataset.vb === 'retry') { closeBattle(); window.startVocabBattle(listName); return; }
      if (btn.dataset.tile !== undefined && !battle.over) return fillNextSlot(Number(btn.dataset.tile));
      if (btn.dataset.slot !== undefined && !battle.over) return clearSlot(Number(btn.dataset.slot));
    });
    startTurn();
  };

  /* ---- Teacher: claim approvals ---- */
  function myPendingClaims() {
    const claims = allData.filter((r) => r.type === 'battle_claim' && r.status === 'pending');
    if (typeof canAccessAdmin === 'function' && canAccessAdmin()) return claims;
    const me = normalizeStudentIdentity(currentTeacher || '');
    return claims.filter((c) => normalizeStudentIdentity(c.teacher_name || '') === me || !c.teacher_name);
  }

  window.renderBattleClaims = function () {
    const panel = document.getElementById('teacher-zone-battle-claims-panel');
    if (!panel) return;
    const claims = myPendingClaims();
    panel.innerHTML = `<div class="vb-claims">${claims.length ? claims.map((c) => `
      <article class="vb-claim">
        <img class="vb-claim-art" src="${sprite(c.pokemon_id)}" alt="${esc(c.pokemon_name)}" loading="lazy">
        <div class="vb-claim-info">
          <p class="vb-claim-name">${esc(c.student_name)} defeated ${esc(c.pokemon_name)}!</p>
          <p class="vb-claim-meta">${esc(c.class_name || '')}${c.school_name ? ` · ${esc(c.school_name)}` : ''} · ${esc(c.pokemon_rarity || 'common')} · costs ${Number(c.pokemon_price) || 0} credits</p>
        </div>
        <div class="vb-claim-actions">
          <button type="button" class="vb-approve" data-vb-approve="${esc(c.claim_id)}">Approve</button>
          <button type="button" class="vb-decline" data-vb-decline="${esc(c.claim_id)}">Decline</button>
        </div>
      </article>`).join('') : '<p class="vb-claims-empty">No battle claims waiting. When a student wins a Poké Battle, their catch request appears here.</p>'}</div>`;
    panel.querySelectorAll('[data-vb-approve]').forEach((b) => b.addEventListener('click', () => approveClaim(b.dataset.vbApprove)));
    panel.querySelectorAll('[data-vb-decline]').forEach((b) => b.addEventListener('click', () => declineClaim(b.dataset.vbDecline)));
    updateClaimsBadge();
  };

  async function approveClaim(claimId) {
    const claim = allData.find((r) => r.type === 'battle_claim' && r.claim_id === claimId && r.status === 'pending');
    if (!claim) { toast('This claim is no longer pending.'); return renderBattleClaims(); }
    const shopItem = allData.find((r) => String(r.__backendId) === String(claim.shop_record_id) && r.type === 'shop_pokemon');
    if (!shopItem) {
      await window.dataSdk.update({ ...claim, status: 'expired', resolved_at: new Date().toISOString() });
      toast('That Pokémon is no longer in the shop.');
      return renderBattleClaims();
    }
    const price = Number(claim.pokemon_price) || 0;
    if (!(await deductTeacherCredits(price))) return; // keeps the Pokémon in the shop, claim stays pending
    const grant = await window.dataSdk.create({
      type: 'pokemon', student_id: claim.student_id, school_name: claim.school_name || '', class_name: claim.class_name || '',
      student_name: '', coins: 0, owner: claim.student_name,
      pokemon_id: Number(claim.pokemon_id), pokemon_name: claim.pokemon_name, pokemon_rarity: claim.pokemon_rarity || '',
      pokemon_price: price, pokemon_power: Number(claim.pokemon_power) || 0,
      current_hp: (Number(claim.pokemon_power) || 0) + 30, last_battle_time: '', created_at: new Date().toISOString(),
    });
    if (!grant?.isOk) { await refundTeacherCredits(price, currentTeacher); toast('Could not add the Pokémon. No credits were charged.'); return; }
    const removed = await window.dataSdk.delete(shopItem);
    if (!removed?.isOk) {
      await window.dataSdk.delete(grant.data || grant);
      await refundTeacherCredits(price, currentTeacher);
      toast('Could not remove the shop item. The claim was rolled back.');
      return;
    }
    await window.dataSdk.update({ ...claim, status: 'approved', resolved_at: new Date().toISOString(), resolved_by: currentTeacher });
    toast(`Approved! ${claim.pokemon_name} joins ${claim.student_name}'s collection.`);
    renderBattleClaims();
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
    if (tab) tab.textContent = count ? `Battle Claims (${count})` : 'Battle Claims';
  }
  window.vbUpdateClaimsBadge = updateClaimsBadge;
  setInterval(updateClaimsBadge, 20000);
})();
