export const getMods = async (sourceName) => {
    return await ipcRenderer.invoke('get', ['mods', sourceName])
}

export const getMod = async (sourceName, modName) => {
    return await ipcRenderer.invoke('get', ['mod', sourceName, modName])
}

export const getModVersions = async (sourceName, modName) => {
    return await ipcRenderer.invoke('get', ['modVersions', sourceName, modName])
}

export const getSources = async () => {
    return await ipcRenderer.invoke('get', ['sources'])
}

export const cloneModSource = async (url, customName) => {
    return  await ipcRenderer.invoke('git', ['cloneModSource', url, customName])
}

export const gitSync = async (sourceName, sourceBranch) => {
    return await ipcRenderer.invoke('git', ['sync', sourceName, sourceBranch])
}

export const gitFetchStatus = async (sourceName) => {
    return await ipcRenderer.invoke('git', ['fetch', sourceName])
}

export const deleteSource = async (sourceName) => {
    await ipcRenderer.invoke('delete', ['source', sourceName])
}