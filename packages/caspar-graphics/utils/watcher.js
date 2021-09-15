const chokidar = require('chokidar')
const path = require('path')
const paths = require('../config/paths')

function watchTemplates() {
  const watcher = chokidar.watch(paths.appTemplates + '/*/index.jsx', {
    depth: 1,
    ignored: /(^|[\/\\])\../ // ignore dotfiles
  })

  watcher.getTemplates = () => {
    return Object.entries(watcher.getWatched())
      .filter(([, files]) => files.some(filename => filename === 'index.jsx'))
      .map(([dir]) => path.basename(dir))
  }

  return watcher
}

function getTemplates() {
  return new Promise(resolve => {
    const watcher = watchTemplates()

    watcher.on('ready', () => {
      resolve(watcher.getTemplates())
    })
  })
}

module.exports = {
  watchTemplates,
  getTemplates
}
