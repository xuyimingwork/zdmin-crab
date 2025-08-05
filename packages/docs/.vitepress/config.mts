import { fileURLToPath, URL } from 'node:url'

import { defineConfigWithTheme } from 'vitepress'

export default ({ mode }: { mode: string }) => defineConfigWithTheme({
  srcDir: './src',
  outDir: './dist',
  base: '/',
  title: 'zdmin-crab',
  lang: 'en-US',
  description: 'Description',
  cleanUrls: true,

  vite: {
    resolve: {
      alias: {
        'zdmin-crab': fileURLToPath(new URL('../../zdmin-crab/src/', import.meta.url))
      }
    },

    define: {
      __DEV__: mode !== 'production'
    }
  },

  themeConfig: {
    search: {
      provider: 'local'
    },

    nav: [
      { text: 'Guide', link: '/introduction' }
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          {
            text: 'Introduction',
            link: '/introduction'
          }
        ]
      }
    ]
  }
})
