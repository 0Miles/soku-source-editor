import path from 'node:path'
import { app, BrowserWindow, ipcMain, nativeTheme, dialog, ipcRenderer } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createMainWindow } from './window/main.window'

import { ConfigManager } from './config-manager'
import { SourceManager } from './source-manager/source-manager'
import { getFileTree } from './utils/get-file-tree'

import type { ModuleRepository } from './source-manager/types/module-repository'
import type { ModuleInfo } from './source-manager/types/module-info'
import type { ModuleVersionInfo } from './source-manager/types/module-version-info'
import type { ModuleVersionDownloadLink } from './source-manager/types/module-version-download-link'

const configManager = new ConfigManager()
const sourceManager = new SourceManager()

// config
ipcMain.handle('get-config', (_, key) => {
    return configManager.getConfig(key)
})

ipcMain.handle('update-config', (_, patch) => {
    configManager.updateConfig(patch)
})

// theme
nativeTheme.themeSource = configManager.getConfig('theme') ?? 'system'
ipcMain.handle('switch-native-theme', (_, message) => {
    if (['dark', 'light', 'system'].includes(message)) {
        nativeTheme.themeSource = message
    }
})

// mod
ipcMain.handle('get-mods', (_, sourceName: string) => {
    return sourceManager.getSource(sourceName)?.modules?.map(x => x.getData())
})

ipcMain.handle('get-mod', (_, sourceName: string, modName: string) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.getData()
})

ipcMain.handle('get-mod-versions', (_, sourceName: string, modName: string) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.versions?.map(x => x?.getData())
})

ipcMain.handle('get-sources', () => {
    return sourceManager.sources?.map(x => x.getData())
})

ipcMain.handle('add-mod', (_, sourceName: string, modName: string, modInfo) => {
    return sourceManager.getSource(sourceName)?.addModule(modName, modInfo)
})

ipcMain.handle('add-mod-version', (_, sourceName: string, modName: string, version: string, versionInfo: ModuleVersionInfo) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.addVersion(version, versionInfo)
})

ipcMain.handle('add-mod-version-download-link', (_, sourceName: string, modName: string, version: string, downloadLink: ModuleVersionDownloadLink) => {
    const versionEntry = sourceManager?.getSource(sourceName)?.getModule(modName)?.getVersion(version)
    const downloadLinks = versionEntry?.element.info?.downloadLinks ?? []
    if (!downloadLinks.find(x => x.type === downloadLink.type && x.url === downloadLink.url)) {
        downloadLinks.push(downloadLink)
        versionEntry?.element.updateInfo({ downloadLinks })
    }
})

ipcMain.handle('copy-mod-icon-file', (_, sourceName: string, modName: string, icon: any) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.copyAndReplaceImage(icon, 'icon')
})

ipcMain.handle('copy-mod-banner-file', (_, sourceName: string, modName: string, banner: any) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.copyAndReplaceImage(banner, 'banner')
})

ipcMain.handle('update-mod', (_, sourceName: string, modName: string, modInfo: ModuleInfo) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.update(modInfo)
})

ipcMain.handle('update-mod-version', (_, sourceName: string, modName: string, version: string, versionInfo: ModuleVersionInfo) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.getVersion(version)?.update(versionInfo)
})

ipcMain.handle('delete-source', (_, sourceName: string) => {
    return sourceManager.deleteSource(sourceName)
})

ipcMain.handle('delete-mod', (_, sourceName: string, modName: string) => {
    return sourceManager.getSource(sourceName)?.deleteModule(modName)
})

ipcMain.handle('delete-mod-version', (_, sourceName: string, modName: string, version: string) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.deleteVersion(version)
})

ipcMain.handle('copy-mod-version-files', (_, sourceName: string, modName: string, version: string, files: any[]) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.getVersion(version)?.copyModVersionFiles(files)
})

ipcMain.handle('export-zip', async (_, sourceName: string, modName: string, version: string) => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
        const result = await dialog.showSaveDialog(window, {
            defaultPath: `${modName}_${version}.zip`,
            filters: [
                { name: 'Zip Files', extensions: ['zip'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        })

        if (!result.canceled) {
            sourceManager
                .getSource(sourceName)
                ?.getModule(modName)
                ?.exportZip(version, path.dirname(result.filePath ?? ''), path.basename(result.filePath ?? ''))
        }
    }
})

ipcMain.handle('export-zip-to-output', (_, sourceName: string, modName: string, version: string) => {
    return sourceManager.getSource(sourceName)?.getModule(modName)?.exportZipToOutput(version)
})

ipcMain.handle('get-file-tree', (_, paths: string | string[]) => {
    if (!Array.isArray(paths)) {
        paths = [paths]
    }
    return getFileTree(paths)
})

// git
ipcMain.handle('add-github-release', async (_, sourceName: string, modName: string, version: string, repository: ModuleRepository) => {
    return await sourceManager.getSource(sourceName)?.getModule(modName)?.createGithubTagAndRelease(version, repository, configManager.getConfig('githubToken'))
})

ipcMain.handle('add-gitee-release', async (_, sourceName: string, modName: string, version: string, repository: ModuleRepository) => {
    return await sourceManager.getSource(sourceName)?.getModule(modName)?.createGiteeTagAndRelease(version, repository, configManager.getConfig('giteeToken'))
})

ipcMain.handle('clone-mod-source', async (_, url: string, customName: string) => {
    return await sourceManager.addSource(url, customName)
})

ipcMain.handle('git-sync', async (_, sourceName: string, sourceBranch?: string) => {
    await sourceManager.getSource(sourceName)?.sync(sourceBranch)
    return JSON.parse(JSON.stringify(sourceManager.getSource(sourceName)?.status))
})

ipcMain.handle('git-fetch', async (_, sourceName: string) => {
    await sourceManager.getSource(sourceName)?.fetchStatus()
    return JSON.parse(JSON.stringify(sourceManager.getSource(sourceName)?.status))
})

ipcMain.handle('git-git-revert-changes', async (_, sourceName: string) => {
    return await JSON.parse(JSON.stringify(sourceManager.getSource(sourceName)?.revertChanges()))
})

ipcMain.handle('start-download', () => {
    autoUpdater.downloadUpdate()
})

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall()
})

app.whenReady().then(() => {
    const mainWindow = createMainWindow()

    let isReady = false
    mainWindow.webContents.once('dom-ready', () => {
        isReady = true
    })

    const sendToMainWindow = (channel: string, ...args: any[]) => {
        if (isReady) {
            mainWindow.webContents.send(channel, ...args)
        } else {
            setTimeout(() => sendToMainWindow(channel, ...args), 500)
        }
    }

    autoUpdater.on('update-available', () => {
        sendToMainWindow('update-available')
    })

    autoUpdater.on('download-progress', (progressObj) => {
        sendToMainWindow('download-progress', progressObj)
    })

    autoUpdater.on('update-downloaded', () => {
        sendToMainWindow('update-downloaded')
    })

    autoUpdater.checkForUpdates()
    

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})