import chokidar from 'chokidar'
import paths from '../../config/paths.js'

export const watcher = chokidar.watch(
  paths.appTemplates + '/**/(index.html|manifest.json)',
  {
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }
)
