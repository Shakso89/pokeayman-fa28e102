import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bright Mode Performance & Anti-Lag Optimization', () => {
  const brightFixesJsPath = path.resolve(__dirname, '../../public/pokeayman/bright-fixes.js');
  const brightFixesCssPath = path.resolve(__dirname, '../../public/pokeayman/bright-fixes.css');

  const jsContent = fs.readFileSync(brightFixesJsPath, 'utf8');
  const cssContent = fs.readFileSync(brightFixesCssPath, 'utf8');

  it('eliminates the expensive full-DOM MutationObserver on class/style in bright-fixes.js', () => {
    // Should NOT observe attributes: true or attributeFilter: ['class', 'style'] across the entire DOM tree
    expect(jsContent).not.toContain("attributeFilter: ['class', 'style']");
    expect(jsContent).not.toContain('attributes: true');
  });

  it('eliminates the 2D canvas pixel reads (getImageData) GPU pipeline stall', () => {
    // Should NOT create canvas or call getImageData
    expect(jsContent).not.toContain('getImageData');
    expect(jsContent).not.toContain("getContext('2d'");
  });

  it('eliminates full-DOM querySelectorAll and synchronous getComputedStyle sweeps', () => {
    // Should NOT sweep all elements with getComputedStyle
    expect(jsContent).not.toContain("querySelectorAll('div,section,article");
    expect(jsContent).not.toContain('function sweep(');
    expect(jsContent).not.toContain('getComputedStyle(');
  });

  it('declaratively neutralizes legacy dark utility classes via pure CSS in bright-fixes.css', () => {
    expect(cssContent).toContain('html body.ts-bright :is(');
    expect(cssContent).toContain('.bg-slate-900,');
    expect(cssContent).toContain('.bg-slate-800,');
    expect(cssContent).toContain('.bg-gray-900,');
    expect(cssContent).toContain('.bg-gray-800,');
    expect(cssContent).toContain('background: var(--color-surface) !important;');
  });

  it('declaratively neutralizes pale text classes via pure CSS in bright-fixes.css', () => {
    expect(cssContent).toContain('.text-slate-100,');
    expect(cssContent).toContain('.text-slate-200,');
    expect(cssContent).toContain('.text-slate-300,');
    expect(cssContent).toContain('color: var(--color-text-primary) !important;');
  });
});
