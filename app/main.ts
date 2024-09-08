import { app, BrowserWindow, ipcMain, nativeTheme, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createMainWindow } from './window/main.window'

import { ConfigManager } from './config-manager'
const configManager = new ConfigManager()

import { SourceManager } from './source-manager/source-manager'
const sourceManager = new SourceManager()

import configIniter from './ipc/config'
import themeIniter from './ipc/theme'
import modIniter from './ipc/mod'
import gitIniter from './ipc/git'

nativeTheme.themeSource = configManager.getConfig('theme') ?? 'system'

configIniter.initHandle(configManager)
themeIniter.initHandle()
modIniter.initHandle(sourceManager)
gitIniter.initHandle(sourceManager, configManager)

app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify()
    createMainWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    }) 
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})