import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Student Avatar & Poké Ball Placeholder', () => {
  const root = path.resolve(__dirname, '../..');

  it('provides public/placeholder.svg as a valid Poké Ball SVG asset', () => {
    const svgPath = path.join(root, 'public', 'placeholder.svg');
    expect(fs.existsSync(svgPath)).toBe(true);

    const content = fs.readFileSync(svgPath, 'utf8');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
    // Checks Poké Ball characteristics: red upper half, white lower, center button
    expect(content).toContain('#ef4444');
    expect(content).toContain('#f8fafc');
  });

  it('styles .game-pokeball-placeholder in games-arcade.css', () => {
    const cssPath = path.join(root, 'public', 'pokeayman', 'games-arcade.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('.game-pokeball-placeholder');
    expect(css).toContain('.game-pokeball-center');
  });

  it('renders Poké Ball placeholder when student has no avatar in games-arcade lineup stage', () => {
    const jsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const js = fs.readFileSync(jsPath, 'utf8');

    // Should NOT unconditionally render <img src="${imgSrc || '/placeholder.svg'}"
    expect(js).not.toContain('<img src="${imgSrc || \'/placeholder.svg\'}"');

    // Should resolve student record or check for pokeball placeholder
    expect(js).toContain('gameStudentAvatarMarkup');
    expect(js).toContain('game-pokeball-placeholder');
  });

  it('provides onerror fallback and placeholder handling in gameStudentAvatarMarkup', () => {
    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    expect(html).toContain('function gameStudentAvatarMarkup(student');
    expect(html).toContain('game-pokeball-placeholder');
    expect(html).toContain('onerror=');
  });

  it('ensures RoundSetupModal has onError fallback to /placeholder.svg', () => {
    const modalPath = path.join(root, 'src', 'components', 'games', 'RoundSetupModal.tsx');
    const code = fs.readFileSync(modalPath, 'utf8');

    expect(code).toContain("e.currentTarget.src = '/placeholder.svg'");
  });
});
