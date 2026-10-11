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
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style'] });
  window.addEventListener('resize', schedule);
})();
