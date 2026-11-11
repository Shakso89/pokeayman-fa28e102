import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dots and Boxes Pokemon Avatar Responsive Sizing', () => {
  const cssPath = path.resolve(__dirname, '../../public/pokeayman/dots-and-boxes.css');
  const componentsCssPath = path.resolve(__dirname, '../../public/pokeayman/components.css');
  const tsxPath = path.resolve(__dirname, '../../src/components/games/DotsAndBoxesGame.tsx');

  const css = fs.readFileSync(cssPath, 'utf8');
  const componentsCss = fs.readFileSync(componentsCssPath, 'utf8');
  const tsx = fs.readFileSync(tsxPath, 'utf8');

  it('ensures dots-box-avatar in dots-and-boxes.css is scaled responsively rather than fixed 2.2rem', () => {
    expect(css).not.toMatch(/\.dots-box-avatar\s*\{[^}]*width:\s*2\.2rem;/);
    expect(css).toContain('.dots-box-avatar');
    expect(css).toMatch(/\.dots-box-avatar\s*\{[^}]*width:\s*78%/);
    expect(css).toMatch(/\.dots-box-avatar\s*\{[^}]*height:\s*78%/);
    expect(css).toMatch(/\.dots-box-avatar\s*\{[^}]*object-fit:\s*contain/);
  });

  it('ensures dots-box-avatar has enlarged fullscreen rules in dots-and-boxes.css', () => {
    expect(css).toContain(':fullscreen .dots-box-avatar');
    expect(css).toMatch(/:fullscreen \.dots-box-avatar[\s\S]*?width:\s*84%/);
    expect(css).toMatch(/:fullscreen \.dots-box-avatar[\s\S]*?height:\s*84%/);
  });

  it('ensures dots-board-grid expands in fullscreen beyond the old 620px limit', () => {
    expect(css).toContain(':fullscreen .dots-board-grid');
    expect(css).toMatch(/:fullscreen \.dots-board-grid[\s\S]*?820px/);
  });

  it('ensures dots-box-cell has overflow: visible to avoid clipping animated pokemon', () => {
    expect(css).toMatch(/\.dots-box-cell\s*\{[^}]*overflow:\s*visible;/);
  });

  it('ensures DotsAndBoxesGame.tsx has responsive box image sizing', () => {
    expect(tsx).not.toContain('className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow"');
    expect(tsx).toContain('w-4/5 h-4/5');
    expect(tsx).toContain('object-contain');
  });

  it('ensures components.css contains responsive dots-box-avatar rules', () => {
    expect(componentsCss).toContain('.dots-box-avatar');
    expect(componentsCss).toMatch(/\.dots-box-avatar\s*\{[^}]*width:\s*78%/);
    expect(componentsCss).toContain(':fullscreen .dots-box-avatar');
  });
});
