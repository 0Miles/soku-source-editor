
import { createContext, useState } from 'react'
import { getMods, getSources } from './common/api'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
    const [sources, setSources] = useState()
    const [localMods, setLocalMods] = useState()

    const refreshSources = async () => {
        const data = await getSources()
        setSources(data)
    }

    const refreshLocalMods = async () => {
        const data = await getMods()
        setLocalMods(data)
    }

    return (
        <DataContext.Provider
            value={{
                sources,
                localMods,
                refreshSources,
                refreshLocalMods
            }}
        >
            {children}
        </DataContext.Provider>
    )
}