const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')

const createMainWindow = require('./window/main.window')
const getMods = require('./common/get-mods')

ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)){
        nativeTheme.themeSource = message
    }
})

ipcMain.handle('get', (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch(message[0]) {
            case 'mods':
                return getMods()
        }
    }
})

app.whenReady().then(() => {
    createMainWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})