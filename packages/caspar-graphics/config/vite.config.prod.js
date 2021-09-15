const { defineConfig } = require('vite')
const path = require('path')
const paths = require('./paths')

const createConfig = template => {
  // const input = Object.fromEntries(
  //   templates.map(template => [
  //     template,
  //     path.join(paths.viteBuild, template + '.html')
  //   ])
  // )

  return defineConfig({
    root: path.join(paths.viteBuild, template),
    configFile: false,
    clearScreen: false,
    resolve: {
      dedupe: ['react', 'react-dom'],
      react: require.resolve(path.join(paths.ownNodeModules, 'react')),
      'react-dom': require.resolve(path.join(paths.ownNodeModules, 'react-dom'))
    },
    build: {
      minify: 'terser',
      manifest: true,
      cssCodeSplit: false,
      assetsInlineLimit: 4096 * 1000, // 4MB
      chunkSizeWarningLimit: Infinity,
      outDir: 'out',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: () => 'index'
        }
      }
    }
  })
}

module.exports = { createConfig }
