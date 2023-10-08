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

export default function App() {
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
                    <Button onClick={() => toggleSidebar()} appearance="transparent" className="m:10|0|0|6! hide!@sm" icon={menuIcon}></Button>
                    <div className={`flex flex:col h:full min-w:310 max-w:310 p:16 bg:#202020@dark bg:white@light ml:0 z:999 {ml:-310;abs}@<sm ~margin-left|.15s|ease-in ${showSidebar ? 'ml:0! box-shadow:0|0|5|3|gray/.3@<sm@light box-shadow:0|0|5|3|black/.3@<sm@dark' : ''}`}>
                        <Sidebar />
                    </div>
                </div>
                <div onClick={() => toggleSidebar(false)} className={`fixed z:999 left:310 top:0 h:full w:full {opacity:0;pointer-events:none}@sm ${showSidebar ? 'block' : 'hide'}`}></div>
                <div className="flex flex:col flex:1 align-items:center">
                    <h1 className="w:full max-w:960 px:8 py:16 font-weight:normal user-select:none justify-content:start">{title}</h1>
                    <div className="
                                max-w:960
                                w:full h:full 
                                pl:8 py:10 pr:24 pr:42@<sm 
                                overflow-y:auto
                                hide::-webkit-scrollbar-button
                                {bg:white;w:12}::-webkit-scrollbar@light
                                {bg:white}::-webkit-scrollbar-track@light
                                {bg:#babac0;border-radius:12;b:4|solid|white}::-webkit-scrollbar-thumb@light
                                {bg:#202020;w:12;abs}::-webkit-scrollbar@dark
                                {bg:#202020;abs}::-webkit-scrollbar-track@dark
                                {bg:#959595;border-radius:12;b:4|solid|#202020;abs}::-webkit-scrollbar-thumb@dark
                            ">
                        <Outlet />
                    </div>
                </div>
            </div>
        </FluentProvider>
    </>
}
