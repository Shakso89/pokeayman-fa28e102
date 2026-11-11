import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar Practice Card Text Zoom & Master Example Crop Fix', () => {
  const grammarJsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  const componentsCssPath = path.resolve(__dirname, '../../public/pokeayman/components.css');
  const grammarJs = fs.readFileSync(grammarJsPath, 'utf8');
  const componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

  it('ensures gp-hero-arena does NOT have overflow-hidden in grammar-decks.js', () => {
    // Find the Main Arena container
    const heroArenaMatch = grammarJs.match(/<!-- Main Arena: Grammar Sentence is the Hero[\s\S]*?<div class="([^"]+)"/);
    expect(heroArenaMatch).not.toBeNull();
    const classList = heroArenaMatch![1];
    expect(classList).toContain('gp-hero-arena');
    expect(classList).toContain('shrink-0');
    expect(classList).not.toContain('overflow-hidden');
  });

  it('ensures components.css protects gp-hero-arena from flex shrinking and clipping', () => {
    expect(componentsCss).toContain('#grammar-practice-modal .gp-hero-arena');
    expect(componentsCss).toContain('flex-shrink: 0 !important;');
    expect(componentsCss).toContain('min-height: min-content !important;');
    expect(componentsCss).toContain('overflow: visible !important;');
  });

  it('ensures components.css prevents practice card children from crushing under zoom', () => {
    expect(componentsCss).toContain('#grammar-practice-modal .gp-practice-card > * {');
    expect(componentsCss).toContain('flex-shrink: 0 !important;');
  });

  it('ensures gp-master-example-label has clamped font size and does not overflow or crop', () => {
    expect(componentsCss).toContain('.gp-practice-card .gp-master-example-label');
    expect(componentsCss).toContain('clamp(');
    expect(componentsCss).toContain('overflow: visible !important;');
  });

  it('allows the practice card to scroll vertically without clipping when zoomed', () => {
    expect(componentsCss).toContain('#grammar-practice-modal .gp-practice-card');
    expect(componentsCss).toContain('overflow-y: auto !important;');
    expect(componentsCss).toContain('min-height: min(94vh, 960px) !important;');
    expect(componentsCss).toContain('height: auto !important;');
  });
});
