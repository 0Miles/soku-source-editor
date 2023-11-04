
import { createContext, useState, useContext } from 'react'
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

    const refreshCurrentMods = async () => {
        const data = await api.getMods(`sources/${primarySourceName}/modules`)
        setCurrentMods(data)
    }

    const changePrimarySource = (value) => {
        localStorage.setItem('primarySourceName', value)
        setPrimarySourceName(value)
    }

    const addSource = async (sourceUrl, sourceName) => {
        await cloneModSource(sourceUrl, sourceName)
        if (!sources?.length) {
            changePrimarySource(sourceName)
        }
    }

    const deleteSource = async (sourceName) => {
        if (sourceName === primarySourceName) {
            changePrimarySource()
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
                refreshCurrentMods,
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