import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('teacher login streak migration to notification center and profile', () => {
  const responsiveCssPath = path.resolve(__dirname, '../../public/pokeayman/responsive.css');
  const teacherShellJsPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');

  it('removes floating streak card and forced floating rail from responsive.css', () => {
    const css = fs.readFileSync(responsiveCssPath, 'utf8');
    expect(css).toContain('#ts-rail .ts-streak, .ts-card.ts-streak, .ts-streak { display: none !important; }');
    expect(css).not.toContain('html body.ts-on #ts-rail {\n    display: flex !important; position: fixed; inset: auto auto 16px 12px;');
    expect(css).not.toContain('body.ts-on #app-screen { padding-bottom: 194px; }');
  });

  it('removes streak card HTML from teacher-shell.js rail markup and ensures sync hides it', () => {
    const shell = fs.readFileSync(teacherShellJsPath, 'utf8');
    expect(shell).not.toContain('<section class="ts-card ts-gift ts-streak"');
    expect(shell).toContain("const streakCards = document.querySelectorAll('.ts-streak, #ts-rail .ts-streak');");
  });

  it('provides window.openTeacherStreakProfile in index.html', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('window.openTeacherStreakProfile = function ()');
    expect(html).toContain("document.querySelector('.th-tab[data-th=\"profile\"]')");
    expect(html).toContain('teacher-streak-panel');
  });

  it('synthesizes login streak notification in teacherNotificationsFor', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('const streakNotices = [];');
    expect(html).toContain('const st = teacherStreakState();');
    expect(html).toContain("notification_target: 'streak'");
    expect(html).toContain("notification_category: 'streak reward'");
  });

  it('targets streak notifications to the streak handler in teacherNotificationTargetFor', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain("if (title.includes('streak') || category.includes('streak')) return 'streak';");
    expect(html).toContain("if (target === 'streak') {");
    expect(html).toContain("window.openTeacherStreakProfile();");
  });
});
