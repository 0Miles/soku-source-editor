
import { createContext, useState } from 'react'
import { getMods, getSources } from '../common/api'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
    const [sources, setSources] = useState()
    const [currentSource, setCurrentSource] = useState('example')
    const [currentMods, setCurrentMods] = useState()

    const refreshSources = async () => {
        const data = await getSources()
        setSources(data)
    }

    const refreshCurrentMods = async () => {
        const data = await getMods(`sources/${currentSource}/modules`)
        setCurrentMods(data)
    }

    return (
        <DataContext.Provider
            value={{
                sources,
                currentMods,
                refreshSources,
                refreshCurrentMods
            }}
        >
            {children}
        </DataContext.Provider>
    )
}