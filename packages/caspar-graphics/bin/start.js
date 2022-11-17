#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const { createServer } = require('vite')
const paths = require('../config/paths')
const react = require('@vitejs/plugin-react')

const pkg = require(path.join(paths.appPath, 'package.json'))

const watcher = chokidar.watch(
  paths.appTemplates + '/**/(index.html|manifest.json)',
  {
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }
)

// TODO: get available port
const templatesPort = 5173

createServer({
  root: paths.appTemplates,
  configFile: false,
  clearScreen: false,
  base: '/templates/',
  server: {
    port: templatesPort,
    fs: {
      allow: [paths.graphicsKit, paths.ownPath, paths.appPath]
    },
    hmr: {
      clientPort: templatesPort
    }
  },
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    react: require.resolve(path.join(paths.appNodeModules, 'react')),
    'react-dom': require.resolve(path.join(paths.appNodeModules, 'react-dom'))
  }
}).then(async templatesServer => {
  await templatesServer.listen()

  const previewServer = await createServer({
    root: paths.ownPath,
    configFile: false,
    clearScreen: false,
    server: {
      open: '/',
      port: 8080,
      fs: {
        allow: [paths.graphicsKit, paths.ownPath, paths.appPath]
      },
      proxy: {
        '^/templates/.+': {
          target: `http://localhost:${templatesPort}`
        }
      }
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      react: require.resolve(path.join(paths.appNodeModules, 'react')),
      'react-dom': require.resolve(path.join(paths.appNodeModules, 'react-dom'))
    }
  })

  await previewServer.listen()

  previewServer.ws.on('cg:preview-ready', (data, client) => {
    client.send('cg:update', {
      projectName: pkg.name,
      templates: getTemplates()
    })

    watcher.on('all', (...args) => {
      client.send('cg:update', { templates: getTemplates() })
    })
  })
})

function getTemplates() {
  return Object.entries(watcher.getWatched()).map(([dirPath, files]) => {
    let manifest

    if (files.includes('manifest.json')) {
      try {
        manifest = JSON.parse(
          fs.readFileSync(path.join(dirPath, 'manifest.json'))
        )

        if (Array.isArray(manifest.previewImages)) {
          manifest.previewImages = manifest.previewImages.map(imagePath => {
            return imagePath.startsWith('.')
              ? '/templates/' +
                  path.relative(
                    paths.appTemplates,
                    path.join(dirPath, imagePath)
                  )
              : imagePath
          })
        }

        if (manifest.schema && manifest.previewData) {
          for (const [key, property] of Object.entries(manifest.schema)) {
            if (!property?.default) {
              continue
            }

            for (const preset of Object.values(manifest.previewData)) {
              preset[key] = property.default
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    return { name: dirPath.split('/').at(-1), manifest }
  })
}
