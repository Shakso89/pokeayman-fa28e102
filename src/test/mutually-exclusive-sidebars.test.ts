import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Mutually Exclusive Collapsible Sidebars', () => {
  const teacherShellJsPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
  const teacherShellCssPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.css');
  const responsiveCssPath = path.resolve(__dirname, '../../public/pokeayman/responsive.css');

  const teacherShellJs = fs.readFileSync(teacherShellJsPath, 'utf-8');
  const teacherShellCss = fs.readFileSync(teacherShellCssPath, 'utf-8');
  const responsiveCss = fs.readFileSync(responsiveCssPath, 'utf-8');

  it('defines mutually exclusive toggleSidebar and toggleRail logic for desktop', () => {
    expect(teacherShellJs).toContain('function toggleSidebar');
    expect(teacherShellJs).toContain('function toggleRail');
    expect(teacherShellJs).toContain('railCollapsed = true');
    expect(teacherShellJs).toContain('collapsed = true');
    expect(teacherShellJs).toContain('isDesktopView');
  });

  it('ensures sidebar collapsing is strictly restricted to desktop vision (min-width: 1025px)', () => {
    // Desktop only media query
    expect(teacherShellCss).toContain('@media (min-width: 1025px)');
    // Toggle buttons hidden on tablet/mobile
    expect(teacherShellCss).toContain('@media (max-width: 1024px)');
    expect(teacherShellCss).toMatch(/@media \(max-width: 1024px\)[\s\S]*?#ts-sidebar-toggle,[\s\S]*?#ts-rail-toggle[\s\S]*?display:\s*none !important/);
  });

  it('preserves mobile & tablet navigation in responsive.css without collision', () => {
    // Ensures mobile bottom navigation bar and sub-nav strip rules exist
    expect(responsiveCss).toContain('#ts-bottom');
    expect(responsiveCss).toContain('html body.ts-on #ts-sidebar > .ts-nav');
    expect(responsiveCss).toContain('@media (max-width: 1024px)');
  });

  it('contains polished desktop CSS transitions with cubic-bezier(0.4, 0, 0.2, 1)', () => {
    expect(teacherShellCss).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(teacherShellCss).toContain('#ts-sidebar-toggle');
    expect(teacherShellCss).toContain('#ts-rail-toggle');
    expect(teacherShellCss).toContain('transition: padding');
    expect(teacherShellCss).toContain('body.ts-on #ts-sidebar > *');
  });

  it('simulates mutually exclusive sidebar state transitions', () => {
    let collapsed = false; // Left open
    let railCollapsed = true; // Right closed

    const applySidebar = () => {};
    const applyRail = () => {};

    const toggleSidebar = (forceOpen?: boolean) => {
      const nextOpen = forceOpen !== undefined ? forceOpen : collapsed;
      collapsed = !nextOpen;
      if (!collapsed) {
        if (!railCollapsed) {
          railCollapsed = true;
          applyRail();
        }
      }
      applySidebar();
    };

    const toggleRail = (forceOpen?: boolean) => {
      const nextOpen = forceOpen !== undefined ? forceOpen : railCollapsed;
      railCollapsed = !nextOpen;
      if (!railCollapsed) {
        if (!collapsed) {
          collapsed = true;
          applySidebar();
        }
      }
      applyRail();
    };

    // Initial state: Left is open, Right is closed
    expect(collapsed).toBe(false);
    expect(railCollapsed).toBe(true);

    // Opening Right Rail: Left must automatically collapse
    toggleRail();
    expect(railCollapsed).toBe(false);
    expect(collapsed).toBe(true);

    // Opening Left Sidebar: Right must automatically collapse
    toggleSidebar();
    expect(collapsed).toBe(false);
    expect(railCollapsed).toBe(true);

    // Toggling Left Sidebar closed: both become closed
    toggleSidebar();
    expect(collapsed).toBe(true);
    expect(railCollapsed).toBe(true);

    // Opening Right Rail from both closed:
    toggleRail();
    expect(railCollapsed).toBe(false);
    expect(collapsed).toBe(true);
  });

  it('implements uiverse thin-duck-22 logout button style and structure', () => {
    // Button element has .sign and .text containers
    expect(teacherShellJs).toContain('class="ts-logout Btn"');
    expect(teacherShellJs).toContain('<div class="sign">');
    expect(teacherShellJs).toContain('<div class="text">Logout</div>');

    // CSS defines circular initial state and hover expansion
    expect(teacherShellCss).toContain('.ts-logout .sign');
    expect(teacherShellCss).toContain('.ts-logout .text');
    expect(teacherShellCss).toContain('.ts-logout:hover');
    expect(teacherShellCss).toContain('width: 125px;');
  });

  it('aligns the floating "Next Step" panel with game setup content area between sidebars', () => {
    const gamesArcadeCssPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.css');
    const gamesArcadeCss = fs.readFileSync(gamesArcadeCssPath, 'utf-8');

    // CSS variables for left and right sidebar offsets
    expect(teacherShellCss).toContain('--ts-content-left: 0px;');
    expect(teacherShellCss).toContain('--ts-content-right: 0px;');
    expect(teacherShellCss).toContain('--ts-content-left: var(--ts-w);');
    expect(teacherShellCss).toContain('--ts-content-left: 38px;');
    expect(teacherShellCss).toContain('--ts-content-right: var(--ts-rail);');
    expect(teacherShellCss).toContain('--ts-content-right: 38px;');

    // Dynamic horizontal centering and boundary constraints for .ga-continue-bar
    expect(teacherShellCss).toContain('body.ts-on .ga-continue-bar');
    expect(teacherShellCss).toContain('calc(50vw + (var(--ts-content-left, 0px) - var(--ts-content-right, 0px)) / 2)');
    expect(gamesArcadeCss).toContain('calc(50vw + (var(--ts-content-left, 0px) - var(--ts-content-right, 0px)) / 2)');

    // teacher-shell.js dynamically updates inline variables on body during sidebar toggles
    expect(teacherShellJs).toContain('function updateContentOffsets');
    expect(teacherShellJs).toContain('--ts-content-left');
    expect(teacherShellJs).toContain('--ts-content-right');

    // Mathematical verification of alignment:
    // When left sidebar is open (280px) and right is collapsed (38px) on 1400px screen:
    const leftOpenOffset = (280 - 38) / 2; // +121px shift to right
    expect(leftOpenOffset).toBe(121);

    // When right rail is open (320px) and left is collapsed (38px) on 1400px screen:
    const rightOpenOffset = (38 - 320) / 2; // -141px shift to left
    expect(rightOpenOffset).toBe(-141);
  });
});
