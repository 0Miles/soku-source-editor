import configIniter from '../ipc/config'
import themeIniter from '../ipc/theme'
import modIniter from '../ipc/mod'
import gitIniter from '../ipc/git'

export const ipcApi = {
    config: configIniter.api,
    theme: themeIniter.api,
    mod: modIniter.api,
    git: gitIniter.api
}

export type IpcApi = typeof ipcApi