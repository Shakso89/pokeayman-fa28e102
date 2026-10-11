// Adds a "✨ Generate" button beside vocabulary example-sentence fields.
(function () {
  const PAIRS = [['new-vocab-sentence', 'new-vocab-word'], ['edit-word-sentence', 'edit-word-text']];
  const style = document.createElement('style');
  style.textContent = `.sg-wrap{display:flex;gap:6px;align-items:stretch}.sg-wrap>input{flex:1;min-width:0}
  .sg-btn{flex:none;padding:0 12px;border-radius:6px;font-weight:800;font-size:13px;white-space:nowrap;cursor:pointer;
  background:var(--ts-yellow,#facc15);color:var(--ts-action-ink,#1e1b4b);border:1px solid transparent;margin-top:6px}
  #edit-word-sentence + .sg-btn,.sg-wrap .sg-btn.sg-edit{margin-top:0}
  .sg-btn:disabled{opacity:.6;cursor:wait}.sg-btn:hover:not(:disabled){filter:brightness(1.08)}`;
  document.head.appendChild(style);

  async function generate(input, wordInput, btn) {
    const word = (wordInput?.value || '').trim();
    if (!word) { wordInput?.focus(); window.showToast?.('Type the word first', 'error'); return; }
    btn.disabled = true; const label = btn.textContent; btn.textContent = '…';
    try {
      const res = await fetch('/api/vocabulary-sentence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, avoid: input.value }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.sentence) throw new Error(data.message || 'Could not generate a sentence.');
      input.value = data.sentence;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) {
      if (window.showToast) window.showToast(e.message, 'error'); else alert(e.message);
    } finally { btn.disabled = false; btn.textContent = label; }
  }

  function enhance() {
    PAIRS.forEach(([sid, wid]) => {
      const input = document.getElementById(sid);
      if (!input || input.dataset.sg) return;
      input.dataset.sg = '1';
      const wrap = document.createElement('div');
      wrap.className = 'sg-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-btn' + (sid === 'edit-word-sentence' ? ' sg-edit' : '');
      btn.textContent = '✨ Generate';
      btn.title = 'Generate an example sentence using this word';
      btn.addEventListener('click', (ev) => { ev.preventDefault(); generate(input, document.getElementById(wid), btn); });
      wrap.appendChild(btn);
    });
  }
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
