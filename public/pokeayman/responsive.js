// Shrinks flashcard words so long words fit on one line instead of splitting.
(function () {
  const fit = () => {
    document.querySelectorAll('#flashcard-front p, #student-vocab-word').forEach((el) => {
      const box = el.parentElement; if (!box || !box.clientWidth) return;
      if (!el.dataset.fitBase || el.dataset.fitText !== el.textContent || !el.style.fontSize.endsWith('px') || el.dataset.fitSet !== el.style.fontSize) {
        el.dataset.fitBase = parseFloat(el.style.fontSize) || parseFloat(getComputedStyle(el).fontSize) || 64;
      }
      el.dataset.fitText = el.textContent;
      let size = Number(el.dataset.fitBase);
      el.style.fontSize = size + 'px';
      const max = box.clientWidth - 24;
      while (el.scrollWidth > max && size > 18) { size -= 2; el.style.fontSize = size + 'px'; }
      el.dataset.fitSet = el.style.fontSize;
    });
  };
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('click', () => setTimeout(schedule, 0), true);
  window.addEventListener('resize', schedule);
})();

// Phones/tablets: the weekly schedule automatically shows as a one-day agenda (desktop keeps the full grid).
(function () {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let day = Math.min(4, Math.max(0, (new Date().getDay() + 6) % 7));
  let last = '';
  const build = () => {
    const body = document.getElementById('schedule-grid-body');
    const table = document.getElementById('teacher-schedule-grid');
    if (!body || !table) return;
    const wrap = table.parentElement;
    let ag = document.getElementById('schedule-agenda');
    if (!ag) {
      ag = document.createElement('div'); ag.id = 'schedule-agenda';
      wrap.parentElement.insertBefore(ag, wrap.nextSibling);
      ag.addEventListener('click', (e) => {
        const d = e.target.closest('[data-ag-day]');
        if (d) { day = Number(d.dataset.agDay); last = ''; build(); return; }
        const b = e.target.closest('[data-ag-src]');
        if (b) { const src = body.querySelectorAll('button')[Number(b.dataset.agSrc)]; src && src.click(); }
      });
    }
    const btns = [...body.querySelectorAll('button')];
    const items = [];
    body.querySelectorAll('tr').forEach((tr) => {
      const td = tr.querySelectorAll('td')[day]; if (!td) return;
      td.querySelectorAll('article').forEach((a) => {
        const c = a.cloneNode(true);
        c.querySelectorAll('button').forEach((x, i) => { x.dataset.agSrc = btns.indexOf(a.querySelectorAll('button')[i]); x.removeAttribute('data-id'); x.className = 'ag-act'; });
        items.push(c.outerHTML);
      });
    });
    const addSrc = btns.indexOf(body.querySelector('.schedule-sub-add'));
    const html = `<div class="ag-days" role="tablist">${DAYS.map((d, i) => `<button type="button" role="tab" aria-selected="${i === day}" data-ag-day="${i}">${d.slice(0, 3)}</button>`).join('')}</div>`
      + `<h4 class="ag-title">${DAYS[day]}</h4><div class="ag-list">${items.join('') || '<p class="ag-empty">No classes this day.</p>'}</div>`
      + (addSrc >= 0 ? `<button type="button" class="ag-add" data-ag-src="${addSrc}">＋ Add sub-hour</button>` : '');
    if (html !== last) { ag.innerHTML = html; last = html; }
  };
  let raf = 0;
  const go = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(build); };
  new MutationObserver(go).observe(document.documentElement, { childList: true, subtree: true });
  go();
})();
