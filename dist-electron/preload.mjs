"use strict";
const electron = require("electron");
const ALLOWED_RECEIVE_CHANNELS = [
  "main-process-message",
  "update-can-available",
  "download-progress",
  "clear-storage-and-reload"
];
const ALLOWED_SEND_CHANNELS = [
  "check-update",
  "open-download-page",
  "download-update",
  "install-update"
];
const ALLOWED_INVOKE_CHANNELS = [
  "check-update",
  "open-download-page",
  "download-update",
  "install-update"
];
try {
  electron.contextBridge.exposeInMainWorld("ipcRenderer", {
    /**
     * Listen for events from main process (whitelisted channels only)
     */
    on: (channel, listener) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        console.warn(`Blocked IPC receive on unauthorized channel: ${channel}`);
        return;
      }
      try {
        electron.ipcRenderer.on(channel, listener);
      } catch (err) {
        console.error("ipcRenderer.on error:", err);
      }
    },
    /**
     * Remove event listener
     */
    off: (channel, listener) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        return;
      }
      try {
        electron.ipcRenderer.off(channel, listener);
      } catch (err) {
        console.error("ipcRenderer.off error:", err);
      }
    },
    /**
     * Send message to main process (whitelisted channels only)
     */
    send: (channel, ...args) => {
      if (!ALLOWED_SEND_CHANNELS.includes(channel)) {
        console.warn(`Blocked IPC send on unauthorized channel: ${channel}`);
        return;
      }
      try {
        electron.ipcRenderer.send(channel, ...args);
      } catch (err) {
        console.error("ipcRenderer.send error:", err);
      }
    },
    /**
     * Invoke method in main process (whitelisted channels only)
     */
    invoke: (channel, ...args) => {
      if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        console.warn(`Blocked IPC invoke on unauthorized channel: ${channel}`);
        return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
      }
      try {
        return electron.ipcRenderer.invoke(channel, ...args);
      } catch (err) {
        console.error("ipcRenderer.invoke error:", err);
        return Promise.reject(err);
      }
    },
    /**
     * Listen once for event from main process (whitelisted channels only)
     */
    once: (channel, listener) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        console.warn(`Blocked IPC once on unauthorized channel: ${channel}`);
        return;
      }
      try {
        electron.ipcRenderer.once(channel, listener);
      } catch (err) {
        console.error("ipcRenderer.once error:", err);
      }
    }
  });
} catch (e) {
  console.error("contextBridge expose error:", e);
}
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception in preload:", error);
});
