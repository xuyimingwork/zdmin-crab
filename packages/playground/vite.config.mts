import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [
    vue(),
    vueDevTools()
  ],

  resolve: {
    alias: {
      'zdmin-crab': fileURLToPath(new URL('../zdmin-crab/src/', import.meta.url))
    }
  },

  define: {
    __DEV__: mode !== 'production'
  }
}))
