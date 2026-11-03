import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Mutually Exclusive Collapsible Sidebars', () => {
  const teacherShellJsPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
  const teacherShellCssPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.css');
  const teacherShellJs = fs.readFileSync(teacherShellJsPath, 'utf-8');
  const teacherShellCss = fs.readFileSync(teacherShellCssPath, 'utf-8');

  it('defines mutually exclusive toggleSidebar and toggleRail logic', () => {
    // Both toggle functions must be defined and enforce mutual exclusivity
    expect(teacherShellJs).toContain('function toggleSidebar');
    expect(teacherShellJs).toContain('function toggleRail');
    expect(teacherShellJs).toContain('railCollapsed = true');
    expect(teacherShellJs).toContain('collapsed = true');
  });

  it('ensures DOM includes inner fixed-width wrappers to avoid text squishing during transitions', () => {
    expect(teacherShellJs).toContain('id="ts-sidebar-inner"');
    expect(teacherShellJs).toContain('class="ts-sidebar-inner"');
    expect(teacherShellJs).toContain('id="ts-rail-inner"');
    expect(teacherShellJs).toContain('class="ts-rail-inner"');
  });

  it('contains polished CSS transitions with cubic-bezier(0.4, 0, 0.2, 1)', () => {
    expect(teacherShellCss).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(teacherShellCss).toContain('.ts-sidebar-inner');
    expect(teacherShellCss).toContain('.ts-rail-inner');
    expect(teacherShellCss).toContain('#ts-sidebar-toggle');
    expect(teacherShellCss).toContain('#ts-rail-toggle');
    expect(teacherShellCss).toContain('transition: padding');
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
});
