import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('student dashboard games display', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  it('renders games options container for student dashboard', () => {
    expect(html).toContain('id="student-games-options-container"');
    expect(html).toContain('id="student-games-list-selector"');
  });

  it('does not exit early before rendering the arcade hub on student dashboard when lists are empty', () => {
    const startIndex = html.indexOf('function renderGamesList()');
    expect(startIndex).toBeGreaterThan(-1);
    const endIndex = html.indexOf('function attachGamesClassFilterListeners', startIndex);
    expect(endIndex).toBeGreaterThan(startIndex);
    const body = html.slice(startIndex, endIndex);

    // Verify it assigns to student-games-options-container
    expect(body).toContain("gamesContainer = document.getElementById(isStudentGames ? 'student-games-options-container' : 'games-options-container')");

    // Verify it renders gaRenderHub into gamesContainer
    expect(body).toContain('gamesContainer.innerHTML = window.gaRenderHub(listLabel, !isStudentGames)');

    // Verify it doesn't return early when !validLists.length
    expect(body).not.toMatch(/if\s*\(!validLists\.length\s*&&\s*currentRole\s*!==\s*'teacher'\)\s*\{[\s\S]*?return;\s*\}/);
  });

  it('allows clicking the Games nav group button to directly activate the Games tab', () => {
    expect(html).toContain("menuId === 'student-nav-games-menu'");
    expect(html).toContain("document.querySelector('.student-dashboard-tab[data-tab=\"games\"]')");
  });

  it('resolves the correct container in initGameDeckCarousel for students', () => {
    expect(html).toContain("document.getElementById('student-games-options-container')");
    expect(html).toContain("currentRole === 'student'");
  });
});
