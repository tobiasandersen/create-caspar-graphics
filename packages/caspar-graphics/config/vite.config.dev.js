const { defineConfig } = require('vite')
const path = require('path')
const paths = require('../config/paths')
const { default: monacoEditorPlugin } = require('vite-plugin-monaco-editor')
const options = require('./options')
const reactRefresh = require('@vitejs/plugin-react-refresh')

const createConfig = port =>
  defineConfig({
    root: paths.viteDev,
    configFile: false,
    clearScreen: true,
    server: {
      port,
      host: options.host,
      fs: {
        allow: [paths.ownPath, paths.appPath]
      }
    },
    plugins: [monacoEditorPlugin()],
    // Without this we have problems when running caspar-graphics in a linked context.
    resolve: {
      dedupe: ['react', 'react-dom'],
      react: require.resolve(path.join(paths.ownNodeModules, 'react')),
      'react-dom': require.resolve(path.join(paths.ownNodeModules, 'react-dom'))
      // 'react-refresh/runtime': require.resolve(
      //   path.join(paths.ownNodeModules, 'react-refresh/runtime')
      // )
    }
  })

module.exports = { createConfig }
