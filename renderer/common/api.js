import Temp from '../temp'

export const getMods = async () => {
    const data = await ipcRenderer.invoke('get', ['mods'])
    Temp['mods'] = data
    return data
}

export const getSources = async () => {
    const data = await ipcRenderer.invoke('get', ['sources'])
    Temp['sources'] = data
    return data
}

export const cloneModSource = async (url) => {
    const repo = await ipcRenderer.invoke('get', ['cloneModSource', url])
    return repo
}