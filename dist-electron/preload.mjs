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
        return;
      }
      try {
        electron.ipcRenderer.on(channel, listener);
      } catch (err) {
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
      }
    },
    /**
     * Send message to main process (whitelisted channels only)
     */
    send: (channel, ...args) => {
      if (!ALLOWED_SEND_CHANNELS.includes(channel)) {
        return;
      }
      try {
        electron.ipcRenderer.send(channel, ...args);
      } catch (err) {
      }
    },
    /**
     * Invoke method in main process (whitelisted channels only)
     */
    invoke: (channel, ...args) => {
      if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
      }
      try {
        return electron.ipcRenderer.invoke(channel, ...args);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    /**
     * Listen once for event from main process (whitelisted channels only)
     */
    once: (channel, listener) => {
      if (!ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
        return;
      }
      try {
        electron.ipcRenderer.once(channel, listener);
      } catch (err) {
      }
    }
  });
} catch (e) {
}
process.on("uncaughtException", (error) => {
});
