import { app, BrowserWindow, ipcMain, shell, Notification, session, globalShortcut } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import log from 'electron-log';

dotenv.config();

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

function createWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
  });

  splash.loadFile(path.join(process.env.VITE_PUBLIC!, 'splash.html'));

  win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      // Enable features required for speech recognition and WASM
      webSecurity: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('did-finish-load', () => {
    splash?.close();
    win?.show();
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  // Initialize logger
  log.transports.file.level = 'info';
  log.info('Logger initialized');
  log.info('App version:', app.getVersion());

  // Set up permission handlers for microphone access (required for speech recognition)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture'];
    if (allowedPermissions.includes(permission)) {
      log.info(`Permission granted: ${permission}`);
      callback(true);
    } else {
      log.info(`Permission denied: ${permission}`);
      callback(false);
    }
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture'];
    return allowedPermissions.includes(permission);
  });

  const win = createWindow();

  // Register global keyboard shortcut for hard refresh (Cmd+R on macOS, Ctrl+R on Windows/Linux)
  const refreshShortcut = process.platform === 'darwin' ? 'Command+R' : 'Control+R';
  const registered = globalShortcut.register(refreshShortcut, () => {
    log.info('Refresh shortcut triggered - clearing storage and reloading');
    if (win && !win.isDestroyed()) {
      // Send IPC message to renderer to clear localStorage
      win.webContents.send('clear-storage-and-reload');
    }
  });

  if (registered) {
    log.info(`Refresh shortcut registered: ${refreshShortcut}`);
  } else {
    log.error(`Failed to register refresh shortcut: ${refreshShortcut}`);
  }

  // Get download URL with platform-specific auto-download parameter
  const getDownloadUrl = (): string => {
    const baseUrl = 'https://27infinity.in/products';

    if (process.platform === 'darwin') {
      // macOS - check if ARM or Intel
      if (process.arch === 'arm64') {
        return `${baseUrl}?download=mac-arm64`;
      } else {
        return `${baseUrl}?download=mac-intel`;
      }
    } else if (process.platform === 'win32') {
      // Windows - check if 64-bit or 32-bit
      if (process.arch === 'x64' || process.arch === 'arm64') {
        return `${baseUrl}?download=win64`;
      } else {
        return `${baseUrl}?download=win32`;
      }
    }

    // Default - no auto-download parameter
    return baseUrl;
  };

  // GitHub API check for updates
  const checkForUpdatesViaGitHub = async () => {
    try {
      const response = await fetch(
        'https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest'
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const latestVersion = data.tag_name.replace('v', '');
      const currentVersion = app.getVersion();

      // Compare versions
      const isNewer = latestVersion !== currentVersion &&
        latestVersion.localeCompare(currentVersion, undefined, { numeric: true }) > 0;

      return {
        version: currentVersion,
        newVersion: latestVersion,
        update: isNewer,
        releaseNotes: data.body || ''
      };
    } catch (err: any) {
      log.error('Update check failed:', err.message);
      return {
        error: {
          message: err.message || 'Failed to check for updates'
        },
        version: app.getVersion()
      };
    }
  };

  // Check for updates on startup
  setTimeout(async () => {
    const result = await checkForUpdatesViaGitHub();
    if (result.update) {
      log.info('Update available:', result.newVersion);

      // Show system notification
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: 'Update Available',
          body: `Version ${result.newVersion} is available. Click to download.`,
          icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg')
        });

        notification.on('click', () => {
          shell.openExternal(getDownloadUrl());
        });

        notification.show();
      }

      // Also notify the renderer
      win?.webContents.send('update-can-available', result);
    }
  }, 3000); // Check 3 seconds after startup

  // IPC handler for manual update check
  ipcMain.handle('check-update', async () => {
    return await checkForUpdatesViaGitHub();
  });

  // IPC handler to open download page
  ipcMain.handle('open-download-page', async () => {
    try {
      const downloadUrl = getDownloadUrl();
      log.info('Opening download URL:', downloadUrl);
      await shell.openExternal(downloadUrl);
      return { success: true };
    } catch (err: any) {
      log.error('Failed to open download page:', err.message);
      return { success: false, error: err.message };
    }
  });

  // Get installer download URL from GitHub release
  const getInstallerUrl = async (): Promise<{ url: string; filename: string } | null> => {
    try {
      const response = await fetch(
        'https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest'
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const assets = data.assets || [];

      let asset = null;

      if (process.platform === 'win32') {
        // Find Windows installer (.exe)
        if (process.arch === 'x64' || process.arch === 'arm64') {
          asset = assets.find((a: any) =>
            a.name.endsWith('.exe') && !a.name.includes('ia32')
          );
        } else {
          asset = assets.find((a: any) =>
            a.name.endsWith('.exe') && a.name.includes('ia32')
          );
        }
      } else if (process.platform === 'darwin') {
        // Find macOS installer (.dmg)
        if (process.arch === 'arm64') {
          asset = assets.find((a: any) =>
            a.name.includes('arm64') && a.name.endsWith('.dmg')
          );
        } else {
          asset = assets.find((a: any) =>
            a.name.includes('x64') && a.name.endsWith('.dmg')
          ) || assets.find((a: any) =>
            a.name.endsWith('.dmg') && !a.name.includes('arm64')
          );
        }
      }

      if (asset) {
        return {
          url: asset.browser_download_url,
          filename: asset.name
        };
      }

      return null;
    } catch (err: any) {
      log.error('Failed to get installer URL:', err.message);
      return null;
    }
  };

  // IPC handler to download update
  ipcMain.handle('download-update', async () => {
    try {
      const installerInfo = await getInstallerUrl();

      if (!installerInfo) {
        return { success: false, error: 'No installer found for your platform' };
      }

      log.info('Downloading installer:', installerInfo.url);

      // Create temp directory for download
      const tempDir = path.join(os.tmpdir(), '27-manufacturing-update');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filePath = path.join(tempDir, installerInfo.filename);

      // Download the file
      const response = await fetch(installerInfo.url);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
      let downloadedSize = 0;

      const fileStream = fs.createWriteStream(filePath);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        fileStream.write(value);
        downloadedSize += value.length;

        // Send progress to renderer
        const progress = totalSize > 0 ? Math.round((downloadedSize / totalSize) * 100) : 0;
        win?.webContents.send('download-progress', {
          progress,
          downloaded: downloadedSize,
          total: totalSize
        });
      }

      fileStream.end();

      // Wait for file to finish writing
      await new Promise((resolve) => fileStream.on('finish', resolve));

      downloadedInstallerPath = filePath;
      log.info('Download complete:', filePath);

      return {
        success: true,
        filePath,
        filename: installerInfo.filename
      };
    } catch (err: any) {
      log.error('Download failed:', err.message);
      return { success: false, error: err.message };
    }
  });

  // IPC handler to install update
  ipcMain.handle('install-update', async () => {
    try {
      if (!downloadedInstallerPath || !fs.existsSync(downloadedInstallerPath)) {
        return { success: false, error: 'No downloaded installer found' };
      }

      log.info('Installing update from:', downloadedInstallerPath);

      if (process.platform === 'win32') {
        // Run Windows installer
        // The /S flag runs NSIS installer silently, but we'll let user see it
        spawn(downloadedInstallerPath, [], {
          detached: true,
          stdio: 'ignore'
        }).unref();
      } else if (process.platform === 'darwin') {
        // Open DMG file on macOS
        spawn('open', [downloadedInstallerPath], {
          detached: true,
          stdio: 'ignore'
        }).unref();
      }

      // Quit the app to allow installation
      setTimeout(() => {
        app.quit();
      }, 1000);

      return { success: true };
    } catch (err: any) {
      log.error('Installation failed:', err.message);
      return { success: false, error: err.message };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (app.isReady()) {
      createWindow();
    } else {
      app.whenReady().then(createWindow);
    }
  }
});

// Unregister all shortcuts when app is quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  log.info('All global shortcuts unregistered');
});

console.log(`App root: ${process.env.APP_ROOT}`);