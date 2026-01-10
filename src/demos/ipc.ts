// Check if running in Electron with ipcRenderer available
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, ...args) => {

  });

  // Listen for hard refresh keyboard shortcut (Cmd+R / Ctrl+R)
  window.ipcRenderer.on('clear-storage-and-reload', () => {


    try {
      // Clear all localStorage data
      localStorage.clear();


      // Clear all sessionStorage data
      sessionStorage.clear();


      // Reload the window
      window.location.reload();
    } catch (error) {

      // Still try to reload even if clearing fails
      window.location.reload();
    }
  });
}