import { app, BrowserWindow, ipcMain, shell, Notification, session, globalShortcut, Menu, dialog } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import log from 'electron-log';

dotenv.config();

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://* https://api.github.com https://*.27infinity.in https://*.execute-api.ap-south-1.amazonaws.com https://*.amazonaws.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
].join('; ');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;
let downloadedInstallerPath: string | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD CACHE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getCacheDir(): string {
  const dir = path.join(app.getPath('userData'), 'dashboard-cache');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function cachePath(fromDate: string, toDate: string): string {
  return path.join(getCacheDir(), `orders_${fromDate || 'all'}_${toDate || 'all'}.json`);
}

function ordersToCSV(orders: any[]): string {
  if (!orders.length) return '';
  const allKeys = [...new Set(orders.flatMap((o: any) =>
    Object.keys(o).filter(k => typeof o[k] !== 'object' || o[k] === null)
  ))] as string[];
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    allKeys.map(esc).join(','),
    ...orders.map((o: any) => allKeys.map(k => esc(o[k])).join(','))
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
function createWindow() {
  splash = new BrowserWindow({
    width: 400, height: 300,
    frame: false, transparent: true, alwaysOnTop: true, resizable: false,
  });
  splash.loadFile(path.join(process.env.VITE_PUBLIC!, 'splash.html'));

  win = new BrowserWindow({
    show: false, width: 1200, height: 800,
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    autoHideMenuBar: true, backgroundColor: '#f9fafb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true, allowRunningInsecureContent: false,
      contextIsolation: true, nodeIntegration: false,
      v8CacheOptions: 'bypassHeatCheck', backgroundThrottling: false,
    },
  });

  win.webContents.on('did-finish-load', () => {
    splash?.close(); win?.show();
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(RENDERER_DIST, 'index.html'));

  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  log.transports.file.level = 'info';
  log.info('Logger initialized');
  log.info('App version:', app.getVersion());

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP_POLICY],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block'],
      }
    });
  });

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.hostname !== 'localhost' && !parsedUrl.hostname.endsWith('27infinity.in')) {
        log.warn(`Blocked navigation to: ${navigationUrl}`);
        event.preventDefault();
      }
    });
    contents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      log.info(`Opening external URL: ${url}`);
      return { action: 'deny' };
    });
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'audioCapture', 'notifications'];
    callback(allowed.includes(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    return ['media', 'microphone', 'audioCapture', 'notifications'].includes(permission);
  });

  const win = createWindow();

  // ── Shortcuts ──────────────────────────────────────────────────────────────
  const refreshShortcut = process.platform === 'darwin' ? 'Command+R' : 'Control+R';
  if (globalShortcut.register(refreshShortcut, () => {
    if (win && !win.isDestroyed()) win.webContents.send('clear-storage-and-reload');
  })) log.info(`Registered: ${refreshShortcut}`);

  const devToolsShortcut = process.platform === 'darwin' ? 'Option+Command+I' : 'Control+Shift+I';
  if (globalShortcut.register(devToolsShortcut, () => {
    if (win && !win.isDestroyed()) {
      if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
      else win.webContents.openDevTools();
    }
  })) log.info(`Registered: ${devToolsShortcut}`);

  // ── Update helpers ─────────────────────────────────────────────────────────
  const getDownloadUrl = (): string => {
    const base = 'https://27infinity.in/products';
    if (process.platform === 'darwin') return process.arch === 'arm64' ? `${base}?download=mac-arm64` : `${base}?download=mac-intel`;
    if (process.platform === 'win32') return (process.arch === 'x64' || process.arch === 'arm64') ? `${base}?download=win64` : `${base}?download=win32`;
    return base;
  };

  const checkForUpdatesViaGitHub = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest');
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      const latest  = data.tag_name.replace('v', '');
      const current = app.getVersion();
      const isNewer = latest !== current && latest.localeCompare(current, undefined, { numeric: true }) > 0;
      return { version: current, newVersion: latest, update: isNewer, releaseNotes: data.body || '' };
    } catch (err: any) {
      log.error('Update check failed:', err.message);
      return { error: { message: err.message || 'Failed to check for updates' }, version: app.getVersion() };
    }
  };

  setTimeout(async () => {
    const result = await checkForUpdatesViaGitHub();
    if (result.update) {
      if (Notification.isSupported()) {
        const n = new Notification({ title: 'Update Available', body: `Version ${result.newVersion} is available.`, icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg') });
        n.on('click', () => shell.openExternal(getDownloadUrl()));
        n.show();
      }
      win?.webContents.send('update-can-available', result);
    }
  }, 10000);

  // ── Standard IPC handlers ──────────────────────────────────────────────────
  ipcMain.handle('check-update', async () => checkForUpdatesViaGitHub());

  ipcMain.handle('show-notification', async (_event, options: { title: string; body: string; icon?: string; silent?: boolean }) => {
    try {
      if (!Notification.isSupported()) return { success: false, error: 'Not supported' };
      const n = new Notification({ title: options.title, body: options.body, icon: path.join(process.env.VITE_PUBLIC!, 'icon.png'), silent: options.silent || false });
      n.on('click', () => { if (win && !win.isDestroyed()) { if (win.isMinimized()) win.restore(); win.focus(); } });
      n.show();
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('open-download-page', async () => {
    try { await shell.openExternal(getDownloadUrl()); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  });

  const getInstallerUrl = async (): Promise<{ url: string; filename: string } | null> => {
    try {
      const res = await fetch('https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest');
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      const assets = data.assets || [];
      let asset = null;
      if (process.platform === 'win32') {
        asset = (process.arch === 'x64' || process.arch === 'arm64')
          ? assets.find((a: any) => a.name.endsWith('.exe') && !a.name.includes('ia32'))
          : assets.find((a: any) => a.name.endsWith('.exe') && a.name.includes('ia32'));
      } else if (process.platform === 'darwin') {
        asset = process.arch === 'arm64'
          ? assets.find((a: any) => a.name.includes('arm64') && a.name.endsWith('.dmg'))
          : assets.find((a: any) => a.name.includes('x64') && a.name.endsWith('.dmg'))
            || assets.find((a: any) => a.name.endsWith('.dmg') && !a.name.includes('arm64'));
      }
      return asset ? { url: asset.browser_download_url, filename: asset.name } : null;
    } catch (err: any) { log.error('getInstallerUrl failed:', err.message); return null; }
  };

  ipcMain.handle('download-update', async () => {
    try {
      const info = await getInstallerUrl();
      if (!info) return { success: false, error: 'No installer found' };
      const tempDir  = path.join(os.tmpdir(), '27-manufacturing-update');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, info.filename);
      const res      = await fetch(info.url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const totalSize = parseInt(res.headers.get('content-length') || '0', 10);
      let downloaded  = 0;
      const fileStream = fs.createWriteStream(filePath);
      const reader     = res.body?.getReader();
      if (!reader) throw new Error('No reader');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(value);
        downloaded += value.length;
        const progress = totalSize > 0 ? Math.round((downloaded / totalSize) * 100) : 0;
        win?.webContents.send('download-progress', { progress, downloaded, total: totalSize });
      }
      fileStream.end();
      await new Promise(r => fileStream.on('finish', r));
      downloadedInstallerPath = filePath;
      return { success: true, filePath, filename: info.filename };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('save-file', async (_event, { filename, content }: { filename: string; content: string }) => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [
          { name: 'JSON', extensions: ['json'] }, { name: 'CSV', extensions: ['csv'] },
          { name: 'ZIP',  extensions: ['zip']  }, { name: 'HTML', extensions: ['html'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (canceled || !filePath) return { success: false, canceled: true };
      if (filename.endsWith('.zip')) fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
      else fs.writeFileSync(filePath, content, 'utf-8');
      log.info('File saved:', filePath);
      return { success: true, filePath };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('install-update', async () => {
    try {
      if (!downloadedInstallerPath || !fs.existsSync(downloadedInstallerPath)) return { success: false, error: 'No installer found' };
      if (process.platform === 'win32') spawn(downloadedInstallerPath, [], { detached: true, stdio: 'ignore' }).unref();
      else if (process.platform === 'darwin') spawn('open', [downloadedInstallerPath], { detached: true, stdio: 'ignore' }).unref();
      setTimeout(() => app.quit(), 1000);
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  // ── Dashboard cache IPC handlers ───────────────────────────────────────────

  // ★ KEY FIX: saveFromText — receives raw JSON text string already downloaded
  // by the renderer, writes it straight to disk. Avoids IPC serialization of
  // huge JS object arrays which causes "Invalid string length" error.
  ipcMain.handle('dashboard-cache:saveFromText', async (_event, {
    fromDate, toDate, total, savedAt, s3Text,
  }: { fromDate: string; toDate: string; total: number; savedAt: number; s3Text: string }) => {
    try {
      const fp = cachePath(fromDate, toDate);

      // s3Text is the raw S3 response: { orders: [...] }
      // We need to wrap it with our metadata. Parse minimally to get orders count,
      // then write a combined file without re-serializing the whole array.
      // Strategy: write metadata header + splice in orders array from s3Text
      let ordersJson = '[]';
      try {
        const parsed = JSON.parse(s3Text);
        // Re-stringify just the orders — this works because we're in Node.js main
        // process where the 512MB string limit is much more generous, and the
        // string was already transmitted as text so no extra serialization cost.
        ordersJson = JSON.stringify(parsed.orders || parsed);
      } catch (parseErr: any) {
        log.warn('[cache:saveFromText] Could not parse s3Text, saving raw:', parseErr.message);
        // Save raw s3Text as-is with a wrapper
        const wrapper = `{"orders":${s3Text},"total":${total},"fromDate":"${fromDate}","toDate":"${toDate}","savedAt":${savedAt}}`;
        fs.writeFileSync(fp, wrapper, 'utf-8');
        log.info(`[cache] Saved raw s3Text to ${fp}`);
        return { success: true };
      }

      const payload = `{"orders":${ordersJson},"total":${total},"fromDate":"${fromDate}","toDate":"${toDate}","savedAt":${savedAt}}`;
      fs.writeFileSync(fp, payload, 'utf-8');
      log.info(`[cache] saveFromText → ${fp} (${(payload.length / 1024).toFixed(0)} KB)`);
      return { success: true };
    } catch (err: any) {
      log.error('[cache] saveFromText error:', err.message);
      return { success: false, error: err.message };
    }
  });

  // Save small orders array (passed as JS object via IPC — only for small datasets)
  ipcMain.handle('dashboard-cache:save', async (_event, {
    fromDate, toDate, orders, total, savedAt,
  }: { fromDate: string; toDate: string; orders: any[]; total: number; savedAt: number }) => {
    try {
      const payload = JSON.stringify({ orders, total, fromDate, toDate, savedAt: savedAt || Date.now() }, null, 2);
      fs.writeFileSync(cachePath(fromDate, toDate), payload, 'utf-8');
      log.info(`[cache] Saved ${orders.length} orders (${fromDate} → ${toDate})`);
      return { success: true };
    } catch (err: any) {
      log.error('[cache] save error:', err.message);
      return { success: false, error: err.message };
    }
  });

  // Read orders from disk
  ipcMain.handle('dashboard-cache:read', async (_event, { fromDate, toDate }: { fromDate: string; toDate: string }) => {
    try {
      const fp = cachePath(fromDate, toDate);
      if (!fs.existsSync(fp)) return { success: false, orders: [], error: 'No cache file found' };
      const raw    = fs.readFileSync(fp, 'utf-8');
      const parsed = JSON.parse(raw);
      log.info(`[cache] Read ${parsed.orders?.length ?? 0} orders (${fromDate} → ${toDate})`);
      return { success: true, orders: parsed.orders || [], total: parsed.total || 0, savedAt: parsed.savedAt };
    } catch (err: any) {
      log.error('[cache] read error:', err.message);
      return { success: false, orders: [], error: err.message };
    }
  });

  // List all cached files
  ipcMain.handle('dashboard-cache:list', async () => {
    try {
      const dir   = getCacheDir();
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      const now   = Date.now();
      const result = files.map(filename => {
        const fp = path.join(dir, filename);
        try {
          const raw    = fs.readFileSync(fp, 'utf-8');
          const parsed = JSON.parse(raw);
          const stat   = fs.statSync(fp);
          return {
            filename, filepath: fp,
            fromDate:   parsed.fromDate || '',
            toDate:     parsed.toDate   || '',
            total:      parsed.total    || (Array.isArray(parsed.orders) ? parsed.orders.length : 0),
            savedAt:    parsed.savedAt  || stat.mtimeMs,
            ageMinutes: Math.round((now - (parsed.savedAt || stat.mtimeMs)) / 60000),
            sizeKB:     Math.round(stat.size / 1024),
          };
        } catch { return null; }
      }).filter(Boolean);
      return { files: result };
    } catch (err: any) {
      log.error('[cache] list error:', err.message);
      return { files: [] };
    }
  });

  // Delete a cached file
  ipcMain.handle('dashboard-cache:delete', async (_event, { fromDate, toDate }: { fromDate: string; toDate: string }) => {
    try {
      const fp = cachePath(fromDate, toDate);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      log.info(`[cache] Deleted ${fp}`);
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  // Download via native Save dialog
  ipcMain.handle('dashboard-cache:download', async (_event, { fromDate, toDate, format }: { fromDate: string; toDate: string; format: 'JSON' | 'CSV' }) => {
    try {
      const fp = cachePath(fromDate, toDate);
      if (!fs.existsSync(fp)) return { success: false, error: 'Cache file not found' };

      const raw    = fs.readFileSync(fp, 'utf-8');
      const parsed = JSON.parse(raw);
      const orders = parsed.orders || [];
      const slug   = `orders_${fromDate || 'all'}_${toDate || 'all'}`;
      const isCSV  = format === 'CSV';

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: `Save ${format}`,
        defaultPath: path.join(app.getPath('downloads'), `${slug}.${isCSV ? 'csv' : 'json'}`),
        filters: [isCSV ? { name: 'CSV', extensions: ['csv'] } : { name: 'JSON', extensions: ['json'] }],
      });
      if (canceled || !filePath) return { canceled: true };

      fs.writeFileSync(filePath, isCSV ? ordersToCSV(orders) : JSON.stringify({ orders, total: orders.length, fromDate, toDate }, null, 2), 'utf-8');
      log.info(`[cache] Downloaded ${format} → ${filePath}`);
      return { success: true, filePath };
    } catch (err: any) { return { success: false, error: err.message }; }
  });

  // Open cache folder
  ipcMain.handle('dashboard-cache:open-folder', async () => {
    shell.openPath(getCacheDir());
    return { success: true };
  });

  log.info('All IPC handlers registered ✓');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); win = null; }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (app.isReady()) createWindow();
    else app.whenReady().then(createWindow);
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  log.info('All global shortcuts unregistered');
});