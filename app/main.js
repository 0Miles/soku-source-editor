const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')

const createMainWindow = require('./window/main.window')
const { getMods, getMod, getModVersions, getSources, deleteSource, addMod, addModVersion, deleteMod, deleteModVersion } = require('./common/dir-utils')
const { cloneModSource, sync, fetchStatus } = require('./common/git-utils')

ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)) {
        nativeTheme.themeSource = message
    }
})

ipcMain.handle('get', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mods':
                return getMods(message[1])
            case 'mod':
                return getMod(message[1], message[2])
            case 'modVersions':
                return getModVersions(message[1], message[2])
            case 'sources':
                return getSources()
        }
    }
})

ipcMain.handle('post', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mod':
                return await addMod(message[1], message[2], message[3])
            case 'modVersion':
                return await addModVersion(message[1], message[2], message[3], message[4])
            case 'cloneModSource':
                return await cloneModSource(message[1], message[2])
            case 'sync':
                return await sync(message[1], message[2])
            case 'fetch':
                return await fetchStatus(message[1])
        }
    }
})

ipcMain.handle('delete', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'source':
                return deleteSource(message[1])
            case 'mod':
                return deleteMod(message[1], message[2])
            case 'modVersion':
                return deleteModVersion(message[1], message[2], message[3])
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