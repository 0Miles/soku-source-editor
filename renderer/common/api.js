export const getMods = async (path) => {
    return await ipcRenderer.invoke('get', ['mods', path])
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