const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')

const createMainWindow = require('./window/main.window')

const { ModManager } = require('./mod-manager/mod-manager')
const getFilesTree = require('./common/get-files-tree')
const modManager = new ModManager()

ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)) {
        nativeTheme.themeSource = message
    }
})

ipcMain.handle('get', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mods':
                return modManager.getSource(message[1])?.modules?.map(x => x.getData())
            case 'mod':
                return modManager.getSource(message[1])?.getModule(message[2])?.getData()
            case 'modVersions':
                return modManager.getSource(message[1])?.getModule(message[2])?.versions?.map(x => x.getData())
            case 'sources':
                return modManager.sources?.map(x => x.getData())
            case 'filesTree':
                return getFilesTree(message[1])
        }
    }
})

ipcMain.handle('post', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mod':
                return modManager
                    .getSource(message[1])
                    .addModule(message[2], message[3])
            case 'modVersion':
                return modManager
                    .getSource(message[1])
                    .getModule(message[2])
                    .addVersion(message[3], message[4])
            case 'cloneModSource':
                return await modManager.addSource(message[1], message[2])
            case 'sync':
                await modManager.getSource(message[1]).sync()
                return JSON.parse(JSON.stringify(modManager.getSource(message[1]).status))
            case 'fetch':
                await modManager.getSource(message[1]).fetchStatus()
                return JSON.parse(JSON.stringify(modManager.getSource(message[1]).status))
            case 'copyModVersionFiles':
                return modManager.getSource(message[1]).getModule(message[2]).getVersion(message[3]).copyModVersionFiles(message[4])
            case 'copyModIconFile':
                return modManager.getSource(message[1]).getModule(message[2]).copyAndReplaceImage(message[3], 'icon')
            case 'copyModBannerFile':
                return modManager.getSource(message[1]).getModule(message[2]).copyAndReplaceImage(message[3], 'banner')
        }
    }
})

ipcMain.handle('patch', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mod':
                return modManager.getSource(message[1]).getModule(message[2]).update(message[3])
            case 'modVersion':
                return modManager.getSource(message[1]).getModule(message[2]).getVersion(message[3]).update(message[4])
        }
    }
})

ipcMain.handle('delete', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'source':
                return modManager.deleteSource(message[1])
            case 'mod':
                return modManager.getSource(message[1]).deleteModule(message[2])
            case 'modVersion':
                return modManager.getSource(message[1]).getModule(message[2]).deleteVersion(message[3])
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