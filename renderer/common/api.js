
export const getMods = async (path) => {
    const data = await ipcRenderer.invoke('get', ['mods', path])
    return data
}

export const getSources = async () => {
    const data = await ipcRenderer.invoke('get', ['sources'])
    return data
}

export const deleteSource = async (sourceName) => {
    const data = await ipcRenderer.invoke('delete', ['source', sourceName])
    return data
}

export const cloneModSource = async (url, customName) => {
    const repo = await ipcRenderer.invoke('git', ['cloneModSource', url, customName])
    return repo
}