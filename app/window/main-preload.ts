import { contextBridge, ipcRenderer } from 'electron'
import type { ModuleRepository } from '../source-manager/types/module-repository'
import type { ModuleVersionInfo } from '../source-manager/types/module-version-info'
import type { ModuleInfo } from '../source-manager/types/module-info'
import type { ModuleVersionDownloadLink } from '../source-manager/types/module-version-download-link'

const ipcApi = {
    getConfig: async (key: string) => {
        return await ipcRenderer.invoke('get-config', key)
    },
    updateConfig: async (patch: any) => {
        return await ipcRenderer.invoke('update-config', patch)
    },
    getMods: async (sourceName: string) => {
        return await ipcRenderer.invoke('get-mods', sourceName)
    },
    getMod: async (sourceName: string, modName: string) => {
        return await ipcRenderer.invoke('get-mod', sourceName, modName)
    },
    getModVersions: async (sourceName: string, modName: string) => {
        return await ipcRenderer.invoke('get-mod-versions', sourceName, modName)
    },
    getSources: async () => {
        return await ipcRenderer.invoke('get-sources')
    },
    addMod: async (sourceName: string, modName: string, modInfo: ModuleInfo) => {
        const modIcon = modInfo.icon
        const modbanner = modInfo.banner
        delete modInfo.icon
        delete modInfo.banner
        await ipcRenderer.invoke('add-mod', sourceName, modName, modInfo)
        if (modIcon) {
            await ipcRenderer.invoke('copy-mod-icon-file', sourceName, modName, modIcon)
        }
        if (modbanner) {
            await ipcRenderer.invoke('copy-mod-banner-file', sourceName, modName, modbanner)
        }
    },
    addModVersion: async (sourceName: string, modName: string, version: string, versionInfo: ModuleVersionInfo) => {
        return await ipcRenderer.invoke('add-mod-version', sourceName, modName, version, versionInfo)
    },
    addModVersionDownloadLink: async (sourceName: string, modName: string, version: string, downloadLink: ModuleVersionDownloadLink) => {
        return await ipcRenderer.invoke('add-mod-version-download-link', sourceName, modName, version, downloadLink)
    },
    updateMod: async (sourceName: string, modName: string, modInfo: ModuleInfo) => {
        const modIcon = modInfo.icon
        const modbanner = modInfo.banner
        delete modInfo.icon
        delete modInfo.banner
        await ipcRenderer.invoke('update-mod', sourceName, modName, modInfo)
        if (modIcon) {
            await ipcRenderer.invoke('copy-mod-icon-file', sourceName, modName, modIcon)
        }
        if (modbanner) {
            await ipcRenderer.invoke('copy-mod-banner-file', sourceName, modName, modbanner)
        }
    },
    updateModVersion: async (sourceName: string, modName: string, version: string, versionInfo: ModuleVersionInfo) => {
        return await ipcRenderer.invoke('update-mod-version', sourceName, modName, version, versionInfo)
    },
    deleteSource: async (sourceName: string) => {
        await ipcRenderer.invoke('delete-source', sourceName)
    },
    deleteMod: async (sourceName: string, modName: string) => {
        return await ipcRenderer.invoke('delete-mod', sourceName, modName)
    },
    deleteModVersion: async (sourceName: string, modName: string, version: string) => {
        return await ipcRenderer.invoke('delete-mod-version', sourceName, modName, version)
    },
    copyModVersionFiles: async (files: any[], sourceName: string, modName: string, version: string) => {
        return await ipcRenderer.invoke('copy-mod-version-files', sourceName, modName, version, files)
    },
    exportZip: async (sourceName: string, modName: string, version: string) => {
        return await ipcRenderer.invoke('export-zip', sourceName, modName, version)
    },
    exportZipToOutput: async (sourceName: string, modName: string, version: string) => {
        return await ipcRenderer.invoke('export-zip-to-output', sourceName, modName, version)
    },
    getFileTree: async (paths: string | string[]) => {
        if (!Array.isArray(paths)) {
            paths = [paths]
        }
        return await ipcRenderer.invoke('get-file-tree', paths)
    },
    githubRelease: async (sourceName: string, modName: string, version: string, repository: ModuleRepository) => {
        return await ipcRenderer.invoke('add-github-release', sourceName, modName, version, repository)
    },
    giteeRelease: async (sourceName: string, modName: string, version: string, repository: ModuleRepository) => {
        return await ipcRenderer.invoke('add-gitee-release', sourceName, modName, version, repository)
    },
    cloneModSource: async (url: string, customName: string) => {
        return await ipcRenderer.invoke('clone-mod-source', url, customName)
    },
    gitSync: async (sourceName: string, sourceBranch?: string) => {
        return await ipcRenderer.invoke('git-sync', sourceName, sourceBranch)
    },
    gitFetchStatus: async (sourceName: string) => {
        return await ipcRenderer.invoke('git-fetch', sourceName)
    },
    gitRevertChanges: async (sourceName: string) => {
        return await ipcRenderer.invoke('git-git-revert-changes', sourceName)
    },
    switchNativeTheme: async (theme: string) => {
        return await ipcRenderer.invoke('switch-native-theme', theme)
    },
    sendToMain: (channel: string, data: any) => {
        ipcRenderer.invoke(channel, data)
    },
    on: (channel: string, callback: (...args: any) => void) => {
        ipcRenderer.on(channel, (_, ...args) => callback(...args))
    },
}

export type IpcApi = typeof ipcApi

contextBridge.exposeInMainWorld('ipcApi', ipcApi)