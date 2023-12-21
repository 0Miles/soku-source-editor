const { app, BrowserWindow, ipcMain, nativeTheme, dialog } = require('electron')
const path = require('node:path')
const createMainWindow = require('./window/main.window')

const { ConfigManager } = require('./common/config-manager')
const configManager = new ConfigManager()

const { SourceManager } = require('./source-manager/source-manager')
const sourceManager = new SourceManager()

const getFilesTree = require('./common/get-files-tree')

nativeTheme.themeSource = configManager.getConfig('theme') ?? 'system'

ipcMain.handle('get-config', (_, key) => {
    return configManager.getConfig(key)
})

ipcMain.handle('update-config', (_, patch) => {
    configManager.updateConfig(patch)
})

ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)) {
        nativeTheme.themeSource = message
    }
})

ipcMain.handle('get', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mods':
                return sourceManager.getSource(message[1])?.modules?.map(x => x.getData())
            case 'mod':
                return sourceManager.getSource(message[1])?.getModule(message[2])?.getData()
            case 'modVersions':
                return sourceManager.getSource(message[1])?.getModule(message[2])?.versions?.map(x => x.getData())
            case 'sources':
                return sourceManager.sources?.map(x => x.getData())
            case 'filesTree':
                return getFilesTree(message[1])
        }
    }
})

ipcMain.handle('post', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mod':
                return sourceManager
                    .getSource(message[1])
                    .addModule(message[2], message[3])
            case 'modVersion':
                return sourceManager
                    .getSource(message[1])
                    .getModule(message[2])
                    .addVersion(message[3], message[4])
            case 'cloneModSource':
                return await sourceManager.addSource(message[1], message[2])
            case 'sync':
                await sourceManager.getSource(message[1]).sync()
                return JSON.parse(JSON.stringify(sourceManager.getSource(message[1]).status))
            case 'fetch':
                await sourceManager.getSource(message[1]).fetchStatus()
                return JSON.parse(JSON.stringify(sourceManager.getSource(message[1]).status))
            case 'copyModVersionFiles':
                return sourceManager.getSource(message[1]).getModule(message[2]).getVersion(message[3]).copyModVersionFiles(message[4])
            case 'copyModIconFile':
                return sourceManager.getSource(message[1]).getModule(message[2]).copyAndReplaceImage(message[3], 'icon')
            case 'copyModBannerFile':
                return sourceManager.getSource(message[1]).getModule(message[2]).copyAndReplaceImage(message[3], 'banner')
            case 'exportZip':
                return await openSaveDialogAndExportZip(message[1], message[2], message[3])
            case 'githubRelease':
                return await sourceManager.getSource(message[1]).getModule(message[2]).createGithubTagAndRelease(message[3], message[4], configManager.getConfig('githubToken'))
            case 'giteeRelease':
                return await sourceManager.getSource(message[1]).getModule(message[2]).createGiteeTagAndRelease(message[3], message[4], configManager.getConfig('giteeToken'))
        }
    }
})

const openSaveDialogAndExportZip = async (sourceName, moduleName, versionNum) => {
    const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        defaultPath: `${moduleName}_${versionNum}.zip`,
        filters: [
            { name: 'Zip Files', extensions: ['zip'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    })
    
    if (!result.canceled) {
        sourceManager.getSource(sourceName)
            .getModule(moduleName)
            .exportZip(versionNum, path.dirname(result.filePath), path.basename(result.filePath))
    }
}

ipcMain.handle('patch', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'mod':
                return sourceManager.getSource(message[1]).getModule(message[2]).update(message[3])
            case 'modVersion':
                return sourceManager.getSource(message[1]).getModule(message[2]).getVersion(message[3]).update(message[4])
        }
    }
})

ipcMain.handle('delete', async (_, message) => {
    if (Array.isArray(message) && message.length > 0) {
        switch (message[0]) {
            case 'source':
                return await sourceManager.deleteSource(message[1])
            case 'mod':
                return sourceManager.getSource(message[1]).deleteModule(message[2])
            case 'modVersion':
                return sourceManager.getSource(message[1]).getModule(message[2]).deleteVersion(message[3])
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