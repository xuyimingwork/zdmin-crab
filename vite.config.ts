import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Inspect from 'vite-plugin-inspect'
import { unstableRolldownAdapter } from 'vite-bundle-analyzer'
import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      imports: ['vue']
    }),
    Inspect({
      build: true,
      outputDir: '.vite-inspect'
    }),
    unstableRolldownAdapter(analyzer())
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    minify: false,
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue']
    },
  }
})
