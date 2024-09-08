import { BrowserWindow, dialog, ipcMain, ipcRenderer } from "electron"
import { SourceManager } from "../source-manager/source-manager"
import { ModuleInfo } from "../source-manager/types/module-info"
import { ModuleVersionInfo } from "../source-manager/types/module-version-info"
import { ModuleVersionDownloadLink } from "../source-manager/types/module-version-download-link"
import { getFileTree } from "../utils/get-file-tree"
import path from "node:path"

export default {
    initHandle: (sourceManager: SourceManager) => {
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
    },
    api: {
        
    }
}