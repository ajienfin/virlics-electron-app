// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut} = require('electron')
const path = require('path')
require('update-electron-app')()
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function minimizeWindow() {
  mainWindow.setFullScreen(false);
}
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    fullscreen:true,
    fullscreenable:true
  })
  mainWindow.maximize()
  // mainWindow.webContents.openDevTools()
  let url = process.argv.slice(2, process.argv.length)
  if (url.length > 0) url = url[0]
  else url = "https://testingapp.spjain.org/"

  mainWindow.loadURL(url)
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  globalShortcut.register('Escape', function () {
    console.log('key is pressed');
    minimizeWindow();
  });
  globalShortcut.register('CommandOrControl+Shift+J', function () {
    console.log('key is pressed');
    mainWindow.webContents.openDevTools()
  });
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(message + " " + sourceId + " (" + line + ")");
  });
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

