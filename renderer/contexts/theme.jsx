
import { useEffect, createContext, useState, useContext, useMemo } from 'react'
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
} from '@fluentui/react-components'
import { useShared } from './shared'

const MatchMediaDark = typeof matchMedia !== 'undefined' ? matchMedia?.('(prefers-color-scheme:dark)') : undefined

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const { config, setConfigValue } = useShared()
    const [theme, setTheme] = useState()
    const [current, setCurrent] = useState(MatchMediaDark?.matches ? 'dark' : 'light')

    useMemo(() => {
        if (config) {
            const configTheme = config.theme || 'system'
            setTheme(configTheme)
        }
    }, [config])

    const switchTheme = (value) => {
        if (value && value !== theme) {
            setTheme(value)
            setConfigValue(value)
        }
    }

    useEffect(() => {
        const isDark = current === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        document.documentElement.classList.toggle('light', !isDark)
    }, [current])

    useEffect(() => {
        if (!theme) return
        ipcRenderer.invoke('switch-native-theme', theme)

        if (theme === 'system') {
            const isDark = MatchMediaDark?.matches
            setCurrent(isDark ? 'dark' : 'light')
        } else {
            setCurrent(theme)
        }

        const onSystemThemeChange = (matchMediaDark) => {
            if (theme === 'system') {
                setCurrent(matchMediaDark.matches ? 'dark' : 'light')
            }
        }

        MatchMediaDark?.addEventListener('change', onSystemThemeChange)
        return () => {
            MatchMediaDark?.removeEventListener('change', onSystemThemeChange)
        }
    }, [theme])

    return (
        <ThemeContext.Provider
            value={{
                theme,
                switchTheme,
                current
            }}
        >
            <FluentProvider className="bg:transparent! h:full" theme={current === 'dark' ? webDarkTheme : webLightTheme}>
                {children}
            </FluentProvider>
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    return useContext(ThemeContext)
}