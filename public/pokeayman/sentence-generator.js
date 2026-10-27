// Adds a "Generate" AI action button beside vocabulary example-sentence fields.
(function () {
  const PAIRS = [
    ['new-vocab-sentence', 'new-vocab-word'],
    ['edit-word-sentence', 'edit-word-text']
  ];

  const style = document.createElement('style');
  style.textContent = `
    .sg-wrap {
      display: flex !important;
      gap: 8px !important;
      align-items: center !important;
      width: 100% !important;
    }
    .sg-wrap > input {
      flex: 1 1 0% !important;
      min-width: 0 !important;
    }
    .sg-btn {
      flex: none !important;
      height: 42px !important;
      min-height: 42px !important;
      max-height: 42px !important;
      padding: 8px 18px !important;
      border-radius: 9999px !important;
      font-family: Outfit, 'DM Sans', -apple-system, sans-serif !important;
      font-size: 13.5px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 7px !important;
      cursor: pointer !important;
      outline: none !important;
      position: relative !important;
      overflow: hidden !important;
      user-select: none !important;
      isolation: isolate !important;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.2s ease,
                  background 0.25s ease,
                  border-color 0.2s ease !important;
    }
    #edit-word-sentence + .sg-btn, .sg-wrap .sg-btn.sg-edit {
      margin-top: 0 !important;
    }
    /* Dark theme (default) */
    html body:not(.ts-bright) :is(.sg-btn, .btn-ai-generate.sg-btn) {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #7c3aed 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(199, 210, 254, 0.35) !important;
      box-shadow:
        0 2px 8px -1px rgba(79, 70, 229, 0.4),
        0 0 16px -2px rgba(124, 58, 237, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
    }
    html body:not(.ts-bright) :is(.sg-btn, .btn-ai-generate.sg-btn):hover:not(:disabled):not([aria-disabled="true"]) {
      z-index: 10 !important;
      transform: translateY(-2px) scale(1.02) !important;
      background: linear-gradient(135deg, #4338ca 0%, #4f46e5 45%, #6d28d9 100%) !important;
      border-color: rgba(224, 231, 255, 0.6) !important;
      box-shadow:
        0 4px 14px rgba(79, 70, 229, 0.5),
        0 0 22px 2px rgba(139, 92, 246, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
    }
    /* Bright theme */
    html body.ts-bright :is(.sg-btn, .btn-ai-generate.sg-btn) {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #7c3aed 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(79, 70, 229, 0.35) !important;
      box-shadow:
        0 2px 6px rgba(79, 70, 229, 0.22),
        0 4px 12px rgba(124, 58, 237, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    }
    html body.ts-bright :is(.sg-btn, .btn-ai-generate.sg-btn):hover:not(:disabled):not([aria-disabled="true"]) {
      z-index: 10 !important;
      transform: translateY(-2px) scale(1.02) !important;
      background: linear-gradient(135deg, #4338ca 0%, #4f46e5 55%, #6d28d9 100%) !important;
      border-color: rgba(99, 102, 241, 0.6) !important;
      box-shadow:
        0 4px 12px rgba(79, 70, 229, 0.32),
        0 6px 18px rgba(124, 58, 237, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.45) !important;
    }
    /* Active press state (active:scale-95) */
    html body :is(.sg-btn, .btn-ai-generate.sg-btn):active:not(:disabled):not([aria-disabled="true"]) {
      transform: translateY(1px) scale(0.95) !important;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
    /* Shimmer sweep effect on hover */
    :is(.sg-btn, .btn-ai-generate.sg-btn)::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 50% !important;
      height: 100% !important;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent) !important;
      transform: translateX(-140%) skewX(-20deg) !important;
      pointer-events: none !important;
      border-radius: inherit !important;
    }
    :is(.sg-btn, .btn-ai-generate.sg-btn):hover:not(:disabled):not([aria-disabled="true"])::before {
      animation: ai-shimmer-sweep 0.75s ease-out !important;
    }
    /* SVG sparkle icon */
    :is(.sg-btn, .btn-ai-generate.sg-btn) .ai-sparkle-icon {
      width: 17px !important;
      height: 17px !important;
      flex-shrink: 0 !important;
      overflow: visible !important;
      color: #e0e7ff !important;
      animation: ai-sparkle-twinkle 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease !important;
    }
    :is(.sg-btn, .btn-ai-generate.sg-btn):hover:not(:disabled):not([aria-disabled="true"]) .ai-sparkle-icon {
      color: #ffffff !important;
      transform: scale(1.2) rotate(10deg) !important;
    }
    :is(.sg-btn, .btn-ai-generate.sg-btn).is-generating .ai-sparkle-icon {
      animation: ai-spin 1s linear infinite !important;
    }
    :is(.sg-btn, .btn-ai-generate.sg-btn) .ai-btn-text {
      position: relative !important;
      z-index: 1 !important;
      font-family: inherit !important;
      font-weight: 700 !important;
      color: inherit !important;
      display: inline-block !important;
    }
    /* Disabled state */
    html body:not(.ts-bright) :is(.sg-btn, .btn-ai-generate.sg-btn):is(:disabled, [disabled], [aria-disabled="true"]) {
      opacity: 0.65 !important;
      cursor: not-allowed !important;
      transform: none !important;
      filter: none !important;
      background: rgba(79, 70, 229, 0.25) !important;
      color: rgba(224, 231, 255, 0.7) !important;
      border: 1px solid rgba(99, 102, 241, 0.3) !important;
      box-shadow: none !important;
    }
    html body.ts-bright :is(.sg-btn, .btn-ai-generate.sg-btn):is(:disabled, [disabled], [aria-disabled="true"]) {
      opacity: 0.65 !important;
      cursor: not-allowed !important;
      transform: none !important;
      filter: none !important;
      background: rgba(99, 102, 241, 0.15) !important;
      color: rgba(79, 70, 229, 0.75) !important;
      border: 1px solid rgba(99, 102, 241, 0.25) !important;
      box-shadow: none !important;
    }
    @keyframes ai-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes ai-sparkle-twinkle {
      0%, 100% {
        transform: scale(1) rotate(0deg);
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
        opacity: 0.95;
      }
      50% {
        transform: scale(1.18) rotate(8deg);
        filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9));
        opacity: 1;
      }
    }
    @keyframes ai-shimmer-sweep {
      0% { transform: translateX(-120%) skewX(-20deg); }
      100% { transform: translateX(220%) skewX(-20deg); }
    }
  `;
  document.head.appendChild(style);

  const SPARKLE_SVG = `<svg class="ai-sparkle-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"></path></svg>`;

  function isUserAdmin() {
    if (typeof window.isAymanTeacher === 'function' && window.isAymanTeacher()) return true;
    if (typeof window.canAccessAdmin === 'function' && window.canAccessAdmin()) return true;
    const identity = String(window.currentTeacher || '').trim().toLocaleLowerCase();
    if (identity === 'ayman' || identity === 'teacher ayman') return true;
    const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : (typeof window.findMyTeacherRecord === 'function' ? window.findMyTeacherRecord() : null);
    if (rec && (rec.teacher_role === 'admin' || rec.teacher_credits === -1)) return true;
    const creds = typeof window.getTeacherCredits === 'function' ? window.getTeacherCredits() : null;
    if (creds === Infinity) return true;
    return false;
  }

  function getTeacherBalance() {
    if (isUserAdmin()) return Infinity;
    if (typeof window.getTeacherCredits === 'function') {
      const creds = window.getTeacherCredits();
      if (creds === Infinity) return Infinity;
      if (typeof creds === 'number' && !isNaN(creds)) return creds;
    }
    const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : (typeof window.findMyTeacherRecord === 'function' ? window.findMyTeacherRecord() : null);
    if (rec) {
      if (rec.teacher_credits === -1) return Infinity;
      return typeof rec.teacher_credits === 'number' ? rec.teacher_credits : 0;
    }
    return 0;
  }

  function displayToast(msg, type = 'info') {
    if (typeof window.toast === 'function') {
      window.toast(msg);
    } else if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

  function showInsufficientCreditsToast() {
    displayToast('Insufficient credits! You need at least 1 credit to generate an example sentence.', 'error');
  }

  function syncButtonState(btn) {
    if (!btn || btn.dataset.busy === '1') return;
    const admin = isUserAdmin();
    const balance = getTeacherBalance();
    if (!admin && balance < 1) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.title = 'Insufficient credits (1 required to generate sentence)';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      btn.title = 'Generate an example sentence using this word (1 credit)';
    }
  }

  async function generate(input, wordInput, btn) {
    const word = (wordInput?.value || '').trim();
    if (!word) {
      wordInput?.focus();
      displayToast('Type the word first', 'error');
      return;
    }

    const admin = isUserAdmin();
    const balance = getTeacherBalance();
    if (!admin && balance < 1) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      showInsufficientCreditsToast();
      return;
    }

    btn.disabled = true;
    btn.dataset.busy = '1';
    btn.classList.add('is-generating');
    const textSpan = btn.querySelector('.ai-btn-text');
    if (textSpan) textSpan.textContent = 'Generating…';

    try {
      const context = String(input.dataset.pictureContext || '').trim();
      const res = await fetch('/api/vocabulary-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, avoid: input.value, context: context || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.sentence) throw new Error(data.message || 'Could not generate a sentence.');

      input.value = data.sentence;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // Deduct 1 credit upon successful generation
      if (!admin) {
        if (typeof window.deductTeacherCredits === 'function') {
          await window.deductTeacherCredits(1);
        } else if (typeof window.dataSdk?.update === 'function') {
          const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : (typeof window.findMyTeacherRecord === 'function' ? window.findMyTeacherRecord() : null);
          if (rec && rec.teacher_credits > 0) {
            const next = { ...rec, teacher_credits: rec.teacher_credits - 1, teacher_spent_total: Number(rec.teacher_spent_total || 0) + 1 };
            await window.dataSdk.update(next);
            if (Array.isArray(window.allData)) {
              window.allData = window.allData.map(r => r.__backendId === rec.__backendId ? next : r);
            }
          }
        }
        if (typeof window.logCredit === 'function') {
          try {
            await window.logCredit('generate_sentence', -1, `Generated example sentence for "${word}"`);
          } catch (_) {}
        }
      }

      // Immediately update visible credit balance counter in header/nav without page refresh
      if (typeof window.updateTeacherCreditBalance === 'function') {
        window.updateTeacherCreditBalance();
      }
    } catch (e) {
      displayToast(e.message || 'Could not generate a sentence.', 'error');
    } finally {
      btn.dataset.busy = '0';
      btn.classList.remove('is-generating');
      if (textSpan) textSpan.textContent = 'Generate';
      syncButtonState(btn);
    }
  }

  function enhance() {
    PAIRS.forEach(([sid, wid]) => {
      const input = document.getElementById(sid);
      if (!input) return;

      if (input.dataset.sg) {
        const existingBtn = input.parentNode?.querySelector('.sg-btn');
        if (existingBtn) syncButtonState(existingBtn);
        return;
      }

      input.dataset.sg = '1';
      const wrap = document.createElement('div');
      wrap.className = 'sg-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-ai-generate sg-btn' + (sid === 'edit-word-sentence' ? ' sg-edit' : '');
      btn.innerHTML = `${SPARKLE_SVG}<span class="ai-btn-text">Generate</span>`;

      // Intercept clicks on wrapper if disabled due to zero credits
      wrap.addEventListener('click', (ev) => {
        if (btn.dataset.busy === '1') return;
        const admin = isUserAdmin();
        const balance = getTeacherBalance();
        if (!admin && balance < 1 && (ev.target === btn || btn.contains(ev.target))) {
          ev.preventDefault();
          ev.stopPropagation();
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          showInsufficientCreditsToast();
        }
      }, true);

      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (btn.dataset.busy === '1') return;
        const admin = isUserAdmin();
        const balance = getTeacherBalance();
        if (!admin && balance < 1) {
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          showInsufficientCreditsToast();
          return;
        }
        generate(input, document.getElementById(wid), btn);
      });

      wrap.appendChild(btn);
      syncButtonState(btn);
    });
  }

  function syncAll() {
    document.querySelectorAll('.sg-btn').forEach(syncButtonState);
  }

  window.addEventListener('teacher-credits-updated', syncAll);
  window.addEventListener('storage', syncAll);

  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
