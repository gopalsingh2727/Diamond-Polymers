"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  /**
   * Listen for events from main process
   */
  on: (channel, listener) => {
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
    try {
      electron.ipcRenderer.off(channel, listener);
    } catch (err) {
      console.error("ipcRenderer.off error:", err);
    }
  },
  /**
   * Send message to main process
   */
  send: (channel, ...args) => {
    try {
      electron.ipcRenderer.send(channel, ...args);
    } catch (err) {
      console.error("ipcRenderer.send error:", err);
    }
  },
  /**
   * Invoke method in main process
   */
  invoke: (channel, ...args) => {
    try {
      return electron.ipcRenderer.invoke(channel, ...args);
    } catch (err) {
      console.error("ipcRenderer.invoke error:", err);
      return Promise.reject(err);
    }
  },
  /**
   * Listen once for event from main process
   */
  once: (channel, listener) => {
    try {
      electron.ipcRenderer.once(channel, listener);
    } catch (err) {
      console.error("ipcRenderer.once error:", err);
    }
  }
});
