#!/usr/bin/env node

import fs from 'fs'
import chalk from 'chalk'
import { cac } from 'cac'
import paths from '../../config/paths.js'

const cli = cac()
const pkg = JSON.parse(fs.readFileSync(paths.ownPackageJson))

// Start
cli
  .command('[root]', 'start dev server')
  .option('--host', 'specify which IP addresses the server should listen on.')
  .action(async (root, options) => {
    try {
      const { createServer } = await import('./server.js')
      const server = await createServer({ host: options.host })
      await server.listen()
      console.log(
        chalk.green(`${chalk.bold('Caspar Graphics')} v${pkg.version}`)
      )
      server.printUrls()
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

// Build
cli
  .command('build [root]', 'build for production')
  .option('-i, --include', '[string] build specified templates')
  .option('--manifest', '[boolean] emit build manifest json')
  .action(async (root, options) => {
    const { build } = await import('./build.js')
    const templates = await build({ include: options.include })
    console.log(templates)
    process.exit(0)
  })

cli.help()
cli.version(pkg.version)
cli.parse()
