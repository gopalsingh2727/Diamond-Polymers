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
  'show-notification',
  'save-file',
  // ── Dashboard file cache ─────────────────────────────────────────────────
  'dashboard-cache:saveFromText',   // ★ new — writes raw S3 text to disk (no IPC size limit issues)
  'dashboard-cache:save',
  'dashboard-cache:read',
  'dashboard-cache:list',
  'dashboard-cache:delete',
  'dashboard-cache:open-folder',
  'dashboard-cache:download',
];

console.log('[Preload] Loading preload script...');

try {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) return;
      try { ipcRenderer.on(channel, listener); } catch {}
    },
    off: (channel: string, listener: (...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) return;
      try { ipcRenderer.off(channel, listener); } catch {}
    },
    send: (channel: string, ...args: any[]) => {
      if (!ALLOWED_SEND_CHANNELS.includes(channel)) return;
      try { ipcRenderer.send(channel, ...args); } catch {}
    },
    invoke: (channel: string, ...args: any[]) => {
      if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
      }
      try { return ipcRenderer.invoke(channel, ...args); }
      catch (err) { return Promise.reject(err); }
    },
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) return;
      try { ipcRenderer.once(channel, listener); } catch {}
    },
  });

  // ── dashboardCache convenience wrapper ────────────────────────────────────
  contextBridge.exposeInMainWorld('dashboardCache', {
    // ★ KEY: sends raw text string — avoids serializing huge JS arrays through IPC
    saveFromText: (data: any) => ipcRenderer.invoke('dashboard-cache:saveFromText', data),
    // Fallback for small datasets (passes JS object)
    save:         (data: any) => ipcRenderer.invoke('dashboard-cache:save',         data),
    read:         (params: any) => ipcRenderer.invoke('dashboard-cache:read',       params),
    list:         ()            => ipcRenderer.invoke('dashboard-cache:list'),
    delete:       (params: any) => ipcRenderer.invoke('dashboard-cache:delete',     params),
    openFolder:   ()            => ipcRenderer.invoke('dashboard-cache:open-folder'),
    download:     (params: any) => ipcRenderer.invoke('dashboard-cache:download',   params),
  });

  // ── Existing ipcRenderer listeners ───────────────────────────────────────
  ipcRenderer.on('main-process-message', (_event, ...args) => {
    // handle main process messages here if needed
  });

  ipcRenderer.on('clear-storage-and-reload', () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  });

  console.log('[Preload] IPC Renderer + dashboardCache successfully exposed to window');
} catch (e) {
  console.error('[Preload] Failed to expose IPC Renderer:', e);
}

process.on('uncaughtException', () => {});