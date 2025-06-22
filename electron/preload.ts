import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

try {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    /**
     * Listen for events from main process
     */
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      try {
        ipcRenderer.on(channel, listener);
      } catch (err) {
        console.error('ipcRenderer.on error:', err);
      }
    },

    /**
     * Remove event listener
     */
    off: (channel: string, listener: (...args: any[]) => void) => {
      try {
        ipcRenderer.off(channel, listener);
      } catch (err) {
        console.error('ipcRenderer.off error:', err);
      }
    },

    /**
     * Send message to main process
     */
    send: (channel: string, ...args: any[]) => {
      try {
        ipcRenderer.send(channel, ...args);
      } catch (err) {
        console.error('ipcRenderer.send error:', err);
      }
    },

    /**
     * Invoke method in main process
     */
    invoke: (channel: string, ...args: any[]) => {
      try {
        return ipcRenderer.invoke(channel, ...args);
      } catch (err) {
        console.error('ipcRenderer.invoke error:', err);
        return Promise.reject(err);
      }
    },

    /**
     * Listen once for event from main process
     */
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      try {
        ipcRenderer.once(channel, listener);
      } catch (err) {
        console.error('ipcRenderer.once error:', err);
      }
    }
  });
} catch (e) {
  console.error("contextBridge expose error:", e);
}

// ✅ Uncaught exception handler added outside
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in preload:', error);
});