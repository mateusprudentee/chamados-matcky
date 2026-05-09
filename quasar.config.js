import { defineConfig } from '#q-app/wrappers'
export default defineConfig((/* ctx */) => {
  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
      'material-icons',
  'material-symbols-outlined',
      'fontawesome-v6'
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'history',
      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
      port: 9000,
    },

    framework: {
  lang: 'pt-BR',
  dark: false,
  config: {},
  iconSet: 'material-icons',
  plugins: ['Notify', 'Dialog'],
},

    animations: [],

    // SSR desativado - modo SPA
    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false,
    },

    pwa: false,

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'projeto',
      },
    },

    bex: {
      extraScripts: [],
    },
  }
})
