import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Edit Vocab Word Modal', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('contains the redesigned editVocabWord function with modern 2-column grid and save & close logic', () => {
    expect(indexHtml).toContain('function editVocabWord(wordId, currentWord, currentImage)');
    // 2-column grid structure
    expect(indexHtml).toContain('grid grid-cols-1 md:grid-cols-2 gap-5');
    // Elements & IDs
    expect(indexHtml).toContain('id="edit-word-text"');
    expect(indexHtml).toContain('id="edit-word-sentence"');
    expect(indexHtml).toContain('id="selected-image-preview-container"');
    expect(indexHtml).toContain('id="selected-image-badge"');
    expect(indexHtml).toContain('id="vocab-image-search"');
    expect(indexHtml).toContain('id="vocab-image-search-btn"');
    expect(indexHtml).toContain('id="vocab-image-results"');
    expect(indexHtml).toContain('id="edit-word-delete"');
    expect(indexHtml).toContain('id="edit-word-cancel"');
    expect(indexHtml).toContain('id="edit-word-save"');
    // Modal removal on save
    expect(indexHtml).toContain('modal.remove();');
    expect(indexHtml).toContain("toast('Word updated successfully!');");
  });

  it('executes save and closes the popup modal cleanly in simulated DOM', async () => {
    // Setup minimal DOM
    document.body.innerHTML = '<div id="test-root"></div>';
    
    const toastMock = vi.fn();
    (window as any).toast = toastMock;
    
    const updateMock = vi.fn().mockResolvedValue({ isOk: true });
    (window as any).dataSdk = {
      update: updateMock,
      refresh: vi.fn().mockResolvedValue([]),
    };
    (window as any).normalizeVocabId = (id: any) => String(id || '');

    const mockWord = {
      __backendId: 'rec_123',
      vocab_word_id: 'word_123',
      vocab_list_id: 'list_abc',
      type: 'vocab_word',
      vocab_word: 'apple',
      vocab_sentence: 'I love apples.',
      vocab_image: 'https://example.com/apple.jpg'
    };
    (window as any).allData = [mockWord];

    // Extract editVocabWord function from indexHtml and evaluate it
    const fnStart = indexHtml.indexOf('function editVocabWord(');
    const fnEnd = indexHtml.indexOf('async function deleteVocabWord(', fnStart);
    const fnSource = indexHtml.substring(fnStart, fnEnd).trim();

    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('allData', 'wordId', 'currentWord', 'currentImage', `
      let window = globalThis;
      let toast = window.toast;
      let normalizeVocabId = window.normalizeVocabId;
      let renderVocabLists = () => {};
      let renderTeacherOwnedVocabLists = () => {};
      ${fnSource}
      editVocabWord(wordId, currentWord, currentImage);
    `);

    // Run editVocabWord
    await fn((window as any).allData, 'rec_123', 'apple', 'https://example.com/apple.jpg');

    const modal = document.querySelector('.vocab-word-edit-card');
    expect(modal).not.toBeNull();

    const wordInput = document.getElementById('edit-word-text') as HTMLInputElement;
    const sentenceInput = document.getElementById('edit-word-sentence') as HTMLInputElement;
    const saveBtn = document.getElementById('edit-word-save') as HTMLButtonElement;

    expect(wordInput.value).toBe('apple');
    expect(sentenceInput.value).toBe('I love apples.');

    // Edit fields
    wordInput.value = 'green apple';
    sentenceInput.value = 'A juicy green apple.';

    // Click Save
    saveBtn.click();

    // Wait for promise tick
    await new Promise(r => setTimeout(r, 50));

    // Verify update was called
    expect(updateMock).toHaveBeenCalled();
    const payload = updateMock.mock.calls[0][0];
    expect(payload.vocab_word).toBe('green apple');
    expect(payload.vocab_sentence).toBe('A juicy green apple.');

    // Verify modal was closed and removed from DOM
    expect(document.querySelector('.vocab-word-edit-card')).toBeNull();
    expect(toastMock).toHaveBeenCalledWith('Word updated successfully!');
  });
});
