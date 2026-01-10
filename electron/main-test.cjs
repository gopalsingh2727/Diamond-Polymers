const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('Testing electron import...');
console.log('app:', typeof app);
console.log('BrowserWindow:', typeof BrowserWindow);

let win;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173');
  console.log('App started successfully!');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
