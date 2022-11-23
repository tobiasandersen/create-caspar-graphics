import { build as buildVite } from 'vite'
import { resolve } from 'path'
import chokidar from 'chokidar'
import legacy from '@vitejs/plugin-legacy'
import paths from './paths.js'

const watcher = chokidar.watch(paths.appTemplates + '/**/index.html', {
  depth: 1
})

async function getTemplates() {
  return new Promise(resolve => {
    watcher.on('ready', () => {
      resolve(Object.keys(watcher.getWatched()))
    })
  })
}

export async function build({ include }) {
  const allTemplates = await getTemplates()
  for (const path of allTemplates) {
  }
  // TODO: remove non-legacy modules
  // https://github.com/vitejs/vite/pull/10139#issuecomment-1322099215
  await buildVite({
    root: resolve(paths.appTemplates, 'lowerthird'),
    base: '',
    // TODO: only when symlinked?
    resolve: {
      dedupe: ['react', 'react-dom'],
      react: resolve(paths.appNodeModules, 'react'),
      'react-dom': resolve(paths.appNodeModules, 'react-dom')
    },
    build: {
      minify: false,
      manifest: true,
      outDir: 'dist'
    },
    plugins: [
      legacy({
        // Caspar v2.3.2
        // TODO: make this configurable
        targets: ['Chrome 71']
      })
    ]
  })
  return []
}
