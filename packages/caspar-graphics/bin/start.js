#!/usr/bin/env node
'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const { createServer: createViteServer } = require('vite')
const fs = require('fs-extra')
const chalk = require('chalk')
const {
  choosePort,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils')
const openBrowser = require('react-dev-utils/openBrowser')
const path = require('path')
const paths = require('../config/paths')
const options = require('../config/options')
const { createConfig } = require('../config/vite.config.dev')
const { createPreviewHtml, createTemplateHtml } = require('../utils/html')
const { watchTemplates } = require('../utils/watcher')

async function createServer(availablePort) {
  // Create an empty root folder and have Vite watch it. This is where we'll place
  // the html files later on.
  fs.emptyDirSync(paths.viteDev)
  const server = await createViteServer(createConfig(availablePort))
  server.listen()

  // Watch the user's template folder and create a html file for each template found.
  // Whenever a template is added or removed, also make sure it's reflected in the preview app.
  const watcher = watchTemplates()

  const buildPreview = () => {
    const templates = watcher.getTemplates()

    fs.writeFile(
      path.join(paths.viteDev, 'index.html'),
      createPreviewHtml(
        templates,
        templates.map(template => path.join(paths.appTemplates, template))
      )
    )
  }

  let isReady = false

  watcher
    .on('all', (change, filePath) => {
      if (change !== 'add' && change !== 'unlink') {
        return
      }

      const templateName = path.basename(path.dirname(filePath))
      const htmlPath = path.join(paths.viteDev, templateName + '.html')

      if (change === 'add') {
        fs.writeFileSync(htmlPath, createTemplateHtml(templateName))
      } else {
        fs.unlinkSync(htmlPath)
      }

      if (isReady) {
        buildPreview()
      }
    })
    .on('ready', () => {
      // Open the preview app in the user's browser.
      buildPreview()
      const urls = prepareUrls('http', options.host, availablePort)
      openBrowser(urls.localUrlForBrowser)
      isReady = true
    })

  return server
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.
choosePort(options.host, options.port)
  .then(async port => {
    if (!port) {
      console.error(
        chalk.red(`Couldn't find a free port to use for the dev server.`)
      )
      process.exit(1)
    }

    const server = await createServer(port)

    for (const sig of ['SIGINT', 'SIGTERM']) {
      process.on(sig, async function() {
        await server.close()
        process.exit(1)
      })
    }
  })
  .catch(error => {
    if (error?.message) {
      console.error(error.message)
    }
    process.exit(1)
  })
