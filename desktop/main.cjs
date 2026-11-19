const { app, BrowserWindow, shell, Menu, globalShortcut } = require('electron');
const path = require('path');

// Target web app URL
const APP_URL = 'https://pokeayman.pokeayman.workers.dev';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, // Native kiosk-like fullscreen (hides Windows taskbar and window frame)
    frame: false, // No OS title bar / header
    title: 'PokéAyman',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0a0f1d',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
    },
    autoHideMenuBar: true,
    show: false, // Show once ready to avoid white flash
  });

  // Completely remove application menu bar
  Menu.setApplicationMenu(null);

  // Load the web application
  mainWindow.loadURL(APP_URL);

  // Graceful show when DOM is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.setFullScreen(true);
    mainWindow.show();
  });

  // Keyboard shortcut: F11 toggles fullscreen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  // Open external links (like external documentation or links) in user's default browser
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

// Ensure single instance lock so double-clicking doesn't spawn duplicates
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
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
