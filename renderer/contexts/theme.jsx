
import { useEffect, createContext, useState, useContext } from 'react'
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
} from '@fluentui/react-components'

const MatchMediaDark = typeof matchMedia !== 'undefined' ? matchMedia?.('(prefers-color-scheme:dark)') : undefined
// init theme
const storageTheme = localStorage.getItem('theme') ?? 'system'
const isDark = storageTheme === 'system' ? MatchMediaDark.matches : storageTheme === 'dark'
document.documentElement.classList.toggle('dark', isDark)
document.documentElement.classList.toggle('light', !isDark)

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(storageTheme ?? 'system')
    const [current, setCurrent] = useState(isDark ? 'dark' : 'light')

    const switchTheme = (value) => {
        if (value && value !== theme) {
            setTheme(value)
        }
    }

    useEffect(() => {
        const isDark = current === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        document.documentElement.classList.toggle('light', !isDark)
    }, [current])

    useEffect(() => {
        ipcRenderer.invoke('switch-native-theme', theme)
        localStorage.setItem('theme', theme)
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