import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Photo Pickers Pagination & Dedicated Load More Pills (All 3 Places)', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const brightFixesPath = path.resolve(__dirname, '../../public/pokeayman/bright-fixes.css');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const brightFixes = fs.readFileSync(brightFixesPath, 'utf-8');

  it('Place 1: editVocabWord modal has dedicated #vocab-image-load-more pill, type filters, and up to 100 photos', () => {
    // Dedicated button markup & type filters
    expect(indexHtml).toContain('id="vocab-image-load-more"');
    expect(indexHtml).toContain('vocab-type-pill');
    expect(indexHtml).toContain('data-image-type="all"');
    expect(indexHtml).toContain('data-image-type="illustration"');
    expect(indexHtml).toContain('data-image-type="photo"');
    
    // Button element query
    expect(indexHtml).toContain("const loadMoreBtn = modal.querySelector('#vocab-image-load-more');");
    // Button click listener to load more photos
    expect(indexHtml).toContain("loadMoreBtn?.addEventListener('click', () => {");
    expect(indexHtml).toContain('fetchEditWordPhotos(false);');
    // Live loaded count formatting
    expect(indexHtml).toContain("Load 20 more photos (' + editWordPhotos.length + ' of 100 loaded)");
    expect(indexHtml).toContain("End of results (' + editWordPhotos.length + ' of 100 photos loaded)");
    // Up to 100 photos condition
    expect(indexHtml).toContain('100 - editWordPhotos.length');
    expect(indexHtml).toContain('editWordPhotos.length >= 100');
  });

  it('Place 2: openVocabPhotoPicker modal has #vocab-photo-load-more with click trigger, type pills, and up to 100 photos', () => {
    // Dedicated button markup & element query
    expect(indexHtml).toContain('id="vocab-photo-load-more"');
    expect(indexHtml).toContain('vocab-photo-type-pill');
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-load-more')");
    // Click listener
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-load-more')?.addEventListener('click', () => {");
    expect(indexHtml).toContain('fetchVocabPhotos(false);');
    // Live loaded count formatting
    expect(indexHtml).toContain("Load 20 more photos (' + vocabPhotoItems.length + ' of 100 loaded)");
    expect(indexHtml).toContain("End of results (' + vocabPhotoItems.length + ' of 100 photos loaded)");
    // Max 100 condition & scroll listener
    expect(indexHtml).toContain('100 - vocabPhotoItems.length');
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-picker-grid')?.addEventListener('scroll', onPickerScroll);");
    // Flex containment in CSS so button is never clipped
    expect(brightFixes).toContain('.vocab-photo-picker-dialog');
    expect(brightFixes).toContain('display: flex !important;');
    expect(brightFixes).toContain('.vocab-photo-picker-body');
    expect(brightFixes).toContain('overflow-y: auto !important;');
  });

  it('Place 3: openVocabCoverPicker modal selects cover directly from list word photos (no external photo search)', () => {
    // Collects words belonging to the list and extracts word photos
    expect(indexHtml).toContain('function openVocabCoverPicker(listId, listName)');
    expect(indexHtml).toContain('vocab-cover-dialog');
    expect(indexHtml).toContain('wordPhotos');
    expect(indexHtml).toContain('id="vocab-cover-results"');
    expect(indexHtml).toContain('vocab-cover-result');
    expect(indexHtml).toContain('vocab-cover-selected-badge');
    expect(indexHtml).toContain('vocab-cover-apply');
    // 16:10 wide cards in CSS
    expect(brightFixes).toContain('aspect-ratio: 16 / 10 !important;');
  });

  it('CSS styles all 3 load-more triggers with theme awareness in Bright and Dark modes', () => {
    expect(brightFixes).toContain('.vocab-load-more-pill');
    expect(brightFixes).toContain('html body:not(.ts-bright) .vocab-load-more-pill');
    expect(brightFixes).toContain('.vocab-load-more-pill:hover:not(:disabled)');
  });
});
