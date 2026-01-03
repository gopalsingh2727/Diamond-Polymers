import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  // Exclude large Vosk models from build - they'll be fetched from CDN
  publicDir: 'public',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
    },
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React - loaded first
          if (id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // Redux - loaded with app shell
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux')) {
            return 'vendor-redux';
          }
          // Charts - lazy loaded with reports
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          // Excel - lazy loaded on export
          if (id.includes('xlsx')) {
            return 'vendor-xlsx';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // Icons
          if (id.includes('lucide-react') || id.includes('@heroicons')) {
            return 'vendor-icons';
          }
          // Vosk speech - lazy loaded
          if (id.includes('vosk')) {
            return 'vendor-speech';
          }
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 500,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
    exclude: ['vosk-browser'],
  },
})
