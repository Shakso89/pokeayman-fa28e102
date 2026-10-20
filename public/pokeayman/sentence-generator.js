// Adds a "✨ Generate" button beside vocabulary example-sentence fields.
(function () {
  const PAIRS = [['new-vocab-sentence', 'new-vocab-word'], ['edit-word-sentence', 'edit-word-text']];
  const style = document.createElement('style');
  style.textContent = `.sg-wrap{display:flex;gap:8px;align-items:stretch;width:100%}.sg-wrap>input{flex:1 1 0%;min-width:0}
  .sg-btn{flex:none;padding:0 16px;border-radius:0.75rem;font-weight:800;font-size:13px;white-space:nowrap;cursor:pointer;
  background:#ffcb05;color:#0f172a;border:1px solid transparent;margin-top:0;display:inline-flex;align-items:center;justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,0.2);transition:all 0.15s ease}
  #edit-word-sentence + .sg-btn,.sg-wrap .sg-btn.sg-edit{margin-top:0}
  .sg-btn:disabled{opacity:.6;cursor:wait}.sg-btn:hover:not(:disabled){background:#ffd84d;filter:brightness(1.05);transform:translateY(-1px)}`;
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
