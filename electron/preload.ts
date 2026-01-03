import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Security: Whitelist of allowed IPC channels
const ALLOWED_RECEIVE_CHANNELS = [
  'main-process-message',
  'update-can-available',
  'download-progress',
  'clear-storage-and-reload',
];

const ALLOWED_SEND_CHANNELS = [
  'check-update',
  'open-download-page',
  'download-update',
  'install-update',
];

const ALLOWED_INVOKE_CHANNELS = [
  'check-update',
  'open-download-page',
  'download-update',
  'install-update',
];

try {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    /**
     * Listen for events from main process (whitelisted channels only)
     */
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        return;
      }
      try {
        ipcRenderer.on(channel, listener);
      } catch (err) {
      }
    },

    /**
     * Remove event listener
     */
    off: (channel: string, listener: (...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        return;
      }
      try {
        ipcRenderer.off(channel, listener);
      } catch (err) {
      }
    },

    /**
     * Send message to main process (whitelisted channels only)
     */
    send: (channel: string, ...args: any[]) => {
      if (!ALLOWED_SEND_CHANNELS.includes(channel)) {
        return;
      }
      try {
        ipcRenderer.send(channel, ...args);
      } catch (err) {
      }
    },

    /**
     * Invoke method in main process (whitelisted channels only)
     */
    invoke: (channel: string, ...args: any[]) => {
      if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
      }
      try {
        return ipcRenderer.invoke(channel, ...args);
      } catch (err) {
        return Promise.reject(err);
      }
    },

    /**
     * Listen once for event from main process (whitelisted channels only)
     */
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        return;
      }
      try {
        ipcRenderer.once(channel, listener);
      } catch (err) {
      }
    }
  });
} catch (e) {
}

// ✅ Uncaught exception handler added outside
process.on('uncaughtException', (error) => {
});