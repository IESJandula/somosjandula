/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

const manualChunks = (id: string) => {
  if (!id.includes('/node_modules/')) return undefined

  if (
    id.includes('/node_modules/vue/')
    || id.includes('/node_modules/@vue/')
    || id.includes('/node_modules/vue-router/')
  ) return 'vue'

  if (
    id.includes('/node_modules/@ionic/vue/')
    || id.includes('/node_modules/@ionic/vue-router/')
  ) return 'ionic-vue'

  if (id.includes('/node_modules/ionicons/')) return 'ionicons'

  const ionicComponentsPath = '/node_modules/@ionic/core/components/'
  if (id.includes(ionicComponentsPath)) {
    const fileName = id.slice(id.lastIndexOf('/') + 1)

    if (fileName.startsWith('ion-')) {
      const initial = fileName.charAt(4)
      return initial <= 'm' ? 'ionic-components-a-m' : 'ionic-components-n-z'
    }

    return 'ionic-runtime'
  }

  if (
    id.includes('/node_modules/@ionic/core/')
    || id.includes('/node_modules/@stencil/core/')
  ) return 'ionic-runtime'

  if (
    id.includes('/node_modules/firebase/')
    || id.includes('/node_modules/@firebase/')
  ) return 'firebase'

  if (
    id.includes('/node_modules/bootstrap/')
    || id.includes('/node_modules/@popperjs/')
  ) return 'bootstrap'

  if (
    id.includes('/node_modules/echarts/')
    || id.includes('/node_modules/zrender/')
  ) return 'echarts'

  if (id.includes('/node_modules/pdfjs-dist/')) return 'pdfjs'

  return undefined
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: process.env.VITE_BASE_URL || '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
