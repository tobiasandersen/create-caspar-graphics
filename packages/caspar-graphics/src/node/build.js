import { build as buildVite } from 'vite'
import paths from '../../config/paths.js'
import chokidar from 'chokidar'
import { resolve } from 'path'
import legacy from '@vitejs/plugin-legacy'

async function getTemplates() {
  const watcher = chokidar.watch(paths.appTemplates + '/**/index.html', {
    depth: 1
  })
  return new Promise(resolve => {
    watcher.on('ready', () => {
      resolve(Object.keys(watcher.getWatched()))
    })
  })
}

export async function build({ include }) {
  console.log({ include })
  const allTemplates = await getTemplates()
  for (const path of allTemplates) {
  }
  await buildVite({
    root: resolve(paths.appTemplates, 'lowerthird'),
    base: '',
    build: {
      minify: false,
      // target: 'chrome63',
      manifest: false,
      outDir: 'dist',
      // emptyOutDir: true,
      rollupOptions: {
        treeshake: false
      }
    },
    plugins: [
      legacy({
        targets: ['Chrome 60']
      })
    ]
  })
  return []
}
