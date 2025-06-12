"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on: (channel, listener) => {
    electron.ipcRenderer.on(channel, listener);
  },
  off: (channel, listener) => {
    electron.ipcRenderer.off(channel, listener);
  },
  send: (channel, ...args) => {
    electron.ipcRenderer.send(channel, ...args);
  },
  invoke: (channel, ...args) => {
    return electron.ipcRenderer.invoke(channel, ...args);
  }
});
