const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require("electron-updater")
const electronLocalshortcut = require('electron-localshortcut');

let mainWindow
let child
let url
function minimizeWindow() {
  mainWindow.setFullScreen(false);
  mainWindow.unmaximize()
}
autoUpdater.checkForUpdatesAndNotify()

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      backgroundThrottling: false
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
  mainWindow.on('maximize', function () {
    console.log('maximize')
    if (child == null) mainWindow.setFullScreen(true)
  })
  subscribeRenderEvents()
  electronLocalshortcut.register(mainWindow, 'Escape', ()=>{
    minimizeWindow()
  })
  electronLocalshortcut.register(mainWindow, 'F5', ()=>{
    mainWindow.webContents.reload()
  })
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+Shift+J', ()=>{
    mainWindow.webContents.openDevTools()
  })
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
  electronLocalshortcut.unregister(mainWindow, 'Escape');
  electronLocalshortcut.unregister(mainWindow, 'CommandOrControl+Shift+J');
  electronLocalshortcut.unregisterAll(mainWindow, 'F5');
  electronLocalshortcut.unregisterAll(mainWindow);
});
function subscribeRenderEvents() {
  ipcMain.on('close-screenshare-window', function () {
    console.log('close-screenshare-window')
    child.close()
    child = null
    mainWindow.focus()
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
    mainWindow.setFullScreen(false);
    mainWindow.maximize()
    mainWindow.blur()
    child = new BrowserWindow({
      // parent: mainWindow,
      width: 420,
      height: 40,
      // height: 400,
      frame: false,
      resizable: false,
      transparent: true,
      x: (width / 2 ) - 200,
      y: height - 50,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false
      }
    })
    child.loadFile(path.join(__dirname, 'src/screen-share-window/app.html'))
    child.once('ready-to-show', () => {
      child.show()
    })
    child.on('closed', () => {
      child = null
      mainWindow.webContents.send('screenshare-stoped-from-ec')
    })
   
    // child.focus()
  })
}

