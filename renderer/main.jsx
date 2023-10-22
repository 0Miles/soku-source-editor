import React from 'react'
import { createRoot } from 'react-dom/client'
import {
    createHashRouter,
    RouterProvider,
    Navigate
} from 'react-router-dom'
import { ThemeProvider } from './theme'
import App from './app'
import ModuleListPage from './pages/module.page/list.page'
import ModuleInfoPage from './pages/module.page/info.page'
import SourcePage from './pages/source.page/list.page'
import ModuleEditPage from './pages/module.page/edit.page'
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
                        path: 'new',
                        element: <ModuleEditPage />
                    },
                    {
                        path: 'edit/:modName',
                        element: <ModuleEditPage />
                    },
                    {
                        path: 'info/:modName',
                        element: <ModuleInfoPage />
                    }
                ]
            },
            {
                path: 'source',
                element: <SourcePage />
            }
        ]
    },
])

root.render(
    <React.StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
)
