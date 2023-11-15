const path = require('path')
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')

const createMainWindow = require('./window/main.window')
const { getMods, getMod, getModVersions, getSources, deleteSource, writeFile } = require('./common/dir-utils')
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
                return writeFile(path.resolve('sources', message[1], 'modules', message[2]), 'mod.json', message[3])
        }
    }
})

ipcMain.handle('git', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
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
                return await deleteSource(message[1])
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