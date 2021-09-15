#!/usr/bin/env node
'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { build: buildVite } = require('vite')
const { inlineSource } = require('inline-source')
const paths = require('../config/paths')
const options = require('../config/options')
const { createConfig } = require('../config/vite.config.prod')
const { createTemplateHtml } = require('../utils/html')
const { getTemplates } = require('../utils/watcher')
const { gzip } = require('../utils/gzip')

async function build() {
  const allTemplates = await getTemplates()
  const templates = allTemplates.filter(template => {
    if (Array.isArray(options.include)) {
      return options.include.includes(template)
    }

    if (Array.isArray(options.exclude)) {
      return !options.exclude.includes(template)
    }

    return true
  })

  if (templates.length === 0) {
    console.log()

    if (options.include) {
      console.log(chalk.red(`Couldn't find any of the specified templates.`))
      console.log(`\nHere are all the available templates:\n`)
      console.log(' ' + allTemplates.join('\n '))
    } else {
      console.log(
        chalk.red(`Couldn't find any templates to build, aborting...`)
      )
    }

    console.log()
    process.exit(0)
  }

  // Prepare build folders, one for the final output and one for Vite to put temporary files in.
  fs.ensureDirSync(paths.appBuild)
  fs.emptyDirSync(paths.viteBuild)

  console.log(
    `\nBuilding graphics:\n\n${chalk.cyan(' ' + templates.join('\n '))}\n`
  )

  for await (const template of templates) {
    const tmpHtmlIn = path.join(paths.viteBuild, template, 'index.html')
    const tmpHtmlOut = path.join(paths.viteBuild, template, 'out', 'index.html')
    const htmlOut = path.join(paths.appBuild, template + '.html')
    const gzipOut = htmlOut + '.gz'

    // Remove any old dist files.
    fs.removeSync(htmlOut)
    fs.removeSync(gzipOut)

    // Create a temporary html file that Vite will use as its entry when building.
    fs.outputFileSync(tmpHtmlIn, createTemplateHtml(template, true))

    // Have Vite create a production bundle from the user's templates. The bundle
    // will be placed in an "out" folder relative to its input.
    await buildVite(createConfig(template))

    // Take the production build we just produced, inline its assets into a single html file,
    // and place that file into the user's dist folder.
    const htmlContent = await inlineSource(tmpHtmlOut, {
      rootpath: path.dirname(tmpHtmlOut),
      attribute: false
    })
    fs.outputFileSync(htmlOut, htmlContent)

    // If gzip is enabled, zip the html file we just created.
    if (options.gzip) {
      fs.outputFileSync(gzipOut, '')
      await gzip(htmlOut, gzipOut)

      // Remove the html file unless they want to keep both.
      if (options.gzip !== 'both') {
        fs.removeSync(htmlOut)
      }
    }
  }
}

build().then(
  () => {
    console.log(chalk.green('Built successfully.\n'))
    console.log()
    process.exit()
  },
  err => {
    console.log(chalk.red('Failed to compile.\n'))
    console.log((err.message || err) + '\n')
    process.exit(1)
  }
)
