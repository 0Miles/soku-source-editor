
export const getMods = async () => {
    return await ipcRenderer.invoke('get', ['mods'])
}