const { app, BrowserWindow, ipcMain, nativeTheme, dialog, autoUpdater } = require('electron')
const log = require('electron-log')
const path = require('node:path')
const createMainWindow = require('./window/main.window')

const { ConfigManager } = require('./common/config-manager')
const configManager = new ConfigManager()

const { SourceManager } = require('./source-manager/source-manager')
const sourceManager = new SourceManager()

const getFilesTree = require('./common/get-files-tree')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: 'A new version of the application is available. Do you want to download and install it now?',
        buttons: ['Yes', 'No'],
    }, (buttonIndex) => {
        if (buttonIndex === 0) {
            autoUpdater.downloadUpdate()
        }
    })
})

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update has been downloaded',
        message: 'The update has been downloaded. Do you want to install it now?',
        buttons: ['Yes', 'No'],
    }, (buttonIndex) => {
        if (buttonIndex === 0) {
            autoUpdater.quitAndInstall()
        }
    })
})

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
            case 'exportZipToOutput':
                return await sourceManager.getSource(message[1]).getModule(message[2]).exportZip(message[3])
            case 'githubRelease':
                return await sourceManager.getSource(message[1]).getModule(message[2]).createGithubTagAndRelease(message[3], message[4], configManager.getConfig('githubToken'))
            case 'giteeRelease':
                return await sourceManager.getSource(message[1]).getModule(message[2]).createGiteeTagAndRelease(message[3], message[4], configManager.getConfig('giteeToken'))
            case 'modVersionDownloadLink':
                const version = sourceManager.getSource(message[1]).getModule(message[2]).getVersion(message[3])
                const downloadLinks = version.element.info?.downloadLinks ?? []
                if (!downloadLinks.find(x => x.type === message[4].type && x.url === message[4].url)) {
                    downloadLinks.push(message[4])
                    version.element.updateInfo({ downloadLinks })
                }
                break
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

    app.on('ready', () => {
        autoUpdater.checkForUpdatesAndNotify()
    })

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})