import Temp from '../temp'

export const getMods = async () => {
    const data = await ipcRenderer.invoke('get', ['mods'])
    Temp['mods'] = data
    return data
}