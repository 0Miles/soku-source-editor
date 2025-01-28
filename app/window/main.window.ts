import { BrowserWindow } from 'electron'
import path from 'node:path'
import isDev from 'electron-is-dev'

export function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 900,
        minWidth:600,
        minHeight:400,
        webPreferences: {
            preload: path.join(__dirname, 'main-preload.js'),
            allowRunningInsecureContent: false,
            webSecurity: false,
            sandbox: false,
        }
    })
    mainWindow.removeMenu()
    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/');
        // Open the DevTools.
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.removeMenu()
        mainWindow.loadFile('dist/index.html');
    }
    return mainWindow
}