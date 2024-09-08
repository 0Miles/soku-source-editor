import { ipcMain, ipcRenderer } from "electron"
import { ModuleRepository } from "../source-manager/types/module-repository"
import { SourceManager } from "../source-manager/source-manager"
import { ConfigManager } from "../config-manager"

export default {
    initHandle: (sourceManager: SourceManager, configManager: ConfigManager) => {
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

    },
    api: {
        
    }
}