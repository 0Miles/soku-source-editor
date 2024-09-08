
import { createContext, useState, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const SharedContext = createContext()

export const SharedProvider = ({ children }) => {
    const { i18n } = useTranslation()
    const [config, setConfig] = useState()
    const [sources, setSources] = useState()
    const [primarySourceName, setPrimarySourceName] = useState('')

    useMemo(() => {
        window.ipcApi.getConfig().then(config => {
            setConfig(config)
            config.lang && i18n.changeLanguage(config.lang)
            setPrimarySourceName(config.primarySourceName ?? '')
        })
    }, [i18n])

    const setConfigValue = async (key, value) => {
        await window.ipcApi.updateConfig({ [key]: value })
        setConfig(await window.ipcApi.getConfig())
    }

    const refreshSources = async () => {
        const data = await window.ipcApi.getSources()
        const primarySourceName = await window.ipcApi.getConfig('primarySourceName')
        if (data?.length && !data.find(x => x.name === primarySourceName)) {
            setPrimarySourceName('')
            setConfigValue('primarySourceName', '')
        }
        setSources(data)
    }

    const changePrimarySource = async (value) => {
        await setConfigValue('primarySourceName', value ?? '')
        setPrimarySourceName(value)
    }

    const addSource = async (sourceUrl, sourceName) => {
        await window.ipcApi.cloneModSource(sourceUrl, sourceName)
        if (!sources?.length) {
            await changePrimarySource(sourceName)
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
        await window.ipcApi.deleteSource(sourceName)
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