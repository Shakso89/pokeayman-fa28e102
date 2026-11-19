const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pokeaymanDesktop', {
  toggleFullscreen: () => ipcRenderer.invoke('desktop:toggle-fullscreen'),
  quitApp: () => ipcRenderer.invoke('desktop:quit-app'),
  isFullscreen: () => ipcRenderer.invoke('desktop:is-fullscreen'),
  onFullscreenChange: (callback) => {
    ipcRenderer.on('desktop:fullscreen-changed', (_event, isFs) => callback(isFs));
  }
});
