// School-wide achievement pins: Class Top 3, Battle Master, Arcade Prodigy.
(function () {
  const norm = v => (typeof normalizeStudentIdentity === 'function' ? normalizeStudentIdentity(v) : String(v || '').trim().toLowerCase());
  const students = () => (typeof getAllStudents === 'function' ? getAllStudents() : []);

  function totals(field) {
    const map = new Map();
    students().forEach(s => { const k = norm(s.student_name); if (!k) return; map.set(k, Math.max(map.get(k) || 0, Number(s[field]) || 0)); });
    return map;
  }
  function leader(field) {
    let best = null, max = 0;
    totals(field).forEach((n, k) => { if (n > max) { max = n; best = k; } });
    return best ? { key: best, count: max } : null;
  }

  // Increment a win counter on every membership record of the student (one batch).
  window.pkRecordWin = async function (name, field) {
    try {
      const key = norm(name); if (!key || !window.dataSdk) return;
      const rows = students().filter(s => norm(s.student_name) === key && s.__backendId);
      if (!rows.length) return;
      const next = Math.max(...rows.map(r => Number(r[field]) || 0)) + 1;
      const values = rows.map(r => ({ ...r, [field]: next }));
      rows.forEach(r => { r[field] = next; });
      if (window.dataSdk.updateMany) await window.dataSdk.updateMany(values);
      else for (const v of values) await window.dataSdk.update(v);
      window.pkApplyBadgePins?.();
    } catch (e) { console.warn('win record failed', e); }
  };

  const CLASS_PINS = [
    ['class-1', '🥇', 'Class Champion', '#1 in this class'],
    ['class-2', '🥈', 'Class Elite', '#2 in this class'],
    ['class-3', '🥉', 'Rising Star', '#3 in this class']
  ];

  const GLOBAL_PINS = [
    ['global-1', '👑', 'Grand Champion', 'is the number 1 student in the school'],
    ['global-2', '🌟', 'Mythic Elite', 'is number 2 in the school'],
    ['global-3', '⚡', 'Legendary Ace', 'is number 3 in the school']
  ];
  const val = s => (typeof getStudentTotalValue === 'function' ? getStudentTotalValue(s) : Number(s.coins) || 0);
  function globalRank(key) {
    try { const r = mergeGlobalLeaderboardStudents().sort((a, b) => val(b) - val(a) || String(a.student_name).localeCompare(String(b.student_name))).slice(0, 3).map(s => norm(s.student_name)); const i = r.indexOf(key); return i + 1; } catch (e) { return 0; }
  }
  function classRank(card, key) {
    try {
      if (!card.closest('#view-student-profile, #students-list, #classmate-profile-modal')) return 0;
      const sch = typeof navSchool !== 'undefined' ? navSchool : '', cls = typeof navClass !== 'undefined' ? navClass : '';
      if (!sch || !cls) return 0;
      const r = getStudents(sch, cls).slice().sort((a, b) => val(b) - val(a) || String(a.student_name).localeCompare(String(b.student_name))).slice(0, 3).map(s => norm(s.student_name));
      return r.indexOf(key) + 1;
    } catch (e) { return 0; }
  }

  function showBadgeExplanation(icon, title, tip, studentName, trigger) {
    document.getElementById('pk-badge-explanation')?.remove();
    const dialog = document.createElement('div');
    dialog.id = 'pk-badge-explanation';
    dialog.className = 'pk-badge-explanation';
    dialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="pk-badge-explanation-title" aria-describedby="pk-badge-explanation-text"><button type="button" class="pk-badge-explanation-close" aria-label="Close explanation">×</button><div class="pk-badge-explanation-icon" aria-hidden="true"></div><h2 id="pk-badge-explanation-title"></h2><p id="pk-badge-explanation-text"></p></section>';
    dialog.querySelector('.pk-badge-explanation-icon').textContent = icon;
    dialog.querySelector('#pk-badge-explanation-title').textContent = title;
    const detail = tip.startsWith('is ') ? `${studentName} ${tip}.` : `${studentName} — ${tip}.`;
    dialog.querySelector('#pk-badge-explanation-text').textContent = detail;
    document.body.appendChild(dialog);
    const close = () => { dialog.remove(); trigger?.focus?.(); };
    dialog.querySelector('.pk-badge-explanation-close').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    dialog.querySelector('.pk-badge-explanation-close').focus();
  }

  function pin(cls, icon, title, tip, studentName = 'Student') {
    const el = document.createElement('span');
    el.className = `pk-pin pk-pin-${cls}`;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.title = `${title} — ${tip}`;
    el.setAttribute('aria-label', `${title}: ${studentName} — ${tip}. Click for an explanation.`);
    el.innerHTML = `<i aria-hidden="true">${icon}</i><b>${title}</b>`;
    el.addEventListener('click', e => { e.stopPropagation(); showBadgeExplanation(icon, title, tip, studentName, el); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); showBadgeExplanation(icon, title, tip, studentName, el); } });
    return el;
  }

  window.pkApplyBadgePins = function (root = document) {
    const battle = leader('battle_wins');
    const arcade = leader('game_wins');
    const cwMap = new Map(); (window.pkChallengeWinnerRows?.() || []).forEach(r => { const k = norm(r.student_name); if (k) cwMap.set(k, (cwMap.get(k) || 0) + 1); });
    let cmBest = null; cwMap.forEach((n, k) => { if (!cmBest || n > cmBest.count) cmBest = { key: k, count: n }; });
    const sel = '#students-list > .trainer-student-card, .student-classmate-card, #view-student-profile .cp-identity, #student-dashboard .global-profile-card, #classmate-profile-modal .global-profile-card';
    root.querySelectorAll(sel).forEach(card => {
      card.querySelectorAll(':scope > .pk-pins, :scope > .cp-name > .pk-pins').forEach(n => n.remove());
      let name = card.dataset.studentName || '';
      if (!name && typeof getStudentRecordForCard === 'function') name = getStudentRecordForCard(card)?.student_name || '';
      if (!name) name = card.querySelector('#profile-student-name, #my-student-name, .student-classmate-name, h2, h3')?.textContent?.trim() || '';
      const key = norm(name); if (!key) return;
      const pins = [];
      let m = +((card.className.match(/class-rank-(\d)/) || [])[1] || 0);
      if (!m) m = classRank(card, key);
      if (m && m <= 3) { const c = CLASS_PINS[m - 1]; pins.push(pin(...c, name)); }
      const g = globalRank(key);
      if (g) pins.unshift(pin(...GLOBAL_PINS[g - 1], name));
      if (battle && battle.key === key) pins.push(pin('battle', '⚔️', 'Battle Master', `School record: ${battle.count} arena win${battle.count === 1 ? '' : 's'}`, name));
      if (cmBest && cmBest.key === key) pins.push(pin('challenge', '🏆', 'Challenge Master', `Won ${cmBest.count} Catchdex challenge${cmBest.count === 1 ? '' : 's'}`, name));
      if (arcade && arcade.key === key) pins.push(pin('arcade', '🕹️', 'Arcade Prodigy', `School record: ${arcade.count} game win${arcade.count === 1 ? '' : 's'}`, name));
      if (!pins.length) return;
      const row = document.createElement('div');
      row.className = `pk-pins${pins.length > 2 ? ' pk-pins-compact' : ''}`;
      pins.forEach(p => row.appendChild(p));
      (card.matches('.cp-identity') && card.querySelector('.cp-name') || card).appendChild(row);
    });
  };

  function hook() {
    if (typeof window.applyGlobalAchievementBadges !== 'function' || window.applyGlobalAchievementBadges.__pk) return;
    const orig = window.applyGlobalAchievementBadges;
    const wrapped = function (root) { const r = orig.apply(this, arguments); try { window.pkApplyBadgePins(root || document); } catch (e) {} return r; };
    wrapped.__pk = true;
    window.applyGlobalAchievementBadges = wrapped;
  }
  hook();
  document.addEventListener('DOMContentLoaded', hook);
  window.addEventListener('load', () => { hook(); window.pkApplyBadgePins(); });
})();
