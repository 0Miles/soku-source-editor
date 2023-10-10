import React from 'react'
import { createRoot } from 'react-dom/client'
import {
    createHashRouter,
    RouterProvider,
    Navigate
} from 'react-router-dom'
import App from './app'
import ModuleListPage from './pages/module/list.page'
import { ThemeProvider } from './theme'
import SourcePage from './pages/source.page'
import ModuleEditPage from './pages/module/edit.page'
import ModuleInfoPage from './pages/module/info.page'
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
