const { app, BrowserWindow, shell, Menu, ipcMain, session } = require('electron');
const path = require('path');

// Target web app URL with platform flag
const APP_URL = 'https://pokeayman.pokeayman.workers.dev?platform=desktop';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: false, // Windowed by default so the new 3-button draggable header is immediately visible
    frame: false, // Borderless window
    width: 1280, // Comfortable desktop resolution
    height: 800,
    minWidth: 1024, // Prevents responsive layout from breaking into phone/tablet mode
    minHeight: 700,
    center: true,
    title: 'PokéAyman',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0a0f1d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for preload script IPC bridge
      spellcheck: false,
    },
    autoHideMenuBar: true,
    show: true, // Show immediately on launch (no invisible process hang)
  });

  // Ensure window is shown immediately
  mainWindow.show();
  mainWindow.focus();

  // Completely remove application menu bar
  Menu.setApplicationMenu(null);

  // Set custom user agent to reliably identify desktop app across all frames & iframes
  const defaultUA = mainWindow.webContents.getUserAgent();
  mainWindow.webContents.setUserAgent(`${defaultUA} PokeAymanApp/1.0`);

  // Strip native scrollbars globally across the main window and all subframes + enforce draggable header
  const customWindowCSS = `
    html, body {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    #ts-desktop-header-bar, .window-drag-region {
      -webkit-app-region: drag !important;
      user-select: none !important;
    }
    #ts-desktop-header-bar button, .window-no-drag-region, #ts-desktop-header-bar .window-no-drag-region {
      -webkit-app-region: no-drag !important;
      cursor: pointer !important;
    }
  `;

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(customWindowCSS).catch(() => {});
  });

  // Load the web application
  mainWindow.loadURL(APP_URL);

  // Graceful show fallback when DOM is ready
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // Notify renderer on fullscreen change
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('desktop:fullscreen-changed', true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('desktop:fullscreen-changed', false);
  });
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('desktop:maximized-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('desktop:maximized-changed', false);
  });

  // Keyboard shortcuts: F11 toggles fullscreen, F12 toggles DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      const nextState = !mainWindow.isFullScreen();
      mainWindow.setFullScreen(nextState);
      if (!nextState) {
        mainWindow.setSize(1280, 800);
        mainWindow.center();
      }
      event.preventDefault();
    } else if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://pokeayman.pokeayman.workers.dev')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Offline or network error handler with retry screen
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode === -3) return; // Aborted load, ignore
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>PokéAyman - Connection Required</title>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
              background: radial-gradient(circle at center, #111a2e 0%, #080d18 70%, #04070d 100%);
              color: #f8fafc;
              text-align: center;
              user-select: none;
              overflow: hidden;
            }
            .card {
              background: rgba(30, 41, 59, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.12);
              padding: 2.5rem;
              border-radius: 1.25rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
              max-width: 420px;
            }
            h1 { font-size: 1.5rem; margin-top: 0; color: #fbbf24; }
            p { font-size: 0.95rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.5rem; }
            button {
              background: #fbbf24;
              color: #0f172a;
              border: none;
              padding: 0.75rem 1.75rem;
              border-radius: 0.75rem;
              font-weight: 800;
              font-size: 0.95rem;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            button:hover { background: #f59e0b; transform: translateY(-1px); }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🌐 Internet Connection Required</h1>
            <p>PokéAyman requires an active internet connection to load lessons, audio speech, and student data.</p>
            <button onclick="window.location.href='${APP_URL}'">Retry Connection</button>
          </div>
        </body>
      </html>
    `)}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for desktop controls
ipcMain.handle('desktop:toggle-fullscreen', () => {
  if (mainWindow) {
    const nextState = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(nextState);
    if (!nextState) {
      mainWindow.setSize(1280, 800);
      mainWindow.center();
    }
    return nextState;
  }
  return false;
});

ipcMain.handle('desktop:is-fullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

ipcMain.handle('desktop:minimize', () => {
  if (mainWindow) {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('desktop:toggle-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      mainWindow.maximize();
      return true;
    }
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  }
  return false;
});

ipcMain.handle('desktop:is-maximized', () => {
  return mainWindow ? (mainWindow.isMaximized() || mainWindow.isFullScreen()) : false;
});

ipcMain.handle('desktop:close', () => {
  app.quit();
});

ipcMain.handle('desktop:quit-app', () => {
  app.quit();
});

// Ensure single instance lock so double-clicking doesn't spawn duplicates
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    const ses = session.defaultSession;

    // Block sw.js in desktop app to prevent Chromium Mojo IPC CacheStorage validation crashes
    ses.webRequest.onBeforeRequest({ urls: ['*://*/*sw.js*', '*://*/sw.js*'] }, (details, callback) => {
      callback({ cancel: true });
    });

    // Clear any existing ServiceWorkers and CacheStorage for a clean slate
    try {
      await ses.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
    } catch (_) {}

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
