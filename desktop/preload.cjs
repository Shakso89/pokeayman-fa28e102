const { contextBridge, ipcRenderer } = require('electron');

const desktopBridge = {
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen'),
  quitApp: () => ipcRenderer.invoke('desktop:quit-app'),
  close: () => ipcRenderer.invoke('desktop:close'),
  minimize: () => ipcRenderer.invoke('desktop:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('desktop:toggle-maximize'),
  isMaximized: () => ipcRenderer.invoke('desktop:is-maximized'),
  isFullscreen: () => ipcRenderer.invoke('desktop:is-fullscreen'),
  onFullscreenChange: (callback) => {
    ipcRenderer.on('desktop:fullscreen-changed', (_event, isFs) => callback(isFs));
  },
  onMaximizedChange: (callback) => {
    ipcRenderer.on('desktop:maximized-changed', (_event, isMax) => callback(isMax));
  }
};

contextBridge.exposeInMainWorld('pokeaymanDesktop', desktopBridge);

// Broadcast fullscreen/maximized changes to any inner iframes
ipcRenderer.on('desktop:fullscreen-changed', (_event, isFs) => {
  try {
    window.postMessage({ type: 'pokeayman:fullscreen-status', isFullscreen: isFs }, '*');
  } catch (_) {}
});
ipcRenderer.on('desktop:maximized-changed', (_event, isMax) => {
  try {
    window.postMessage({ type: 'pokeayman:maximized-status', isMaximized: isMax }, '*');
  } catch (_) {}
});

// Also listen for postMessage events from child iframes
window.addEventListener('message', async (event) => {
  if (event.data?.type === 'pokeayman:toggle-fullscreen') {
    const isFs = await ipcRenderer.invoke('desktop:toggle-fullscreen');
    try {
      event.source?.postMessage({ type: 'pokeayman:fullscreen-status', isFullscreen: isFs }, '*');
    } catch (_) {}
  } else if (event.data?.type === 'pokeayman:quit-app' || event.data?.type === 'pokeayman:close') {
    ipcRenderer.invoke('desktop:close');
  } else if (event.data?.type === 'pokeayman:minimize') {
    ipcRenderer.invoke('desktop:minimize');
  } else if (event.data?.type === 'pokeayman:toggle-maximize') {
    const isMax = await ipcRenderer.invoke('desktop:toggle-maximize');
    try {
      event.source?.postMessage({ type: 'pokeayman:maximized-status', isMaximized: isMax }, '*');
    } catch (_) {}
  } else if (event.data?.type === 'pokeayman:get-fullscreen') {
    const isFs = await ipcRenderer.invoke('desktop:is-fullscreen');
    try {
      event.source?.postMessage({ type: 'pokeayman:fullscreen-status', isFullscreen: isFs }, '*');
    } catch (_) {}
  } else if (event.data?.type === 'pokeayman:get-maximized') {
    const isMax = await ipcRenderer.invoke('desktop:is-maximized');
    try {
      event.source?.postMessage({ type: 'pokeayman:maximized-status', isMaximized: isMax }, '*');
    } catch (_) {}
  }
});
