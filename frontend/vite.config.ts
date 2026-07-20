import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // For GitHub Pages: set base to your repo name
  // e.g. if your repo is github.com/username/pdf-batch-gen-web
  // set base: '/pdf-batch-gen-web/'
  // For a custom domain or root deployment, use base: '/'
  base: '/pdfBatchGen/',

  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
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
