import { ipcMain, ipcRenderer, nativeTheme } from "electron"

export default {
    initHandle: () => {
        ipcMain.handle('switch-native-theme', (_, message) => {
            if (['dark', 'light', 'system'].includes(message)) {
                nativeTheme.themeSource = message
            }
        })
    },
    api: {
        
    }
}