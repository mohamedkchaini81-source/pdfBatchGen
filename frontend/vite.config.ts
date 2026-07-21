import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Render Static Site serves from root — base must be '/'
  base: '/',

  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      // Dev only: proxy /api to local FastAPI backend
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs:  ['pdfjs-dist'],
          react:  ['react', 'react-dom'],
          vendor: ['zustand', 'i18next', 'react-i18next'],
        },
      },
    },
  },
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  ['./tests/setup.ts'],
    include:     ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.tsx'],
    exclude:     ['tests/e2e/**'],
  },
})
