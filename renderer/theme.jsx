
import { useEffect, createContext, useState, useRef } from 'react'

const MatchMediaDark = typeof matchMedia !== 'undefined' ? matchMedia?.('(prefers-color-scheme:dark)') : undefined

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') ?? 'system')
    const [current, setCurrent] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light')

    const switchTheme = (value) => {
        if (value && value !== theme) {
            setTheme(value)
        }
    }

    useEffect(() => {
        document.documentElement.classList.toggle('dark', current === 'dark')
        document.documentElement.classList.toggle('light', current === 'light')
    }, [current])


    useEffect(() => {
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
            {children}
        </ThemeContext.Provider>
    )
}