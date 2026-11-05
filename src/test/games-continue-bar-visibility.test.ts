import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Games Continue Bar Visibility & Modal Isolation', () => {
  const cssPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  const jsPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.js');
  const jsContent = fs.readFileSync(jsPath, 'utf-8');

  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  it('includes CSS rules to hide .ga-continue-bar when games tab is inactive or modals are open', () => {
    expect(cssContent).toContain('.ga-continue-bar');
    expect(cssContent).toContain('body:not(:has(#view-students:not(.hidden) #class-subtab-games:not(.hidden))):not(:has(#student-tab-games:not(.hidden))) .ga-continue-bar');
    expect(cssContent).toContain('body:has(.vocab-word-edit-card) .ga-continue-bar');
    expect(cssContent).toContain('body:has(.vocab-editor-overlay) .ga-continue-bar');
  });

  it('cleans up .ga-continue-bar in class tab switching', () => {
    expect(htmlContent).toContain("if (btn.dataset.classtab === 'games') {");
    expect(htmlContent).toContain("document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());");
  });

  it('cleans up .ga-continue-bar when opening vocab list editor or editing words', () => {
    const listEditorIndex = htmlContent.indexOf('function openVocabListEditor');
    expect(listEditorIndex).toBeGreaterThan(0);
    const listEditorSnippet = htmlContent.slice(listEditorIndex, listEditorIndex + 200);
    expect(listEditorSnippet).toContain("document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());");

    const editWordIndex = htmlContent.indexOf('function editVocabWord');
    expect(editWordIndex).toBeGreaterThan(0);
    const editWordSnippet = htmlContent.slice(editWordIndex, editWordIndex + 200);
    expect(editWordSnippet).toContain("document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());");
  });

  it('checks visibility and modal open status in gaListStep before creating .ga-continue-bar', () => {
    expect(jsContent).toContain('isTeacherGamesVisible');
    expect(jsContent).toContain('isStudentGamesVisible');
    expect(jsContent).toContain('isAnyModalOpen');
    expect(jsContent).toContain("document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());");
  });

  it('has global click and mutation listener to prune lingering continue bars on navigation', () => {
    expect(jsContent).toContain('pruneFloatingBars');
    expect(jsContent).toContain('_gaContinueBarObserverInitialized');
  });

  it('only displays continue bar when count > 0 and mounts inside selector container', () => {
    expect(jsContent).toContain('if (!count || count <= 0) {');
    expect(jsContent).toContain('selector.appendChild(bar);');
    expect(jsContent).not.toContain('document.body.appendChild(bar);');
  });

  it('renders vocabulary cards as button elements with stable keys and restores scroll position', () => {
    expect(htmlContent).toContain('<button\n              type="button"\n              key="${listId}"');
    expect(htmlContent).toContain('<button\n            type="button"\n            key="${listId}"');
    expect(htmlContent).toContain('const savedScrollTop = prevScrollArea ? prevScrollArea.scrollTop : (selector.__lastScrollTop || 0);');
    expect(htmlContent).toContain('listArea.scrollTop = savedScrollTop;');
  });

  it('ensures all inline scripts in index.html have zero parse or syntax errors', () => {
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      count++;
      const code = match[1];
      if (!code.trim()) continue;
      expect(() => new Function(code), `Script #${count} has syntax errors`).not.toThrow();
    }
    expect(count).toBeGreaterThan(10);
  });
});
