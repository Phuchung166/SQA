import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-macros'],
            },
        }),
        dynamicImport(),
    ],
    assetsInclude: ['**/*.md'],
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'build',
    },
    optimizeDeps: {
        exclude: ['@fullcalendar/core/internal.js'],
    },
    base: '/learning-cms/',
    server: {
        host: true, // Hoặc host: '0.0.0.0'
        port: 8158, // tuỳ chọn
    },
})
