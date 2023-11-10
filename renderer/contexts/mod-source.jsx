
import { createContext, useState, useContext, useMemo, useCallback } from 'react'
import * as api from '../common/api'

export const ModSourceContext = createContext()

const storageMainSource = localStorage.getItem('primarySourceName')

export const ModSourceProvider = ({ children }) => {
    const [sources, setSources] = useState()
    const [primarySourceName, setPrimarySourceName] = useState(storageMainSource)
    const [currentMods, setCurrentMods] = useState()

    const refreshSources = async () => {
        const data = await api.getSources()
        setSources(data)
    }

    useMemo(async () => {
        setCurrentMods(await api.getMods(`sources/${primarySourceName}/modules`))
    }, [primarySourceName])

    const changePrimarySource = (value) => {
        localStorage.setItem('primarySourceName', value)
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
        <ModSourceContext.Provider
            value={{
                sources,
                currentMods,
                primarySourceName,
                refreshSources,
                changePrimarySource,
                addSource,
                deleteSource
            }}
        >
            {children}
        </ModSourceContext.Provider>
    )
}


export const useModSource = () => {
    return useContext(ModSourceContext)
}