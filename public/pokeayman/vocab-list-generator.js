// AI Vocabulary List Generator for PokéAyman
// Step 1: Picks high quality picture for each word (animal, food, color, etc.)
// Step 2: Generates simple, vivid, non-shallow sentence directly related to that picture
// Step 3: Ensures 100% sentence uniqueness (no duplicate sentence frames in the same list)
// Step 4: Saves list with creator teacher name + marks list with AI Generated badge
// Step 5: Charges 1 credit/word strictly upon success.

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

  // Choose a top quality photo of that word first, returning URL and photo description/tags
  const PHOTO_STOP = new Set('a an the is are was were be been am i you he she it we they my your his her its our their this that these those of in on at to for with and or but from by up down over under into out very so too can will has have had do does did not no yes some any one two three red blue green big small little'.split(' '));
  function sentenceKeywords(word, sentence) {
    const target = String(word || '').toLowerCase();
    return String(sentence || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
      .filter(t => t.length > 2 && !PHOTO_STOP.has(t) && !t.startsWith(target.slice(0, 4))).slice(0, 2);
  }

  // Picture search: AI phrase written with the FINAL sentence first, then word + sentence
  // keywords, then the word alone. Results are checked against tags, illustrations preferred.
  async function fetchPhotoForWord(word, sentence, picture) {
    if (!word) return { url: '', tags: '' };
    const w = word.trim();
    const queries = [];
    const pic = String(picture || '').trim();
    if (pic) queries.push(pic);
    const extra = sentenceKeywords(word, sentence);
    if (extra.length) queries.push(`${w} ${extra.join(' ')}`);
    queries.push(w);
    const seen = new Set();
    let fallback = null;
    for (const q of queries) {
      if (seen.has(q.toLowerCase())) continue;
      seen.add(q.toLowerCase());
      for (const type of ['illustration', 'all']) {
        const hit = await searchPhoto(q, w, type);
        if (hit.url && hit.matched) return hit;
        if (hit.url && !fallback) fallback = hit;
      }
    }
    return fallback || { url: '', tags: '' };
  }

  function tagsMatch(tags, word) {
    const t = String(tags || '').toLowerCase();
    const root = String(word || '').toLowerCase().trim();
    if (!t || !root) return false;
    return t.includes(root) || (root.length > 4 && t.includes(root.slice(0, root.length - 1)));
  }

  async function searchPhoto(query, word, imageType) {
    if (!query || typeof window.pexelsFetch !== 'function') return { url: '', tags: '' };
    try {
      const res = await window.pexelsFetch(`/api/public/pexels?query=${encodeURIComponent(query)}&per_page=10&image_type=${imageType || 'all'}`, {
        headers: { 'Authorization': '' }
      });
      if (res.ok) {
        const data = await res.json();
        const photos = (data.photos || []).filter(p => p?.src?.large || p?.src?.medium);
        const photo = photos.find(p => tagsMatch(p.alt, word)) || photos[0];
        if (photo) {
          return {
            url: photo.src.large || photo.src.medium,
            tags: String(photo.alt || photo.photographer || '').slice(0, 150),
            matched: tagsMatch(photo.alt, word)
          };
        }
      }
    } catch (err) {
      console.warn(`Could not fetch photo for "${query}":`, err);
    }
    return { url: '', tags: '' };
  }

  function getTargetClassInfo() {
    const ctx = typeof window.getNavClassContext === 'function' ? window.getNavClassContext() : {};
    const school = String(ctx.school || window.navSchool || '').trim();
    const className = String(ctx.className || window.navClass || '').trim();
    return { school, className };
  }

  function openGenerateModal() {
    const existingModal = document.getElementById('vocab-gen-popup-modal');
    if (existingModal) existingModal.remove();

    // Read list name from current input field if teacher already typed one (e.g. "tester")
    const inputListName = document.getElementById('new-vocab-list-name')?.value?.trim() || '';

    const { school, className } = getTargetClassInfo();
    activeMode = 'words';
    uploadedPhotoBase64 = '';
    selectedPhotoCount = 5;
    isGenerating = false;

    // Available classes (mandatory selection)
    const allClasses = typeof window.getAllTeacherClasses === 'function' ? window.getAllTeacherClasses() : [];
    const resolvedClasses = allClasses.length ? allClasses : (window.allData || []).filter(r => r.type === 'class' && r.class_name);
    const classOptionsHtml = resolvedClasses.map(c => 
      `<option value="${c.school_name || ''}||${c.class_name}" ${c.school_name === school && c.class_name === className ? 'selected' : ''}>${c.class_name}${c.school_name ? ` (${c.school_name})` : ''}</option>`
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
            <span>⚡</span> Generate Vocabulary List
          </h4>
          <button id="vocab-gen-popup-close" type="button" aria-label="Close" style="cursor:pointer;">&times;</button>
        </div>

        <form id="vocab-gen-popup-form" style="display:flex; flex-direction:column; gap:14px;" onsubmit="return false;">
          <!-- List Name -->
          <label class="teacher-vb-create-field">
            <span>List name</span>
            <input id="vocab-gen-name-input" type="text" maxlength="80" placeholder="e.g. Unit 5 Verbs or Animals" value="${inputListName.replace(/"/g, '&quot;')}" required>
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
                <span>📝</span> Write Words
              </button>
              <button type="button" id="vocab-gen-mode-photo" class="vocab-gen-tab-btn" style="padding:10px 12px; border-radius:8px; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;">
                <span>📷</span> Upload Photo
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

          <!-- Mode 2: Photo Upload -->
          <div id="vocab-gen-section-photo" style="display:none; flex-direction:column; gap:10px;">
            <div id="vocab-gen-photo-dropzone" style="border:2px dashed rgba(148,163,184,.4); border-radius:10px; padding:16px; text-align:center; cursor:pointer; background:rgba(255,255,255,0.02); transition:all 0.2s ease;">
              <input type="file" id="vocab-gen-photo-file" accept="image/*" style="display:none;">
              <div id="vocab-gen-photo-prompt">
                <div style="font-size:28px; margin-bottom:4px;">📸</div>
                <div style="font-weight:700; font-size:13px;">Click or drop a photo here</div>
                <div style="font-size:11px; opacity:0.7; margin-top:2px;">Textbook page, real scene, flashcard, etc.</div>
              </div>
              <div id="vocab-gen-photo-preview-wrap" style="display:none; position:relative;">
                <img id="vocab-gen-photo-preview-img" src="" alt="Photo preview" style="max-height:140px; margin:0 auto; border-radius:6px; object-fit:contain;">
                <button type="button" id="vocab-gen-photo-remove" style="position:absolute; top:4px; right:4px; background:rgba(220,38,38,0.9); color:#fff; border:none; border-radius:4px; padding:2px 8px; font-size:11px; cursor:pointer; font-weight:700;">✕ Remove</button>
              </div>
            </div>

            <div>
              <span style="display:block; font-size:12px; font-weight:700; color:var(--pk-ink, #f8fafc); margin-bottom:4px;">Extract how many words?</span>
              <div style="display:flex; gap:8px;">
                <button type="button" class="vocab-gen-count-btn" data-count="3" style="flex:1; padding:6px 0; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">3 words</button>
                <button type="button" class="vocab-gen-count-btn is-selected" data-count="5" style="flex:1.4; padding:6px 0; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">5 words (best)</button>
                <button type="button" class="vocab-gen-count-btn" data-count="8" style="flex:1; padding:6px 0; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">8 words</button>
                <button type="button" class="vocab-gen-count-btn" data-count="10" style="flex:1; padding:6px 0; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">10 words</button>
              </div>
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

          <!-- Loading Progress Bar -->
          <div id="vocab-gen-progress-wrap" style="display:none; flex-direction:column; gap:6px; padding:10px 12px; border-radius:8px; background:rgba(79,70,229,0.2); border:1px solid rgba(99,102,241,0.4);">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:16px; height:16px; border:2px solid #818cf8; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
              <span id="vocab-gen-status-text" style="font-size:12px; font-weight:700; color:#c7d2fe;">Finding pictures and generating vivid sentences...</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(255,255,255,0.15); border-radius:2px; overflow:hidden;">
              <div id="vocab-gen-progress-fill" style="width:25%; height:100%; background:#818cf8; transition:width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Submit Button -->
          <button id="vocab-gen-submit-button" type="button" class="btn-primary" style="margin-top:4px; width:100%; height:44px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;">
            <span>⚡</span> Generate List
          </button>
        </form>
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
    const countBtns = modal.querySelectorAll('.vocab-gen-count-btn');
    const classSelect = modal.querySelector('#vocab-gen-class-select');

    function closeModal() {
      if (isGenerating) return;
      modal.remove();
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal && !isGenerating) closeModal();
    });

    function getEnteredWords() {
      return parseWordsFromText(textInput.value);
    }

    function getWordCost() {
      if (activeMode === 'words') {
        return getEnteredWords().length;
      } else {
        return uploadedPhotoBase64 ? selectedPhotoCount : 0;
      }
    }

    function updateModalUI() {
      const balance = getTeacherBalance();
      const cost = getWordCost();
      const hasClass = classSelect ? Boolean(classSelect.value) : Boolean(className);

      balanceLabel.textContent = formatBalance(balance);
      costLabel.textContent = String(cost);

      if (activeMode === 'words') {
        const count = getEnteredWords().length;
        wordsCountLabel.textContent = `${count} word${count === 1 ? '' : 's'} detected`;
      }

      if (balance !== Infinity && balance < cost) {
        badgeEl.textContent = 'Insufficient credits';
        badgeEl.style.background = 'rgba(239,68,68,0.2)';
        badgeEl.style.color = '#fca5a5';
        submitBtn.disabled = true;
      } else if (!hasClass) {
        badgeEl.textContent = 'Choose a class';
        badgeEl.style.background = 'rgba(234,179,8,0.2)';
        badgeEl.style.color = '#fde047';
        submitBtn.disabled = true;
      } else {
        badgeEl.textContent = cost > 0 ? `${cost} credit${cost === 1 ? '' : 's'}` : 'Ready';
        badgeEl.style.background = 'rgba(16,185,129,0.2)';
        badgeEl.style.color = '#6ee7b7';
        submitBtn.disabled = cost === 0;
      }
    }

    if (classSelect) {
      classSelect.addEventListener('change', () => {
        classSelect.style.borderColor = '';
        errorBanner.style.display = 'none';
        updateModalUI();
      });
    }

    modeWordsBtn.addEventListener('click', () => {
      if (isGenerating) return;
      activeMode = 'words';
      modeWordsBtn.classList.add('active');
      modePhotoBtn.classList.remove('active');
      sectionWords.style.display = 'flex';
      sectionPhoto.style.display = 'none';
      errorBanner.style.display = 'none';
      updateModalUI();
    });

    modePhotoBtn.addEventListener('click', () => {
      if (isGenerating) return;
      activeMode = 'photo';
      modePhotoBtn.classList.add('active');
      modeWordsBtn.classList.remove('active');
      sectionPhoto.style.display = 'flex';
      sectionWords.style.display = 'none';
      errorBanner.style.display = 'none';
      updateModalUI();
    });

    countBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGenerating) return;
        countBtns.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedPhotoCount = Number(btn.dataset.count) || 5;
        updateModalUI();
      });
    });

    textInput.addEventListener('input', () => {
      errorBanner.style.display = 'none';
      updateModalUI();
    });

    photoDropzone.addEventListener('click', (e) => {
      if (isGenerating || e.target === photoRemoveBtn) return;
      photoFileInput.click();
    });

    photoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDropzone.style.borderColor = '#fde047';
    });

    photoDropzone.addEventListener('dragleave', () => {
      photoDropzone.style.borderColor = '';
    });

    photoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDropzone.style.borderColor = '';
      if (isGenerating) return;
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        loadPhotoFile(file);
      }
    });

    photoFileInput.addEventListener('change', () => {
      const file = photoFileInput.files?.[0];
      if (file) loadPhotoFile(file);
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

    function setGenerating(generating, text = '', pct = 0) {
      isGenerating = generating;
      nameInput.disabled = generating;
      textInput.disabled = generating;
      submitBtn.disabled = generating;
      closeBtn.disabled = generating;
      modeWordsBtn.disabled = generating;
      modePhotoBtn.disabled = generating;
      if (classSelect) classSelect.disabled = generating;

      if (generating) {
        progressWrap.style.display = 'flex';
        statusTextEl.textContent = text;
        progressFillEl.style.width = `${pct}%`;
        submitBtn.innerHTML = `<span>⏳</span> Generating...`;
      } else {
        progressWrap.style.display = 'none';
        submitBtn.innerHTML = `<span>⚡</span> Generate List`;
      }
    }

    // Submit handler
    submitBtn.addEventListener('click', async () => {
      if (isGenerating) return;

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
        if (!words.length) {
          errorBanner.textContent = 'Please enter at least one word (with spaces between).';
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

      const expectedCount = activeMode === 'words' ? words.length : selectedPhotoCount;
      const balance = getTeacherBalance();
      if (balance !== Infinity && balance < expectedCount) {
        errorBanner.textContent = `Insufficient credits! You need ${expectedCount} credits, but you have ${balance}.`;
        errorBanner.style.display = 'block';
        return;
      }

      errorBanner.style.display = 'none';

      let itemsWithImages = [];

      if (activeMode === 'words') {
        // STEP 1: Gemini writes a sentence for every word first (ChatGPT checks it).
        setGenerating(true, '1/3 Writing sentences with Gemini...', 30);
        const generatedMap = new Map();
        const pictureMap = new Map();
        try {
          const payload = { mode: 'words', items: words.map(w => ({ word: w, picture: '' })) };
          let res;
          try {
            res = await fetch('/api/generate-vocab-list', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
          } catch (fetchErr) {
            console.warn('generate-vocab-list failed, trying vocabulary-sentence:', fetchErr);
          }
          if (!res || (!res.ok && res.status >= 500 && res.status !== 502)) {
            res = await fetch('/api/vocabulary-sentence', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
          }
          if (res && res.ok) {
            const data = await res.json();
            (Array.isArray(data.items) ? data.items : []).forEach(it => {
              if (it.word && it.sentence) { generatedMap.set(it.word.toLowerCase(), it.sentence); if (it.picture) pictureMap.set(it.word.toLowerCase(), it.picture); }
            });
          } else {
            const errData = await res?.json().catch(() => ({}));
            throw new Error(errData?.message || 'The sentences could not be written. Please try again.');
          }
        } catch (apiErr) {
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
          itemsWithImages.push({ word: w, imageUrl: '', sentence, picture: pictureMap.get(w.toLowerCase()) || '' });
        }

        // STEP 2: find a picture that matches each finished sentence.
        if (!missingWords.length) {
          for (let i = 0; i < itemsWithImages.length; i++) {
            const it = itemsWithImages[i];
            setGenerating(true, `2/3 Finding a picture for "${it.word}" (${i + 1}/${itemsWithImages.length})...`, 55 + Math.round((i / itemsWithImages.length) * 20));
            const photoData = await fetchPhotoForWord(it.word, it.sentence, it.picture);
            it.imageUrl = photoData.url || '';
          }
        }

        if (missingWords.length) {
          setGenerating(false);
          errorBanner.textContent = `Gemini did not return a usable sentence for ${missingWords.map(w => `"${w}"`).join(', ')}. Please try again.`;
          errorBanner.style.display = 'block';
          updateModalUI();
          return;
        }
      } else {
        // Photo upload mode
        setGenerating(true, '1/3 Analyzing your photo with Gemini AI...', 35);
        let photoItems = [];

        try {
          const payload = {
            mode: 'photo',
            image: uploadedPhotoBase64,
            count: selectedPhotoCount
          };

          let res = await fetch('/api/generate-vocab-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);

          if (!res || !res.ok) {
            res = await fetch('/api/vocabulary-sentence', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }

          if (!res || !res.ok) {
            const errData = await res?.json().catch(() => ({}));
            throw new Error(errData?.message || 'Could not analyze photo.');
          }

          const data = await res.json();
          photoItems = Array.isArray(data.items) ? data.items : [];
        } catch (err) {
          console.error('Photo mode AI error:', err);
          setGenerating(false);
          errorBanner.textContent = err.message || 'Photo analysis failed. No credits were deducted.';
          errorBanner.style.display = 'block';
          updateModalUI();
          return;
        }

        // Attach images; every sentence must be Gemini's and use its own word.
        setGenerating(true, '2/3 Matching photos for each word...', 65);
        for (let i = 0; i < photoItems.length; i++) {
          const it = photoItems[i];
          const sentence = String(it.sentence || '').trim();
          const photoData = await fetchPhotoForWord(it.word, sentence, it.picture);

          if (!sentence || !sentenceUsesWord(sentence, it.word)) {
            setGenerating(false);
            errorBanner.textContent = `Gemini did not return a usable sentence for "${it.word}". Please try again.`;
            errorBanner.style.display = 'block';
            updateModalUI();
            return;
          }

          itemsWithImages.push({
            word: it.word,
            sentence,
            imageUrl: photoData.url || uploadedPhotoBase64
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

      // STEP 3: Save to database (marking as AI-generated while keeping the creator teacher name)
      setGenerating(true, '3/3 Saving vocabulary list to classroom...', 90);

      const listId = `vocab-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const firstValidImage = itemsWithImages.find(it => it.imageUrl)?.imageUrl || uploadedPhotoBase64 || '';
      const teacherName = window.currentTeacher || 'Teacher';

      const listRecord = {
        type: 'vocab_list',
        vocab_list_id: listId,
        vocab_list_name: listName,
        vocab_list_school: targetSchool,
        vocab_list_class: targetClass,
        school_name: targetSchool,
        class_name: targetClass,
        owner: teacherName,
        teacher_name: teacherName,
        teacher_id: window.currentTeacherRecordId || '',
        is_ai_generated: true,
        ai_generated: true,
        generation_source: 'ai',
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
        if (!window.dataSdk || typeof window.dataSdk.create !== 'function') {
          throw new Error('Database SDK is not available.');
        }

        const listResult = await window.dataSdk.create(listRecord);
        if (!listResult?.isOk) {
          throw new Error('Could not save the vocabulary list.');
        }

        for (const item of itemsWithImages) {
          const wordId = `vocab-word-${listId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const wordPayload = {
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
            is_ai_generated: true,
            created_at: new Date().toISOString(),
            teacher_name: teacherName,
            owner: teacherName
          };

          await window.dataSdk.create(wordPayload, { notify: false });
        }

        if (typeof window.dataSdk.init === 'function' && window.handler) {
          await window.dataSdk.init(window.handler);
        }

        // STEP 4: Deduct credits strictly AFTER successful creation
        const finalWordCount = itemsWithImages.length;
        if (typeof window.deductTeacherCredits === 'function') {
          await window.deductTeacherCredits(finalWordCount);
        }
        if (typeof window.logCredit === 'function') {
          await window.logCredit('generate_vocab_list', -finalWordCount, `Generated ${finalWordCount} words for "${listName}"`);
        }
        if (typeof window.updateTeacherCreditBalance === 'function') {
          window.updateTeacherCreditBalance();
        }

        // Clear create list input
        const mainInput = document.getElementById('new-vocab-list-name');
        if (mainInput) mainInput.value = '';

        isGenerating = false;
        modal.remove();

        if (typeof window.renderVocabLists === 'function') window.renderVocabLists();
        if (typeof window.renderGamesList === 'function') window.renderGamesList();
        if (typeof window.renderTeacherOwnedVocabLists === 'function') window.renderTeacherOwnedVocabLists();

        if (typeof window.toast === 'function') {
          window.toast(`🎉 Generated "${listName}" with ${finalWordCount} words! (-${finalWordCount} credits)`);
        }
      } catch (saveErr) {
        console.error('Saving vocabulary list error:', saveErr);
        setGenerating(false);
        errorBanner.textContent = saveErr.message || 'Failed to save list to database. No credits were deducted.';
        errorBanner.style.display = 'block';
        updateModalUI();
      }
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
