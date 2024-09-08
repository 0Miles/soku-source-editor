import { ipcMain, ipcRenderer } from 'electron'
import { ConfigManager } from '../config-manager'

export default {
    initHandle: (configManager: ConfigManager) => {
        ipcMain.handle('get-config', (_, key) => {
            return configManager.getConfig(key)
        })

        ipcMain.handle('update-config', (_, patch) => {
            configManager.updateConfig(patch)
        })
    },
    api: {
        
    }
}