const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const Positioner = require('electron-positioner')
require('update-electron-app')()
let mainWindow
let child
let url
function minimizeWindow() {
  mainWindow.setFullScreen(false);
  mainWindow.unmaximize()
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    fullscreen: true,
    fullscreenable: true
  })
  url = process.argv.slice(2, process.argv.length)
  if (url.length > 0) url = url[0]
  else url = "https://testingapp.spjain.org/"

  mainWindow.loadURL(url, { "extraHeaders": "pragma: no-cache\n" })
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  globalShortcut.register('Escape', function () {
    minimizeWindow();
  });
  globalShortcut.register('CommandOrControl+Shift+J', function () {
    console.log('key is pressed');
    mainWindow.webContents.openDevTools()
  });
  mainWindow.on('maximize', function () {
    console.log('maximize')
    mainWindow.setFullScreen(true)
  })
  subscribeRenderEvents()
}
app.on('ready', createWindow)


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

app.on('will-quit', function () {
  globalShortcut.unregister('Escape');
  globalShortcut.unregister('CommandOrControl+Shift+J');
  globalShortcut.unregisterAll();
});
function subscribeRenderEvents() {
  ipcMain.on('close-screenshare-window', function () {
    child.close()
    child = null
    mainWindow.webContents.send('screenshare-stoped-from-ec')

  })
  ipcMain.on('close-screen-share-window', function () {
    if (child == null) return
    child.close()
    child = null
  })
  ipcMain.on('screen-share-window', function () {
    let screen = require('electron').screen
    let url = new URL(mainWindow.webContents.getURL())
    let displays = screen.getAllDisplays();
    let height = 0;
    let width = 0;
    for (var i in displays) {
      height += displays[i].bounds.height;
      width += displays[i].bounds.width;
    }
    child = new BrowserWindow({
      // parent: mainWindow,
      width: 420,
      height: 40,
      frame: false,
      resizable: false,
      transparent: true,
      x: (width / 2 ) - 200,
      y: height - 50
    })
    child.loadFile(path.join(__dirname, 'src/screen-share-window/app.html'))
    child.once('ready-to-show', () => {
      child.show()
    })
    child.on('closed', () => {
      child = null
      mainWindow.webContents.send('screenshare-stoped-from-ec')
    })
  })
}

