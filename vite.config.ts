import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, renameSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Ensure dist directory exists
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true })
        }
        copyFileSync('manifest.json', 'dist/manifest.json')
        // Copy icon if it exists
        if (existsSync('public/icon.png')) {
          copyFileSync('public/icon.png', 'dist/icon.png')
        }
        // Rename index.html to popup.html
        if (existsSync('dist/index.html')) {
          renameSync('dist/index.html', 'dist/popup.html')
        }
      }
    },
    {
      name: 'build-background',
      generateBundle() {
        // Background script will be built separately
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        results: resolve(__dirname, 'results.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'popup') {
            return 'popup.js'
          }
          if (chunkInfo.name === 'results') {
            return 'results.js'
          }
          if (chunkInfo.name === 'background') {
            return 'src/background/background.js'
          }
          if (chunkInfo.name === 'content') {
            return 'src/content/content.js'
          }
          return '[name].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.html') {
            return 'popup.html'
          }
          if (assetInfo.name === 'results.html') {
            return 'results.html'
          }
          return 'assets/[name][extname]'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
