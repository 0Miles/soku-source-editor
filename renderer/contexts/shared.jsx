
import { createContext, useState, useContext, useMemo } from 'react'
import * as api from '../common/api'

export const SharedContext = createContext()

export const SharedProvider = ({ children }) => {
    const [config, setConfig] = useState()
    const [sources, setSources] = useState()
    const [primarySourceName, setPrimarySourceName] = useState('')

    useMemo(() => {
        ipcRenderer.invoke('get-config').then((config) => {
            setConfig(config)
            setPrimarySourceName(config.primarySourceName ?? '')
        })
    }, [])

    const setConfigValue = async (key, value) => {
        await ipcRenderer.invoke('update-config', { [key]: value })
        setConfig(await ipcRenderer.invoke('get-config'))
    }

    const refreshSources = async () => {
        const data = await api.getSources()
        if (data?.length && !data.find(x => x.name === primarySourceName)) {
            setPrimarySourceName('')
            setConfigValue('primarySourceName', '')
        }
        setSources(data)
    }

    const changePrimarySource = (value) => {
        setConfigValue('primarySourceName', value ?? '')
        setPrimarySourceName(value)
    }

    const addSource = async (sourceUrl, sourceName) => {
        await api.cloneModSource(sourceUrl, sourceName)
        if (!sources?.length) {
            changePrimarySource(sourceName)
        }
    }

    const deleteSource = async (sourceName) => {
        if (sourceName === primarySourceName) {
            if (sources?.length > 1) {
                changePrimarySource(sources.find(x => x.name !== sourceName).name)
            } else {
                changePrimarySource('')
            }
        }
        await api.deleteSource(sourceName)
    }

    return (
        <SharedContext.Provider
            value={{
                config,
                setConfigValue,
                sources,
                primarySourceName,
                refreshSources,
                changePrimarySource,
                addSource,
                deleteSource
            }}
        >
            {children}
        </SharedContext.Provider>
    )
}

export const useShared = () => {
    return useContext(SharedContext)
}