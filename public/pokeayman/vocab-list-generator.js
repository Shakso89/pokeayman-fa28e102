Warning: truncated output (original token count: 13073)
Total output lines: 1033

// AI Vocabulary List Generator for PokéAyman
// AI models approve sentences first; pixel-level matching follows.
// The teacher reviews the draft before any records or credits change.

(function () {
  let isGenerating = false;
  let activeMode = 'words'; // 'words' | 'photo'
  let uploadedPhotoBase64 = '';
  let selectedPhotoCount = 5;

  function parseWordsFromText(text) {
    return String(text || '')
      .trim()
      .split(/[\s,]+/)
      .map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim())
      .filter(w => w.length > 0 && w.length <= 60);
  }

  // Mirrors the server rule: a sentence is only usable when it actually uses the
  // teacher's word (or the plural of it), never a different word.
  function sentenceUsesWord(sentence, word) {
    const text = String(sentence || '').toLowerCase();
    const target = String(word || '').trim().toLowerCase();
    if (!text || !target) return false;
    if (target.includes(' ')) {
      return new RegExp(`(^|[^a-z])${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(text);
    }
    const variants = new Set([target, target + 's', target + 'es', target + 'ed', target + 'ing']);
    if (target.length > 2 && target.endsWith('y')) {
      variants.add(target.slice(0, -1) + 'ies');
      variants.add(target.slice(0, -1) + 'ied');
    }
    if (target.length > 2 && target.endsWith('e')) variants.add(target.slice(0, -1) + 'ing');
    const tokens = text.match(/[a-z0-9']+/g) || [];
    return tokens.some(token => variants.has(token));
  }

  function getTeacherBalance() {
    if (typeof window.getTeacherCredits === 'function') {
      return window.getTeacherCredits();
    }
    const identity = String(window.currentTeacher || '').trim().toLocaleLowerCase();
    if (identity === 'ayman' || identity === 'teacher ayman') return Infinity;
    const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : null;
    return rec ? (rec.teacher_credits === -1 ? Infinity : (rec.teacher_credits || 0)) : 0;
  }

  function formatBalance(bal) {
    return bal === Infinity ? 'Unlimited' : `${bal} credit${bal === 1 ? '' : 's'}`;
  }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const isStoredImage = value => /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(String(value || ''));

  function getTargetClassInfo() {
    const ctx = typeof window.getNavClassContext === 'function' ? window.getNavClassContext() : {};
    const school = String(ctx.school || window.navSchool || '').trim();
    const className = String(ctx.className || window.navClass || '').trim();
    return { school, className };
  }

  function openGenerateModal() {
    const existingModal = document.getElementById('vocab-gen-popup-modal');
    if (existingModal) { existingModal.querySelector('button')?.focus(); return; }
    const controller = new AbortController();
    let closed = false;
    let isSaving = false;
    let draft = null;
    let saveDraft = null;
    let draftPersisted = false;

    // Read list name from current input field if teacher already typed one (e.g. "tester")
    const inputListName = document.getElementById('new-vocab-list-name')?.value?.trim() || '';

    const { school, className } = getTargetClassInfo();
    activeMode = 'words';
    uploadedPhotoBase64 = '';
    selectedPhotoCount = 'all';
    isGenerating = false;

    // Available classes (mandatory selection)
    const allClasses = typeof window.getAllTeacherClasses === 'function' ? window.getAllTeacherClasses() : [];
    const resolvedClasses = allClasses.length ? allClasses : (window.allData || []).filter(r => r.type === 'class' && r.class_name);
    const classOptionsHtml = resolvedClasses.map(c => 
      `<option value="${escapeHtml(c.school_name || '')}||${escapeHtml(c.class_name)}" ${c.school_name === school && c.class_name === className ? 'selected' : ''}>${escapeHtml(c.class_name)}${c.school_name ? ` (${escapeHtml(c.school_name)})` : ''}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.id = 'vocab-gen-popup-modal';
    modal.className = 'teacher-vb-create-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="teacher-vb-create-dialog" style="max-width:38rem; width:100%;">
        <div class="teacher-vb-create-heading">
          <h4 style="display:flex; align-items:center; gap:8px;">
            Generate Vocabulary List
          </h4>
          <button id="vocab-gen-popup-close" type="button" aria-label="Close" style="cursor:pointer;">&times;</button>
        </div>

        <form id="vocab-gen-popup-form" style="display:flex; flex-direction:column; gap:14px;" onsubmit="return false;">
          <!-- List Name -->
          <label class="teacher-vb-create-field">
            <span>List name</span>
            <input id="vocab-gen-name-input" type="text" maxlength="80" placeholder="e.g. Unit 5 Verbs or Animals" value="${escapeHtml(inputListName)}" required>
          </label>

          <!-- Class selector (mandatory) -->
          <label class="teacher-vb-create-field">
            <span>Class <strong style="color:#ef4444;">*</strong></span>
            <select id="vocab-gen-class-select" required>
              <option value="">Choose a class (required)</option>
              ${classOptionsHtml}
            </select>
          </label>

          <!-- Generation Mode Switcher (Words vs Photo) -->
          <div>
            <span style="display:block; font-size:12px; font-weight:700; color:var(--pk-ink, #f8fafc); margin-bottom:6px;">How do you want to generate?</span>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <button type="button" id="vocab-gen-mode-words" class="vocab-gen-tab-btn active" style="padding:10px 12px; border-radius:8px; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;">
                Write Words
              </button>
              <button type="button" id="vocab-gen-mode-photo" class="vocab-gen-tab-btn" style="padding:10px 12px; border-radius:8px; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;">
                Upload Photo
              </button>
            </div>
          </div>

          <!-- Mode 1: Words with spaces between -->
          <div id="vocab-gen-section-words" style="display:flex; flex-direction:column; gap:6px;">
            <label class="teacher-vb-create-field">
              <span>Enter words with spaces between (or commas)</span>
              <textarea id="vocab-gen-text-input" rows="3" placeholder="e.g. pencil cat apple blue book dog lion" style="width:100%; border-radius:8px; padding:10px 12px; background:var(--pk-surface, #0b1220); color:#fff; border:1px solid rgba(148,163,184,.35); font-size:14px; resize:none;"></textarea>
            </label>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:rgba(255,255,255,0.7);">
              <span id="vocab-gen-words-count-label">0 words detected</span>
              <span style="color:#fde047; font-weight:700;">1 credit per word</span>
            </div>
          </div>

          <!-- Mode 2: Photo Upload (Tender Dolphin by akshat-patel28) -->
          <div id="vocab-gen-section-photo" style="display:none; flex-direction:column; gap:12px;">
            <div id="vocab-gen-photo-dropzone" class="tender-dolphin-dropzone">
              <input type="file" id="vocab-gen-photo-file" accept="image/*" class="tender-dolphin-input">
              <div id="vocab-gen-photo-prompt" class="tender-dolphin-container">
                <div class="tender-dolphin-input-div">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" class="tender-dolphin-icon">
                    <polyline points="16 16 12 12 8 16"></polyline>
                    <line y2="21" x2="12" y1="12" x1="12"></line>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                    <polyline points="16 16 12 12 8 16"></polyline>
                  </svg>
                </div>
                <div class="tender-dolphin-text-wrap">
                  <span class="tender-dolphin-main-text">Click or drop a photo here</span>
                  <span class="tender-dolphin-sub-text">Textbook page, real scene, flashcard, etc.</span>
                </div>
              </div>
              <div id="vocab-gen-photo-preview-wrap" style="display:none; position:relative; width:100%; text-align:center;">
                <img id="vocab-gen-photo-preview-img" src="" alt="Photo preview" style="max-height:160px; margin:0 auto; border-radius:8px; object-fit:contain; border:1px solid rgba(255,255,255,0.15);">
                <button type="button" id="vocab-gen-photo-remove" style="position:absolute; top:6px; right:6px; background:rgba(220,38,38,0.92); color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:700; box-shadow:0 2px 6px rgba(0,0,0,0.3); transition:background 0.2s;">✕ Remove</button>
              </div>
            </div>

            <!-- Word Extraction Count Controls (All vs Manual Number Input) -->
            <div class="vocab-gen-extract-count-card">
              <span class="vocab-gen-count-title">Extract how many words?</span>
              <div class="vocab-gen-count-controls">
                <button type="button" id="vocab-gen-count-all" class="vocab-gen-count-toggle-btn is-selected">
                  All words
                </button>
                <div class="vocab-gen-custom-count-box">
                  <span class="vocab-gen-custom-label">or enter number:</span>
                  <div class="vocab-gen-number-input-wrap">
                    <input type="number" id="vocab-gen-custom-count-input" min="1" max="30" placeholder="e.g. 5" class="vocab-gen-number-input">
                    <span class="vocab-gen-number-unit">words</span>
                  </div>
                </div>
              </div>
              <p id="vocab-gen-count-caption" class="vocab-gen-count-caption">Extracts all vocabulary words found in the photo (1 credit per word).</p>
            </div>
          </div>

          <!-- Status & Balance Banner -->
          <div style="padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:12px;">
            <div>
              <div style="font-weight:700; color:#fff;">Cost: <span id="vocab-gen-cost-label" style="color:#fde047;">0</span> credits</div>
              <div style="opacity:0.7; font-size:11px;">Your balance: <span id="vocab-gen-balance-label">...</span></div>
            </div>
            <div id="vocab-gen-badge" style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; background:rgba(16,185,129,0.2); color:#6ee7b7;">
              Ready
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div id="vocab-gen-error-banner" style="display:none; padding:10px 12px; border-radius:8px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-size:12px; font-weight:600;"></div>

          <!-- Submit Button -->
          <button id="vocab-gen-submit-button" type="button" class="btn-ai-generate btn-ai-generate-full" style="margin-top:4px; cursor:pointer;" title="Generate vocabulary list with AI">
            <svg class="ai-sparkle-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"></path></svg>
            <span class="ai-btn-text">Generate List</span>
          </button>
        </form>

        <section id="vocab-gen-review" class="vocab-gen-review" hidden aria-label="Review vocabulary pictures">
          <h5 tabindex="-1">Review your vocabulary list</h5>
          <p>Check that each picture explains the whole sentence. Nothing is saved or charged until you save this list.</p>
          <div id="vocab-gen-review-items"></div>
          <p id="vocab-gen-review-error" role="alert" hidden></p>
          <div class="vocab-gen-review-footer">
            <span id="vocab-gen-review-summary" aria-live="polite"></span>
            <button type="button" id="vocab-gen-save" class="btn-primary">Save list</button>
            <button type="button" id="vocab-gen-cancel">Cancel</button>
          </div>
        </section>

        <!-- Loading Progress with Dexter-st Bright-Lizard-8 AI Orb -->
        <div id="vocab-gen-progress-wrap" class="vocab-gen-generating-screen" style="display:none;">
          <div class="loader-wrapper bl8-loader-wrapper">
            <span class="loader-letter bl8-loader-letter">G</span>
            <span class="loader-letter bl8-loader-letter">e</span>
            <span class="loader-letter bl8-loader-letter">n</span>
            <span class="loader-letter bl8-loader-letter">e</span>
            <span class="loader-letter bl8-loader-letter">r</span>
            <span class="loader-letter bl8-loader-letter">a</span>
            <span class="loader-letter bl8-loader-letter">t</span>
            <span class="loader-letter bl8-loader-letter">i</span>
            <span class="loader-letter bl8-loader-letter">n</span>
            <span class="loader-letter bl8-loader-letter">g</span>
            <div class="loader bl8-loader"></div>
          </div>

          <div class="vocab-gen-status-badge">
            <span class="ai-sparkle-pulse">✦</span>
            <span id="vocab-gen-status-text">Step 1/3: Writing contextual sentences...</span>
          </div>

          <div class="vocab-gen-progress-track">
            <div id="vocab-gen-progress-fill" class="vocab-gen-progress-bar"></div>
          </div>

          <div class="vocab-gen-generating-subhint">
            Crafting contextual sentences, definitions & visual prompts for your classroom...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // References
    const closeBtn = modal.querySelector('#vocab-gen-popup-close');
    const nameInput = modal.querySelector('#vocab-gen-name-input');
    const modeWordsBtn = modal.querySelector('#vocab-gen-mode-words');
    const modePhotoBtn = modal.querySelector('#vocab-gen-mode-photo');
    const sectionWords = modal.querySelector('#vocab-gen-section-words');
    const sectionPhoto = modal.querySelector('#vocab-gen-section-photo');
    const textInput = modal.querySelector('#vocab-gen-text-input');
    const wordsCountLabel = modal.querySelector('#vocab-gen-words-count-label');
    const photoDropzone = modal.querySelector('#vocab-gen-photo-dropzone');
    const photoFileInput = modal.querySelector('#vocab-gen-photo-file');
    const photoPrompt = modal.querySelector('#vocab-gen-photo-prompt');
    const photoPreviewWrap = modal.querySelector('#vocab-gen-photo-preview-wrap');
    const photoPreviewImg = modal.querySelector('#vocab-gen-photo-preview-img');
    const photoRemoveBtn = modal.querySelector('#vocab-gen-photo-remove');
    const costLabel = modal.querySelector('#vocab-gen-cost-label');
    const balanceLabel = modal.querySelector('#vocab-gen-balance-label');
    const badgeEl = modal.querySelector('#vocab-gen-badge');
    const errorBanner = modal.querySelector('#vocab-gen-error-banner');
    const progressWrap = modal.querySelector('#vocab-gen-progress-wrap');
    const statusTextEl = modal.querySelector('#vocab-gen-status-text');
    const progressFillEl = modal.querySelector('#vocab-gen-progress-fill');
    const submitBtn = modal.querySelector('#vocab-gen-submit-button');
    const countAllBtn = modal.querySelector('#vocab-gen-count-all');
    const customCountInput = modal.querySelector('#vocab-gen-custom-count-input');
    const countCaption = modal.querySelector('#vocab-gen-count-caption');
    const classSelect = modal.querySelector('#vocab-gen-class-select');
    const reviewPanel = modal.querySelector('#vocab-gen-review');
    const reviewItems = modal.querySelector('#vocab-gen-review-items');
    const reviewError = modal.querySelector('#vocab-gen-review-error');
    const saveBtn = modal.querySelector('#vocab-gen-save');

    function closeModal() {
      if (isSaving) return;
      closed = true;
      controller.abort();
      isGenerating = false;
      modal.remove();
    }

    closeBtn.addEventListen…4073 tokens truncated…ile(file);
    });

    function loadPhotoFile(file) {
      if (file.size > 8 * 1024 * 1024) {
        errorBanner.textContent = 'Photo must be under 8MB.';
        errorBanner.style.display = 'block';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPhotoBase64 = e.target.result;
        photoPreviewImg.src = uploadedPhotoBase64;
        photoPrompt.style.display = 'none';
        photoPreviewWrap.style.display = 'block';
        errorBanner.style.display = 'none';
        updateModalUI();
      };
      reader.readAsDataURL(file);
    }

    photoRemoveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedPhotoBase64 = '';
      photoPreviewImg.src = '';
      photoFileInput.value = '';
      photoPrompt.style.display = 'block';
      photoPreviewWrap.style.display = 'none';
      updateModalUI();
    });

    const popupForm = modal.querySelector('#vocab-gen-popup-form');

    function setGenerating(generating, text = '', pct = 0) {
      isGenerating = generating;
      nameInput.disabled = generating;
      textInput.disabled = generating;
      submitBtn.disabled = generating;
      closeBtn.disabled = isSaving;
      modeWordsBtn.disabled = generating;
      modePhotoBtn.disabled = generating;
      if (classSelect) classSelect.disabled = generating;

      if (generating) {
        if (popupForm) popupForm.style.display = 'none';
        progressWrap.style.display = 'flex';
        statusTextEl.textContent = text;
        progressFillEl.style.width = `${pct}%`;
        submitBtn.innerHTML = `Generating...`;
      } else {
        progressWrap.style.display = 'none';
        if (popupForm) popupForm.style.display = 'flex';
        submitBtn.innerHTML = `<svg class="ai-sparkle-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"></path></svg><span class="ai-btn-text">Generate List</span>`;
      }
    }

    // Submit handler
    submitBtn.addEventListener('click', async () => {
      if (isGenerating || draft || closed) return;

      const listName = nameInput.value.trim().replace(/\s+/g, ' ');
      if (!listName) {
        errorBanner.textContent = 'Please enter a name for the vocabulary list.';
        errorBanner.style.display = 'block';
        nameInput.focus();
        return;
      }

      let targetSchool = school;
      let targetClass = className;
      if (classSelect) {
        if (!classSelect.value) {
          errorBanner.textContent = 'Selecting a class is required. Please choose a class before generating the list.';
          errorBanner.style.display = 'block';
          classSelect.focus();
          classSelect.style.borderColor = '#ef4444';
          return;
        }
        const parts = classSelect.value.split('||');
        targetSchool = parts[0] || targetSchool;
        targetClass = parts[1] || targetClass;
      }

      if (!targetClass) {
        errorBanner.textContent = 'Selecting a class is required. Please choose a class before generating the list.';
        errorBanner.style.display = 'block';
        if (classSelect) {
          classSelect.focus();
          classSelect.style.borderColor = '#ef4444';
        }
        return;
      }

      let words = [];
      if (activeMode === 'words') {
        words = getEnteredWords();
        if (!words.length || words.length > 30) {
          errorBanner.textContent = 'Please enter between 1 and 30 words (with spaces between).';
          errorBanner.style.display = 'block';
          textInput.focus();
          return;
        }
      } else {
        if (!uploadedPhotoBase64) {
          errorBanner.textContent = 'Please choose or drop a photo to analyze.';
          errorBanner.style.display = 'block';
          return;
        }
      }

      const expectedCount = activeMode === 'words' ? words.length : (selectedPhotoCount === 'all' ? 1 : selectedPhotoCount);
      const balance = getTeacherBalance();
      if (balance !== Infinity && balance < expectedCount) {
        errorBanner.textContent = `Insufficient credits! You need at least ${expectedCount} credit${expectedCount === 1 ? '' : 's'}, but you have ${balance}.`;
        errorBanner.style.display = 'block';
        return;
      }

      errorBanner.style.display = 'none';

      let itemsWithImages = [];

      if (activeMode === 'words') {
        // STEP 1: Write a sentence for every word first
        setGenerating(true, 'Step 1/3: Writing contextual sentences...', 30);
        const generatedMap = new Map();
        try {
          const payload = { mode: 'words', items: words.map(w => ({ word: w, picture: '' })) };
          const data = await postJson('/api/generate-vocab-list', payload);
          if (closed) return;
          (Array.isArray(data.items) ? data.items : []).forEach(it => {
            if (it.word && it.sentence) generatedMap.set(it.word.toLowerCase(), it.sentence);
          });
        } catch (apiErr) {
          if (closed) return;
          setGenerating(false);
          errorBanner.textContent = apiErr.message || 'The sentences could not be written. Please try again.';
          errorBanner.style.display = 'block';
          updateModalUI();
          return;
        }

        const missingWords = [];
        itemsWithImages = [];
        for (const w of words) {
          let sentence = String(generatedMap.get(w.toLowerCase()) || '').trim();
          if (sentence && !sentenceUsesWord(sentence, w)) sentence = '';
          if (!sentence) missingWords.push(w);
          itemsWithImages.push({ word: w, imageUrl: '', sentence });
        }

        if (missingWords.length) {
          setGenerating(false);
          errorBanner.textContent = `Could not generate a usable sentence for ${missingWords.map(w => `"${w}"`).join(', ')}. Please try again.`;
          errorBanner.style.display = 'block';
          updateModalUI();
          return;
        }
      } else {
        // Photo upload mode
        setGenerating(true, 'Step 1/3: Scanning photo & extracting words...', 35);
        let photoItems = [];

        try {
          const payload = {
            mode: 'photo',
            image: uploadedPhotoBase64,
            count: selectedPhotoCount === 'all' ? 'all' : Number(selectedPhotoCount)
          };

          const data = await postJson('/api/generate-vocab-list', payload);
          if (closed) return;
          photoItems = Array.isArray(data.items) ? data.items : [];
        } catch (err) {
          if (closed) return;
          console.error('Photo mode AI error:', err);
          setGenerating(false);
          errorBanner.textContent = err.message || 'Photo analysis failed. No credits were deducted.';
          errorBanner.style.display = 'block';
          updateModalUI();
          return;
        }

        // Both entry modes share the same final-sentence media matching below.
        for (let i = 0; i < photoItems.length; i++) {
          const it = photoItems[i];
          const sentence = String(it.sentence || '').trim();

          if (!sentence || !sentenceUsesWord(sentence, it.word)) {
            setGenerating(false);
            errorBanner.textContent = `Could not generate a usable sentence for "${it.word}". Please try again.`;
            errorBanner.style.display = 'block';
            updateModalUI();
            return;
          }

          itemsWithImages.push({
            word: it.word,
            sentence,
            imageUrl: ''
          });
        }
      }

      if (!itemsWithImages.length) {
        setGenerating(false);
        errorBanner.textContent = 'Could not generate vocabulary items. No credits deducted.';
        errorBanner.style.display = 'block';
        updateModalUI();
        return;
      }

      draft = itemsWithImages.map((item, index) => ({ ...item, id: `item-${index + 1}`, mediaStatus: 'needs_review', approvedSentence: '', withoutImage: false, searchType: 'photo', candidates: [] }));
      for (let i = 0; i < draft.length; i++) {
        if (closed) return;
        setGenerating(true, `Step 2/3: Finding illustrations & pictures for "${draft[i].word}" (${i + 1}/${draft.length})...`, 50 + Math.round((i / draft.length) * 35));
        await matchItem(draft[i]);
      }
      if (closed) return;
      itemsWithImages = draft;

      const listId = `vocab-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const teacherCtx = typeof window.getCurrentTeacherContext === 'function' ? window.getCurrentTeacherContext() : {};
      const teacherName = teacherCtx.teacherName || window.currentTeacher || (typeof currentTeacher !== 'undefined' ? currentTeacher : '') || 'Teacher';
      const teacherId = teacherCtx.teacherId || window.currentTeacherRecordId || (typeof currentTeacherRecordId !== 'undefined' ? currentTeacherRecordId : '') || (typeof verifiedTeacherIdentity === 'function' ? verifiedTeacherIdentity() : '') || '';

      // The whole list is written atomically with stable IDs for safe retries.
      let creditsDeducted = false;
      let saveComplete = false;
      const listBackendId = crypto.randomUUID();
      const wordBackendIds = itemsWithImages.map(() => crypto.randomUUID());

      saveDraft = async () => {
      if (isSaving || saveComplete || closed || itemsWithImages.some(item => item.busy || !itemResolved(item))) return;
      if (getTeacherBalance() < itemsWithImages.length) {
        reviewError.textContent = `Insufficient credits. You need ${itemsWithImages.length} credits to save this list.`;
        reviewError.hidden = false;
        return;
      }
      isSaving = true;
      reviewPanel.hidden = true;
      setGenerating(true, 'Step 3/3: Saving vocabulary list to classroom...', 90);
      const firstValidImage = itemsWithImages.find(item => item.imageUrl && itemResolved(item))?.imageUrl || '';
      const listRecord = {
        __backendId: listBackendId,
        type: 'vocab_list',
        vocab_list_id: listId,
        vocab_list_name: listName,
        vocab_list_school: targetSchool,
        vocab_list_class: targetClass,
        school_name: targetSchool,
        class_name: targetClass,
        owner: teacherName,
        teacher_name: teacherName,
        teacher_id: teacherId,
        created_by: teacherName,
        ai_creator_teacher: teacherName,
        ai_creator_id: teacherId,
        is_ai_generated: true,
        ai_generated: true,
        generation_source: 'ai',
        vocab_media_policy: 'sentence-reviewed-v1',
        created_at: new Date().toISOString(),
        vocab_word: '',
        vocab_image: '',
        vocab_cover_image_id: '',
        vocab_cover_image_url: firstValidImage, // Cover is one of the pictures inside the list
        student_name: '',
        coins: 0,
        pokemon_id: 0,
        pokemon_name: '',
        pokemon_rarity: '',
        pokemon_price: 0,
        pokemon_power: 0,
        quiz_question: '',
        quiz_answer: '',
        quiz_reward: 0,
        quiz_solved_by: '',
        quiz_type: '',
        quiz_options: '',
        quiz_image: '',
        teacher_pin: '',
        teacher_role: '',
        avatar_pokemon_id: 0,
        teacher_credits: 0,
        log_action: '',
        log_amount: 0,
        log_target: '',
        shop_pokemon_id: 0,
        shop_pokemon_name: '',
        shop_pokemon_rarity: '',
        shop_pokemon_price: 0,
        shop_pokemon_power: 0,
        shop_pokemon_hp: 0,
        quiz_folder: '',
        folder_name: '',
        archived: false,
        quiz_attempts: '',
        quiz_created_by: teacherName,
        quiz_class: targetClass,
        quiz_submitted_answers: ''
      };

      try {
        if (!window.dataSdk || typeof window.dataSdk.createMany !== 'function') {
          throw new Error('Database SDK is not available.');
        }

        const wordPayloads = [];
        for (let index = 0; index < itemsWithImages.length; index++) {
          const item = itemsWithImages[index];
          const wordId = `vocab-word-${listId}-${index + 1}`;
          const wordPayload = {
            __backendId: wordBackendIds[index],
            type: 'vocab_word',
            vocab_list_id: listId,
            list_id: listId,
            vocabulary_list_id: listId,
            school_name: targetSchool,
            class_name: targetClass,
            vocab_list_school: targetSchool,
            vocab_list_class: targetClass,
            vocab_list_name: listName,
            vocab_word_id: wordId,
            word_id: wordId,
            vocab_word: item.word,
            vocab_image: item.imageUrl,
            vocab_sentence: item.sentence,
            vocab_media_policy: 'sentence-reviewed-v1',
            vocab_media_status: item.withoutImage ? 'omitted' : item.mediaStatus,
            vocab_media_type: item.withoutImage ? '' : item.mediaType,
            is_ai_generated: true,
            created_at: new Date().toISOString(),
            teacher_name: teacherName,
            owner: teacherName,
            created_by: teacherName,
            ai_creator_teacher: teacherName,
            ai_creator_id: teacherId
          };

          wordPayloads.push(wordPayload);
        }
        if (!draftPersisted) {
          const result = await window.dataSdk.createMany([listRecord, ...wordPayloads], { notify: false });
          if (!result?.isOk) throw new Error('Could not save the complete vocabulary list. No credits were deducted. Please retry.');
          draftPersisted = true;
        }

        // STEP 4: Deduct credits strictly AFTER successful creation
        const finalWordCount = itemsWithImages.length;
        if (!creditsDeducted) {
          if (typeof window.deductTeacherCredits !== 'function') throw new Error('Credit service is unavailable. No credits were deducted.');
          const paid = await window.deductTeacherCredits(finalWordCount);
          if (paid !== true) throw new Error('Could not update your credits. Retry saving this list.');
          creditsDeducted = true;
        }
        saveComplete = true;
        if (typeof window.logCredit === 'function') {
          try { await window.logCredit('generate_vocab_list', -finalWordCount, `Generated ${finalWordCount} words for "${listName}"`); }
          catch (err) { console.warn('Could not record credit log:', err); }
        }
        if (typeof window.dataSdk.init === 'function' && window.handler) {
          try { await window.dataSdk.init(window.handler); } catch (err) { console.warn('Could not refresh lists:', err); }
        }
        if (typeof window.updateTeacherCreditBalance === 'function') {
          window.updateTeacherCreditBalance();
        }

        // Clear create list input
        const mainInput = document.getElementById('new-vocab-list-name');
        if (mainInput) mainInput.value = '';

        isSaving = false;
        closed = true;
        controller.abort();
        isGenerating = false;
        modal.remove();

        if (typeof window.renderVocabLists === 'function') window.renderVocabLists();
        if (typeof window.renderGamesList === 'function') window.renderGamesList();
        if (typeof window.renderTeacherOwnedVocabLists === 'function') window.renderTeacherOwnedVocabLists();

        if (typeof window.toast === 'function') {
          window.toast(`Generated "${listName}" with ${finalWordCount} words! (-${finalWordCount} credits)`);
        }
      } catch (saveErr) {
        console.error('Saving vocabulary list error:', saveErr);
        // Keep the reviewed draft and successful writes for a safe retry.
        isSaving = false;
        reviewError.textContent = saveErr.message || 'Failed to save list. Please retry.';
        reviewError.hidden = false;
        showReview();
      }
      };
      showReview();
      reviewPanel.querySelector('h5').focus();
    });

    updateModalUI();
    nameInput.focus();
  }

  window.openVocabGenerateModal = openGenerateModal;
  function bindGenerateBtn() {
    ['generate-vocab-list-btn', 'teacher-vb-open-ai'].forEach(bindOne);
  }
  function bindOne(id) {
    const btn = document.getElementById(id);
    if (btn && !btn.dataset.generatorBound) {
      btn.dataset.generatorBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGenerateModal();
      });
    }
  }

  if (document.readyState !== 'loading') {
    bindGenerateBtn();
  } else {
    document.addEventListener('DOMContentLoaded', bindGenerateBtn);
  }

  new MutationObserver(bindGenerateBtn).observe(document.documentElement, { childList: true, subtree: true });
})();

