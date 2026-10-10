// Class/school rename cascade + Admin full student editor.
(function () {
  const lc = v => String(v || '').trim().toLocaleLowerCase();
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SCHOOL_KEYS = ['school_name', 'assigned_school', 'vocab_list_school', 'vocab_school'];
  const CLASS_KEYS = ['class_name', 'assigned_class', 'vocab_list_class', 'vocab_class', 'quiz_class'];

  // Rewrites every saved reference to a class (or whole school when oldClass is null) in one batch.
  window.cascadeClassRename = async function (oldSchool, oldClass, newSchool, newClass, skipId) {
    const schoolOnly = oldClass == null;
    const patches = [];
    allData.forEach(r => {
      if (!r || !r.__backendId || r.__backendId === skipId) return;
      const p = {};
      const rowSchool = SCHOOL_KEYS.map(k => r[k]).find(v => v) || '';
      const schoolMatch = lc(rowSchool) === lc(oldSchool);
      SCHOOL_KEYS.forEach(k => { if (r[k] && lc(r[k]) === lc(oldSchool) && r[k] !== newSchool) p[k] = newSchool; });
      if (!schoolOnly) {
        CLASS_KEYS.forEach(k => {
          if (!r[k] || lc(r[k]) !== lc(oldClass) || r[k] === newClass) return;
          if (k === 'quiz_class' || schoolMatch || !rowSchool) p[k] = newClass;
        });
        if (r.shared_classes && schoolMatch) {
          const arr = vocabSharedClasses(r);
          if (arr.some(c => lc(c) === lc(oldClass))) p.shared_classes = [...new Set(arr.map(c => lc(c) === lc(oldClass) ? newClass : c))];
        }
      }
      if (typeof r.class_memberships === 'string' && r.class_memberships) {
        const seen = new Set();
        const next = r.class_memberships.split('||').filter(Boolean).map(seg => {
          const i = seg.indexOf(' / '); let s = i >= 0 ? seg.slice(0, i) : ''; let c = i >= 0 ? seg.slice(i + 3) : seg;
          if (lc(s) === lc(oldSchool)) { if (schoolOnly) s = newSchool; else if (lc(c) === lc(oldClass)) { s = newSchool; c = newClass; } }
          return s ? `${s} / ${c}` : c;
        }).filter(seg => { const k = lc(seg); if (seen.has(k)) return false; seen.add(k); return true; }).join('||');
        if (next !== r.class_memberships) p.class_memberships = next;
      }
      if (Object.keys(p).length) patches.push({ ...r, ...p });
    });
    if (!patches.length) return true;
    const res = await window.dataSdk.updateMany(patches);
    if (!res?.isOk) { toast('Some records could not be renamed. Please try again.'); return false; }
    const map = new Map(patches.map(p => [p.__backendId, p]));
    allData = allData.map(r => map.get(r.__backendId) || r);
    return true;
  };

  function classKey(s, c) { return lc(s) + '||' + lc(c); }

  window.openAdminStudentFullEditor = function (studentId) {
    const student = getStudentRecordByStableId(studentId) || allData.find(r => r.__backendId === studentId);
    if (!student) return;
    const sid = student.__backendId;
    const pokes = () => getPokemons().filter(p => (p.student_id && String(p.student_id) === String(student.student_id || sid)) || p.owner === student.student_name);
    const current = new Set(getEditStudentClassList(sid, student).map(i => classKey(i.school, i.class)));
    const classes = allData.filter(r => r.type === 'class');
    const removed = new Set();
    const modal = document.createElement('div');
    modal.className = 'es-overlay';
    const renderPokes = () => {
      const list = pokes().filter(p => !removed.has(p.__backendId));
      modal.querySelector('#ase-pokes').innerHTML = list.length ? list.map(p => `<div class="es-class-row"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${esc(p.pokemon_id)}.png" alt="" width="36" height="36" loading="lazy"><span class="es-class-text"><strong>${esc(p.pokemon_name)}</strong><small>${esc(p.pokemon_rarity || '')}</small></span><button type="button" class="es-remove-btn" data-pid="${esc(p.__backendId)}">✕ Remove</button></div>`).join('') : '<p class="es-empty">No Pokémon</p>';
      modal.querySelectorAll('[data-pid]').forEach(b => b.addEventListener('click', () => { removed.add(b.dataset.pid); renderPokes(); }));
    };
    modal.innerHTML = `<div class="es-card" role="dialog" aria-modal="true" aria-label="Edit student"><div class="es-head"><h2>Edit Student</h2><button type="button" class="es-close" id="ase-x" aria-label="Close">✕</button></div><form>
      <label class="es-label" for="ase-name">Student name</label><input id="ase-name" class="es-input" value="${esc(student.student_name)}" required>
      <label class="es-label" for="ase-coins">Coins</label><input id="ase-coins" type="number" min="0" class="es-input" value="${Number(student.coins || 0)}">
      <div class="es-label">Classes</div><div class="es-classes">${classes.map(c => `<label class="es-class-row"><input type="checkbox" class="ase-cls" data-s="${esc(c.school_name)}" data-c="${esc(c.class_name)}" ${current.has(classKey(c.school_name, c.class_name)) ? 'checked' : ''}><span class="es-class-text"><strong>${esc(c.class_name)}</strong><small>${esc(c.school_name)}</small></span></label>`).join('')}</div>
      <div class="es-label">Pokémon collection</div><div id="ase-pokes" class="es-classes"></div>
      <p id="ase-err" class="es-error" hidden></p>
      <div class="es-actions"><button type="submit" class="btn-primary es-save">Save Changes</button><button type="button" class="es-cancel" id="ase-cancel">Cancel</button></div></form></div>`;
    document.body.appendChild(modal);
    renderPokes();
    const close = () => modal.remove();
    modal.querySelector('#ase-x').onclick = close; modal.querySelector('#ase-cancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const err = modal.querySelector('#ase-err');
      const fail = m => { err.textContent = m; err.hidden = false; btn.disabled = false; };
      const btn = modal.querySelector('.es-save'); btn.disabled = true;
      const name = modal.querySelector('#ase-name').value.trim();
      const coins = Math.max(0, parseInt(modal.querySelector('#ase-coins').value, 10) || 0);
      const picked = [...modal.querySelectorAll('.ase-cls:checked')].map(i => ({ s: i.dataset.s, c: i.dataset.c }));
      if (!name) return fail('Name cannot be empty.');
      if (!picked.length) return fail('Pick at least one class.');
      const latest = getStudentRecordByStableId(sid) || student;
      const oldName = latest.student_name;
      const primary = picked.find(p => classKey(p.s, p.c) === classKey(latest.school_name, latest.class_name)) || picked[0];
      const updated = { ...latest, student_name: name, coins, student_id: latest.student_id || sid, school_name: primary.s, class_name: primary.c, class_memberships: picked.map(p => `${p.s} / ${p.c}`).join('||'), updated_at: new Date().toISOString(), __backendId: sid };
      const batch = [updated];
      if (name !== oldName) getPokemons().forEach(p => { if (p.owner === oldName && !removed.has(p.__backendId)) batch.push({ ...p, owner: name }); });
      const res = await window.dataSdk.updateMany(batch);
      if (!res?.isOk) return fail('Could not save. Please try again.');
      const pickedKeys = new Set(picked.map(p => classKey(p.s, p.c)));
      const myId = String(latest.student_id || sid);
      const stale = allData.filter(r => ['student_membership', 'class_student', 'class_membership'].includes(r.type) && [r.student_id, r.studentId].some(v => String(v || '') === myId || String(v || '') === String(sid)) && !pickedKeys.has(classKey(r.school_name, r.class_name)));
      for (const r of [...stale, ...allData.filter(r => removed.has(r.__backendId))]) { try { await window.dataSdk.delete(r); } catch (x) {} }
      try { rebuildCanonicalStudentIndex(); } catch (x) {}
      try { renderAdminAllStudents(); } catch (x) {}
      try { renderTeacherDashboard(); } catch (x) {}
      close();
      toast(`${name} updated!`);
    });
  };
})();
