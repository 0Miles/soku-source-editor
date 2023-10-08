import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    root: 'renderer',
    base: './',
    build: {
        outDir: '../dist'
    },
    plugins: [react()],
})
