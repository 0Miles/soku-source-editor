import { Outlet, useLocation } from 'react-router-dom'
import { useCallback, useContext, useState } from 'react'
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
    Button
} from '@fluentui/react-components'
import { ThemeContext } from './contexts/theme'
import { MessageBoxProvider } from './contexts/message-box'

import Sidebar from './common/sidebar'
import Breadcrumbs from './common/breadcrumbs'

import menuIcon from './icons/menu.icon'

export default function App() {
    const themeContext = useContext(ThemeContext)
    const [showSidebar, setShowSidebar] = useState(false)

    const toggleSidebar = useCallback((forceValue = null) => {
        if (forceValue !== null) {
            setShowSidebar(forceValue)
        } else {
            setShowSidebar(!showSidebar)
        }
    }, [showSidebar])

    return <>
        <FluentProvider className="bg:transparent! h:full" theme={themeContext.current === 'dark' ? webDarkTheme : webLightTheme}>
            <MessageBoxProvider>
                <div className="flex flex:row h:full">
                    <div className="flex h:full flex:col user-select:none>*">
                        <Button onClick={() => toggleSidebar()} appearance="transparent" className="translate(10,16) hide!@sm" icon={menuIcon}></Button>
                        <div className={`flex flex:col h:full min-w:310 max-w:310 p:16 mr:-16 bg:#202020@dark bg:white@light ml:0 z:999 {view-transition-name:sidebar} abs@<sm ~margin-left|.15s|ease-in ${showSidebar ? 'ml:0 box-shadow:0|0|5|3|gray/.3@<sm@light box-shadow:0|0|5|3|black/.3@<sm@dark' : 'ml:-310@<sm'}`}>
                            <Sidebar onTabChange={() => toggleSidebar(false)} />
                        </div>
                    </div>
                    <div onClick={() => toggleSidebar(false)}
                        className={`
                            fixed z:999 left:310 top:0
                            h:full w:full 
                            {opacity:0;pointer-events:none}@sm
                            ${showSidebar ? 'block' : 'hide'}`}>
                    </div>
                    <div className="flex flex:col flex:1 w:0 align-items:center">
                        <div className="flex flex:col flex:1 w:full max-w:960 overflow:clip">
                            <div className="w:full px:24 pt:8 pb:16 z-index:1 bg:#202020@dark bg:white@light {view-transition-name:breadcrumbs}">
                                <Breadcrumbs />
                            </div>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </MessageBoxProvider>
        </FluentProvider>
    </>
}
