import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { callPythonAnalysis, callPythonTraining, openNetron } from './utils/bridge'
import { dialog } from 'electron'
import { ChildProcess } from 'child_process'
import terminate from 'terminate'

export const netron: { process?: ChildProcess } = {}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC event for analysis
  ipcMain.on('analysis', async (event, data: Record<string, string>[]) => {
    try {
      const result = await callPythonAnalysis(data)
      event.reply('analysis-reply', result)
    } catch (error) {
      console.error('Error in analysis:', error)
      event.reply('analysis-error', error)
    }
  })

  ipcMain.on(
    'training',
    async (
      event,
      data: Record<string, string>[],
      predictionData: Record<string, string>[],
      args
    ) => {
      try {
        const result = await callPythonTraining(data, predictionData, args)
        event.reply('training-reply', result)
      } catch (error) {
        console.error('Error in analysis:', error)
        event.reply('training-error', error)
      }
    }
  )

  ipcMain.on('save-dialog', async (event, params) => {
    try {
      const data = await dialog.showSaveDialog(params)

      event.reply('save-dialog-reply', data)
    } catch (error) {
      console.error('Error in analysis:', error)
      event.reply('save-dialog-error', error)
    }
  })

  ipcMain.on('open-in-netron', async (event, path) => {
    await openNetron(path, event)
  })

  ipcMain.on('shutdown-netron', async (event) => {
    if (netron.process?.pid) {
      terminate(netron.process.pid)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
