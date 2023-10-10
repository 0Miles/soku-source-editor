import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useCallback, useContext, useState } from 'react'
import Sidebar from './common/sidebar'
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
    Button
} from '@fluentui/react-components'
import { ThemeContext } from './theme'
import menuIcon from './icons/menu.icon'
import { useTranslation } from 'react-i18next'

export default function App() {
    const { t, i18n } = useTranslation()
    const themeContext = useContext(ThemeContext)
    const [showSidebar, setShowSidebar] = useState(false)
    const location = useLocation()
    const [title, setTitle] = useState('Module')

    useEffect(() => {
        const tab = location?.pathname?.split('/')?.[1]
        if (tab) {
            setTitle(tab[0].toUpperCase() + tab.substring(1))
        }
    }, [location])

    const toggleSidebar = useCallback((forceValue = null) => {
        if (forceValue !== null) {
            setShowSidebar(forceValue)
        } else {
            setShowSidebar(!showSidebar)
        }
    }, [showSidebar])

    return <>
        <FluentProvider className="bg:transparent! h:full" theme={themeContext.current === 'dark' ? webDarkTheme : webLightTheme}>
            <div className="flex flex:row h:full">
                <div className="flex h:full flex:col user-select:none>*">
                    <Button onClick={() => toggleSidebar()} appearance="transparent" className="translate(10,16) hide!@sm" icon={menuIcon}></Button>
                    <div className={`flex flex:col h:full min-w:310 max-w:310 p:16 mr:-16 bg:#202020@dark bg:white@light ml:0 z:999 abs@<sm ~margin-left|.15s|ease-in ${showSidebar ? 'ml:0 box-shadow:0|0|5|3|gray/.3@<sm@light box-shadow:0|0|5|3|black/.3@<sm@dark' : 'ml:-310@<sm'}`}>
                        <Sidebar />
                    </div>
                </div>
                <div onClick={() => toggleSidebar(false)} className={`fixed z:999 left:310 top:0 h:full w:full {opacity:0;pointer-events:none}@sm ${showSidebar ? 'block' : 'hide'}`}></div>
                <div className="flex flex:col flex:1 align-items:center">
                    <div className="flex flex:col flex:auto w:full max-w:960 overflow:hidden">
                        <h1 className="px:24 pt:20 pb:16 font-weight:normal user-select:none justify-content:start">{title}</h1>
                        <Outlet />
                    </div>
                </div>
            </div>
        </FluentProvider>
    </>
}
