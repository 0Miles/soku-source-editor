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
    return await ipcRenderer.invoke('post', ['cloneModSource', url, customName])
}

export const gitSync = async (sourceName, sourceBranch) => {
    return await ipcRenderer.invoke('post', ['sync', sourceName, sourceBranch])
}

export const gitFetchStatus = async (sourceName) => {
    return await ipcRenderer.invoke('post', ['fetch', sourceName])
}

export const getAllFilenames = async (paths) => {
    if (!Array.isArray(paths)) {
        paths = [paths]
    }
    return await ipcRenderer.invoke('get', ['allFilenames', paths])
}

export const getFilesTree = async (paths) => {
    if (!Array.isArray(paths)) {
        paths = [paths]
    }
    return await ipcRenderer.invoke('get', ['filesTree', paths])
}

export const deleteSource = async (sourceName) => {
    await ipcRenderer.invoke('delete', ['source', sourceName])
}

export const deleteMod = async (sourceName, modName) => {
    return await ipcRenderer.invoke('delete', ['mod', sourceName, modName])
}

export const deleteModVersion = async (sourceName, modName, version) => {
    return await ipcRenderer.invoke('delete', ['modVersion', sourceName, modName, version])
}

export const addMod = async (sourceName, modName, modInfo) => {
    const modIcon = modInfo.icon
    const modbanner = modInfo.banner
    delete modInfo.icon
    delete modInfo.banner
    await ipcRenderer.invoke('post', ['mod', sourceName, modName, modInfo])
    if (modIcon) {
        await ipcRenderer.invoke('post', ['copyModIconFile', sourceName, modName, modIcon])
    }
    if (modbanner) {
        await ipcRenderer.invoke('post', ['copyModBannerFile', sourceName, modName, modbanner])
    }
}

export const updateMod = async (sourceName, modName, modInfo) => {
    const modIcon = modInfo.icon
    const modbanner = modInfo.banner
    delete modInfo.icon
    delete modInfo.banner
    await ipcRenderer.invoke('patch', ['mod', sourceName, modName, modInfo])
    if (modIcon) {
        await ipcRenderer.invoke('post', ['copyModIconFile', sourceName, modName, modIcon])
    }
    if (modbanner) {
        await ipcRenderer.invoke('post', ['copyModBannerFile', sourceName, modName, modbanner])
    }
}

export const addModVersion = async (sourceName, modName, version, versionInfo) => {
    return await ipcRenderer.invoke('post', ['modVersion', sourceName, modName, version, versionInfo])
}

export const updateModVersion = async (sourceName, modName, version, versionInfo) => {
    return await ipcRenderer.invoke('patch', ['modVersion', sourceName, modName, version, versionInfo])
}

export const copyModVersionFiles = async (files, sourceName, modName, version) => {
    return await ipcRenderer.invoke('post', ['copyModVersionFiles', sourceName, modName, version, files])
}

export const exportZip = async (sourceName, modName, versionNum) => {
    return await ipcRenderer.invoke('post', ['exportZip', sourceName, modName, versionNum])
}

export const exportZipToOutput = async (sourceName, modName, versionNum) => {
    return await ipcRenderer.invoke('post', ['exportZipToOutput', sourceName, modName, versionNum])
}

export const githubRelease = async (sourceName, modName, versionNum, repository) => {
    return await ipcRenderer.invoke('post', ['githubRelease', sourceName, modName, versionNum, repository])
}

export const giteeRelease = async (sourceName, modName, versionNum, repository) => {
    return await ipcRenderer.invoke('post', ['giteeRelease', sourceName, modName, versionNum, repository])
}

export const addModVersionDownloadLink = async (sourceName, modName, version, downloadLink) => {
    return await ipcRenderer.invoke('post', ['modVersionDownloadLink', sourceName, modName, version, downloadLink])
}