import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Photo Pickers Pagination (Pic 1, Pic 2, Pic 3)', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('Pic 1: openVocabPhotoPicker supports scroll loading up to 100 photos with correct status and button states', () => {
    // Has photo pagination and state variables
    expect(indexHtml).toContain('let vocabPhotoPage = 1;');
    expect(indexHtml).toContain('let vocabPhotoHasMore = true;');
    expect(indexHtml).toContain('vocabPhotoItems.length < 100');
    // Appends newly found items rather than wiping out DOM completely on scroll
    expect(indexHtml).toContain('const itemsToAppend = reset ? vocabPhotoItems : additions;');
    // Scroll listener on grid
    expect(indexHtml).toContain("picker.querySelector('#vocab-photo-picker-grid')?.addEventListener('scroll', onPickerScroll);");
    // Max 100 condition
    expect(indexHtml).toContain('100 - vocabPhotoItems.length');
  });

  it('Pic 2: editVocabWord modal includes pagination state and scroll listener on #vocab-image-results up to 100 photos', () => {
    expect(indexHtml).toContain('let editWordPage = 1;');
    expect(indexHtml).toContain('let editWordPhotos = [];');
    expect(indexHtml).toContain('let editWordLoading = false;');
    expect(indexHtml).toContain('let editWordHasMore = true;');
    expect(indexHtml).toContain('const fetchEditWordPhotos = async (reset = false)');
    // Scroll listener on results container
    expect(indexHtml).toContain("resultsContainer.addEventListener('scroll', () => {");
    expect(indexHtml).toContain("resultsContainer.scrollTop + resultsContainer.clientHeight >= resultsContainer.scrollHeight - 160");
    expect(indexHtml).toContain("100 - editWordPhotos.length");
    expect(indexHtml).toContain("editWordPhotos.length < 100");
  });

  it('Pic 3: openVocabCoverPicker loads more photos on button click and scroll up to 100 photos', () => {
    expect(indexHtml).toContain("loadMore.addEventListener('click', () => fetchCoverPhotos(false));");
    expect(indexHtml).toContain("results.addEventListener('scroll', () => {");
    expect(indexHtml).toContain("100 - coverPhotos.length");
    expect(indexHtml).toContain("coverPhotos.length < 100");
    // Status text accurately reflects up to 100 loaded
    expect(indexHtml).toContain("${coverPhotos.length} of 100 photos");
  });
});
