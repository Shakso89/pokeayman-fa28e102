const { contextBridge, ipcRenderer } = require('electron');

const desktopBridge = {
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen'),
  quitApp: () => ipcRenderer.invoke('desktop:quit-app'),
  isFullscreen: () => ipcRenderer.invoke('desktop:is-fullscreen'),
  onFullscreenChange: (callback) => {
    ipcRenderer.on('desktop:fullscreen-changed', (_event, isFs) => callback(isFs));
  }
};

contextBridge.exposeInMainWorld('pokeaymanDesktop', desktopBridge);

// Also listen for postMessage events from child iframes
window.addEventListener('message', async (event) => {
  if (event.data?.type === 'pokeayman:toggle-fullscreen') {
    const isFs = await ipcRenderer.invoke('desktop:toggle-fullscreen');
    try {
      event.source?.postMessage({ type: 'pokeayman:fullscreen-status', isFullscreen: isFs }, '*');
    } catch (_) {}
  } else if (event.data?.type === 'pokeayman:quit-app') {
    ipcRenderer.invoke('desktop:quit-app');
  } else if (event.data?.type === 'pokeayman:get-fullscreen') {
    const isFs = await ipcRenderer.invoke('desktop:is-fullscreen');
    try {
      event.source?.postMessage({ type: 'pokeayman:fullscreen-status', isFullscreen: isFs }, '*');
    } catch (_) {}
  }
});
