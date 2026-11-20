import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Desktop Header Bar & Native Google Sign-In', () => {
  const root = path.resolve(__dirname, '../..');
  const teacherJs = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'teacher-shell.js'), 'utf8');
  const teacherCss = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'teacher-shell.css'), 'utf8');
  const mainCjs = fs.readFileSync(path.join(root, 'desktop', 'main.cjs'), 'utf8');
  const preloadCjs = fs.readFileSync(path.join(root, 'desktop', 'preload.cjs'), 'utf8');
  const authTsx = fs.readFileSync(path.join(root, 'src', 'routes', 'auth.tsx'), 'utf8');
  const bridgeTs = fs.readFileSync(path.join(root, 'src', 'lib', 'pokeayman-bridge.ts'), 'utf8');
  const capConfig = fs.readFileSync(path.join(root, 'capacitor.config.ts'), 'utf8');
  const stringsXml = fs.readFileSync(path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml'), 'utf8');
  const classesTsx = fs.readFileSync(path.join(root, 'src', 'routes', 'classes.tsx'), 'utf8');

  it('removes floating two buttons and adds 3-button windowed desktop header bar', () => {
    // Old floating 2 buttons removed
    expect(teacherJs).not.toContain("document.getElementById('ts-desktop-floating-bar')");
    expect(teacherCss).not.toContain('#ts-desktop-floating-bar {');

    // New desktop header bar mounted with top-level draggable region
    expect(classesTsx).toContain("id=\"ts-desktop-header-bar\"");
    expect(classesTsx).toContain("WebkitAppRegion: 'drag'");
    expect(classesTsx).toContain("WebkitAppRegion: 'no-drag'");
    expect(classesTsx).toContain("bridge.minimize()");

    // CSS visibility: appears ONLY in non-fullscreen mode, hidden in fullscreen mode
    expect(teacherCss).toContain('#ts-desktop-header-bar');
    expect(teacherCss).toContain('body.ts-is-windowed #ts-desktop-header-bar');
    expect(teacherCss).toContain('display: flex !important;');
    expect(teacherCss).toContain('body.ts-is-fullscreen #ts-desktop-header-bar');
    expect(teacherCss).toContain('display: none !important;');
  });

  it('provides IPC handlers for minimize, maximize/square, and close in Electron main and preload', () => {
    expect(mainCjs).toContain("ipcMain.handle('desktop:minimize'");
    expect(mainCjs).toContain("ipcMain.handle('desktop:toggle-maximize'");
    expect(mainCjs).toContain("ipcMain.handle('desktop:close'");

    expect(preloadCjs).toContain("minimize: () => ipcRenderer.invoke('desktop:minimize')");
    expect(preloadCjs).toContain("toggleMaximize: () => ipcRenderer.invoke('desktop:toggle-maximize')");
    expect(preloadCjs).toContain("close: () => ipcRenderer.invoke('desktop:close')");
  });

  it('configures native Google Sign-In with capacitor-google-auth and Supabase signInWithIdToken', () => {
    // Strings.xml has server_client_id
    expect(stringsXml).toContain('server_client_id');
    expect(stringsXml).toContain('264955410811-hdfrt5djn538e61vjn6aog8v1pf5hmdu.apps.googleusercontent.com');

    // Capacitor config has GoogleAuth plugin configuration
    expect(capConfig).toContain('GoogleAuth');
    expect(capConfig).toContain('264955410811-hdfrt5djn538e61vjn6aog8v1pf5hmdu.apps.googleusercontent.com');

    // auth.tsx uses capacitor-google-auth and signInWithIdToken
    expect(authTsx).toContain('@codetrix-studio/capacitor-google-auth');
    expect(authTsx).toContain('signInWithIdToken');

    // pokeayman-bridge.ts uses capacitor-google-auth and signInWithIdToken
    expect(bridgeTs).toContain('@codetrix-studio/capacitor-google-auth');
    expect(bridgeTs).toContain('signInWithIdToken');
  });
});
