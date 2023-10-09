// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('node:path')
const isDev = require('electron-is-dev')

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth:600,
        minHeight:400,
        webPreferences: {
            preload: path.join(__dirname, 'main-preload.js'),
        }
    })

    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/');
        // Open the DevTools.
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.removeMenu()
        mainWindow.loadFile('dist/index.html');
    }
}

ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)){
        nativeTheme.themeSource = message
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
