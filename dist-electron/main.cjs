"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const node_url = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const node_child_process = require("node:child_process");
const dotenv = require("dotenv");
const log = require("electron-log");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
dotenv.config();
const __dirname$1 = path.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.cjs", document.baseURI).href));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
let splash = null;
let downloadedInstallerPath = null;
function createWindow() {
  splash = new electron.BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false
  });
  splash.loadFile(path.join(process.env.VITE_PUBLIC, "splash.html"));
  win = new electron.BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      // Enable features required for speech recognition and WASM
      webSecurity: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.webContents.on("did-finish-load", () => {
    splash == null ? void 0 : splash.close();
    win == null ? void 0 : win.show();
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  return win;
}
electron.app.whenReady().then(() => {
  log.transports.file.level = "info";
  log.info("Logger initialized");
  log.info("App version:", electron.app.getVersion());
  electron.session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ["media", "microphone", "audioCapture"];
    if (allowedPermissions.includes(permission)) {
      log.info(`Permission granted: ${permission}`);
      callback(true);
    } else {
      log.info(`Permission denied: ${permission}`);
      callback(false);
    }
  });
  electron.session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowedPermissions = ["media", "microphone", "audioCapture"];
    return allowedPermissions.includes(permission);
  });
  const win2 = createWindow();
  const refreshShortcut = process.platform === "darwin" ? "Command+R" : "Control+R";
  const registered = electron.globalShortcut.register(refreshShortcut, () => {
    log.info("Refresh shortcut triggered - clearing storage and reloading");
    if (win2 && !win2.isDestroyed()) {
      win2.webContents.send("clear-storage-and-reload");
    }
  });
  if (registered) {
    log.info(`Refresh shortcut registered: ${refreshShortcut}`);
  } else {
    log.error(`Failed to register refresh shortcut: ${refreshShortcut}`);
  }
  const getDownloadUrl = () => {
    const baseUrl = "https://27infinity.in/products";
    if (process.platform === "darwin") {
      if (process.arch === "arm64") {
        return `${baseUrl}?download=mac-arm64`;
      } else {
        return `${baseUrl}?download=mac-intel`;
      }
    } else if (process.platform === "win32") {
      if (process.arch === "x64" || process.arch === "arm64") {
        return `${baseUrl}?download=win64`;
      } else {
        return `${baseUrl}?download=win32`;
      }
    }
    return baseUrl;
  };
  const checkForUpdatesViaGitHub = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const data = await response.json();
      const latestVersion = data.tag_name.replace("v", "");
      const currentVersion = electron.app.getVersion();
      const isNewer = latestVersion !== currentVersion && latestVersion.localeCompare(currentVersion, void 0, { numeric: true }) > 0;
      return {
        version: currentVersion,
        newVersion: latestVersion,
        update: isNewer,
        releaseNotes: data.body || ""
      };
    } catch (err) {
      log.error("Update check failed:", err.message);
      return {
        error: {
          message: err.message || "Failed to check for updates"
        },
        version: electron.app.getVersion()
      };
    }
  };
  setTimeout(async () => {
    const result = await checkForUpdatesViaGitHub();
    if (result.update) {
      log.info("Update available:", result.newVersion);
      if (electron.Notification.isSupported()) {
        const notification = new electron.Notification({
          title: "Update Available",
          body: `Version ${result.newVersion} is available. Click to download.`,
          icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg")
        });
        notification.on("click", () => {
          electron.shell.openExternal(getDownloadUrl());
        });
        notification.show();
      }
      win2 == null ? void 0 : win2.webContents.send("update-can-available", result);
    }
  }, 3e3);
  electron.ipcMain.handle("check-update", async () => {
    return await checkForUpdatesViaGitHub();
  });
  electron.ipcMain.handle("open-download-page", async () => {
    try {
      const downloadUrl = getDownloadUrl();
      log.info("Opening download URL:", downloadUrl);
      await electron.shell.openExternal(downloadUrl);
      return { success: true };
    } catch (err) {
      log.error("Failed to open download page:", err.message);
      return { success: false, error: err.message };
    }
  });
  const getInstallerUrl = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const data = await response.json();
      const assets = data.assets || [];
      let asset = null;
      if (process.platform === "win32") {
        if (process.arch === "x64" || process.arch === "arm64") {
          asset = assets.find(
            (a) => a.name.endsWith(".exe") && !a.name.includes("ia32")
          );
        } else {
          asset = assets.find(
            (a) => a.name.endsWith(".exe") && a.name.includes("ia32")
          );
        }
      } else if (process.platform === "darwin") {
        if (process.arch === "arm64") {
          asset = assets.find(
            (a) => a.name.includes("arm64") && a.name.endsWith(".dmg")
          );
        } else {
          asset = assets.find(
            (a) => a.name.includes("x64") && a.name.endsWith(".dmg")
          ) || assets.find(
            (a) => a.name.endsWith(".dmg") && !a.name.includes("arm64")
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
    } catch (err) {
      log.error("Failed to get installer URL:", err.message);
      return null;
    }
  };
  electron.ipcMain.handle("download-update", async () => {
    var _a;
    try {
      const installerInfo = await getInstallerUrl();
      if (!installerInfo) {
        return { success: false, error: "No installer found for your platform" };
      }
      log.info("Downloading installer:", installerInfo.url);
      const tempDir = path.join(os.tmpdir(), "27-manufacturing-update");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const filePath = path.join(tempDir, installerInfo.filename);
      const response = await fetch(installerInfo.url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      const totalSize = parseInt(response.headers.get("content-length") || "0", 10);
      let downloadedSize = 0;
      const fileStream = fs.createWriteStream(filePath);
      const reader = (_a = response.body) == null ? void 0 : _a.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(value);
        downloadedSize += value.length;
        const progress = totalSize > 0 ? Math.round(downloadedSize / totalSize * 100) : 0;
        win2 == null ? void 0 : win2.webContents.send("download-progress", {
          progress,
          downloaded: downloadedSize,
          total: totalSize
        });
      }
      fileStream.end();
      await new Promise((resolve) => fileStream.on("finish", resolve));
      downloadedInstallerPath = filePath;
      log.info("Download complete:", filePath);
      return {
        success: true,
        filePath,
        filename: installerInfo.filename
      };
    } catch (err) {
      log.error("Download failed:", err.message);
      return { success: false, error: err.message };
    }
  });
  electron.ipcMain.handle("install-update", async () => {
    try {
      if (!downloadedInstallerPath || !fs.existsSync(downloadedInstallerPath)) {
        return { success: false, error: "No downloaded installer found" };
      }
      log.info("Installing update from:", downloadedInstallerPath);
      if (process.platform === "win32") {
        node_child_process.spawn(downloadedInstallerPath, [], {
          detached: true,
          stdio: "ignore"
        }).unref();
      } else if (process.platform === "darwin") {
        node_child_process.spawn("open", [downloadedInstallerPath], {
          detached: true,
          stdio: "ignore"
        }).unref();
      }
      setTimeout(() => {
        electron.app.quit();
      }, 1e3);
      return { success: true };
    } catch (err) {
      log.error("Installation failed:", err.message);
      return { success: false, error: err.message };
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    if (electron.app.isReady()) {
      createWindow();
    } else {
      electron.app.whenReady().then(createWindow);
    }
  }
});
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
  log.info("All global shortcuts unregistered");
});
console.log(`App root: ${process.env.APP_ROOT}`);
exports.MAIN_DIST = MAIN_DIST;
exports.RENDERER_DIST = RENDERER_DIST;
exports.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL;
