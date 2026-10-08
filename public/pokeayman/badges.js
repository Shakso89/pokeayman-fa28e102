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

  function pin(cls, icon, title, tip) {
    const el = document.createElement('span');
    el.className = `pk-pin pk-pin-${cls}`;
    el.tabIndex = 0;
    el.title = `${title} — ${tip}`;
    el.setAttribute('aria-label', `${title}: ${tip}`);
    el.innerHTML = `<i aria-hidden="true">${icon}</i><b>${title}</b>`;
    el.addEventListener('click', e => { e.stopPropagation(); if (typeof toast === 'function') toast(`${icon} ${title} — ${tip}`); });
    return el;
  }

  window.pkApplyBadgePins = function (root = document) {
    const battle = leader('battle_wins');
    const arcade = leader('game_wins');
    const sel = '#students-list > .trainer-student-card, .student-classmate-card, #view-student-profile .cp-identity, #student-dashboard .global-profile-card, #classmate-profile-modal .global-profile-card';
    root.querySelectorAll(sel).forEach(card => {
      card.querySelectorAll(':scope > .pk-pins').forEach(n => n.remove());
      let name = card.dataset.studentName || '';
      if (!name && typeof getStudentRecordForCard === 'function') name = getStudentRecordForCard(card)?.student_name || '';
      if (!name) name = card.querySelector('#profile-student-name, #my-student-name, .student-classmate-name, h2, h3')?.textContent?.trim() || '';
      const key = norm(name); if (!key) return;
      const pins = [];
      const m = (card.className.match(/class-rank-(\d)/) || [])[1];
      if (m && +m <= 3) { const c = CLASS_PINS[+m - 1]; pins.push(pin(...c)); }
      if (battle && battle.key === key) pins.push(pin('battle', '⚔️', 'Battle Master', `School record: ${battle.count} arena win${battle.count === 1 ? '' : 's'}`));
      if (arcade && arcade.key === key) pins.push(pin('arcade', '🕹️', 'Arcade Prodigy', `School record: ${arcade.count} game win${arcade.count === 1 ? '' : 's'}`));
      if (!pins.length) return;
      const row = document.createElement('div');
      row.className = 'pk-pins';
      pins.forEach(p => row.appendChild(p));
      card.appendChild(row);
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
