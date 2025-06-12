import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()

import * as log from 'electron-log'

autoUpdater.logger = log


log.transports.file.level = 'info'

// Log something
log.info('Logger initialized')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'gopalsingh2727',
    repo: 'Diamond-Polymers',
    private: true,
    token: process.env.GH_TOKEN,
  })

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  ipcMain.handle('check-update', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return result?.updateInfo || {}
    } catch (err: any) {
      return { error: { message: err.message || 'Check failed' } }
    }
  })

  ipcMain.handle('start-download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-can-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    win?.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    win?.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('update-error', { message: err.message })
  })
})