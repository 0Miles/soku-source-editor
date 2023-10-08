import React from 'react'
import { createRoot } from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
    Navigate
} from 'react-router-dom'
import '@master/css'
import App from './app'
import ModuleListPage from './pages/module.page/list.page'
import { ThemeProvider } from './theme'
import SourcePage from './pages/source.page'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

const router = createBrowserRouter([
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
                element: <ModuleListPage />
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
