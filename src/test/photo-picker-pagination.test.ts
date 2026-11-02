import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Photo Pickers Pagination & Dedicated Load More Buttons (All 3 Places)', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const brightFixesPath = path.resolve(__dirname, '../../public/pokeayman/bright-fixes.css');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const brightFixes = fs.readFileSync(brightFixesPath, 'utf-8');

  it('Place 1: editVocabWord modal has dedicated #vocab-image-load-more button with click trigger and up to 100 photos', () => {
    // Has dedicated button markup
    expect(indexHtml).toContain('id="vocab-image-load-more"');
    // Button element query
    expect(indexHtml).toContain("const loadMoreBtn = modal.querySelector('#vocab-image-load-more');");
    // Button click listener to load more photos
    expect(indexHtml).toContain("loadMoreBtn?.addEventListener('click', () => {");
    expect(indexHtml).toContain('fetchEditWordPhotos(false);');
    // Live loaded count formatting
    expect(indexHtml).toContain("Load more photos (' + editWordPhotos.length + ' of 100 loaded)");
    expect(indexHtml).toContain("End of results (' + editWordPhotos.length + ' of 100 photos loaded)");
    // Scroll listener on results container
    expect(indexHtml).toContain("resultsContainer.addEventListener('scroll', () => {");
    // Up to 100 photos condition
    expect(indexHtml).toContain('100 - editWordPhotos.length');
    expect(indexHtml).toContain('editWordPhotos.length >= 100');
  });

  it('Place 2: openVocabPhotoPicker modal has #vocab-photo-load-more with click trigger, flex containment, and up to 100 photos', () => {
    // Dedicated button markup & element query
    expect(indexHtml).toContain('id="vocab-photo-load-more"');
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-load-more')");
    // Click listener
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-load-more')?.addEventListener('click', () => {");
    expect(indexHtml).toContain('fetchVocabPhotos(false);');
    // Live loaded count formatting
    expect(indexHtml).toContain("Load more photos (' + vocabPhotoItems.length + ' of 100 loaded)");
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

  it('Place 3: openVocabCoverPicker modal has #vocab-cover-load-more with click trigger, 20 per batch, and up to 100 photos', () => {
    // Button element query & click listener
    expect(indexHtml).toContain('id="vocab-cover-load-more"');
    expect(indexHtml).toContain("loadMore?.addEventListener('click', () => {");
    expect(indexHtml).toContain('fetchCoverPhotos(false);');
    // 20 per page batching
    expect(indexHtml).toContain('const perPage = Math.min(20, remaining);');
    // Live loaded count formatting
    expect(indexHtml).toContain("Load more photos (' + coverPhotos.length + ' of 100 loaded)");
    expect(indexHtml).toContain("End of results (' + coverPhotos.length + ' of 100 photos loaded)");
    // Scroll listener on results container
    expect(indexHtml).toContain("results.addEventListener('scroll', () => {");
    expect(indexHtml).toContain('100 - coverPhotos.length');
  });

  it('CSS styles all 3 load-more triggers with theme awareness in Bright and Dark modes', () => {
    expect(brightFixes).toContain(':is(#vocab-image-load-more, #vocab-photo-load-more, #vocab-cover-load-more');
    expect(brightFixes).toContain('html body:not(.ts-bright)');
    expect(brightFixes).toContain('body.ts-bright');
  });
});
