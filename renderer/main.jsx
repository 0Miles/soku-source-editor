import React from 'react'
import { createRoot } from 'react-dom/client'
import {
    createHashRouter,
    RouterProvider,
    Navigate
} from 'react-router-dom'
import { ThemeProvider } from './contexts/theme'
import { ModSourceProvider } from './contexts/mod-source'

import App from './app'
import ModuleListPage from './pages/module.page/list.page'
import ModuleInfoPage from './pages/module.page/info.page'
import SourceListPage from './pages/source.page/list.page'
import SourceInfoPage from './pages/source.page/info.page'
import SettingListPage from './pages/setting.page/list.page'
import '@master/css'
import './i18n'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

const router = createHashRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Navigate to= "module" replace />
            },
            {
                path: 'module',
                element: <ModuleListPage />,
                children: [
                    {
                        path: 'info/:modName',
                        element: <ModuleInfoPage />
                    }
                ]
            },
            {
                path: 'source',
                element: <SourceListPage />,
                children: [
                    {
                        path: 'info/:sourceName',
                        element: <SourceInfoPage />,
                        children: [
                            {
                                path: 'module',
                                element: <ModuleListPage />,
                                children: [
                                    {
                                        path: 'info/:modName',
                                        element: <ModuleInfoPage />
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                path: 'setting',
                element: <SettingListPage />
            }
        ]
    },
])

root.render(
    <React.StrictMode>
        <ThemeProvider>
            <ModSourceProvider>
                <RouterProvider router={router} />
            </ModSourceProvider>
        </ThemeProvider>
    </React.StrictMode>
)
