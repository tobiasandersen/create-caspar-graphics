#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import react from '@vitejs/plugin-react'
import getPort from 'get-port'
import { createServer } from 'vite'
import chalk from 'chalk'
import paths from '../config/paths'

export async function createServer({ host }) {
  const templatesPort = await getPort({ port: 5173 })
  const templatesServer = await createServer({
    root: paths.appTemplates,
    clearScreen: false,
    base: '/templates/',
    server: {
      port: templatesPort,
      fs: {
        strict: false
      },
      hmr: {
        clientPort: templatesPort
      }
    },
    plugins: [react()]
  })
  const previewServer = await createServer({
    root: paths.ownPath,
    clearScreen: false,
    server: {
      open: '/',
      host,
      port: 8080,
      proxy: {
        '^/templates/.+': {
          target: `http://localhost:${templatesPort}`
        }
      }
    }
  })

  const pkg = JSON.parse(fs.readFileSync(paths.appPackageJson))

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

  previewServer.ws.on('cg:preview-ready', (data, client) => {
    client.send('cg:update', {
      projectName: pkg.name,
      templates: getTemplates()
    })

    watcher.on('all', (...args) => {
      client.send('cg:update', { templates: getTemplates() })
    })
  })

  return {
    listen: async () => {
      return Promise.all([templatesServer.listen(), previewServer.listen()])
    },
    printUrls: previewServer.printUrl
  }
}

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
